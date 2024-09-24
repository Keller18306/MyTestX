import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { convertTasks } from "../converter/convertTasks";
import MTF from "../mtf";
import { TaskOrder, VariantOrder } from "../mtf/types";
import { ReadBuffer } from "../utils/buffer";
import { ProxiedBuffer } from "./buffer";
import { config } from "./config";

const SEPARATOR = '\r\n';

enum WaitingCommand {
    GETLIST,
    GETTEST,
    INFOBEGIN
}

export class MTXInjector {
    private waiting?: WaitingCommand;

    public onClientData(proxiedBuffer: ProxiedBuffer) {
        const value = proxiedBuffer.toString().split(SEPARATOR);

        if (proxiedBuffer.startsWith('GETLIST')) {
            if (value.length < 3) {
                return;
            }

            console.log(value[1], '|', 'Получение списка тестов');

            this.waiting = WaitingCommand.GETLIST;

            return proxiedBuffer.release();
        }

        if (proxiedBuffer.startsWith('GETTEST')) {
            if (value.length < 4) {
                return;
            }

            console.log(value[1], '|', 'Запрос теста:', value[2]);

            this.waiting = WaitingCommand.GETTEST;

            return proxiedBuffer.release();
        }

        // Я не уверен в работе этого кода на все 100%
        // if (proxiedBuffer.startsWith('INFOBEGIN')) {
        //     if (value.length < 3) {
        //         return;
        //     }

        //     const dataStart: number = value[0].length + value[1].length + (separator.length * 2);
        //     const dataLength = +value[1];

        //     const data = proxiedBuffer.buffer.subarray(
        //         dataStart, dataStart + dataLength
        //     );

        //     if (data.length !== dataLength) {
        //         return;
        //     }

        //     const padding = proxiedBuffer.buffer.subarray(dataStart + dataLength).toString();
        //     if (padding !== 'QUIT\r\n') {
        //         return;
        //     }

        //     const info = this.readBeginTest(data);

        //     console.log('Начало выполнения', info);

        //     this.waiting = WaitingCommand.INFOBEGIN;

        //     return proxiedBuffer.release();
        // }

        // if (proxiedBuffer.startsWith('INFOPROCESS')) {
        //     if (value.length < 3) {
        //         return;
        //     }

        //     const dataStart: number = value[0].length + value[1].length + (separator.length * 2);
        //     const dataLength = +value[1];

        //     const data = proxiedBuffer.buffer.subarray(
        //         dataStart, dataStart + dataLength
        //     );

        //     if (data.length !== dataLength) {
        //         return;
        //     }

        //     const info = this.readInfoProcess(data);

        //     console.log('Процесс выполнения', info);

        //     this.waiting = WaitingCommand.INFOBEGIN;

        //     return proxiedBuffer.release();
        // }

        return proxiedBuffer.release();
    }

    public onServerData(proxiedBuffer: ProxiedBuffer) {
        if (this.waiting === WaitingCommand.GETTEST) {

            const value = proxiedBuffer.toString().split(SEPARATOR);

            const status = value[0];

            if (status !== 'YES') {
                this.waiting = undefined;
                return proxiedBuffer.release();
            }

            if (value.length < 4) {
                return;
            }

            const fileName = value[1];
            if (!fileName) return;

            const fileLength = value[2];
            if (!fileLength) return;

            const length = Number(fileLength);

            const fileData = proxiedBuffer.buffer.subarray(
                status.length + Buffer.from(fileName).length + fileLength.length + (SEPARATOR.length * 3)
            );

            if (fileData.length >= length) {
                if (fileData.length > length) {
                    console.log('WARING', 'FILE IS TOO LARGE');
                    throw new Error('Invalid file length');
                }

                const newFileData = this.patchTestFile({ fileName, buffer: fileData });

                const newPacket = Buffer.concat([
                    Buffer.from('YES\r\n', 'utf8'),
                    Buffer.from(fileName + '\r\n', 'utf8'),
                    Buffer.from(String(newFileData.length) + '\r\n', 'utf8'),
                    newFileData
                ]);

                proxiedBuffer.reset();
                this.waiting = undefined;

                proxiedBuffer.write(newPacket);
            }

            return;
        }

        this.waiting = undefined;

        return proxiedBuffer.release();
    }

    private patchTestFile({ fileName, buffer }: { fileName: string, buffer: Buffer }) {
        //save copy of file
        if (config.testsSaveDir && !existsSync(config.testsSaveDir)) {
            mkdirSync(config.testsSaveDir, { recursive: true });
            writeFileSync(join(config.testsSaveDir, fileName), buffer);
        }

        const mtf = MTF.loadFromBuffer(buffer);

        //Убрать пароль на редактирвоание
        mtf.settings.password.edit = '';

        //Убрать лимит на кол-во запусков
        mtf.settings.limitRunCount = 0;

        mtf.settings.isCanSaveResult = true;

        mtf.settings.taskOrder = TaskOrder.Default;
        mtf.settings.variantOrder = VariantOrder.Default;

        for (const task of mtf.tasks) {
            task.promptCost = 0;
            task.shuffleAnswers = false;

            task.prompt = convertTasks([task]);
        }

        return mtf.saveToBuffer(false);
    }

    private readBeginTest(data: Buffer) {
        const reader = new ReadBuffer(data);

        const res = {
            testingSessionId: reader.readDelphiString(),
            username: reader.readDelphiString(),
            usergroup: reader.readDelphiString(),
            computerNewName: reader.readDelphiString(),
            computerUserName: reader.readDelphiString(),
            title: reader.readDelphiString(),
            filename: reader.readDelphiString(),
            crc: reader.readUInt32LE(),
            fuid: reader.readDelphiString(),
            countTask: reader.readUInt32LE(),
            scoreMax: reader.readUInt32LE(),
        }

        const padding = reader.readPadding()

        if (padding.length !== 0) {
            throw new Error('Buffer not fully read');
        }

        return res;
    }

    private readInfoProcess(data: Buffer) {
        // writeFileSync('./a.txt', data);

        const reader = new ReadBuffer(data);

        const res = {
            testingSessionId: reader.readDelphiString(),
            isMonitor: reader.readBool(),
            countAskTask: reader.readUInt32LE(),
            countCorrectTask: reader.readUInt32LE(),
            countErrorTask: reader.readUInt32LE(),
            countMissTask: reader.readUInt32LE(),
            score: reader.readDoubleLE(),
            scoreNowMax: reader.readUInt32LE(),
            indexAskTask: reader.readUInt32LE(),
            result: reader.readUInt32LE(), //????
            countSeconds: reader.readUInt32LE(),
        }

        const padding = reader.readPadding()

        // console.log(padding.length, padding, padding.toString())
        if (padding.length !== 0) {
            throw new Error('Buffer not fully read');
        }

        return res;
    }
}
