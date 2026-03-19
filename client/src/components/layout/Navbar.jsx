import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, User, LogOut, Settings, LayoutDashboard,
  Shield, Sun, Moon, Menu, X, ChevronDown, Sparkles
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { seriesAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Celova Logo Component
function CelovaLogo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', boxShadow: '0 0 16px rgba(249,115,22,0.4)' }}
      >
        <span className="font-syne font-black text-white text-lg leading-none">C</span>
      </div>
      <span className="font-syne font-black text-xl tracking-tight">
        <span style={{ color: 'var(--orange)' }}>C</span>
        <span style={{ color: 'var(--text)' }}>elova</span>
      </span>
    </Link>
  );
}

// Live Search Dropdown
function SearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = useCallback((q) => {
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await seriesAPI.getAll({ search: q, limit: 6 });
        setResults(data.series || []);
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => { handleSearch(query); }, [query, handleSearch]);

  const go = (id) => {
    navigate(`/series/${id}`);
    onClose();
  };

  return (
    <div className="relative w-full max-w-xl">
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
      >
        <Search size={16} style={{ color: 'var(--text2)' }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search series, creators..."
          className="flex-1 bg-transparent outline-none text-sm font-dm"
          style={{ color: 'var(--text)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ color: 'var(--text2)' }}><X size={14} /></button>
        )}
      </div>

      {(results.length > 0 || loading) && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}
        >
          {loading ? (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--text2)' }}>Searching...</div>
          ) : results.map((s) => (
            <button
              key={s._id}
              onClick={() => go(s._id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
            >
              <img src={s.thumbnail} alt={s.title} className="w-14 h-9 rounded-lg object-cover" loading="lazy" />
              <div>
                <p className="font-dm font-600 text-sm" style={{ color: 'var(--text)' }}>{s.title}</p>
                <p className="text-xs" style={{ color: 'var(--text2)' }}>{s.genre} · {s.language}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme, searchOpen, setSearchOpen } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse' },
    { to: '/premium', label: '✦ Premium', orange: true },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(10,10,10,0.95)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center gap-4">
          <CelovaLogo />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map(({ to, label, orange }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-1.5 rounded-lg text-sm font-dm font-500 transition-colors"
                style={{
                  color: orange ? 'var(--orange)' : location.pathname === to ? 'var(--text)' : 'var(--text2)',
                  background: location.pathname === to ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Search Toggle */}
          <div className="flex-1 flex justify-center">
            {searchOpen ? (
              <SearchBar onClose={() => setSearchOpen(false)} />
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}
              >
                <Search size={14} />
                <span className="font-dm">Search series...</span>
                <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface2)', fontFamily: 'Space Mono' }}>⌘K</kbd>
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:bg-white/8"
              style={{ color: 'var(--text2)' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Search (mobile) */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg"
              style={{ color: 'var(--text2)' }}
            >
              <Search size={18} />
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications bell */}
                <Link to="/dashboard/settings" className="p-2 rounded-lg hover:bg-white/8" style={{ color: 'var(--text2)' }}>
                  <Bell size={18} />
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2" style={{ borderColor: 'var(--orange)' }} />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-syne font-bold text-sm"
                           style={{ background: 'var(--orange)', color: '#fff' }}>
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <ChevronDown size={14} style={{ color: 'var(--text2)' }} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}
                    >
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                        <p className="font-dm font-600 text-sm truncate" style={{ color: 'var(--text)' }}>{user?.name}</p>
                        <p className="text-xs truncate capitalize" style={{ color: 'var(--text2)' }}>{user?.role}</p>
                        {user?.isPremium && (
                          <span className="badge mt-1" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--gold)' }}>
                            ✦ Premium
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        {user?.role === 'creator' && (
                          <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors font-dm" style={{ color: 'var(--text2)' }}>
                            <LayoutDashboard size={15} /> Dashboard
                          </Link>
                        )}
                        {user?.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors font-dm" style={{ color: 'var(--orange)' }}>
                            <Shield size={15} /> Admin Panel
                          </Link>
                        )}
                        <Link to="/dashboard/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors font-dm" style={{ color: 'var(--text2)' }}>
                          <Settings size={15} /> Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors font-dm text-left"
                          style={{ color: 'var(--red)' }}
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-dm font-600 transition-colors hover:bg-white/5" style={{ color: 'var(--text2)' }}>
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-dm font-700 btn-orange">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2" style={{ color: 'var(--text)' }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
            {navLinks.map(({ to, label, orange }) => (
              <Link key={to} to={to} className="block px-3 py-2.5 rounded-lg text-sm font-dm"
                    style={{ color: orange ? 'var(--orange)' : 'var(--text)' }}>
                {label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="block px-3 py-2.5 text-sm font-dm" style={{ color: 'var(--text2)' }}>Sign In</Link>
                <Link to="/register" className="block px-3 py-2.5 rounded-lg text-sm font-dm btn-orange text-center">Get Started</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
