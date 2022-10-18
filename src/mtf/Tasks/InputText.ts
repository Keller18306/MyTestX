import { ReadBuffer, WriteBuffer } from "../../utils/buffer";
import { TaskType } from "../types";
import { AbstractTask } from "./Abstract";

export class TaskInputText extends AbstractTask {
    public readonly type: TaskType = TaskType.InputText;

    public stringAnswers: string[] = [];
    public checkStringRegister: boolean = false;
    public checkAsRegExp: boolean = false;

    public override load(buffer: ReadBuffer): this {
        super.load(buffer);

        const text = buffer.readDelphiString();
        this.stringAnswers = text.split('\r\n');

        this.checkStringRegister = buffer.readBool();
        this.checkAsRegExp = buffer.readBool();

        return this;
    }

    public override save(buffer: WriteBuffer): void {
        super.save(buffer);

        buffer.writeDelphiString(this.stringAnswers.join('\r\n'));
        buffer.writeBool(this.checkStringRegister);
        buffer.writeBool(this.checkAsRegExp);
    }
}