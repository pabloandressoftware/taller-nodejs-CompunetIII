import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth, authorizeRoles } from '../../src/middlewares/auth.middleware.js';
import { UserRole } from '../../src/models/user.model.js';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      header: jest.fn() as any,
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any
    };
    
    mockNext = jest.fn() as any;
    
    // Mock console.log and console.error to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('auth middleware', () => {
    it('should authenticate valid token successfully', async () => {
      const mockToken = 'Bearer valid_jwt_token';
      const mockDecodedToken = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      (mockRequest.header as jest.Mock).mockReturnValueOnce(mockToken);
      mockJwt.verify.mockReturnValueOnce(mockDecodedToken as never);

      await auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
      expect(mockJwt.verify).toHaveBeenCalledWith('valid_jwt_token', 'secret');
      expect(mockRequest.body).toEqual({ user: mockDecodedToken });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', async () => {
      (mockRequest.header as jest.Mock).mockReturnValueOnce(undefined);

      await auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when empty token is provided', async () => {
      (mockRequest.header as jest.Mock).mockReturnValueOnce('');

      await auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle token without Bearer prefix', async () => {
      const mockToken = 'valid_jwt_token_without_bearer';
      const mockDecodedToken = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      (mockRequest.header as jest.Mock).mockReturnValueOnce(mockToken);
      mockJwt.verify.mockReturnValueOnce(mockDecodedToken as never);

      await auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith('valid_jwt_token_without_bearer', 'secret');
      expect(mockRequest.body).toEqual({ user: mockDecodedToken });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 when token verification fails', async () => {
      const mockToken = 'Bearer invalid_jwt_token';
      const verificationError = new Error('Invalid token');

      (mockRequest.header as jest.Mock).mockReturnValueOnce(mockToken);
      mockJwt.verify.mockImplementationOnce(() => {
        throw verificationError;
      });

      await auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
      expect(mockJwt.verify).toHaveBeenCalledWith('invalid_jwt_token', 'secret');
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle token with extra Bearer text', async () => {
      const mockToken = 'Bearer Bearer valid_token';
      const mockDecodedToken = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      (mockRequest.header as jest.Mock).mockReturnValueOnce(mockToken);
      mockJwt.verify.mockReturnValueOnce(mockDecodedToken as never);

      await auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith('Bearer valid_token', 'secret');
      expect(mockRequest.body).toEqual({ user: mockDecodedToken });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should initialize req.body if it does not exist', async () => {
      const mockToken = 'Bearer valid_jwt_token';
      const mockDecodedToken = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      // Simulate req.body being undefined
      mockRequest.body = undefined;
      (mockRequest.header as jest.Mock).mockReturnValueOnce(mockToken);
      mockJwt.verify.mockReturnValueOnce(mockDecodedToken as never);

      await auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({ user: mockDecodedToken });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should preserve existing req.body properties when adding user', async () => {
      const mockToken = 'Bearer valid_jwt_token';
      const mockDecodedToken = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      mockRequest.body = { existingProperty: 'value' };
      (mockRequest.header as jest.Mock).mockReturnValueOnce(mockToken);
      mockJwt.verify.mockReturnValueOnce(mockDecodedToken as never);

      await auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        existingProperty: 'value',
        user: mockDecodedToken
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('authorizeRoles middleware', () => {
    it('should allow access when user has required role', () => {
      const allowedRoles: UserRole[] = ['admin', 'user'];
      const mockUser = { _id: 'user123', email: 'test@example.com', role: 'admin' };
      
      mockRequest.body = { user: mockUser };
      
      const middleware = authorizeRoles(allowedRoles);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user does not have required role', () => {
      const allowedRoles: UserRole[] = ['admin'];
      const mockUser = { _id: 'user123', email: 'test@example.com', role: 'user' };
      
      mockRequest.body = { user: mockUser };
      
      const middleware = authorizeRoles(allowedRoles);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden, you are a user'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access when user role matches one of multiple allowed roles', () => {
      const allowedRoles: UserRole[] = ['admin', 'user'];
      const mockUser = { _id: 'user123', email: 'test@example.com', role: 'user' };
      
      mockRequest.body = { user: mockUser };
      
      const middleware = authorizeRoles(allowedRoles);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should proceed when user is undefined but call next', () => {
      const allowedRoles: UserRole[] = ['admin'];
      
      mockRequest.body = { user: undefined };
      
      const middleware = authorizeRoles(allowedRoles);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle empty allowed roles array', () => {
      const allowedRoles: UserRole[] = [];
      const mockUser = { _id: 'user123', email: 'test@example.com', role: 'admin' };
      
      mockRequest.body = { user: mockUser };
      
      const middleware = authorizeRoles(allowedRoles);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden, you are a admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle user without role property', () => {
      const allowedRoles: UserRole[] = ['admin'];
      const mockUser = { _id: 'user123', email: 'test@example.com' };
      
      mockRequest.body = { user: mockUser };
      
      const middleware = authorizeRoles(allowedRoles);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden, you are a undefined'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle case-sensitive role matching', () => {
      const allowedRoles: UserRole[] = ['admin'];
      const mockUser = { _id: 'user123', email: 'test@example.com', role: 'Admin' }; // Different case
      
      mockRequest.body = { user: mockUser };
      
      const middleware = authorizeRoles(allowedRoles);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden, you are a Admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete auth flow with role authorization', async () => {
      const mockToken = 'Bearer valid_admin_token';
      const mockDecodedToken = {
        _id: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };
      const allowedRoles: UserRole[] = ['admin'];

      // First, authenticate the token
      (mockRequest.header as jest.Mock).mockReturnValueOnce(mockToken);
      mockJwt.verify.mockReturnValueOnce(mockDecodedToken as never);

      await auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({ user: mockDecodedToken });
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Reset next function for role authorization test
      mockNext.mockClear();

      // Then, authorize the role
      const roleMiddleware = authorizeRoles(allowedRoles);
      roleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject when auth passes but role authorization fails', async () => {
      const mockToken = 'Bearer valid_user_token';
      const mockDecodedToken = {
        _id: 'user123',
        email: 'user@example.com',
        role: 'user'
      };
      const allowedRoles: UserRole[] = ['admin'];

      // First, authenticate the token
      (mockRequest.header as jest.Mock).mockReturnValueOnce(mockToken);
      mockJwt.verify.mockReturnValueOnce(mockDecodedToken as never);

      await auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({ user: mockDecodedToken });
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Reset response mocks for role authorization test
      (mockResponse.status as jest.Mock).mockClear();
      (mockResponse.json as jest.Mock).mockClear();
      mockNext.mockClear();

      // Then, try to authorize the role
      const roleMiddleware = authorizeRoles(allowedRoles);
      roleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden, you are a user'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
