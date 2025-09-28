export interface MoviesInput{
    title: string;
    description: string;
    director: string;
    releaseDate: Date;
    genre: string;
    userId: string; // ID del usuario que subió la película
    reviews?: string[]; // Array de IDs de reseñas
}

export interface MoviesInputUpdate{
    title?: string;
    description?: string;
    director?: string;
    releaseDate?: Date;
    genre?: string;
    userId?: string;
    reviews?: string[];
}

