import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, BarChart2, Eye } from 'lucide-react';
import { seriesAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { DashboardLayout } from './DashboardHome';
import toast from 'react-hot-toast';

const STATUS_COLORS = { live: 'var(--green)', draft: 'var(--text3)', scheduled: 'var(--cyan)' };

export default function MySeries() {
  const { user } = useAuthStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-series', user?._id],
    queryFn: () => seriesAPI.getByCreator(user._id, { status: 'all' }).then(r => r.data.series),
    enabled: !!user?._id,
  });

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This will remove all episodes too.`)) return;
    try {
      await seriesAPI.delete(id);
      toast.success('Series deleted.');
      refetch();
    } catch { toast.error('Failed to delete.'); }
  };

  return (
    <DashboardLayout
      title="My Series"
      actions={
        <Link to="/dashboard/series/new" className="btn-orange flex items-center gap-2 px-5 py-2.5 rounded-xl font-syne font-bold text-sm">
          <Plus size={16} /> New Series
        </Link>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-64" />)}
        </div>
      ) : !data?.length ? (
        <div className="text-center py-24 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-5xl mb-4">🎬</p>
          <h3 className="font-syne font-bold text-xl mb-2" style={{ color: 'var(--text)' }}>No series yet</h3>
          <p className="font-dm text-sm mb-6" style={{ color: 'var(--text2)' }}>Create your first AI-animated series to get started</p>
          <Link to="/dashboard/series/new" className="btn-orange px-6 py-3 rounded-xl font-syne font-bold inline-block">
            Create Series
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map(series => (
            <div key={series._id} className="rounded-2xl overflow-hidden group"
                 style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="relative" style={{ aspectRatio: '16/9' }}>
                <img src={series.thumbnail} alt={series.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link to={`/dashboard/series/${series._id}/edit`}
                    className="p-2 rounded-xl text-white hover:bg-white/20 transition-colors">
                    <Edit size={18} />
                  </Link>
                  <button onClick={() => handleDelete(series._id, series.title)}
                    className="p-2 rounded-xl transition-colors hover:bg-red-500/30" style={{ color: 'var(--red)' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="badge text-[10px]" style={{ background: `${STATUS_COLORS[series.status]}22`, color: STATUS_COLORS[series.status], border: `1px solid ${STATUS_COLORS[series.status]}44` }}>
                    ● {series.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-syne font-bold text-sm truncate mb-1" style={{ color: 'var(--text)' }}>{series.title}</h3>
                <div className="flex items-center gap-3 text-xs font-mono" style={{ color: 'var(--text3)' }}>
                  <span className="flex items-center gap-1"><Eye size={11} /> {series.totalViews?.toLocaleString()}</span>
                  <span>{series.totalEpisodes} eps</span>
                  <span>S{series.seasons}</span>
                </div>
                <Link to={`/dashboard/analytics?series=${series._id}`}
                  className="flex items-center gap-1 mt-3 text-xs font-dm transition-colors hover:text-orange-400"
                  style={{ color: 'var(--text3)' }}>
                  <BarChart2 size={12} /> View analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
