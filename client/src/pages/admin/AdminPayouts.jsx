import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, DollarSign } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { AdminLayout } from './AdminOverview';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COL = { pending: 'var(--orange)', paid: 'var(--green)', processing: 'var(--cyan)' };

export default function AdminPayouts() {
  const [status, setStatus] = useState('pending');
  const [processingId, setProcessingId] = useState(null);

  const { data, refetch } = useQuery({
    queryKey: ['admin-earnings', status],
    queryFn: () => adminAPI.getAllEarnings({ status: status !== 'all' ? status : undefined }).then(r => r.data),
  });

  const markPaid = async (id, creatorName) => {
    const txId = prompt(`Enter transaction ID for payment to ${creatorName}:`);
    if (!txId) return;
    setProcessingId(id);
    try {
      await adminAPI.markEarningPaid(id, txId);
      toast.success('Marked as paid!');
      refetch();
    } catch { toast.error('Failed'); }
    setProcessingId(null);
  };

  const totalPending = data?.earnings?.filter(e => e.status === 'pending').reduce((a, e) => a + (e.totalRevenue || 0), 0) || 0;

  return (
    <AdminLayout title="Creator Payouts">
      {/* Summary */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <DollarSign size={18} style={{ color: 'var(--orange)' }} />
          <div>
            <p className="text-xs font-dm" style={{ color: 'var(--text3)' }}>Total Pending</p>
            <p className="font-syne font-black" style={{ color: 'var(--text)' }}>₹{totalPending.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
        {['pending', 'processing', 'paid', 'all'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className="px-3 py-1.5 rounded-full text-xs font-dm capitalize transition-all"
            style={{ background: status === s ? 'var(--orange)' : 'var(--surface)', color: status === s ? '#fff' : 'var(--text2)', border: '1px solid var(--border)' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Payouts table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Creator', 'Period', 'Revenue', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-syne font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.earnings?.map(e => (
              <tr key={e._id} className="hover:bg-white/2 transition-colors" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    {e.creatorId?.avatar ? (
                      <img src={e.creatorId.avatar} alt={e.creatorId.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                           style={{ background: 'var(--orange)', color: '#fff' }}>{e.creatorId?.name?.[0]}</div>
                    )}
                    <div>
                      <p className="font-dm font-600" style={{ color: 'var(--text)' }}>{e.creatorId?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>{e.creatorId?.bankAccount || 'No bank account'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs" style={{ color: 'var(--text2)' }}>
                  {MONTHS[(e.month || 1) - 1]} {e.year}
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-syne font-bold" style={{ color: 'var(--green)' }}>₹{e.totalRevenue?.toLocaleString()}</p>
                  <p className="text-xs font-mono" style={{ color: 'var(--text3)' }}>Ad: ₹{e.adRevenue || 0} · Premium: ₹{e.premiumRevenue || 0}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="badge text-[10px] capitalize"
                        style={{ background: `${STATUS_COL[e.status] || 'var(--text3)'}18`, color: STATUS_COL[e.status] || 'var(--text3)' }}>
                    ● {e.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  {e.status === 'pending' ? (
                    <button onClick={() => markPaid(e._id, e.creatorId?.name)} disabled={processingId === e._id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-dm transition-colors disabled:opacity-50"
                      style={{ color: 'var(--green)', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)' }}>
                      <CheckCircle size={12} /> {processingId === e._id ? 'Processing...' : 'Mark Paid'}
                    </button>
                  ) : e.transactionId ? (
                    <p className="text-xs font-mono" style={{ color: 'var(--text3)' }}>TXN: {e.transactionId}</p>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.earnings?.length && (
          <div className="text-center py-12" style={{ background: 'var(--surface)' }}>
            <p className="font-dm" style={{ color: 'var(--text3)' }}>No {status} payouts found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
