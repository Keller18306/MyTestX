import { ReadBuffer, WriteBuffer } from "../utils/buffer";
import { Marks, Modes, QuestionFormulization, TaskOrder, VariantOrder } from "./types";

export class MTFSettings {
    /**
    * Порядок заданий:
    * Default - по порядку
    * Random - в случайном порядке
    */
    public taskOrder: TaskOrder = TaskOrder.Default;

    /**
    * Порядок ответов:
    * Default - по порядку
    * Random - в случайном порядке
    */
    public variantOrder: VariantOrder = VariantOrder.Default;

    /**
     * Фомрулировка (вариант) вопросов.
     * Default - по умолчанию (первый)
     * Second, Third, Fourth, Fifth - соответственно номеру
     * Random - случайный
     */
    public questionFormulization: QuestionFormulization = QuestionFormulization.Default;


    public timeLimit: number = 0;
    public countTaskLimit: number = 0;
    public modes: Modes = {
        education: false,
        penalty: false,
        free: false,
        mono: false
    };

    public isShowUserResult: boolean = true;
    public isCanSaveResult: boolean = true;
    public isCanSaveProtectedResult: boolean = false;
    public isSendResult: boolean = true;
    public isMonitor: boolean = true;
    public isShowDetailReport: boolean = false;
    public isSendEmail: boolean = false;
    public isShowGoodAnswer: boolean = true;

    public minimumLimit: number = 0; //типа с какого % можно показывать правльные/неправльные результаты
    public limitRunCount: number = 0;
    public limitErrorCount: number = 0;

    public dateStarting: bigint = 0n;
    public dateEnding: bigint = 0n;

    public passwordEdit: string = '';
    public passwordOpen: string = '';
    public passwordRun: string = '';
    public passwordProtectionResult: string = '';

    public markLevel: number = 5;
    public marks: Marks = {
        1: { percent: 0, name: '' },
        2: { percent: 0, name: '' },
        3: { percent: 50, name: '' },
        4: { percent: 70, name: '' },
        5: { percent: 85, name: '' }
    };
    public mark100True: boolean = true;

    public load(buffer: ReadBuffer) {
        this.taskOrder = buffer.readUInt8();
        this.variantOrder = buffer.readUInt8();
        this.questionFormulization = buffer.readUInt32LE();
        this.timeLimit = buffer.readUInt32LE();
        this.countTaskLimit = buffer.readUInt32LE(); // ЖЕЛАТЕЛЬНО НЕ ИСПОЛЬЗОВАТЬ, ИБО ЛИМИТ ЗАДАЁТСЯ ПО ГРУППЕ
        this.modes = {
            education: buffer.readBool(),
            penalty: buffer.readBool(),
            free: buffer.readBool(),
            mono: buffer.readBool()
        };
        this.isShowUserResult = buffer.readBool();
        this.isCanSaveResult = buffer.readBool();
        this.isCanSaveProtectedResult = buffer.readBool();
        this.isSendResult = buffer.readBool();
        this.isMonitor = buffer.readBool();
        this.isShowDetailReport = buffer.readBool();
        this.isSendEmail = buffer.readBool();
        this.isShowGoodAnswer = buffer.readBool();
        this.minimumLimit = buffer.readUInt32LE();
        this.limitRunCount = buffer.readUInt32LE();
        this.limitErrorCount = buffer.readUInt32LE();
        this.dateStarting = buffer.readBigUInt64LE();
        this.dateEnding = buffer.readBigUInt64LE();
        this.passwordEdit = buffer.readDelphiString();
        this.passwordOpen = buffer.readDelphiString();
        this.passwordRun = buffer.readDelphiString();
        this.passwordProtectionResult = buffer.readDelphiString();

        this.markLevel = buffer.readUInt32LE();
        this.marks = {};
        for (let i = 0; i < this.markLevel; i++) {
            const mark = buffer.readUInt32LE();
            const percent = buffer.readUInt32LE();
            const name = buffer.readDelphiString();

            this.marks[mark] = { percent, name };
        }
        this.mark100True = buffer.readBool();

        return this;
    }

    public save(buffer: WriteBuffer) {
        buffer.writeUInt8(this.taskOrder);
        buffer.writeUInt8(this.variantOrder);
        buffer.writeUInt32LE(this.questionFormulization);
        buffer.writeUInt32LE(this.timeLimit);
        buffer.writeUInt32LE(this.countTaskLimit); // ЖЕЛАТЕЛЬНО НЕ ИСПОЛЬЗОВАТЬ, ИБО ЛИМИТ ЗАДАЁТСЯ ПО ГРУППЕ

        buffer.writeBool(this.modes.education);
        buffer.writeBool(this.modes.penalty);
        buffer.writeBool(this.modes.free);
        buffer.writeBool(this.modes.mono);

        buffer.writeBool(this.isShowUserResult);
        buffer.writeBool(this.isCanSaveResult);
        buffer.writeBool(this.isCanSaveProtectedResult);
        buffer.writeBool(this.isSendResult);
        buffer.writeBool(this.isMonitor);
        buffer.writeBool(this.isShowDetailReport);
        buffer.writeBool(this.isSendEmail);
        buffer.writeBool(this.isShowGoodAnswer);
        buffer.writeUInt32LE(this.minimumLimit);
        buffer.writeUInt32LE(this.limitRunCount);
        buffer.writeUInt32LE(this.limitErrorCount);
        buffer.writeBigUInt64LE(this.dateStarting);
        buffer.writeBigUInt64LE(this.dateEnding);
        buffer.writeDelphiString(this.passwordEdit);
        buffer.writeDelphiString(this.passwordOpen);
        buffer.writeDelphiString(this.passwordRun);
        buffer.writeDelphiString(this.passwordProtectionResult);

        buffer.writeUInt32LE(this.markLevel);
        for (const _mark in this.marks) {
            const mark = this.marks[_mark]

            buffer.writeUInt32LE(Number(_mark));
            buffer.writeUInt32LE(mark.percent);
            buffer.writeDelphiString(mark.name);
        }

        buffer.writeBool(this.mark100True);
    }
}