import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Eye, DollarSign, Users, Star, TrendingUp, Upload, Film, Plus } from 'lucide-react';
import { creatorAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
       style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
           style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
    <p className="font-syne font-black text-2xl" style={{ color: 'var(--text)' }}>{value}</p>
    <p className="font-dm text-sm mt-0.5" style={{ color: 'var(--text2)' }}>{label}</p>
    {sub && <p className="text-xs font-mono mt-1" style={{ color: 'var(--text3)' }}>{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
      <p className="font-mono text-xs mb-1" style={{ color: 'var(--text3)' }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>)}
    </div>
  );
  return null;
};

const DashboardLayout = ({ title, actions, children }) => {
  const { user } = useAuthStore();
  return (
    <div className="flex min-h-[calc(100vh-64px)]" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 py-6 px-3 sticky top-16 h-[calc(100vh-64px)]"
             style={{ borderRight: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div className="mb-6 px-3">
          <p className="font-dm font-600 text-sm truncate" style={{ color: 'var(--text)' }}>{user?.name}</p>
          <p className="text-xs font-dm" style={{ color: 'var(--text3)' }}>Creator Dashboard</p>
        </div>
        {[
          { to: '/dashboard', label: 'Dashboard', icon: TrendingUp },
          { to: '/dashboard/series', label: 'My Series', icon: Film },
          { to: '/dashboard/upload', label: 'Upload Episode', icon: Upload },
          { to: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
          { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
          { to: '/dashboard/settings', label: 'Settings', icon: Users },
        ].map(({ to, label, icon: Icon }) => {
          const isActive = window.location.pathname === to;
          return (
            <Link key={to} to={to}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-dm transition-colors"
              style={{
                color: isActive ? 'var(--orange)' : 'var(--text2)',
                background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
              }}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </aside>

      {/* Main */}
      <main className="flex-1 px-4 md:px-8 py-8 min-w-0">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-syne font-black text-2xl" style={{ color: 'var(--text)' }}>{title}</h1>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
};

export { DashboardLayout, StatCard, CustomTooltip };

export default function DashboardHome() {
  const { user } = useAuthStore();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const { data, isLoading } = useQuery({
    queryKey: ['creator-dashboard'],
    queryFn: () => creatorAPI.getDashboard().then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const stats = data?.stats || {};

  return (
    <DashboardLayout
      title={`Good morning, ${user?.name?.split(' ')[0]} 👋`}
      actions={
        <Link to="/dashboard/upload" className="btn-orange flex items-center gap-2 px-5 py-2.5 rounded-xl font-syne font-bold text-sm">
          <Plus size={16} /> New Episode
        </Link>
      }
    >
      <p className="font-dm text-sm mb-8" style={{ color: 'var(--text3)' }}>{today}</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Views" value={stats.totalViews?.toLocaleString() || '0'} icon={Eye} color="var(--cyan)" />
        <StatCard label="Monthly Earnings" value={`₹${stats.monthlyEarnings?.toLocaleString() || '0'}`} icon={DollarSign} color="var(--green)" />
        <StatCard label="Followers" value={stats.followers?.toLocaleString() || '0'} icon={Users} color="var(--orange)" />
        <StatCard label="Avg Rating" value={stats.avgRating || '0.0'} icon={Star} color="var(--gold)" sub={`From ${data?.stats?.seriesCount || 0} series`} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Daily views chart */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-syne font-bold mb-4 text-sm" style={{ color: 'var(--text)' }}>Daily Views — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.viewsHistory || []} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="views" fill="var(--orange)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Earnings line chart */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-syne font-bold mb-4 text-sm" style={{ color: 'var(--text)' }}>Earnings Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[
              { month: 'Oct', earnings: 1200 },
              { month: 'Nov', earnings: 2400 },
              { month: 'Dec', earnings: 1800 },
              { month: 'Jan', earnings: 3200 },
              { month: 'Feb', earnings: 4100 },
              { month: 'Mar', earnings: stats.monthlyEarnings || 2800 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="earnings" stroke="var(--green)" strokeWidth={2} dot={{ fill: 'var(--green)', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/series', label: 'Manage Series', icon: Film, desc: 'Edit, draft, or delete your series' },
          { to: '/dashboard/upload', label: 'Upload Episode', icon: Upload, desc: 'Add a new episode to your series' },
          { to: '/dashboard/earnings', label: 'View Earnings', icon: DollarSign, desc: 'Check revenue and request payouts' },
        ].map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to}
            className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5 hover:border-orange-400/30 group"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: 'rgba(249,115,22,0.1)' }}>
              <Icon size={18} style={{ color: 'var(--orange)' }} />
            </div>
            <div>
              <p className="font-syne font-bold text-sm" style={{ color: 'var(--text)' }}>{label}</p>
              <p className="text-xs font-dm" style={{ color: 'var(--text3)' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
