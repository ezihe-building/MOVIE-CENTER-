import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, MonitorPlay, ExternalLink, AlertTriangle,
  Film, Tv, RotateCw, Sparkles
} from 'lucide-react';

/* =========================================================
   WATCH NOW — Personal streaming hub
   Embeds Crunchyroll & MovieBox via x-frame-bypass
   For educational purposes only — private use
   ========================================================= */

interface StreamPlatform {
  key: string;
  label: string;
  description: string;
  color: string;
  url: string;
  icon: React.ReactNode;
}

const PLATFORMS: StreamPlatform[] = [
  {
    key: 'moviebox',
    label: 'MovieBox',
    description: 'Latest movies & TV shows',
    color: '#E50914',
    url: 'https://moviebox.to',
    icon: <Film size={14} />,
  },
  {
    key: 'crunchyroll',
    label: 'Crunchyroll',
    description: 'Anime & manga streaming',
    color: '#F47521',
    url: 'https://www.crunchyroll.com',
    icon: <Sparkles size={14} />,
  },
];

// Load x-frame-bypass for bypassing X-Frame-Options
let xfbLoaded = false;
function loadXFB(): Promise<void> {
  return new Promise((resolve) => {
    if (xfbLoaded || customElements.get('x-frame-bypass')) {
      xfbLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/x-frame-bypass@1.0.2/x-frame-bypass.js';
    script.type = 'module';
    script.onload = () => { xfbLoaded = true; resolve(); };
    script.onerror = () => resolve(); // fail silently
    document.head.appendChild(script);
  });
}

export default function WatchNowPage() {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('moviebox');
  const [showPlayer, setShowPlayer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portraitMode, setPortraitMode] = useState(false);

  const active = PLATFORMS.find((p) => p.key === activeKey) || PLATFORMS[0];

  useEffect(() => {
    loadXFB();
  }, []);

  const openPlayer = () => {
    setLoading(true);
    setShowPlayer(true);
    setTimeout(() => setLoading(false), 800);
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
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MonitorPlay size={20} className="text-red-500" /> Watch Now
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Personal streaming hub — educational use only</p>
          </div>
        </div>

        {/* Platform selector */}
        <div className="flex items-center gap-2 mb-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              onClick={() => {
                setActiveKey(p.key);
                setShowPlayer(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeKey === p.key
                  ? 'text-white'
                  : 'bg-[#111] border border-[#222] text-gray-400 hover:text-white'
              }`}
              style={
                activeKey === p.key
                  ? { backgroundColor: p.color, borderColor: p.color }
                  : undefined
              }
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        {/* Open button */}
        {!showPlayer && (
          <button
            onClick={openPlayer}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 mb-4"
          >
            <Play size={18} fill="white" /> Open {active.label}
          </button>
        )}

        {/* Player */}
        {showPlayer && (
          <div className="mb-4">
            <div
              className={`relative bg-black rounded-2xl overflow-hidden border border-[#1e1e1e] shadow-2xl ${
                portraitMode ? 'aspect-[9/16] max-h-[80vh] mx-auto' : 'aspect-video'
              }`}
            >
              {/* Loading */}
              {loading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
                    <p className="text-white text-xs font-semibold">Loading {active.label}...</p>
                  </div>
                </div>
              )}

              {/* x-frame-bypass embed */}
              <x-frame-bypass
                src={active.url}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />

              {/* Source badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
                <div className="w-2 h-2 rounded-full" style={{ background: active.color }} />
                <span className="text-white text-[10px] font-bold">{active.label}</span>
                <span className="text-green-400 text-[8px] font-bold">BYPASS</span>
              </div>

              {/* Controls */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <button
                  onClick={() => setPortraitMode(!portraitMode)}
                  className="p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/90 transition-all"
                  title="Portrait"
                >
                  <RotateCw size={14} />
                </button>
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/90 transition-all"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Platform info */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-5 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-400 text-xs leading-relaxed">
                <strong className="text-white">Educational use only.</strong> This page embeds
                third-party streaming platforms for personal learning and research.
                Ezihe Movie Center does not host, distribute, or claim ownership of any content.
                All rights belong to their respective owners.
              </p>
              <p className="text-gray-600 text-[10px] mt-2">
                X-Frame-Bypass is used to bypass embedding restrictions for private study purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
