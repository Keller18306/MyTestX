import { TaskType } from "../types";
import { TaskSingleChoise } from "./SingleChoice";

export class TaskOrderChoise extends TaskSingleChoise {
    public readonly type: TaskType = TaskType.OrderChoice;
}