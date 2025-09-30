import { UserRole } from "../models/user.model.js";

export interface UserInput {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface UserInputUpdate {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
}