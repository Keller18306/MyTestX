import { FontCharset, RTFFonts, win1251toUTF8 } from "./charsets";
import { ControlWordDefault } from "./control/default";
import { ControlWordGroup } from "./control/group";
import { ControlWordHex } from "./control/hex";
import { RTFDocument } from "./document";
import { SyntaxError } from "./errors/syntax";

export class RTFParser {
    private content: string;

    private currentLine: number = 0;
    private currentSymbol: number = 0;

    private document?: RTFDocument;

    private currentGroup?: ControlWordGroup;
    private currentControlWord?: ControlWordDefault;

    constructor(content: string) {
        this.content = content;
    }

    public parseText() {
        const parsed = this.parse();
        if (!parsed) return '';

        let value: string = '';
        let charset: number = 0;

        const fonts: RTFFonts = parsed.find((group) => {
            return group instanceof ControlWordGroup && group[0] instanceof ControlWordDefault && group[0].name === 'fonttbl';
        }).slice(1).reduce((accumulator: any, current: any) => {
            //TO DO REWRITE BY GETTING WORD NAME
            const f = current[0].value
            const charset = current[2].value

            accumulator[f] = charset;

            return accumulator;
        }, {})

        function check(_doc: ControlWordGroup) {
            for (const doc of _doc) {
                // if (doc instanceof ControlWordGroup) {
                //     check(doc)
                //     continue;
                // }

                if (typeof doc === 'string') {
                    value += doc;
                    continue;
                }

                if (doc instanceof ControlWordDefault && doc.name === 'f') {
                    charset = fonts[doc.value!];
                    continue;
                }

                if (doc instanceof ControlWordDefault && doc.name === 'par') {
                    value += '\n';
                    continue;
                }

                if (doc instanceof ControlWordDefault && doc.name === 'u') {
                    value += String.fromCharCode(doc.value!)
                }

                if (doc instanceof ControlWordHex) {
                    if (charset === FontCharset.RUSSIAN_CHARSET) {
                        value += win1251toUTF8(doc.char);
                    } else if (charset === FontCharset.ANSI_CHARSET) {
                        value += String.fromCharCode(doc.char)
                    } else {
                        console.log('charset is not defined', charset, doc.char)
                        value += '?'
                    }
                    continue;
                }
            }
        }

        check(parsed)

        return value;
    }

    public parse() {
        try {
            for (const symbol of this.content) {
                this.parseSymbol(symbol)
            }
        } catch (e) {
            this.document = undefined;

            throw e;
        }

        return this.document;
    }

    public getDocument() {
        if (!this.document) throw new Error('Document is not parsed');

        return this.document;
    }

    private parseSymbol(symbol: string) {
        if (symbol === '\r') {
            return;
        }

        if (symbol === '\n') {
            this.currentLine++;
            this.currentSymbol = 0;
            this.endControlWord();
            return;
        } else {
            this.currentSymbol++;
        }

        if (this.currentControlWord && symbol === ' ') {
            this.endControlWord();
            return;
        }

        if (symbol === '{') {
            this.endControlWord();

            //start group
            if (!this.document) {
                this.document = new RTFDocument();
                this.currentGroup = this.document;
                return;
            }

            const group = new ControlWordGroup();
            group.parent = this.currentGroup;
            this.currentGroup = group;

            return;
        }

        if (symbol === '}') {
            //end group
            this.endControlWord();
            const group = this.currentGroup;
            this.currentGroup = this.currentGroup?.parent;
            this.currentGroup?.push(group);

            return;
        }

        if (symbol === '\\') {
            //control word
            const ignore = this.currentControlWord?.name === '*'
            this.endControlWord();
            this.currentControlWord = new ControlWordDefault();
            this.currentControlWord.canIgnore = ignore;

            return;
        }

        if (symbol === '?' && this.currentControlWord?.name === 'u') {
            return this.endControlWord()
        }

        if (this.currentControlWord) {
            return this.parseControlWord(symbol);
        }

        const last = this.currentGroup?.getLast();
        if (typeof last === 'string') {
            this.currentGroup![this.currentGroup!.length - 1] = last + symbol;
            return;
        } else {
            this.currentGroup?.push(symbol)
        }
    }

    private parseControlWord(symbol: string) {
        const word = this.currentControlWord
        if (!word) return;

        if (word instanceof ControlWordHex) {
            word.content += symbol;

            if (word.content.length == 2) {
                word.char = parseInt(word.content, 16);
                this.currentGroup?.push(word);
                this.currentControlWord = undefined;
            }

            return;
        }

        if (symbol === '\'') {
            this.currentControlWord = new ControlWordHex();
            return;
        }

        if (isNaN(+symbol)) {
            if (word.value) {
                throw new SyntaxError('Number cannot be used in word name', this.currentLine, this.currentSymbol);
            }

            if (symbol === '-') {
                if (word.name?.length && word.value) {
                    throw new SyntaxError('Symbol - cannit be used in word name', this.currentLine, this.currentSymbol);
                } else {
                    word._tmp += symbol;
                }

                return;
            }

            if (!word.name) {
                word.name = '';
            }

            word.name += symbol;
        } else {
            if (word.value === undefined) {
                word.value = 0;
            }

            word.value = Number(
                word._tmp + String(word.value) + symbol
            )

            word._tmp = '';
        }
    }

    private endControlWord() {
        if (!this.currentControlWord || this.currentControlWord.name === '*') return;

        this.currentGroup?.push(this.currentControlWord);
        this.currentControlWord = undefined;
    }
}