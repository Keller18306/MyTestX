export function decrypt(buffer: Buffer): Buffer {
    const byteArray: number[] = [];
    let lastKey = 0x101;
    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];

        const decodedByte = (lastKey ^ byte) & 0xFF;
        byteArray.push(decodedByte);

        const a = (decodedByte + lastKey) & 0xFF;
        const b = (a * 0xCE1C6CA9) & 0xFF;
        const c = (b + 0x2BC6CE1C) & 0xFF;
        lastKey = c;
    }

    return Buffer.from(byteArray);
}

export function encrypt(buffer: Buffer): Buffer {
    const byteArray: number[] = [];
    let lastKey = 0x1;
    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];

        const encodedByte = (lastKey ^ byte) & 0xFF;
        byteArray.push(encodedByte);

        const a = (byte + lastKey) & 0xFF;
        const b = (a * 0xCE1C6CA9) & 0xFF;
        const c = (b + 0x2BC6CE1C) & 0xFF;
        lastKey = c;
    }

    return Buffer.from(byteArray);
}