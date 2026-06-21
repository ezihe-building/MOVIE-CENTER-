import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Clock, Star, Sparkles } from 'lucide-react';
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
        <MovieRow title="Popular Movies" movies={popular} icon={<TrendingUp size={22} />} />
        <MovieRow title="Now Playing" movies={nowPlaying} icon={<Clock size={22} />} />
        <MovieRow title="Top Rated" movies={topRated} icon={<Star size={22} />} />
        <MovieRow title="Upcoming" movies={upcoming} icon={<Sparkles size={22} />} />
      </div>
    </div>
  );
}
