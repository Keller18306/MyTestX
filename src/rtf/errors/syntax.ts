export class SyntaxError extends Error {
    public readonly name: string = 'SyntaxError';
    public readonly line: number;
    public readonly symbol: number;
    
    constructor(message: string, line: number, symbol: number) {
        super()

        this.line = line;
        this.symbol = symbol;

        this.message = `${message}. At ${line}:${symbol}`
    }
}