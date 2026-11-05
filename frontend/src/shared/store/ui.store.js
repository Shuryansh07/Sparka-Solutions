import { toast } from 'sonner';
import { create } from 'zustand';

export const useUiStore = create((set) => ({
  menuOpen: false,

  setMenuOpen: (menuOpen) => set({ menuOpen }),
  closeMenu: () => set({ menuOpen: false }),

  showToast: (message) => toast.success(message),
}));
