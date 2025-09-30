import { MovieDocument, MovieModel, MoviesInput } from '../models/movie.model.js';

class MovieService {

  // Crear una nueva película
  async createMovie(movieData: MoviesInput): Promise<MovieDocument> {
    try {
      const createdMovie = await MovieModel.create(movieData);
      return createdMovie;
    } catch (error) {
      throw new Error('Error creating movie');
    }
  }

  // Obtener todas las películas
  async findAllMovies(): Promise<MovieDocument[]> {
    try {
      const movies: MovieDocument[] = await MovieModel.find().populate('userId', 'name email');
      return movies;
    } catch (error) {
      throw new Error('Error fetching movies');
    }
  }

  // Obtener película por ID
  async findMovieById(id: string): Promise<MovieDocument | null> {
    try {
      const movie = await MovieModel.findById(id).populate('userId', 'name email');
      return movie;
    } catch (error) {
      throw new Error('Error fetching movie by ID');
    }
  }

  // Obtener películas por usuario
  async findMoviesByUser(userId: string): Promise<MovieDocument[]> {
    try {
      const movies: MovieDocument[] = await MovieModel.find({ userId }).populate('userId', 'name email');
      return movies;
    } catch (error) {
      throw new Error('Error fetching movies by user');
    }
  }

  // Buscar películas por título
  async findMoviesByTitle(title: string): Promise<MovieDocument[]> {
    try {
      const movies: MovieDocument[] = await MovieModel.find({
        title: { $regex: title, $options: 'i' }
      }).populate('userId', 'name email');
      return movies;
    } catch (error) {
      throw new Error('Error searching movies by title');
    }
  }

  // Buscar películas por género
  async findMoviesByGenre(genre: string): Promise<MovieDocument[]> {
    try {
      const movies: MovieDocument[] = await MovieModel.find({
        genre: { $regex: genre, $options: 'i' }
      }).populate('userId', 'name email');
      return movies;
    } catch (error) {
      throw new Error('Error searching movies by genre');
    }
  }

  // Actualizar película
  async updateMovie(id: string, movieData: Partial<MoviesInput>): Promise<MovieDocument | null> {
    try {
      const updatedMovie = await MovieModel.findByIdAndUpdate(
        id,
        movieData,
        { new: true }
      ).populate('userId', 'name email');
      return updatedMovie;
    } catch (error) {
      throw new Error('Error updating movie');
    }
  }

  // Eliminar película
  async deleteMovie(id: string): Promise<boolean> {
    try {
      const deletedMovie = await MovieModel.findByIdAndDelete(id);
      return deletedMovie !== null;
    } catch (error) {
      throw new Error('Error deleting movie');
    }
  }

  //IMP: revisar que de debe modificar de este metodo
  // Agregar reseña a una película
  async addReviewToMovie(movieId: string, reviewId: string): Promise<MovieDocument | null> {
    try {
      const movie = await MovieModel.findByIdAndUpdate(
        movieId,
        { $push: { reviews: reviewId } },
        { new: true }
      ).populate('userId', 'name email');
      return movie;
    } catch (error) {
      throw new Error('Error adding review to movie');
    }
  }

  // Eliminar reseña de una película
  async removeReviewFromMovie(movieId: string, reviewId: string): Promise<MovieDocument | null> {
    try {
      const movie = await MovieModel.findByIdAndUpdate(
        movieId,
        { $pull: { reviews: reviewId } },
        { new: true }
      ).populate('userId', 'name email');
      return movie;
    } catch (error) {
      throw new Error('Error removing review from movie');
    }
  }
}

export const movieService = new MovieService();
