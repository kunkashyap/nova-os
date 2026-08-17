import type { FileSystemNode } from '@/types';
const ROOT_DIR_ID = 'root';

// Hardcoded IDs for system folders so we can reference them
export const SYS_FOLDERS = {
  DESKTOP: 'dir-desktop',
  DOCUMENTS: 'dir-documents',
  DOWNLOADS: 'dir-downloads',
  PICTURES: 'dir-pictures',
  PROJECTS: 'dir-projects',
  TRASH: 'dir-trash',
};

const now = Date.now();

export const SEED_DATA: FileSystemNode[] = [
  {
    id: SYS_FOLDERS.DESKTOP,
    parentId: ROOT_DIR_ID,
    name: 'Desktop',
    type: 'folder',
    createdAt: now,
    modifiedAt: now,
    iconColor: '#3b82f6',
  },
  {
    id: SYS_FOLDERS.DOCUMENTS,
    parentId: ROOT_DIR_ID,
    name: 'Documents',
    type: 'folder',
    createdAt: now,
    modifiedAt: now,
    iconColor: '#8b5cf6',
  },
  {
    id: SYS_FOLDERS.DOWNLOADS,
    parentId: ROOT_DIR_ID,
    name: 'Downloads',
    type: 'folder',
    createdAt: now,
    modifiedAt: now,
    iconColor: '#06b6d4',
  },
  {
    id: SYS_FOLDERS.PICTURES,
    parentId: ROOT_DIR_ID,
    name: 'Pictures',
    type: 'folder',
    createdAt: now,
    modifiedAt: now,
    iconColor: '#ec4899',
  },
  {
    id: SYS_FOLDERS.PROJECTS,
    parentId: ROOT_DIR_ID,
    name: 'Projects',
    type: 'folder',
    createdAt: now,
    modifiedAt: now,
    iconColor: '#f59e0b',
  },
  {
    id: SYS_FOLDERS.TRASH,
    parentId: ROOT_DIR_ID,
    name: 'Trash',
    type: 'folder',
    createdAt: now,
    modifiedAt: now,
    iconColor: '#64748b',
  },
  // Sample files
  {
    id: 'file-readme',
    parentId: SYS_FOLDERS.DESKTOP,
    name: 'README.md',
    type: 'file',
    content: `# Welcome to NOVA OS 2.0\n\nThis is a fully functional browser-based desktop environment.\n\n## Features:\n- Window Manager\n- Virtual Filesystem\n- Terminal\n- Text Editor\n- Settings\n\nEnjoy exploring!`,
    mimeType: 'text/markdown',
    size: 218,
    createdAt: now,
    modifiedAt: now,
  },
  {
    id: 'file-todo',
    parentId: SYS_FOLDERS.DOCUMENTS,
    name: 'TODO.txt',
    type: 'file',
    content: `- Add more wallpapers\n- Fix terminal bug\n- Try breaking the OS`,
    mimeType: 'text/plain',
    size: 61,
    createdAt: now,
    modifiedAt: now,
  }
];
