import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { getTrending, Movie } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/LoadingSkeleton';

export default function TrendingPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week');

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const res = await getTrending(timeWindow);
        setMovies(res.results);
      } catch (error) {
        console.error('Failed to fetch trending:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [timeWindow]);

  if (loading) return <GridSkeleton />;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp size={28} className="text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Trending</h1>
          </div>

          {/* Toggle */}
          <div className="flex items-center bg-dark-700 rounded-xl p-1">
            <button
              onClick={() => setTimeWindow('day')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                timeWindow === 'day'
                  ? 'bg-accent text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeWindow('week')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                timeWindow === 'week'
                  ? 'bg-accent text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {movies.map((movie, index) => (
            <div key={movie.id} className="w-full [&>div]:w-full">
              <MovieCard movie={movie} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
