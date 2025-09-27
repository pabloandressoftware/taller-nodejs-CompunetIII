import { UserDocument, UserModel, UserInput } from '../models/user.model';

class UserService{

    async createUser(userData: UserDocument){
        try {
            const existUser: UserDocument | null = await this.findByEmail(userData.email);
            if(existUser) return { message: `User already exists with ${userData.email}` };

            const createdUser = await UserModel.create(userData);
            return createdUser;
        }catch (error) {
            throw new Error('Error creating user');
        }
    }

    async findAllUsers(): Promise<UserDocument[]> {
        try {
            const users : UserDocument[] = await UserModel.find();
            return users;            
        } catch (error) {
            throw new Error('Error fetching users');    
        }
    }

    async findByEmail(email: string){
        try {
            const users = await UserModel.findOne({ email});
            return users;
        } catch (error) {
            throw new Error('Error fetching student by email');
        }
    }

    async updateUser(userId: string, userData: UserInput): Promise<UserDocument | null> {
        try {
            const updatedUser: UserDocument | null = await UserModel.findByIdAndUpdate(userId, userData, { new: true });
            return updatedUser;
        } catch (error) {
            throw new Error('Error updating user');
        }
    }

    async deleteUser(userId: string): Promise<boolean> {
        try {
            await UserModel.findByIdAndDelete(userId);
            return true;
        } catch (error) {
            throw new Error('Error deleting user');
        }
    }

}



export const userService = new UserService();