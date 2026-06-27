import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film } from 'lucide-react';

export default function FreeMoviesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0a0a] pt-16 pb-2">
      {/* Compact header */}
      <div className="px-4 sm:px-6 lg:px-8 mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-[#111] border border-[#222] text-white rounded-full hover:bg-[#222] transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Film size={18} className="text-red-500" /> Free Movies
            </h1>
          </div>
          <span className="ml-auto flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full">
            FREE
          </span>
        </div>
      </div>

      {/* Full-size CINEXORA iframe */}
      <div className="px-2 sm:px-4 lg:px-6">
        <div className="relative w-full bg-black rounded-xl overflow-hidden border border-[#1a1a1a]" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
          <iframe
            src="https://cinexora.emmyhenztech.site/livetv.html"
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Free Movies & TV Shows"
            loading="eager"
          />
        </div>
      </div>

      {/* Compact footer */}
      <div className="px-4 sm:px-6 lg:px-8 mt-2 flex items-center justify-between">
        <p className="text-gray-600 text-[10px]">
          Powered by <span className="text-red-500 font-bold">CINEXORA</span>
        </p>
        <p className="text-gray-700 text-[10px]">
          Free-to-air streams.
        </p>
      </div>
    </div>
  );
}
