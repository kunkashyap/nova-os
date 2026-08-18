// ============================================================
// NOVA OS — Global Type Definitions
// ============================================================

// ─── Filesystem ──────────────────────────────────────────────
export type FileSystemNodeType = 'file' | 'folder';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileSystemNodeType;
  parentId: string | null;
  content?: string;             // file content (text)
  mimeType?: string;
  size?: number;
  createdAt: number;
  modifiedAt: number;
  trashedAt?: number;           // set when moved to trash
  originalParentId?: string;   // for restore from trash
  iconColor?: string;
}

export interface VirtualDirectory extends FileSystemNode {
  type: 'folder';
}

export interface VirtualFile extends FileSystemNode {
  type: 'file';
  content: string;
  mimeType: string;
}

// ─── Window Manager ──────────────────────────────────────────
export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  icon: string;
  state: WindowState;
  rect: WindowRect;
  prevRect?: WindowRect;       // saved before maximizing
  zIndex: number;
  isFocused: boolean;
  isResizable?: boolean;
  minWidth?: number;
  minHeight?: number;
  // app-specific payload (e.g., file path being edited)
  payload?: Record<string, unknown>;
}

// ─── App Registry ────────────────────────────────────────────
export interface AppDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;           // Lucide icon name string
  category: AppCategory;
  defaultSize: { width: number; height: number };
  minSize?: { width: number; height: number };
  isPinned?: boolean;     // pinned to taskbar by default
  isResizable?: boolean;
  keywords?: string[];    // for command palette search
}

export type AppCategory =
  | 'system'
  | 'utilities'
  | 'productivity'
  | 'media'
  | 'settings';

// ─── Notifications ───────────────────────────────────────────
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;       // ms; 0 = sticky
  createdAt: number;
}

// ─── Settings ────────────────────────────────────────────────
export type WallpaperVariant = 'aurora' | 'nebula' | 'matrix' | 'geometric' | 'minimal' | 'void' | 'grain' | 'depth' | 'flat';
export type AccentColor = 'violet' | 'indigo' | 'cyan' | 'blue' | 'emerald' | 'rose' | 'void';
export type AnimationIntensity = 'none' | 'reduced' | 'full';
export type IconSize = 'small' | 'medium' | 'large';

export interface OSSettings {
  username: string;
  wallpaper: WallpaperVariant;
  accentColor: AccentColor;
  windowTransparency: boolean;
  animationIntensity: AnimationIntensity;
  iconSize: IconSize;
  clockFormat: '12h' | '24h';
  showSecondsInClock: boolean;
  soundEnabled: boolean;
}

// ─── Desktop ─────────────────────────────────────────────────
export interface DesktopIcon {
  id: string;
  appId?: string;
  fileId?: string;       // VFS node id
  label: string;
  icon: string;
  x: number;
  y: number;
}

// ─── Context Menu ────────────────────────────────────────────
export interface ContextMenuItem {
  id: string;
  label?: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;      // render a separator instead of an item
  action?: () => void;
  submenu?: ContextMenuItem[];
}

// ─── Command Palette ─────────────────────────────────────────
export type CommandPaletteItemType = 'app' | 'file' | 'command' | 'setting';

export interface CommandPaletteItem {
  id: string;
  type: CommandPaletteItemType;
  label: string;
  description?: string;
  icon?: string;
  action: () => void;
}

// ─── Boot / Auth ─────────────────────────────────────────────
export type OSPhase = 'boot' | 'login' | 'desktop';
