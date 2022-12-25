import { link, readFileSync, writeFileSync } from "fs";
import MTF, { TaskInputNumber, TaskInputText, TaskMatching, TaskMultiChoise, TaskSingleChoise } from "./mtf";
import { RTFParser } from "./rtf/parser";
import { textToRtf } from "./rtf";
import { TaskOrder, TaskType } from "./mtf/types";

//конвертировать MTF в TXT (не всё конвертирует)

const mtf = MTF.loadFromFile('./Tests/New.mtf');

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
        const answer = task.answers.map((answer, i) => {
            return '> ' + String(i + 1) + '. ' + new RTFParser(answer).parseText().trim();
        }).filter((answer, i) => {
            return Boolean(task.correctAnswers[i])
        }).join('\n')

        line.push('Ответы (выбрать всё):')
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
        line.push('Ответы (соеднить):')

        for (let i = 0; i < Math.max(task.answers.length, task.correctAnswers.length); i++) {
            const answerIndex = task.correctAnswers[i]
            if (answerIndex === 0) continue;

            const answer1 = new RTFParser(task.answers[answerIndex - 1]).parseText().trim()
            const answer2 = new RTFParser(task.matchingAnswers[i]).parseText().trim()

            line.push(`${answerIndex}. ${answer1} - ${i + 1}. ${answer2}`)
        }
    } else {
        console.log(task.type)
    }

    lines.push(line.join('\n'))
}

writeFileSync('a.txt', lines.join('\n\n------------------------------------\n\n'))
