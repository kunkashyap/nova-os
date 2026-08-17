import { create } from 'zustand';
import { db } from '@/filesystem/db';
import type { FileSystemNode, VirtualDirectory, VirtualFile } from '@/types';
import { SEED_DATA } from '@/data/seed';

export const ROOT_DIR_ID = 'root';

interface FileSystemStore {
  isInitialized: boolean;
  initialize: () => Promise<void>;
  
  // High-level operations
  createFolder: (parentId: string, name: string) => Promise<VirtualDirectory>;
  createFile: (parentId: string, name: string, content?: string, mimeType?: string) => Promise<VirtualFile>;
  updateFileContent: (id: string, content: string) => Promise<void>;
  renameNode: (id: string, newName: string) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  restoreFromTrash: (id: string) => Promise<void>;
  moveNode: (id: string, newParentId: string) => Promise<void>;
  
  // Queries
  listDirectory: (parentId: string) => Promise<FileSystemNode[]>;
  getNode: (id: string) => Promise<FileSystemNode | undefined>;
  resolvePath: (path: string) => Promise<FileSystemNode | undefined>;
  getPathString: (id: string) => Promise<string>;
}

export const useFileSystemStore = create<FileSystemStore>()((set, get) => ({
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    
    const count = await db.nodes.count();
    if (count === 0) {
      console.log('Initializing Virtual Filesystem with seed data...');
      await db.nodes.bulkAdd(SEED_DATA);
    }
    
    set({ isInitialized: true });
  },

  createFolder: async (parentId, name) => {
    const id = crypto.randomUUID();
    const folder: VirtualDirectory = {
      id,
      parentId,
      name,
      type: 'folder',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    await db.nodes.add(folder);
    return folder;
  },

  createFile: async (parentId, name, content = '', mimeType = 'text/plain') => {
    const id = crypto.randomUUID();
    const file: VirtualFile = {
      id,
      parentId,
      name,
      type: 'file',
      content,
      mimeType,
      size: new Blob([content]).size,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    await db.nodes.add(file);
    return file;
  },

  updateFileContent: async (id, content) => {
    await db.nodes.update(id, { 
      content, 
      size: new Blob([content]).size,
      modifiedAt: Date.now() 
    });
  },

  renameNode: async (id, name) => {
    await db.nodes.update(id, { name, modifiedAt: Date.now() });
  },

  deleteNode: async (id) => {
    // Recursive delete for folders
    const node = await db.nodes.get(id);
    if (!node) return;
    
    if (node.type === 'folder') {
      const children = await db.nodes.where('parentId').equals(id).toArray();
      for (const child of children) {
        await get().deleteNode(child.id);
      }
    }
    await db.nodes.delete(id);
  },

  moveToTrash: async (id) => {
    const trashDir = await db.nodes.where('name').equals('Trash').and((n: FileSystemNode) => n.parentId === ROOT_DIR_ID).first();
    const node = await db.nodes.get(id);
    if (!trashDir || !node) return;
    
    await db.nodes.update(id, {
      parentId: trashDir.id,
      originalParentId: node.parentId!,
      trashedAt: Date.now(),
      modifiedAt: Date.now()
    });
  },

  restoreFromTrash: async (id) => {
    const node = await db.nodes.get(id);
    if (!node || !node.trashedAt || !node.originalParentId) return;

    // Ensure original parent still exists, otherwise restore to Desktop
    const originalParent = await db.nodes.get(node.originalParentId);
    let targetParentId = node.originalParentId;

    if (!originalParent) {
      const desktop = await db.nodes.where('name').equals('Desktop').and((n: FileSystemNode) => n.parentId === ROOT_DIR_ID).first();
      targetParentId = desktop ? desktop.id : ROOT_DIR_ID;
    }

    await db.nodes.update(id, {
      parentId: targetParentId,
      originalParentId: undefined,
      trashedAt: undefined,
      modifiedAt: Date.now()
    });
  },

  moveNode: async (id, newParentId) => {
    await db.nodes.update(id, { parentId: newParentId, modifiedAt: Date.now() });
  },

  listDirectory: async (parentId) => {
    return db.nodes.where('parentId').equals(parentId).toArray();
  },

  getNode: async (id) => {
    if (id === ROOT_DIR_ID) {
      return { id: ROOT_DIR_ID, name: 'Root', type: 'folder', parentId: null, createdAt: 0, modifiedAt: 0 };
    }
    return db.nodes.get(id);
  },

  resolvePath: async (path) => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return await get().getNode(ROOT_DIR_ID);

    let currentId = ROOT_DIR_ID;
    let currentNode: FileSystemNode | undefined;

    for (const part of parts) {
      const children = await db.nodes.where('parentId').equals(currentId).toArray();
      const nextNode = children.find((c: FileSystemNode) => c.name === part);
      if (!nextNode) return undefined;
      
      currentNode = nextNode;
      currentId = nextNode.id;
    }

    return currentNode;
  },

  getPathString: async (id) => {
    if (id === ROOT_DIR_ID) return '/';
    
    const parts: string[] = [];
    let currentId: string | null = id;
    
    while (currentId && currentId !== ROOT_DIR_ID) {
      const dbNode: FileSystemNode | undefined = await db.nodes.get(currentId);
      if (!dbNode) break;
      parts.unshift(dbNode.name);
      currentId = dbNode.parentId;
    }
    
    return '/' + parts.join('/');
  }
}));
