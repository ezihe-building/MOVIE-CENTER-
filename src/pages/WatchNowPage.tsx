import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Search, Tv, Film, X, MonitorPlay, ExternalLink } from 'lucide-react';

interface EmbedSource {
  name: string;
  id: string;
  type: 'movie' | 'tv';
  tmdbId?: string;
  embedUrl?: string;
  externalUrl?: string;
  description: string;
  color: string;
}

function buildEmbedUrl(source: string, tmdbId: string, type: 'movie' | 'tv', season?: number, episode?: number): string {
  const s = String(tmdbId);
  switch (source) {
    case 'vidsrc':
      if (type === 'tv' && season && episode) {
        return `https://vidsrc.to/embed/tv/${s}/${season}/${episode}`;
      }
      return `https://vidsrc.to/embed/${type}/${s}`;
    case 'moviestowatch':
      return `https://moviestowatch.tv/${type === 'tv' ? 'tvshow' : 'movie'}/${s}`;
    case 'superembed':
      return `https://multiembed.mov/?video_id=${s}&tmdb=1`;
    case 'autoembed':
      return `https://autoembed.cc/${type}/${s}`;
    default:
      return '';
  }
}

function buildExternalUrl(source: string, tmdbId: string, type: 'movie' | 'tv'): string {
  const s = String(tmdbId);
  switch (source) {
    case 'moviestowatch':
      return `https://moviestowatch.tv/${type === 'tv' ? 'tvshow' : 'movie'}/${s}`;
    default:
      return '';
  }
}

const SOURCES: { key: string; label: string; description: string; color: string }[] = [
  { key: 'vidsrc', label: 'VidSrc', description: 'HD streams, fast loading', color: '#E50914' },
  { key: 'moviestowatch', label: 'MoviesToWatch', description: 'Large library, reliable', color: '#00A8E0' },
  { key: 'superembed', label: 'SuperEmbed', description: 'Multi-source aggregator', color: '#9333ea' },
  { key: 'autoembed', label: 'AutoEmbed', description: 'Auto-select best source', color: '#16a34a' },
];

