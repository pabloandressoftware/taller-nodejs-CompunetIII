import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Request, Response } from 'express';
import { userController } from '../../src/controllers/user.controller';
import { userService } from '../../src/services/user.service';
import { securityService } from '../../src/services/security.service';
import { UserDocument, UserInput } from '../../src/models/user.model';

// Mock services
jest.mock('../../src/services/user.service');
jest.mock('../../src/services/security.service');

const mockUserService = userService as jest.Mocked<typeof userService>;
const mockSecurityService = securityService as jest.Mocked<typeof securityService>;

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      body: {},
      params: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    } as Partial<Response>;

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
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

    it('should create user successfully', async () => {
      const encryptedPassword = 'encrypted_password_123';
      const createdUser = { ...mockUserData, _id: 'user123', password: encryptedPassword };

      mockRequest.body = { ...mockUserData };
      mockSecurityService.encryptPassword.mockResolvedValueOnce(encryptedPassword);
      mockUserService.createUser.mockResolvedValueOnce(createdUser as any);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockSecurityService.encryptPassword).toHaveBeenCalledWith(mockUserData.password);
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        ...mockUserData,
        password: encryptedPassword
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
    });

    it('should return 500 when service throws error', async () => {
      const error = new Error('Service error');
      mockRequest.body = mockUserData;
      mockSecurityService.encryptPassword.mockRejectedValueOnce(error);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });

    it('should handle user service error', async () => {
      const encryptedPassword = 'encrypted_password_123';
      const error = new Error('User creation failed');

      mockRequest.body = mockUserData;
      mockSecurityService.encryptPassword.mockResolvedValueOnce(encryptedPassword);
      mockUserService.createUser.mockRejectedValueOnce(error);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@example.com', role: 'user' },
        { _id: '2', name: 'User 2', email: 'user2@example.com', role: 'admin' }
      ] as UserDocument[];

      mockUserService.findAllUsers.mockResolvedValueOnce(mockUsers);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findAllUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 500 when service throws error', async () => {
      const error = new Error('Service error');
      mockUserService.findAllUsers.mockRejectedValueOnce(error);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('getByEmail', () => {
    const testEmail = 'test@example.com';

    it('should return user when found', async () => {
      const mockUser = { _id: '1', name: 'Test User', email: testEmail, role: 'user' } as UserDocument;
      
      mockRequest.body = { email: testEmail };
      mockUserService.findByEmail.mockResolvedValueOnce(mockUser as any);

      await userController.getByEmail(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(testEmail);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockRequest.body = { email: testEmail };
      mockUserService.findByEmail.mockResolvedValueOnce(null);

      await userController.getByEmail(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(testEmail);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 when service throws error', async () => {
      const error = new Error('Service error');
      mockRequest.body = { email: testEmail };
      mockUserService.findByEmail.mockRejectedValueOnce(error);

      await userController.getByEmail(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user123',
        _id: 'user123',
        email: loginData.email,
        password: 'hashed_password',
        role: 'user'
      } as UserDocument;
      const mockToken = 'jwt_token_123';

      mockRequest.body = loginData;
      mockUserService.findByEmail.mockResolvedValueOnce(mockUser as any);
      mockSecurityService.comparePassword.mockResolvedValueOnce(true);
      mockSecurityService.generateToken.mockResolvedValueOnce(mockToken);

      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockSecurityService.comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(mockSecurityService.generateToken).toHaveBeenCalledWith(mockUser.id, mockUser.email, mockUser.role);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "Login successful", token: mockToken });
    });

    it('should return 404 when user does not exist', async () => {
      mockRequest.body = loginData;
      mockUserService.findByEmail.mockResolvedValueOnce(null);

      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: `User ${loginData.email} doesn't exist` });
    });

    it('should return 400 when password is invalid', async () => {
      const mockUser = {
        id: 'user123',
        email: loginData.email,
        password: 'hashed_password',
        role: 'user'
      } as UserDocument;

      mockRequest.body = loginData;
      mockUserService.findByEmail.mockResolvedValueOnce(mockUser as any);
      mockSecurityService.comparePassword.mockResolvedValueOnce(false);

      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockSecurityService.comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 500 when service throws error', async () => {
      const error = new Error('Service error');
      mockRequest.body = loginData;
      mockUserService.findByEmail.mockRejectedValueOnce(error);

      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
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

    it('should update user successfully', async () => {
      const mockUpdatedUser = { ...updateData, _id: 'user123' } as UserDocument;
      
      mockRequest.params = { email: testEmail };
      mockRequest.body = updateData;
      mockUserService.updateUser.mockResolvedValueOnce(mockUpdatedUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(testEmail, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('should return 400 when email parameter is missing', async () => {
      mockRequest.params = {};
      mockRequest.body = updateData;

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email parameter is required' });
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { email: testEmail };
      mockRequest.body = updateData;
      mockUserService.updateUser.mockResolvedValueOnce(null);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(testEmail, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: `User with email ${testEmail} not found` });
    });

    it('should return 500 when service throws error', async () => {
      const error = new Error('Service error');
      mockRequest.params = { email: testEmail };
      mockRequest.body = updateData;
      mockUserService.updateUser.mockRejectedValueOnce(error);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('deleteUser', () => {
    const testEmail = 'test@example.com';

    it('should delete user successfully', async () => {
      mockRequest.params = { email: testEmail };
      mockUserService.deleteUserByEmail.mockResolvedValueOnce(true);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteUserByEmail).toHaveBeenCalledWith(testEmail);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('should return 400 when email parameter is missing', async () => {
      mockRequest.params = {};

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email parameter is required' });
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { email: testEmail };
      mockUserService.deleteUserByEmail.mockResolvedValueOnce(false);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteUserByEmail).toHaveBeenCalledWith(testEmail);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: `User with email ${testEmail} not found` });
    });

    it('should return 500 when service throws error', async () => {
      const error = new Error('Service error');
      mockRequest.params = { email: testEmail };
      mockUserService.deleteUserByEmail.mockRejectedValueOnce(error);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('getUserProfile', () => {
    const testEmail = 'test@example.com';

    it('should return user profile successfully with password omitted', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: testEmail,
        role: 'user',
        password: 'hashed_password'
      } as UserDocument;

      mockRequest.params = { email: testEmail };
      mockUserService.findByEmail.mockResolvedValueOnce(mockUser as any);

      await userController.getUserProfile(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(testEmail);
      expect(mockUser.password).toBe(''); // Password should be cleared
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 when email parameter is missing', async () => {
      mockRequest.params = {};

      await userController.getUserProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email is required' });
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { email: testEmail };
      mockUserService.findByEmail.mockResolvedValueOnce(null);

      await userController.getUserProfile(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(testEmail);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: `User with email ${testEmail} not found` });
    });

    it('should return 500 when service throws error', async () => {
      const error = new Error('Service error');
      mockRequest.params = { email: testEmail };
      mockUserService.findByEmail.mockRejectedValueOnce(error);

      await userController.getUserProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });
});
