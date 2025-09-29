import mongoose from "mongoose";
import { ReviewsInput } from "../interfaces";

export interface ReviewDocument extends ReviewsInput, mongoose.Document { }

const reviewSchema = new mongoose.Schema({
  movieId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie',
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  rating: { type: Number, required: true },
  comment: { type: String, required: true }
}, {
  timestamps: true // IMP: Agrega createdAt y updatedAt automaticamente
});

export const ReviewModel = mongoose.model<ReviewDocument>('Review', reviewSchema);
export { ReviewsInput };
