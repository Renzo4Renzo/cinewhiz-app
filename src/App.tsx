import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { fetchTopTrendingMovies, updateSearchCount } from "./appwrite";
import type { Movie, TrendingMovieDocument } from "./types/Movie";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_BASE_URL = import.meta.env.VITE_TMBD_BASE_URL;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`, // Ensure this is set correctly
  },
};

const App = () => {
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [trendingMovies, setTrendingMovies] = useState([] as TrendingMovieDocument[]);

  const [errorMessage, setErrorMessage] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  //Debounce the search term by waiting for the user to stop typing for 500ms
  useDebounce(() => setdebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const getMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint =
        query.length > 2
          ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
          : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.response === "false") {
        setErrorMessage(data.error || "Failed to fetch movies");
        setMovies([]);
        return;
      }

      setMovies(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Failed to fetch movies");
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendingMovies = async () => {
    try {
      const movies = await fetchTopTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  useEffect(() => {
    void getMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    getTrendingMovies();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }

    if (errorMessage) {
      return <p className="text-red-500">{errorMessage}</p>;
    }

    return (
      <ul>
        {movies.map((movie: Movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </ul>
    );
  };

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner"></img>
          <h1>
            Smart Suggestions. Better <span className="text-gradient">Movie Nights</span>
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title}></img>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>Popular</h2>
          {renderContent()}
        </section>
      </div>
    </main>
  );
};

export default App;
