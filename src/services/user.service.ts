import { UserDocument, UserModel, UserInput } from '../models/user.model';

class UserService {

    async createUser(userData: UserInput) {
        try {
            const existUser: UserDocument | null = await this.findByEmail(userData.email);
            if (existUser) return { message: `User already exists with ${userData.email}` };

            const createdUser = await UserModel.create(userData);
            return createdUser;

        } catch (error) {
            console.error('Error in createUser service:', error);
            throw new Error('Error creating user');
        }
    }

    async findAllUsers(): Promise<UserDocument[]> {
        try {
            const users: UserDocument[] = await UserModel.find();
            return users;
        } catch (error) {
            throw new Error('Error fetching users');
        }
    }

    async findByEmail(email: string) {
        try {
            const users = await UserModel.findOne({ email });
            return users;
        } catch (error) {
            throw new Error('Error fetching student by email');
        }
    }

    async updateUser(email: string, userData: UserInput){
        try {
            const updatedUser: UserDocument | null = await UserModel.findOneAndUpdate({ email }, userData, { new: true });
            if (updatedUser) {
                updatedUser.password = '';
            }
            return updatedUser;
        } catch (error) {
            throw new Error('Error updating user');
        }
    }

    async deleteUserByEmail(email: string): Promise<boolean> {
        try {
            const deletedUser = await UserModel.findOneAndDelete({ email });
            return deletedUser !== null;
        } catch (error) {
            throw new Error('Error deleting user by email');
        }
    }
    async userProfile(email: string) {
        try {
            const user: UserDocument | null = await UserModel.findOne({ email }).select('-password');
            return user;
        } catch (error) {
            throw new Error('Error fetching user profile');
        }
    }

}



export const userService = new UserService();