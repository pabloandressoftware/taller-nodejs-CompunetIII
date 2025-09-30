import { Router } from "express";
import { movieController } from "../controllers/movie.controller.js";
import { auth, authorizeRoles } from "../middlewares/auth.middleware.js";

export const movieRouter = Router();

// Obtener todas las películas (público)
movieRouter.get('/', movieController.getAllMovies);

// Buscar películas por título (público)
movieRouter.get('/search/title', movieController.searchMoviesByTitle);

// Buscar películas por género (público)
movieRouter.get('/search/genre', movieController.searchMoviesByGenre);

// Obtener película por ID (público)
movieRouter.get('/:id', movieController.getMovieById);

// Crear nueva película (admin)
movieRouter.post('/', auth, authorizeRoles(['admin']),  movieController.createMovie);

// Actualizar película (admin)
movieRouter.put('/:id', auth, authorizeRoles(['admin']), movieController.updateMovie);

// Eliminar película (admin)
movieRouter.delete('/:id', auth, authorizeRoles(['admin']), movieController.deleteMovie);
