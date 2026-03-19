import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { creatorAPI } from '../../services/api';
import { DashboardLayout, CustomTooltip } from './DashboardHome';
import toast from 'react-hot-toast';
import { useState } from 'react';

const STATUS = { pending: { label: 'Pending', color: 'var(--orange)' }, paid: { label: 'Paid', color: 'var(--green)' }, processing: { label: 'Processing', color: 'var(--cyan)' } };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Earnings() {
  const [withdrawing, setWithdrawing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['creator-earnings'],
    queryFn: () => creatorAPI.getEarnings().then(r => r.data),
  });

  const handleWithdraw = async () => {
    if (!data?.available || data.available < 100) { toast.error('Minimum withdrawal is ₹100'); return; }
    setWithdrawing(true);
    try {
      await creatorAPI.requestWithdrawal();
      toast.success('Withdrawal requested! Processing in 3-5 days.');
    } catch { toast.error('Failed to request withdrawal'); }
    setWithdrawing(false);
  };

  const chartData = data?.earnings?.slice().reverse().map(e => ({
    month: MONTHS[(e.month || 1) - 1],
    Revenue: e.totalRevenue || 0,
    AdRevenue: e.adRevenue || 0,
    PremiumCuts: e.premiumRevenue || 0,
  })) || [];

  return (
    <DashboardLayout title="Earnings">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Available to Withdraw', value: `₹${data?.available?.toLocaleString() || 0}`, icon: DollarSign, color: 'var(--green)', onClick: handleWithdraw, btn: 'Withdraw' },
          { label: 'Total Earned (All Time)', value: `₹${data?.earnings?.reduce((a, e) => a + (e.totalRevenue || 0), 0).toLocaleString() || 0}`, icon: TrendingUp, color: 'var(--orange)' },
          { label: 'This Month', value: `₹${data?.earnings?.[0]?.totalRevenue?.toLocaleString() || 0}`, icon: Clock, color: 'var(--cyan)' },
          { label: 'Paid Out', value: `₹${data?.earnings?.filter(e => e.status === 'paid').reduce((a, e) => a + (e.totalRevenue || 0), 0).toLocaleString() || 0}`, icon: CheckCircle, color: 'var(--gold)' },
        ].map(({ label, value, icon: Icon, color, onClick, btn }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="font-syne font-black text-2xl" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="text-xs font-dm mt-0.5" style={{ color: 'var(--text2)' }}>{label}</p>
            {onClick && (
              <button onClick={onClick} disabled={withdrawing}
                className="mt-3 text-xs font-syne font-bold px-3 py-1.5 rounded-lg disabled:opacity-40"
                style={{ background: `${color}22`, color }}>
                {withdrawing ? '...' : btn}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl p-5 mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="font-syne font-bold mb-4" style={{ color: 'var(--text)' }}>Monthly Revenue Breakdown</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={12} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="AdRevenue" fill="var(--orange)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="PremiumCuts" fill="var(--cyan)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-3">
          {[{ color: 'var(--orange)', label: 'Ad Revenue' }, { color: 'var(--cyan)', label: 'Premium Revenue' }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs font-dm" style={{ color: 'var(--text2)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: color }} /> {label}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <h3 className="font-syne font-bold" style={{ color: 'var(--text)' }}>Transaction History</h3>
        </div>
        <div style={{ background: 'var(--surface)' }}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 skeleton mx-5 my-3 rounded-xl" />
            ))
          ) : data?.earnings?.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-dm" style={{ color: 'var(--text3)' }}>No earnings yet. Upload episodes to start earning!</p>
            </div>
          ) : data?.earnings?.map((e) => (
            <div key={e._id} className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <p className="font-dm font-600 text-sm" style={{ color: 'var(--text)' }}>
                  {MONTHS[(e.month || 1) - 1]} {e.year}
                </p>
                <p className="text-xs font-mono" style={{ color: 'var(--text3)' }}>
                  Ad: ₹{e.adRevenue || 0} · Premium: ₹{e.premiumRevenue || 0} · Bonus: ₹{e.bonusRevenue || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="font-syne font-bold" style={{ color: 'var(--green)' }}>₹{e.totalRevenue?.toLocaleString() || 0}</p>
                <span className="badge text-[10px]" style={{ background: `${STATUS[e.status]?.color}18`, color: STATUS[e.status]?.color }}>
                  {STATUS[e.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
