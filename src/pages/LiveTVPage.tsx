import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Volume2, VolumeX, Maximize, Lock, Unlock, Radio, RefreshCw, Radio as RadioIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Channel {
  id: string; name: string; category: string; logo?: string;
  variants?: { label: string; id: string }[];
}

interface HlsInstance {
  destroy(): void;
  loadSource(url: string): void;
  attachMedia(video: HTMLVideoElement): void;
  on(event: string, callback: (event: string, data: any) => void): void;
  startLoad(): void;
  recoverMediaError(): void;
}

const CHANNELS: Channel[] = [
  { id: 'mrbean', name: 'Mr Bean', category: 'Kids', logo: 'https://i.ibb.co/cXxm04QL/images-1.jpg', variants: [{ label: 'Animated', id: 'mrbean' }, { label: 'Live Action', id: 'mrbeanlive' }] },
  { id: 'nickelodeon', name: 'Nickelodeon', category: 'Kids', logo: 'https://i.ibb.co/HDfbKXt1/images.jpg' },
  { id: 'nickjr', name: 'Nick Jr.', category: 'Kids', logo: 'https://i.ibb.co/vxS9qr8f/images-4.jpg' },
  { id: 'teennick', name: 'TeenNick', category: 'Kids', logo: 'https://i.ibb.co/YF5vrZbb/images-1.png' },
  { id: 'disneyjr', name: 'Disney', category: 'Kids', logo: 'https://i.ibb.co/S4LSM1VP/images-2.jpg' },
  { id: 'peppa', name: 'Peppa Pig', category: 'Kids', logo: 'https://i.ibb.co/FLBxXrPc/images-3.png' },
  { id: 'pokemon', name: 'Pokémon', category: 'Kids', logo: 'https://i.ibb.co/60P5WW3k/images-4.png' },
  { id: 'retrotoons', name: 'Retro Toons', category: 'Kids', logo: 'https://i.ibb.co/zWDNxNXy/Retro-Cartoons-Logo-2005-2015.webp' },
  { id: 'kartoon', name: 'Kartoon Channel', category: 'Kids', logo: 'https://i.ibb.co/jkR1d33G/images-2.png' },
  { id: 'pbskids', name: 'PBS Kids', category: 'Kids', logo: 'https://i.ibb.co/dJQLnh0C/images-5.png' },
  { id: 'nollyafrica', name: 'Nolly Africa', category: 'Entertainment', logo: 'https://i.ibb.co/6R5zZRbx/images.png' },
  { id: 'b4umovies', name: 'B4U Movies', category: 'Entertainment', logo: 'https://i.ibb.co/N2y9PfBK/images.jpg' },
  { id: 'discovery', name: 'Discovery Turbo', category: 'Entertainment', logo: 'https://i.ibb.co/9H8gBpyn/images-8.png' },
  { id: 'aljazeera', name: 'Al Jazeera', category: 'News', logo: 'https://i.ibb.co/60bKqmkx/images-6.png' },
  { id: 'foxnews', name: 'Fox News', category: 'News', logo: 'https://i.ibb.co/C3KNSsTH/Fox-News-Channel-logo-svg.png' },
  { id: 'espn', name: 'ESPN', category: 'Sports', logo: 'https://i.ibb.co/gM5Qfcx3/images-7.png' },
  { id: 'beinxtra', name: 'beIN Sports', category: 'Sports', logo: 'https://i.ibb.co/bjyGC2zL/images-3.jpg' },
];

const CATEGORIES = ['All', ...Array.from(new Set(CHANNELS.map(c => c.category)))];

