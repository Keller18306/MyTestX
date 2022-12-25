import { ReadBuffer, WriteBuffer } from "../../utils/buffer";
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
            const from = buffer.readDoubleLE();
            const to = buffer.readDoubleLE();
            const label = buffer.readDelphiString();

            this.numberAnswers.push({
                label,
                range: [from, to]
            })
        }

        this.checkNumberOrder = buffer.readBool()

        return this;
    }

    public override save(buffer: WriteBuffer): void {
        super.save(buffer);

        buffer.writeUInt8(this.numberAnswers.length);
        for (const num of this.numberAnswers) {
            buffer.writeDoubleLE(num.range[0]);
            buffer.writeDoubleLE(num.range[1]);
            buffer.writeDelphiString(num.label);
        }

        buffer.writeBool(this.checkNumberOrder)
    }
}