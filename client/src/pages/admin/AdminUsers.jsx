import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Ban, CheckCircle, Shield } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { AdminLayout } from './AdminOverview';
import toast from 'react-hot-toast';

const ROLES = ['all', 'viewer', 'creator', 'admin'];

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', search, role, page],
    queryFn: () => adminAPI.getUsers({ search: search || undefined, role: role !== 'all' ? role : undefined, page, limit: 20 }).then(r => r.data),
    keepPreviousData: true,
  });

  const ban = async (id) => {
    const reason = prompt('Ban reason:');
    if (!reason) return;
    setActionLoading(id + 'ban');
    try { await adminAPI.banUser(id, reason); toast.success('User banned.'); refetch(); } catch { toast.error('Failed'); }
    setActionLoading(null);
  };

  const unban = async (id) => {
    setActionLoading(id + 'unban');
    try { await adminAPI.unbanUser(id); toast.success('User unbanned.'); refetch(); } catch { toast.error('Failed'); }
    setActionLoading(null);
  };

  const verifyCreator = async (id) => {
    setActionLoading(id + 'verify');
    try { await adminAPI.verifyCreator(id); toast.success('Creator verified! ✓'); refetch(); } catch { toast.error('Failed'); }
    setActionLoading(null);
  };

  return (
    <AdminLayout title="User Management">
      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-dm outline-none"
            style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }} />
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)' }}>
          {ROLES.map(r => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-dm capitalize transition-all"
              style={{ background: role === r ? 'var(--orange)' : 'transparent', color: role === r ? '#fff' : 'var(--text2)' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
              {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-syne font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-24" /></td>
                ))}
              </tr>
            )) : data?.users?.map(u => (
              <tr key={u._id} className="hover:bg-white/2 transition-colors" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                           style={{ background: 'var(--orange)', color: '#fff' }}>{u.name?.[0]}</div>
                    )}
                    <div>
                      <p className="font-dm font-600" style={{ color: 'var(--text)' }}>{u.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="badge text-[11px] capitalize"
                        style={{ background: u.role === 'admin' ? 'rgba(249,115,22,0.15)' : u.role === 'creator' ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.07)', color: u.role === 'admin' ? 'var(--orange)' : u.role === 'creator' ? 'var(--cyan)' : 'var(--text2)' }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.isBanned ? (
                    <span className="badge text-[11px]" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>Banned</span>
                  ) : (
                    <span className="badge text-[11px]" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--green)' }}>Active</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text3)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {u.isBanned ? (
                      <button onClick={() => unban(u._id)} disabled={actionLoading === u._id + 'unban'}
                        className="p-1.5 rounded-lg text-xs transition-colors hover:bg-green-500/20"
                        title="Unban" style={{ color: 'var(--green)' }}>
                        <CheckCircle size={14} />
                      </button>
                    ) : (
                      <button onClick={() => ban(u._id)} disabled={actionLoading === u._id + 'ban'}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20"
                        title="Ban" style={{ color: 'var(--red)' }}>
                        <Ban size={14} />
                      </button>
                    )}
                    {u.role === 'viewer' && !u.isVerifiedCreator && (
                      <button onClick={() => verifyCreator(u._id)} disabled={actionLoading === u._id + 'verify'}
                        className="p-1.5 rounded-lg transition-colors hover:bg-cyan-500/20"
                        title="Verify as Creator" style={{ color: 'var(--cyan)' }}>
                        <Shield size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && !data?.users?.length && (
          <div className="text-center py-12" style={{ background: 'var(--surface)' }}>
            <p className="font-dm" style={{ color: 'var(--text3)' }}>No users found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg text-sm font-dm disabled:opacity-40" style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}>← Prev</button>
          <span className="font-mono text-sm px-4 flex items-center" style={{ color: 'var(--text2)' }}>Page {page}</span>
          <button disabled={data?.users?.length < 20} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg text-sm font-dm disabled:opacity-40" style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}>Next →</button>
        </div>
      )}
    </AdminLayout>
  );
}
