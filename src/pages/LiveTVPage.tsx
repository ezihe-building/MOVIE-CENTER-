import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Radio, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, RotateCw, Cast } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Channel {
  id: string;
  name: string;
  category: string;
  logo?: string;
  hlsUrl?: string;
}

const CHANNELS: Channel[] = [
  { id: 'mrbean', name: 'Mr Bean', category: 'Kids', logo: 'https://i.ibb.co/cXxm04QL/images-1.jpg', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=mrbean' },
  { id: 'nickelodeon', name: 'Nickelodeon', category: 'Kids', logo: 'https://i.ibb.co/HDfbKXt1/images.jpg', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=nickelodeon' },
  { id: 'nickjr', name: 'Nick Jr.', category: 'Kids', logo: 'https://i.ibb.co/vxS9qr8f/images-4.jpg', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=nickjr' },
  { id: 'teennick', name: 'TeenNick', category: 'Kids', logo: 'https://i.ibb.co/YF5vrZbb/images-1.png', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=teennick' },
  { id: 'disneyjr', name: 'Disney', category: 'Kids', logo: 'https://i.ibb.co/S4LSM1VP/images-2.jpg', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=disneyjr' },
  { id: 'peppa', name: 'Peppa Pig', category: 'Kids', logo: 'https://i.ibb.co/FLBxXrPc/images-3.png', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=peppa' },
  { id: 'pokemon', name: 'Pokemon', category: 'Kids', logo: 'https://i.ibb.co/60P5WW3k/images-4.png', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=pokemon' },
  { id: 'retrotoons', name: 'Retro Toons', category: 'Kids', logo: 'https://i.ibb.co/zWDNxNXy/Retro-Cartoons-Logo-2005-2015.webp', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=retrotoons' },
  { id: 'kartoon', name: 'Kartoon Channel', category: 'Kids', logo: 'https://i.ibb.co/jkR1d33G/images-2.png', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=kartoon' },
  { id: 'pbskids', name: 'PBS Kids', category: 'Kids', logo: 'https://i.ibb.co/dJQLnh0C/images-5.png', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=pbskids' },
  { id: 'nollyafrica', name: 'Nolly Africa', category: 'Entertainment', logo: 'https://i.ibb.co/6R5zZRbx/images.png', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=nollyafrica' },
  { id: 'b4umovies', name: 'B4U Movies', category: 'Entertainment', logo: 'https://i.ibb.co/N2y9PfBK/images.jpg', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=b4umovies' },
  { id: 'discovery', name: 'Discovery Turbo', category: 'Entertainment', logo: 'https://i.ibb.co/9H8gBpyn/images-8.png', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=discovery' },
  { id: 'aljazeera', name: 'Al Jazeera', category: 'News', logo: 'https://i.ibb.co/60bKqmkx/images-6.png', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=aljazeera' },
  { id: 'foxnews', name: 'Fox News', category: 'News', logo: 'https://i.ibb.co/C3KNSsTH/Fox-News-Channel-logo-svg.png', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=foxnews' },
  { id: 'espn', name: 'ESPN', category: 'Sports', logo: 'https://i.ibb.co/gM5Qfcx3/images-7.png', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=espn' },
  { id: 'beinxtra', name: 'beIN Sports', category: 'Sports', logo: 'https://i.ibb.co/bjyGC2zL/images-3.jpg', hlsUrl: 'https://cinexora.emmyhenztech.site/api/hls?ch=beinxtra' },
];

const CATEGORIES = ['All', ...Array.from(new Set(CHANNELS.map(c => c.category)))];
const PALETTE = ['#1D6CF5', '#e11d48', '#9333ea', '#0891b2', '#ea580c', '#16a34a'];

function getColor(name: string) {
  const hash = [...name].reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// HLS.js CDN loader
let hlsScriptLoaded = false;
function loadHlsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (hlsScriptLoaded) { resolve(); return; }
    if ((window as any).Hls) { hlsScriptLoaded = true; resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = () => { hlsScriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error('Failed to load HLS.js'));
    document.head.appendChild(script);
  });
}

export default function LiveTVPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState('All');
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [portraitMode, setPortraitMode] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(true);

  const ch = CHANNELS[active];
  const filtered = CHANNELS.map((c, i) => ({ c, i })).filter(x => filter === 'All' || x.c.category === filter);
  const displayed = showAll ? filtered : filtered.slice(0, 10);

  // Load channel stream
  const loadChannel = async (channel: Channel, index: number) => {
    setActive(index);
    setLoading(true);
    setError(null);
    setPlaying(false);

    if (!channel.hlsUrl) {
      setError('No stream URL available for this channel');
      setLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video) { setLoading(false); return; }

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    try {
      // Check if browser supports HLS natively (Safari/iOS)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.hlsUrl;
        video.load();
        await video.play();
        setPlaying(true);
        setLoading(false);
      } else {
        // Use HLS.js
        await loadHlsScript();
        const Hls = (window as any).Hls;
        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            enableWorker: true,
            lowLatencyMode: false,
          });
          hlsRef.current = hls;
          hls.loadSource(channel.hlsUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().then(() => {
              setPlaying(true);
              setLoading(false);
            }).catch(() => {
              setLoading(false);
              // Autoplay blocked - user can click play
            });
          });
          hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) {
              setError(`Stream error: ${data.type}. Try another channel.`);
              setLoading(false);
              hls.destroy();
            }
          });
        } else {
          setError('HLS not supported in this browser. Try Safari or a modern browser.');
          setLoading(false);
        }
      }
    } catch (err) {
      setError('Failed to load stream. Channel may be offline.');
      setLoading(false);
    }
  };

  // Auto-load first channel on mount
  useEffect(() => {
    loadChannel(CHANNELS[0], 0);
    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true));
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const togglePortrait = () => {
    setPortraitMode(!portraitMode);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-[#111] border border-[#222] text-white rounded-full hover:bg-[#222] transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio size={20} className="text-red-500" /> Live TV
            </h1>
            <p className="text-gray-500 text-xs">{ch.name} — {ch.category}</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 bg-[#e11d48] text-white text-[10px] font-black tracking-wider px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
          </span>
        </div>

        {/* Video Player */}
        <div className={`relative bg-black rounded-2xl overflow-hidden border border-[#1e1e1e] ${portraitMode ? 'aspect-[9/16] max-h-[80vh] mx-auto' : 'aspect-video'}`}>
          <video
            ref={videoRef}
            className="w-full h-full"
            playsInline
            muted={muted}
            onClick={togglePlay}
            poster={ch.logo}
          />

          {/* Loading spinner */}
          {loading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
                <p className="text-white text-xs font-semibold">Loading {ch.name}...</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-10">
              <div className="text-center px-6">
                <AlertTriangle size={32} className="text-yellow-500 mx-auto mb-3" />
                <p className="text-white text-sm font-semibold mb-2">{error}</p>
                <p className="text-gray-500 text-xs mb-4">This channel may be temporarily offline. Try another one.</p>
                <button onClick={() => loadChannel(ch, active)} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all">
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all">
              {playing ? <Pause size={16} /> : <Play size={16} fill="white" />}
            </button>

            {/* Center info */}
            <div className="flex items-center gap-2">
              <span className="text-white text-[10px] font-bold bg-black/50 px-2 py-1 rounded">{ch.name}</span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Volume */}
              <button onClick={toggleMute} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all">
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              {/* Portrait toggle */}
              <button onClick={togglePortrait} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all" title="Toggle Portrait">
                <RotateCw size={16} />
              </button>
              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all">
                <Maximize size={16} />
              </button>
            </div>
          </div>

          {/* CINEXORA credit */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-b from-black/60 to-transparent">
            <span className="text-[10px] text-gray-500">Powered by</span>
            <a href="https://cinexora.emmyhenztech.site" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold transition-colors">CINEXORA</a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 mt-3 bg-[#111] border border-[#222] rounded-xl px-4 py-3">
          <AlertTriangle size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-gray-400 text-xs leading-relaxed">
            Live TV streams are provided by <a href="https://cinexora.emmyhenztech.site" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">CINEXORA</a>.
            Channel availability depends on upstream sources. All streams are free-to-air.
            <span className="text-yellow-500 font-semibold"> Tap a channel below to switch.</span>
          </p>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setActive(0); setShowAll(false); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === cat ? 'bg-[#1D6CF5] text-white' : 'bg-[#111] border border-[#222] text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Channel grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
          {displayed.map(({ c, i }) => (
            <button
              key={c.id}
              onClick={() => loadChannel(c, i)}
              className={`group text-left rounded-xl overflow-hidden border transition-all duration-200 ${
                active === i ? 'border-[#1D6CF5] ring-1 ring-[#1D6CF5]' : 'border-[#1e1e1e] hover:border-[#333]'
              }`}
            >
              <div className="relative aspect-[16/10] flex items-center justify-center overflow-hidden" style={{ background: c.logo ? '#000' : getColor(c.name) }}>
                {c.logo ? (
                  <img src={c.logo} alt={c.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <span className="text-white font-black text-lg">{getInitials(c.name)}</span>
                )}
                {/* LIVE dot */}
                <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#e11d48] shadow-[0_0_8px_#e11d48] animate-pulse" />
                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Play size={16} fill="white" className="text-white" />
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-[#111]">
                <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{c.category}</p>
              </div>
            </button>
          ))}
        </div>

        {filtered.length > 10 && !showAll && (
          <div className="text-center mt-4">
            <button onClick={() => setShowAll(true)} className="px-5 py-2 bg-[#111] border border-[#222] text-gray-400 text-xs font-semibold rounded-full hover:text-white transition-all">
              Show All {filtered.length} Channels
            </button>
          </div>
        )}

        {/* Footer credit */}
        <div className="mt-10 text-center border-t border-[#1e1e1e] pt-6">
          <p className="text-gray-600 text-xs">
            Live TV streams powered by <a href="https://cinexora.emmyhenztech.site" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">CINEXORA</a>
          </p>
          <p className="text-gray-700 text-[10px] mt-2">
            Free-to-air channels only. Channel availability depends on upstream sources.
          </p>
        </div>
      </div>
    </div>
  );
}
