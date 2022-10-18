import { ReadBuffer, WriteBuffer } from "../../utils/buffer";
import { TaskType } from "../types";
import { AbstractTask } from "./Abstract";

export class TaskLetterPermutation extends AbstractTask {
    public readonly type: TaskType = TaskType.LetterPermutation;

    public permutationWord: string = '';

    public override load(buffer: ReadBuffer): this {
        super.load(buffer);
        
        this.permutationWord = buffer.readDelphiString();

        return this;
    }

    public override save(buffer: WriteBuffer): void {
        super.save(buffer);

        buffer.writeDelphiString(this.permutationWord);
    }
}