import { ReviewsInput } from "../interfaces";
import { ReviewDocument, ReviewModel } from "../models/review.model";
import { MovieModel } from "../models/movie.model";
import { UserModel } from "../models/user.model";

class ReviewService {
  // Crear una nueva pelicula
  async createReview(reviewData: ReviewsInput): Promise<ReviewDocument> {
    try {
      // Validar que la película existe
      const movieExists = await MovieModel.findById(reviewData.movieId);
      if (!movieExists) {
        throw new Error(`Movie with id ${reviewData.movieId} not found`);
      }

      // Validar que el usuario existe
      const userExists = await UserModel.findById(reviewData.userId);
      if (!userExists) {
        throw new Error(`User with id ${reviewData.userId} not found`);
      }

      const createReview = await ReviewModel.create(reviewData);
      return createReview;

    } catch (error) {
      console.log("ReviewService ~ createReview ~ error: ", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {

      const removeReview = await ReviewModel.findByIdAndDelete(id);
      return removeReview;

    } catch (error) {
      console.log("ReviewService ~ deleteReview ~ error:", error);
      throw error;

    }
  }

  async findAll(): Promise<ReviewDocument[]> {
    try {

      const reviews: ReviewDocument[] = await ReviewModel.find();
      return reviews;

    } catch (error) {

      console.log("ReviewService ~ findAllReview ~ error:", error);
      throw error;

    }
  }

  async findReviewById(id: string): Promise<ReviewDocument | null> {

    try {
      const review = await ReviewModel.findById(id).populate('userId', 'name email');
      return review;
    } catch (error) {
      throw new Error('Error fetching review by ID');
    }
  }

  async updateReview(id: string, review: ReviewsInput) {
    try {
      const updatedReview: ReviewDocument | null = await ReviewModel.findByIdAndUpdate(
        id,
        review,
        { new: true }
      );
      return updatedReview;
    } catch (error) {

      console.log("ReviewService ~ UpdateReview ~ error:", error);
      throw error;

    }
  }
}

export const reviewService = new ReviewService();
