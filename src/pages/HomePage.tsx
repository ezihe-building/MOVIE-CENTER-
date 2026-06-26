import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Clock, Star, Sparkles, Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTrending, getPopular, getTopRated, getNowPlaying, getUpcoming, Movie } from '../services/tmdb';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import { HeroSkeleton, RowSkeleton } from '../components/LoadingSkeleton';

export default function HomePage() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, popularRes, topRatedRes, nowPlayingRes, upcomingRes] = await Promise.all([
          getTrending(),
          getPopular(),
          getTopRated(),
          getNowPlaying(),
          getUpcoming(),
        ]);
        setTrending(trendingRes.results);
        setPopular(popularRes.results);
        setTopRated(topRatedRes.results);
        setNowPlaying(nowPlayingRes.results);
        setUpcoming(upcomingRes.results);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <HeroSkeleton />
        <div className="mt-8">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroBanner movies={trending} />

      <div className="-mt-16 relative z-10 space-y-2">
        <MovieRow title="Trending This Week" movies={trending} icon={<Flame size={22} />} />

        {/* Stream Hub Promo Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
          <Link to="/stream">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6 md:p-8 group hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-500 cursor-pointer border border-[#1e1e1e] hover:border-red-600/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/30 group-hover:scale-110 transition-transform duration-300">
                  <Play size={28} fill="white" className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                    Ready to Watch? Go to Stream Hub
                  </h2>
                  <p className="text-gray-400 text-sm max-w-xl">
                    29 streaming platforms in one place — Tubi, Netflix, Hulu, Crackle, Disney+ and more.
                    Free and paid options. All official links.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>Browse Platforms</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <MovieRow title="Popular Movies" movies={popular} icon={<TrendingUp size={22} />} />
        <MovieRow title="Now Playing" movies={nowPlaying} icon={<Clock size={22} />} />
        <MovieRow title="Top Rated" movies={topRated} icon={<Star size={22} />} />
        <MovieRow title="Upcoming" movies={upcoming} icon={<Sparkles size={22} />} />
      </div>
    </div>
  );
}
