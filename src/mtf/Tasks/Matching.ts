import { ReadBuffer } from "../../utils/buffer";
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
}