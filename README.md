# RPC Bot API (Client)

____________________

![Logo](https://github.com/realgam3/rpc-bot-server/blob/main/ext/ctf-bot-logo.png?raw=true)

The RPC (Remote Procedure Call) Bot Server is a queue-based system designed for managing and executing procedures across
multiple remote machines. This server serves as the primary controller, queuing and delegating procedures to be run on
various machines, facilitating a streamlined and efficient approach to distributed procedure execution.

Its queue-based architecture maintains a FIFO (First In, First Out) execution order, providing an organized way to
control remote procedures. With the RPC Bot Server, you can efficiently monitor and orchestrate procedure execution
across your networked environment.

## Key Features:

* Distributed Procedure Execution: Handle and perform tasks across numerous remote machines from a centralized location.
* Queue-Based System: Procedure requests are managed in a FIFO manner, ensuring systematic and orderly execution.
* Scalability: Easily accommodate additional machines within your network to widen procedure distribution.
* Efficiency and Reliability: Eliminates the necessity for manual intervention, reducing time and potential for errors.
* Use this bot for Heavy Duty CTF Challenges: This bot was designed to handle the heavy lifting of CTF challenges. It
  can be used to orchestrate the execution of procedures across multiple machines, allowing you to focus on the
  challenge itself.
* This bot is extendable: The RPC Bot Server is designed to be extendable. You can easily add your own procedures to
  the system, allowing you to customize the bot to your needs. simple example in "tests/playwright" folder.

This project is a vital component of the RPC Bot system. For the client-side component that resides on the remote
machines, please refer to the RPC Bot Client repository.

## Usage:

```JavaScript
const {Client} = require("rpc-bot-client");

(async () => {
    // Don't wait for result
    let context = Client();
    context.extend.example();
    await context.send();

    // Send webhook on result
    context = Client();
    context.extend.example();
    await context.send({"webhook": "https://realgam3.com/webhook"});

    // Wait for result
    context = Client();
    context.page.goto("https://www.google.com");
    context.page.waitForTimeout(3000);
    context.extend.closePages();
    context.page.goto("https://www.google.com");
    context.page.waitForTimeout(3000);
    context.page.goto("https://www.google.com");
    context.page.waitForTimeout(3000);
    let result = await context.call();
    console.log(result);
})();

```