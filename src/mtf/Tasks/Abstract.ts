import { ReadBuffer, WriteBuffer } from "../../utils/buffer";
import { TaskType } from "../types";

export abstract class AbstractTask {
    public abstract readonly type: TaskType;
    public formulations: string[] = new Array(5).fill('');
    public photo: string = '';
    public media: string = '';
    public difficulty: number = 1;
    public timeLimit: number = 0;
    public prologue: string = '';
    public prompt: string = '';
    public promptCost: number = 0;
    public explanation: string = '';
    public groupId: number = 0;
    public shuffleAnswers: boolean = true;

    public load(buffer: ReadBuffer) {
        const formulationsCount = buffer.readUInt32LE();
        this.formulations = []
        for (let i = 0; i < formulationsCount; i++) {
            this.formulations.push(buffer.readDelphiString())
        }

        this.photo = buffer.readDelphiString();
        this.media = buffer.readDelphiString();
        this.difficulty = buffer.readUInt32LE();
        this.timeLimit = buffer.readUInt32LE();
        this.prologue = buffer.readDelphiString();
        this.prompt = buffer.readDelphiString();
        this.promptCost = buffer.readUInt32LE();
        this.explanation = buffer.readDelphiString();
        this.groupId = buffer.readUInt32LE();
        this.shuffleAnswers = buffer.readBool();

        return this
    }

    public save(buffer: WriteBuffer) {
        buffer.writeUInt32LE(this.formulations.length);
        for (const formulation of this.formulations) {
            buffer.writeDelphiString(formulation)
        }

        buffer.writeDelphiString(this.photo);
        buffer.writeDelphiString(this.media);
        buffer.writeUInt32LE(this.difficulty);
        buffer.writeUInt32LE(this.timeLimit);
        buffer.writeDelphiString(this.prologue);
        buffer.writeDelphiString(this.prompt);
        buffer.writeUInt32LE(this.promptCost);
        buffer.writeDelphiString(this.explanation);
        buffer.writeUInt32LE(this.groupId);
        buffer.writeBool(this.shuffleAnswers);
    }
}