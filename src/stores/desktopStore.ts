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
  { id: 'di-trash', appId: 'trash', label: 'Trash', icon: 'Trash2', x: 24, y: 24 },
  { id: 'di-terminal', appId: 'terminal', label: 'Terminal', icon: 'TerminalSquare', x: 24, y: 120 },
  { id: 'di-files', appId: 'file-manager', label: 'Files', icon: 'FolderOpen', x: 24, y: 216 },
  { id: 'di-editor', appId: 'text-editor', label: 'Editor', icon: 'FileCode2', x: 24, y: 312 },
  { id: 'di-settings', appId: 'settings', label: 'Settings', icon: 'Settings', x: 24, y: 408 },
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
    }
  )
);
