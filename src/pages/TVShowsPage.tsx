import { useState, useEffect } from 'react';
import { Tv, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPopularTV, TVShow } from '../services/tmdb';
import TVCard from '../components/TVCard';
import { GridSkeleton } from '../components/LoadingSkeleton';

export default function TVShowsPage() {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true);
      try {
        const res = await getPopularTV(page);
        setShows(res.results);
        setTotalPages(Math.min(res.total_pages, 500));
      } catch (err) {
        console.error('Failed to fetch TV shows:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  if (loading) return <GridSkeleton />;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Tv size={28} className="text-red-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">TV Series</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {shows.map((show, index) => (
            <div key={show.id} className="w-full [&>div]:w-full">
              <TVCard show={show} index={index} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-12">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-dark-600 hover:bg-dark-500 text-white rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} /> Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    page === pageNum ? 'bg-red-600 text-white' : 'bg-dark-600 text-gray-400 hover:bg-dark-500 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-5 py-2.5 bg-dark-600 hover:bg-dark-500 text-white rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
