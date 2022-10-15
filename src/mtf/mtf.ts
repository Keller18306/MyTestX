import { readFileSync, writeFileSync } from "fs";
import { userInfo } from "os";
import { deflateSync, inflateSync } from "zlib";
import { ReadBuffer, WriteBuffer } from "../utils/buffer";
import { decrypt, encrypt } from "../utils/crypt";
import { guid } from '../utils/guid'
import { MTFGroups } from "./groups";
import { MTFResources } from "./resources";
import { MTFSettings } from "./settings";
import { MTFTasks } from "./tasks";

export class MTF {
    private _version: string = '10.2.0.3';

    /**
     * Название теста
     */
    public title: string = '';

    /**
     * Автор теста
     */
    public author: string;

    /**
     * Почта автора теста
     */
    public authorEmail: string = '';

    /**
     * Описание теста
     */
    public description: string = ''; // RTF FORMAT

    /**
     * Инстурукция перед прохождением теста
     */
    public instruction: string = ''; // RTF FORMAT

    /**
     * Заметки к тесты
     */
    public note: string = ''; // RTF FORMAT

    /**
     * Настройки теста
     */
    public settings: MTFSettings;

    /**
     * Время создания теста в UNIX timestamp
     */
    public timeCreate: bigint;

    /**
     * Время последнего сохранения в UNIX timestamp
     */
    public timeSave: bigint;

    /**
     * Уникальный GUID теста. Меняется при каждом сохрании
     */
    public guid: string;

    /**
     * Темы (группы) в тесте
     */
    public groups: MTFGroups;

    /**
     * Все задания в тестее
     */
    public tasks: MTFTasks;

    /**
     * Хранилище ресурсов всего теста (фотографии, аудио)
     */
    public resources: MTFResources;

    /**
     * Версия файла теста
     */
    public get version(): string {
        return this._version;
    }

    public static loadFromFile(fileName: string): MTF {
        const file: Buffer = readFileSync(fileName);

        return this.loadFromBuffer(file);
    }

    public static loadFromBuffer(data: Buffer): MTF {
        //return new this().load(decrypt(data))
        return new this(decrypt(data))
    }

    constructor(data: Buffer) {
        // const user = userInfo().username

        // this.author = `${user} via NodeJS`;
        // this.settings = new MTFSettings();
        // this.timeCreate = BigInt(Date.now())
        // this.timeSave = BigInt(Date.now())
        // this.guid = guid()

        // this.groups = new MTFGroups();
        // this.tasks = new MTFTasks();
        // this.resources = new MTFResources();

        const fullBuffer = new ReadBuffer(data);

        const mtxString = fullBuffer.readString(9, 'utf16le');
        if (mtxString !== 'MyTestX\b\0') {
            throw new Error('it is not MyTestX test file');
        }

        const versionString = fullBuffer.readString(8, 'utf16le');
        if (versionString.substring(0, 5) != this._version.substring(0, 5)) {
            throw new Error('incapability version')
        }
        this._version = versionString;

        const buffer = new ReadBuffer(inflateSync(fullBuffer.readPadding()));
        this.title = buffer.readDelphiString();
        this.author = buffer.readDelphiString();
        this.authorEmail = buffer.readDelphiString();
        this.description = buffer.readDelphiString();
        this.instruction = buffer.readDelphiString();
        buffer.skip(1); // ХЗ, МОЖЕТ БЫТЬ ЭТО НЕИСПОЛЬЗОВАННЫЙ БАЙТ
        this.note = buffer.readDelphiString();
        this.settings = new MTFSettings().load(buffer);
        this.timeCreate = buffer.readBigUInt64LE();
        this.timeSave = buffer.readBigUInt64LE();
        this.guid = buffer.readDelphiString();

        this.groups = new MTFGroups().load(buffer);
        this.tasks = new MTFTasks().load(buffer);
        this.resources = new MTFResources().load(buffer);
    }

    private getHeader(): Buffer {
        const header: string = 'MyTestX\b\0' + this._version;

        const buffer = Buffer.from(header, 'utf16le')

        return buffer;
    }

    public load(data: Buffer) {
        const fullBuffer = new ReadBuffer(data);

        const mtxString = fullBuffer.readString(9, 'utf16le');
        if (mtxString !== 'MyTestX\b\0') {
            throw new Error('it is not MyTestX test file');
        }

        const versionString = fullBuffer.readString(8, 'utf16le');
        if (versionString.substring(0, 5) != this._version.substring(0, 5)) {
            throw new Error('incapability version')
        }
        this._version = versionString;

        const buffer = new ReadBuffer(inflateSync(fullBuffer.readPadding()));
        this.title = buffer.readDelphiString();
        this.author = buffer.readDelphiString();
        this.authorEmail = buffer.readDelphiString();
        this.description = buffer.readDelphiString();
        this.instruction = buffer.readDelphiString();
        buffer.skip(1); // ХЗ, МОЖЕТ БЫТЬ ЭТО НЕИСПОЛЬЗОВАННЫЙ БАЙТ
        this.note = buffer.readDelphiString();
        this.settings = new MTFSettings().load(buffer);
        this.timeCreate = buffer.readBigUInt64LE();
        this.timeSave = buffer.readBigUInt64LE();
        this.guid = buffer.readDelphiString();

        this.groups = new MTFGroups().load(buffer);
        this.tasks = new MTFTasks().load(buffer);
        this.resources = new MTFResources().load(buffer);

        return this
    }

    // private _save(buffer: WriteBuffer) {
    //     buffer.writeDelphiString(this.title);
    //     buffer.writeDelphiString(this.author)
    //     buffer.writeDelphiString(this.authorEmail);
    //     buffer.writeDelphiString(this.description);
    //     buffer.writeDelphiString(this.instruction);
    //     buffer.writeZeroBytes(1);
    //     buffer.writeDelphiString(this.note);

    //     this.settings = new MTFSettings(buffer);
    //     buffer.writeBigUInt64LE(this.timeCreate);
    //     buffer.writeBigUInt64LE(this.timeSave);
    //     buffer.writeDelphiString(this.guid);


    //     this.groups = new MTFGroups(buffer);
    //     this.tasks = new MTFTasks(buffer);
    //     this.resources = new MTFResources(buffer);
    // }

    public saveToBuffer(update: boolean = false): Buffer {
        if (update) {
            this.timeSave = BigInt(Date.now());
            this.guid = guid();
        }

        const writeBuffer = new WriteBuffer();
        // this._save(writeBuffer)

        return encrypt(Buffer.concat([
            this.getHeader(),
            deflateSync(writeBuffer.toBuffer())
        ]));
    }
}