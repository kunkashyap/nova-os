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
  wallpaper: 'void' as WallpaperVariant,
  accentColor: 'void' as AccentColor,
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

// VOID: accent colors hidden from UI but kept for compat
export const ACCENT_COLORS: Record<string, { label: string; value: string }> = {
  void:    { label: 'Void',    value: '#F5F5F5' },
  violet:  { label: 'Violet',  value: '#7c3aed' },
  indigo:  { label: 'Indigo',  value: '#4f46e5' },
  cyan:    { label: 'Cyan',    value: '#0891b2' },
  blue:    { label: 'Blue',    value: '#2563eb' },
  emerald: { label: 'Emerald', value: '#059669' },
  rose:    { label: 'Rose',    value: '#e11d48' },
};

// VOID wallpaper option labels
export const WALLPAPER_OPTIONS: Record<string, string> = {
  void:      'Void',
  grain:     'Grain',
  depth:     'Depth',
  geometric: 'Geometric',
  flat:      'Flat',
  // Legacy aliases preserved for persisted settings
  aurora:    'Void',
  nebula:    'Grain',
  matrix:    'Depth',
  minimal:   'Flat',
};
