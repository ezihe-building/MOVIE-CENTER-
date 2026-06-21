import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../services/tmdb';
import MovieCard from './MovieCard';

interface Props {
  title: string;
  movies: Movie[];
  icon?: React.ReactNode;
}

export default function MovieRow({ title, movies, icon }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (movies.length === 0) return null;

  return (
    <section className="mb-10 md:mb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {icon && <span className="text-accent">{icon}</span>}
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            <div className="hidden sm:block w-12 h-0.5 bg-accent/50 rounded-full" />
          </div>

          {/* Scroll Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 bg-dark-600 hover:bg-dark-500 text-gray-400 hover:text-white rounded-lg transition-all duration-300"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 bg-dark-600 hover:bg-dark-500 text-gray-400 hover:text-white rounded-lg transition-all duration-300"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Movies Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar pb-4"
        >
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
