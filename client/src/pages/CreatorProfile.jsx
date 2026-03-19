import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Film, Star, ExternalLink } from 'lucide-react';
import { userAPI, seriesAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import SeriesCard from '../components/series/SeriesCard';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CreatorProfile() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['creator', id],
    queryFn: () => userAPI.getProfile(id).then(r => {
      setFollowing(r.data.user.followers?.some(f => f._id === user?._id));
      return r.data.user;
    }),
  });

  const { data: series } = useQuery({
    queryKey: ['creator-series', id],
    queryFn: () => seriesAPI.getByCreator(id).then(r => r.data.series),
    enabled: !!id,
  });

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error('Sign in first'); return; }
    setFollowLoading(true);
    try {
      if (following) { await userAPI.unfollow(id); toast.success('Unfollowed'); }
      else { await userAPI.follow(id); toast.success(`Following ${profile?.name}!`); }
      setFollowing(f => !f);
    } catch { toast.error('Failed'); }
    setFollowLoading(false);
  };

  if (isLoading) return (
    <div className="max-w-screen-xl mx-auto px-4 py-12 animate-pulse">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full skeleton" />
        <div className="space-y-2"><div className="skeleton h-6 w-48 rounded" /><div className="skeleton h-4 w-32 rounded" /></div>
      </div>
    </div>
  );

  if (!profile) return <div className="text-center py-24"><p className="font-syne text-xl" style={{ color: 'var(--text2)' }}>Creator not found.</p></div>;

  const totalViews = series?.reduce((acc, s) => acc + s.totalViews, 0) || 0;

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Banner */}
      <div className="h-48 w-full" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,146,60,0.05), rgba(10,10,10,0))' }} />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 -mt-16 relative z-10">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
          {/* Avatar with animated ring */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-full p-1" style={{ background: 'conic-gradient(from 0deg, #f97316, #fb923c, #fdba74, #f97316)', animation: 'spin 8s linear infinite' }}>
              <div className="w-full h-full rounded-full overflow-hidden border-4" style={{ borderColor: 'var(--bg)' }}>
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-syne font-black text-4xl"
                       style={{ background: 'var(--surface)', color: 'var(--orange)' }}>
                    {profile.name?.[0]}
                  </div>
                )}
              </div>
            </div>
            {profile.isVerifiedCreator && (
              <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                   style={{ background: 'var(--cyan)', color: '#000', border: '2px solid var(--bg)' }}>✓</div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-syne font-black text-3xl" style={{ color: 'var(--text)' }}>{profile.name}</h1>
              {profile.isVerifiedCreator && <span className="badge" style={{ background: 'rgba(34,211,238,0.15)', color: 'var(--cyan)' }}>Verified Creator</span>}
            </div>
            {profile.bio && <p className="font-dm text-sm mb-4 max-w-xl" style={{ color: 'var(--text2)' }}>{profile.bio}</p>}

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-5">
              {[
                { label: 'Followers', value: (profile.followers?.length || 0).toLocaleString() },
                { label: 'Series', value: series?.length || 0 },
                { label: 'Views', value: totalViews >= 1000 ? (totalViews / 1000).toFixed(0) + 'K' : totalViews },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="font-syne font-black text-xl" style={{ color: 'var(--text)' }}>{value}</p>
                  <p className="text-xs font-dm" style={{ color: 'var(--text3)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Follow button */}
            {user?._id !== id && (
              <button onClick={handleFollow} disabled={followLoading}
                className="px-6 py-2.5 rounded-xl font-syne font-bold text-sm transition-all"
                style={{
                  background: following ? 'transparent' : 'var(--orange)',
                  color: following ? 'var(--text2)' : '#fff',
                  border: `2px solid ${following ? 'var(--border)' : 'var(--orange)'}`,
                }}>
                {followLoading ? '...' : following ? 'Following ✓' : '+ Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Series Grid */}
        <div>
          <h2 className="font-syne font-bold text-xl mb-5" style={{ color: 'var(--text)' }}>Series by {profile.name}</h2>
          {!series?.length ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <Film size={40} className="mx-auto mb-3" style={{ color: 'var(--text3)' }} />
              <p className="font-syne font-bold" style={{ color: 'var(--text)' }}>No series yet</p>
              <p className="text-sm font-dm mt-1" style={{ color: 'var(--text2)' }}>This creator hasn't published anything yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {series.map(s => <SeriesCard key={s._id} series={s} size="sm" />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
