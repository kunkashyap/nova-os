import type { AppDefinition } from '@/types';

// ─── Application Registry ─────────────────────────────────────────────
// Single source of truth for all registered apps.
// Desktop, Taskbar, Start Menu, and Command Palette all consume this.

export const APP_REGISTRY: AppDefinition[] = [
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Command-line interface for NOVA OS',
    icon: 'TerminalSquare',
    category: 'system',
    defaultSize: { width: 720, height: 480 },
    minSize: { width: 480, height: 300 },
    isPinned: true,
    isResizable: true,
    keywords: ['terminal', 'shell', 'command', 'cli', 'bash', 'console'],
  },
  {
    id: 'file-manager',
    name: 'Files',
    description: 'Browse and manage your files and folders',
    icon: 'FolderOpen',
    category: 'system',
    defaultSize: { width: 860, height: 560 },
    minSize: { width: 520, height: 380 },
    isPinned: true,
    isResizable: true,
    keywords: ['files', 'folders', 'manager', 'explorer', 'browse'],
  },
  {
    id: 'text-editor',
    name: 'Editor',
    description: 'Write and edit code and text files',
    icon: 'FileCode2',
    category: 'productivity',
    defaultSize: { width: 800, height: 560 },
    minSize: { width: 480, height: 360 },
    isPinned: true,
    isResizable: true,
    keywords: ['editor', 'text', 'code', 'write', 'notepad'],
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Perform arithmetic calculations',
    icon: 'Calculator',
    category: 'utilities',
    defaultSize: { width: 320, height: 500 },
    minSize: { width: 280, height: 440 },
    isPinned: false,
    isResizable: false,
    keywords: ['calculator', 'math', 'arithmetic', 'calc'],
  },
  {
    id: 'image-viewer',
    name: 'Gallery',
    description: 'View and browse images',
    icon: 'Image',
    category: 'media',
    defaultSize: { width: 800, height: 580 },
    minSize: { width: 400, height: 320 },
    isPinned: false,
    isResizable: true,
    keywords: ['images', 'photos', 'gallery', 'viewer', 'pictures'],
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Customize your NOVA OS experience',
    icon: 'Settings',
    category: 'settings',
    defaultSize: { width: 720, height: 520 },
    minSize: { width: 560, height: 420 },
    isPinned: false,
    isResizable: true,
    keywords: ['settings', 'preferences', 'customize', 'appearance', 'theme'],
  },
  {
    id: 'trash',
    name: 'Trash',
    description: 'Manage deleted files',
    icon: 'Trash2',
    category: 'system',
    defaultSize: { width: 700, height: 480 },
    minSize: { width: 440, height: 320 },
    isPinned: false,
    isResizable: true,
    keywords: ['trash', 'recycle', 'deleted', 'bin'],
  },
  {
    id: 'about',
    name: 'About NOVA OS',
    description: 'System information and version details',
    icon: 'Info',
    category: 'system',
    defaultSize: { width: 560, height: 420 },
    minSize: { width: 480, height: 380 },
    isPinned: false,
    isResizable: false,
    keywords: ['about', 'system', 'info', 'version', 'nova'],
  },
];

export const getApp = (id: string): AppDefinition | undefined =>
  APP_REGISTRY.find(a => a.id === id);

export const getPinnedApps = (): AppDefinition[] =>
  APP_REGISTRY.filter(a => a.isPinned);

export const TASKBAR_HEIGHT = 52;

export const OS_VERSION = '2.0.0';
export const OS_NAME = 'NOVA OS';
export const OS_CODENAME = 'Andromeda';
export const OS_BUILD = '20260817';
export const OS_ARCH = 'WebAssembly/V8';
export const OS_KERNEL = 'NovaKernel 2.0.1-lts';
