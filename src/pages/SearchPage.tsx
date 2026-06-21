import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Film, Star, Play } from 'lucide-react';
import { searchMovies, getImageUrl } from '../services/tmdb';
import { GridSkeleton } from '../components/LoadingSkeleton';
import type { Movie } from '../services/tmdb';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await searchMovies(query);
        setResults(res.results);
        setTotalResults(res.total_results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  if (loading) return <GridSkeleton />;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search size={28} className="text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Search Results</h1>
          </div>
          <p className="text-gray-400">
            {totalResults} results for "<span className="text-white">{query}</span>"
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {results.map((movie, index) => (
              <div
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="group cursor-pointer animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-[#1a1a1a] shadow-lg">
                  <img
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                      <Play size={24} fill="white" className="text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
                    <Star size={10} fill="#f5c518" className="text-[#f5c518]" />
                    <span className="text-xs font-bold text-[#f5c518]">{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                <h3 className="text-white text-sm font-semibold line-clamp-1 group-hover:text-red-500 transition-colors duration-300">
                  {movie.title}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Film size={64} className="text-gray-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
            <p className="text-gray-500 max-w-md">
              We couldn't find any movies matching your search. Try different keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
