import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Search, Tv, Film, X, MonitorPlay, ExternalLink, RotateCw, AlertTriangle, RefreshCw } from 'lucide-react';

/* =========================================================
   WATCH NOW — Embed any movie or TV show directly
   Supports multiple streaming platforms
   ========================================================= */

interface SourceDef {
  key: string;
  label: string;
  description: string;
  color: string;
  // builder: (tmdbId, type, season, episode) => embed URL
  buildUrl: (tmdbId: string, type: 'movie' | 'tv', season?: number, episode?: number) => string;
  // whether this source is known to redirect parent → avoid iframe
  redirects?: boolean;
}

const SOURCES: SourceDef[] = [
  {
    key: 'vidsrc',
    label: 'VidSrc',
    description: 'Fast HD streams, reliable',
    color: '#E50914',
    buildUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
        : `https://vidsrc.to/embed/${type}/${id}`,
  },
  {
    key: 'embedsu',
    label: 'EmbedSU',
    description: 'Clean embed, minimal ads',
    color: '#9333ea',
    buildUrl: (id, type) => `https://embed.su/embed/${type}/${id}`,
  },
  {
    key: 'moviestowatch',
    label: 'MoviesToWatch',
    description: 'Large library, modern UI',
    color: '#00A8E0',
    buildUrl: (id, type) =>
      type === 'tv'
        ? `https://moviestowatch.tv/tvshow/${id}`
        : `https://moviestowatch.tv/movie/${id}`,
    redirects: true,
  },
  {
    key: '2embed',
    label: '2Embed',
    description: 'Multi-server, fast loads',
    color: '#16a34a',
    buildUrl: (id, type) =>
      `https://www.2embed.cc/embed/${type === 'tv' ? 'tv' : 'movie'}/${id}`,
  },
  {
    key: 'superembed',
    label: 'SuperEmbed',
    description: 'Auto picks best server',
    color: '#f59e0b',
    buildUrl: (id, type) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    key: 'autoembed',
    label: 'AutoEmbed',
    description: 'Auto-select best source',
    color: '#10b981',
    buildUrl: (id, type) =>
      `https://autoembed.cc/${type}/${id}`,
  },
];

