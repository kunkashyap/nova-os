import { create } from 'zustand';
import type { WindowInstance, WindowRect } from '@/types';
import { getApp } from '@/config/apps';

interface WindowStore {
  windows: WindowInstance[];
  activeWindowId: string | null;
  
  openWindow: (appId: string, payload?: Record<string, unknown>) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  
  updateWindowRect: (id: string, rect: Partial<WindowRect>) => void;
}

// Keep track of stacking order globally outside of React render cycle
let nextZIndex = 100;

export const useWindowStore = create<WindowStore>()((set, get) => ({
  windows: [],
  activeWindowId: null,

  openWindow: (appId, payload) => {
    const app = getApp(appId);
    if (!app) return '';

    const id = crypto.randomUUID();
    const width = app.defaultSize.width;
    const height = app.defaultSize.height;
    
    // Slight offset for new windows
    const offset = (get().windows.length % 5) * 30;
    const rect: WindowRect = {
      x: 100 + offset,
      y: 100 + offset,
      width,
      height,
    };

    const newWindow: WindowInstance = {
      id,
      appId,
      title: app.name,
      icon: app.icon,
      state: 'normal',
      rect,
      zIndex: ++nextZIndex,
      isFocused: true,
      isResizable: app.isResizable,
      minWidth: app.minSize?.width,
      minHeight: app.minSize?.height,
      payload,
    };

    set((state) => ({
      windows: state.windows.map(w => ({ ...w, isFocused: false })).concat(newWindow),
      activeWindowId: id,
    }));

    return id;
  },

  closeWindow: (id) => {
    set((state) => {
      const remaining = state.windows.filter(w => w.id !== id);
      const activeWindowId = state.activeWindowId === id
        ? (remaining.length > 0 ? remaining.reduce((prev, current) => (prev.zIndex > current.zIndex) ? prev : current).id : null)
        : state.activeWindowId;
      
      if (activeWindowId) {
        return {
          windows: remaining.map(w => w.id === activeWindowId ? { ...w, isFocused: true } : w),
          activeWindowId
        };
      }
      return { windows: remaining, activeWindowId };
    });
  },

  focusWindow: (id) => {
    const state = get();
    if (state.activeWindowId === id) return;

    set((state) => ({
      windows: state.windows.map(w => ({
        ...w,
        isFocused: w.id === id,
        zIndex: w.id === id ? ++nextZIndex : w.zIndex,
      })),
      activeWindowId: id,
    }));
  },

  minimizeWindow: (id) => {
    set((state) => {
      const remainingFocusable = state.windows.filter(w => w.id !== id && w.state !== 'minimized');
      const activeWindowId = state.activeWindowId === id
        ? (remainingFocusable.length > 0 ? remainingFocusable.reduce((prev, current) => (prev.zIndex > current.zIndex) ? prev : current).id : null)
        : state.activeWindowId;

      return {
        windows: state.windows.map(w => {
          if (w.id === id) return { ...w, state: 'minimized', isFocused: false };
          if (w.id === activeWindowId) return { ...w, isFocused: true };
          return w;
        }),
        activeWindowId
      };
    });
  },

  maximizeWindow: (id) => {
    const state = get();
    const win = state.windows.find(w => w.id === id);
    if (!win || !win.isResizable) return;

    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id 
          ? { 
              ...w, 
              state: 'maximized', 
              prevRect: { ...w.rect },
              isFocused: true,
              zIndex: ++nextZIndex 
            } 
          : { ...w, isFocused: false }
      ),
      activeWindowId: id,
    }));
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id 
          ? { 
              ...w, 
              state: 'normal', 
              rect: w.prevRect || w.rect, 
              isFocused: true,
              zIndex: ++nextZIndex
            } 
          : { ...w, isFocused: false }
      ),
      activeWindowId: id,
    }));
  },

  updateWindowRect: (id, rect) => {
    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id 
          ? { ...w, rect: { ...w.rect, ...rect } } 
          : w
      )
    }));
  },
}));
