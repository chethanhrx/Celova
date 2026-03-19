import { create } from 'zustand';

const usePlayerStore = create((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  playbackSpeed: 1,
  isFullscreen: false,
  isTheaterMode: false,
  showControls: true,
  autoplayNext: true,
  currentEpisodeId: null,
  currentSeriesId: null,
  watchPartyRoom: null,

  setIsPlaying: (v) => set({ isPlaying: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setVolume: (v) => set({ volume: v, isMuted: v === 0 }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setPlaybackSpeed: (s) => set({ playbackSpeed: s }),
  toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
  toggleTheaterMode: () => set((s) => ({ isTheaterMode: !s.isTheaterMode })),
  setShowControls: (v) => set({ showControls: v }),
  toggleAutoplay: () => set((s) => ({ autoplayNext: !s.autoplayNext })),
  setCurrentEpisode: (episodeId, seriesId) => set({ currentEpisodeId: episodeId, currentSeriesId: seriesId }),
  setWatchPartyRoom: (room) => set({ watchPartyRoom: room }),
  resetPlayer: () => set({ isPlaying: false, currentTime: 0, duration: 0 }),
}));

export default usePlayerStore;
