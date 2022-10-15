export class ReadBuffer {
    
    public buffer: Buffer;

    private offset: number = 0;

    constructor(buffer: Buffer) {
        this.buffer = buffer
    }

    readIntBE(_offset: number | undefined, byteLength: number): number {
        const offset = _offset === undefined ? this.offset : _offset
        const value = this.buffer.readIntBE(offset, byteLength)

        if(_offset === undefined) this.offset += byteLength

        return value
    }

    readIntLE(_offset: number | undefined, byteLength: number): number {
        const offset = _offset === undefined ? this.offset : _offset
        const value = this.buffer.readIntLE(offset, byteLength)

        if(_offset === undefined)this.offset += byteLength

        return value
    }

    readUIntBE(_offset: number | undefined, byteLength: number): number {
        const offset = _offset === undefined ? this.offset : _offset
        const value = this.buffer.readUIntBE(offset, byteLength)

        if(_offset === undefined)this.offset += byteLength

        return value
    }

    readUIntLE(_offset: number | undefined, byteLength: number): number {
        const offset = _offset === undefined ? this.offset : _offset
        const value = this.buffer.readUIntLE(offset, byteLength)

        if(_offset === undefined)this.offset += byteLength

        return value
    }

    readInt8(offset?: number): number {
        return this.readIntBE(offset, 1)
    }

    readUInt8(offset?: number): number {
        return this.readUIntBE(offset, 1)
    }

    readInt16BE(offset? : number): number {
        return this.readIntBE(offset, 2)
    }

    readInt16LE(offset? : number): number {
        return this.readIntLE(offset, 2)
    }

    readUInt16BE(offset? : number): number {
        return this.readUIntBE(offset, 2)
    }

    readUInt16LE(offset? : number): number {
        return this.readUIntLE(offset, 2)
    }

    readInt24BE(offset? : number): number {
        return this.readIntBE(offset, 3)
    }

    readInt24LE(offset? : number): number {
        return this.readIntLE(offset, 3)
    }

    readUInt24BE(offset? : number): number {
        return this.readUIntBE(offset, 3)
    }

    readUInt24LE(offset? : number): number {
        return this.readUIntLE(offset, 3)
    }

    readInt32BE(offset? : number): number {
        return this.readIntBE(offset, 4)
    }

    readInt32LE(offset? : number): number {
        return this.readIntLE(offset, 4)
    }

    readUInt32BE(offset? : number): number {
        return this.readUIntBE(offset, 4)
    }

    readUInt32LE(offset? : number): number {
        return this.readUIntLE(offset, 4)
    }

    readBigInt64BE(_offset?: number): bigint {
        const offset = _offset === undefined ? this.offset : _offset
        const value = this.buffer.readBigInt64BE(offset)

        if(_offset === undefined) this.offset += 8

        return value
    }

    readBigInt64LE(_offset?: number): bigint {
        const offset = _offset === undefined ? this.offset : _offset
        const value = this.buffer.readBigInt64LE(offset)

        if(_offset === undefined) this.offset += 8

        return value
    }

    readBigUInt64BE(_offset?: number): bigint {
        const offset = _offset === undefined ? this.offset : _offset
        const value = this.buffer.readBigUInt64BE(offset)

        if(_offset === undefined) this.offset += 8

        return value
    }

    readBigUInt64LE(_offset?: number): bigint {
        const offset = _offset === undefined ? this.offset : _offset
        const value = this.buffer.readBigUInt64LE(offset)

        if(_offset === undefined) this.offset += 8

        return value
    }

    readBuffer(length: number, _offset?: number): Buffer {
        const offset = _offset === undefined ? this.offset : _offset
        const buffer = this.buffer.slice(offset, offset + length)

        if(_offset === undefined) this.offset += length

        return buffer
    }

    readPadding(_offset?: number): Buffer {
        const offset = _offset === undefined ? this.offset : _offset
        const length = this.buffer.length - offset

        const buffer = this.buffer.slice(offset, offset + length)

        if (_offset === undefined) this.offset += length
        
        return buffer
    }

    readString(length: number, encoding?: BufferEncoding, offset?: number): string {
        if (encoding === 'utf16le') {
            length *= 2;
        }

        return this.readBuffer(length, offset).toString(encoding)
    }

    readDelphiString(): string {
        const length = this.readUInt32LE();
        return this.readString(length, 'utf16le');
    }

    readBool(): boolean {
        return Boolean(this.readUInt8());
    }

    skip(length: number): void {
        this.offset += length
    }
}

