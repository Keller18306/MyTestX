import { writeFileSync } from "fs";
import { ReadBuffer } from "../utils/buffer";
import { AbstractTask, TaskImagePart, TaskInputNumber, TaskInputText, TaskLetterPermutation, TaskMatching, TaskMCQ, TaskMultiChoise, TaskOrderChoise, TaskSingleChoise } from "./Tasks/";
import { Task, TaskType } from "./types";

export class MTFTasks extends Array<Task> {
    public load(buffer: ReadBuffer) {
        this.length = 0;

        const tasks = buffer.readUInt32LE();
        for (let i = 0; i < tasks; i++) {
            const type = buffer.readUInt8();
            
            let task: Task;
            switch (type) {
                case TaskType.SingleChoice:
                    task = new TaskSingleChoise().load(buffer);
                    break;
                case TaskType.MultiChoice:
                    task = new TaskMultiChoise().load(buffer);
                    break;
                case TaskType.OrderChoice:
                    task = new TaskOrderChoise().load(buffer);
                    break;
                case TaskType.Matching:
                    task = new TaskMatching().load(buffer);
                case TaskType.MCQ:
                    task = new TaskMCQ().load(buffer);
                case TaskType.InputNumber:
                    task = new TaskInputNumber().load(buffer);
                case TaskType.InputText:
                    task = new TaskInputText().load(buffer);
                case TaskType.ImagePart:
                    task = new TaskImagePart().load(buffer);
                case TaskType.LetterPermutation:
                    task = new TaskLetterPermutation().load(buffer);
                default:
                    throw new Error('Unknown task type')
            }
            
            this.push(task)
        }

        return this;
    }

    public save() {

    }
}