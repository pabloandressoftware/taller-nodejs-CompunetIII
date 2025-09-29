import { ReviewsInput } from "../interfaces";
import { ReviewDocument, ReviewModel } from "../models/review.model";

class ReviewService {
  // Crear una nueva pelicula
  async createReview(reviewData: ReviewsInput): Promise<ReviewDocument> {
    try {

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

      const updateReview: ReviewDocument | null = await ReviewModel.findOneAndUpdate({ id }, review, { returnOriginal: false });
      return updateReview;
    } catch (error) {

      console.log("ReviewService ~ UpdateReview ~ error:", error);
      throw error;

    }
  }
}

export const reviewService = new ReviewService();
