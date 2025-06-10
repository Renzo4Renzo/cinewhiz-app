import type { Models } from "appwrite";

export type Movie = {
  id: number;
  title: string;
  vote_average: number;
  poster_path: string;
  release_date: string;
  original_language: string;
};

type TrendingMovie = {
  searchTerm: string;
  count: number;
  poster_url: string;
  movie_id: number;
};

export type TrendingMovieDocument = Models.Document & TrendingMovie;
