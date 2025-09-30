import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { userService } from '../../src/services/user.service.js';
import { UserModel } from '../../src/models/user.model.js';
import { UserInput } from '../../src/models/user.model.js';

// Mock UserModel
jest.mock('../../src/models/user.model.js', () => ({
  UserModel: {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser', () => {
    const mockUserData: UserInput = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'user'
    };

    it('should create a new user successfully', async () => {
      const mockCreatedUser = { ...mockUserData, _id: 'mock-id' };
      
      mockUserModel.findOne.mockResolvedValueOnce(null); // User doesn't exist
      mockUserModel.create.mockResolvedValueOnce(mockCreatedUser as any);

      const result = await userService.createUser(mockUserData);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockUserData.email });
      expect(mockUserModel.create).toHaveBeenCalledWith(mockUserData);
      expect(result).toEqual(mockCreatedUser);
    });

    it('should return error message if user already exists', async () => {
      const existingUser = { ...mockUserData, _id: 'existing-id' };
      
      mockUserModel.findOne.mockResolvedValueOnce(existingUser as any);

      const result = await userService.createUser(mockUserData);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockUserData.email });
      expect(mockUserModel.create).not.toHaveBeenCalled();
      expect(result).toEqual({ message: `User already exists with ${mockUserData.email}` });
    });

    it('should throw error when database operation fails', async () => {
      mockUserModel.findOne.mockRejectedValueOnce(new Error('Database error'));

      await expect(userService.createUser(mockUserData)).rejects.toThrow('Error creating user');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockUserData.email });
    });
  });

  describe('findAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@example.com', role: 'user' },
        { _id: '2', name: 'User 2', email: 'user2@example.com', role: 'admin' }
      ];

      mockUserModel.find.mockResolvedValueOnce(mockUsers as any);

      const result = await userService.findAllUsers();

      expect(mockUserModel.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockUsers);
    });

    it('should throw error when database operation fails', async () => {
      mockUserModel.find.mockRejectedValueOnce(new Error('Database error'));

      await expect(userService.findAllUsers()).rejects.toThrow('Error fetching users');
      expect(mockUserModel.find).toHaveBeenCalledWith();
    });
  });

  describe('findByEmail', () => {
    const testEmail = 'test@example.com';

    it('should return user when found', async () => {
      const mockUser = { _id: '1', name: 'Test User', email: testEmail, role: 'user' };
      
      mockUserModel.findOne.mockResolvedValueOnce(mockUser as any);

      const result = await userService.findByEmail(testEmail);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: testEmail });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);

      const result = await userService.findByEmail(testEmail);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: testEmail });
      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      mockUserModel.findOne.mockRejectedValueOnce(new Error('Database error'));

      await expect(userService.findByEmail(testEmail)).rejects.toThrow('Error fetching student by email');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: testEmail });
    });
  });

  describe('updateUser', () => {
    const testEmail = 'test@example.com';
    const updateData: UserInput = {
      name: 'Updated Name',
      email: testEmail,
      password: 'newpassword',
      role: 'admin'
    };

    it('should update user successfully and remove password from response', async () => {
      const mockUpdatedUser = { 
        ...updateData, 
        _id: '1',
        password: 'hashed-password'
      };
      
      mockUserModel.findOneAndUpdate.mockResolvedValueOnce(mockUpdatedUser as any);

      const result = await userService.updateUser(testEmail, updateData);

      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { email: testEmail }, 
        updateData, 
        { new: true }
      );
      expect(result?.password).toBe('');
    });

    it('should return null when user not found', async () => {
      mockUserModel.findOneAndUpdate.mockResolvedValueOnce(null);

      const result = await userService.updateUser(testEmail, updateData);

      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { email: testEmail }, 
        updateData, 
        { new: true }
      );
      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      mockUserModel.findOneAndUpdate.mockRejectedValueOnce(new Error('Database error'));

      await expect(userService.updateUser(testEmail, updateData)).rejects.toThrow('Error updating user');
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { email: testEmail }, 
        updateData, 
        { new: true }
      );
    });
  });

  describe('deleteUserByEmail', () => {
    const testEmail = 'test@example.com';

    it('should delete user successfully and return true', async () => {
      const mockDeletedUser = { _id: '1', email: testEmail };
      
      mockUserModel.findOneAndDelete.mockResolvedValueOnce(mockDeletedUser as any);

      const result = await userService.deleteUserByEmail(testEmail);

      expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({ email: testEmail });
      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      mockUserModel.findOneAndDelete.mockResolvedValueOnce(null);

      const result = await userService.deleteUserByEmail(testEmail);

      expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({ email: testEmail });
      expect(result).toBe(false);
    });

    it('should throw error when database operation fails', async () => {
      mockUserModel.findOneAndDelete.mockRejectedValueOnce(new Error('Database error'));

      await expect(userService.deleteUserByEmail(testEmail)).rejects.toThrow('Error deleting user by email');
      expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({ email: testEmail });
    });
  });

  describe('userProfile', () => {
    const testEmail = 'test@example.com';

    it('should return user profile without password', async () => {
      const mockUser = { _id: '1', name: 'Test User', email: testEmail, role: 'user' };
      const mockQuery = {
        select: jest.fn((_: string) => Promise.resolve(mockUser))
      };
      
      (mockUserModel.findOne as jest.Mock).mockReturnValue(mockQuery);

      const result = await userService.userProfile(testEmail);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: testEmail });
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const mockQuery = {
        select: jest.fn((_: string) => Promise.resolve(null))
      };
      
      (mockUserModel.findOne as jest.Mock).mockReturnValue(mockQuery);

      const result = await userService.userProfile(testEmail);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: testEmail });
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      const mockQuery = {
        select: jest.fn(() => Promise.reject(new Error('Database error')))
      };
      
      (mockUserModel.findOne as jest.Mock).mockReturnValue(mockQuery);

      await expect(userService.userProfile(testEmail)).rejects.toThrow('Error fetching user profile');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: testEmail });
    });
  });
});
