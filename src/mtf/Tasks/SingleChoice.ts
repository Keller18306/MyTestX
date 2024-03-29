import { ReadBuffer, WriteBuffer } from "../../utils/buffer";
import { TaskType } from "../types";
import { AbstractTask } from "./Abstract";

export class TaskSingleChoise extends AbstractTask {
    public readonly type: TaskType = TaskType.SingleChoice;
    
    public answers: string[] = new Array(5).fill('');
    public correctAnswers: number[] = new Array(5).fill(0);

    public override load(buffer: ReadBuffer) {
        super.load(buffer);

        const qCount = buffer.readUInt32LE();
        this.answers = []
        for (let i = 0; i < qCount; i++) {
            const text = buffer.readDelphiString();
            this.answers.push(text);
        }

        const aCount = buffer.readUInt32LE();
        this.correctAnswers = []
        for (let i = 0; i < aCount; i++) {
            const answer = buffer.readUInt32LE();
            this.correctAnswers.push(answer);
        }

        return this;
    }

    public override save(buffer: WriteBuffer): void {
        super.save(buffer);

        buffer.writeUInt32LE(this.answers.length);
        for (const answer of this.answers) {
            buffer.writeDelphiString(answer);
        }

        buffer.writeUInt32LE(this.correctAnswers.length);
        for (const answer of this.correctAnswers) {
            buffer.writeUInt32LE(answer);
        }
    }
}