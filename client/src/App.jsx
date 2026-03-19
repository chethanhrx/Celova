import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy, useEffect } from 'react';
import useAuthStore from './store/authStore';
import useUIStore from './store/uiStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollProgress from './components/ui/ScrollProgress';
import PageLoader from './components/ui/PageLoader';

// ─── Lazy Pages ───────────────────────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const Browse = lazy(() => import('./pages/Browse'));
const Watch = lazy(() => import('./pages/Watch'));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'));
const CreatorProfile = lazy(() => import('./pages/CreatorProfile'));
const Premium = lazy(() => import('./pages/Premium'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Dashboard
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const MySeriesPage = lazy(() => import('./pages/dashboard/MySeries'));
const UploadEpisode = lazy(() => import('./pages/dashboard/UploadEpisode'));
const EarningsPage = lazy(() => import('./pages/dashboard/Earnings'));
const AnalyticsPage = lazy(() => import('./pages/dashboard/Analytics'));
const SettingsPage = lazy(() => import('./pages/dashboard/Settings'));

// Admin
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent'));
const AdminPayouts = lazy(() => import('./pages/admin/AdminPayouts'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));

// ─── Query Client ─────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Route Guards ─────────────────────────────────────────────
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

// ─── Layout Wrapper (Navbar + Footer) ────────────────────────
const MainLayout = ({ children, hideFooter }) => (
  <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
    <Navbar />
    <main className="flex-1">{children}</main>
    {!hideFooter && <Footer />}
  </div>
);

// ─── No-nav Layout (auth pages) ──────────────────────────────
const AuthLayout = ({ children }) => (
  <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
    {children}
  </div>
);

export default function App() {
  const { theme } = useUIStore();
  const { setScrollProgress } = useUIStore();

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Track scroll progress
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [setScrollProgress]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollProgress />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ─── Public ───────────────────────── */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/browse" element={<MainLayout><Browse /></MainLayout>} />
            <Route path="/series/:id" element={<MainLayout><SeriesDetail /></MainLayout>} />
            <Route path="/watch/:episodeId" element={<MainLayout hideFooter><Watch /></MainLayout>} />
            <Route path="/creator/:id" element={<MainLayout><CreatorProfile /></MainLayout>} />
            <Route path="/premium" element={<MainLayout><Premium /></MainLayout>} />
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

            {/* ─── Creator Dashboard ─────────────── */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="creator">
                <MainLayout><DashboardHome /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/series" element={
              <ProtectedRoute requiredRole="creator">
                <MainLayout><MySeriesPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/upload" element={
              <ProtectedRoute requiredRole="creator">
                <MainLayout><UploadEpisode /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/earnings" element={
              <ProtectedRoute requiredRole="creator">
                <MainLayout><EarningsPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={
              <ProtectedRoute requiredRole="creator">
                <MainLayout><AnalyticsPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <MainLayout><SettingsPage /></MainLayout>
              </ProtectedRoute>
            } />

            {/* ─── Admin ─────────────────────────── */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <MainLayout><AdminOverview /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <MainLayout><AdminUsers /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/content" element={
              <ProtectedRoute requiredRole="admin">
                <MainLayout><AdminContent /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/payouts" element={
              <ProtectedRoute requiredRole="admin">
                <MainLayout><AdminPayouts /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/revenue" element={
              <ProtectedRoute requiredRole="admin">
                <MainLayout><AdminRevenue /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
