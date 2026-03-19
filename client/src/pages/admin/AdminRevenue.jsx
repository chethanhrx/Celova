import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { AdminLayout } from './AdminOverview';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { CustomTooltip } from '../dashboard/DashboardHome';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminRevenue() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => adminAPI.getRevenue().then(r => r.data),
  });

  const chartData = (data?.revenueData || []).slice().reverse().map(d => ({
    month: MONTHS[(d._id?.month || 1) - 1],
    'Ad Revenue': +(d.adRevenue || 0).toFixed(0),
    'Premium Revenue': +(d.premiumRevenue || 0).toFixed(0),
    'Total': +(d.totalRevenue || 0).toFixed(0),
  }));

  const totals = {
    total: (data?.revenueData || []).reduce((a, d) => a + (d.totalRevenue || 0), 0),
    ad: (data?.revenueData || []).reduce((a, d) => a + (d.adRevenue || 0), 0),
    premium: (data?.revenueData || []).reduce((a, d) => a + (d.premiumRevenue || 0), 0),
  };

  return (
    <AdminLayout title="Revenue Analytics">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'All Time Revenue', value: `₹${totals.total.toLocaleString()}`, color: 'var(--green)' },
          { label: 'Total Ad Revenue', value: `₹${totals.ad.toLocaleString()}`, color: 'var(--orange)' },
          { label: 'Premium Revenue', value: `₹${totals.premium.toLocaleString()}`, color: 'var(--cyan)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="font-syne font-black text-2xl" style={{ color }}>{value}</p>
            <p className="text-xs font-dm mt-0.5" style={{ color: 'var(--text2)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Total Revenue trend */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="font-syne font-bold mb-4" style={{ color: 'var(--text)' }}>Total Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--green)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Total" stroke="var(--green)" strokeWidth={2} fill="url(#totalGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stacked breakdown */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="font-syne font-bold mb-4" style={{ color: 'var(--text)' }}>Revenue Breakdown (Ad vs Premium)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={14} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Ad Revenue" fill="var(--orange)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Premium Revenue" fill="var(--cyan)" radius={[4, 4, 0, 0]} />
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
    </AdminLayout>
  );
}
