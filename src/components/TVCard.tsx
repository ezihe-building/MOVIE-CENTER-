import { useNavigate } from 'react-router-dom';
import { Star, Play, Tv } from 'lucide-react';
import { TVShow, getImageUrl } from '../services/tmdb';

interface Props {
  show: TVShow;
  index?: number;
}

export default function TVCard({ show, index = 0 }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tv/${show.id}`)}
      className="group cursor-pointer flex-shrink-0 w-[140px] sm:w-[160px] md:w-[185px] lg:w-[200px] animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-dark-700 shadow-lg">
        <img
          src={getImageUrl(show.poster_path)}
          alt={show.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <Play size={24} fill="white" className="text-white ml-1" />
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <span className="px-1.5 py-0.5 bg-blue-600/90 text-white text-[10px] font-bold rounded flex items-center gap-1">
            <Tv size={8} /> TV
          </span>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
          <Star size={10} fill="#f5c518" className="text-gold" />
          <span className="text-xs font-bold text-gold">{show.vote_average.toFixed(1)}</span>
        </div>
      </div>
      <h3 className="text-white text-sm font-semibold line-clamp-1 group-hover:text-red-500 transition-colors duration-300">
        {show.name}
      </h3>
      <p className="text-gray-500 text-xs mt-1">
        {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
      </p>
    </div>
  );
}
