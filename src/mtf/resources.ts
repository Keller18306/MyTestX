import { ReadBuffer, WriteBuffer } from "../utils/buffer";
import { Resource } from "./types";

export class MTFResources extends Map<string, Resource> {
    public load(buffer: ReadBuffer) {
        this.clear();

        const filesCount = buffer.readUInt32LE();
        for (let i = 0; i < filesCount; i++) {
            const fileName = buffer.readDelphiString();
            const size = buffer.readUInt32LE();
            const content = buffer.readBuffer(size);

            this.set(fileName, {
                fileName,
                content
            })
        }

        return this;
    }

    public save(buffer: WriteBuffer) {
        buffer.writeUInt32LE(this.size);
        for (const entry of this) {
            const file = entry[1];

            buffer.writeDelphiString(file.fileName);
            buffer.writeUInt32LE(file.content.length);
            buffer.writeBuffer(file.content);
        }
    }
}