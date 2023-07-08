const {Client} = require('../../');

(async () => {
    let context = Client();
    context.extend.example();
    await context.send();

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