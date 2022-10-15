import { TaskImagePart, TaskInputNumber, TaskInputText, TaskLetterPermutation, TaskMatching, TaskMCQ, TaskMultiChoise, TaskOrderChoise, TaskSingleChoise } from "./Tasks/"

export enum TaskOrder {
    Default,
    Random
}

export enum VariantOrder {
    Default,
    Random
}

export enum QuestionFormulization {
    Default = 0, //FIRST
    Second = 1,
    Third = 2,
    Fourth = 3,
    Fifth = 4,
    Random = 0xFFFFFFFF
}

export type Modes = {
    education: boolean,
    penalty: boolean,
    free: boolean,
    mono: boolean
}

export type Mark = {
    percent: number,
    name: string
}

export type Marks = {
    [level: number]: Mark
}

export enum TaskType {
    SingleChoice = 1,
    MultiChoice = 2,
    OrderChoice = 3,
    Matching = 4,
    MCQ = 5,
    InputNumber = 6,
    InputText = 7,
    ImagePart = 8,
    LetterPermutation = 9
}

export type Task = (
    TaskSingleChoise | TaskMultiChoise | TaskOrderChoise |
    TaskMatching | TaskMCQ | TaskInputNumber |
    TaskInputText | TaskImagePart | TaskLetterPermutation
)

export type NumberAnswer = {
    label: string
    range: [bigint, bigint]
}

export type Resource = {
    fileName: string,
    size: number,
    content: Buffer
}