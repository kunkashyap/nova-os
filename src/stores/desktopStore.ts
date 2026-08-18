import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DesktopIcon } from '@/types';

interface DesktopStore {
  icons: DesktopIcon[];
  selectedIconIds: string[];
  setIcons: (icons: DesktopIcon[]) => void;
  updateIconPosition: (id: string, x: number, y: number) => void;
  addIcon: (icon: DesktopIcon) => void;
  removeIcon: (id: string) => void;
  selectIcon: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
}

const DEFAULT_DESKTOP_ICONS: DesktopIcon[] = [
  { id: 'di-trash', appId: 'trash', label: 'Trash', icon: 'Trash2', x: 32, y: 32 },
  { id: 'di-terminal', appId: 'terminal', label: 'Terminal', icon: 'TerminalSquare', x: 32, y: 136 },
  { id: 'di-files', appId: 'file-manager', label: 'Files', icon: 'FolderOpen', x: 32, y: 240 },
  { id: 'di-editor', appId: 'text-editor', label: 'Editor', icon: 'FileCode2', x: 32, y: 344 },
  { id: 'di-settings', appId: 'settings', label: 'Settings', icon: 'Settings', x: 32, y: 448 },
];

export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set) => ({
      icons: DEFAULT_DESKTOP_ICONS,
      selectedIconIds: [],
      setIcons: (icons) => set({ icons }),
      updateIconPosition: (id, x, y) =>
        set((state) => ({
          icons: state.icons.map((icon) =>
            icon.id === id ? { ...icon, x, y } : icon
          ),
        })),
      addIcon: (icon) =>
        set((state) => ({ icons: [...state.icons, icon] })),
      removeIcon: (id) =>
        set((state) => ({
          icons: state.icons.filter((icon) => icon.id !== id),
        })),
      selectIcon: (id, multi = false) =>
        set((state) => ({
          selectedIconIds: multi
            ? state.selectedIconIds.includes(id)
              ? state.selectedIconIds.filter((i) => i !== id)
              : [...state.selectedIconIds, id]
            : [id],
        })),
      clearSelection: () => set({ selectedIconIds: [] }),
    }),
    {
      name: 'nova-desktop',
      // If client already has persisted data with old coordinates (24, 120, etc.), migrate them!
      migrate: (persistedState: any, version: number) => {
        if (persistedState && Array.isArray(persistedState.icons)) {
          const migratedIcons = persistedState.icons.map((icon: any) => {
            // Check if coordinates match the old default spacing
            if (icon.x === 24) {
              const oldYToNewY: Record<number, number> = {
                24: 32,
                120: 136,
                216: 240,
                312: 344,
                408: 448
              };
              return {
                ...icon,
                x: 32,
                y: oldYToNewY[icon.y] || icon.y
              };
            }
            return icon;
          });
          return {
            ...persistedState,
            icons: migratedIcons
          };
        }
        return persistedState;
      }
    }
  )
);
