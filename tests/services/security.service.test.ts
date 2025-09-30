import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { securityService } from '../../src/services/security.service.js';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Mock mongoose
jest.mock('mongoose');

describe('SecurityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('encryptPassword', () => {
    it('should encrypt password successfully', async () => {
      const plainPassword = 'mypassword123';
      const hashedPassword = 'hashed_password_123';

      mockBcrypt.hash.mockResolvedValueOnce(hashedPassword as never);

      const result = await securityService.encryptPassword(plainPassword);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should throw error when bcrypt fails', async () => {
      const plainPassword = 'mypassword123';
      const error = new Error('Bcrypt error');

      mockBcrypt.hash.mockRejectedValueOnce(error as never);

      await expect(securityService.encryptPassword(plainPassword)).rejects.toThrow('Bcrypt error');
      expect(mockBcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
    });

    it('should handle empty password', async () => {
      const emptyPassword = '';
      const hashedPassword = 'hashed_empty';

      mockBcrypt.hash.mockResolvedValueOnce(hashedPassword as never);

      const result = await securityService.encryptPassword(emptyPassword);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(emptyPassword, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token successfully', async () => {
      const mockId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const email = 'test@example.com';
      const role = 'user';
      const expectedToken = 'jwt_token_123';

      mockJwt.sign.mockReturnValueOnce(expectedToken as never);

      const result = await securityService.generateToken(mockId, email, role);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { _id: mockId, email, role },
        'secret',
        { expiresIn: '1h' }
      );
      expect(result).toBe(expectedToken);
    });

    it('should handle admin role', async () => {
      const mockId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439012');
      const email = 'admin@example.com';
      const role = 'admin';
      const expectedToken = 'jwt_admin_token';

      mockJwt.sign.mockReturnValueOnce(expectedToken as never);

      const result = await securityService.generateToken(mockId, email, role);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { _id: mockId, email, role },
        'secret',
        { expiresIn: '1h' }
      );
      expect(result).toBe(expectedToken);
    });

    it('should throw error when JWT signing fails', async () => {
      const mockId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439013');
      const email = 'test@example.com';
      const role = 'user';
      const error = new Error('JWT signing failed');

      mockJwt.sign.mockImplementationOnce(() => {
        throw error;
      });

      await expect(securityService.generateToken(mockId, email, role)).rejects.toThrow('JWT signing failed');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { _id: mockId, email, role },
        'secret',
        { expiresIn: '1h' }
      );
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      const incomingPassword = 'mypassword123';
      const currentPassword = 'hashed_password_123';

      mockBcrypt.compare.mockResolvedValueOnce(true as never);

      const result = await securityService.comparePassword(incomingPassword, currentPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(incomingPassword, currentPassword);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      const incomingPassword = 'wrongpassword';
      const currentPassword = 'hashed_password_123';

      mockBcrypt.compare.mockResolvedValueOnce(false as never);

      const result = await securityService.comparePassword(incomingPassword, currentPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(incomingPassword, currentPassword);
      expect(result).toBe(false);
    });

    it('should throw error when bcrypt compare fails', async () => {
      const incomingPassword = 'mypassword123';
      const currentPassword = 'hashed_password_123';
      const error = new Error('Bcrypt compare error');

      mockBcrypt.compare.mockRejectedValueOnce(error as never);

      await expect(securityService.comparePassword(incomingPassword, currentPassword)).rejects.toThrow('Bcrypt compare error');
      expect(mockBcrypt.compare).toHaveBeenCalledWith(incomingPassword, currentPassword);
    });

    it('should handle empty passwords', async () => {
      const incomingPassword = '';
      const currentPassword = '';

      mockBcrypt.compare.mockResolvedValueOnce(false as never);

      const result = await securityService.comparePassword(incomingPassword, currentPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(incomingPassword, currentPassword);
      expect(result).toBe(false);
    });

    it('should handle null or undefined passwords gracefully', async () => {
      const incomingPassword = 'test';
      const currentPassword = 'hashed';

      mockBcrypt.compare.mockResolvedValueOnce(false as never);

      const result = await securityService.comparePassword(incomingPassword, currentPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(incomingPassword, currentPassword);
      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete authentication flow', async () => {
      const plainPassword = 'userpassword123';
      const hashedPassword = 'hashed_userpassword123';
      const mockId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439014');
      const email = 'user@example.com';
      const role = 'user';
      const token = 'complete_flow_token';

      // Mock password encryption
      mockBcrypt.hash.mockResolvedValueOnce(hashedPassword as never);

      // Mock password comparison
      mockBcrypt.compare.mockResolvedValueOnce(true as never);

      // Mock token generation
      mockJwt.sign.mockReturnValueOnce(token as never);

      // Encrypt password
      const encrypted = await securityService.encryptPassword(plainPassword);
      expect(encrypted).toBe(hashedPassword);

      // Compare password
      const isMatch = await securityService.comparePassword(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);

      // Generate token
      const generatedToken = await securityService.generateToken(mockId, email, role);
      expect(generatedToken).toBe(token);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { _id: mockId, email, role },
        'secret',
        { expiresIn: '1h' }
      );
    });
  });
});
