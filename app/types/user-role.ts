import { Role } from "./role";

export type UserRole = {
    id: string;
    role: Role;
    assignedAt?: string;
};