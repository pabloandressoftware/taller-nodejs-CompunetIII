import { Request, Response } from "express";
import { ReviewsInput } from '../models/review.model.js';
import { reviewService } from "../services/review.service.js";
import { movieService } from "../services/movie.service.js";

class ReviewController {

  async create(req: Request, res: Response) {
    try {

      const userId = req.body.user?._id;
      if (!userId) {

        return res.status(401).json({ message: 'User not authenticated' });

      }

      const reviewData: ReviewsInput = {
        ...req.body,
        userId: userId // Obtener el ID del usuario autenticado
      };

      // 1. Crear la reseña
      const review = await reviewService.createReview(reviewData);

      // 2. Agregar la reseña a la película
      if (review && (review as any).movieId) {
        await movieService.addReviewToMovie(
          (review as any).movieId.toString(),
          (review as any)._id.toString()
        );
      }

      res.status(201).json({
        message: 'Review created successfully',
        review
      });

    } catch (error) {

      console.error('Error in createReview controller:', error);
      
      // Manejar errores de validación específicos
      if (error instanceof Error) {
        if (error.message.includes('Movie with id') && error.message.includes('not found')) {
          return res.status(404).json({ 
            error: 'Movie not found',
            message: error.message 
          });
        }
        if (error.message.includes('User with id') && error.message.includes('not found')) {
          return res.status(404).json({ 
            error: 'User not found',
            message: error.message 
          });
        }
      }
      
      res.status(500).json({ error: 'Internal Server Error' });

    }
  }

  async findAllReviews(req: Request, res: Response) {
    try {

      const review = await reviewService.findAll();
      res.status(200).json({

        message: 'Reviews retrieved successfully',
        count: review.length,
        review
      });

    } catch (error) {

      console.error('Error in findAllReviews controller:', error);
      res.status(500).json({ error: 'Internal Server Error' });

    }
  }

  async findReviewById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Review ID is required' });
      }

      const review = await reviewService.findReviewById(id);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      res.status(200).json({
        message: 'Review retrieved successfully',
        review
      });
    } catch (error) {
      console.error('Error in findReviewById controller:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Reviews ID is required' });
      }

      const userId = req.body.user._id;
      const userRole = req.body.user.role;

      // Verificar que review existe
      const existingReviews = await reviewService.findReviewById(id);
      if (!existingReviews) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Verificar permisos (solo el propietario o admin puede eliminar)
      const ownerId = (existingReviews as any).userId?._id?.toString?.() || (existingReviews as any).userId?.toString?.();
      console.log('Debug deleteReview:', {
        userId: userId,
        ownerId: ownerId,
        userRole: userRole,
        reviewUserId: existingReviews.userId,
        isOwner: ownerId === userId,
        isAdmin: userRole === 'admin'
      });
      
      if (ownerId !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: 'You can only delete your own reviews' });
      }

      const deleted = await reviewService.delete(id);
      if (deleted) {
        res.status(200).json({ message: 'Review deleted successfully' });
      } else {
        res.status(500).json({ message: 'Failed to delete review' });
      }
    } catch (error) {
      console.error('Error in deleteReview controller:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  async updateReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Review ID is required' });
      }

      const userId = req.body.user._id;
      const userRole = req.body.user.role;

      // Verificar que la película existe
      const existingReview = await reviewService.findReviewById(id);
      if (!existingReview) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Verificar permisos (solo el propietario o admin puede actualizar)
      const ownerId = (existingReview as any).userId?._id?.toString?.() || (existingReview as any).userId?.toString?.();
      console.log('Debug updateReview:', {
        userId: userId,
        ownerId: ownerId,
        userRole: userRole,
        reviewUserId: existingReview.userId,
        isOwner: ownerId === userId,
        isAdmin: userRole === 'admin'
      });
      
      if (ownerId !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: 'You can only update your own reviews' });
      }

      const updatedReview = await reviewService.updateReview(id, req.body);
      res.status(200).json({
        message: 'Review updated successfully',
        review: updatedReview
      });
    } catch (error) {
      console.error('Error in updateReview controller:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const reviewController = new ReviewController();
