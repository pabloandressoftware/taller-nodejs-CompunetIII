import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { movieService } from '../../src/services/movie.service';
import { MovieModel } from '../../src/models/movie.model';

// Mock MovieModel
jest.mock('../../src/models/movie.model', () => ({
  MovieModel: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

const mockMovieModel = MovieModel as jest.Mocked<typeof MovieModel>;

describe('MovieService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------- createMovie ----------
  describe('createMovie', () => {
    it('should create a movie successfully', async () => {
      const input = {
        title: 'T',
        description: 'D',
        director: 'Dir',
        releaseDate: new Date('2023-01-01'),
        genre: 'Action',
        userId: 'u1' as any,
      };
      const created = { _id: 'm1', ...input } as any;

      (mockMovieModel.create as any).mockResolvedValueOnce(created);

      const result = await movieService.createMovie(input as any);

      expect(mockMovieModel.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(created);
    });

    it('should throw mapped error when model fails', async () => {
      (mockMovieModel.create as any).mockRejectedValueOnce(new Error('db fail'));

      await expect(movieService.createMovie({} as any)).rejects.toThrow('Error creating movie');
    });
  });

  // ---------- findAllMovies ----------
  describe('findAllMovies', () => {
    it('should return populated movies list', async () => {
      const movies = [{ _id: 'm1' }, { _id: 'm2' }];

      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(movies);

      (mockMovieModel.find as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await movieService.findAllMovies();

      expect(mockMovieModel.find).toHaveBeenCalledWith();
      expect(result).toEqual(movies);
    });

    it('should throw mapped error on failure', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockRejectedValueOnce(new Error('db fail'));

      (mockMovieModel.find as any).mockReturnValue({
        populate: populateMock,
      });

      await expect(movieService.findAllMovies()).rejects.toThrow('Error fetching movies');
    });
  });

  // ---------- findMovieById ----------
  describe('findMovieById', () => {
    it('should return populated movie', async () => {
      const movie = { _id: 'm1', title: 'A' };

      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(movie);

      (mockMovieModel.findById as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await movieService.findMovieById('m1');

      expect(mockMovieModel.findById).toHaveBeenCalledWith('m1');
      expect(result).toEqual(movie);
    });

    it('should return null if not found', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(null);

      (mockMovieModel.findById as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await movieService.findMovieById('mX');
      expect(result).toBeNull();
    });

    it('should throw mapped error on failure', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockRejectedValueOnce(new Error('db fail'));

      (mockMovieModel.findById as any).mockReturnValue({
        populate: populateMock,
      });

      await expect(movieService.findMovieById('m1')).rejects.toThrow('Error fetching movie by ID');
    });
  });

  // ---------- findMoviesByUser ----------
  describe('findMoviesByUser', () => {
    it('should return movies for a user', async () => {
      const movies = [{ _id: 'm1', userId: 'u1' }];

      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(movies);

      (mockMovieModel.find as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await movieService.findMoviesByUser('u1');

      expect(mockMovieModel.find).toHaveBeenCalledWith({ userId: 'u1' });
      expect(result).toEqual(movies);
    });

    it('should throw mapped error on failure', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockRejectedValueOnce(new Error('db fail'));

      (mockMovieModel.find as any).mockReturnValue({
        populate: populateMock,
      });

      await expect(movieService.findMoviesByUser('u1')).rejects.toThrow('Error fetching movies by user');
    });
  });

  // ---------- findMoviesByTitle ----------
  describe('findMoviesByTitle', () => {
    it('should return movies matching title (case-insensitive)', async () => {
      const movies = [{ _id: 'm1', title: 'Test' }];

      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(movies);

      (mockMovieModel.find as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await movieService.findMoviesByTitle('Test');

      expect(mockMovieModel.find).toHaveBeenCalledWith({
        title: { $regex: 'Test', $options: 'i' },
      });
      expect(result).toEqual(movies);
    });

    it('should throw mapped error on failure', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockRejectedValueOnce(new Error('db fail'));

      (mockMovieModel.find as any).mockReturnValue({
        populate: populateMock,
      });

      await expect(movieService.findMoviesByTitle('x')).rejects.toThrow('Error searching movies by title');
    });
  });

  // ---------- findMoviesByGenre ----------
  describe('findMoviesByGenre', () => {
    it('should return movies matching genre (case-insensitive)', async () => {
      const movies = [{ _id: 'm1', genre: 'Action' }];

      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(movies);

      (mockMovieModel.find as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await movieService.findMoviesByGenre('Action');

      expect(mockMovieModel.find).toHaveBeenCalledWith({
        genre: { $regex: 'Action', $options: 'i' },
      });
      expect(result).toEqual(movies);
    });

    it('should throw mapped error on failure', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockRejectedValueOnce(new Error('db fail'));

      (mockMovieModel.find as any).mockReturnValue({
        populate: populateMock,
      });

      await expect(movieService.findMoviesByGenre('Action')).rejects.toThrow('Error searching movies by genre');
    });
  });

  // ---------- updateMovie ----------
  describe('updateMovie', () => {
    it('should update and return populated movie', async () => {
      const updated = { _id: 'm1', title: 'New' };

      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(updated);

      (mockMovieModel.findByIdAndUpdate as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await movieService.updateMovie('m1', { title: 'New' });

      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith('m1', { title: 'New' }, { new: true });
      expect(result).toEqual(updated);
    });

    it('should throw mapped error on failure', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockRejectedValueOnce(new Error('db fail'));

      (mockMovieModel.findByIdAndUpdate as any).mockReturnValue({
        populate: populateMock,
      });

      await expect(movieService.updateMovie('m1', {})).rejects.toThrow('Error updating movie');
    });
  });

  // ---------- deleteMovie ----------
  describe('deleteMovie', () => {
    it('should return true when a movie is deleted', async () => {
      (mockMovieModel.findByIdAndDelete as any).mockResolvedValueOnce({ _id: 'm1' });

      const result = await movieService.deleteMovie('m1');

      expect(mockMovieModel.findByIdAndDelete).toHaveBeenCalledWith('m1');
      expect(result).toBe(true);
    });

    it('should return false when no movie is deleted', async () => {
      (mockMovieModel.findByIdAndDelete as any).mockResolvedValueOnce(null);

      const result = await movieService.deleteMovie('mX');

      expect(mockMovieModel.findByIdAndDelete).toHaveBeenCalledWith('mX');
      expect(result).toBe(false);
    });

    it('should throw mapped error on failure', async () => {
      (mockMovieModel.findByIdAndDelete as any).mockRejectedValueOnce(new Error('db fail'));

      await expect(movieService.deleteMovie('m1')).rejects.toThrow('Error deleting movie');
    });
  });

  // ---------- addReviewToMovie ----------
  describe('addReviewToMovie', () => {
    it('should push review and return populated movie', async () => {
      const movie = { _id: 'm1', reviews: ['r1'] };

      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(movie);

      (mockMovieModel.findByIdAndUpdate as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await movieService.addReviewToMovie('m1', 'r1');

      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'm1',
        { $push: { reviews: 'r1' } },
        { new: true }
      );
      expect(result).toEqual(movie);
    });

    it('should throw mapped error on failure', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockRejectedValueOnce(new Error('db fail'));

      (mockMovieModel.findByIdAndUpdate as any).mockReturnValue({
        populate: populateMock,
      });

      await expect(movieService.addReviewToMovie('m1', 'r1')).rejects.toThrow('Error adding review to movie');
    });
  });

  // ---------- removeReviewFromMovie ----------
  describe('removeReviewFromMovie', () => {
    it('should pull review and return populated movie', async () => {
      const movie = { _id: 'm1', reviews: [] };

      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockResolvedValueOnce(movie);

      (mockMovieModel.findByIdAndUpdate as any).mockReturnValue({
        populate: populateMock,
      });

      const result = await movieService.removeReviewFromMovie('m1', 'r1');

      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'm1',
        { $pull: { reviews: 'r1' } },
        { new: true }
      );
      expect(result).toEqual(movie);
    });

    it('should throw mapped error on failure', async () => {
      const populateMock = jest.fn() as jest.MockedFunction<any>;
      populateMock.mockRejectedValueOnce(new Error('db fail'));

      (mockMovieModel.findByIdAndUpdate as any).mockReturnValue({
        populate: populateMock,
      });

      await expect(movieService.removeReviewFromMovie('m1', 'r1')).rejects.toThrow('Error removing review from movie');
    });
  });
});