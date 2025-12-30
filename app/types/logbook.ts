// types/logbook.ts
export type Logbook = {
    id: string;
    logDate: string;
    createdBy?: { id: string; username: string };
    activity: string;
    durationNumber: number;
    durationUnit: string;
};