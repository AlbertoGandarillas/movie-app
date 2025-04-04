import "./App.css";
import Search from "./components/Search.tsx";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import MovieCard from "./components/MovieCard.tsx";
import { Movie } from "./types/Movie.tsx";
import { useDebounce } from "react-use";
import { getTrendingMovies, UpdateSearchCount } from "./appwrite.js";
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = searchTerm
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(searchTerm)}`
        : `${API_BASE_URL}/movie/popular`;
      const response = await fetch(endpoint, API_OPTIONS);
      const data = await response.json();
      if (data.Response === "False") {
        setError(data.Error || "Error fetching movies");
        return;
      }
      setMovies(data.results);
      if (searchTerm && data.results.length > 0) {
        await UpdateSearchCount(searchTerm, data.results[0]);
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Error fetching movies"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMovies();
  }, [debouncedSearchTerm]);

  const fetchTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      if (movies && Array.isArray(movies)) {
        const formattedMovies = movies.map(movie => ({
          id: movie._id,
          title: movie.title,
          poster_url: movie.poster_path,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          overview: movie.overview,
          release_date: movie.release_date,
          original_language: movie.original_language
        }));
        setTrendingMovies(formattedMovies as Movie[]);
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
  };
  useEffect(() => {
    fetchTrendingMovies();
  }, []);
  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src="/hero.png" alt="Hero Banner" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
              Without the Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>
          <p>
            Search for movies by title, genre, or year. Get instant access to
            detailed information about each movie, including plot, cast, and
            ratings.
          </p>
          {trendingMovies.length > 0 && (
            <section className="trending">
              <h2 className="mt-4">Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie: Movie, index: number) => (
                  <li key={`${movie.id}-${index}`}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="all-movies">
            <h2 className="mt-4">All Movies</h2>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="movies">
                <ul>
                  {movies.map((movie: Movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
