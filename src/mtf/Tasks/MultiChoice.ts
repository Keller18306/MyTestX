import { TaskType } from "../types";
import { TaskSingleChoise } from "./SingleChoice";

export class TaskMultiChoise extends TaskSingleChoise {
    public readonly type: TaskType = TaskType.MultiChoice;
}