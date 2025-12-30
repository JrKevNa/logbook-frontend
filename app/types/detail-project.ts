export type DetailProject = {
    id: string;
    projectId: string;
    workedBy?: { id: string; username: string };
    requestedBy?: string;
    createdBy?: { id: string; username: string };
    activity: string;
    requestDate: Date;
    note?: Text;
    isDone: boolean;
};