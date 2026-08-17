import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OSSettings, AccentColor, WallpaperVariant, AnimationIntensity, IconSize } from '@/types';

interface SettingsStore {
  settings: OSSettings;
  updateSettings: (partial: Partial<OSSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: OSSettings = {
  username: 'nova',
  wallpaper: 'aurora',
  accentColor: 'violet',
  windowTransparency: true,
  animationIntensity: 'full',
  iconSize: 'medium',
  clockFormat: '12h',
  showSecondsInClock: false,
  soundEnabled: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'nova-settings',
    }
  )
);

export const ACCENT_COLORS: Record<AccentColor, { label: string; value: string }> = {
  violet:  { label: 'Violet',  value: '#7c3aed' },
  indigo:  { label: 'Indigo',  value: '#4f46e5' },
  cyan:    { label: 'Cyan',    value: '#0891b2' },
  blue:    { label: 'Blue',    value: '#2563eb' },
  emerald: { label: 'Emerald', value: '#059669' },
  rose:    { label: 'Rose',    value: '#e11d48' },
};

export const WALLPAPER_OPTIONS: Record<WallpaperVariant, string> = {
  aurora:    'Aurora Borealis',
  nebula:    'Deep Nebula',
  matrix:    'Digital Rain',
  geometric: 'Geometric',
  minimal:   'Minimal Dark',
};
