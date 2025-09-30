import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Request, Response } from 'express';
import { movieController } from '../../src/controllers/movie.controller.js';
import { movieService } from '../../src/services/movie.service.js';
import { reviewService } from '../../src/services/review.service.js';


// Mock del servicio
jest.mock('../../src/services/movie.service.js');
jest.mock('../../src/services/review.service.js', () => ({
  reviewService: {
    findReviewById: jest.fn(),
  }
}));

const mockMovieService = movieService as jest.Mocked<typeof movieService>;
const mockReviewService = reviewService as jest.Mocked<typeof reviewService>;


describe('MovieController', () => {
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

  describe('createMovie', () => {
    it('should create a movie successfully', async () => {
      const movieData = {
        title: 'Test Movie',
        description: 'Desc',
        director: 'Dir',
        releaseDate: new Date('2023-01-01'),
        genre: 'Action',
      };
      const created = { ...movieData, _id: 'm1', userId: 'u1' } as any;

      mockRequest.body = { ...movieData, user: { _id: 'u1' } };
      mockMovieService.createMovie.mockResolvedValueOnce(created);

      await movieController.createMovie(mockRequest as Request, mockResponse as Response);

        expect(mockMovieService.createMovie).toHaveBeenCalledWith(
            expect.objectContaining({ ...movieData, userId: 'u1' })
        );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie created successfully', movie: created });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.body = { title: 'x', user: undefined };

      await movieController.createMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
      expect(mockMovieService.createMovie).not.toHaveBeenCalled();
    });

    it('should return 500 on service error', async () => {
      mockRequest.body = { title: 'x', user: { _id: 'u1' } };
      mockMovieService.createMovie.mockRejectedValueOnce(new Error('boom'));

      await movieController.createMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('getAllMovies', () => {
    it('should return all movies', async () => {
      const movies = [
        { _id: 'm1', title: 'A' },
        { _id: 'm2', title: 'B' },
      ] as any[];

      mockMovieService.findAllMovies.mockResolvedValueOnce(movies);

      await movieController.getAllMovies(mockRequest as Request, mockResponse as Response);

      expect(mockMovieService.findAllMovies).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Movies retrieved successfully',
        count: 2,
        movies,
      });
    });

    it('should return 500 on error', async () => {
      mockMovieService.findAllMovies.mockRejectedValueOnce(new Error('boom'));

      await movieController.getAllMovies(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('getMovieById', () => {
    it('should return movie by id', async () => {
      const movie = { _id: 'm1', title: 'A' } as any;
      mockRequest.params = { id: 'm1' };
      mockMovieService.findMovieById.mockResolvedValueOnce(movie);

      await movieController.getMovieById(mockRequest as Request, mockResponse as Response);

      expect(mockMovieService.findMovieById).toHaveBeenCalledWith('m1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Movie retrieved successfully',
        movie,
      });
    });

    it('should return 400 if id missing', async () => {
      mockRequest.params = {};

      await movieController.getMovieById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie ID is required' });
      expect(mockMovieService.findMovieById).not.toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      mockRequest.params = { id: 'm1' };
      mockMovieService.findMovieById.mockResolvedValueOnce(null);

      await movieController.getMovieById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should return 500 on error', async () => {
      mockRequest.params = { id: 'm1' };
      mockMovieService.findMovieById.mockRejectedValueOnce(new Error('boom'));

      await movieController.getMovieById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('getMyMovies', () => {
    it('should return movies for user', async () => {
      const movies = [{ _id: 'm1', title: 'Mine' }] as any[];
      mockRequest.body = { user: { _id: 'u1' } };
      mockMovieService.findMoviesByUser.mockResolvedValueOnce(movies);

      await movieController.getMyMovies(mockRequest as Request, mockResponse as Response);

      expect(mockMovieService.findMoviesByUser).toHaveBeenCalledWith('u1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User movies retrieved successfully',
        count: 1,
        movies,
      });
    });

    it('should return 401 if unauthenticated', async () => {
      mockRequest.body = { user: undefined };

      await movieController.getMyMovies(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
    });

    it('should return 500 on error', async () => {
      mockRequest.body = { user: { _id: 'u1' } };
      mockMovieService.findMoviesByUser.mockRejectedValueOnce(new Error('boom'));

      await movieController.getMyMovies(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('searchMoviesByTitle', () => {
    it('should return movies by title', async () => {
      const movies = [{ _id: 'm1', title: 'Test Movie' }] as any[];
      mockRequest.query = { title: 'Test' };
      mockMovieService.findMoviesByTitle.mockResolvedValueOnce(movies);

      await movieController.searchMoviesByTitle(mockRequest as Request, mockResponse as Response);

      expect(mockMovieService.findMoviesByTitle).toHaveBeenCalledWith('Test');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Movies found successfully',
        count: 1,
        movies,
      });
    });

    it('should return 400 if title missing', async () => {
      mockRequest.query = {};

      await movieController.searchMoviesByTitle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Title parameter is required' });
    });

    it('should return 500 on error', async () => {
      mockRequest.query = { title: 'x' };
      mockMovieService.findMoviesByTitle.mockRejectedValueOnce(new Error('boom'));

      await movieController.searchMoviesByTitle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('searchMoviesByGenre', () => {
    it('should return movies by genre', async () => {
      const movies = [{ _id: 'm1', genre: 'Action' }] as any[];
      mockRequest.query = { genre: 'Action' };
      mockMovieService.findMoviesByGenre.mockResolvedValueOnce(movies);

      await movieController.searchMoviesByGenre(mockRequest as Request, mockResponse as Response);

      expect(mockMovieService.findMoviesByGenre).toHaveBeenCalledWith('Action');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Movies found successfully',
        count: 1,
        movies,
      });
    });

    it('should return 400 if genre missing', async () => {
      mockRequest.query = {};

      await movieController.searchMoviesByGenre(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Genre parameter is required' });
    });

    it('should return 500 on error', async () => {
      mockRequest.query = { genre: 'Action' };
      mockMovieService.findMoviesByGenre.mockRejectedValueOnce(new Error('boom'));

      await movieController.searchMoviesByGenre(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('updateMovie', () => {
    it('should update as owner', async () => {
      const existing = { _id: 'm1', userId: 'u1', title: 'Old' } as any;
      const updated = { _id: 'm1', userId: 'u1', title: 'New' } as any;

      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' }, title: 'New' };

      mockMovieService.findMovieById.mockResolvedValueOnce(existing);
      mockMovieService.updateMovie.mockResolvedValueOnce(updated);

      await movieController.updateMovie(mockRequest as Request, mockResponse as Response);

      expect(mockMovieService.updateMovie).toHaveBeenCalledWith('m1', mockRequest.body as any);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie updated successfully', movie: updated });
    });

    it('should update as admin', async () => {
      const existing = { _id: 'm1', userId: 'other', title: 'Old' } as any;
      const updated = { _id: 'm1', userId: 'other', title: 'New' } as any;

      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'admin' }, title: 'New' };

      mockMovieService.findMovieById.mockResolvedValueOnce(existing);
      mockMovieService.updateMovie.mockResolvedValueOnce(updated);

      await movieController.updateMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if id missing', async () => {
      mockRequest.params = {};

      await movieController.updateMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie ID is required' });
    });

    it('should return 404 if not found', async () => {
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockMovieService.findMovieById.mockResolvedValueOnce(null);

      await movieController.updateMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should return 403 if not owner nor admin', async () => {
      const existing = { _id: 'm1', userId: 'other' } as any;
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };

      mockMovieService.findMovieById.mockResolvedValueOnce(existing);

      await movieController.updateMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'You can only update your own movies' });
    });

    it('should return 500 on error', async () => {
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockMovieService.findMovieById.mockRejectedValueOnce(new Error('boom'));

      await movieController.updateMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('deleteMovie', () => {
    it('should delete as owner', async () => {
      const existing = { _id: 'm1', userId: 'u1' } as any;
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };

      mockMovieService.findMovieById.mockResolvedValueOnce(existing);
      mockMovieService.deleteMovie.mockResolvedValueOnce(true);

      await movieController.deleteMovie(mockRequest as Request, mockResponse as Response);

      expect(mockMovieService.deleteMovie).toHaveBeenCalledWith('m1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie deleted successfully' });
    });

    it('should delete as admin', async () => {
      const existing = { _id: 'm1', userId: 'other' } as any;
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'admin' } };

      mockMovieService.findMovieById.mockResolvedValueOnce(existing);
      mockMovieService.deleteMovie.mockResolvedValueOnce(true);

      await movieController.deleteMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if id missing', async () => {
      mockRequest.params = {};

      await movieController.deleteMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie ID is required' });
    });

    it('should return 404 if not found', async () => {
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockMovieService.findMovieById.mockResolvedValueOnce(null);

      await movieController.deleteMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should return 403 if not owner nor admin', async () => {
      const existing = { _id: 'm1', userId: 'other' } as any;
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockMovieService.findMovieById.mockResolvedValueOnce(existing);

      await movieController.deleteMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'You can only delete your own movies' });
    });

    it('should return 500 if deletion returns false', async () => {
      const existing = { _id: 'm1', userId: 'u1' } as any;
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockMovieService.findMovieById.mockResolvedValueOnce(existing);
      mockMovieService.deleteMovie.mockResolvedValueOnce(false);

      await movieController.deleteMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to delete movie' });
    });

    it('should return 500 on service error', async () => {
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };
      mockMovieService.findMovieById.mockRejectedValueOnce(new Error('boom'));

      await movieController.deleteMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('addReviewToMovie', () => {
    it('should add review', async () => {
      const movie = { _id: 'm1', reviews: ['r1'] } as any;
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { reviewId: 'r1' };
      mockMovieService.addReviewToMovie.mockResolvedValueOnce(movie);

      await movieController.addReviewToMovie(mockRequest as Request, mockResponse as Response);

      expect(mockMovieService.addReviewToMovie).toHaveBeenCalledWith('m1', 'r1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Review added to movie successfully',
        movie,
      });
    });

    it('should return 400 if movie id missing', async () => {
      mockRequest.params = {};

      await movieController.addReviewToMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie ID is required' });
    });

    it('should return 400 if review id missing', async () => {
      mockRequest.params = { id: 'm1' };
      mockRequest.body = {};

      await movieController.addReviewToMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review ID is required' });
    });

    it('should return 404 if movie not found', async () => {
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { reviewId: 'r1' };
      mockMovieService.addReviewToMovie.mockResolvedValueOnce(null);

      await movieController.addReviewToMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should return 500 on error', async () => {
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { reviewId: 'r1' };
      mockMovieService.addReviewToMovie.mockRejectedValueOnce(new Error('boom'));

      await movieController.addReviewToMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('removeReviewFromMovie', () => {
    it('should remove review successfully as admin', async () => {
      const movie = { _id: 'm1', reviews: [] } as any;
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { 
        reviewId: 'r1', 
        user: { _id: 'u1', role: 'admin' } 
      };
      
      mockMovieService.removeReviewFromMovie.mockResolvedValueOnce(movie);

      await movieController.removeReviewFromMovie(mockRequest as Request, mockResponse as Response);

      expect(mockMovieService.removeReviewFromMovie).toHaveBeenCalledWith('m1', 'r1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Review removed from movie successfully',
        movie,
      });
    });

    it('should remove review successfully as review owner', async () => {
      const movie = { _id: 'm1', reviews: [] } as any;
      const review = { _id: 'r1', userId: 'u1' } as any;
      
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { 
        reviewId: 'r1', 
        user: { _id: 'u1', role: 'user' } 
      };
      
      mockReviewService.findReviewById.mockResolvedValueOnce(review);
      mockMovieService.removeReviewFromMovie.mockResolvedValueOnce(movie);

      await movieController.removeReviewFromMovie(mockRequest as Request, mockResponse as Response);

      expect(mockReviewService.findReviewById).toHaveBeenCalledWith('r1');
      expect(mockMovieService.removeReviewFromMovie).toHaveBeenCalledWith('m1', 'r1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if movie id missing', async () => {
      mockRequest.params = {};

      await movieController.removeReviewFromMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie ID is required' });
    });

    it('should return 400 if review id missing', async () => {
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { user: { _id: 'u1', role: 'user' } };

      await movieController.removeReviewFromMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review ID is required' });
    });

    it('should return 404 if review not found', async () => {
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { 
        reviewId: 'r1', 
        user: { _id: 'u1', role: 'user' } 
      };
      
      mockReviewService.findReviewById.mockResolvedValueOnce(null);

      await movieController.removeReviewFromMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review not found' });
    });

    it('should return 403 if user is not review owner', async () => {
      const review = { _id: 'r1', userId: 'other-user' } as any;
      
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { 
        reviewId: 'r1', 
        user: { _id: 'u1', role: 'user' } 
      };
      
      mockReviewService.findReviewById.mockResolvedValueOnce(review);

      await movieController.removeReviewFromMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'You can only remove your own reviews from a movie' 
      });
    });

    it('should return 404 if movie not found', async () => {
      const review = { _id: 'r1', userId: 'u1' } as any;
      
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { 
        reviewId: 'r1', 
        user: { _id: 'u1', role: 'user' } 
      };
      
      mockReviewService.findReviewById.mockResolvedValueOnce(review);
      mockMovieService.removeReviewFromMovie.mockResolvedValueOnce(null);

      await movieController.removeReviewFromMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should return 500 on error', async () => {
      mockRequest.params = { id: 'm1' };
      mockRequest.body = { 
        reviewId: 'r1', 
        user: { _id: 'u1', role: 'admin' } 
      };
      
      mockMovieService.removeReviewFromMovie.mockRejectedValueOnce(new Error('boom'));

      await movieController.removeReviewFromMovie(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });
});
