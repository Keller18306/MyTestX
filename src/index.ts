import { writeFileSync } from "fs";
import MTF from "./mtf/";

const mtf = MTF.loadFromFile('./Tests/New.mtf')
mtf.saveToBuffer()

console.log(mtf.tasks)

const rtf = mtf.tasks[0].formulations[0];
//writeFileSync('a.rtf', rtf)
