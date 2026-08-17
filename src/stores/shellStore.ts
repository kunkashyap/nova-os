import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OSPhase } from '@/types';

interface ShellStore {
  phase: OSPhase;
  isBooted: boolean;
  setPhase: (phase: OSPhase) => void;
  setIsBooted: (v: boolean) => void;
  reboot: () => void;
}

export const useShellStore = create<ShellStore>()(
  persist(
    (set) => ({
      phase: 'boot',
      isBooted: false,
      setPhase: (phase) => set({ phase }),
      setIsBooted: (isBooted) => set({ isBooted }),
      reboot: () => set({ phase: 'boot', isBooted: false }),
    }),
    {
      name: 'nova-shell',
      partialize: (state) => ({ isBooted: state.isBooted }),
    }
  )
);
