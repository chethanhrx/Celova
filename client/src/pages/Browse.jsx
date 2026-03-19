import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { seriesAPI } from '../services/api';
import SeriesCard from '../components/series/SeriesCard';
import { SkeletonCard } from '../components/ui/Skeleton';

const GENRES = ['Action', 'Sci-Fi', 'Fantasy', 'Horror', 'Romance', 'Comedy', 'Mystery', 'Thriller'];
const LANGUAGES = ['English', 'Hindi', 'Japanese', 'Korean', 'Spanish', 'French'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'trending', label: 'Trending' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const genre = searchParams.get('genre') || '';
  const language = searchParams.get('language') || '';
  const sort = searchParams.get('sort') || 'newest';

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params);
    setPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['browse', genre, language, sort, page],
    queryFn: () => seriesAPI.getAll({ genre: genre || undefined, language: language || undefined, sort, page, limit: 24 }).then(r => r.data),
    keepPreviousData: true,
  });

  const activeFilters = [
    genre && { key: 'genre', value: genre },
    language && { key: 'language', value: language },
  ].filter(Boolean);

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne font-black text-3xl" style={{ color: 'var(--text)' }}>Browse</h1>
          {data?.total && (
            <p className="text-sm font-dm mt-1" style={{ color: 'var(--text2)' }}>
              {data.total} series found
            </p>
          )}
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-dm transition-colors"
          style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}
        >
          <SlidersHorizontal size={15} /> Filters
          {activeFilters.length > 0 && (
            <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'var(--orange)', color: '#fff' }}>
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {filtersOpen && (
        <div className="mb-6 p-5 rounded-2xl space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {/* Sort */}
          <div>
            <p className="text-xs font-syne font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Sort By</p>
            <div className="flex flex-wrap gap-2">
              {SORTS.map(s => (
                <button key={s.value} onClick={() => setFilter('sort', s.value)}
                  className="px-3 py-1.5 rounded-lg text-sm font-dm transition-all"
                  style={{
                    background: sort === s.value ? 'var(--orange)' : 'var(--surface2)',
                    color: sort === s.value ? '#fff' : 'var(--text2)',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {/* Genre */}
          <div>
            <p className="text-xs font-syne font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Genre</p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button key={g} onClick={() => setFilter('genre', genre === g ? '' : g)}
                  className="px-3 py-1.5 rounded-lg text-sm font-dm transition-all"
                  style={{ background: genre === g ? 'var(--orange)' : 'var(--surface2)', color: genre === g ? '#fff' : 'var(--text2)' }}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          {/* Language */}
          <div>
            <p className="text-xs font-syne font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Language</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => (
                <button key={l} onClick={() => setFilter('language', language === l ? '' : l)}
                  className="px-3 py-1.5 rounded-lg text-sm font-dm transition-all"
                  style={{ background: language === l ? 'var(--orange)' : 'var(--surface2)', color: language === l ? '#fff' : 'var(--text2)' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {/* Active filters / Clear */}
          {activeFilters.length > 0 && (
            <button onClick={() => { setSearchParams({}); setPage(1); }}
              className="flex items-center gap-1.5 text-sm font-dm" style={{ color: 'var(--red)' }}>
              <X size={14} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {activeFilters.map(({ key, value }) => (
            <span key={key} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-dm"
                  style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--orange)', border: '1px solid rgba(249,115,22,0.3)' }}>
              {value}
              <button onClick={() => setFilter(key, '')}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Series Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} aspect="2/3" />)
          : data?.series?.map(s => (
            <div key={s._id} className="w-full">
              <SeriesCard series={s} size="sm" />
            </div>
          ))
        }
      </div>

      {/* Empty state */}
      {!isLoading && data?.series?.length === 0 && (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🎬</p>
          <h3 className="font-syne font-bold text-xl mb-2" style={{ color: 'var(--text)' }}>No series found</h3>
          <p className="font-dm" style={{ color: 'var(--text2)' }}>Try adjusting your filters.</p>
        </div>
      )}

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-lg text-sm font-dm disabled:opacity-40"
            style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
            Previous
          </button>
          <span className="font-mono text-sm px-4" style={{ color: 'var(--text2)' }}>{page} / {data.pages}</span>
          <button disabled={page === data.pages} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-lg text-sm font-dm disabled:opacity-40"
            style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
