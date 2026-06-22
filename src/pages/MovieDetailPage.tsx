import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Star, Clock, Calendar, ArrowLeft, Globe, Users, X,
  Film, Youtube, ExternalLink, Clapperboard, Tv
} from 'lucide-react';
import {
  getMovieDetails, getMovieVideos,
  getMovieCredits, getSimilarMovies, getImageUrl, getBackdropUrl,
  MovieDetails, Video, Cast, Movie,
} from '../services/tmdb';
import MovieRow from '../components/MovieRow';
import StreamingPlatforms from '../components/StreamingPlatforms';
import { DetailSkeleton } from '../components/LoadingSkeleton';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [trailerPlaying, setTrailerPlaying] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      setLoading(true);
      setShowTrailerModal(false);
      setTrailerPlaying(false);
      setSelectedVideo(null);

      try {
        const movieId = parseInt(id);
        const [movieRes, videosRes, creditsRes, similarRes] = await Promise.all([
          getMovieDetails(movieId),
          getMovieVideos(movieId),
          getMovieCredits(movieId),
          getSimilarMovies(movieId),
        ]);

        setMovie(movieRes);

        // Get all YouTube videos
        const youtubeVideos = videosRes.results.filter(
          (v) => v.site === 'YouTube'
        );
        setVideos(youtubeVideos);

        // Find the best trailer
        const officialTrailer = youtubeVideos.find(
          (v) => v.type === 'Trailer' && v.official
        ) || youtubeVideos.find(
          (v) => v.type === 'Trailer'
        ) || youtubeVideos.find(
          (v) => v.type === 'Teaser'
        ) || youtubeVideos[0] || null;

        setTrailer(officialTrailer);
        setCast(creditsRes.cast.slice(0, 15));
        setSimilar(similarRes.results);
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!movie) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Film size={64} className="text-gray-600 mx-auto mb-4" />
        <p className="text-white text-xl font-semibold">Movie not found</p>
        <p className="text-gray-500 mt-2">The movie you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-300">
          Go Home
        </button>
      </div>
    </div>
  );

  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const formatMoney = (amount: number) => {
    if (amount === 0) return 'N/A';
    return '$' + amount.toLocaleString();
  };

  const handlePlayTrailer = () => {
    if (trailer) {
      setSelectedVideo(trailer);
      setShowTrailerModal(true);
    }
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowTrailerModal(true);
  };

  const handlePlayInline = () => {
    setTrailerPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[65vh]">
        <img src={getBackdropUrl(movie.backdrop_path)} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-[#0a0a0a]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 to-transparent" />

        <button onClick={() => navigate(-1)} className="absolute top-24 left-4 sm:left-8 p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm z-10">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 md:-mt-56 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-48 md:w-64 lg:w-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <img src={getImageUrl(movie.poster_path, 'w780')} alt={movie.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-gray-400 italic text-lg mb-4">"{movie.tagline}"</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-[#f5c518]">
                <Star size={18} fill="currentColor" />
                <span className="font-bold text-lg">{movie.vote_average.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({movie.vote_count.toLocaleString()})</span>
              </div>
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={16} />
                  <span className="text-sm">{formatRuntime(movie.runtime)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar size={16} />
                <span className="text-sm">
                  {movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
              {movie.original_language && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Globe size={16} />
                  <span className="text-sm uppercase">{movie.original_language}</span>
                </div>
              )}
              {movie.imdb_id && (
                <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#f5c518]/20 text-[#f5c518] text-xs font-bold rounded-md hover:bg-[#f5c518]/30 transition-colors duration-300">
                  <ExternalLink size={12} />
                  IMDb
                </a>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="px-3 py-1.5 bg-white/10 text-white text-xs font-medium rounded-full border border-white/10">
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-2 text-lg">Overview</h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                {movie.overview || 'No overview available.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
              {trailer ? (
                <button
                  onClick={handlePlayTrailer}
                  className="flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-red-600/30 text-sm md:text-base"
                >
                  <Play size={20} fill="currentColor" />
                  Watch Trailer
                </button>
              ) : (
                <div className="flex items-center gap-2 px-8 py-3.5 bg-gray-700 text-gray-400 font-semibold rounded-xl text-sm md:text-base cursor-not-allowed">
                  <Play size={20} />
                  No Trailer Available
                </div>
              )}

              {movie.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${movie.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-3.5 bg-[#f5c518]/20 hover:bg-[#f5c518]/30 text-[#f5c518] font-semibold rounded-xl transition-all duration-300 text-sm md:text-base"
                >
                  <ExternalLink size={18} />
                  View on IMDb
                </a>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {movie.budget > 0 && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-white font-semibold text-sm">{formatMoney(movie.budget)}</p>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Revenue</p>
                  <p className="text-white font-semibold text-sm">{formatMoney(movie.revenue)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Status</p>
                <p className="text-white font-semibold text-sm">{movie.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Trailer Section ─── */}
        <div className="mt-12 md:mt-16" id="trailer-section">
          <div className="flex items-center gap-3 mb-6">
            <Youtube size={22} className="text-red-600" />
            <h2 className="text-2xl font-bold text-white">Official Trailer</h2>
          </div>

          {trailer ? (
            <div className="relative w-full aspect-video bg-[#111] rounded-2xl overflow-hidden ring-1 ring-white/5 shadow-2xl">
              {trailerPlaying ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media"
                  title={`${movie.title} - ${trailer.name}`}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
              ) : (
                <div
                  onClick={handlePlayInline}
                  className="relative w-full h-full cursor-pointer group"
                >
                  {/* YouTube thumbnail */}
                  <img
                    src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`}
                    alt={trailer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-red-600/40">
                        <Play size={36} fill="white" className="text-white ml-1" />
                      </div>
                      <p className="text-white font-bold text-lg drop-shadow-lg">Play Trailer</p>
                      <p className="text-gray-300 text-sm mt-1 drop-shadow-lg">{trailer.name}</p>
                    </div>
                  </div>

                  {/* YouTube badge */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
                    <Youtube size={16} className="text-red-500" />
                    <span className="text-white text-xs font-medium">YouTube</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-video bg-[#111] rounded-2xl flex items-center justify-center ring-1 ring-white/5">
              <div className="text-center">
                <Clapperboard size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-semibold text-lg">No trailer available yet</p>
                <p className="text-gray-600 text-sm mt-2">Check back later for the official trailer</p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Where to Watch ─── */}
        <div className="mt-12 md:mt-16">
          <div className="flex items-center gap-3 mb-6">
            <Tv size={22} className="text-red-600" />
            <h2 className="text-2xl font-bold text-white">Where to Watch</h2>
          </div>
          <StreamingPlatforms tmdbId={movie.id} type="movie" />
        </div>

        {/* ─── More Videos Section ─── */}
        {videos.length > 1 && (
          <div className="mt-12 md:mt-16">
            <div className="flex items-center gap-3 mb-6">
              <Clapperboard size={22} className="text-red-600" />
              <h2 className="text-2xl font-bold text-white">More Videos</h2>
              <span className="text-gray-500 text-sm">({videos.length} videos)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handlePlayVideo(video)}
                  className={`group cursor-pointer rounded-xl overflow-hidden bg-[#111] ring-1 ring-white/5 hover:ring-red-600/50 transition-all duration-300 ${
                    selectedVideo?.id === video.id ? 'ring-red-600/50 bg-red-600/5' : ''
                  }`}
                >
                  <div className="relative aspect-video">
                    <img
                      src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                      alt={video.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Play size={20} fill="white" className="text-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs font-medium text-white">
                      {video.type}
                    </div>
                    {video.official && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-green-600/80 backdrop-blur-sm rounded text-xs font-bold text-white">
                        Official
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-red-500 transition-colors duration-300">
                      {video.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Youtube size={14} className="text-red-500" />
                      <span className="text-gray-500 text-xs">{video.site}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cast Section */}
        {cast.length > 0 && (
          <div className="mt-12 md:mt-16">
            <div className="flex items-center gap-3 mb-6">
              <Users size={22} className="text-red-600" />
              <h2 className="text-2xl font-bold text-white">Cast</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
              {cast.map((person) => (
                <div key={person.id} className="flex-shrink-0 w-28 md:w-32 text-center group">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden bg-[#1a1a1a] mb-3 ring-2 ring-[#2a2a2a] group-hover:ring-red-600/50 transition-all duration-300">
                    <img
                      src={person.profile_path ? getImageUrl(person.profile_path, 'w185') : 'https://via.placeholder.com/185x278/1a1a1a/666666?text=No+Photo'}
                      alt={person.name} className="w-full h-full object-cover" loading="lazy"
                    />
                  </div>
                  <p className="text-white text-xs font-semibold line-clamp-1">{person.name}</p>
                  <p className="text-gray-500 text-xs line-clamp-1">{person.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Production Companies */}
        {movie.production_companies.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h3 className="text-lg font-semibold text-white mb-4">Production</h3>
            <div className="flex flex-wrap gap-4">
              {movie.production_companies.map((company) => (
                <div key={company.id} className="flex items-center gap-3 px-4 py-3 bg-[#111] rounded-xl ring-1 ring-white/5">
                  {company.logo_path ? (
                    <img
                      src={getImageUrl(company.logo_path, 'w92')}
                      alt={company.name}
                      className="h-6 object-contain brightness-200"
                    />
                  ) : null}
                  <span className="text-gray-300 text-sm">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Similar Movies */}
      {similar.length > 0 && (
        <div className="mt-12 md:mt-16">
          <MovieRow title="Similar Movies" movies={similar} />
        </div>
      )}

      {/* ─── Trailer Modal ─── */}
      {showTrailerModal && selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fadeIn">
          <button onClick={() => { setShowTrailerModal(false); setSelectedVideo(null); }}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 z-10 hover:rotate-90">
            <X size={24} />
          </button>

          {/* Video title bar */}
          <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
            <Youtube size={24} className="text-red-500" />
            <div>
              <p className="text-white font-semibold text-sm line-clamp-1">{movie.title}</p>
              <p className="text-gray-400 text-xs">{selectedVideo.name}</p>
            </div>
          </div>

          <div className="w-full max-w-5xl aspect-video bg-[#111] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0&modestbranding=1`}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media"
              title={`${movie.title} - ${selectedVideo.name}`}
              className="w-full h-full"
              style={{ border: 'none' }}
            />
          </div>

          {/* Video selector at bottom */}
          {videos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 overflow-x-auto hide-scrollbar max-w-full px-4">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedVideo.id === video.id
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {video.type}: {video.name.length > 25 ? video.name.substring(0, 25) + '...' : video.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
