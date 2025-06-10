import { Client, Databases, ID, Query } from "appwrite";
import type { Movie, TrendingMovieDocument } from "./types/Movie";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_METRICS_COLLECTION_ID;

const client: Client = new Client();

client.setEndpoint("https://fra.cloud.appwrite.io/v1").setProject(PROJECT_ID);

const database: Databases = new Databases(client);

export const updateSearchCount = async (searchTerm: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal("searchTerm", searchTerm)]);

    if (result.documents.length > 0) {
      const documents = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, documents.$id, {
        count: documents.count + 1,
      });
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error(`Error updating search count: ${error}`);
  }
};

export const fetchTopTrendingMovies = async (): Promise<TrendingMovieDocument[]> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(5), Query.orderDesc("count")]);
    return result.documents as TrendingMovieDocument[];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to fetch trending movies. Reason: ${message}`);
    throw err;
  }
};
