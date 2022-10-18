import { ReadBuffer, WriteBuffer } from "../../utils/buffer";
import { TaskType } from "../types";
import { TaskSingleChoise } from "./SingleChoice";

export class TaskMatching extends TaskSingleChoise {
    public readonly type: TaskType = TaskType.Matching;

    public matchingAnswers: string[] = [];

    public override load(buffer: ReadBuffer) {
        super.load(buffer);

        const mCount = buffer.readUInt32LE();
        this.matchingAnswers = []
        for (let i = 0; i < mCount; i++) {
            const text = buffer.readDelphiString();
            this.matchingAnswers.push(text)
        }

        return this;
    }

    public override save(buffer: WriteBuffer): void {
        super.save(buffer);

        buffer.writeUInt32LE(this.matchingAnswers.length);
        for (const answer of this.matchingAnswers) {
            buffer.writeDelphiString(answer);
        }
    }
}