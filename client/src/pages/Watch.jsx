import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward,
  ChevronLeft, ChevronRight, Settings, Subtitles, Monitor, List, MessageSquare,
  Star, Send, ThumbsUp, ChevronDown, Download, Users
} from 'lucide-react';
import { episodeAPI, seriesAPI, commentAPI, ratingAPI, userAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

/*──────────────────────────────────────────────────────────────
  YouTube iframe Player wrapper
  The player is hidden behind a custom overlay so 0 YouTube
  branding is ever shown to the viewer.
──────────────────────────────────────────────────────────────*/
function YouTubePlayer({ videoId, onReady, onStateChange, playerRef }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!videoId) return;

    const loadPlayer = () => {
      if (!containerRef.current) return;
      const player = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          cc_load_policy: 0,
          color: 'red',
        },
        events: {
          onReady: (e) => { playerRef.current = e.target; onReady?.(e); },
          onStateChange: (e) => onStateChange?.(e),
        },
      });
    };

    if (window.YT && window.YT.Player) {
      loadPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = loadPlayer;
    }

    return () => {
      try { playerRef.current?.destroy(); } catch {}
    };
  }, [videoId]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

/*──────────────────────────────────────────────────────────────
  Custom Video Controls overlay
──────────────────────────────────────────────────────────────*/
function VideoControls({
  isPlaying, progress, duration, volume, isMuted, speed, isFullscreen,
  onPlayPause, onSeek, onVolume, onMute, onSpeed, onFullscreen,
  onSkipBack, onSkipForward, onPrevEpisode, onNextEpisode,
  showSkipIntro, onSkipIntro, autoplay, onAutoplay,
  episode, series,
}) {
  const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
  const [speedOpen, setSpeedOpen] = useState(false);

  const fmt = (s) => {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 pt-16"
      style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)' }}
    >
      {/* Skip Intro */}
      {showSkipIntro && (
        <div className="absolute bottom-28 right-4">
          <button
            onClick={onSkipIntro}
            className="px-5 py-2 rounded-lg font-syne font-bold text-sm border-2 transition-all hover:bg-white hover:text-black"
            style={{ borderColor: '#fff', color: '#fff', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            Skip Intro →
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-3 group/progress">
        <div className="relative h-1 group-hover/progress:h-2.5 transition-all rounded-full cursor-pointer"
             style={{ background: 'rgba(255,255,255,0.2)' }}
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               onSeek(((e.clientX - rect.left) / rect.width) * duration);
             }}>
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(progress / duration) * 100 || 0}%`, background: 'var(--orange)' }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
               style={{ left: `${(progress / duration) * 100 || 0}%`, transform: 'translateX(-50%) translateY(-50%)', background: 'var(--orange)', boxShadow: '0 0 8px rgba(249,115,22,0.8)' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{fmt(progress)}</span>
          <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Prev/Next episode */}
          <button onClick={onPrevEpisode} className="p-1.5 text-white/60 hover:text-white transition-colors hidden md:block">
            <SkipBack size={18} />
          </button>

          {/* Skip back 10s */}
          <button onClick={onSkipBack} className="p-1.5 text-white/70 hover:text-white transition-colors">
            <div className="relative"><SkipBack size={18} /><span className="absolute -bottom-1 -right-1 text-[8px] font-mono">10</span></div>
          </button>

          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{ background: 'var(--orange)', boxShadow: '0 0 20px rgba(249,115,22,0.5)' }}
          >
            {isPlaying ? <Pause size={18} fill="white" className="text-white" /> : <Play size={18} fill="white" className="text-white ml-0.5" />}
          </button>

          {/* Skip forward 10s */}
          <button onClick={onSkipForward} className="p-1.5 text-white/70 hover:text-white transition-colors">
            <div className="relative"><SkipForward size={18} /><span className="absolute -bottom-1 -right-1 text-[8px] font-mono">10</span></div>
          </button>

          {/* Next episode */}
          <button onClick={onNextEpisode} className="p-1.5 text-white/60 hover:text-white transition-colors hidden md:block">
            <SkipForward size={18} />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1.5 group/vol ml-2">
            <button onClick={onMute} className="text-white/70 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-200">
              <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
                onChange={(e) => onVolume(parseFloat(e.target.value))}
                className="w-20 accent-orange-500" />
            </div>
          </div>

          {/* Episode info */}
          {episode && (
            <div className="hidden md:block ml-3">
              <p className="text-white font-dm font-600 text-sm leading-tight">{episode.title}</p>
              <p className="text-white/50 text-xs font-mono">S{episode.seasonNumber}:E{episode.episodeNumber}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Autoplay */}
          <button onClick={onAutoplay} className="hidden md:flex items-center gap-1 text-xs font-dm px-2 py-1 rounded"
                  style={{ color: autoplay ? 'var(--orange)' : 'rgba(255,255,255,0.5)' }}>
            Autoplay {autoplay ? 'ON' : 'OFF'}
          </button>

          {/* Playback speed */}
          <div className="relative">
            <button onClick={() => setSpeedOpen(!speedOpen)}
              className="text-xs font-mono px-2 py-1 rounded" style={{ color: speed !== 1 ? 'var(--orange)' : 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)' }}>
              {speed}×
            </button>
            {speedOpen && (
              <div className="absolute bottom-full right-0 mb-2 rounded-xl overflow-hidden z-30"
                   style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                {SPEEDS.map(s => (
                  <button key={s} onClick={() => { onSpeed(s); setSpeedOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm font-mono hover:bg-white/5 transition-colors"
                    style={{ color: speed === s ? 'var(--orange)' : 'var(--text2)' }}>
                    {s}×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button onClick={onFullscreen} className="p-1.5 text-white/70 hover:text-white transition-colors">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/*──────────────────────────────────────────────────────────────
  Star Rating Widget
──────────────────────────────────────────────────────────────*/
function StarRating({ seriesId, onRate }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  const handleRate = async (stars) => {
    setSelected(stars);
    try {
      await ratingAPI.upsert({ seriesId, stars });
      toast.success(`Rated ${stars} star${stars > 1 ? 's' : ''}! ⭐`);
      onRate?.();
    } catch { toast.error('Failed to rate'); }
  };

  return (
    <div className="star-rating flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} className="star text-2xl" onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)} onClick={() => handleRate(s)}
          style={{ color: s <= (hovered || selected) ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>
          ★
        </button>
      ))}
      {selected > 0 && <span className="text-sm font-dm ml-2" style={{ color: 'var(--text2)' }}>Your rating: {selected}/5</span>}
    </div>
  );
}

/*──────────────────────────────────────────────────────────────
  Comment Section
──────────────────────────────────────────────────────────────*/
function CommentSection({ episodeId }) {
  const { isAuthenticated, user } = useAuthStore();
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);

  const { data, refetch } = useQuery({
    queryKey: ['comments', episodeId, page],
    queryFn: () => commentAPI.getByEpisode(episodeId, page).then(r => r.data),
    enabled: !!episodeId,
  });

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!isAuthenticated) { toast.error('Sign in to comment'); return; }
    setPosting(true);
    try {
      await commentAPI.post({ episodeId, text });
      setText('');
      refetch();
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
    setPosting(false);
  };

  const handleLike = async (commentId) => {
    if (!isAuthenticated) { toast.error('Sign in to like'); return; }
    await commentAPI.like(commentId);
    refetch();
  };

  return (
    <div>
      <h3 className="font-syne font-bold text-lg mb-4" style={{ color: 'var(--text)' }}>
        Comments {data?.total ? `(${data.total})` : ''}
      </h3>

      {/* Post comment */}
      <form onSubmit={handlePost} className="flex gap-3 mb-6">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
             style={{ background: 'var(--orange)', color: '#fff' }}>
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)}
            placeholder={isAuthenticated ? 'Add a comment...' : 'Sign in to comment'}
            disabled={!isAuthenticated}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-dm outline-none transition-colors"
            style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
            maxLength={500}
          />
          <button type="submit" disabled={!text.trim() || posting}
            className="p-2.5 rounded-xl transition-colors disabled:opacity-40"
            style={{ background: 'var(--orange)', color: '#fff' }}>
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Comment list */}
      <div className="space-y-4">
        {data?.comments?.map((c) => (
          <div key={c._id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden">
              {c.userId?.avatar ? (
                <img src={c.userId.avatar} alt={c.userId.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs"
                     style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                  {c.userId?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-dm font-600 text-sm" style={{ color: 'var(--text)' }}>{c.userId?.name}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
                {c.isEdited && <span className="text-xs" style={{ color: 'var(--text3)' }}>(edited)</span>}
              </div>
              <p className="text-sm font-dm leading-relaxed" style={{ color: c.isDeleted ? 'var(--text3)' : 'var(--text2)' }}>
                {c.text}
              </p>
              <button onClick={() => handleLike(c._id)}
                className="flex items-center gap-1 text-xs mt-1.5 transition-colors hover:text-orange-400"
                style={{ color: 'var(--text3)' }}>
                <ThumbsUp size={11} /> {c.likes?.length || 0}
              </button>
            </div>
          </div>
        ))}
      </div>

      {data?.total > data?.comments?.length && (
        <button onClick={() => setPage(p => p + 1)}
          className="mt-4 text-sm font-dm transition-colors hover:text-orange-400"
          style={{ color: 'var(--text2)' }}>
          Load more comments…
        </button>
      )}
    </div>
  );
}

/*──────────────────────────────────────────────────────────────
  Watch Page
──────────────────────────────────────────────────────────────*/
export default function Watch() {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('episodes');
  const [selectedSeason, setSelectedSeason] = useState(1);

  const { data: episode } = useQuery({
    queryKey: ['episode', episodeId],
    queryFn: () => episodeAPI.getById(episodeId).then(r => r.data.episode),
  });

  const { data: series } = useQuery({
    queryKey: ['series', episode?.seriesId?._id],
    queryFn: () => seriesAPI.getById(episode.seriesId._id).then(r => r.data.series),
    enabled: !!episode?.seriesId?._id,
  });

  const { data: episodes } = useQuery({
    queryKey: ['episodes', episode?.seriesId?._id, selectedSeason],
    queryFn: () => episodeAPI.getBySeries(episode.seriesId._id, { season: selectedSeason }).then(r => r.data.episodes),
    enabled: !!episode?.seriesId?._id,
  });

  const { data: recommended } = useQuery({
    queryKey: ['recommended'],
    queryFn: () => seriesAPI.getTrending().then(r => r.data.series?.slice(0, 4)),
  });

  // Track view + watch progress
  useEffect(() => {
    if (!episode) return;
    const seriesId = episode.seriesId?._id || episode.seriesId;
    episodeAPI.incrementView(episodeId, seriesId).catch(() => {});
  }, [episodeId, episode]);

  // Sync watch progress every 10s
  useEffect(() => {
    if (!isAuthenticated || !episode || !progress) return;
    const timer = setInterval(() => {
      userAPI.updateWatchProgress({
        seriesId: episode.seriesId?._id || episode.seriesId,
        episodeId,
        progress: Math.floor(progress),
      }).catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [isAuthenticated, episode, episodeId, progress]);

  // Poll player state every second
  useEffect(() => {
    const poll = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const t = p.getCurrentTime?.() || 0;
        const d = p.getDuration?.() || 0;
        setProgress(t);
        setDuration(d);
        setIsPlaying(p.getPlayerState?.() === 1);
        setShowSkipIntro(t < (episode?.introEnd || 90));
      } catch {}
    }, 1000);
    return () => clearInterval(poll);
  }, [episode]);

  // Auto-hide controls after 3s of inactivity
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const handlePlayPause = () => {
    const p = playerRef.current;
    if (!p) return;
    if (isPlaying) p.pauseVideo?.(); else p.playVideo?.();
  };

  const handleSeek = (time) => playerRef.current?.seekTo?.(time, true);
  const handleSkipBack = () => handleSeek(Math.max(0, progress - 10));
  const handleSkipForward = () => handleSeek(Math.min(duration, progress + 10));
  const handleSkipIntro = () => handleSeek(episode?.introEnd || 90);

  const handleVolume = (v) => {
    setVolume(v);
    setIsMuted(v === 0);
    playerRef.current?.setVolume?.(v * 100);
    if (v > 0 && isMuted) {
      playerRef.current?.unMute?.();
    }
  };

  const handleMute = () => {
    if (isMuted) {
      playerRef.current?.unMute?.();
      playerRef.current?.setVolume?.(volume * 100);
    } else {
      playerRef.current?.mute?.();
    }
    setIsMuted(!isMuted);
  };

  const handleSpeed = (s) => {
    setSpeed(s);
    playerRef.current?.setPlaybackRate?.(s);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handlePrevEpisode = () => {
    if (!episodes) return;
    const idx = episodes.findIndex(e => e._id === episodeId);
    if (idx > 0) navigate(`/watch/${episodes[idx - 1]._id}`);
  };

  const handleNextEpisode = () => {
    if (!episodes) return;
    const idx = episodes.findIndex(e => e._id === episodeId);
    if (idx < episodes.length - 1) navigate(`/watch/${episodes[idx + 1]._id}`);
    else toast('🎉 You\'ve finished this season!');
  };

  const seriesId = episode?.seriesId?._id || episode?.seriesId;
  const seasons = Array.from({ length: series?.seasons || 1 }, (_, i) => i + 1);

  return (
    <div className="flex h-[calc(100vh-64px)]" style={{ background: 'var(--bg)' }}>
      {/* ── Video Column (70%) ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Player */}
        <div
          ref={containerRef}
          className="relative bg-black"
          style={{ aspectRatio: '16/9', maxHeight: '70vh', cursor: showControls ? 'default' : 'none' }}
          onMouseMove={resetControlsTimer}
          onClick={handlePlayPause}
        >
          {episode?.youtubeVideoId ? (
            <YouTubePlayer
              videoId={episode.youtubeVideoId}
              playerRef={playerRef}
              onReady={() => setDuration(playerRef.current?.getDuration?.() || 0)}
              onStateChange={(e) => {
                setIsPlaying(e.data === 1);
                if (e.data === 0 && autoplay) {
                  setTimeout(handleNextEpisode, 2000);
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3" style={{ background: '#000' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                <Play size={32} style={{ color: 'var(--text3)' }} />
              </div>
              <p className="font-dm text-sm" style={{ color: 'var(--text3)' }}>
                {episode ? 'Video not available yet' : 'Loading episode...'}
              </p>
            </div>
          )}

          {/* Dark overlay for inactive player */}
          {!isPlaying && episode?.youtubeVideoId && (
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.3)' }} />
          )}

          {/* Controls overlay */}
          <div style={{ opacity: showControls ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: showControls ? 'auto' : 'none' }}
               onClick={(e) => e.stopPropagation()}>
            <VideoControls
              isPlaying={isPlaying} progress={progress} duration={duration}
              volume={volume} isMuted={isMuted} speed={speed} isFullscreen={isFullscreen}
              onPlayPause={handlePlayPause} onSeek={handleSeek} onVolume={handleVolume}
              onMute={handleMute} onSpeed={handleSpeed} onFullscreen={handleFullscreen}
              onSkipBack={handleSkipBack} onSkipForward={handleSkipForward}
              onPrevEpisode={handlePrevEpisode} onNextEpisode={handleNextEpisode}
              showSkipIntro={showSkipIntro && progress > 5} onSkipIntro={handleSkipIntro}
              autoplay={autoplay} onAutoplay={() => setAutoplay(a => !a)}
              episode={episode} series={series}
            />
          </div>
        </div>

        {/* Below player: scrollable info */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-6">
          {/* Title + meta */}
          <div>
            {series && (
              <Link to={`/series/${seriesId}`} className="text-sm font-dm transition-colors hover:text-orange-400" style={{ color: 'var(--text2)' }}>
                ← {series.title}
              </Link>
            )}
            <h1 className="font-syne font-bold text-xl mt-1" style={{ color: 'var(--text)' }}>
              {episode?.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {episode && (
                <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>
                  S{episode.seasonNumber}:E{episode.episodeNumber}
                </span>
              )}
              {series?.genre && <span className="badge" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--orange)', border: '1px solid rgba(249,115,22,0.2)' }}>{series.genre}</span>}
              {series?.language && <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text2)' }}>{series.language}</span>}
              {series?.ageRating && <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text2)' }}>{series.ageRating}</span>}
            </div>
          </div>

          {/* Description */}
          {episode?.description && (
            <p className="font-dm text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
              {episode.description}
            </p>
          )}

          {/* Star rating */}
          {isAuthenticated && seriesId && (
            <div>
              <p className="text-xs font-syne font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text2)' }}>Rate this series</p>
              <StarRating seriesId={seriesId} />
            </div>
          )}

          {/* Comments */}
          {episodeId && <CommentSection episodeId={episodeId} />}
        </div>
      </div>

      {/* ── Sidebar (30%) ── */}
      <div
        className="hidden lg:flex flex-col w-80 xl:w-96 border-l overflow-hidden"
        style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}
      >
        {/* Sidebar tabs */}
        <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'episodes', icon: List, label: 'Episodes' },
            { id: 'comments', icon: MessageSquare, label: 'Chat' },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setSidebarTab(id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-syne font-bold uppercase tracking-wide transition-colors"
              style={{
                color: sidebarTab === id ? 'var(--orange)' : 'var(--text3)',
                borderBottom: sidebarTab === id ? '2px solid var(--orange)' : '2px solid transparent',
              }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Episodes tab */}
        {sidebarTab === 'episodes' && (
          <div className="flex-1 overflow-y-auto">
            {/* Season selector */}
            {series?.seasons > 1 && (
              <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <select value={selectedSeason} onChange={(e) => setSelectedSeason(+e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm font-dm"
                  style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                  {seasons.map(s => <option key={s} value={s}>Season {s}</option>)}
                </select>
              </div>
            )}

            <div className="p-2 space-y-1">
              {episodes?.map((ep) => {
                const isCurrent = ep._id === episodeId;
                return (
                  <Link key={ep._id} to={`/watch/${ep._id}`}
                    className="flex gap-3 p-2.5 rounded-xl transition-colors"
                    style={{ background: isCurrent ? 'rgba(249,115,22,0.1)' : 'transparent', border: isCurrent ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent' }}>
                    {/* Thumbnail / equalizer */}
                    <div className="relative w-20 shrink-0 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', background: 'var(--surface)' }}>
                      {ep.thumbnail && <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />}
                      {isCurrent && (
                        <div className="absolute inset-0 flex items-end justify-center pb-1.5 gap-0.5" style={{ background: 'rgba(0,0,0,0.5)' }}>
                          {[0, 1, 2, 3].map(i => (
                            <div key={i} className="equalizer-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono" style={{ color: 'var(--text3)' }}>E{ep.episodeNumber}</p>
                      <p className="text-xs font-dm font-600 truncate" style={{ color: isCurrent ? 'var(--orange)' : 'var(--text)' }}>
                        {ep.title}
                      </p>
                      {ep.duration > 0 && (
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text3)' }}>
                          {Math.floor(ep.duration / 60)}m
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Comments tab */}
        {sidebarTab === 'comments' && (
          <div className="flex-1 overflow-y-auto p-4">
            {episodeId && <CommentSection episodeId={episodeId} />}
          </div>
        )}
      </div>
    </div>
  );
}
