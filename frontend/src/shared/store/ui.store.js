import { create } from 'zustand';

export const useUiStore = create((set) => ({
  menuOpen: false,

  setMenuOpen: (menuOpen) => set({ menuOpen }),
  closeMenu: () => set({ menuOpen: false }),

  // sonner loads on demand so it stays out of the first-paint bundle.
  showToast: (message) => import('sonner').then(({ toast }) => toast.success(message)),
}));
