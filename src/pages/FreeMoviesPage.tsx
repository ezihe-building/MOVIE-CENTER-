import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Search, Star, X, Clock, Film, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';

interface ArchiveMovie {
  identifier: string;
  title: string;
  year?: string;
  description?: string;
  avg_rating?: number;
  creator?: string;
  subject?: string[];
  runtime?: string;
}

const CATEGORIES = [
  { key: 'classic', label: 'Classic Films', query: 'mediatype:movies+AND+year:[1920 TO 1960]+AND+format:mp4' },
  { key: 'horror', label: 'Horror', query: 'mediatype:movies+AND+subject:horror+AND+format:mp4' },
  { key: 'scifi', label: 'Sci-Fi', query: 'mediatype:movies+AND+subject:sci-fi+AND+format:mp4' },
  { key: 'comedy', label: 'Comedy', query: 'mediatype:movies+AND+subject:comedy+AND+format:mp4' },
  { key: 'drama', label: 'Drama', query: 'mediatype:movies+AND+subject:drama+AND+format:mp4' },
  { key: 'documentary', label: 'Documentary', query: 'mediatype:movies+AND+subject:documentary+AND+format:mp4' },
  { key: 'animation', label: 'Animation', query: 'mediatype:movies+AND+subject:animation+AND+format:mp4' },
];

const FEATURED_IDS = [
  'night_of_the_living_dead',
  'TheHouseOnHauntedHill',
  'CarnivalOfSouls',
  'TheHitchHicker',
  'Plan_9_from_Outer_Space',
  'the_last_man_on_earth',
  'TheBrainThatWouldntDie',
  'Dementia_13',
  'TheLittleShopOfHorrors',
  'SantaClausConquersTheMartians',
  'TheAmazingTransparentMan',
  'Creature_from_the_Haunted_Sea',
  'TheGiantGilaMonster',
  'TheKillerShrews',
  'TeenagersFromOuterSpace',
  'TheWaspWoman',
];

function getArchiveEmbedUrl(id: string) {
  return `https://archive.org/embed/${id}?autoplay=0&autoPlay=0`;
}
function getArchiveThumbnail(id: string) {
  return `https://archive.org/services/img/${id}`;
}

async function fetchArchiveMovies(query: string, rows: number = 20): Promise<ArchiveMovie[]> {
  const url = `https://archive.org/advancedsearch.php?q=${query}&fl[]=identifier,title,year,description,subject,avg_rating,creator,runtime&sort[]=avg_rating+desc&rows=${rows}&output=json`;
  const res = await fetch(url);
  const data = await res.json();
  return data.response?.docs || [];
}

async function fetchFeaturedMovies(): Promise<ArchiveMovie[]> {
  const promises = FEATURED_IDS.map(async (id) => {
    try {
      const res = await fetch(`https://archive.org/advancedsearch.php?q=identifier:${id}&fl[]=identifier,title,year,description,subject,avg_rating,creator,runtime&rows=1&output=json`);
      const data = await res.json();
      return data.response?.docs?.[0] || null;
    } catch { return null; }
  });
  const results = await Promise.all(promises);
  return results.filter(Boolean) as ArchiveMovie[];
}

function PlayerModal({ movie, onClose }: { movie: ArchiveMovie; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2 md:p-4 animate-fadeIn">
      <button onClick={onClose} className="absolute top-3 right-3 z-20 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:rotate-90">
        <X size={24} />
      </button>
      <div className="absolute top-3 left-3 z-20 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
          <Film size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm line-clamp-1">{movie.title}</p>
          <p className="text-gray-400 text-xs">{movie.year ? `${movie.year} · ` : ''}Public Domain</p>
        </div>
      </div>
      <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black">
            <Loader2 size={40} className="text-red-500 animate-spin" />
            <p className="text-gray-400 text-sm">Loading movie...</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={getArchiveEmbedUrl(movie.identifier)}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          title={movie.title}
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>
    </div>
  );
}

