import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ExternalLink, Star, Shield } from 'lucide-react';

interface Platform {
  name: string;
  description: string;
  url: string;
  color: string;
  free: boolean;
  subtitle: string;
}

const FREE_PLATFORMS: Platform[] = [
  { name: 'Tubi TV', description: 'Thousands of movies & TV shows free with ads. No subscription.', url: 'https://tubitv.com', color: '#FA5B18', free: true, subtitle: 'Free with Ads' },
  { name: 'Crackle', description: 'Sony\'s free streaming service. Movies, TV, originals.', url: 'https://crackle.com', color: '#F5B81F', free: true, subtitle: 'Free with Ads' },
  { name: 'Popcornflix', description: 'Free movies and TV shows. No sign-up required.', url: 'https://popcornflix.com', color: '#E50914', free: true, subtitle: 'Free with Ads' },
  { name: 'IMDb TV (Freevee)', description: 'Amazon\'s free streaming service. Hit movies & shows.', url: 'https://imdb.com/tv', color: '#F5C518', free: true, subtitle: 'Free with Ads' },
  { name: 'Roku Channel', description: 'Free movies, TV, live channels. Works on any device.', url: 'https://therokuchannel.roku.com', color: '#662D91', free: true, subtitle: 'Free with Ads' },
  { name: 'Shout Factory TV', description: 'Cult classics, horror, comedy. Free streaming.', url: 'https://shoutfactorytv.com', color: '#FF6B00', free: true, subtitle: 'Free with Ads' },
  { name: 'PantaFlix', description: 'Free indie movies. Discover hidden gems.', url: 'https://pantaflix.com', color: '#00D4AA', free: true, subtitle: 'Free with Ads' },
  { name: 'Fearless.li', description: 'Free documentaries. No subscription needed.', url: 'https://fearless.li', color: '#FF3366', free: true, subtitle: 'Free with Ads' },
  { name: 'Vudu', description: 'Free movies section + rent/buy. Free tier available.', url: 'https://vudu.com', color: '#0075C9', free: true, subtitle: 'Free + Paid' },
  { name: 'Vimeo', description: 'Free indie films, shorts, documentaries.', url: 'https://vimeo.com/watch', color: '#1AB7EA', free: true, subtitle: 'Free + Paid' },
  { name: 'YouTube', description: 'Free movies, documentaries, and content.', url: 'https://youtube.com/movies', color: '#FF0000', free: true, subtitle: 'Free + Paid' },
  { name: 'Pluto TV', description: '100+ free live channels + on-demand movies.', url: 'https://pluto.tv', color: '#FFCC00', free: true, subtitle: 'Free with Ads' },
  { name: 'Plex', description: 'Free movies, TV shows, and live channels.', url: 'https://plex.tv', color: '#E5A00D', free: true, subtitle: 'Free with Ads' },
  { name: 'Kanopy', description: 'Free with library card. Quality films.', url: 'https://kanopy.com', color: '#00A89B', free: true, subtitle: 'Free with Library Card' },
];

const PAID_PLATFORMS: Platform[] = [
  { name: 'Netflix', description: 'The world\'s #1 streaming platform. Movies, series, originals.', url: 'https://netflix.com', color: '#E50914', free: false, subtitle: 'Subscription' },
  { name: 'Hulu', description: 'Next-day TV, hit movies, Hulu originals.', url: 'https://hulu.com', color: '#1CE783', free: false, subtitle: 'Subscription' },
  { name: 'Disney+', description: 'Disney, Marvel, Star Wars, Pixar, National Geographic.', url: 'https://disneyplus.com', color: '#113CCF', free: false, subtitle: 'Subscription' },
  { name: 'Max (HBO Max)', description: 'HBO, Warner Bros, DC. Premium content.', url: 'https://max.com', color: '#8A05BE', free: false, subtitle: 'Subscription' },
  { name: 'Amazon Prime Video', description: 'Movies, TV, originals. Included with Prime.', url: 'https://primevideo.com', color: '#00A8E0', free: false, subtitle: 'Subscription' },
  { name: 'Apple TV+', description: 'Award-winning originals. New releases weekly.', url: 'https://tv.apple.com', color: '#000000', free: false, subtitle: 'Subscription' },
  { name: 'Discovery+', description: 'Discovery, HGTV, Food Network, TLC. Reality TV.', url: 'https://discoveryplus.com', color: '#0057FF', free: false, subtitle: 'Subscription' },
  { name: 'Paramount+', description: 'CBS, Paramount movies, originals, live sports.', url: 'https://paramountplus.com', color: '#0064FF', free: false, subtitle: 'Subscription' },
  { name: 'Peacock', description: 'NBC, Universal movies, originals. Free tier available.', url: 'https://peacocktv.com', color: '#000000', free: false, subtitle: 'Free + Premium' },
  { name: 'Starz', description: 'Premium movies, Starz originals. Add-on service.', url: 'https://starz.com', color: '#000000', free: false, subtitle: 'Subscription' },
  { name: 'Showtime', description: 'Hit series, movies, boxing. Premium content.', url: 'https://showtime.com', color: '#FF0000', free: false, subtitle: 'Subscription' },
  { name: 'Apple iTunes', description: 'Rent or buy movies. Latest releases.', url: 'https://tv.apple.com', color: '#007AFF', free: false, subtitle: 'Rent/Buy' },
  { name: 'Google Play', description: 'Rent or buy movies. Cross-device access.', url: 'https://play.google.com/store/movies', color: '#34A853', free: false, subtitle: 'Rent/Buy' },
  { name: 'RedBox', description: 'Rent new releases. Kiosks + streaming.', url: 'https://redbox.com', color: '#E31837', free: false, subtitle: 'Rent/Buy' },
  { name: 'FlixFling', description: 'Rent indie and classic films. Low prices.', url: 'https://flixfling.com', color: '#FF6600', free: false, subtitle: 'Rent/Buy' },
  { name: 'Volta', description: 'Independent films. Rent or buy.', url: 'https://volta.ie', color: '#1B1B1B', free: false, subtitle: 'Rent/Buy' },
];

