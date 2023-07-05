const {Client} = require('../../');

const context = Client({webhook: "https://8luanlf7w64npy4069w98zda51bszin7.oastify.com"});
context.extend.example();
context.page.goto("https://www.google.com");
context.page.waitForTimeout(3000);
context.extend.closePages();
context.page.goto("https://www.google.com");
context.page.waitForTimeout(3000);
context.page.goto("https://www.google.com");
context.page.waitForTimeout(3000);
context.send();