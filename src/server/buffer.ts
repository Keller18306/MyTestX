import { Socket } from "net";

export class ProxiedBuffer {
    public buffer: Buffer = Buffer.alloc(0);
    public lastBuffer: Buffer | undefined;

    constructor(public write: (data: Buffer) => void) { }

    public reset() {
        this.lastBuffer = undefined;

        const buffer = this.buffer;
        this.buffer = Buffer.alloc(0);
        return buffer;
    }

    public append(data: Buffer) {
        this.lastBuffer = data;
        this.buffer = Buffer.concat([this.buffer, data]);
    }

    public release() {
        const buffer = this.reset();

        this.write(buffer);
    }

    public toString() {
        return this.buffer.toString();
    }

    public startsWith(value: Buffer | string): boolean {
        if (typeof value === 'string') {
            value = Buffer.from(value);
        }

        if (this.buffer.length < value.length) {
            return false;
        }

        return Buffer.compare(this.buffer.subarray(0, value.length), value) === 0;
    }
}