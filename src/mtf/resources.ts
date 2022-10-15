import { ReadBuffer } from "../utils/buffer";
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
                size,
                content
            })
        }

        return this;
    }

    public save() {

    }
}