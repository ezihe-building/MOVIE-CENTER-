import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, MonitorPlay, Search, X, Star,
  Calendar, Film, Tv, Sparkles, TrendingUp, RotateCw,
  ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getTrending, getPopular, searchMovies, getImageUrl, getBackdropUrl, Movie } from '../services/tmdb';

/* =========================================================
   WATCH NOW — MovieBox-style streaming hub
   Uses TMDB data + working embed sources
   For educational/personal use only
   ========================================================= */

type TabKey = 'trending' | 'movies' | 'tv' | 'anime';

interface EmbedSource {
  key: string;
  label: string;
  color: string;
  buildUrl: (tmdbId: number, type: 'movie' | 'tv') => string;
}

const EMBED_SOURCES: EmbedSource[] = [
  {
    key: 'vidsrc',
    label: 'VidSrc',
    color: '#E50914',
    buildUrl: (id, type) => `https://vidsrc.to/embed/${type}/${id}`,
  },
  {
    key: 'embedsu',
    label: 'EmbedSU',
    color: '#9333ea',
    buildUrl: (id, type) => `https://embed.su/embed/${type}/${id}`,
  },
  {
    key: '2embed',
    label: '2Embed',
    color: '#16a34a',
    buildUrl: (id, type) => `https://www.2embed.cc/embed/${type === 'tv' ? 'tv' : 'movie'}/${id}`,
  },
  {
    key: 'superembed',
    label: 'SuperEmbed',
    color: '#f59e0b',
    buildUrl: (id, type) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
];

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'trending', label: 'Trending', icon: <TrendingUp size={14} /> },
  { key: 'movies', label: 'Movies', icon: <Film size={14} /> },
  { key: 'tv', label: 'TV Shows', icon: <Tv size={14} /> },
  { key: 'anime', label: 'Anime', icon: <Sparkles size={14} /> },
];

