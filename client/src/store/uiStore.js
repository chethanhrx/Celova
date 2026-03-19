import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: false,
      searchOpen: false,
      notificationOpen: false,
      selectedMood: null,
      scrollProgress: 0,

      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
      setSearchOpen: (v) => set({ searchOpen: v }),
      toggleNotifications: () => set((s) => ({ notificationOpen: !s.notificationOpen })),
      setSelectedMood: (mood) => set((s) => ({ selectedMood: s.selectedMood === mood ? null : mood })),
      setScrollProgress: (pct) => set({ scrollProgress: pct }),
    }),
    { name: 'celova-ui', partialize: (s) => ({ theme: s.theme }) }
  )
);

export default useUIStore;
