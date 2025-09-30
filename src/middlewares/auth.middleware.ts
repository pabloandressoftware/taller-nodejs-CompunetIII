import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken';
import { UserRole } from "../models/user.model";

export const auth = async(req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.header("Authorization");
        if(!token) {
            return res.status(401).json({message: "No token provided"})
        }
        token = token.replace("Bearer ","");
        const decoded = jwt.verify(token, 'secret') as any;
        
        // Debug: mostrar qué contiene el token
        console.log(" Decoded token:", decoded);
        
        // Inicializar req.body si no existe
        if (!req.body) {
            req.body = {};
        }
        req.body.user = decoded;
        next();
    }catch (error) {
        console.error(" Auth middleware error:", error);
        res.status(403).json({message: "Invalid token"});
    }
}

export const authorizeRoles = (allowRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.body.user;
        if(user && !allowRoles.includes(user.role)){
            res.status(403).json({message: `Forbidden, you are a ${user.role}`});
        } else {
            next();
        }
    }

}