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

  // Initial load based on payload
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
    setNodes(list.filter(n => !n.trashedAt)); // hide trashed items in normal view
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
      // Node context menu
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
      // Empty area context menu
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

  const getIconForNode = (node: FileSystemNode) => {
    if (node.type === 'folder') return <Icons.Folder fill={node.iconColor || "#94a3b8"} className="text-transparent" size={viewMode === 'grid' ? 48 : 20} />;
    if (node.mimeType?.startsWith('image/')) return <Icons.Image className="text-pink-400" size={viewMode === 'grid' ? 48 : 20} />;
    if (node.mimeType?.includes('json') || node.mimeType?.includes('javascript')) return <Icons.FileCode2 className="text-yellow-400" size={viewMode === 'grid' ? 48 : 20} />;
    return <Icons.FileText className="text-blue-400" size={viewMode === 'grid' ? 48 : 20} />;
  };

  return (
    <div className="flex h-full bg-nova-surface text-nova-text text-sm">
      {/* Sidebar */}
      <div className="w-48 border-r border-nova-border bg-nova-surface-2 flex flex-col pt-2 select-none">
        <div className="px-3 py-2 text-xs font-semibold text-nova-text-dim uppercase tracking-wider">Locations</div>
        
        <SidebarItem icon={<Icons.Monitor size={16}/>} label="Desktop" onClick={() => navigateTo(SYS_FOLDERS.DESKTOP)} active={currentDirId === SYS_FOLDERS.DESKTOP} />
        <SidebarItem icon={<Icons.FileText size={16}/>} label="Documents" onClick={() => navigateTo(SYS_FOLDERS.DOCUMENTS)} active={currentDirId === SYS_FOLDERS.DOCUMENTS} />
        <SidebarItem icon={<Icons.Download size={16}/>} label="Downloads" onClick={() => navigateTo(SYS_FOLDERS.DOWNLOADS)} active={currentDirId === SYS_FOLDERS.DOWNLOADS} />
        <SidebarItem icon={<Icons.Image size={16}/>} label="Pictures" onClick={() => navigateTo(SYS_FOLDERS.PICTURES)} active={currentDirId === SYS_FOLDERS.PICTURES} />
        
        <div className="mt-auto mb-4">
          <SidebarItem icon={<Icons.Trash2 size={16}/>} label="Trash" onClick={() => openWindow('trash')} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-12 border-b border-nova-border bg-nova-surface flex items-center px-2 gap-1 flex-shrink-0">
          <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-50" disabled={historyIdx === 0} onClick={goBack}>
            <Icons.ChevronLeft size={18} />
          </button>
          <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-50" disabled={historyIdx === history.length - 1} onClick={goForward}>
            <Icons.ChevronRight size={18} />
          </button>
          <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-50" disabled={currentDirId === ROOT_DIR_ID} onClick={goUp}>
            <Icons.ArrowUp size={18} />
          </button>

          <div className="flex-1 ml-2 mr-4 bg-black/40 border border-nova-border rounded flex items-center px-3 py-1.5 text-nova-text-dim overflow-hidden whitespace-nowrap">
            {currentPathStr}
          </div>

          <button className={clsx("p-1.5 rounded hover:bg-white/10", viewMode==='list' && 'bg-white/10')} onClick={() => setViewMode('list')}>
            <Icons.List size={18} />
          </button>
          <button className={clsx("p-1.5 rounded hover:bg-white/10", viewMode==='grid' && 'bg-white/10')} onClick={() => setViewMode('grid')}>
            <Icons.LayoutGrid size={18} />
          </button>
        </div>

        {/* File View */}
        <div 
          className={clsx("flex-1 overflow-y-auto p-4 outline-none", viewMode === 'grid' ? "flex flex-wrap content-start gap-4" : "flex flex-col")}
          onContextMenu={(e) => handleContextMenu(e)}
          onClick={() => setSelection([])}
        >
          {nodes.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-nova-text-dim">
              This folder is empty
            </div>
          )}

          {nodes.map(node => (
            <div
              key={node.id}
              onClick={(e) => { e.stopPropagation(); setSelection([node.id]); }}
              onDoubleClick={(e) => { e.stopPropagation(); handleOpen(node); }}
              onContextMenu={(e) => handleContextMenu(e, node)}
              className={clsx(
                "rounded flex cursor-default transition-colors",
                selection.includes(node.id) ? "bg-accent/40 border border-accent" : "hover:bg-white/5 border border-transparent",
                viewMode === 'grid' 
                  ? "flex-col items-center justify-start w-[100px] h-[120px] p-2 text-center" 
                  : "flex-row items-center gap-3 px-3 py-2 w-full"
              )}
            >
              <div className={clsx("flex items-center justify-center", viewMode === 'grid' ? "h-16 w-16 mb-2" : "w-6 h-6")}>
                {getIconForNode(node)}
              </div>
              
              {isRenaming === node.id ? (
                <form onSubmit={(e) => handleRenameSubmit(e, node.id)} className="w-full">
                  <input 
                    autoFocus 
                    value={renameValue} 
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={(e) => handleRenameSubmit(e, node.id)}
                    className="w-full bg-black text-white px-1 text-center outline-none border border-accent rounded" 
                  />
                </form>
              ) : (
                <div className={clsx("truncate text-nova-text drop-shadow-sm", viewMode === 'grid' ? "w-full" : "flex-1")}>
                  {node.name}
                </div>
              )}

              {viewMode === 'list' && (
                <>
                  <div className="w-32 text-nova-text-dim truncate text-right">{formatDate(node.modifiedAt)}</div>
                  <div className="w-24 text-nova-text-dim text-right">{node.type === 'file' ? formatBytes(node.size || 0) : '--'}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, onClick, active }: any) => (
  <button 
    className={clsx(
      "flex items-center gap-3 px-4 py-2 mx-2 rounded transition-colors text-sm",
      active ? "bg-accent/20 text-accent-light" : "hover:bg-white/10 text-nova-text hover:text-white"
    )}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);
