const pug = require("pug");
const compiledFunction = pug.compileFile("./templates/layout.pug");

console.log(compiledFunction());