// Load x-frame-bypass
let xfbLoaded = false;
function loadXFB(): Promise<void> {
  return new Promise((resolve) => {
    if (xfbLoaded || customElements.get('x-frame-bypass')) { xfbLoaded = true; resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/x-frame-bypass@1.0.2/x-frame-bypass.js';
    s.type = 'module';
    s.onload = () => { xfbLoaded = true; resolve(); };
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

export default function WatchNowPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedSource, setEmbedSource] = useState('vidsrc');
  const [playerLoading, setPlayerLoading] = useState(false);
  const [portraitMode, setPortraitMode] = useState(false);

  // Fetch movies based on tab
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      let data: Movie[] = [];
      switch (activeTab) {
        case 'trending':
          data = (await getTrending()).results;
          break;
        case 'movies':
          data = (await getPopular()).results;
          break;
        case 'tv':
          data = (await getTrending()).results.slice(0, 20);
          break;
        case 'anime':
          data = (await searchMovies('anime')).results.slice(0, 20);
          break;
      }
      setMovies(data);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchMovies();
    loadXFB();
  }, [fetchMovies]);

  // Search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await searchMovies(searchQuery);
      setMovies(results.results);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Open player for selected movie
  const openPlayer = (movie: Movie, type: 'movie' | 'tv' = 'movie') => {
    const source = EMBED_SOURCES.find((s) => s.key === embedSource) || EMBED_SOURCES[0];
    const url = source.buildUrl(movie.id, type);
    setEmbedUrl(url);
    setSelectedMovie(movie);
    setShowPlayer(true);
    setPlayerLoading(true);
    setTimeout(() => setPlayerLoading(false), 1200);
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setEmbedUrl('');
    setSelectedMovie(null);
  };

  const scrollRow = (dir: 'left' | 'right') => {
    const el = document.getElementById('movie-row');
    if (el) el.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-[#111] border border-[#222] text-white rounded-full hover:bg-[#222] transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MonitorPlay size={20} className="text-red-500" /> Watch Now
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Stream movies & TV shows instantly</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-[#111] border border-[#222] rounded-xl px-4 py-3 mb-4 focus-within:border-red-600/50 transition-all">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search movies, TV shows, anime..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); fetchMovies(); }} className="text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          )}
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
          >
            Search
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white'
                  : 'bg-[#111] border border-[#222] text-gray-400 hover:text-white'
              }`}
            >
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
          <div className="relative">
            {/* Scroll buttons */}
            <button
              onClick={() => scrollRow('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/80 backdrop-blur-sm rounded-full text-white hover:bg-black transition-all hidden md:block"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollRow('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/80 backdrop-blur-sm rounded-full text-white hover:bg-black transition-all hidden md:block"
            >
              <ChevronRight size={20} />
            </button>

            {/* Grid */}
            <div
              id="movie-row"
              className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {movies.map((movie, i) => (
                <div
                  key={movie.id}
                  onClick={() => setSelectedMovie(movie)}
                  className="group cursor-pointer flex-shrink-0 w-[150px] sm:w-[170px] animate-fadeIn"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-[#1a1a1a] shadow-lg">
                    <img
                      src={getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <Play size={20} fill="white" className="text-white ml-0.5" />
                      </div>
                    </div>
                    {/* Rating badge */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md">
                      <Star size={10} fill="#f5c518" className="text-[#f5c518]" />
                      <span className="text-[10px] font-bold text-[#f5c518]">{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                  <h3 className="text-white text-xs font-semibold line-clamp-1 group-hover:text-red-400 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-gray-600 text-[10px] mt-0.5">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Movie Detail Modal */}
      {selectedMovie && !showPlayer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMovie(null)}>
          <div className="bg-[#111] border border-[#222] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Backdrop */}
            <div className="relative h-48 sm:h-56 rounded-t-2xl overflow-hidden">
              <img
                src={getBackdropUrl(selectedMovie.backdrop_path)}
                alt={selectedMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 -mt-8 relative">
              {/* Poster + info */}
              <div className="flex gap-4">
                <img
                  src={getImageUrl(selectedMovie.poster_path)}
                  alt={selectedMovie.title}
                  className="w-24 sm:w-28 rounded-xl shadow-lg flex-shrink-0"
                />
                <div className="flex-1 pt-8">
                  <h2 className="text-white font-bold text-lg sm:text-xl mb-1">{selectedMovie.title}</h2>
                  <div className="flex items-center gap-3 text-gray-500 text-xs mb-2">
                    <span className="flex items-center gap-1"><Star size={10} fill="#f5c518" className="text-[#f5c518]" /> {selectedMovie.vote_average.toFixed(1)}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'N/A'}</span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{selectedMovie.overview}</p>
                </div>
              </div>

              {/* Embed source selector */}
              <div className="mt-4">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">Stream Source</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {EMBED_SOURCES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setEmbedSource(s.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                        embedSource === s.key
                          ? 'text-white'
                          : 'bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400'
                      }`}
                      style={embedSource === s.key ? { backgroundColor: s.color } : undefined}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Watch button */}
              <button
                onClick={() => openPlayer(selectedMovie, 'movie')}
                className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                <Play size={18} fill="white" /> Watch Now
              </button>

              {/* Disclaimer */}
              <p className="text-gray-600 text-[10px] mt-3 text-center leading-relaxed">
                Educational use only. Streams from third-party sources. Ezihe Movie Center does not host content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Player Modal */}
      {showPlayer && selectedMovie && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Player header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#111] border-b border-[#222]">
            <div className="flex items-center gap-2">
              <button onClick={closePlayer} className="p-1.5 text-gray-400 hover:text-white transition-all">
                <ArrowLeft size={16} />
              </button>
              <span className="text-white text-xs font-bold truncate max-w-[200px] sm:max-w-sm">{selectedMovie.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPortraitMode(!portraitMode)}
                className="p-1.5 text-gray-400 hover:text-white transition-all"
                title="Rotate"
              >
                <RotateCw size={14} />
              </button>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-white transition-all"
                title="Open source"
              >
                <ExternalLink size={14} />
              </a>
              <button onClick={closePlayer} className="p-1.5 text-gray-400 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Player area */}
          <div className="flex-1 relative bg-black">
            {playerLoading && (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
                  <p className="text-white text-xs font-semibold">Loading player...</p>
                </div>
              </div>
            )}

            <div className={`w-full h-full ${portraitMode ? 'max-w-md mx-auto' : ''}`}>
              <x-frame-bypass
                src={embedUrl}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            </div>

            {/* Source badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
              <div className="w-2 h-2 rounded-full" style={{ background: EMBED_SOURCES.find(s => s.key === embedSource)?.color || '#E50914' }} />
              <span className="text-white text-[10px] font-bold">{EMBED_SOURCES.find(s => s.key === embedSource)?.label}</span>
              <span className="text-green-400 text-[8px] font-bold">BYPASS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
