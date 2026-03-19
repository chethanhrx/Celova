import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Plus, Check, Star, ChevronLeft, ChevronRight, Info, Flame, Laugh, Ghost, Heart, Brain, Compass, Zap, Moon } from 'lucide-react';
import { seriesAPI, userAPI, episodeAPI } from '../services/api';
import SeriesRow from '../components/series/SeriesRow';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// ─── Mood Picker ──────────────────────────────────────────────
const MOODS = [
  { id: 'Action', label: 'Epic', icon: Flame, color: '#ef4444' },
  { id: 'Comedy', label: 'Fun', icon: Laugh, color: '#fbbf24' },
  { id: 'Horror', label: 'Scary', icon: Ghost, color: '#8b5cf6' },
  { id: 'Romance', label: 'Romance', icon: Heart, color: '#ec4899' },
  { id: 'Mystery', label: 'Mind-Bending', icon: Brain, color: '#22d3ee' },
  { id: 'Fantasy', label: 'Adventure', icon: Compass, color: '#22c55e' },
  { id: 'Sci-Fi', label: 'Sci-Fi', icon: Zap, color: '#f97316' },
  { id: 'Thriller', label: 'Chill', icon: Moon, color: '#a855f7' },
];

// ─── Hero Banner ──────────────────────────────────────────────
function HeroBanner({ series }) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!series?.length) return;
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % series.length);
        setFade(true);
      }, 400);
    }, 6000);
    return () => clearInterval(timer);
  }, [series]);

  if (!series?.length) return (
    <div className="w-full skeleton" style={{ height: '85vh' }} />
  );

  const s = series[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '85vh', minHeight: 500 }}>
      {/* Background Image */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <img
          src={s.thumbnail}
          alt={s.title}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.45)' }}
        />
        {/* Vignette */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.4) 60%, transparent 100%)'
        }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(0deg, #0a0a0a 0%, transparent 60%)'
        }} />
      </div>

      {/* Content */}
      <div
        className="relative h-full flex flex-col justify-end pb-20 px-6 md:px-12 max-w-screen-xl mx-auto"
        style={{ transition: 'opacity 0.4s ease', opacity: fade ? 1 : 0 }}
      >
        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge text-white text-[11px]" style={{ background: 'var(--orange)', fontFamily: 'Syne' }}>
            #1 on Celova
          </span>
          <span className="badge text-white text-[11px]" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}>
            {s.genre}
          </span>
          <span className="badge text-white text-[11px]" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}>
            {s.language}
          </span>
          {s.ageRating && (
            <span className="badge text-white text-[11px]" style={{ background: 'rgba(255,255,255,0.12)' }}>
              {s.ageRating}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-syne font-black text-4xl md:text-6xl lg:text-7xl mb-3" style={{ color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.5)', lineHeight: 1.05 }}>
          {s.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {s.rating > 0 && (
            <span className="flex items-center gap-1 font-mono text-sm" style={{ color: '#fbbf24' }}>
              <Star size={14} fill="currentColor" /> {s.rating.toFixed(1)}
            </span>
          )}
          <span className="text-sm font-dm" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.year || 2026}</span>
          <span className="text-sm font-dm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {s.seasons} Season{s.seasons !== 1 ? 's' : ''}
          </span>
          <span className="text-sm font-dm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {(s.totalViews / 1000).toFixed(0)}K views
          </span>
        </div>

        {/* Description */}
        <p className="font-dm text-base max-w-xl mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {s.description?.length > 150 ? s.description.slice(0, 150) + '...' : s.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate(`/series/${s._id}`)}
            className="flex items-center gap-2 px-7 py-3 rounded-xl font-syne font-bold text-base transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'var(--orange)', color: '#fff', boxShadow: '0 0 24px rgba(249,115,22,0.5)' }}
          >
            <Play size={18} fill="white" /> Watch Now
          </button>
          <button
            onClick={() => navigate(`/series/${s._id}`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-dm font-600 text-base transition-all duration-200 hover:bg-white/15"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
          >
            <Info size={18} /> More Info
          </button>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {series.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFade(false); setTimeout(() => { setCurrent(i); setFade(true); }, 300); }}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? '24px' : '6px',
              height: '6px',
              background: i === current ? 'var(--orange)' : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>

      {/* Left/Right nav arrows */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={() => { setFade(false); setTimeout(() => { setCurrent((c) => (c - 1 + series.length) % series.length); setFade(true); }, 300); }}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={() => { setFade(false); setTimeout(() => { setCurrent((c) => (c + 1) % series.length); setFade(true); }, 300); }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

// ─── Mood Picker Component ────────────────────────────────────
function MoodPicker({ selected, onSelect }) {
  return (
    <div>
      <h2 className="font-syne font-bold text-xl mb-4" style={{ color: 'var(--text)' }}>
        What's Your Mood?
      </h2>
      <div className="flex flex-wrap gap-2">
        {MOODS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-dm font-600 text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: selected === id ? `${color}22` : 'var(--surface)',
              color: selected === id ? color : 'var(--text2)',
              border: `1px solid ${selected === id ? color : 'var(--border)'}`,
              boxShadow: selected === id ? `0 0 12px ${color}33` : 'none',
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [selectedMood, setSelectedMood] = useState(null);

  // Fetch all data in parallel
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: () => seriesAPI.getFeatured().then((r) => r.data.series),
    staleTime: 5 * 60 * 1000,
  });

  const { data: top10, isLoading: top10Loading } = useQuery({
    queryKey: ['top10'],
    queryFn: () => seriesAPI.getTop10().then((r) => r.data.series),
    staleTime: 5 * 60 * 1000,
  });

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => seriesAPI.getTrending().then((r) => r.data.series),
    staleTime: 5 * 60 * 1000,
  });

  // Language rows
  const LANGUAGES = ['English', 'Hindi', 'Japanese', 'Korean', 'Spanish'];
  const langQueries = LANGUAGES.map((lang) =>
    useQuery({
      queryKey: ['series', 'lang', lang, selectedMood],
      queryFn: () => seriesAPI.getAll({ language: lang, genre: selectedMood || undefined, limit: 12 }).then((r) => r.data.series),
      staleTime: 5 * 60 * 1000,
    })
  );

  const moodSeries = useQuery({
    queryKey: ['series', 'mood', selectedMood],
    queryFn: () => seriesAPI.getAll({ genre: selectedMood, limit: 20 }).then((r) => r.data.series),
    enabled: !!selectedMood,
  });

  const watchHistory = useQuery({
    queryKey: ['watchHistory'],
    queryFn: () => userAPI.getWatchHistory().then((r) => r.data.watchHistory),
    enabled: isAuthenticated,
  });

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Hero Banner */}
      <HeroBanner series={featuredData} />

      {/* Content Sections */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 space-y-10 pb-16 mt-[-2rem] relative z-10">

        {/* Mood Picker */}
        <MoodPicker selected={selectedMood} onSelect={(m) => setSelectedMood(m === selectedMood ? null : m)} />

        {/* Mood-filtered results */}
        {selectedMood && moodSeries.data && (
          <SeriesRow
            title={`${MOODS.find(m => m.id === selectedMood)?.label} Series`}
            series={moodSeries.data}
            loading={moodSeries.isLoading}
            badge="MOOD"
          />
        )}

        {/* Continue Watching */}
        {isAuthenticated && watchHistory.data?.length > 0 && (
          <SeriesRow
            title="Continue Watching"
            series={watchHistory.data.map((h) => h.seriesId).filter(Boolean)}
            loading={watchHistory.isLoading}
          />
        )}

        {/* Top 10 This Week */}
        <SeriesRow
          title="Top 10 This Week"
          series={top10 || []}
          loading={top10Loading}
          badge="#"
        />

        {/* New Releases */}
        <SeriesRow
          title="New Releases"
          series={trending || []}
          loading={trendingLoading}
          badge="NEW"
        />

        {/* Language Rows */}
        {LANGUAGES.map((lang, i) => (
          <SeriesRow
            key={lang}
            title={`${lang} Series`}
            series={langQueries[i].data || []}
            loading={langQueries[i].isLoading}
          />
        ))}

        {/* Creator Spotlight (CTA) */}
        <div
          className="rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
          style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(251,146,60,0.06))',
            border: '1px solid rgba(249,115,22,0.2)',
          }}
        >
          <div className="flex-1">
            <div className="badge mb-3" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--orange)' }}>
              ✦ Become a Creator
            </div>
            <h2 className="font-syne font-black text-3xl mb-3" style={{ color: 'var(--text)' }}>
              Bring Your AI Stories to Life
            </h2>
            <p className="font-dm text-base mb-6 max-w-lg" style={{ color: 'var(--text2)' }}>
              Join thousands of AI creators already sharing their animated universe on Celova. Upload episodes, build your audience, and earn revenue.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/register?role=creator" className="btn-orange px-6 py-3 rounded-xl font-syne font-bold inline-block">
                Start Creating
              </Link>
              <Link to="/browse" className="px-6 py-3 rounded-xl font-dm font-600 inline-block transition-colors hover:bg-white/8" style={{ color: 'var(--text2)', border: '1px solid var(--border)' }}>
                Explore Content
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div
              className="w-40 h-40 rounded-full flex items-center justify-center animate-spin-slow"
              style={{
                background: 'conic-gradient(from 0deg, #f97316, #fb923c, #fdba74, #f97316)',
                padding: '3px',
              }}
            >
              <div className="w-full h-full rounded-full flex items-center justify-center font-syne font-black text-6xl"
                   style={{ background: 'var(--bg)', color: 'var(--orange)' }}>
                C
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
