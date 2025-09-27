export interface MoviesInput{
    title: string;
    description: string;
    director: string;
    releaseDate: Date;
    genre: string;
    reviews?: string[]; //es opcional o obligatorioi

}

export interface MoviesInputUpdate{
    title?: string;
    description?: string;
    director?: string;
    releaseDate?: Date;
    genre?: string;
    reviews?: string[];
}

