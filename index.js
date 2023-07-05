const amqplib = require("amqplib");
const {getEnv, getKey} = require("./utils");

class ClientClass {
    constructor(options = {}) {
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

    async send() {
        const connection = await amqplib.connect({
            protocol: "amqp",
            ...this.queue,
        });

        const channel = await connection.createChannel();
        await channel.assertQueue(this.queue.name, {
            durable: false
        });

        channel.sendToQueue(this.queue.name, Buffer.from(JSON.stringify({
            "webhook": this.webhook,
            "actions": this.actions.map((action) => action.toJSON()),
        })));
        await channel.close();
        await connection.close();
        this.actions = [];
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

