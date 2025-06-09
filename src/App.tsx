import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard, { type Movie } from "./components/MovieCard";
import { useDebounce } from "react-use";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState("");

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
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Failed to fetch movies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void getMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <p className="text-white">
          <Spinner />
        </p>
      );
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

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {renderContent()}
        </section>
      </div>
    </main>
  );
};

export default App;