export default function WatchNowPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tmdbId, setTmdbId] = useState(searchParams.get('id') || '');
  const [type, setType] = useState<'movie' | 'tv'>((searchParams.get('type') as 'movie' | 'tv') || 'movie');
  const [source, setSource] = useState('vidsrc');
  const [season, setSeason] = useState(searchParams.get('s') || '1');
  const [episode, setEpisode] = useState(searchParams.get('e') || '1');
  const [embedUrl, setEmbedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [recentSearches, setRecentSearches] = useState<{tmdbId: string; type: string; title: string}[]>([]);

  // Auto-load player when TMDB ID is passed via URL
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mc_recent_watch') || '[]');
      setRecentSearches(saved.slice(0, 5));
    } catch {}
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTmdbId(id);
      setType((searchParams.get('type') as 'movie' | 'tv') || 'movie');
      if (searchParams.get('s')) setSeason(searchParams.get('s')!);
      if (searchParams.get('e')) setEpisode(searchParams.get('e')!);
      // Auto-play
      setTimeout(() => {
        const url = buildEmbedUrl(source, id, (searchParams.get('type') as 'movie' | 'tv') || 'movie', parseInt(searchParams.get('s') || '1'), parseInt(searchParams.get('e') || '1'));
        setEmbedUrl(url);
        setShowPlayer(true);
      }, 300);
    }
  }, [searchParams]);

  const handleWatch = () => {
    if (!tmdbId) return;
    setLoading(true);
    const url = buildEmbedUrl(source, tmdbId, type, parseInt(season), parseInt(episode));
    setEmbedUrl(url);
    setShowPlayer(true);
    setLoading(false);

    // Save to recent
    try {
      const saved = JSON.parse(localStorage.getItem('mc_recent_watch') || '[]');
      const filtered = saved.filter((r: any) => r.tmdbId !== tmdbId);
      filtered.unshift({ tmdbId, type, title: `TMDB ${tmdbId}` });
      localStorage.setItem('mc_recent_watch', JSON.stringify(filtered.slice(0, 10)));
    } catch {}
  };

  const handleRecentClick = (id: string, t: string) => {
    setTmdbId(id);
    setType(t as 'movie' | 'tv');
    setShowPlayer(false);
    setEmbedUrl('');
  };

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
              <MonitorPlay size={24} className="text-red-500" /> Watch Now
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter a TMDB ID to stream instantly
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-5 md:p-6 mb-6">
          {/* Type toggle */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => { setType('movie'); setShowPlayer(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                type === 'movie' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'
              }`}
            >
              <Film size={14} /> Movie
            </button>
            <button
              onClick={() => { setType('tv'); setShowPlayer(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                type === 'tv' ? 'bg-red-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'
              }`}
            >
              <Tv size={14} /> TV Show
            </button>
          </div>

          {/* TMDB ID Input */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1">
              <label className="text-gray-500 text-xs font-medium mb-1.5 block">TMDB ID</label>
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 focus-within:border-red-600/50 transition-all">
                <Search size={16} className="text-gray-500" />
                <input
                  type="text"
                  value={tmdbId}
                  onChange={(e) => { setTmdbId(e.target.value); setShowPlayer(false); }}
                  placeholder={`Enter TMDB ID (e.g., ${type === 'movie' ? '155' : '1399'})`}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                />
                {tmdbId && (
                  <button onClick={() => { setTmdbId(''); setShowPlayer(false); }} className="text-gray-500 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-[10px] mt-1.5">
                Find the TMDB ID on any movie page on your site → click the TMDB link
              </p>
            </div>

            {/* Season/Episode for TV */}
            {type === 'tv' && (
              <div className="flex gap-2">
                <div className="w-20">
                  <label className="text-gray-500 text-xs font-medium mb-1.5 block">Season</label>
                  <input
                    type="number"
                    min="1"
                    value={season}
                    onChange={(e) => { setSeason(e.target.value); setShowPlayer(false); }}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-red-600/50 text-center"
                  />
                </div>
                <div className="w-20">
                  <label className="text-gray-500 text-xs font-medium mb-1.5 block">Episode</label>
                  <input
                    type="number"
                    min="1"
                    value={episode}
                    onChange={(e) => { setEpisode(e.target.value); setShowPlayer(false); }}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-red-600/50 text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Source Selector */}
          <div className="mb-4">
            <label className="text-gray-500 text-xs font-medium mb-2 block">Stream Source</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SOURCES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setSource(s.key); setShowPlayer(false); }}
                  className={`text-left p-3 rounded-xl border transition-all duration-300 ${
                    source === s.key
                      ? 'border-red-600 bg-red-600/10'
                      : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className={`text-xs font-bold ${source === s.key ? 'text-white' : 'text-gray-400'}`}>{s.label}</span>
                  </div>
                  <p className="text-gray-600 text-[10px]">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Watch Button */}
          <button
            onClick={handleWatch}
            disabled={!tmdbId}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              tmdbId
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
                : 'bg-[#2a2a2a] text-gray-600 cursor-not-allowed'
            }`}
          >
            <Play size={18} fill="white" />
            {loading ? 'Loading...' : `Watch ${type === 'tv' ? `S${season}E${episode}` : 'Movie'}`}
          </button>
        </div>

        {/* Player */}
        {showPlayer && embedUrl && (
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#1e1e1e] mb-6 shadow-2xl">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Movie Player"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            />
            {/* Source badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
              <div className="w-2 h-2 rounded-full" style={{ background: SOURCES.find(s => s.key === source)?.color || '#fff' }} />
              <span className="text-white text-[10px] font-bold">{SOURCES.find(s => s.key === source)?.label || 'Stream'}</span>
            </div>
            {/* External link */}
            <a
              href={buildExternalUrl(source, tmdbId, type) || embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 z-10 p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/90 transition-all"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        )}

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Recent</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleRecentClick(r.tmdbId, r.type)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#111] border border-[#222] text-gray-400 text-xs rounded-lg hover:text-white hover:border-[#333] transition-all"
                >
                  {r.type === 'tv' ? <Tv size={12} /> : <Film size={12} />}
                  {r.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* How to use */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-5 md:p-6 mb-6">
          <h3 className="text-white font-bold text-sm mb-3">How to Watch</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">1</div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Go to any <strong className="text-white">Movie</strong> or <strong className="text-white">TV Show</strong> page on this site
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">2</div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Click <strong className="text-white">"View on TMDB"</strong> to get the TMDB ID from the URL (e.g., <code className="text-red-400 bg-[#1a1a1a] px-1 rounded">tmdb.org/movie/155</code> → ID is <strong className="text-white">155</strong>)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">3</div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Paste the TMDB ID above, pick a source, and click <strong className="text-white">Watch</strong>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">4</div>
              <p className="text-gray-400 text-xs leading-relaxed">
                For TV shows, enter the season and episode number, then click Watch
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-5">
          <p className="text-gray-600 text-xs leading-relaxed">
            <strong className="text-gray-500">Third-party streaming:</strong> The player embeds content from external video hosting services.
            Ezihe Movie Center does not host, upload, or distribute any video content.
            All streams are provided by third-party sources. The user is responsible for complying with local laws and copyright regulations.
            This is a search and discovery interface only.
          </p>
        </div>
      </div>
    </div>
  );
}
