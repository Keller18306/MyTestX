import { ReadBuffer, WriteBuffer } from "../utils/buffer";

export class Group {
    public id: number = 0;
    public title: string = 'Общий список заданий';
    public description: string = 'Основная тема. Ее удалить нельзя.';
    public questionsLimit: number = 0;
    public useQuestionsLimit: boolean = false;

    public load(buffer: ReadBuffer) {
        this.id = buffer.readUInt32LE();
        this.title = buffer.readDelphiString();
        this.description = buffer.readDelphiString();
        this.questionsLimit = buffer.readUInt32LE();
        this.useQuestionsLimit = buffer.readBool();

        return this
    }

    public save(buffer: WriteBuffer) {
        buffer.writeUInt32LE(this.id);
        buffer.writeDelphiString(this.title);
        buffer.writeDelphiString(this.description);
        buffer.writeUInt32LE(this.questionsLimit);
        buffer.writeBool(this.useQuestionsLimit);
    }
}

export class MTFGroups extends Array<Group> {
    public useGroupsLimit: boolean = false;

    constructor() {
        super()

        this.push(new Group())
    }

    public getGroupById(id: number): Group | undefined {
        for (const group of this) {
            if (group.id !== id) continue;

            return group;
        }
    }

    public load(buffer: ReadBuffer) {
        this.length = 0;

        const groupsCount = buffer.readUInt32LE();
        for (let i = 0; i < groupsCount; i++) {
            this.push(new Group().load(buffer))
        }

        this.useGroupsLimit = buffer.readBool();

        //BYTES 4 + 1 + 4 + 1 + 4 + 1 + 4 + 1 + 4 + 1 возможно не используются
        buffer.skip(25);

        return this;
    }

    public save(buffer: WriteBuffer) {
        buffer.writeUInt32LE(this.length);
        for (const group of this) {
            group.save(buffer)
        }

        buffer.writeBool(this.useGroupsLimit);

        //BYTES 4 + 1 + 4 + 1 + 4 + 1 + 4 + 1 + 4 + 1 возможно не используются
        buffer.writeZeroBytes(25);
    }
}