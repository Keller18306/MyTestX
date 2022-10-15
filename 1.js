const parseRTF = require('rtf-parser')
const { readFileSync } = require('fs')

const file = readFileSync('a.rtf', 'utf8');
const rtf = parseRTF(file);

for (const symbol of file) {
    console.log(rtf.parserState)
    rtf.parserState(symbol)
}

console.log(rtf.text.split(''))