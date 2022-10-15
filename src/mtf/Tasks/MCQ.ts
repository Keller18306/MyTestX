import { TaskType } from "../types";
import { TaskSingleChoise } from "./SingleChoice";

export class TaskMCQ extends TaskSingleChoise {
    public readonly type: TaskType = TaskType.MCQ;
}