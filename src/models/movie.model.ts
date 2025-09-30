
import mongoose from "mongoose";
import { MoviesInput } from '../interfaces/movies.interface.js';

export interface MovieDocument extends MoviesInput, mongoose.Document {}

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    director: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    genre: { type: String, required: true },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    }, // ID del usuario que subió la película
    reviews: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Review' 
    }] // Array de IDs de reseñas
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

export const MovieModel = mongoose.model<MovieDocument>('Movie', movieSchema);

export { MoviesInput };
