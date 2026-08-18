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
    if (confirm('Are you sure you want to permanently delete all items in the Trash?')) {
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
    <div
      className="w-full h-full flex flex-col"
      style={{ background: '#111111', color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12.5px' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 flex-shrink-0"
        style={{
          height: '44px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#0D0D0D',
          padding: '0 12px',
        }}
      >
        <TrashToolBtn
          onClick={handleEmptyTrash}
          disabled={trashedItems.length === 0}
          danger
        >
          <Icons.Trash2 size={12} strokeWidth={1.5} />
          <span>Empty Trash</span>
        </TrashToolBtn>

        <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

        <TrashToolBtn onClick={handleRestore} disabled={selection.length === 0}>
          <Icons.RotateCcw size={12} strokeWidth={1.5} />
          <span>Restore</span>
        </TrashToolBtn>

        <TrashToolBtn onClick={handleDeleteSelected} disabled={selection.length === 0}>
          <Icons.X size={12} strokeWidth={1.5} />
          <span>Delete</span>
        </TrashToolBtn>

        <span
          className="ml-auto"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)' }}
        >
          {trashedItems.length} item{trashedItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" onClick={() => setSelection([])}>
        {trashedItems.length === 0 ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ gap: '12px' }}
          >
            <Icons.Trash2 size={36} strokeWidth={1} style={{ color: 'rgba(255,255,255,0.12)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.20)' }}>
              Trash is empty
            </span>
          </div>
        ) : (
          <div className="min-w-full table">
            {/* Header */}
            <div
              className="table-header-group sticky top-0"
              style={{
                background: '#0D0D0D',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="table-row">
                {['Name', 'Date Deleted', 'Size'].map((h, i) => (
                  <div
                    key={h}
                    className="table-cell"
                    style={{
                      padding: '6px 14px',
                      fontSize: '9.5px',
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.25)',
                      width: i === 0 ? '50%' : '25%',
                      textAlign: i === 2 ? 'right' : 'left',
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="table-row-group">
              {trashedItems.map(item => (
                <div
                  key={item.id}
                  onClick={e => { e.stopPropagation(); toggleSelection(item.id, e.ctrlKey || e.metaKey); }}
                  className="table-row cursor-default transition-colors"
                  style={{
                    background: selection.includes(item.id) ? 'rgba(255,255,255,0.07)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={e => {
                    if (!selection.includes(item.id))
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={e => {
                    if (!selection.includes(item.id))
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div className="table-cell align-middle" style={{ padding: '7px 14px' }}>
                    <div className="flex items-center gap-3">
                      {item.type === 'folder'
                        ? <Icons.Folder size={14} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.40)' }} />
                        : <Icons.File size={14} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.35)' }} />}
                      <span
                        className="truncate"
                        style={{ color: selection.includes(item.id) ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.65)' }}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>
                  <div className="table-cell align-middle" style={{ padding: '7px 14px', color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>
                    {item.trashedAt ? formatDate(item.trashedAt) : '—'}
                  </div>
                  <div className="table-cell align-middle text-right" style={{ padding: '7px 14px', color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>
                    {item.type === 'file' ? formatBytes(item.size || 0) : '—'}
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

const TrashToolBtn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, danger, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-[6px] transition-colors duration-100 cursor-pointer"
    style={{
      padding: '5px 10px',
      borderRadius: '6px',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '12px',
      fontWeight: 400,
      border: 'none',
      background: 'transparent',
      color: disabled
        ? 'rgba(255,255,255,0.18)'
        : danger
        ? 'rgba(239,68,68,0.65)'
        : 'rgba(255,255,255,0.50)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={e => {
      if (!disabled) {
        (e.currentTarget as HTMLElement).style.background = danger
          ? 'rgba(239,68,68,0.08)'
          : 'rgba(255,255,255,0.05)';
        (e.currentTarget as HTMLElement).style.color = danger
          ? 'rgba(239,68,68,0.90)'
          : 'rgba(255,255,255,0.80)';
      }
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.background = 'transparent';
      (e.currentTarget as HTMLElement).style.color = disabled
        ? 'rgba(255,255,255,0.18)'
        : danger
        ? 'rgba(239,68,68,0.65)'
        : 'rgba(255,255,255,0.50)';
    }}
  >
    {children}
  </button>
);