export class WriteBuffer {
    
    private buffers: Buffer[] = [];

    writeBuffer(buffer: Buffer): void {
        this.buffers.push(buffer)
    }

    writeString(value: string, encoding?: BufferEncoding): void {
        this.writeBuffer(Buffer.from(value, encoding))
    }

    writeDelphiString(value: string) {
        this.writeUInt32LE(value.length)
        this.writeBuffer(Buffer.from(value, 'utf16le'))
    }

    writeBool(value: boolean): void {
        this.writeUInt8(Number(value));
    }

    writeIntBE(value: number, byteLength: number): void {
        const buffer = Buffer.alloc(byteLength)

        buffer.writeIntBE(value, 0, byteLength)

        this.writeBuffer(buffer)
    }

    writeIntLE(value: number, byteLength: number): void {
        const buffer = Buffer.alloc(byteLength)

        buffer.writeIntLE(value, 0, byteLength)

        this.writeBuffer(buffer)
    }

    writeUIntBE(value: number, byteLength: number): void {
        const buffer = Buffer.alloc(byteLength)

        buffer.writeUIntBE(value, 0, byteLength)

        this.writeBuffer(buffer)
    }

    writeUIntLE(value: number, byteLength: number): void {
        const buffer = Buffer.alloc(byteLength)

        buffer.writeUIntLE(value, 0, byteLength)

        this.writeBuffer(buffer)
    }

    writeInt8(value: number): void {
        this.writeIntBE(value, 1)
    }

    writeUInt8(value: number): void {
        this.writeUIntBE(value, 1)
    }

    writeInt16BE(value: number): void {
        this.writeIntBE(value, 2)
    }

    writeInt16LE(value: number): void {
        this.writeIntLE(value, 2)
    }

    writeUInt16BE(value: number): void {
        this.writeUIntBE(value, 2)
    }

    writeUInt16LE(value: number): void {
        this.writeUIntLE(value, 2)
    }

    writeInt24BE(value: number): void {
        this.writeIntBE(value, 3)
    }

    writeInt24LE(value: number): void {
        this.writeIntLE(value, 3)
    }

    writeUInt24BE(value: number): void {
        this.writeUIntBE(value, 3)
    }

    writeUInt24LE(value: number): void {
        this.writeUIntLE(value, 3)
    }

    writeInt32BE(value: number): void {
        this.writeIntBE(value, 4)
    }

    writeInt32LE(value: number): void {
        this.writeIntLE(value, 4)
    }

    writeUInt32BE(value: number): void {
        this.writeUIntBE(value, 4)
    }

    writeUInt32LE(value: number): void {
        this.writeUIntLE(value, 4)
    }

    writeBigInt64BE(value: bigint): void {
        const buffer = Buffer.alloc(8)

        buffer.writeBigInt64BE(value)

        this.writeBuffer(buffer)
    }

    writeBigInt64LE(value: bigint): void {
        const buffer = Buffer.alloc(8)

        buffer.writeBigInt64LE(value)

        this.writeBuffer(buffer)
    }

    writeBigUInt64BE(value: bigint): void {
        const buffer = Buffer.alloc(8)

        buffer.writeBigUInt64BE(value)

        this.writeBuffer(buffer)
    }

    writeBigUInt64LE(value: bigint): void {
        const buffer = Buffer.alloc(8)

        buffer.writeBigUInt64LE(value)

        this.writeBuffer(buffer)
    }

    writeZeroBytes(length: number): void {
        this.writeBuffer(Buffer.alloc(length))
    }

    toBuffer(): Buffer {
        return Buffer.concat(this.buffers)
    }
}