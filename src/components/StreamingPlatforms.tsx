import { useEffect, useState } from 'react';
import { ExternalLink, Tv, Loader } from 'lucide-react';
import { getStreamingSources, getPlatformColor, StreamingSource } from '../services/watchmode';

interface Props {
  tmdbId: number;
  type?: 'movie' | 'tv';
}

const TYPE_LABEL: Record<string, string> = {
  sub: 'Stream',
  free: 'Free',
  tve: 'TV Everywhere',
  rent: 'Rent',
  buy: 'Buy',
};

const TYPE_COLOR: Record<string, string> = {
  sub: 'bg-green-600/20 text-green-400 border-green-600/30',
  free: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  tve: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
  rent: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  buy: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
};

export default function StreamingPlatforms({ tmdbId, type = 'movie' }: Props) {
  const [sources, setSources] = useState<StreamingSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStreamingSources(tmdbId, type).then(data => {
      setSources(data);
      setLoading(false);
    });
  }, [tmdbId, type]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-6">
        <Loader size={18} className="text-gray-500 animate-spin" />
        <span className="text-gray-500 text-sm">Checking streaming availability...</span>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500 text-sm">Not currently available on major streaming platforms in the US.</p>
        <p className="text-gray-600 text-xs mt-1">Check back later — availability changes frequently.</p>
      </div>
    );
  }

  const grouped: Record<string, StreamingSource[]> = {};
  for (const s of sources) {
    if (!grouped[s.type]) grouped[s.type] = [];
    grouped[s.type].push(s);
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium">
            {TYPE_LABEL[type] ?? type}
          </p>
          <div className="flex flex-wrap gap-3">
            {items.map((source, i) => {
              const color = getPlatformColor(source.name);
              return (
                <a
                  key={i}
                  href={source.web_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {source.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{source.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${TYPE_COLOR[source.type] ?? 'bg-gray-600/20 text-gray-400 border-gray-600/30'}`}>
                        {TYPE_LABEL[source.type] ?? source.type}
                      </span>
                      {source.price && source.price > 0 && (
                        <span className="text-gray-500 text-xs">${source.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <ExternalLink size={13} className="text-gray-600 group-hover:text-gray-400 transition-colors ml-1 flex-shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
