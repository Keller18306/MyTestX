import { writeFileSync } from "fs";
import MTF, {
    TaskInputNumber, TaskInputText, TaskMatching, TaskMultiChoise, TaskOrderChoise, TaskSingleChoise
} from "./mtf";
import { TaskType } from "./mtf/types";
import { RTFParser } from "./rtf/parser";

//конвертировать MTF в TXT (не всё конвертирует)

const mtf = MTF.loadFromFile('./a.mtf');

const lines: string[] = [];

for (const i in mtf.tasks) {
    const line: string[] = [];

    const task = mtf.tasks[i]

    const q = new RTFParser(task.formulations[0]).parseText();
    line.push(
        String(+i + 1) + '. ' + q.trim()
    )
    if (task.media) {
        line.push('(аудио)')
    }
    if (task.photo) {
        line.push('(фотография)')
    }

    if ((task instanceof TaskSingleChoise || task instanceof TaskMultiChoise) && [TaskType.SingleChoice, TaskType.MultiChoice].includes(task.type)) {
        let typeName: string;
        if (task instanceof TaskMultiChoise) {
            typeName = 'выбрать все правильные';
        } else {
            typeName = 'выбрать один правильный';
        }

        const answer = task.answers.map((answer, i) => {
            return '> ' + String(i + 1) + '. ' + new RTFParser(answer).parseText().trim();
        }).filter((answer, i) => {
            return Boolean(task.correctAnswers[i])
        }).join('\n')

        line.push(`Ответы (${typeName}):`)
        line.push(answer)
    } else if (task instanceof TaskInputText && TaskType.InputText === task.type) {
        line.push('Ответы (любая строка):')

        for (const answer of task.stringAnswers) {
            line.push('> ' + answer)
        }
    } else if (task instanceof TaskInputNumber && TaskType.InputNumber === task.type) {
        line.push('Ответы (любое число):')

        for (const answer of task.numberAnswers) {
            line.push('> ' + (answer.label ? answer.label + ': ' : '') + (answer.range[0] === answer.range[1] ? answer.range[0] : `${answer.range[0]} - ${answer.range[1]}`))
        }
    } else if (task instanceof TaskMatching && task.type === TaskType.Matching) {
        line.push('Ответы (соеднить):');

        for (let i = 0; i < Math.max(task.answers.length, task.correctAnswers.length); i++) {
            const answerIndex = task.correctAnswers[i];
            if (answerIndex === 0) continue;

            const answer1 = new RTFParser(task.answers[i]).parseText().trim();
            const answer2 = new RTFParser(task.matchingAnswers[answerIndex - 1]).parseText().trim();

            line.push(`${i + 1}. ${answer1} - ${answerIndex}. ${answer2}`);
        }
    } else if (task instanceof TaskOrderChoise && task.type === TaskType.OrderChoice) {
        line.push('Ответы (указать правильный порядок):');

        for (let i = 0; i < Math.max(task.answers.length, task.correctAnswers.length); i++) {
            const answerIndex = task.correctAnswers[i];
            if (answerIndex === 0) continue;

            const text = new RTFParser(task.answers[i]).parseText().trim();

            line.push(`${answerIndex}. ${text}`);
        }
    } else {
        console.log('unknown type', task.type, task);
    }

    lines.push(line.join('\n'));
}

writeFileSync('a.txt', lines.join('\n\n------------------------------------\n\n'))
