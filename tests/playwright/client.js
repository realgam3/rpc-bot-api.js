const {Client} = require('../../');

const context = Client();
context.page.goto("https://www.google.com");
context.page.waitForTimeout(3000);
context.extend.closePages();
context.page.goto("https://www.google.com");
context.page.waitForTimeout(3000);
context.page.goto("https://www.google.com");
context.page.waitForTimeout(3000);
context.send();