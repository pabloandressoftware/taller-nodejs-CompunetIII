import { ReviewDocument } from "../models/review.model";

export interface MoviesInput {
  title: string;
  description: string;
  director: string;
  releaseDate: Date;
  genre: string;
  userId: string; // ID del usuario que subió la película
  reviews?: ReviewDocument[]; // Array de IDs de reseñas
}

export interface MoviesInputUpdate {
  title?: string;
  description?: string;
  director?: string;
  releaseDate?: Date;
  genre?: string;
  userId?: string;
  reviews?: ReviewDocument[];
}

