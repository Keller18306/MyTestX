import { ReadBuffer, WriteBuffer } from "../utils/buffer";
import { TaskImagePart, TaskInputNumber, TaskInputText, TaskLetterPermutation, TaskMatching, TaskMCQ, TaskMultiChoise, TaskOrderChoise, TaskSingleChoise } from "./Tasks/";
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

            //BYTES 4 + 1 возможно не используются
            buffer.skip(5);

            this.push(task)
        }

        return this;
    }

    public save(buffer: WriteBuffer) {
        buffer.writeUInt32LE(this.length);

        for (const task of this) {
            buffer.writeUInt8(task.type);
            task.save(buffer);
        }

        //BYTES 4 + 1 возможно не используются
        buffer.writeZeroBytes(5);
    }
}