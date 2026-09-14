import { useState, useMemo, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Home, Film, Tv, Sparkles, User, Heart, Star, Bookmark,
  Clock, TrendingUp, Filter, ChevronLeft, ChevronRight, Play,
  Calendar, Award, Eye, MessageCircle, Plus, Minus, X, Menu,
  BarChart3, Settings, Bell, LogIn, ChevronDown, List, Grid3X3,
  ThumbsUp, Share2, Download, ExternalLink, Info
} from 'lucide-react';
import { allMedia, genres, typeLabels, typeColors, MediaItem } from './data/media';
import { fetchWikiSummary, WikiSummary } from './services/wiki';

// ==================== STORE ====================
interface WatchItem {
  id: number;
  status: 'want' | 'watching' | 'watched' | 'dropped' | 'waiting';
  rating?: number;
  note?: string;
}

function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [val, setVal] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

// ==================== SEARCH RESULT ====================
function SearchResult({ item, onSelect }: { item: MediaItem; onSelect: () => void }) {
  const [wikiImg, setWikiImg] = useState<string | null>(null);

  useEffect(() => {
    const wikiTitle = item.wikiTitle || item.originalTitle;
    fetchWikiSummary(item.title, wikiTitle).then(data => {
      if (data?.thumbnail?.source) setWikiImg(data.thumbnail.source);
    });
  }, [item]);

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-right"
    >
      <img src={wikiImg || item.poster} alt={item.title} className="w-10 h-14 rounded object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{item.title}</p>
        <p className="text-xs text-gray-400">{item.year} | {typeLabels[item.type]}</p>
      </div>
      <span className="text-xs text-amber-400">{item.rating}</span>
    </button>
  );
}

