import { ReadBuffer } from "../../utils/buffer";
import { NumberAnswer, TaskType } from "../types";
import { AbstractTask } from "./Abstract";

export class TaskImagePart extends AbstractTask {
    public readonly type: TaskType = TaskType.ImagePart;

    public bounds: [number, number][][] = [];

    public override load(buffer: ReadBuffer): this {
        super.load(buffer);
        
        const figuresCount = buffer.readUInt32LE();
        for (let i = 0; i < figuresCount; i++) {
            const dots = buffer.readUInt32LE();
            const bounds: [number, number][] = [];
            for (let i = 0; i < dots; i++) {
                const x = buffer.readUInt32LE();
                const y = buffer.readUInt32LE();

                bounds.push([x, y])
            }
            this.bounds.push(bounds)
        }

        return this;
    }
}