const API_KEY = (import.meta.env.VITE_WATCHMODE_API_KEY as string) || 'wawCZs1svKeZZCsVdAA42ykEis2MHjz2tiU9VNBv';
const BASE_URL = 'https://api.watchmode.com/v1';

export interface StreamingSource {
  source_id: number;
  name: string;
  type: 'sub' | 'rent' | 'buy' | 'free' | 'tve';
  region: string;
  web_url: string;
  ios_url?: string;
  android_url?: string;
  format: string;
  price?: number;
  seasons?: number;
  episodes?: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  Netflix: '#E50914',
  'Amazon Prime Video': '#00A8E0',
  'Disney+': '#113CCF',
  'Hulu': '#1CE783',
  'Apple TV+': '#000000',
  'HBO Max': '#8A05BE',
  'Max': '#8A05BE',
  Peacock: '#000000',
  Paramount: '#0064FF',
  'Tubi TV': '#FA5B18',
  Crackle: '#D71920',
  Pluto: '#FFC21A',
  Plex: '#E5A00D',
  Kanopy: '#00A89B',
  Starz: '#000000',
  Showtime: '#FF0000',
};

export const getPlatformColor = (name: string): string =>
  PLATFORM_COLORS[name] ?? '#374151';

export const getPlatformIcon = (name: string): string => {
  const icons: Record<string, string> = {
    Netflix: 'N',
    'Amazon Prime Video': 'P',
    'Disney+': 'D+',
    'Hulu': 'H',
    'Apple TV+': '',
    'HBO Max': 'HBO',
    Max: 'Max',
    Peacock: '🦚',
    Paramount: 'P+',
    'Tubi TV': 'Tubi',
    Crackle: 'C',
    Plex: 'Plex',
    Kanopy: 'K',
    Starz: 'Starz',
    Showtime: 'SHO',
  };
  return icons[name] ?? name.slice(0, 3);
};

export async function getStreamingSources(tmdbId: number, type: 'movie' | 'tv' = 'movie'): Promise<StreamingSource[]> {
  if (!API_KEY) {
    console.warn('VITE_WATCHMODE_API_KEY not set');
    return [];
  }
  try {
    const res = await fetch(
      `${BASE_URL}/title/tmdb_${type}_${tmdbId}/sources/?apiKey=${API_KEY}&regions=US`
    );
    if (!res.ok) return [];
    const data: StreamingSource[] = await res.json();
    const seen = new Set<string>();
    return data
      .filter(s => s.region === 'US')
      .filter(s => {
        const key = `${s.name}-${s.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const order = ['sub', 'free', 'tve', 'rent', 'buy'];
        return order.indexOf(a.type) - order.indexOf(b.type);
      });
  } catch {
    return [];
  }
}
