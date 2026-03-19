import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { creatorAPI } from '../../services/api';
import { DashboardLayout, CustomTooltip } from './DashboardHome';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

const PIE_COLORS = ['var(--orange)', 'var(--cyan)', 'var(--green)', 'var(--gold)', 'var(--text3)'];

export default function Analytics() {
  const [period, setPeriod] = useState('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['creator-analytics', period],
    queryFn: () => creatorAPI.getAnalytics(period).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <DashboardLayout title="Analytics">
      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {PERIOD_OPTIONS.map(({ value, label }) => (
          <button key={value} onClick={() => setPeriod(value)}
            className="px-4 py-1.5 rounded-full text-sm font-dm transition-all"
            style={{ background: period === value ? 'var(--orange)' : 'var(--surface)', color: period === value ? '#fff' : 'var(--text2)', border: '1px solid var(--border)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Views over time (area chart) */}
        <div className="rounded-2xl p-5 col-span-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-syne font-bold mb-4" style={{ color: 'var(--text)' }}>Views & Watch Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.viewsData || []}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--orange)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views" stroke="var(--orange)" strokeWidth={2} fill="url(#viewsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic sources pie chart */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-syne font-bold mb-4" style={{ color: 'var(--text)' }}>Traffic Sources</h3>
          <div className="flex items-center gap-6">
            <PieChart width={160} height={160}>
              <Pie data={data?.trafficSources || []} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {(data?.trafficSources || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `${val}%`} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Sans' }} />
            </PieChart>
            <div className="flex-1 space-y-2">
              {(data?.trafficSources || []).map((s, i) => (
                <div key={s.source} className="flex items-center justify-between text-sm font-dm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span style={{ color: 'var(--text2)' }}>{s.source}</span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--text3)' }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Language demographics */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-syne font-bold mb-4" style={{ color: 'var(--text)' }}>Viewer Languages</h3>
          <div className="space-y-3">
            {(data?.demographics?.languages || []).map(({ lang, pct }, i) => (
              <div key={lang}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-dm" style={{ color: 'var(--text2)' }}>{lang}</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text3)' }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
