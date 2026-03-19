import { Link } from 'react-router-dom';
import { Youtube, Twitter, Instagram, Globe } from 'lucide-react';

const links = {
  Platform: [
    { label: 'Home', to: '/' },
    { label: 'Browse', to: '/browse' },
    { label: 'Premium', to: '/premium' },
    { label: 'Top 10', to: '/browse?sort=trending' },
  ],
  Creators: [
    { label: 'Become a Creator', to: '/register?role=creator' },
    { label: 'Creator Dashboard', to: '/dashboard' },
    { label: 'Upload Episode', to: '/dashboard/upload' },
    { label: 'Earnings', to: '/dashboard/earnings' },
  ],
  Support: [
    { label: 'Help Center', to: '#' },
    { label: 'Contact Us', to: '#' },
    { label: 'Report Content', to: '#' },
    { label: 'Community Guidelines', to: '#' },
  ],
  Company: [
    { label: 'About Celova', to: '#' },
    { label: 'Blog', to: '#' },
    { label: 'Careers', to: '#' },
    { label: 'Press Kit', to: '#' },
  ],
};

const socials = [
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Globe, href: '#', label: 'Website' },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-screen-xl mx-auto px-4 pt-16 pb-8">
        {/* Top: Logo + Description */}
        <div className="flex flex-col md:flex-row gap-10 mb-12">
          <div className="md:w-64 shrink-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
              >
                <span className="font-syne font-black text-white text-lg">C</span>
              </div>
              <span className="font-syne font-black text-xl">
                <span style={{ color: 'var(--orange)' }}>C</span>
                <span style={{ color: 'var(--text)' }}>elova</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4 font-dm" style={{ color: 'var(--text2)' }}>
              Where AI Brings Stories to Life. The world's first streaming platform built for AI-generated animated series and movies.
            </p>
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2 rounded-lg hover:bg-white/8 transition-colors"
                  style={{ color: 'var(--text2)' }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(links).map(([section, items]) => (
              <div key={section}>
                <h4 className="font-syne font-bold text-sm mb-4" style={{ color: 'var(--text)' }}>{section}</h4>
                <ul className="space-y-2">
                  {items.map(({ label, to }) => (
                    <li key={label}>
                      <Link
                        to={to}
                        className="text-sm font-dm transition-colors hover:text-orange-400"
                        style={{ color: 'var(--text2)' }}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs font-dm" style={{ color: 'var(--text3)' }}>
            © 2026 Celova Technologies. All rights reserved.
          </p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((t) => (
              <a key={t} href="#" className="text-xs font-dm hover:text-orange-400 transition-colors" style={{ color: 'var(--text3)' }}>
                {t}
              </a>
            ))}
          </div>
          <select
            className="text-xs rounded-lg px-3 py-1.5 font-dm"
            style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}
          >
            <option>🌐 English</option>
            <option>🇮🇳 Hindi</option>
            <option>🇯🇵 Japanese</option>
            <option>🇰🇷 Korean</option>
            <option>🇪🇸 Spanish</option>
          </select>
        </div>
      </div>
    </footer>
  );
}
