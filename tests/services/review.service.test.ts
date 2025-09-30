import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { reviewService } from '../../src/services/review.service.js';
import { ReviewModel } from '../../src/models/review.model.js';
import { MovieModel } from '../../src/models/movie.model.js';
import { UserModel } from '../../src/models/user.model.js';

// Mock de los modelos
jest.mock('../../src/models/review.model.js', () => ({
  ReviewModel: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock('../../src/models/movie.model', () => ({
  MovieModel: {
    findById: jest.fn(),
  },
}));

jest.mock('../../src/models/user.model', () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

const mockReviewModel = ReviewModel as jest.Mocked<typeof ReviewModel>;
const mockMovieModel = MovieModel as jest.Mocked<typeof MovieModel>;
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('ReviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      const input = {
        movieId: 'movie1',
        userId: 'user1',
        rating: 5,
        comment: 'Great movie!',
      };
      const created = { _id: 'r1', ...input } as any;

      (mockMovieModel.findById as any).mockResolvedValueOnce({ _id: 'movie1' });
      (mockUserModel.findById as any).mockResolvedValueOnce({ _id: 'user1' });
      (mockReviewModel.create as any).mockResolvedValueOnce(created);

      const result = await reviewService.createReview(input as any);

      expect(mockMovieModel.findById).toHaveBeenCalledWith('movie1');
      expect(mockUserModel.findById).toHaveBeenCalledWith('user1');
      expect(mockReviewModel.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(created);
    });

    it('should throw error if movie not found', async () => {
      const input = {
        movieId: 'movie1',
        userId: 'user1',
        rating: 5,
        comment: 'Great movie!',
      };

      (mockMovieModel.findById as any).mockResolvedValueOnce(null);

      await expect(reviewService.createReview(input as any)).rejects.toThrow(
        'Movie with id movie1 not found'
      );
      expect(mockUserModel.findById).not.toHaveBeenCalled();
      expect(mockReviewModel.create).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      const input = {
        movieId: 'movie1',
        userId: 'user1',
        rating: 5,
        comment: 'Great movie!',
      };

      (mockMovieModel.findById as any).mockResolvedValueOnce({ _id: 'movie1' });
      (mockUserModel.findById as any).mockResolvedValueOnce(null);

      await expect(reviewService.createReview(input as any)).rejects.toThrow(
        'User with id user1 not found'
      );
      expect(mockReviewModel.create).not.toHaveBeenCalled();
    });

    it('should throw error on database failure', async () => {
      const input = {
        movieId: 'movie1',
        userId: 'user1',
        rating: 5,
        comment: 'Great movie!',
      };

      (mockMovieModel.findById as any).mockResolvedValueOnce({ _id: 'movie1' });
      (mockUserModel.findById as any).mockResolvedValueOnce({ _id: 'user1' });
      (mockReviewModel.create as any).mockRejectedValueOnce(new Error('Database error'));

      await expect(reviewService.createReview(input as any)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all reviews', async () => {
      const reviews = [
        { _id: 'r1', rating: 5, comment: 'Great!' },
        { _id: 'r2', rating: 4, comment: 'Good' },
      ];

      (mockReviewModel.find as any).mockResolvedValueOnce(reviews);

      const result = await reviewService.findAll();

      expect(mockReviewModel.find).toHaveBeenCalledWith();
      expect(result).toEqual(reviews);
    });

    it('should throw error on database failure', async () => {
      (mockReviewModel.find as any).mockRejectedValueOnce(new Error('Database error'));

      await expect(reviewService.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findReviewById', () => {
    it('should return populated review', async () => {
      const review = { _id: 'r1', rating: 5, comment: 'Great!' };

      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(review);

      (mockReviewModel.findById as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await reviewService.findReviewById('r1');

      expect(mockReviewModel.findById).toHaveBeenCalledWith('r1');
      expect(populateMock).toHaveBeenCalledWith('userId', 'name email');
      expect(result).toEqual(review);
    });

    it('should return null if not found', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(null);

      (mockReviewModel.findById as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await reviewService.findReviewById('rX');
      expect(result).toBeNull();
    });

    it('should throw mapped error on failure', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockRejectedValueOnce(new Error('Database error'));

      (mockReviewModel.findById as any).mockReturnValue({
        populate: populateMock,
      });

      await expect(reviewService.findReviewById('r1')).rejects.toThrow('Error fetching review by ID');
    });
  });

  describe('updateReview', () => {
    it('should update and return review', async () => {
      const updated = { _id: 'r1', rating: 5, comment: 'Updated!' };

      (mockReviewModel.findByIdAndUpdate as any).mockResolvedValueOnce(updated);

      const result = await reviewService.updateReview('r1', { rating: 5, comment: 'Updated!' } as any);

      expect(mockReviewModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'r1',
        { rating: 5, comment: 'Updated!' },
        { new: true }
      );
      expect(result).toEqual(updated);
    });

    it('should return null if review not found', async () => {
      (mockReviewModel.findByIdAndUpdate as any).mockResolvedValueOnce(null);

      const result = await reviewService.updateReview('rX', { rating: 5 } as any);

      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      (mockReviewModel.findByIdAndUpdate as any).mockRejectedValueOnce(new Error('Database error'));

      await expect(reviewService.updateReview('r1', {} as any)).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('should return deleted review when successful', async () => {
      const deleted = { _id: 'r1', rating: 5 };
      (mockReviewModel.findByIdAndDelete as any).mockResolvedValueOnce(deleted);

      const result = await reviewService.delete('r1');

      expect(mockReviewModel.findByIdAndDelete).toHaveBeenCalledWith('r1');
      expect(result).toEqual(deleted);
    });

    it('should return null when review not found', async () => {
      (mockReviewModel.findByIdAndDelete as any).mockResolvedValueOnce(null);

      const result = await reviewService.delete('rX');

      expect(mockReviewModel.findByIdAndDelete).toHaveBeenCalledWith('rX');
      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      (mockReviewModel.findByIdAndDelete as any).mockRejectedValueOnce(new Error('Database error'));

      await expect(reviewService.delete('r1')).rejects.toThrow('Database error');
    });
  });
});
