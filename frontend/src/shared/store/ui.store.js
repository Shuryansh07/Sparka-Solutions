import { create } from 'zustand';

let toastTimer;

export const useUiStore = create((set) => ({
  menuOpen: false,
  mastheadVisible: false,
  toast: null,

  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),
  closeMenu: () => set({ menuOpen: false }),
  setMastheadVisible: (mastheadVisible) => set({ mastheadVisible }),

  showToast: (message) => {
    clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = setTimeout(() => set({ toast: null }), 3200);
  },
}));
