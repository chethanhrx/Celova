import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { AdminLayout } from './AdminOverview';
import toast from 'react-hot-toast';

export default function AdminContent() {
  const [tab, setTab] = useState('reports');
  const [reportStatus, setReportStatus] = useState('pending');

  const { data: reports, refetch: refetchReports } = useQuery({
    queryKey: ['admin-reports', reportStatus],
    queryFn: () => adminAPI.getReports({ status: reportStatus }).then(r => r.data),
  });

  const { data: seriesData, refetch: refetchSeries } = useQuery({
    queryKey: ['admin-series'],
    queryFn: () => adminAPI.getAllSeries().then(r => r.data),
  });

  const resolveReport = async (id, status) => {
    const note = status === 'resolved' ? prompt('Admin note (optional):') || '' : '';
    try {
      await adminAPI.resolveReport(id, { status, adminNote: note });
      toast.success(`Report marked as ${status}`);
      refetchReports();
    } catch { toast.error('Failed'); }
  };

  const featureSeries = async (id, isFeatured) => {
    try {
      await adminAPI.featureSeries(id, { isFeatured });
      toast.success(isFeatured ? 'Series featured!' : 'Series unfeatured');
      refetchSeries();
    } catch { toast.error('Failed'); }
  };

  const STATUS_BADGE = {
    pending: { color: 'var(--orange)', bg: 'rgba(249,115,22,0.15)' },
    resolved: { color: 'var(--green)', bg: 'rgba(34,197,94,0.15)' },
    rejected: { color: 'var(--text3)', bg: 'rgba(255,255,255,0.06)' },
  };

  return (
    <AdminLayout title="Content Management">
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--surface)' }}>
        {['reports', 'series'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-dm capitalize transition-all"
            style={{ background: tab === t ? 'var(--orange)' : 'transparent', color: tab === t ? '#fff' : 'var(--text2)' }}>
            {t === 'reports' ? `Reports${reports?.total > 0 ? ` (${reports.total})` : ''}` : 'All Series'}
          </button>
        ))}
      </div>

      {/* Reports */}
      {tab === 'reports' && (
        <div>
          <div className="flex gap-2 mb-4">
            {['pending', 'resolved', 'rejected', 'all'].map(s => (
              <button key={s} onClick={() => setReportStatus(s)}
                className="px-3 py-1.5 rounded-full text-xs font-dm capitalize transition-all"
                style={{ background: reportStatus === s ? 'var(--orange)' : 'var(--surface)', color: reportStatus === s ? '#fff' : 'var(--text2)', border: '1px solid var(--border)' }}>
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {reports?.reports?.map(r => (
              <div key={r._id} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge text-[10px] capitalize"
                            style={{ background: STATUS_BADGE[r.status]?.bg, color: STATUS_BADGE[r.status]?.color }}>
                        {r.status}
                      </span>
                      <span className="badge text-[10px] capitalize" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text3)' }}>
                        {r.contentType}
                      </span>
                    </div>
                    <p className="font-dm font-600 text-sm" style={{ color: 'var(--text)' }}>{r.reason}</p>
                    {r.description && <p className="text-xs mt-1 font-dm" style={{ color: 'var(--text2)' }}>{r.description}</p>}
                    <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text3)' }}>
                      Reported by {r.reportedBy?.name} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => resolveReport(r._id, 'resolved')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-dm transition-colors" style={{ color: 'var(--green)', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)' }}>
                        <CheckCircle size={12} /> Resolve
                      </button>
                      <button onClick={() => resolveReport(r._id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-dm transition-colors" style={{ color: 'var(--text3)', border: '1px solid var(--border)' }}>
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!reports?.reports?.length && (
              <div className="text-center py-16"><AlertCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--text3)' }} /><p className="font-dm" style={{ color: 'var(--text3)' }}>No {reportStatus} reports</p></div>
            )}
          </div>
        </div>
      )}

      {/* Series */}
      {tab === 'series' && (
        <div className="space-y-2">
          {seriesData?.series?.map(s => (
            <div key={s._id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <img src={s.thumbnail} alt={s.title} className="w-16 rounded-lg object-cover" style={{ aspectRatio: '16/9' }} />
              <div className="flex-1 min-w-0">
                <p className="font-dm font-600 text-sm truncate" style={{ color: 'var(--text)' }}>{s.title}</p>
                <p className="text-xs font-mono" style={{ color: 'var(--text3)' }}>
                  by {s.creatorId?.name} · <Eye size={10} className="inline" /> {s.totalViews?.toLocaleString()} · {s.status}
                </p>
              </div>
              <button
                onClick={() => featureSeries(s._id, !s.isFeatured)}
                className="px-3 py-1.5 rounded-lg text-xs font-dm transition-colors"
                style={{ background: s.isFeatured ? 'rgba(251,191,36,0.15)' : 'var(--surface2)', color: s.isFeatured ? 'var(--gold)' : 'var(--text2)', border: `1px solid ${s.isFeatured ? 'rgba(251,191,36,0.3)' : 'var(--border)'}` }}>
                {s.isFeatured ? '★ Featured' : '☆ Feature'}
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
