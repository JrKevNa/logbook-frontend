export type ToDoList = {
    id: string;
    createDate: Date;
    createdBy?: { id: string; username: string };
    activity: string;
    isDone: boolean;
};