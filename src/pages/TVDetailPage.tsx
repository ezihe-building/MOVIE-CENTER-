import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Calendar, ArrowLeft, Globe, Users, Tv, Youtube, X, Play, Clapperboard, ExternalLink } from 'lucide-react';
import {
  getTVShowDetails, getTVShowVideos, getTVShowCredits, getSimilarTVShows, getTVSeasonDetails,
  getImageUrl, getBackdropUrl, TVShowDetails, SeasonDetails, Video, Cast, TVShow,
} from '../services/tmdb';
import TVRow from '../components/TVRow';
import StreamingPlatforms from '../components/StreamingPlatforms';
import { DetailSkeleton } from '../components/LoadingSkeleton';

export default function TVDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [show, setShow] = useState<TVShowDetails | null>(null);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [videos, setVideos] = useState<Video[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similar, setSimilar] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [trailerPlaying, setTrailerPlaying] = useState(false);

  useEffect(() => {
    const fetchShow = async () => {
      if (!id) return;
      setLoading(true);
      setShowTrailerModal(false);
      setTrailerPlaying(false);
      setSelectedVideo(null);
      try {
        const showId = parseInt(id);
        const [showRes, videosRes, creditsRes, similarRes] = await Promise.all([
          getTVShowDetails(showId),
          getTVShowVideos(showId),
          getTVShowCredits(showId),
          getSimilarTVShows(showId),
        ]);
        setShow(showRes);
        const youtubeVideos = videosRes.results.filter(v => v.site === 'YouTube');
        setVideos(youtubeVideos);
        const officialTrailer = youtubeVideos.find(v => v.type === 'Trailer' && v.official)
          || youtubeVideos.find(v => v.type === 'Trailer')
          || youtubeVideos.find(v => v.type === 'Teaser')
          || youtubeVideos[0] || null;
        setTrailer(officialTrailer);
        setCast(creditsRes.cast.slice(0, 15));
        setSimilar(similarRes.results);
        if (showRes.seasons.length > 0) {
          const s = showRes.seasons.find(se => se.season_number === 1)?.season_number ?? showRes.seasons[0].season_number;
          setSelectedSeason(s);
          const sd = await getTVSeasonDetails(showId, s);
          setSeasonDetails(sd);
        }
      } catch (error) {
        console.error('Failed to fetch TV show:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShow();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleSeasonChange = async (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    if (!id) return;
    try {
      const sd = await getTVSeasonDetails(parseInt(id), seasonNumber);
      setSeasonDetails(sd);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!show) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Tv size={64} className="text-gray-600 mx-auto mb-4" />
        <p className="text-white text-xl font-semibold">TV show not found</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-300">
          Go Home
        </button>
      </div>
    </div>
  );

  const handlePlayTrailer = () => {
    if (trailer) {
      setSelectedVideo(trailer);
      setShowTrailerModal(true);
    }
  };

  const handlePlayInline = () => {
    setTrailerPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[65vh]">
        <img src={getBackdropUrl(show.backdrop_path)} alt={show.name} className="w-full h-full object-cover" />
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
              <img src={getImageUrl(show.poster_path, 'w780')} alt={show.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight">
              {show.name}
            </h1>

            {show.tagline && (
              <p className="text-gray-400 italic text-lg mb-4">"{show.tagline}"</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-[#f5c518]">
                <Star size={18} fill="currentColor" />
                <span className="font-bold text-lg">{show.vote_average.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({show.vote_count.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar size={16} />
                <span className="text-sm">
                  {show.first_air_date ? new Date(show.first_air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
              {show.original_language && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Globe size={16} />
                  <span className="text-sm uppercase">{show.original_language}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-gray-400">
                <Tv size={16} />
                <span className="text-sm">{show.number_of_seasons} season{show.number_of_seasons !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="text-sm">{show.number_of_episodes} episode{show.number_of_episodes !== 1 ? 's' : ''}</span>
              </div>
              <span className="px-2.5 py-1 bg-white/10 text-white text-xs font-bold rounded-full border border-white/10">{show.status}</span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
              {show.genres.map((g) => (
                <span key={g.id} className="px-3 py-1.5 bg-white/10 text-white text-xs font-medium rounded-full border border-white/10">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-2 text-lg">Overview</h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                {show.overview || 'No overview available.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
              {trailer ? (
                <button onClick={handlePlayTrailer}
                  className="flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-red-600/30 text-sm md:text-base">
                  <Play size={20} fill="currentColor" />
                  Watch Trailer
                </button>
              ) : (
                <div className="flex items-center gap-2 px-8 py-3.5 bg-gray-700 text-gray-400 font-semibold rounded-xl text-sm md:text-base cursor-not-allowed">
                  <Play size={20} />
                  No Trailer Available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Where to Watch ─── */}
        <div className="mt-12 md:mt-16">
          <div className="flex items-center gap-3 mb-6">
            <Tv size={22} className="text-red-600" />
            <h2 className="text-2xl font-bold text-white">Where to Watch</h2>
          </div>
          <StreamingPlatforms tmdbId={show.id} type="tv" />
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
                  width="100%" height="100%"
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
                  frameBorder="0" allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media"
                  title={`${show.name} - ${trailer.name}`}
                  className="w-full h-full" style={{ border: 'none' }}
                />
              ) : (
                <div onClick={handlePlayInline} className="relative w-full h-full cursor-pointer group">
                  <img src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`} alt={trailer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`; }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-red-600/40">
                        <Play size={36} fill="white" className="text-white ml-1" />
                      </div>
                      <p className="text-white font-bold text-lg drop-shadow-lg">Play Trailer</p>
                      <p className="text-gray-300 text-sm mt-1 drop-shadow-lg">{trailer.name}</p>
                    </div>
                  </div>
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
              </div>
            </div>
          )}
        </div>

        {/* ─── Seasons & Episodes ─── */}
        {show.seasons.length > 0 && (
          <div className="mt-12 md:mt-16">
            <div className="flex items-center gap-3 mb-6">
              <Tv size={22} className="text-red-600" />
              <h2 className="text-2xl font-bold text-white">Seasons</h2>
            </div>
            <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
              {show.seasons.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSeasonChange(s.season_number)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedSeason === s.season_number
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-dark-600 text-gray-400 hover:bg-dark-500 hover:text-white'
                  }`}
                >
                  {s.name} ({s.episode_count} eps)
                </button>
              ))}
            </div>
            {seasonDetails && (
              <div className="space-y-3">
                {seasonDetails.episodes.map((ep) => (
                  <div key={ep.id} className="flex items-start gap-4 p-4 bg-[#111] rounded-xl ring-1 ring-white/5 hover:ring-red-600/30 transition-all duration-300">
                    <div className="flex-shrink-0 w-16 h-10 bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center text-gray-600 text-xs font-bold">
                      {ep.still_path ? (
                        <img src={getImageUrl(ep.still_path, 'w300')} alt={ep.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>S{ep.season_number} E{ep.episode_number}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-red-500 text-xs font-bold">S{ep.season_number} · E{ep.episode_number}</span>
                        <span className="text-gray-500 text-xs">{ep.air_date ? new Date(ep.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                        {ep.vote_average > 0 && (
                          <span className="text-[#f5c518] text-xs font-bold flex items-center gap-0.5">
                            <Star size={10} fill="currentColor" />{ep.vote_average.toFixed(1)}
                          </span>
                        )}
                        <span className="flex-1" />
                        <a
                          href={`https://www.themoviedb.org/tv/${show.id}/season/${ep.season_number}/episode/${ep.episode_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] bg-[#1a1a1a] hover:bg-[#222] text-gray-300 px-2 py-1 rounded-md border border-[#2a2a2a] transition-all duration-200"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink size={10} /> Watch via TMDB
                        </a>
                      </div>
                      <p className="text-white text-sm font-semibold">{ep.name}</p>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{ep.overview || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cast */}
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
                    <img src={person.profile_path ? getImageUrl(person.profile_path, 'w185') : 'https://via.placeholder.com/185x278/1a1a1a/666666?text=No+Photo'}
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
      </div>

      {/* Similar Shows */}
      {similar.length > 0 && (
        <div className="mt-12 md:mt-16">
          <TVRow title="Similar Shows" shows={similar} />
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailerModal && selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fadeIn">
          <button onClick={() => { setShowTrailerModal(false); setSelectedVideo(null); }}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 z-10 hover:rotate-90">
            <X size={24} />
          </button>
          <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
            <Youtube size={24} className="text-red-500" />
            <div>
              <p className="text-white font-semibold text-sm line-clamp-1">{show.name}</p>
              <p className="text-gray-400 text-xs">{selectedVideo.name}</p>
            </div>
          </div>
          <div className="w-full max-w-5xl aspect-video bg-[#111] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <iframe width="100%" height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0&modestbranding=1`}
              frameBorder="0" allowFullScreen
              allow="autoplay; fullscreen; encrypted-media"
              title={`${show.name} - ${selectedVideo.name}`}
              className="w-full h-full" style={{ border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
