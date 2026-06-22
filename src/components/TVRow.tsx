import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TVShow } from '../services/tmdb';
import TVCard from './TVCard';

interface Props {
  title: string;
  shows: TVShow[];
  icon?: React.ReactNode;
}

export default function TVRow({ title, shows, icon }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  if (shows.length === 0) return null;

  return (
    <section className="mb-10 md:mb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {icon && <span className="text-red-600">{icon}</span>}
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            <div className="hidden sm:block w-12 h-0.5 bg-red-600/50 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll('left')} className="p-2 bg-dark-600 hover:bg-dark-500 text-gray-400 hover:text-white rounded-lg transition-all duration-300">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll('right')} className="p-2 bg-dark-600 hover:bg-dark-500 text-gray-400 hover:text-white rounded-lg transition-all duration-300">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar pb-4">
          {shows.map((show, index) => (
            <TVCard key={show.id} show={show} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
