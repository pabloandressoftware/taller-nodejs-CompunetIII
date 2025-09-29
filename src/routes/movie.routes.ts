import { Router } from "express";
import { movieController } from "../controllers/movie.controller";
import { auth, authorizeRoles } from "../middlewares/auth.middleware";

export const playlistRouter = Router();

// Obtener todas las películas (público)
playlistRouter.get('/', movieController.getAllMovies);

// Buscar películas por título (público)
playlistRouter.get('/search/title', movieController.searchMoviesByTitle);

// Buscar películas por género (público)
playlistRouter.get('/search/genre', movieController.searchMoviesByGenre);

// Obtener película por ID (público)
playlistRouter.get('/:id', movieController.getMovieById);

// Crear nueva película (admin)
playlistRouter.post('/', auth, authorizeRoles(['admin']),  movieController.createMovie);

// Actualizar película (admin)
playlistRouter.put('/:id', auth, authorizeRoles(['admin']), movieController.updateMovie);

// Eliminar película (admin)
playlistRouter.delete('/:id', auth, authorizeRoles(['admin']), movieController.deleteMovie);

// Agregar reseña a película (usuario autenticado)
playlistRouter.post('/:id/reviews', auth, movieController.addReviewToMovie);

// Eliminar reseña de película (usuario autenticado)
playlistRouter.delete('/:id/reviews', auth, movieController.removeReviewFromMovie);