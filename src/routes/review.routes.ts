import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { auth } from "../middlewares/auth.middleware";


export const reviewRouter = Router();


// Crear una reseña
reviewRouter.post('/', auth, reviewController.create);

// Obtener todas las reseñas
reviewRouter.get('/', auth, reviewController.findAllReviews);

// Eliminar una reseña
reviewRouter.delete('/:id', auth, reviewController.deleteReview);

// Actualizar una reseña
reviewRouter.put('/:id', auth, reviewController.updateReview);
