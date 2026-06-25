import { useState, useEffect } from 'react';
import { ArrowLeft, Radio, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, Lock, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Channel {
  id: string; name: string; category: string; logo?: string;
  cineUrl?: string;
}

const CHANNELS: Channel[] = [
  { id: 'mrbean', name: 'Mr Bean', category: 'Kids', logo: 'https://i.ibb.co/cXxm04QL/images-1.jpg' },
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

function getColor(name: string) {
  const hash = [...name].reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function LiveTVPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState('All');
  const [channelStatus, setChannelStatus] = useState<Record<string, 'ok'|'error'|'loading'|'unknown'>>({});
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const ch = CHANNELS[active];
  const filtered = CHANNELS.map((c, i) => ({ c, i })).filter(x => filter === 'All' || x.c.category === filter);
  const displayed = showAll ? filtered : filtered.slice(0, 10);

  // Check channel health
  useEffect(() => {
    const check = async () => {
      const status: Record<string, 'ok'|'error'|'loading'|'unknown'> = {};
      for (const c of CHANNELS) status[c.id] = 'loading';
      setChannelStatus(status);
      for (const c of CHANNELS) {
        try {
          const res = await fetch(`https://cinexora.emmyhenztech.site/api/hls?ch=${c.id}`, { method: 'HEAD', mode: 'no-cors' });
          setChannelStatus(prev => ({ ...prev, [c.id]: 'ok' }));
        } catch { setChannelStatus(prev => ({ ...prev, [c.id]: 'unknown' })); }
        await new Promise(r => setTimeout(r, 200));
      }
    };
    check();
  }, []);

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

        {/* Player - CINEXORA iframe */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#1e1e1e]">
          <iframe
            src="https://cinexora.emmyhenztech.site/livetv.html"
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            title="Live TV"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
          {/* CINEXORA credit overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
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
            <span className="text-yellow-500 font-semibold"> Use the player above to select channels.</span>
          </p>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setActive(0); }}
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
            <div key={c.id} className={`group text-left rounded-xl overflow-hidden border transition-all duration-200 ${
              active === i ? 'border-[#1D6CF5] ring-1 ring-[#1D6CF5]' : 'border-[#1e1e1e]'
            }`}>
              <div className="relative aspect-[16/10] flex items-center justify-center overflow-hidden" style={{ background: c.logo ? '#000' : getColor(c.name) }}>
                {c.logo ? (
                  <img src={c.logo} alt={c.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <span className="text-white font-black text-lg">{getInitials(c.name)}</span>
                )}
                <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#e11d48] shadow-[0_0_8px_#e11d48]" />
                {/* Status dot */}
                <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                  channelStatus[c.id] === 'ok' ? 'bg-green-500' : channelStatus[c.id] === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
              </div>
              <div className="p-2.5 bg-[#111]">
                <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{c.category}</p>
              </div>
            </div>
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
