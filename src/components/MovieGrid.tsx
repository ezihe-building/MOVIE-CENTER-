import { Movie } from '../services/tmdb';
import MovieCard from './MovieCard';

interface Props {
  movies: Movie[];
  title?: string;
}

export default function MovieGrid({ movies, title }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
        {movies.map((movie, index) => (
          <div key={movie.id} className="w-full">
            <div className="w-full">
              <MovieCard movie={movie} index={index} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
