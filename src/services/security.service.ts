import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

class SecurityService {

    async encryptPassword(password: string){
        return await bcrypt.hash(password, 10);
    }

    async generateToken(_id: mongoose.Types.ObjectId, email: string, role: string){
        return await jwt.sign({ _id, email, role}, 'secret', { expiresIn: '1h'});
    }

    async comparePassword(incomingPassword: string, currentPassword: string){
        return await bcrypt.compare(incomingPassword, currentPassword);
    }
}

export const securityService = new SecurityService();