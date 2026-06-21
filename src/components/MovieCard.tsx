import { useNavigate } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { Movie, getImageUrl } from '../services/tmdb';

interface Props {
  movie: Movie;
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="group cursor-pointer flex-shrink-0 w-[140px] sm:w-[160px] md:w-[185px] lg:w-[200px] animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-dark-700 shadow-lg">
        <img
          src={getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="w-14 h-14 bg-accent/90 rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <Play size={24} fill="white" className="text-white ml-1" />
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
          <Star size={10} fill="#f5c518" className="text-gold" />
          <span className="text-xs font-bold text-gold">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>

      {/* Info */}
      <h3 className="text-white text-sm font-semibold line-clamp-1 group-hover:text-accent transition-colors duration-300">
        {movie.title}
      </h3>
      <p className="text-gray-500 text-xs mt-1">
        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
      </p>
    </div>
  );
}
