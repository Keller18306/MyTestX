import { ReadBuffer } from "../../utils/buffer";
import { NumberAnswer, TaskType } from "../types";
import { AbstractTask } from "./Abstract";

export class TaskInputNumber extends AbstractTask {
    public readonly type: TaskType = TaskType.InputNumber;

    public numberAnswers: NumberAnswer[] = [];
    public checkNumberOrder: boolean = true;

    public override load(buffer: ReadBuffer): this {
        super.load(buffer);
        
        const countNum = buffer.readUInt8();
        for (let i = 0; i < countNum; i++) {
            const from = buffer.readBigInt64BE();
            const to = buffer.readBigInt64BE();
            const label = buffer.readDelphiString();

            this.numberAnswers.push({
                label,
                range: [from, to]
            })
        }

        this.checkNumberOrder = buffer.readBool()

        return this;
    }
}