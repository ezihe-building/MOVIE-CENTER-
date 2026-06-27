import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, MonitorPlay, ExternalLink, AlertTriangle, Film, Tv, Sparkles } from 'lucide-react';

/* =========================================================
   WATCH NOW — Stream from external platforms
   Replaced broken iframe embeds with reliable options
   ========================================================= */

interface StreamOption {
  key: string;
  label: string;
  description: string;
  color: string;
  url: string;
  type: 'movie' | 'tv' | 'anime';
  embeddable: boolean;
}

const OPTIONS: StreamOption[] = [
  {
    key: 'moviebox',
    label: 'MovieBox',
    description: 'Latest movies & TV shows',
    color: '#E50914',
    url: 'https://moviebox.to',
    type: 'movie',
    embeddable: false,
  },
  {
    key: 'crunchyroll',
    label: 'Crunchyroll',
    description: 'Anime & manga streaming',
    color: '#F47521',
    url: 'https://www.crunchyroll.com',
    type: 'anime',
    embeddable: false,
  },
  {
    key: 'tubi',
    label: 'Tubi',
    description: 'Free movies & TV (legal)',
    color: '#FF4D00',
    url: 'https://tubitv.com',
    type: 'movie',
    embeddable: false,
  },
  {
    key: 'archive',
    label: 'Archive.org',
    description: 'Public domain classics',
    color: '#9333ea',
    url: 'https://archive.org/details/movies',
    type: 'movie',
    embeddable: true,
  },
];

export default function WatchNowPage() {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('moviebox');
  const [showEmbed, setShowEmbed] = useState(false);

  const active = OPTIONS.find((o) => o.key === activeKey) || OPTIONS[0];

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
            <p className="text-gray-500 text-xs mt-0.5">
              Stream from trusted platforms
            </p>
          </div>
        </div>

        {/* Platform selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => {
                setActiveKey(o.key);
                setShowEmbed(false);
              }}
              className={`text-left p-3 rounded-xl border transition-all duration-300 ${
                activeKey === o.key
                  ? 'border-red-600 bg-red-600/10'
                  : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: o.color }} />
                <span className={`text-xs font-bold ${activeKey === o.key ? 'text-white' : 'text-gray-400'}`}>
                  {o.label}
                </span>
              </div>
              <p className="text-gray-600 text-[10px]">{o.description}</p>
            </button>
          ))}
        </div>

        {/* Embed or Open */}
        {active.embeddable ? (
          <>
            {!showEmbed ? (
              <button
                onClick={() => setShowEmbed(true)}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                <Play size={18} fill="white" /> Open {active.label}
              </button>
            ) : (
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#1e1e1e] shadow-2xl">
                <iframe
                  src={active.url}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={active.label}
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
                  <div className="w-2 h-2 rounded-full" style={{ background: active.color }} />
                  <span className="text-white text-[10px] font-bold">{active.label}</span>
                </div>
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 z-10 p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/90 transition-all"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink size={28} style={{ color: active.color }} />
            </div>
            <p className="text-white font-bold text-sm mb-2">{active.label}</p>
            <p className="text-gray-500 text-xs mb-5 max-w-xs mx-auto">
              {active.description}. Opens directly in your browser for the best experience.
            </p>
            <a
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all"
            >
              <Play size={18} fill="white" />
              Open {active.label}
            </a>
            <p className="text-gray-700 text-[10px] mt-4">
              You’ll be redirected to {active.label} in a new tab.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 bg-[#111] border border-[#222] rounded-2xl p-5">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-500 text-xs font-bold">Third-party platforms</p>
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">
            Ezihe Movie Center does not host any video content. All streams are provided by external platforms.
            The user is responsible for complying with local laws and the terms of service of each platform.
            Some platforms may require a VPN or may not be available in all regions.
          </p>
        </div>

        {/* Quick links */}
        <div className="mt-6">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">More Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="https://pluto.tv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-[#111] border border-[#222] rounded-xl hover:border-[#333] transition-all"
            >
              <Tv size={16} className="text-purple-400" />
              <div>
                <p className="text-white text-xs font-bold">Pluto TV</p>
                <p className="text-gray-600 text-[10px]">Free live TV channels</p>
              </div>
            </a>
            <a
              href="https://plex.tv/watch-free"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-[#111] border border-[#222] rounded-xl hover:border-[#333] transition-all"
            >
              <Film size={16} className="text-yellow-400" />
              <div>
                <p className="text-white text-xs font-bold">Plex</p>
                <p className="text-gray-600 text-[10px]">Free movies & TV</p>
              </div>
            </a>
            <a
              href="https://www.youtube.com/playlist?list=PLHPTxTxtC0ibVslrtqVlX_A甩"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-[#111] border border-[#222] rounded-xl hover:border-[#333] transition-all"
            >
              <Sparkles size={16} className="text-red-400" />
              <div>
                <p className="text-white text-xs font-bold">YouTube Free</p>
                <p className="text-gray-600 text-[10px]">Free with ads</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
