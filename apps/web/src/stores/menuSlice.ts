import { create } from 'zustand';

interface MenuState {
  isOpen: boolean;
  toggleMenu: () => void;
  setMenuState: (isOpen: boolean) => void;
}

const useMenuStore = create<MenuState>((set) => ({
  isOpen: false,
  toggleMenu: () => set((state) => ({ isOpen: !state.isOpen })),
  setMenuState: (isOpen: boolean) => set({ isOpen }),
}));

export default useMenuStore;
