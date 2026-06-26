import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, ExternalLink } from 'lucide-react';

export default function FreeMoviesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-24">
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
              <Film size={20} className="text-red-500" /> Free Movies
            </h1>
            <p className="text-gray-500 text-xs">Watch free movies & TV shows</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 bg-[#E50914] text-white text-[10px] font-black tracking-wider px-3 py-1.5 rounded-full">
            FREE
          </span>
        </div>

        {/* CINEXORA iframe - full width */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#1e1e1e] shadow-2xl">
          <iframe
            src="https://cinexora.emmyhenztech.site/livetv.html"
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Free Movies & TV Shows"
            loading="eager"
          />
        </div>

        {/* CINEXORA credit */}
        <div className="flex items-center justify-between mt-4 bg-[#111] border border-[#222] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">Powered by</span>
            <a
              href="https://cinexora.emmyhenztech.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs font-bold transition-colors"
            >
              CINEXORA
            </a>
          </div>
          <a
            href="https://cinexora.emmyhenztech.site"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-500 hover:text-white text-xs transition-colors"
          >
            <ExternalLink size={12} /> Open CINEXORA
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 bg-[#111] border border-[#222] rounded-xl px-4 py-3">
          <p className="text-gray-600 text-xs leading-relaxed">
            Free content is provided by <strong className="text-gray-500">CINEXORA</strong>.
            All streams are free-to-air. Channel availability depends on upstream sources.
            Ezihe Movie Center does not host, upload, or distribute any video content.
          </p>
        </div>

        {/* Footer credit */}
        <div className="mt-10 text-center border-t border-[#1e1e1e] pt-6">
          <p className="text-gray-600 text-xs">
            Free content powered by{' '}
            <a
              href="https://cinexora.emmyhenztech.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 font-semibold transition-colors"
            >
              CINEXORA
            </a>
          </p>
          <p className="text-gray-700 text-[10px] mt-2">
            Free-to-air channels only. Availability depends on upstream sources.
          </p>
        </div>
      </div>
    </div>
  );
}
