import mongoose  from "mongoose";
import { UserInput } from '../interfaces/user.interface.js';

export type UserRole = 'admin' | 'user';

export interface UserDocument extends UserInput, mongoose.Document {}

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, required: true}
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema);

export { UserInput };
