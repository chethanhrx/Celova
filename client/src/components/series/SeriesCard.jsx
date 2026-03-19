import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check, Star } from 'lucide-react';
import { userAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const GENRE_COLORS = {
  Action: '#ef4444', 'Sci-Fi': '#22d3ee', Fantasy: '#a855f7', Horror: '#f97316',
  Romance: '#ec4899', Comedy: '#fbbf24', Mystery: '#8b5cf6', Thriller: '#f97316',
};

const AGE_BADGE = { 'U': '#22c55e', '7+': '#22d3ee', '13+': '#fbbf24', '16+': '#f97316', '18+': '#ef4444' };

export default function SeriesCard({ series, rank, size = 'md', showProgress, progress }) {
  const { isAuthenticated, user } = useAuthStore();
  const [inList, setInList] = useState(user?.myList?.includes(series._id));
  const [listLoading, setListLoading] = useState(false);

  const handleListToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Sign in to save to My List'); return; }
    setListLoading(true);
    try {
      if (inList) {
        await userAPI.removeFromMyList(series._id);
        toast.success('Removed from My List');
      } else {
        await userAPI.addToMyList(series._id);
        toast.success('Added to My List');
      }
      setInList(!inList);
    } catch { toast.error('Failed to update list'); }
    setListLoading(false);
  };

  const widths = { sm: 'w-36', md: 'w-48', lg: 'w-56', xl: 'w-64' };
  const aspectRatios = { sm: '2/3', md: '2/3', lg: '16/9', xl: '16/9' };

  return (
    <div className={`${widths[size]} flex-shrink-0 group relative card-hover`}>
      <Link to={`/series/${series._id}`}>
        {/* Rank Number (Top 10 style) */}
        {rank && (
          <div
            className="absolute -left-4 bottom-8 z-10 font-syne font-black leading-none select-none"
            style={{
              fontSize: '72px',
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,255,255,0.15)',
              lineHeight: 1,
            }}
          >
            {rank}
          </div>
        )}

        {/* Thumbnail */}
        <div
          className="relative overflow-hidden rounded-xl"
          style={{ aspectRatio: aspectRatios[size], background: 'var(--surface)' }}
        >
          <img
            src={series.thumbnail}
            alt={series.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.9) 100%)' }} />

          {/* Age rating badge */}
          {series.ageRating && (
            <div className="absolute top-2 left-2">
              <span
                className="badge text-white text-[10px]"
                style={{ background: AGE_BADGE[series.ageRating] || '#f97316' }}
              >
                {series.ageRating}
              </span>
            </div>
          )}

          {/* My List button */}
          <button
            onClick={handleListToggle}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            {listLoading ? (
              <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : inList ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Plus size={12} className="text-white" />
            )}
          </button>

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(249,115,22,0.9)', boxShadow: '0 0 20px rgba(249,115,22,0.5)' }}
            >
              <Play size={20} fill="white" className="text-white ml-0.5" />
            </div>
          </div>

          {/* Progress bar */}
          {showProgress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, background: 'var(--orange)' }}
              />
            </div>
          )}

          {/* Orange border glow on hover */}
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 0 2px var(--orange)' }}
          />
        </div>

        {/* Card Info */}
        <div className="mt-2 px-0.5">
          <h3 className="font-dm font-600 text-sm truncate" style={{ color: 'var(--text)' }}>{series.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {series.rating > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] font-mono" style={{ color: 'var(--gold)' }}>
                <Star size={10} fill="currentColor" /> {series.rating.toFixed(1)}
              </span>
            )}
            {series.genre && (
              <span className="text-[11px] font-dm" style={{ color: GENRE_COLORS[series.genre] || 'var(--text2)' }}>
                {series.genre}
              </span>
            )}
            {series.seasons > 0 && (
              <span className="text-[11px] font-dm" style={{ color: 'var(--text3)' }}>
                S{series.seasons}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