function PlatformCard({ p, idx }: { p: Platform; idx: number }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden border border-[#1e1e1e] bg-[#111] hover:border-[#333] transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1"
      style={{ animationDelay: `${idx * 30}ms` }}
    >
      {/* Header bar */}
      <div className="h-2 w-full" style={{ background: p.color }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{ background: p.color }}
            >
              {p.name[0]}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{p.name}</h3>
              <p className="text-[10px] text-gray-500">{p.subtitle}</p>
            </div>
          </div>
          {p.free && (
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full border border-green-500/30">
              FREE
            </span>
          )}
        </div>
        <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
          {p.description}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-gray-500 group-hover:text-white transition-colors">
          <ExternalLink size={10} />
          <span className="font-medium">Open {p.name}</span>
        </div>
      </div>
    </a>
  );
}

export default function StreamingHubPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'free' | 'paid'>('all');

  const freeCount = FREE_PLATFORMS.length;
  const paidCount = PAID_PLATFORMS.length;

  const allPlatforms = [...FREE_PLATFORMS, ...PAID_PLATFORMS];
  const visible = tab === 'all' ? allPlatforms : tab === 'free' ? FREE_PLATFORMS : PAID_PLATFORMS;

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
              <Play size={24} className="text-red-500" fill="currentColor" /> Streaming Hub
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {freeCount} free platforms · {paidCount} paid platforms — all in one place
            </p>
          </div>
        </div>

        {/* Free Movies Promo Banner */}
        <Link to="/free-movies">
          <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-[#1a2e1a] via-[#132e13] to-[#0f3d0f] p-5 md:p-6 group hover:shadow-xl hover:shadow-green-900/20 transition-all duration-500 cursor-pointer border border-[#1e1e1e] hover:border-green-600/30">
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-600/10 rounded-full blur-3xl group-hover:bg-green-600/20 transition-all" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-5">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-600/30 group-hover:scale-110 transition-transform">
                <Play size={24} fill="white" className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-0.5 group-hover:text-green-400 transition-colors">
                  Watch Free Movies Now
                </h2>
                <p className="text-gray-400 text-xs">
                  16+ public domain films you can watch instantly — no subscription, no ads. Classic horror, sci-fi, comedy & more.
                </p>
              </div>
              <div className="flex items-center gap-2 text-green-400 text-xs font-semibold group-hover:gap-3 transition-all">
                <span>Watch Free</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* Hero banner */}
        <div className="relative rounded-2xl overflow-hidden mb-10 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-green-400" />
              <span className="text-green-400 text-xs font-bold tracking-wider uppercase">100% Legal & Safe</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Watch Movies & TV Shows
            </h2>
            <p className="text-gray-400 text-sm max-w-xl leading-relaxed mb-4">
              Browse {allPlatforms.length} streaming platforms — from free ad-supported services to premium subscriptions.
              Every link takes you to the official platform. No piracy, no sketchy sites.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full border border-white/10">
                {freeCount} Free Services
              </span>
              <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full border border-white/10">
                {paidCount} Paid Services
              </span>
              <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full border border-white/10">
                Official Links Only
              </span>
            </div>
          </div>
        </div>

        {/* Tab filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
          {[
            { key: 'all' as const, label: 'All Platforms', count: allPlatforms.length },
            { key: 'free' as const, label: 'Free', count: freeCount },
            { key: 'paid' as const, label: 'Paid', count: paidCount },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'bg-[#111] border border-[#222] text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-[#222] text-gray-500'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((p, idx) => (
            <PlatformCard key={p.name} p={p} idx={idx} />
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center border-t border-[#1e1e1e] pt-8">
          <p className="text-gray-600 text-xs">
            Ezihe Movie Center is a discovery platform. We don't host any content — we connect you to official streaming services.
          </p>
          <p className="text-gray-700 text-[10px] mt-2">
            Movie data provided by TMDB · Streaming links provided by their respective platforms
          </p>
        </div>
      </div>
    </div>
  );
}
