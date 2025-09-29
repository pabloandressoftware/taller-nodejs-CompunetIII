import { Request, Response } from "express";
import { ReviewsInput } from '../models/review.model';
import { reviewService } from "../services/review.service";

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

      const review = await reviewService.createReview(reviewData);
      res.status(201).json({
        message: 'Review created successfully',
        review
      });

    } catch (error) {

      console.error('Error in createReview controller:', error);
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
      if (existingReviews.userId !== userId && userRole !== 'admin') {
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
      if (existingReview.userId !== userId && userRole !== 'admin') {
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
