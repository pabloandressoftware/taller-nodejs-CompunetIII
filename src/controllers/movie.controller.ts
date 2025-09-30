import { Request, Response } from 'express';
import { movieService } from '../services/movie.service';
import { MoviesInput } from '../models/movie.model';

class MovieController {

    // Crear una nueva película
    async createMovie(req: Request, res: Response) {
        try {
            const userId = req.body.user?._id;
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            
            const movieData: MoviesInput = {
                ...req.body,
                userId: userId // Obtener el ID del usuario autenticado
            };
            
            const movie = await movieService.createMovie(movieData);
            res.status(201).json({
                message: 'Movie created successfully',
                movie
            });
        } catch (error) {
            console.error('Error in createMovie controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Obtener todas las películas
    async getAllMovies(req: Request, res: Response) {
        try {
            const movies = await movieService.findAllMovies();
            res.status(200).json({
                message: 'Movies retrieved successfully',
                count: movies.length,
                movies
            });
        } catch (error) {
            console.error('Error in getAllMovies controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Obtener película por ID
    async getMovieById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Movie ID is required' });
            }
            
            const movie = await movieService.findMovieById(id);
            
            if (!movie) {
                return res.status(404).json({ message: 'Movie not found' });
            }
            
            res.status(200).json({
                message: 'Movie retrieved successfully',
                movie
            });
        } catch (error) {
            console.error('Error in getMovieById controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Obtener películas del usuario autenticado
    async getMyMovies(req: Request, res: Response) {
        try {
            console.log(" req.body.user:", req.body.user);
            const userId = req.body.user?._id;
            console.log(" userId:", userId);
            
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            
            const movies = await movieService.findMoviesByUser(userId);
            
            res.status(200).json({
                message: 'User movies retrieved successfully',
                count: movies.length,
                movies
            });
        } catch (error) {
            console.error('Error in getMyMovies controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Buscar películas por título
    async searchMoviesByTitle(req: Request, res: Response) {
        try {
            const { title } = req.query;
            if (!title) {
                return res.status(400).json({ message: 'Title parameter is required' });
            }
            
            const movies = await movieService.findMoviesByTitle(title as string);
            res.status(200).json({
                message: 'Movies found successfully',
                count: movies.length,
                movies
            });
        } catch (error) {
            console.error('Error in searchMoviesByTitle controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Buscar películas por género
    async searchMoviesByGenre(req: Request, res: Response) {
        try {
            const { genre } = req.query;
            if (!genre) {
                return res.status(400).json({ message: 'Genre parameter is required' });
            }
            
            const movies = await movieService.findMoviesByGenre(genre as string);
            res.status(200).json({
                message: 'Movies found successfully',
                count: movies.length,
                movies
            });
        } catch (error) {
            console.error('Error in searchMoviesByGenre controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Actualizar película (solo el propietario o admin)
    async updateMovie(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Movie ID is required' });
            }
            
            const userId = req.body.user._id;
            const userRole = req.body.user.role;
            
            // Verificar que la película existe
            const existingMovie = await movieService.findMovieById(id);
            if (!existingMovie) {
                return res.status(404).json({ message: 'Movie not found' });
            }
            
            // Verificar permisos (solo el propietario o admin puede actualizar)
            if (existingMovie.userId !== userId && userRole !== 'admin') {
                return res.status(403).json({ message: 'You can only update your own movies' });
            }
            
            const updatedMovie = await movieService.updateMovie(id, req.body);
            res.status(200).json({
                message: 'Movie updated successfully',
                movie: updatedMovie
            });
        } catch (error) {
            console.error('Error in updateMovie controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Eliminar película (solo el propietario o admin)
    async deleteMovie(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Movie ID is required' });
            }
            
            const userId = req.body.user._id;
            const userRole = req.body.user.role;
            
            // Verificar que la película existe
            const existingMovie = await movieService.findMovieById(id);
            if (!existingMovie) {
                return res.status(404).json({ message: 'Movie not found' });
            }
            
            // Verificar permisos (solo el propietario o admin puede eliminar)
            if (existingMovie.userId !== userId && userRole !== 'admin') {
                return res.status(403).json({ message: 'You can only delete your own movies' });
            }
            
            const deleted = await movieService.deleteMovie(id);
            if (deleted) {
                res.status(200).json({ message: 'Movie deleted successfully' });
            } else {
                res.status(500).json({ message: 'Failed to delete movie' });
            }
        } catch (error) {
            console.error('Error in deleteMovie controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Agregar reseña a una película
    async addReviewToMovie(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Movie ID is required' });
            }
            
            const { reviewId } = req.body;
            if (!reviewId) {
                return res.status(400).json({ message: 'Review ID is required' });
            }
            
            const movie = await movieService.addReviewToMovie(id, reviewId);
            if (!movie) {
                return res.status(404).json({ message: 'Movie not found' });
            }
            
            res.status(200).json({
                message: 'Review added to movie successfully',
                movie
            });
        } catch (error) {
            console.error('Error in addReviewToMovie controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Eliminar reseña de una película (solo propietario de la reseña o admin)
    async removeReviewFromMovie(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Movie ID is required' });
            }
            
            const { reviewId } = req.body;
            if (!reviewId) {
                return res.status(400).json({ message: 'Review ID is required' });
            }
            const userId = req.body.user?._id;
            const userRole = req.body.user?.role;

            // Si no es admin, validar que el usuario sea dueño de la reseña
            if (userRole !== 'admin') {
                const review = await (await import('../services/review.service')).reviewService.findReviewById(reviewId);
                if (!review) {
                    return res.status(404).json({ message: 'Review not found' });
                }
                const ownerId = (review as any).userId?._id?.toString?.() || (review as any).userId?.toString?.();
                if (ownerId !== userId) {
                    return res.status(403).json({ message: 'You can only remove your own reviews from a movie' });
                }
            }

            const movie = await movieService.removeReviewFromMovie(id, reviewId);
            if (!movie) {
                return res.status(404).json({ message: 'Movie not found' });
            }
            
            res.status(200).json({
                message: 'Review removed from movie successfully',
                movie
            });
        } catch (error) {
            console.error('Error in removeReviewFromMovie controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export const movieController = new MovieController();