// ==================== HEADER ====================
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return allMedia.filter(m =>
      m.title.includes(query) || m.originalTitle.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
  }, [query]);

  return (
    <header className="glass sticky top-0 z-50 border-b border-indigo-500/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={24} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Film size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">سینمادب</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
            <Home size={16} /> خانه
          </Link>
          <Link to="/discover" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
            <Search size={16} /> کشف
          </Link>
          <Link to="/movies" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
            <Film size={16} /> فیلم‌ها
          </Link>
          <Link to="/series" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
            <Tv size={16} /> سریال‌ها
          </Link>
          <Link to="/anime" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
            <Sparkles size={16} /> انیمه
          </Link>
          <Link to="/lists" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
            <List size={16} /> لیست‌ها
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">
              <Search size={20} />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 top-full mt-2 w-80 glass rounded-xl p-3 shadow-2xl"
                >
                  <input
                    type="text"
                    placeholder="جستجوی فیلم، سریال، انیمه..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  {results.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                      {results.map(item => (
                        <SearchResult key={item.id} item={item} onSelect={() => { navigate(`/item/${item.id}`); setSearchOpen(false); setQuery(''); }} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/profile" className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">
            <User size={20} />
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden"
          >
            <nav className="p-4 space-y-1">
              {[
                { to: '/', label: 'خانه', icon: Home },
                { to: '/discover', label: 'کشف', icon: Search },
                { to: '/movies', label: 'فیلم‌ها', icon: Film },
                { to: '/series', label: 'سریال‌ها', icon: Tv },
                { to: '/anime', label: 'انیمه', icon: Sparkles },
                { to: '/lists', label: 'لیست‌ها', icon: List },
                { to: '/profile', label: 'پروفایل', icon: User },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ==================== MEDIA CARD ====================
function MediaCard({ item, size = 'md' }: { item: MediaItem; size?: 'sm' | 'md' | 'lg' }) {
  const navigate = useNavigate();
  const dims = size === 'sm' ? 'w-32' : size === 'lg' ? 'w-48' : 'w-40';
  const [wikiImg, setWikiImg] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch Wikipedia image
  useEffect(() => {
    const fetchImage = async () => {
      const wikiTitle = item.wikiTitle || item.originalTitle;
      const wikiData = await fetchWikiSummary(item.title, wikiTitle);
      if (wikiData?.thumbnail?.source) {
        setWikiImg(wikiData.thumbnail.source);
      }
      setLoading(false);
    };
    fetchImage();
  }, [item]);

  const displayImage = wikiImg || item.poster;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`${dims} flex-shrink-0 cursor-pointer group`}
      onClick={() => navigate(`/item/${item.id}`)}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
        {loading && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={displayImage}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
          style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r ${typeColors[item.type]} text-white font-medium`}>
            {typeLabels[item.type]}
          </span>
        </div>
        <div className="absolute bottom-2 right-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 text-amber-400 text-xs">
            <Star size={12} fill="currentColor" />
            <span>{item.rating}</span>
          </div>
          <p className="text-white text-xs mt-1 truncate">{item.title}</p>
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded-full px-1.5 py-0.5">
          <Star size={10} className="text-amber-400" fill="currentColor" />
          <span className="text-[10px] text-white font-medium">{item.rating}</span>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-sm text-white font-medium truncate">{item.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.year}</p>
      </div>
    </motion.div>
  );
}

// ==================== MEDIA ROW ====================
function MediaRow({ title, items, icon: Icon }: { title: string; items: MediaItem[]; icon?: any }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {Icon && <Icon size={22} className="text-indigo-400" />}
          {title}
        </h2>
        <div className="flex gap-1">
          <button onClick={() => scroll('right')} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
            <ChevronRight size={18} />
          </button>
          <button onClick={() => scroll('left')} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-0 pb-2">
        {items.map(item => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

// ==================== HERO SECTION ====================
function HeroSection() {
  const featured = allMedia.filter(m => m.rating >= 9.0).slice(0, 5);
  const [current, setCurrent] = useState(0);
  const [heroImages, setHeroImages] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % featured.length), 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  // Fetch Wikipedia images for featured items
  useEffect(() => {
    const fetchImages = async () => {
      const newImages = new Map<number, string>();
      for (const item of featured) {
        const wikiTitle = item.wikiTitle || item.originalTitle;
        const wikiData = await fetchWikiSummary(item.title, wikiTitle);
        if (wikiData?.originalimage?.source) {
          newImages.set(item.id, wikiData.originalimage.source);
        } else if (wikiData?.thumbnail?.source) {
          newImages.set(item.id, wikiData.thumbnail.source);
        }
      }
      setHeroImages(newImages);
    };
    fetchImages();
  }, []);

  const item = featured[current];
  const heroImage = heroImages.get(item.id) || item.backdrop;

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={item.title}
          className="w-full h-full object-cover transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0a0a0f]/80" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-16">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${typeColors[item.type]} text-white font-medium`}>
              {typeLabels[item.type]}
            </span>
            <span className="text-xs text-gray-300">{item.year}</span>
            <span className="flex items-center gap-1 text-amber-400 text-xs">
              <Star size={12} fill="currentColor" /> {item.rating}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">{item.title}</h1>
          <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3">{item.overview}</p>
          <div className="flex items-center gap-3">
            <Link
              to={`/item/${item.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Play size={18} /> مشاهده جزئیات
            </Link>
            <button className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
              <Plus size={18} /> افزودن به لیست
            </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-indigo-500' : 'w-3 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== HOME PAGE ====================
function HomePage() {
  const trending = [...allMedia].sort((a, b) => b.rating - a.rating).slice(0, 20);
  const movies = allMedia.filter(m => m.type === 'movie').slice(0, 20);
  const series = allMedia.filter(m => m.type === 'series').slice(0, 20);
  const anime = allMedia.filter(m => m.type === 'anime').slice(0, 20);
  const animations = allMedia.filter(m => m.type === 'animation').slice(0, 20);
  const documentaries = allMedia.filter(m => m.type === 'documentary').slice(0, 10);
  const newReleases = allMedia.filter(m => m.year >= 2023).slice(0, 20);
  const iranian = allMedia.filter(m => m.country === 'ایران').slice(0, 10);

  return (
    <div>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10 space-y-2">
        <MediaRow title="پرطرفدارترین‌ها" items={trending} icon={TrendingUp} />
        <MediaRow title="تازه‌های ۲۰۲۳ و ۲۰۲۴" items={newReleases} icon={Sparkles} />
        <MediaRow title="بهترین فیلم‌های سینمایی" items={movies} icon={Film} />
        <MediaRow title="بهترین سریال‌ها" items={series} icon={Tv} />
        <MediaRow title="بهترین انیمه‌ها" items={anime} icon={Sparkles} />
        <MediaRow title="انیمیشن‌های برتر" items={animations} icon={Film} />
        {iranian.length > 0 && <MediaRow title="سینمای ایران" items={iranian} icon={Award} />}
        <MediaRow title="مستندهای برتر" items={documentaries} icon={Eye} />
      </div>
    </div>
  );
}

// ==================== DISCOVER PAGE ====================
function DiscoverPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let items = [...allMedia];
    if (typeFilter !== 'all') items = items.filter(m => m.type === typeFilter);
    if (genreFilter !== 'all') items = items.filter(m => m.genres.includes(genreFilter));
    if (yearFilter !== 'all') {
      const [min, max] = yearFilter.split('-').map(Number);
      items = items.filter(m => m.year >= min && m.year <= max);
    }
    switch (sortBy) {
      case 'rating': items.sort((a, b) => b.rating - a.rating); break;
      case 'year': items.sort((a, b) => b.year - a.year); break;
      case 'title': items.sort((a, b) => a.title.localeCompare(b.title, 'fa')); break;
    }
    return items;
  }, [typeFilter, genreFilter, sortBy, yearFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Search className="text-indigo-400" size={32} />
        کشف محتوا
      </h1>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-8 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-400 mb-1 block">نوع محتوا</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">همه</option>
              <option value="movie">فیلم سینمایی</option>
              <option value="series">سریال</option>
              <option value="anime">انیمه</option>
              <option value="animation">انیمیشن</option>
              <option value="documentary">مستند</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-400 mb-1 block">ژانر</label>
            <select
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">همه ژانرها</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-400 mb-1 block">مرتب‌سازی</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="rating">بیشترین امتیاز</option>
              <option value="year">جدیدترین</option>
              <option value="title">الفبایی</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-400 mb-1 block">دهه</label>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">همه سال‌ها</option>
              <option value="2020-2025">۲۰۲۰ - ۲۰۲۵</option>
              <option value="2010-2019">۲۰۱۰ - ۲۰۱۹</option>
              <option value="2000-2009">۲۰۰۰ - ۲۰۰۹</option>
              <option value="1990-1999">۱۹۹۰ - ۱۹۹۹</option>
              <option value="1950-1989">قبل از ۱۹۹۰</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{filtered.length} عنوان یافت شد</span>
          <div className="flex gap-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400'}`}>
              <Grid3X3 size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400'}`}>
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(item => (
            <MediaCard key={item.id} item={item} size="sm" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <ListItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListItem({ item }: { item: MediaItem }) {
  const navigate = useNavigate();
  const [wikiImg, setWikiImg] = useState<string | null>(null);

  useEffect(() => {
    const wikiTitle = item.wikiTitle || item.originalTitle;
    fetchWikiSummary(item.title, wikiTitle).then(data => {
      if (data?.thumbnail?.source) setWikiImg(data.thumbnail.source);
    });
  }, [item]);

  return (
    <div
      onClick={() => navigate(`/item/${item.id}`)}
      className="glass rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
    >
      <img
        src={wikiImg || item.poster}
        alt={item.title}
        className="w-16 h-24 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{item.title}</h3>
        <p className="text-xs text-gray-400 mt-1">{item.originalTitle}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-300">{item.year}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${typeColors[item.type]} text-white`}>
            {typeLabels[item.type]}
          </span>
          <span className="text-xs text-gray-300">{item.genres.slice(0, 2).join('، ')}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-amber-400">
        <Star size={14} fill="currentColor" />
        <span className="text-sm font-medium">{item.rating}</span>
      </div>
    </div>
  );
}

// ==================== TYPE PAGES ====================
function TypePage({ type, title }: { type: string; title: string }) {
  const items = allMedia.filter(m => m.type === type);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">{title}</h1>
      <p className="text-gray-400 mb-8">{items.length} عنوان در این دسته</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map(item => (
          <MediaCard key={item.id} item={item} size="sm" />
        ))}
      </div>
    </div>
  );
}

// ==================== ITEM DETAIL PAGE ====================
function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = allMedia.find(m => m.id === Number(id));
  const [watchStatus, setWatchStatus] = useLocalStorage<WatchItem[]>('watchlist', []);
  const [showReview, setShowReview] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [wikiData, setWikiData] = useState<WikiSummary | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);

  // Fetch Wikipedia data
  useEffect(() => {
    if (!item) return;
    setWikiLoading(true);
    fetchWikiSummary(item.title, item.originalTitle)
      .then(data => {
        setWikiData(data);
        setWikiLoading(false);
      })
      .catch(() => setWikiLoading(false));
  }, [item]);

  if (!item) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-white text-xl">عنوان مورد نظر یافت نشد</p>
      <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-indigo-500 rounded-lg text-white">بازگشت به خانه</button>
    </div>
  );

  // Use Wikipedia images primarily
  const posterUrl = wikiData?.originalimage?.source || wikiData?.thumbnail?.source || item.poster;
  const backdropUrl = wikiData?.originalimage?.source || item.backdrop;

  const currentWatch = watchStatus.find(w => w.id === item.id);
  const similar = allMedia.filter(m => m.id !== item.id && m.genres.some(g => item.genres.includes(g)) && m.type === item.type).slice(0, 12);

  const addToWatchlist = (status: WatchItem['status']) => {
    setWatchStatus(prev => {
      const exists = prev.find(w => w.id === item.id);
      if (exists) return prev.map(w => w.id === item.id ? { ...w, status } : w);
      return [...prev, { id: item.id, status }];
    });
  };

  const statusLabels: Record<string, string> = {
    want: 'می‌خواهم ببینم',
    watching: 'در حال تماشا',
    watched: 'دیده‌شده',
    dropped: 'رهاکرده',
    waiting: 'در انتظار'
  };

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img
          src={backdropUrl}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={posterUrl}
              alt={item.title}
              className="w-48 md:w-64 rounded-2xl shadow-2xl shadow-indigo-500/20"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x600/1a1a2e/6366f1?text=${encodeURIComponent(item.title)}`; }}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${typeColors[item.type]} text-white font-medium`}>
                {typeLabels[item.type]}
              </span>
              {item.ageRating && (
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">{item.ageRating}</span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white mb-1">{item.title}</h1>
            <p className="text-gray-400 text-sm mb-4">{item.originalTitle}</p>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={20} fill="currentColor" />
                <span className="text-xl font-bold">{item.rating}</span>
                <span className="text-sm text-gray-400">/ 10</span>
              </div>
              <span className="text-gray-400">{item.year}</span>
              {item.runtime && <span className="text-gray-400">{item.runtime}</span>}
              {item.seasons && <span className="text-gray-400">{item.seasons} فصل | {item.episodes} قسمت</span>}
              <span className="text-gray-400">{item.country}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {item.genres.map(g => (
                <span key={g} className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20">{g}</span>
              ))}
            </div>

            <p className="text-gray-300 leading-relaxed mb-4">{item.overview}</p>

            {/* Wikipedia Summary */}
            {wikiLoading && (
              <div className="glass rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  در حال دریافت اطلاعات از ویکی‌پدیا...
                </div>
              </div>
            )}
            {wikiData && wikiData.extract && (
              <div className="glass rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-indigo-400" />
                  <h4 className="text-sm font-medium text-white">اطلاعات تکمیلی از ویکی‌پدیا</h4>
                </div>
                {wikiData.description && (
                  <p className="text-xs text-indigo-300 mb-2">{wikiData.description}</p>
                )}
                <p className="text-gray-300 text-sm leading-relaxed">{wikiData.extract}</p>
                {wikiData.content_urls?.desktop?.page && (
                  <a
                    href={wikiData.content_urls.desktop.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    <ExternalLink size={12} />
                    مطالعه بیشتر در ویکی‌پدیا
                  </a>
                )}
              </div>
            )}

            {item.director && (
              <p className="text-sm text-gray-400 mb-2">کارگردان: <span className="text-white">{item.director}</span></p>
            )}
            {item.cast && (
              <p className="text-sm text-gray-400 mb-2">بازیگران: <span className="text-white">{item.cast.join('، ')}</span></p>
            )}
            {item.studio && (
              <p className="text-sm text-gray-400 mb-4">استودیو: <span className="text-white">{item.studio}</span></p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => addToWatchlist('want')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${currentWatch?.status === 'want' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <Bookmark size={16} /> می‌خواهم ببینم
              </button>
              <button
                onClick={() => addToWatchlist('watching')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${currentWatch?.status === 'watching' ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <Eye size={16} /> در حال تماشا
              </button>
              <button
                onClick={() => addToWatchlist('watched')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${currentWatch?.status === 'watched' ? 'bg-amber-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <ThumbsUp size={16} /> دیده‌شده
              </button>
              <button
                onClick={() => setShowReview(!showReview)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20"
              >
                <MessageCircle size={16} /> ثبت نظر
              </button>
            </div>

            {/* Rating */}
            <div className="glass rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">امتیاز شما:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setUserRating(n)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${n <= userRating ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Review */}
            <AnimatePresence>
              {showReview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass rounded-xl p-4 mb-6">
                    <textarea
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      placeholder="نظر خود را بنویسید..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none h-24"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <label className="flex items-center gap-2 text-xs text-gray-400">
                        <input type="checkbox" className="rounded" /> حاوی اسپویلر
                      </label>
                      <button className="px-4 py-2 bg-indigo-500 rounded-lg text-white text-sm hover:bg-indigo-600">
                        ارسال نظر
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4">عناوین مشابه</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.slice(0, 6).map(item => (
                <MediaCard key={item.id} item={item} size="sm" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== LISTS PAGE ====================
function ListsPage() {
  const [watchlist] = useLocalStorage<WatchItem[]>('watchlist', []);

  const categorized = {
    want: watchlist.filter(w => w.status === 'want'),
    watching: watchlist.filter(w => w.status === 'watching'),
    watched: watchlist.filter(w => w.status === 'watched'),
    dropped: watchlist.filter(w => w.status === 'dropped'),
    waiting: watchlist.filter(w => w.status === 'waiting'),
  };

  const getMedia = (id: number) => allMedia.find(m => m.id === id);

  const sections = [
    { key: 'want' as const, label: 'می‌خواهم ببینم', color: 'from-indigo-500 to-purple-600' },
    { key: 'watching' as const, label: 'در حال تماشا', color: 'from-green-500 to-emerald-600' },
    { key: 'watched' as const, label: 'دیده‌شده', color: 'from-amber-500 to-orange-600' },
    { key: 'dropped' as const, label: 'رهاکرده', color: 'from-red-500 to-rose-600' },
    { key: 'waiting' as const, label: 'در انتظار', color: 'from-blue-500 to-cyan-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">لیست‌های من</h1>
      <p className="text-gray-400 mb-8">مدیریت محتوای تماشا‌شده و موردعلاقه</p>

      {watchlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <List size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">هنوز چیزی به لیست اضافه نکرده‌اید</p>
          <Link to="/discover" className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 rounded-xl text-white">
            <Search size={18} /> کشف محتوا
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map(section => {
            const items = categorized[section.key];
            if (items.length === 0) return null;
            return (
              <div key={section.key}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${section.color}`} />
                  <h2 className="text-lg font-bold text-white">{section.label}</h2>
                  <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {items.map(w => {
                    const media = getMedia(w.id);
                    if (!media) return null;
                    return <MediaCard key={w.id} item={media} size="sm" />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== PROFILE PAGE ====================
function ProfilePage() {
  const [watchlist] = useLocalStorage<WatchItem[]>('watchlist', []);

  const stats = useMemo(() => {
    const totalWatched = watchlist.filter(w => w.status === 'watched').length;
    const totalWatching = watchlist.filter(w => w.status === 'watching').length;
    const totalWant = watchlist.filter(w => w.status === 'want').length;
    const avgRating = watchlist.filter(w => w.rating).reduce((sum, w) => sum + (w.rating || 0), 0) / (watchlist.filter(w => w.rating).length || 1);
    return { totalWatched, totalWatching, totalWant, avgRating: avgRating.toFixed(1) };
  }, [watchlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-2xl font-bold text-white">کاربر سینمادب</h1>
            <p className="text-gray-400 text-sm mt-1">عاشق سینما و انیمه</p>
            <div className="flex items-center gap-4 mt-3 justify-center md:justify-start">
              <span className="text-xs text-gray-400">عضویت: دی ۱۴۰۳</span>
              <span className="text-xs text-indigo-400">نشان: فیلم‌باز حرفه‌ای</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'دیده‌شده', value: stats.totalWatched, color: 'from-amber-500 to-orange-600' },
          { label: 'در حال تماشا', value: stats.totalWatching, color: 'from-green-500 to-emerald-600' },
          { label: 'لیست تماشا', value: stats.totalWant, color: 'from-indigo-500 to-purple-600' },
          { label: 'میانگین امتیاز', value: stats.avgRating, color: 'from-pink-500 to-rose-600' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center">
            <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Dashboard */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-400" /> آمار تماشا
          </h3>
          <div className="space-y-3">
            {['اکشن', 'درام', 'علمی‌تخیلی', 'انیمه', 'کمدی'].map((genre, i) => (
              <div key={genre}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{genre}</span>
                  <span className="text-gray-400">{[35, 28, 20, 12, 5][i]}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${['from-indigo-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-cyan-500 to-blue-600', 'from-violet-500 to-fuchsia-600', 'from-amber-500 to-orange-600'][i]}`} style={{ width: `${[35, 28, 20, 12, 5][i]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award size={20} className="text-amber-400" /> دستاوردها
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'اولین تماشا', earned: true },
              { label: '۱۰ فیلم', earned: stats.totalWatched >= 10 },
              { label: '۵۰ فیلم', earned: stats.totalWatched >= 50 },
              { label: 'نویسنده', earned: false },
              { label: 'منتقد', earned: false },
              { label: 'کاوشگر', earned: true },
            ].map(badge => (
              <div key={badge.label} className={`text-center p-3 rounded-xl ${badge.earned ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/5 border border-white/5 opacity-50'}`}>
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${badge.earned ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-white/10'}`}>
                  <Award size={18} className={badge.earned ? 'text-white' : 'text-gray-500'} />
                </div>
                <p className="text-xs text-gray-300">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== FOOTER ====================
function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Film size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">سینمادب</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              مرجع فارسی‌زبان کشف و مدیریت تماشا. پلتفرمی برای فیلم‌بازها، سریال‌بازها، انیمیشن‌دوستان و انیمه‌بازها.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li><Link to="/discover" className="text-sm text-gray-400 hover:text-white">کشف محتوا</Link></li>
              <li><Link to="/movies" className="text-sm text-gray-400 hover:text-white">فیلم‌ها</Link></li>
              <li><Link to="/series" className="text-sm text-gray-400 hover:text-white">سریال‌ها</Link></li>
              <li><Link to="/anime" className="text-sm text-gray-400 hover:text-white">انیمه</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">امکانات</h4>
            <ul className="space-y-2">
              <li><Link to="/lists" className="text-sm text-gray-400 hover:text-white">لیست‌های من</Link></li>
              <li><Link to="/profile" className="text-sm text-gray-400 hover:text-white">پروفایل</Link></li>
              <li><span className="text-sm text-gray-400">تقویم پخش</span></li>
              <li><span className="text-sm text-gray-400">دستیار هوشمند</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">درباره ما</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              سینمادب هیچ‌گونه محتوای غیرقانونی میزبانی نمی‌کند و کاربران را به منابع رسمی و قانونی تماشا هدایت می‌کند.
            </p>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-500">تمامی حقوق محفوظ است. سینمادب ۱۴۰۳</p>
        </div>
      </div>
    </footer>
  );
}

// ==================== APP ====================
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/movies" element={<TypePage type="movie" title="فیلم‌های سینمایی" />} />
          <Route path="/series" element={<TypePage type="series" title="سریال‌ها" />} />
          <Route path="/anime" element={<TypePage type="anime" title="انیمه‌ها" />} />
          <Route path="/animation" element={<TypePage type="animation" title="انیمیشن‌ها" />} />
          <Route path="/documentary" element={<TypePage type="documentary" title="مستندها" />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
