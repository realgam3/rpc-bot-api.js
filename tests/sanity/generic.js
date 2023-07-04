const {Client} = require("..")

// Usage:
const context = Client();

const action3 = context.browser.page.goto("https://google.com");
console.log(action3.toJSON());  // {"action": "browser.page.goto", "args": ["https://google.com"]}

const action2 = context.page.goto("https://google.com");
console.log(action2.toJSON());  // {"action": "page.goto", "args": ["https://google.com"]}

const action = context.goto("https://google.com");
console.log(action.toJSON());  // {"action": "goto", "args": ["https://google.com"]}

console.log(context.actions.map((action) => action.toJSON()));