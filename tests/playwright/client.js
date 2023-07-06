const {Client} = require('../../');

(async () => {
    const context = Client();
    context.extend.example();
    context.page.goto("https://www.google.com");
    context.page.waitForTimeout(3000);
    context.extend.closePages();
    context.page.goto("https://www.google.com");
    context.page.waitForTimeout(3000);
    context.page.goto("https://www.google.com");
    context.page.waitForTimeout(3000);

    let result = await context.call();
    console.log(result);

    context.extend.example();
    await context.send();
})();