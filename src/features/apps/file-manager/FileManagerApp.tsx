import React, { useState, useEffect } from 'react';
import { useFileSystemStore, ROOT_DIR_ID } from '@/stores/fsStore';
import { useWindowStore } from '@/stores/windowStore';
import { useContextMenu } from '@/components/ContextMenu';
import type { FileSystemNode } from '@/types';
import * as Icons from 'lucide-react';
import { clsx } from 'clsx';
import { SYS_FOLDERS } from '@/data/seed';
import { formatDate, formatBytes } from '@/utils';
import { notify } from '@/stores/notificationStore';

export const FileManagerApp: React.FC<{ payload?: { path?: string } }> = ({ payload }) => {
  const { listDirectory, getPathString, resolvePath, createFolder, createFile, renameNode, deleteNode, moveToTrash } = useFileSystemStore();
  const { openWindow } = useWindowStore();
  const { showMenu } = useContextMenu();

  const [currentDirId, setCurrentDirId] = useState<string>(ROOT_DIR_ID);
  const [currentPathStr, setCurrentPathStr] = useState<string>('/');
  const [nodes, setNodes] = useState<FileSystemNode[]>([]);
  const [history, setHistory] = useState<string[]>([ROOT_DIR_ID]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selection, setSelection] = useState<string[]>([]);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (payload?.path) {
      resolvePath(payload.path).then(node => {
        if (node && node.type === 'folder') {
          navigateTo(node.id, true);
        } else if (node && node.parentId) {
          navigateTo(node.parentId, true);
        }
      });
    } else {
      refresh();
    }
  }, []);

  const refresh = async (dirId = currentDirId) => {
    const list = await listDirectory(dirId);
    setNodes(list.filter(n => !n.trashedAt));
    const pathStr = await getPathString(dirId);
    setCurrentPathStr(pathStr);
  };

  useEffect(() => {
    refresh();
  }, [currentDirId]);

  const navigateTo = (dirId: string, resetHistory = false) => {
    setCurrentDirId(dirId);
    setSelection([]);
    if (resetHistory) {
      setHistory([dirId]);
      setHistoryIdx(0);
    } else {
      const newHistory = history.slice(0, historyIdx + 1);
      newHistory.push(dirId);
      setHistory(newHistory);
      setHistoryIdx(newHistory.length - 1);
    }
  };

  const goBack = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setCurrentDirId(history[historyIdx - 1]);
      setSelection([]);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setCurrentDirId(history[historyIdx + 1]);
      setSelection([]);
    }
  };

  const goUp = async () => {
    if (currentDirId === ROOT_DIR_ID) return;
    const current = await useFileSystemStore.getState().getNode(currentDirId);
    if (current?.parentId) {
      navigateTo(current.parentId);
    }
  };

  const handleOpen = (node: FileSystemNode) => {
    if (node.type === 'folder') {
      navigateTo(node.id);
    } else {
      if (node.mimeType?.startsWith('image/')) {
        openWindow('image-viewer', { path: node.id });
      } else {
        openWindow('text-editor', { path: node.id });
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, node?: FileSystemNode) => {
    e.preventDefault();
    e.stopPropagation();

    if (node) {
      setSelection([node.id]);
      showMenu(e, [
        { id: 'open', label: 'Open', icon: 'FolderOpen', action: () => handleOpen(node) },
        { id: 'rename', label: 'Rename', icon: 'Edit2', action: () => {
          setIsRenaming(node.id);
          setRenameValue(node.name);
        }},
        { divider: true, id: 'd1' },
        { id: 'delete', label: 'Move to Trash', icon: 'Trash2', danger: true, action: async () => {
          await moveToTrash(node.id);
          refresh();
        }},
      ]);
    } else {
      showMenu(e, [
        { id: 'new-folder', label: 'New Folder', icon: 'FolderPlus', action: async () => {
          const folder = await createFolder(currentDirId, 'New Folder');
          refresh();
          setIsRenaming(folder.id);
          setRenameValue(folder.name);
        }},
        { id: 'new-file', label: 'New Text File', icon: 'FileText', action: async () => {
          const file = await createFile(currentDirId, 'New File.txt');
          refresh();
          setIsRenaming(file.id);
          setRenameValue(file.name);
        }},
        { divider: true, id: 'd2' },
        { id: 'refresh', label: 'Refresh', icon: 'RefreshCw', action: () => refresh() },
      ]);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (renameValue.trim()) {
      await renameNode(id, renameValue.trim());
      refresh();
    }
    setIsRenaming(null);
  };

  // Monochrome icon renderer — no colored icons
  const getIconForNode = (node: FileSystemNode) => {
    const sz = viewMode === 'grid' ? 36 : 16;
    const sw = 1.5;

    if (node.type === 'folder') {
      return <Icons.Folder size={sz} strokeWidth={sw} style={{ color: 'rgba(255,255,255,0.55)' }} />;
    }
    if (node.mimeType?.startsWith('image/')) {
      return <Icons.Image size={sz} strokeWidth={sw} style={{ color: 'rgba(255,255,255,0.45)' }} />;
    }
    if (node.mimeType?.includes('json') || node.mimeType?.includes('javascript')) {
      return <Icons.FileCode2 size={sz} strokeWidth={sw} style={{ color: 'rgba(255,255,255,0.45)' }} />;
    }
    return <Icons.FileText size={sz} strokeWidth={sw} style={{ color: 'rgba(255,255,255,0.40)' }} />;
  };

  return (
    <div
      className="flex h-full text-sm"
      style={{ background: '#111111', color: 'rgba(255,255,255,0.80)' }}
    >
      {/* Sidebar */}
      <div
        className="flex flex-col pt-2 select-none flex-shrink-0"
        style={{
          width: '168px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: '#0D0D0D',
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '9.5px',
            fontWeight: 500,
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
            padding: '6px 14px 8px',
          }}
        >
          Locations
        </div>

        <VoidSidebarItem icon={<Icons.Monitor size={13} strokeWidth={1.5} />} label="Desktop"
          onClick={() => navigateTo(SYS_FOLDERS.DESKTOP)} active={currentDirId === SYS_FOLDERS.DESKTOP} />
        <VoidSidebarItem icon={<Icons.FileText size={13} strokeWidth={1.5} />} label="Documents"
          onClick={() => navigateTo(SYS_FOLDERS.DOCUMENTS)} active={currentDirId === SYS_FOLDERS.DOCUMENTS} />
        <VoidSidebarItem icon={<Icons.Download size={13} strokeWidth={1.5} />} label="Downloads"
          onClick={() => navigateTo(SYS_FOLDERS.DOWNLOADS)} active={currentDirId === SYS_FOLDERS.DOWNLOADS} />
        <VoidSidebarItem icon={<Icons.Image size={13} strokeWidth={1.5} />} label="Pictures"
          onClick={() => navigateTo(SYS_FOLDERS.PICTURES)} active={currentDirId === SYS_FOLDERS.PICTURES} />

        <div className="mt-auto mb-3">
          <VoidSidebarItem icon={<Icons.Trash2 size={13} strokeWidth={1.5} />} label="Trash"
            onClick={() => openWindow('trash')} active={false} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div
          className="flex items-center gap-1 flex-shrink-0"
          style={{
            height: '44px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: '#0D0D0D',
            padding: '0 8px',
          }}
        >
          <VoidToolBtn disabled={historyIdx === 0} onClick={goBack} aria-label="Back">
            <Icons.ChevronLeft size={15} strokeWidth={1.5} />
          </VoidToolBtn>
          <VoidToolBtn disabled={historyIdx === history.length - 1} onClick={goForward} aria-label="Forward">
            <Icons.ChevronRight size={15} strokeWidth={1.5} />
          </VoidToolBtn>
          <VoidToolBtn disabled={currentDirId === ROOT_DIR_ID} onClick={goUp} aria-label="Up">
            <Icons.ArrowUp size={15} strokeWidth={1.5} />
          </VoidToolBtn>

          {/* Path */}
          <div
            className="flex-1 mx-2 flex items-center overflow-hidden whitespace-nowrap"
            style={{
              height: '30px',
              padding: '0 10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11.5px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            {currentPathStr}
          </div>

          <VoidToolBtn onClick={() => setViewMode('list')} aria-label="List view" active={viewMode === 'list'}>
            <Icons.List size={15} strokeWidth={1.5} />
          </VoidToolBtn>
          <VoidToolBtn onClick={() => setViewMode('grid')} aria-label="Grid view" active={viewMode === 'grid'}>
            <Icons.LayoutGrid size={15} strokeWidth={1.5} />
          </VoidToolBtn>
        </div>

        {/* File view */}
        <div
          className={clsx(
            "flex-1 overflow-y-auto outline-none",
            viewMode === 'grid' ? "flex flex-wrap content-start" : "flex flex-col"
          )}
          style={{ padding: viewMode === 'grid' ? '16px' : '8px', gap: viewMode === 'grid' ? '8px' : undefined }}
          onContextMenu={(e) => handleContextMenu(e)}
          onClick={() => setSelection([])}
        >
          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center" style={{ gap: '10px' }}>
              <Icons.Folder size={28} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.15)' }} />
              <span
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.22)',
                }}
              >
                This folder is empty
              </span>
            </div>
          )}

          {nodes.map(node => (
            <div
              key={node.id}
              onClick={(e) => { e.stopPropagation(); setSelection([node.id]); }}
              onDoubleClick={(e) => { e.stopPropagation(); handleOpen(node); }}
              onContextMenu={(e) => handleContextMenu(e, node)}
              className={clsx(
                "rounded flex cursor-default transition-all duration-100",
                selection.includes(node.id)
                  ? "border"
                  : "border border-transparent",
                viewMode === 'grid'
                  ? "flex-col items-center justify-start p-2 text-center"
                  : "flex-row items-center gap-3 px-3 py-[7px] w-full"
              )}
              style={{
                width: viewMode === 'grid' ? '88px' : undefined,
                minHeight: viewMode === 'grid' ? '96px' : undefined,
                background: selection.includes(node.id)
                  ? 'rgba(255,255,255,0.08)'
                  : undefined,
                borderColor: selection.includes(node.id)
                  ? 'rgba(255,255,255,0.14)'
                  : 'transparent',
                borderRadius: '8px',
              }}
              onMouseEnter={e => {
                if (!selection.includes(node.id)) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={e => {
                if (!selection.includes(node.id)) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <div
                className={clsx(
                  "flex items-center justify-center",
                  viewMode === 'grid' ? "mb-2" : ""
                )}
                style={{ width: viewMode === 'grid' ? '52px' : '20px', height: viewMode === 'grid' ? '44px' : '20px' }}
              >
                {getIconForNode(node)}
              </div>

              {isRenaming === node.id ? (
                <form onSubmit={(e) => handleRenameSubmit(e, node.id)}
                  className="w-full"
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={(e) => handleRenameSubmit(e, node.id)}
                    className="w-full text-select"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '11px',
                      background: 'rgba(0,0,0,0.60)',
                      color: '#fff',
                      padding: '2px 6px',
                      textAlign: viewMode === 'grid' ? 'center' : 'left',
                      outline: 'none',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: '4px',
                    }}
                  />
                </form>
              ) : (
                <div
                  className={clsx(
                    "truncate",
                    viewMode === 'grid' ? "w-full" : "flex-1"
                  )}
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: viewMode === 'grid' ? '10.5px' : '12px',
                    fontWeight: 400,
                    color: selection.includes(node.id) ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.65)',
                    textAlign: viewMode === 'grid' ? 'center' : 'left',
                  }}
                >
                  {node.name}
                </div>
              )}

              {viewMode === 'list' && (
                <>
                  <div
                    style={{
                      width: '112px',
                      textAlign: 'right',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.25)',
                      flexShrink: 0,
                    }}
                  >
                    {formatDate(node.modifiedAt)}
                  </div>
                  <div
                    style={{
                      width: '72px',
                      textAlign: 'right',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.25)',
                      flexShrink: 0,
                    }}
                  >
                    {node.type === 'file' ? formatBytes(node.size || 0) : '—'}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Internal helper components ── */

const VoidSidebarItem = ({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active: boolean;
}) => (
  <button
    className="flex items-center gap-2 cursor-pointer transition-colors duration-100 select-none"
    style={{
      padding: '6px 10px',
      margin: '1px 6px',
      borderRadius: '6px',
      background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
      border: `1px solid ${active ? 'rgba(255,255,255,0.09)' : 'transparent'}`,
      color: active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.40)',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '12px',
      fontWeight: active ? 500 : 400,
    }}
    onClick={onClick}
    onMouseEnter={e => {
      if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
    }}
    onMouseLeave={e => {
      if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.40)';
    }}
  >
    <span style={{ flexShrink: 0 }}>{icon}</span>
    <span>{label}</span>
  </button>
);

const VoidToolBtn = ({
  children,
  disabled,
  onClick,
  active,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  active?: boolean;
  'aria-label'?: string;
}) => (
  <button
    className="flex items-center justify-center transition-colors duration-100 cursor-pointer"
    style={{
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
      color: disabled ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.45)',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      flexShrink: 0,
    }}
    disabled={disabled}
    onClick={onClick}
    aria-label={ariaLabel}
    onMouseEnter={e => {
      if (!disabled) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.background = active ? 'rgba(255,255,255,0.08)' : 'transparent';
    }}
  >
    {children}
  </button>
);