const PALETTE = ['#1D6CF5', '#e11d48', '#9333ea', '#0891b2', '#ea580c', '#16a34a'];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getColor(name: string) {
  const hash = [...name].reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

const streamUrl = (id: string) => `https://cinexora.emmyhenztech.site/api/hls?ch=${encodeURIComponent(id)}&_=${Date.now()}`;

let HlsClass: any = null;

function loadHlsJs(): Promise<void> {
  return new Promise((resolve) => {
    if (HlsClass || (window as any).Hls) {
      HlsClass = (window as any).Hls;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
    script.onload = () => { HlsClass = (window as any).Hls; resolve(); };
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

export default function LiveTVPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsInstance | null>(null);
  const [active, setActive] = useState<number>(0);
  const [filter, setFilter] = useState('All');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pendingId, setPendingId] = useState<string>(CHANNELS[0].id);
  const [retries, setRetries] = useState(0);
  const [watchdog, setWatchdog] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [hlsReady, setHlsReady] = useState(false);

  useEffect(() => {
    loadHlsJs().then(() => setHlsReady(true));
  }, []);

  const filtered = CHANNELS.map((c, i) => ({ c, i })).filter(x => filter === 'All' || x.c.category === filter);

  const stopHls = () => {
    if (hlsRef.current) { try { hlsRef.current.destroy(); } catch {} hlsRef.current = null; }
    const v = videoRef.current;
    if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch {} }
    if (watchdog) { clearTimeout(watchdog); setWatchdog(null); }
  };

  const startPlayback = (id: string) => {
    const v = videoRef.current;
    if (!v || !HlsClass) return;
    stopHls();
    setLoading(true);
    setError(false);
    setRetries(0);

    const src = streamUrl(id);
    const wd = setTimeout(() => {
      setLoading(false);
      setError(true);
      stopHls();
    }, 12000);
    setWatchdog(wd);

    const onPlaying = () => {
      clearTimeout(wd);
      setLoading(false);
      setIsPlaying(true);
    };
    v.addEventListener('playing', onPlaying, { once: true });

    if (HlsClass.isSupported()) {
      const hls = new HlsClass({
        enableWorker: true, lowLatencyMode: false, backBufferLength: 30, maxBufferLength: 12,
        manifestLoadingTimeOut: 12000, manifestLoadingMaxRetry: 3, manifestLoadingRetryDelay: 700,
        levelLoadingTimeOut: 12000, levelLoadingMaxRetry: 4,
        fragLoadingTimeOut: 20000, fragLoadingMaxRetry: 6, fragLoadingRetryDelay: 700,
      });
      hls.loadSource(src);
      hls.attachMedia(v);
      hls.on(HlsClass.Events.MANIFEST_PARSED, () => { v.play().catch(() => {}); });
      hls.on(HlsClass.Events.ERROR, (e: any, d: any) => {
        if (!d.fatal) return;
        if (d.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
          try { hls.startLoad(); } catch { setError(true); setLoading(false); }
        } else if (d.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
          try { hls.recoverMediaError(); } catch { setError(true); setLoading(false); }
        } else { setError(true); setLoading(false); }
      });
      hlsRef.current = hls;
    } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = src;
      v.play().catch(() => {});
    } else {
      clearTimeout(wd);
      setLoading(false);
      setError(true);
    }
  };

  const selectChannel = (index: number, autoPlay = true) => {
    const ch = CHANNELS[index];
    setActive(index);
    setPendingId(ch.id);
    setError(false);
    setIsPlaying(false);
    if (autoPlay && ch.id) {
      startPlayback(ch.id);
    } else {
      stopHls();
    }
  };

  const handleVariant = (variantId: string) => {
    setPendingId(variantId);
    startPlayback(variantId);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); } else { v.pause(); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const goFullscreen = () => {
    const el = document.getElementById('liveStage');
    if (!el) return;
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else { el.requestFullscreen(); }
  };

  const refresh = () => {
    if (pendingId) startPlayback(pendingId);
  };

  const ch = CHANNELS[active];
  const variants = ch?.variants || [];

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
              <RadioIcon size={20} className="text-red-500" /> Live TV
            </h1>
            <p className="text-gray-500 text-xs">{ch.name}</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 bg-[#e11d48] text-white text-[10px] font-black tracking-wider px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
          </span>
        </div>

        {/* Video Player */}
        <div id="liveStage" className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#1e1e1e] ${locked ? 'cursor-none' : ''}`}>
          <video
            ref={videoRef}
            id="liveVideo"
            playsInline
            webkit-playsinline="true"
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Loading */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black/60">
              <div className="w-10 h-10 rounded-full border-[3px] border-white/15 border-t-[#1D6CF5] animate-spin" />
              <p className="text-white/60 text-sm">Connecting stream...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black/70 text-center p-6">
              <p className="text-white font-bold text-sm">Channel unavailable</p>
              <p className="text-white/50 text-xs">This stream is not responding. Try another channel.</p>
              <button onClick={refresh} className="bg-[#1D6CF5] text-white text-xs font-bold px-5 py-2 rounded-full hover:opacity-90 transition-all">
                Retry
              </button>
            </div>
          )}

          {/* Controls overlay */}
          {!locked && (
            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
              <button onClick={togglePlay} className="text-white p-1 hover:opacity-80 transition-all">
                {isPlaying ? (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
                ) : (
                  <Play size={20} fill="white" />
                )}
              </button>
              <button onClick={toggleMute} className="text-white p-1 hover:opacity-80 transition-all">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <span className="text-white/80 text-xs font-semibold truncate max-w-[150px]">{ch.name}</span>
              <span className="flex-1" />
              <button onClick={() => setLocked(true)} className="text-white/70 p-1 hover:opacity-100 transition-all">
                <Lock size={18} />
              </button>
              <button onClick={goFullscreen} className="text-white/70 p-1 hover:opacity-100 transition-all">
                <Maximize size={18} />
              </button>
            </div>
          )}

          {/* Lock overlay */}
          {locked && (
            <button onClick={() => setLocked(false)} className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-all">
              <Unlock size={16} />
            </button>
          )}
        </div>

        {/* Variants */}
        {variants.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => handleVariant(v.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  pendingId === v.id ? 'bg-[#1D6CF5] text-white' : 'bg-[#111] border border-[#222] text-gray-300 hover:border-white/20'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Category pills */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
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
          {filtered.map(({ c, i }) => (
            <button
              key={c.id}
              onClick={() => selectChannel(i)}
              className={`group text-left rounded-xl overflow-hidden border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                active === i ? 'border-[#1D6CF5] ring-1 ring-[#1D6CF5]' : 'border-[#1e1e1e] hover:border-[#333]'
              }`}
            >
              <div className="relative aspect-[16/10] flex items-center justify-center overflow-hidden" style={{ background: c.logo ? '#000' : getColor(c.name) }}>
                {c.logo ? (
                  <img src={c.logo} alt={c.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <span className="text-white font-black text-lg">{getInitials(c.name)}</span>
                )}
                <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#e11d48] shadow-[0_0_8px_#e11d48]" />
                {active === i && (
                  <div className="absolute inset-0 bg-[#1D6CF5]/10" />
                )}
              </div>
              <div className="p-2.5 bg-[#111]">
                <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{c.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
