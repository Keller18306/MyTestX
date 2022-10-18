import { ReadBuffer, WriteBuffer } from "../../utils/buffer";
import { TaskType } from "../types";
import { AbstractTask } from "./Abstract";

export class TaskImagePart extends AbstractTask {
    public readonly type: TaskType = TaskType.ImagePart;

    public figures: [number, number][][] = [];

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
            this.figures.push(bounds)
        }

        return this;
    }

    public override save(buffer: WriteBuffer): void {
        super.save(buffer);

        buffer.writeUInt32LE(this.figures.length);
        for (const figure of this.figures) {
            buffer.writeUInt32LE(figure.length); //bounds

            for (const bounds of figure) {
                buffer.writeUInt32LE(bounds[0]);
                buffer.writeUInt32LE(bounds[1]);
            }
        }
    }
}