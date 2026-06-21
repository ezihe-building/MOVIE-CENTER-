import { Film, Youtube, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#111] border-t border-[#222] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
                <Film size={20} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Ezihe</span>
                <span className="text-xs text-gray-400 block -mt-1 tracking-widest uppercase">
                  Movie Center
                </span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your ultimate movie discovery and trailer platform. Explore thousands of movies, watch trailers, and find your next favorite film.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'Movies', to: '/movies' },
                { label: 'Trending', to: '/trending' },
                { label: 'Categories', to: '/categories' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-gray-500 hover:text-white text-sm transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-white font-semibold mb-4">Top Genres</h3>
            <ul className="space-y-2">
              {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'].map((genre) => (
                <li key={genre}>
                  <span className="text-gray-500 text-sm">{genre}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">About</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Movie data provided by TMDB. Trailers powered by YouTube. This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
            <div className="flex items-center gap-4">
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDB Logo"
                className="h-5 opacity-50"
              />
              <Youtube size={20} className="text-gray-500" />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#222] text-center">
          <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
            &copy; {new Date().getFullYear()} Ezihe Movie Center. Made with <Heart size={14} className="text-red-500" fill="currentColor" /> for movie lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
