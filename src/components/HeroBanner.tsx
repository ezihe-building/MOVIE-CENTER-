import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Star, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Movie, getBackdropUrl } from '../services/tmdb';

interface Props {
  movies: Movie[];
}

export default function HeroBanner({ movies }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const featured = movies.slice(0, 6);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % featured.length);
  }, [currentIndex, featured.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + featured.length) % featured.length);
  }, [currentIndex, featured.length, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (featured.length === 0) return null;

  const movie = featured[currentIndex];

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Background Image */}
      {featured.map((m, i) => (
        <div
          key={m.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={getBackdropUrl(m.backdrop_path)}
            alt={m.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/30" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl animate-slideIn" key={movie.id}>
            {/* Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full uppercase tracking-wider">
                Featured
              </span>
              <div className="flex items-center gap-1 text-gold">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-semibold">{movie.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar size={12} />
                <span className="text-sm">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
              {movie.title}
            </h1>

            {/* Overview */}
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 line-clamp-3 max-w-xl">
              {movie.overview}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-accent/30 text-sm md:text-base"
              >
                <Play size={18} fill="currentColor" />
                Watch Trailer
              </button>
              <button
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm text-sm md:text-base"
              >
                <Info size={18} />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm"
        style={{ opacity: 0.6 }}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm"
        style={{ opacity: 0.6 }}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex
                ? 'w-8 h-2 bg-accent'
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
