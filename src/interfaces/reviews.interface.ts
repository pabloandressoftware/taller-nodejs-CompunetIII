export interface ReviewsInput{
    movieId: string; // el id de la pelicula a la cual le esta haciendo la reseña
    userId: string; // el id del usuario que hace la reseña
    rating: number; // vamos a manejar un rating de 1 a 5????
    comment: string;
}