export default function WatchNowPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tmdbId, setTmdbId] = useState(searchParams.get('id') || '');
  const [type, setType] = useState<'movie' | 'tv'>(
    (searchParams.get('type') as 'movie' | 'tv') || 'movie'
  );
  const [sourceKey, setSourceKey] = useState('vidsrc');
  const [season, setSeason] = useState(searchParams.get('s') || '1');
  const [episode, setEpisode] = useState(searchParams.get('e') || '1');
  const [embedUrl, setEmbedUrl] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portraitMode, setPortraitMode] = useState(false);
  const [recent, setRecent] = useState<{ tmdbId: string; type: string; title: string }[]>([]);

  const source = SOURCES.find((s) => s.key === sourceKey) || SOURCES[0];

  // load recent
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mc_recent_watch') || '[]');
      setRecent(saved.slice(0, 5));
    } catch {}
  }, []);

  // auto-load when URL has ?id=xxx
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTmdbId(id);
      const t = (searchParams.get('type') as 'movie' | 'tv') || 'movie';
      setType(t);
      const s = searchParams.get('s') || '1';
      const e = searchParams.get('e') || '1';
      setSeason(s);
      setEpisode(e);
      // small delay so React renders first
      setTimeout(() => {
        const url = source.buildUrl(id, t, parseInt(s), parseInt(e));
        setEmbedUrl(url);
        setShowPlayer(true);
      }, 300);
    }
  }, [searchParams]);

  const buildUrl = () => {
    if (!tmdbId) return '';
    return source.buildUrl(tmdbId, type, parseInt(season), parseInt(episode));
  };

  const handleWatch = () => {
    if (!tmdbId) return;
    setError(null);
    setLoading(true);
    const url = buildUrl();
    setEmbedUrl(url);
    setShowPlayer(true);
    setLoading(false);
    // save recent
    try {
      const saved = JSON.parse(localStorage.getItem('mc_recent_watch') || '[]');
      const filtered = saved.filter((r: any) => r.tmdbId !== tmdbId);
      filtered.unshift({ tmdbId, type, title: `TMDB ${tmdbId}` });
      localStorage.setItem('mc_recent_watch', JSON.stringify(filtered.slice(0, 10)));
    } catch {}
  };

  const handleRetry = () => {
    setError(null);
    handleWatch();
  };

  const handleRecentClick = (id: string, t: string) => {
    setTmdbId(id);
    setType(t as 'movie' | 'tv');
    setShowPlayer(false);
    setEmbedUrl('');
    setError(null);
  };

  const togglePortrait = () => {
    setPortraitMode(!portraitMode);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-[#111] border border-[#222] text-white rounded-full hover:bg-[#222] transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <MonitorPlay size={24} className="text-red-500" /> Watch Now
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Stream any movie or TV show directly — 6 sources
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-5 md:p-6 mb-6">
          {/* Type toggle */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setType('movie');
                setShowPlayer(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                type === 'movie'
                  ? 'bg-red-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'
              }`}
            >
              <Film size={14} /> Movie
            </button>
            <button
              onClick={() => {
                setType('tv');
                setShowPlayer(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                type === 'tv'
                  ? 'bg-red-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'
              }`}
            >
              <Tv size={14} /> TV Show
            </button>
          </div>

          {/* TMDB ID + Season/Episode */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1">
              <label className="text-gray-500 text-xs font-medium mb-1.5 block">
                TMDB ID
              </label>
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 focus-within:border-red-600/50 transition-all">
                <Search size={16} className="text-gray-500" />
                <input
                  type="text"
                  value={tmdbId}
                  onChange={(e) => {
                    setTmdbId(e.target.value);
                    setShowPlayer(false);
                    setError(null);
                  }}
                  placeholder={`e.g., ${type === 'movie' ? '155' : '1399'}`}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                />
                {tmdbId && (
                  <button
                    onClick={() => {
                      setTmdbId('');
                      setShowPlayer(false);
                    }}
                    className="text-gray-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-[10px] mt-1.5">
                Find the TMDB ID on any movie page → click "View on TMDB"
              </p>
            </div>
            {type === 'tv' && (
              <div className="flex gap-2">
                <div className="w-20">
                  <label className="text-gray-500 text-xs font-medium mb-1.5 block">
                    Season
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={season}
                    onChange={(e) => {
                      setSeason(e.target.value);
                      setShowPlayer(false);
                    }}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-red-600/50 text-center"
                  />
                </div>
                <div className="w-20">
                  <label className="text-gray-500 text-xs font-medium mb-1.5 block">
                    Episode
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={episode}
                    onChange={(e) => {
                      setEpisode(e.target.value);
                      setShowPlayer(false);
                    }}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-red-600/50 text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Source Selector */}
          <div className="mb-4">
            <label className="text-gray-500 text-xs font-medium mb-2 block">
              Stream Source
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SOURCES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setSourceKey(s.key);
                    setShowPlayer(false);
                    setError(null);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all duration-300 ${
                    sourceKey === s.key
                      ? 'border-red-600 bg-red-600/10'
                      : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span
                      className={`text-xs font-bold ${
                        sourceKey === s.key ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {s.label}
                    </span>
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
          <div className="mb-6">
            {/* Player wrapper */}
            <div
              className={`relative bg-black rounded-2xl overflow-hidden border border-[#1e1e1e] shadow-2xl ${
                portraitMode ? 'aspect-[9/16] max-h-[80vh] mx-auto' : 'aspect-video'
              }`}
            >
              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
                    <p className="text-white text-xs font-semibold">Loading player...</p>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {error && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
                  <div className="text-center px-6">
                    <AlertTriangle size={32} className="text-yellow-500 mx-auto mb-3" />
                    <p className="text-white text-sm font-semibold mb-2">
                      {error}
                    </p>
                    <p className="text-gray-500 text-xs mb-4">
                      Try a different source or check the TMDB ID.
                    </p>
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all flex items-center gap-1"
                      >
                        <RefreshCw size={12} /> Retry
                      </button>
                      <a
                        href={embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#222] border border-[#333] text-white text-xs font-bold rounded-lg hover:bg-[#333] transition-all flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Open Directly
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Redirecting sources: show "Open in new tab" instead of iframe */}
              {source.redirects ? (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center px-6">
                    <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mx-auto mb-4">
                      <ExternalLink size={28} className="text-red-500" />
                    </div>
                    <p className="text-white font-bold text-sm mb-2">
                      {source.label} opens in a new tab
                    </p>
                    <p className="text-gray-500 text-xs mb-4 max-w-xs">
                      This platform blocks embedding. It will open directly in your browser.
                    </p>
                    <a
                      href={embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all"
                    >
                      <Play size={18} fill="white" />
                      Open {source.label}
                    </a>
                  </div>
                </div>
              ) : (
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture; display-capture"
                  allowFullScreen
                  title="Video Player"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError('Failed to load player. Try another source.');
                  }}
                />
              )}

              {/* Source badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: source.color }}
                />
                <span className="text-white text-[10px] font-bold">
                  {source.label}
                </span>
              </div>

              {/* Controls */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                {/* Portrait toggle */}
                <button
                  onClick={togglePortrait}
                  className="p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/90 transition-all"
                  title="Toggle Portrait Mode"
                >
                  <RotateCw size={14} />
                </button>
                {/* External link */}
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/90 transition-all"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Source switch hint */}
            <p className="text-gray-600 text-[10px] mt-2 text-center">
              If the video doesn't load, try a different source above.
            </p>
          </div>
        )}

        {/* Recent searches */}
        {recent.length > 0 && (
          <div className="mb-6">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
              Recent
            </h3>
            <div className="flex flex-wrap gap-2">
              {recent.map((r, i) => (
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
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Go to any <strong className="text-white">Movie</strong> or{' '}
                <strong className="text-white">TV Show</strong> page on this site
                → click <strong className="text-white">Watch Now</strong>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Or enter a TMDB ID directly above, pick a source, and click{' '}
                <strong className="text-white">Watch</strong>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                <strong className="text-white">Portrait mode</strong> — tap the
                rotate icon to switch to vertical on your phone
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                4
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                <strong className="text-white">Not loading?</strong> Try a different
                source — each platform has different servers
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-5">
          <p className="text-gray-600 text-xs leading-relaxed">
            <strong className="text-gray-500">Third-party streaming:</strong> The player
            embeds content from external video hosting services. Ezihe Movie Center does
            not host, upload, or distribute any video content. All streams are provided
            by third-party sources. The user is responsible for complying with local laws
            and copyright regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
