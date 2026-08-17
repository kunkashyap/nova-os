import Dexie, { type Table } from 'dexie';
import type { FileSystemNode } from '@/types';

export class NovaFileSystemDB extends Dexie {
  nodes!: Table<FileSystemNode, string>;

  constructor() {
    super('NovaFileSystem');
    this.version(1).stores({
      nodes: 'id, parentId, type, name, createdAt'
    });
  }
}

export const db = new NovaFileSystemDB();
