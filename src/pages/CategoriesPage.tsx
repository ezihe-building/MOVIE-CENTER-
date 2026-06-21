import { useState, useEffect } from 'react';
import { Grid3X3 } from 'lucide-react';
import { getGenres, getMoviesByGenre, Genre, Movie } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/LoadingSkeleton';

const genreColors: Record<number, string> = {
  28: 'from-red-600 to-orange-600',
  12: 'from-green-600 to-emerald-600',
  16: 'from-purple-600 to-pink-600',
  35: 'from-yellow-600 to-amber-600',
  80: 'from-gray-600 to-slate-600',
  99: 'from-blue-600 to-cyan-600',
  18: 'from-indigo-600 to-purple-600',
  10751: 'from-pink-500 to-rose-500',
  14: 'from-violet-600 to-purple-600',
  36: 'from-amber-700 to-yellow-700',
  27: 'from-red-800 to-red-600',
  10402: 'from-cyan-600 to-teal-600',
  9648: 'from-gray-700 to-gray-600',
  10749: 'from-pink-600 to-red-500',
  878: 'from-blue-700 to-indigo-600',
  10770: 'from-teal-600 to-green-600',
  53: 'from-gray-800 to-gray-600',
  10752: 'from-red-700 to-orange-700',
  37: 'from-amber-800 to-yellow-800',
};

export default function CategoriesPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await getGenres();
        setGenres(res.genres);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  const handleGenreClick = async (genre: Genre) => {
    setSelectedGenre(genre);
    setMoviesLoading(true);
    try {
      const res = await getMoviesByGenre(genre.id);
      setMovies(res.results);
    } catch (error) {
      console.error('Failed to fetch genre movies:', error);
    } finally {
      setMoviesLoading(false);
    }
  };

  if (loading) return <GridSkeleton />;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Grid3X3 size={28} className="text-accent" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">Categories</h1>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-12">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre)}
              className={`relative overflow-hidden p-4 md:p-5 rounded-xl font-semibold text-white text-sm md:text-base transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                selectedGenre?.id === genre.id
                  ? 'ring-2 ring-accent ring-offset-2 ring-offset-dark-900'
                  : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${genreColors[genre.id] || 'from-gray-600 to-gray-700'} opacity-80`} />
              <div className="absolute inset-0 bg-black/20" />
              <span className="relative z-10">{genre.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Genre Movies */}
        {selectedGenre && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">
              {selectedGenre.name} Movies
            </h2>

            {moviesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-[2/3] skeleton rounded-xl mb-3" />
                    <div className="w-3/4 h-4 skeleton rounded mb-2" />
                    <div className="w-1/2 h-3 skeleton rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                {movies.map((movie, index) => (
                  <div key={movie.id} className="w-full [&>div]:w-full">
                    <MovieCard movie={movie} index={index} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
