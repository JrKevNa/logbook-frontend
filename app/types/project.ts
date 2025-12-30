export type Project = {
    id: string;
    workedBy?: { id: string; username: string };
    requestedBy?: string;
    createdBy?: { id: string; username: string };
    name: string;
    startDate: Date;
    endDate: Date;
    isDone: boolean;
};