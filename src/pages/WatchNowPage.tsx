import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MonitorPlay, Search, X, Star,
  Calendar, Film, Tv, Sparkles, TrendingUp,
  ExternalLink, Play
} from 'lucide-react';
import { getTrending, getPopular, searchMovies, getImageUrl, getBackdropUrl, Movie } from '../services/tmdb';

/* =========================================================
   WATCH NOW — Streaming Guide
   Discover movies & see where to watch
   No embedded players — external links only
   ========================================================= */

type TabKey = 'trending' | 'movies' | 'tv' | 'anime';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'trending', label: 'Trending', icon: <TrendingUp size={14} /> },
  { key: 'movies', label: 'Movies', icon: <Film size={14} /> },
  { key: 'tv', label: 'TV Shows', icon: <Tv size={14} /> },
  { key: 'anime', label: 'Anime', icon: <Sparkles size={14} /> },
];

const WATCH_LINKS = [
  { name: 'Netflix', url: 'https://www.netflix.com', color: '#E50914' },
  { name: 'Prime Video', url: 'https://www.amazon.com/primevideo', color: '#00A8E1' },
  { name: 'Tubi', url: 'https://tubitv.com', color: '#FF7F00' },
  { name: 'Pluto TV', url: 'https://pluto.tv', color: '#4D3DFF' },
  { name: 'Plex', url: 'https://www.plex.tv', color: '#E5A00D' },
  { name: 'Crunchyroll', url: 'https://www.crunchyroll.com', color: '#F47521' },
  { name: 'YouTube', url: 'https://www.youtube.com/movies', color: '#FF0000' },
  { name: 'Apple TV', url: 'https://tv.apple.com', color: '#000000' },
];

export default function WatchNowPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      let data: Movie[] = [];
      switch (activeTab) {
        case 'trending': data = (await getTrending()).results; break;
        case 'movies': data = (await getPopular()).results; break;
        case 'tv': data = (await getTrending()).results.slice(0, 20); break;
        case 'anime': data = (await searchMovies('anime')).results.slice(0, 20); break;
      }
      setMovies(data);
    } catch { setMovies([]); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await searchMovies(searchQuery);
      setMovies(results.results);
    } catch { setMovies([]); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-[#111] border border-[#222] text-white rounded-full hover:bg-[#222] transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MonitorPlay size={20} className="text-red-500" /> Where to Watch
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Discover movies & find streaming platforms</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-[#111] border border-[#222] rounded-xl px-4 py-3 mb-4 focus-within:border-red-600/50 transition-all">
          <Search size={16} className="text-gray-500" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Search movies, TV shows..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); fetchMovies(); }} className="text-gray-500 hover:text-white"><X size={14} /></button>
          )}
          <button onClick={handleSearch} className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all">Search</button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'bg-red-600 text-white' : 'bg-[#111] border border-[#222] text-gray-400 hover:text-white'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <Film size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No movies found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {movies.map((movie, i) => (
              <div key={movie.id} onClick={() => setSelectedMovie(movie)}
                className="group cursor-pointer animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-[#1a1a1a] shadow-lg">
                  <img src={getImageUrl(movie.poster_path)} alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                      <Play size={20} fill="white" className="text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md">
                    <Star size={10} fill="#f5c518" className="text-[#f5c518]" />
                    <span className="text-[10px] font-bold text-[#f5c518]">{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                <h3 className="text-white text-xs font-semibold line-clamp-1 group-hover:text-red-400 transition-colors">{movie.title}</h3>
                <p className="text-gray-600 text-[10px] mt-0.5">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMovie(null)}>
          <div className="bg-[#111] border border-[#222] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-48 sm:h-56 rounded-t-2xl overflow-hidden">
              <img src={getBackdropUrl(selectedMovie.backdrop_path)} alt={selectedMovie.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
              <button onClick={() => setSelectedMovie(null)} className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 -mt-8 relative">
              <div className="flex gap-4">
                <img src={getImageUrl(selectedMovie.poster_path)} alt={selectedMovie.title} className="w-24 sm:w-28 rounded-xl shadow-lg flex-shrink-0" />
                <div className="flex-1 pt-8">
                  <h2 className="text-white font-bold text-lg sm:text-xl mb-1">{selectedMovie.title}</h2>
                  <div className="flex items-center gap-3 text-gray-500 text-xs mb-2">
                    <span className="flex items-center gap-1"><Star size={10} fill="#f5c518" className="text-[#f5c518]" /> {selectedMovie.vote_average.toFixed(1)}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'N/A'}</span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{selectedMovie.overview}</p>
                </div>
              </div>

              {/* Watch on Platforms */}
              <div className="mt-5">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-3">Watch On</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WATCH_LINKS.map((platform) => (
                    <a key={platform.name} href={platform.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-[#3a3a3a] transition-all group">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: platform.color }} />
                      <span className="text-white text-[11px] font-semibold">{platform.name}</span>
                      <ExternalLink size={10} className="text-gray-600 group-hover:text-white ml-auto transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Trailer */}
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovie.title + ' trailer')}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
                <Play size={18} fill="white" /> Watch Trailer on YouTube
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
