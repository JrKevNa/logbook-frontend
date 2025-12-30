import { Company } from "./company";
import { UserRole } from "./user-role";

export type User = {
	id: string;
	username: string;
	nik: string;
	email: string;
	companyId: string;
	company?: Company;
	userRoles: UserRole[];
};

// type Role = {
//     id: string;
//     name: string;
// };

// type UserRole = {
//     id: string;
//     role: Role;
//     assignedAt?: string;
// };

// type User = {
//     id: string;
//     email: string;
//     username: string;
//     companyId: string;
//     company?: {
//         id: string;
//         name: string;
//     };
//     userRoles: UserRole[];
// } | null;