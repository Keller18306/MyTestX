import { writeFileSync } from "fs";
import { convertTasks } from "./converter/convertTasks";
import MTF from "./mtf";

//конвертировать MTF в TXT (не всё конвертирует)

const mtf = MTF.loadFromFile('./a.mtf');

writeFileSync('a.txt', convertTasks(mtf.tasks));
