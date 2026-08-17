import React, { useState, useEffect } from 'react';
import { useFileSystemStore } from '@/stores/fsStore';
import { db } from '@/filesystem/db';
import * as Icons from 'lucide-react';
import { formatBytes, formatDate } from '@/utils';
import type { FileSystemNode } from '@/types';

export const TrashApp: React.FC = () => {
  const { restoreFromTrash, deleteNode } = useFileSystemStore();
  const [trashedItems, setTrashedItems] = useState<FileSystemNode[]>([]);
  const [selection, setSelection] = useState<string[]>([]);

  const refresh = async () => {
    // Everything that has trashedAt is considered in trash
    const items = await db.nodes.where('trashedAt').above(0).toArray();
    setTrashedItems(items.sort((a, b) => (b.trashedAt || 0) - (a.trashedAt || 0)));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleRestore = async () => {
    for (const id of selection) {
      await restoreFromTrash(id);
    }
    setSelection([]);
    refresh();
  };

  const handleEmptyTrash = async () => {
    if (confirm("Are you sure you want to permanently delete all items in the Trash?")) {
      for (const item of trashedItems) {
        await deleteNode(item.id);
      }
      setSelection([]);
      refresh();
    }
  };

  const handleDeleteSelected = async () => {
    if (confirm(`Permanently delete ${selection.length} item(s)?`)) {
      for (const id of selection) {
        await deleteNode(id);
      }
      setSelection([]);
      refresh();
    }
  };

  const toggleSelection = (id: string, multi = false) => {
    if (multi) {
      setSelection(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setSelection([id]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-nova-surface text-sm">
      {/* Toolbar */}
      <div className="h-12 border-b border-nova-border bg-nova-surface-2 flex items-center px-4 gap-2 flex-shrink-0">
        <button 
          onClick={handleEmptyTrash}
          disabled={trashedItems.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-error/20 text-error disabled:opacity-50 disabled:hover:bg-transparent transition-colors font-medium"
        >
          <Icons.Trash2 size={16} />
          <span>Empty Trash</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-2" />

        <button 
          onClick={handleRestore}
          disabled={selection.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-nova-text disabled:opacity-50 transition-colors"
        >
          <Icons.RotateCcw size={16} />
          <span>Restore Selected</span>
        </button>

        <button 
          onClick={handleDeleteSelected}
          disabled={selection.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-nova-text disabled:opacity-50 transition-colors"
        >
          <Icons.X size={16} />
          <span>Delete Permanently</span>
        </button>
        
        <span className="ml-auto text-nova-text-dim text-xs">
          {trashedItems.length} items
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" onClick={() => setSelection([])}>
        {trashedItems.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-nova-text-dim gap-4 opacity-50">
            <Icons.Trash size={64} strokeWidth={1} />
            <p className="text-lg">Trash is empty</p>
          </div>
        ) : (
          <div className="min-w-full table">
            <div className="table-header-group bg-nova-surface-3 border-b border-nova-border text-xs font-semibold text-nova-text-dim uppercase tracking-wider sticky top-0">
              <div className="table-row">
                <div className="table-cell px-4 py-2 w-1/2">Name</div>
                <div className="table-cell px-4 py-2 w-1/4">Date Deleted</div>
                <div className="table-cell px-4 py-2 w-1/4 text-right">Size</div>
              </div>
            </div>
            <div className="table-row-group">
              {trashedItems.map(item => (
                <div 
                  key={item.id}
                  onClick={(e) => { e.stopPropagation(); toggleSelection(item.id, e.ctrlKey || e.metaKey); }}
                  className={`table-row cursor-default transition-colors ${
                    selection.includes(item.id) ? 'bg-accent/30' : 'hover:bg-white/5 border-b border-white/5'
                  }`}
                >
                  <div className="table-cell px-4 py-2 align-middle">
                    <div className="flex items-center gap-3">
                      {item.type === 'folder' ? <Icons.Folder size={16} className="text-slate-400" /> : <Icons.File size={16} className="text-slate-400" />}
                      <span className="truncate text-nova-text">{item.name}</span>
                    </div>
                  </div>
                  <div className="table-cell px-4 py-2 align-middle text-nova-text-dim truncate">
                    {item.trashedAt ? formatDate(item.trashedAt) : 'Unknown'}
                  </div>
                  <div className="table-cell px-4 py-2 align-middle text-nova-text-dim text-right">
                    {item.type === 'file' ? formatBytes(item.size || 0) : '--'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
