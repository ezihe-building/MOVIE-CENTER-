import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import TrendingPage from './pages/TrendingPage';
import CategoriesPage from './pages/CategoriesPage';
import SearchPage from './pages/SearchPage';
import MovieDetailPage from './pages/MovieDetailPage';
import TVShowsPage from './pages/TVShowsPage';
import TVDetailPage from './pages/TVDetailPage';
import LiveTVPage from './pages/LiveTVPage';
import StreamingHubPage from './pages/StreamingHubPage';
import FreeMoviesPage from './pages/FreeMoviesPage';
import WatchNowPage from './pages/WatchNowPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/tv" element={<TVShowsPage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/tv/:id" element={<TVDetailPage />} />
            <Route path="/live" element={<LiveTVPage />} />
            <Route path="/stream" element={<StreamingHubPage />} />
            <Route path="/free-movies" element={<FreeMoviesPage />} />
            <Route path="/watch" element={<WatchNowPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
