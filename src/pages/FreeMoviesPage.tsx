import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, ExternalLink } from 'lucide-react';

export default function FreeMoviesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-14">
      {/* Minimal header */}
      <div className="px-3 sm:px-4 mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 bg-[#111] border border-[#222] text-white rounded-full hover:bg-[#222] transition-all"
          >
            <ArrowLeft size={14} />
          </button>
          <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Film size={14} className="text-red-500" /> Free Movies
          </h1>
        </div>
        <a
          href="https://cinexora.emmyhenztech.site"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-gray-500 hover:text-red-400 text-[10px] transition-colors"
        >
          <ExternalLink size={10} /> Open CINEXORA
        </a>
      </div>

      {/* Full-viewport CINEXORA iframe — root URL for movies/TV shows */}
      <div className="px-1 sm:px-2 mt-1">
        <div
          className="relative w-full bg-black rounded-lg overflow-hidden border border-[#1a1a1a]"
          style={{ height: 'calc(100vh - 95px)', minHeight: '300px' }}
        >
          <iframe
            src="https://cinexora.emmyhenztech.site"
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Free Movies & TV Shows"
            loading="eager"
            importance="high"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}
