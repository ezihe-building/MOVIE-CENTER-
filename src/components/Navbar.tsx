import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Film, Home, TrendingUp, Grid3X3, Clapperboard, Tv, Radio, Play, Sparkles, MonitorPlay } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowSearch(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/movies', label: 'Movies', icon: <Clapperboard size={18} /> },
    { to: '/tv', label: 'TV Series', icon: <Tv size={18} /> },
    { to: '/watch', label: 'Watch Now', icon: <MonitorPlay size={18} /> },
    { to: '/live', label: 'Live TV', icon: <Radio size={18} /> },
    { to: '/trending', label: 'Trending', icon: <TrendingUp size={18} /> },
    { to: '/categories', label: 'Categories', icon: <Grid3X3 size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-black/50'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors duration-300 shadow-lg shadow-red-600/30">
              <Film size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight">
                Ezihe
              </span>
              <span className="text-[10px] md:text-xs text-gray-400 tracking-widest uppercase leading-tight -mt-0.5">
                Movie Center
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(link.to)
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <div
                  className={`flex items-center transition-all duration-300 rounded-full overflow-hidden ${
                    showSearch ? 'w-72 bg-[#222] border border-[#333]' : 'w-10'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setShowSearch(!showSearch)}
                    className="p-2.5 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    <Search size={18} />
                  </button>
                  {showSearch && (
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search movies..."
                      className="w-full bg-transparent text-white text-sm pr-4 py-2 outline-none placeholder-gray-500"
                      autoFocus
                    />
                  )}
                </div>
              </form>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-full bg-[#222] text-white text-sm px-4 py-3 rounded-xl outline-none placeholder-gray-500 border border-[#333] focus:border-red-600/50 transition-colors"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-[#111]/98 backdrop-blur-xl border-t border-[#222] animate-fadeIn">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(link.to)
                    ? 'text-white bg-red-600/20 text-red-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
