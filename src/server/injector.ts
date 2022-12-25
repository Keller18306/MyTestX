import { Socket } from "net";
import MTF, { TaskMultiChoise } from "../mtf";
import { RTFParser, textToRtf } from "../rtf";
import { writeFileSync } from "fs";
import { TaskOrder, TaskType, VariantOrder } from "../mtf/types";
import { TaskSingleChoise } from "../mtf";

enum ClientInjectorState {

}

enum ServerInjectorState {
    WaitingTestResponse,
    ReceivingTestFileName,
    ReceivingTestFileLength,
    ReceivingTestFileData
}

export class MTXInjector {
    private client: Socket;
    private server: Socket;

    private clientState?: ClientInjectorState;
    private serverState?: ServerInjectorState;

    private fileName?: string;
    private fileLength?: number;
    private fileParts?: Buffer[];
    private fileReceivedLength?: number;
    private fileNameSent: boolean = false;
    private fileLengthSent: boolean = false;

    constructor(client: Socket, server: Socket) {
        this.client = client;
        this.server = server;
    }

    public onClientData(data: Buffer): boolean {
        const parts = data.toString().split('\r\n')

        if (parts[0] === 'GETTEST') {
            this.serverState = ServerInjectorState.WaitingTestResponse;

            return true;
        }

        return true;
    }

    public onServerData(data: Buffer): boolean {
        let mData = data.subarray();
        const parts = data.toString().split('\r\n')

        if (this.serverState === ServerInjectorState.WaitingTestResponse) {
            const value = parts.splice(0, 1)[0]

            if (value === 'YES') {
                this.serverState = ServerInjectorState.ReceivingTestFileName
                mData = mData.subarray(value.length + '\r\n'.length)
            } else {
                this.serverState = undefined
                return true;
            }

            if (!parts[0]) {
                return true;
            }
        }

        if (this.serverState === ServerInjectorState.ReceivingTestFileName) {
            const value = parts.splice(0, 1)[0]
            mData = mData.subarray(value.length + '\r\n'.length)
            this.fileName = value;

            this.serverState = ServerInjectorState.ReceivingTestFileLength;

            if (!parts[0]) {
                this.fileNameSent = true;
                return true;
            }
        }

        if (this.serverState === ServerInjectorState.ReceivingTestFileLength) {
            const value = parts.splice(0, 1)[0]
            mData = mData.subarray(value.length + '\r\n'.length)

            const length = Number(value)

            this.fileLength = length;
            this.fileParts = []
            this.fileReceivedLength = 0;

            this.serverState = ServerInjectorState.ReceivingTestFileData;
                
            if (!mData.length) {
                // const file = mData.subarray();

                // this.fileParts.push(file);
                // this.fileReceivedLength = file.length;
                return false;
            }
        }


        if (this.serverState === ServerInjectorState.ReceivingTestFileData) {
            this.fileParts!.push(mData)
            this.fileReceivedLength! += mData.length

            if (this.fileLength === this.fileReceivedLength) {
                this.fileLength = undefined
                this.fileReceivedLength = undefined

                this.fileReceived()
            } else {
                console.log(this.fileLength, this.fileReceivedLength)
            }

            return false;
        }

        return true;
    }

    private fileReceived() {
        let buffer = Buffer.concat(this.fileParts!)

        const mtf = MTF.loadFromBuffer(buffer)

        //Убрать пароль на редактирвоание
        mtf.settings.passwordEdit = ''

        //Убрать лимит на кол-во запусков
        mtf.settings.limitRunCount = 0

        mtf.settings.isCanSaveResult = true

        mtf.settings.taskOrder = TaskOrder.Default
        mtf.settings.variantOrder = VariantOrder.Default

        for (const task of mtf.tasks) {
            task.promptCost = 0

            if (task instanceof TaskSingleChoise || task instanceof TaskMultiChoise) {
                let answer: string

                task.prompt = textToRtf(task.answers.map((answer, i) => {
                    return String(i + 1) + ' ' + new RTFParser(answer).parseText();
                }).filter((answer, i) => {
                    return Boolean(task.correctAnswers[i])
                }).join('\n'))
            }

            task.shuffleAnswers = false
        }

        buffer = mtf.saveToBuffer(false)
    
        buffer = Buffer.concat([
            ...(!this.fileNameSent ? [
                Buffer.from(this.fileName! + '\r\n', 'utf8')
            ] : []),
            Buffer.from(String(buffer.length) + '\r\n', 'utf8'),
            buffer
        ])

        const maxSize = Math.max(...this.fileParts!.map((_) => {
            return _.length;
        }))

        this.fileNameSent = false;
        this.fileParts = undefined
        this.serverState = undefined
        
        // for (let offset = 0; offset < buffer.length; offset += maxSize) {
        //     const slice = buffer.subarray(offset, offset + maxSize)

        console.log(`[Proxy -> Client]:`, buffer)
        this.client.write(buffer)
        //}
        // for (let part = 0; part < parts; part++) {
        //     const subarray = buffer.subarray(5536 * part, 5536 * (part + 1))

        //     this.server.write()
        //     this.serverQueue.push(subarray)
        // }
    }
}