function MovieCard({ movie, index, onClick }: { movie: ArchiveMovie; index: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-xl overflow-hidden border border-[#1e1e1e] bg-[#111] hover:border-[#333] transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1 animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={getArchiveThumbnail(movie.identifier)}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/1a1a1a/444444?text=No+Poster';
          }}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/40">
            <Play size={24} fill="white" className="text-white ml-1" />
          </div>
        </div>
        <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/90 text-white text-[9px] font-bold rounded uppercase tracking-wider">
          Free
        </div>
        {movie.year && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded backdrop-blur-sm">
            {movie.year}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-white text-sm font-semibold line-clamp-1">{movie.title}</p>
        {movie.creator && (
          <p className="text-gray-500 text-[10px] mt-1 line-clamp-1">{movie.creator}</p>
        )}
        {movie.avg_rating && movie.avg_rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={10} fill="#f5c518" className="text-[#f5c518]" />
            <span className="text-[#f5c518] text-[10px] font-bold">{movie.avg_rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export default function FreeMoviesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('classic');
  const [movies, setMovies] = useState<ArchiveMovie[]>([]);
  const [featured, setFeatured] = useState<ArchiveMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<ArchiveMovie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ArchiveMovie[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [feat, cats] = await Promise.all([
        fetchFeaturedMovies(),
        fetchArchiveMovies(CATEGORIES[0].query, 16),
      ]);
      setFeatured(feat);
      setMovies(cats);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const cat = CATEGORIES.find(c => c.key === activeTab);
    if (!cat) return;
    setLoading(true);
    fetchArchiveMovies(cat.query, 16).then((data) => {
      setMovies(data);
      setLoading(false);
    });
  }, [activeTab]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    const q = encodeURIComponent(`mediatype:movies+AND+title:${searchQuery.trim()}+AND+format:mp4`);
    const data = await fetchArchiveMovies(q, 20);
    setSearchResults(data);
    setSearching(false);
  };

  const displayed = searchQuery.trim() ? searchResults : movies;
  const isSearch = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-[#111] border border-[#222] text-white rounded-full hover:bg-[#222] transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Play size={24} className="text-green-500" fill="currentColor" /> Free Movies
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Watch {FEATURED_IDS.length}+ public domain films directly — no subscription, no sign-up
            </p>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-[#1a2e1a] via-[#132e13] to-[#0f3d0f] p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-600/30">
              <Film size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                Public Domain Films
              </h2>
              <p className="text-gray-400 text-sm max-w-xl">
                Classic movies, cult horror, sci-fi, comedy — all legally free. 
                Powered by <a href="https://archive.org" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">Archive.org</a>.
                Watch instantly, no account needed.
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">100% Legal</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">No Ads</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex items-center gap-2 bg-[#111] border border-[#222] rounded-xl px-4 py-3 focus-within:border-red-600/50 transition-all">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search free movies..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            )}
            <button type="submit" className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all">
              {searching ? '...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Featured Section (only when not searching) */}
        {!isSearch && featured.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-[#f5c518]" />
              <h2 className="text-lg font-bold text-white">Featured Free Movies</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {featured.map((m, i) => (
                <MovieCard key={m.identifier} movie={m} index={i} onClick={() => setSelectedMovie(m)} />
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        {!isSearch && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === cat.key ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-[#111] border border-[#222] text-gray-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Search Results Title */}
        {isSearch && (
          <div className="flex items-center gap-2 mb-4">
            <Search size={18} className="text-gray-500" />
            <h2 className="text-lg font-bold text-white">
              {searchResults.length > 0 ? `${searchResults.length} results` : 'No results'}
            </h2>
          </div>
        )}

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-[#111] border border-[#1e1e1e] overflow-hidden">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 skeleton rounded" />
                  <div className="h-2 w-1/2 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {displayed.map((m, i) => (
              <MovieCard key={m.identifier} movie={m} index={i} onClick={() => setSelectedMovie(m)} />
            ))}
          </div>
        )}

        {isSearch && searchResults.length === 0 && !loading && (
          <div className="text-center py-12">
            <Film size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No free movies found for "{searchQuery}"</p>
            <p className="text-gray-600 text-xs mt-1">Try different keywords or browse categories</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center border-t border-[#1e1e1e] pt-6">
          <p className="text-gray-600 text-xs">
            Free movies powered by <a href="https://archive.org" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400 font-semibold transition-colors">Internet Archive</a>
          </p>
          <p className="text-gray-700 text-[10px] mt-1">
            All films are in the public domain or Creative Commons. No copyright infringement.
          </p>
        </div>
      </div>

      {/* Player Modal */}
      {selectedMovie && (
        <PlayerModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
