import { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { securityService } from '../services/security.service.js';
import { UserDocument, UserInput } from '../models/user.model.js';

class UserController {

    async createUser(req: Request, res: Response) {
        try {
            req.body.password = await securityService.encryptPassword(req.body.password);
            const user = await userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            console.error('Error in create controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const users: UserDocument[] = await userService.findAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getByEmail(req: Request, res: Response) {
        try {
            const user = await userService.findByEmail(req.body.email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const existingUser: UserDocument | null = await userService.findByEmail(req.body.email);
            if (!existingUser) {
                return res.status(404).json({ message: `User ${req.body.email} doesn't exist` });
            }
            
            const isMatch = await securityService.comparePassword(req.body.password, existingUser.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            
            const token = await securityService.generateToken(existingUser.id, existingUser.email, existingUser.role);
            return res.status(200).json({ message: "Login successful", token });
        } catch (error) {
            console.error('Error in login controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const email = req.params.email;
            if (!email) {
                return res.status(400).json({ message: 'Email parameter is required' });
            }
            const user: UserDocument | null = await userService.updateUser(email, req.body as UserInput);
            if(user === null) {
                return res.status(404).json({ message: `User with email ${email} not found` });
            }else {
                return res.status(200).json(user);
            }
        } catch (error) {
            console.error('Error in updateUser controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const email = req.params.email;
            if (!email) {
                return res.status(400).json({ message: 'Email parameter is required' });
            }
            const deleted: boolean = await userService.deleteUserByEmail(email);
            if (!deleted) {
                return res.status(404).json({ message: `User with email ${email} not found` });
            } else {
                return res.status(200).json({ message: 'User deleted successfully' });
            }
        } catch (error) {
            console.error('Error in deleteUser controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getUserProfile(req: Request, res: Response) {
        try {
            const email = req.params.email;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }
            const user = await userService.findByEmail(email);
            if (!user) {
                return res.status(404).json({ message: `User with email ${email} not found` });
            }
            user.password = ''; // Omitir la contraseña en la respuesta
            return res.status(200).json(user);
        } catch (error) {
            console.error('Error in getUserProfile controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export const userController = new UserController();