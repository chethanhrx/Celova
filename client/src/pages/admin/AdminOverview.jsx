import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Film, DollarSign, AlertTriangle, TrendingUp, Shield, Eye, BarChart2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CustomTooltip } from '../dashboard/DashboardHome';

const AdminLayout = ({ title, children }) => (
  <div className="flex min-h-[calc(100vh-64px)]" style={{ background: 'var(--bg)' }}>
    <aside className="hidden md:flex flex-col w-56 shrink-0 py-6 px-3 sticky top-16 h-[calc(100vh-64px)]"
           style={{ borderRight: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div className="flex items-center gap-2 mb-6 px-3">
        <Shield size={16} style={{ color: 'var(--orange)' }} />
        <span className="font-syne font-bold text-sm" style={{ color: 'var(--orange)' }}>Admin Panel</span>
      </div>
      {[
        { to: '/admin', label: 'Overview', icon: BarChart2 },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/content', label: 'Content', icon: Film },
        { to: '/admin/payouts', label: 'Payouts', icon: DollarSign },
        { to: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
      ].map(({ to, label, icon: Icon }) => {
        const isActive = window.location.pathname === to;
        return (
          <Link key={to} to={to}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-dm transition-colors"
            style={{ color: isActive ? 'var(--orange)' : 'var(--text2)', background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent' }}>
            <Icon size={16} /> {label}
          </Link>
        );
      })}
    </aside>
    <main className="flex-1 px-4 md:px-8 py-8 min-w-0">
      <h1 className="font-syne font-black text-2xl mb-8" style={{ color: 'var(--text)' }}>{title}</h1>
      {children}
    </main>
  </div>
);

export { AdminLayout };

export default function AdminOverview() {
  const { data } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminAPI.getOverview().then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const stats = data?.stats || {};

  const STAT_CARDS = [
    { label: 'Total Users', value: stats.totalUsers?.toLocaleString() || 0, icon: Users, color: 'var(--cyan)' },
    { label: 'Active Creators', value: stats.activeCreators || 0, icon: Film, color: 'var(--orange)' },
    { label: 'Total Series', value: stats.totalSeries || 0, icon: Eye, color: 'var(--green)' },
    { label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'var(--gold)' },
    { label: 'Premium Subscribers', value: stats.premiumSubscribers || 0, icon: TrendingUp, color: 'var(--cyan)' },
    { label: 'Pending Reports', value: stats.pendingReports || 0, icon: AlertTriangle, color: stats.pendingReports > 5 ? 'var(--red)' : 'var(--text3)' },
  ];

  return (
    <AdminLayout title="Platform Overview">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="font-syne font-black text-2xl" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="text-xs font-dm mt-0.5" style={{ color: 'var(--text2)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/admin/users', label: 'Manage Users', desc: 'Ban, verify creators, view profiles' },
          { to: '/admin/content', label: 'Review Content', desc: `${stats.pendingReports || 0} pending reports` },
          { to: '/admin/payouts', label: 'Process Payouts', desc: 'Approve and mark earnings paid' },
          { to: '/admin/revenue', label: 'Revenue Analytics', desc: 'Platform-wide earnings breakdown' },
        ].map(({ to, label, desc }) => (
          <Link key={to} to={to}
            className="p-4 rounded-xl transition-all hover:-translate-y-0.5 hover:border-orange-400/30"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="font-syne font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{label}</p>
            <p className="text-xs font-dm" style={{ color: 'var(--text3)' }}>{desc}</p>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
