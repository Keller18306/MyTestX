import { readFileSync, writeFileSync } from "fs";
import MTF from "./mtf/";
import { RTFParser } from "./rtf/parser";
import { textToRtf } from "./rtf";

const mtf = MTF.loadFromFile('./Tests/New.mtf');

//mtf.tasks[0].formulations[0] = readFileSync('a.rtf', 'utf8');
//writeFileSync('a.rtf', mtf.tasks[0].formulations[0])

mtf.tasks[0].prompt = textToRtf('Test Тест')

mtf.saveToFile('./Tests/New1.mtf', false);

// const rtf = readFileSync('a.rtf', 'utf8');
// const parser = new RTFParser(rtf)
// const parsed = parser.parseText()

// console.log(parsed)