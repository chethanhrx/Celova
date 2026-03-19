import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Plus, Check, Star, Eye, Users, ChevronDown } from 'lucide-react';
import { seriesAPI, episodeAPI, userAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { SkeletonText, SkeletonCard } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

function formatDuration(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViews(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
}

export default function SeriesDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [inList, setInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const { data: series, isLoading } = useQuery({
    queryKey: ['series', id],
    queryFn: () => seriesAPI.getById(id).then(r => {
      setInList(user?.myList?.includes(id));
      return r.data.series;
    }),
  });

  const { data: episodesData } = useQuery({
    queryKey: ['episodes', id, selectedSeason],
    queryFn: () => episodeAPI.getBySeries(id, { season: selectedSeason }).then(r => r.data.episodes),
    enabled: !!id,
  });

  const handleListToggle = async () => {
    if (!isAuthenticated) { toast.error('Sign in first'); return; }
    setListLoading(true);
    try {
      if (inList) {
        await userAPI.removeFromMyList(id);
        toast.success('Removed from My List');
      } else {
        await userAPI.addToMyList(id);
        toast.success('Added to My List');
      }
      setInList(!inList);
    } catch { toast.error('Failed'); }
    setListLoading(false);
  };

  if (isLoading) return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
      <div className="skeleton w-full rounded-2xl" style={{ height: 400 }} />
      <SkeletonText lines={4} />
    </div>
  );

  if (!series) return (
    <div className="text-center py-24">
      <p className="font-syne text-xl" style={{ color: 'var(--text2)' }}>Series not found.</p>
    </div>
  );

  const seasons = Array.from({ length: series.seasons || 1 }, (_, i) => i + 1);

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="relative w-full" style={{ height: 420 }}>
        <img src={series.thumbnail} alt={series.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.3)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, var(--bg) 0%, transparent 50%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(10,10,10,0.7) 0%, transparent 100%)' }} />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="md:w-56 shrink-0">
            <img src={series.thumbnail} alt={series.title}
              className="w-full rounded-2xl shadow-card object-cover"
              style={{ aspectRatio: '2/3' }} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {series.genre && (
                <span className="badge" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--orange)', border: '1px solid rgba(249,115,22,0.3)' }}>
                  {series.genre}
                </span>
              )}
              {series.language && (
                <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text2)' }}>
                  {series.language}
                </span>
              )}
              {series.ageRating && (
                <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text2)' }}>
                  {series.ageRating}
                </span>
              )}
            </div>

            <h1 className="font-syne font-black text-3xl md:text-4xl mb-2" style={{ color: 'var(--text)' }}>
              {series.title}
            </h1>

            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {series.rating > 0 && (
                <span className="flex items-center gap-1 font-mono" style={{ color: '#fbbf24' }}>
                  <Star size={15} fill="currentColor" /> {series.rating.toFixed(1)}
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>({series.totalRatings})</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-sm font-mono" style={{ color: 'var(--text2)' }}>
                <Eye size={14} /> {formatViews(series.totalViews)} views
              </span>
              <span className="text-sm font-dm" style={{ color: 'var(--text2)' }}>
                {series.seasons} Season{series.seasons !== 1 ? 's' : ''} · {series.totalEpisodes} Episodes
              </span>
            </div>

            <p className="font-dm text-base leading-relaxed mb-6 max-w-2xl" style={{ color: 'var(--text2)' }}>
              {series.description}
            </p>

            {/* Creator */}
            {series.creatorId && (
              <Link to={`/creator/${series.creatorId._id}`} className="flex items-center gap-2 mb-6 group w-fit">
                {series.creatorId.avatar ? (
                  <img src={series.creatorId.avatar} alt={series.creatorId.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                       style={{ background: 'var(--orange)', color: '#fff' }}>
                    {series.creatorId.name?.[0]}
                  </div>
                )}
                <div>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>Created by</p>
                  <p className="text-sm font-dm font-600 group-hover:text-orange-400 transition-colors" style={{ color: 'var(--text)' }}>
                    {series.creatorId.name}
                    {series.creatorId.isVerifiedCreator && <span className="ml-1 text-cyan-400">✓</span>}
                  </p>
                </div>
              </Link>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
              {episodesData?.[0] && (
                <button
                  onClick={() => navigate(`/watch/${episodesData[0]._id}`)}
                  className="btn-orange flex items-center gap-2 px-6 py-3 rounded-xl font-syne font-bold"
                >
                  <Play size={18} fill="white" /> Watch S1:E1
                </button>
              )}
              <button
                onClick={handleListToggle}
                disabled={listLoading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-dm font-600 text-sm transition-colors"
                style={{ background: inList ? 'rgba(34,197,94,0.15)' : 'var(--surface)', color: inList ? '#22c55e' : 'var(--text2)', border: `1px solid ${inList ? '#22c55e' : 'var(--border)'}` }}
              >
                {inList ? <><Check size={16} /> In My List</> : <><Plus size={16} /> My List</>}
              </button>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-syne font-bold text-2xl" style={{ color: 'var(--text)' }}>Episodes</h2>
            {series.seasons > 1 && (
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                  className="pl-3 pr-8 py-2 rounded-lg text-sm font-dm appearance-none"
                  style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  {seasons.map(s => <option key={s} value={s}>Season {s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text2)' }} />
              </div>
            )}
          </div>

          {episodesData?.length === 0 && (
            <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-4xl mb-2">📺</p>
              <p className="font-syne font-bold" style={{ color: 'var(--text)' }}>No episodes yet</p>
              <p className="font-dm text-sm mt-1" style={{ color: 'var(--text2)' }}>Check back soon!</p>
            </div>
          )}

          <div className="space-y-3">
            {episodesData?.map((ep, i) => (
              <Link
                key={ep._id}
                to={`/watch/${ep._id}`}
                className="flex gap-4 p-4 rounded-xl transition-all hover:bg-white/5 group"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <div className="relative w-36 shrink-0 overflow-hidden rounded-lg" style={{ aspectRatio: '16/9', background: 'var(--surface2)' }}>
                  {ep.thumbnail && <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={20} fill="white" className="text-white" />
                  </div>
                  {ep.duration > 0 && (
                    <span className="absolute bottom-1 right-1 text-[10px] font-mono px-1 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
                      {formatDuration(ep.duration)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono mb-0.5" style={{ color: 'var(--text3)' }}>
                        S{ep.seasonNumber}:E{ep.episodeNumber}
                      </p>
                      <h3 className="font-dm font-600 text-sm" style={{ color: 'var(--text)' }}>{ep.title}</h3>
                    </div>
                    <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text3)' }}>
                      {ep.views ? formatViews(ep.views) + ' views' : 'New'}
                    </span>
                  </div>
                  {ep.description && (
                    <p className="text-xs mt-1.5 line-clamp-2 font-dm" style={{ color: 'var(--text2)' }}>
                      {ep.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
