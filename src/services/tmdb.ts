const API_KEY = '2dca580c2a14b55200e784d157207b4d';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return 'https://via.placeholder.com/500x750/1a1a1a/666666?text=No+Image';
  return `${IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: string = 'original'): string => {
  if (!path) return 'https://via.placeholder.com/1920x1080/1a1a1a/666666?text=No+Image';
  return `${IMAGE_BASE}/${size}${path}`;
};

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
}

export interface MovieDetails extends Movie {
  imdb_id: string | null;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  budget: number;
  revenue: number;
  status: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

const fetchFromTMDB = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  const searchParams = new URLSearchParams({
    api_key: API_KEY,
    ...params,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${searchParams}`);
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status}`);
  }
  return response.json();
};

export const getTrending = async (timeWindow: 'day' | 'week' = 'week'): Promise<MovieResponse> => {
  return fetchFromTMDB(`/trending/movie/${timeWindow}`);
};

export const getPopular = async (page: number = 1): Promise<MovieResponse> => {
  return fetchFromTMDB('/movie/popular', { page: String(page) });
};

export const getTopRated = async (page: number = 1): Promise<MovieResponse> => {
  return fetchFromTMDB('/movie/top_rated', { page: String(page) });
};

export const getNowPlaying = async (page: number = 1): Promise<MovieResponse> => {
  return fetchFromTMDB('/movie/now_playing', { page: String(page) });
};

export const getUpcoming = async (page: number = 1): Promise<MovieResponse> => {
  return fetchFromTMDB('/movie/upcoming', { page: String(page) });
};

export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
  return fetchFromTMDB(`/movie/${id}`);
};

export const getMovieVideos = async (id: number): Promise<{ results: Video[] }> => {
  return fetchFromTMDB(`/movie/${id}/videos`);
};

export const getMovieCredits = async (id: number): Promise<{ cast: Cast[] }> => {
  return fetchFromTMDB(`/movie/${id}/credits`);
};

export const getSimilarMovies = async (id: number): Promise<MovieResponse> => {
  return fetchFromTMDB(`/movie/${id}/similar`);
};

export const searchMovies = async (query: string, page: number = 1): Promise<MovieResponse> => {
  return fetchFromTMDB('/search/movie', { query, page: String(page) });
};

export const getGenres = async (): Promise<{ genres: Genre[] }> => {
  return fetchFromTMDB('/genre/movie/list');
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<MovieResponse> => {
  return fetchFromTMDB('/discover/movie', {
    with_genres: String(genreId),
    page: String(page),
    sort_by: 'popularity.desc',
  });
};

// TV Shows
export interface TVShow {
  id: number; name: string; overview: string;
  poster_path: string | null; backdrop_path: string | null;
  first_air_date: string; vote_average: number; vote_count: number;
  genre_ids: number[]; popularity: number; original_language: string; origin_country: string[];
}

export interface TVShowDetails {
  id: number; name: string; overview: string;
  poster_path: string | null; backdrop_path: string | null;
  first_air_date: string; vote_average: number; vote_count: number;
  popularity: number; original_language: string;
  genres: { id: number; name: string }[];
  tagline: string; status: string;
  number_of_seasons: number; number_of_episodes: number;
  seasons: { id: number; name: string; season_number: number; episode_count: number; air_date: string | null; poster_path: string | null; overview: string }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  episode_run_time: number[]; in_production: boolean;
  last_air_date: string | null; type: string;
}

export interface SeasonDetails {
  episodes: { id: number; name: string; episode_number: number; season_number: number; overview: string; still_path: string | null; air_date: string | null; vote_average: number; runtime: number | null }[];
  name: string; overview: string; season_number: number; poster_path: string | null;
}

export interface TVResponse {
  page: number; results: TVShow[]; total_pages: number; total_results: number;
}

export const getTrendingTV = async (timeWindow: 'day' | 'week' = 'week'): Promise<TVResponse> =>
  fetchFromTMDB(`/trending/tv/${timeWindow}`);
export const getPopularTV = async (page: number = 1): Promise<TVResponse> =>
  fetchFromTMDB('/tv/popular', { page: String(page) });
export const getTopRatedTV = async (page: number = 1): Promise<TVResponse> =>
  fetchFromTMDB('/tv/top_rated', { page: String(page) });
export const getAiringToday = async (page: number = 1): Promise<TVResponse> =>
  fetchFromTMDB('/tv/airing_today', { page: String(page) });
export const getOnTheAir = async (page: number = 1): Promise<TVResponse> =>
  fetchFromTMDB('/tv/on_the_air', { page: String(page) });
export const getTVShowDetails = async (id: number): Promise<TVShowDetails> =>
  fetchFromTMDB(`/tv/${id}`);
export const getTVSeasonDetails = async (id: number, seasonNumber: number): Promise<SeasonDetails> =>
  fetchFromTMDB(`/tv/${id}/season/${seasonNumber}`);
export const getTVShowCredits = async (id: number): Promise<{ cast: Cast[] }> =>
  fetchFromTMDB(`/tv/${id}/credits`);
export const getTVShowVideos = async (id: number): Promise<{ results: Video[] }> =>
  fetchFromTMDB(`/tv/${id}/videos`);
export const getSimilarTVShows = async (id: number): Promise<TVResponse> =>
  fetchFromTMDB(`/tv/${id}/similar`);
export const searchTV = async (query: string, page: number = 1): Promise<TVResponse> =>
  fetchFromTMDB('/search/tv', { query, page: String(page) });
export const getTVGenres = async (): Promise<{ genres: Genre[] }> =>
  fetchFromTMDB('/genre/tv/list');
export const getTVShowsByGenre = async (genreId: number, page: number = 1): Promise<TVResponse> =>
  fetchFromTMDB('/discover/tv', { with_genres: String(genreId), page: String(page), sort_by: 'popularity.desc' });
