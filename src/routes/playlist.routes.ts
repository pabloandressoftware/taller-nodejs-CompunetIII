import { Router } from "express";
import { movieController } from "../controllers/movie.controller";
import { auth, authorizeRoles } from "../middlewares/auth.middleware";

export const playlistRouter = Router();

// Rutas públicas (sin autenticación)
playlistRouter.get('/test', (req, res) => {
  res.json({ message: 'API funcionando en playlist' });
});

// Obtener todas las películas (público)
playlistRouter.get('/', movieController.getAllMovies);

// Buscar películas por título (público)
playlistRouter.get('/search/title', movieController.searchMoviesByTitle);

// Buscar películas por género (público)
playlistRouter.get('/search/genre', movieController.searchMoviesByGenre);

// Obtener película por ID (público)
playlistRouter.get('/:id', movieController.getMovieById);

// Rutas que requieren autenticación
playlistRouter.use(auth);

// Crear nueva película (usuario autenticado)
playlistRouter.post('/', movieController.createMovie);

// Obtener mis películas (usuario autenticado)
playlistRouter.get('/my/movies', movieController.getMyMovies);

// Actualizar película (solo propietario o admin)
playlistRouter.put('/:id', movieController.updateMovie);

// Eliminar película (solo propietario o admin)
playlistRouter.delete('/:id', movieController.deleteMovie);

// Agregar reseña a película (usuario autenticado)
playlistRouter.post('/:id/reviews', movieController.addReviewToMovie);

// Eliminar reseña de película (usuario autenticado)
playlistRouter.delete('/:id/reviews', movieController.removeReviewFromMovie);