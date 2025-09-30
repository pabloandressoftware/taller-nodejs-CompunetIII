import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Request, Response } from 'express';
import { reviewController } from '../../src/controllers/review.controller.js';
import { reviewService } from '../../src/services/review.service.js';
import { movieService } from '../../src/services/movie.service.js';

// Mock de los servicios
jest.mock('../../src/services/review.service.js');
jest.mock('../../src/services/movie.service.js');

const mockReviewService = reviewService as jest.Mocked<typeof reviewService>;
const mockMovieService = movieService as jest.Mocked<typeof movieService>;

describe('ReviewController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = { body: {}, params: {}, query: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a review successfully', async () => {
      const reviewData = {
        movieId: 'movie1',
        rating: 5,
        comment: 'Great movie!',
      };
      const created = { 
        ...reviewData, 
        _id: 'r1', 
        userId: 'u1' 
      } as any;

      mockRequest.body = { ...reviewData, user: { _id: 'u1' } };
      mockReviewService.createReview.mockResolvedValueOnce(created);
      mockMovieService.addReviewToMovie.mockResolvedValueOnce({} as any);

      await reviewController.create(mockRequest as Request, mockResponse as Response);

      expect(mockReviewService.createReview).toHaveBeenCalledWith(
        expect.objectContaining({ ...reviewData, userId: 'u1' })
      );
      expect(mockMovieService.addReviewToMovie).toHaveBeenCalledWith('movie1', 'r1');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Review created successfully', 
        review: created 
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.body = { rating: 5, comment: 'Test', user: undefined };

      await reviewController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
      expect(mockReviewService.createReview).not.toHaveBeenCalled();
    });

    it('should return 404 if movie not found', async () => {
      mockRequest.body = { 
        movieId: 'movie1', 
        rating: 5, 
        comment: 'Test', 
        user: { _id: 'u1' } 
      };
      mockReviewService.createReview.mockRejectedValueOnce(
        new Error('Movie with id movie1 not found')
      );

      await reviewController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Movie not found',
        message: 'Movie with id movie1 not found'
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.body = { 
        movieId: 'movie1', 
        rating: 5, 
        comment: 'Test', 
        user: { _id: 'u1' } 
      };
      mockReviewService.createReview.mockRejectedValueOnce(
        new Error('User with id u1 not found')
      );

      await reviewController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'User not found',
        message: 'User with id u1 not found'
      });
    });

    it('should return 500 on service error', async () => {
      mockRequest.body = { 
        movieId: 'movie1', 
        rating: 5, 
        comment: 'Test', 
        user: { _id: 'u1' } 
      };
      mockReviewService.createReview.mockRejectedValueOnce(new Error('Database error'));

      await reviewController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('findAllReviews', () => {
    it('should return all reviews', async () => {
      const reviews = [
        { _id: 'r1', rating: 5, comment: 'Great!' },
        { _id: 'r2', rating: 4, comment: 'Good' },
      ] as any[];

      mockReviewService.findAll.mockResolvedValueOnce(reviews);

      await reviewController.findAllReviews(mockRequest as Request, mockResponse as Response);

      expect(mockReviewService.findAll).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Reviews retrieved successfully',
        count: 2,
        review: reviews,
      });
    });

    it('should return 500 on error', async () => {
      mockReviewService.findAll.mockRejectedValueOnce(new Error('Database error'));

      await reviewController.findAllReviews(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('findReviewById', () => {
    it('should return review by id', async () => {
      const review = { _id: 'r1', rating: 5, comment: 'Great!' } as any;
      mockRequest.params = { id: 'r1' };
      mockReviewService.findReviewById.mockResolvedValueOnce(review);

      await reviewController.findReviewById(mockRequest as Request, mockResponse as Response);

      expect(mockReviewService.findReviewById).toHaveBeenCalledWith('r1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Review retrieved successfully',
        review,
      });
    });

    it('should return 400 if id missing', async () => {
      mockRequest.params = {};

      await reviewController.findReviewById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review ID is required' });
      expect(mockReviewService.findReviewById).not.toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      mockRequest.params = { id: 'r1' };
      mockReviewService.findReviewById.mockResolvedValueOnce(null);

      await reviewController.findReviewById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review not found' });
    });

    it('should return 500 on error', async () => {
      mockRequest.params = { id: 'r1' };
      mockReviewService.findReviewById.mockRejectedValueOnce(new Error('Database error'));

      await reviewController.findReviewById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('deleteReview', () => {
    it('should delete as owner', async () => {
      const existing = { _id: 'r1', userId: 'u1' } as any;
      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };

      mockReviewService.findReviewById.mockResolvedValueOnce(existing);
      mockReviewService.delete.mockResolvedValueOnce(existing);

      await reviewController.deleteReview(mockRequest as Request, mockResponse as Response);

      expect(mockReviewService.delete).toHaveBeenCalledWith('r1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review deleted successfully' });
    });

    it('should delete as admin', async () => {
      const existing = { _id: 'r1', userId: 'other' } as any;
      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'admin' } };

      mockReviewService.findReviewById.mockResolvedValueOnce(existing);
      mockReviewService.delete.mockResolvedValueOnce(existing);

      await reviewController.deleteReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if id missing', async () => {
      mockRequest.params = {};

      await reviewController.deleteReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Reviews ID is required' });
    });

    it('should return 404 if not found', async () => {
      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockReviewService.findReviewById.mockResolvedValueOnce(null);

      await reviewController.deleteReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review not found' });
    });

    it('should return 403 if not owner nor admin', async () => {
      const existing = { _id: 'r1', userId: 'other' } as any;
      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockReviewService.findReviewById.mockResolvedValueOnce(existing);

      await reviewController.deleteReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'You can only delete your own reviews' });
    });

    it('should return 500 if deletion returns null', async () => {
      const existing = { _id: 'r1', userId: 'u1' } as any;
      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockReviewService.findReviewById.mockResolvedValueOnce(existing);
      mockReviewService.delete.mockResolvedValueOnce(null);

      await reviewController.deleteReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to delete review' });
    });

    it('should return 500 on service error', async () => {
      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockReviewService.findReviewById.mockRejectedValueOnce(new Error('Database error'));

      await reviewController.deleteReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('updateReview', () => {
    it('should update as owner', async () => {
      const existing = { _id: 'r1', userId: 'u1', rating: 4 } as any;
      const updated = { _id: 'r1', userId: 'u1', rating: 5 } as any;

      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' }, rating: 5 };

      mockReviewService.findReviewById.mockResolvedValueOnce(existing);
      mockReviewService.updateReview.mockResolvedValueOnce(updated);

      await reviewController.updateReview(mockRequest as Request, mockResponse as Response);

      expect(mockReviewService.updateReview).toHaveBeenCalledWith('r1', mockRequest.body as any);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Review updated successfully', 
        review: updated 
      });
    });

    it('should update as admin', async () => {
      const existing = { _id: 'r1', userId: 'other', rating: 4 } as any;
      const updated = { _id: 'r1', userId: 'other', rating: 5 } as any;

      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'admin' }, rating: 5 };

      mockReviewService.findReviewById.mockResolvedValueOnce(existing);
      mockReviewService.updateReview.mockResolvedValueOnce(updated);

      await reviewController.updateReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if id missing', async () => {
      mockRequest.params = {};

      await reviewController.updateReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review ID is required' });
    });

    it('should return 404 if not found', async () => {
      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockReviewService.findReviewById.mockResolvedValueOnce(null);

      await reviewController.updateReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review not found' });
    });

    it('should return 403 if not owner nor admin', async () => {
      const existing = { _id: 'r1', userId: 'other' } as any;
      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };

      mockReviewService.findReviewById.mockResolvedValueOnce(existing);

      await reviewController.updateReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'You can only update your own reviews' });
    });

    it('should return 500 on error', async () => {
      mockRequest.params = { id: 'r1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockReviewService.findReviewById.mockRejectedValueOnce(new Error('Database error'));

      await reviewController.updateReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });
});
