import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SeriesCard from './SeriesCard';
import { SkeletonRow } from '../ui/Skeleton';

export default function SeriesRow({ title, series = [], loading, badge, size = 'md' }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  if (loading) return <SkeletonRow />;
  if (!series.length) return null;

  return (
    <div className="relative group/row">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-syne font-bold text-lg md:text-xl" style={{ color: 'var(--text)' }}>
            {title}
          </h2>
          {badge && (
            <span
              className="badge text-[10px]"
              style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--orange)', border: '1px solid rgba(249,115,22,0.3)' }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Scroll arrows */}
        <div className="flex gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button
            onClick={() => scroll(-1)}
            className="p-1.5 rounded-full transition-colors"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="p-1.5 rounded-full transition-colors"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div ref={scrollRef} className="scroll-row pb-3">
        {series.map((s, i) => (
          <SeriesCard key={s._id} series={s} size={size} rank={badge === '#' ? i + 1 : undefined} />
        ))}
      </div>
    </div>
  );
}
