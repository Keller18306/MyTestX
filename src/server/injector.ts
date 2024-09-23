import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { convertTasks } from "../converter/convertTasks";
import MTF from "../mtf";
import { TaskOrder, VariantOrder } from "../mtf/types";
import { ProxiedBuffer } from "./buffer";
import { config } from "./config";

enum WaitingCommand {
    GETLIST,
    GETTEST
}

export class MTXInjector {
    private waiting?: WaitingCommand;

    public onClientData(proxiedBuffer: ProxiedBuffer) {
        const value = proxiedBuffer.toString().split('\r\n');

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

        return proxiedBuffer.release();
    }

    public onServerData(proxiedBuffer: ProxiedBuffer) {
        if (this.waiting === WaitingCommand.GETTEST) {
            const separator = '\r\n';

            const value = proxiedBuffer.toString().split(separator);

            const status = value[0];

            if (status !== 'YES') {
                this.waiting = undefined;
                return proxiedBuffer.release();
            }

            const fileName = value[1];
            if (!fileName) return;

            const fileLength = value[2];
            if (!fileLength) return;

            const length = Number(fileLength);

            const fileData = proxiedBuffer.buffer.subarray(
                status.length + Buffer.from(fileName).length + fileLength.length + (separator.length * 3)
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
}