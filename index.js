const amqplib = require("amqplib");
const {v4: uuid4} = require("uuid");

const {getEnv, getKey} = require("./utils");

class ClientClass {
    constructor(options = {}) {
        this.timeout = getKey(options, "timeout", 0);
        this.webhook = getKey(options, "webhook");
        this.actions = getKey(options, "actions", []);
        this.queue = {
            "port": parseInt(getEnv("RABBITMQ_PORT", 5672)),
            "host": getEnv("RABBITMQ_HOST", "queue"),
            "name": getEnv("QUEUE_NAME", "queue"),
            "username": getEnv("RABBITMQ_USERNAME", "guest"),
            "password": getEnv("RABBITMQ_PASSWORD", "guest"),
            ...getKey(options, "queue", {}),
        };
    }

    addAction(action) {
        this.actions.push(action);
    }

    async send(webhook = this.webhook) {
        return await this.call(webhook, false);
    }

    async call(webhook = this.webhook, respond = true) {
        // Create the message
        const message = {
            "webhook": this.webhook,
            "actions": this.actions.map((action) => action.toJSON()),
        };

        // Clean up
        this.actions = [];

        const connection = await amqplib.connect({
            protocol: "amqp",
            ...this.queue,
        });

        const channel = await connection.createChannel();
        await channel.assertQueue(this.queue.name, {
            durable: false
        });

        if (!respond) {
            return await channel.sendToQueue(this.queue.name, Buffer.from(JSON.stringify(message)));
        }

        return await new Promise(async (resolve, reject) => {
            let timeout = null;
            // Generate a unique correlation ID for this request
            const correlationId = uuid4();

            // Create a unique queue for replies
            const replyTo = await channel.assertQueue('', {exclusive: true});

            // This is the callback that will handle replies from the server
            await channel.consume(replyTo.queue, (msg) => {
                // Ignore messages that don't have the right correlation ID
                if (msg.properties.correlationId !== correlationId) {
                    return;
                }

                // Cancel the timeout
                if (timeout) {
                    clearTimeout(timeout);
                }

                // Close the channel and connection when done
                channel.close();
                connection.close();

                // Resolve the promise with the parsed response
                resolve(JSON.parse(msg.content.toString()));
            });

            // Send the request
            await channel.sendToQueue(this.queue.name, Buffer.from(JSON.stringify(message)), {
                "correlationId": correlationId,
                "replyTo": replyTo.queue,
            });

            // Set timeout for response
            if (this.timeout > 0) {
                timeout = setTimeout(() => {
                    channel.close();
                    connection.close();
                    reject(new Error("Timeout"));
                }, this.timeout);
            }
        });
    }
}

class ActionClass extends Function {
    constructor(action, args = [], client) {
        super();
        this.action = action;
        this.args = args;
        this.client = client;
    }

    toJSON() {
        return {
            "action": this.action,
            "args": this.args,
        };
    }
}

function Action(action, args = [], client) {
    const self = new ActionClass(action, args, client);
    return new Proxy(self, {
        get(target, prop) {
            if (prop in target) {
                return target[prop];
            }

            return Action(`${target.action}.${prop}`, [], target.client);
        },
        apply(target, thisArg, args) {
            self.args = args;
            client.addAction(self);
            return self;
        }
    });
}

function Client(options = {}) {
    const self = new ClientClass(options);
    return new Proxy(self, {
        get(target, prop) {
            if (prop in target) {
                return target[prop];
            }
            return Action(prop, [], target);
        },
    });
}

module.exports = {
    Client,
}

