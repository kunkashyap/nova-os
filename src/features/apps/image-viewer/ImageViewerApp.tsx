import React, { useState, useEffect } from 'react';
import { useFileSystemStore } from '@/stores/fsStore';
import * as Icons from 'lucide-react';
import { formatDate, formatBytes } from '@/utils';
import type { FileSystemNode } from '@/types';

export const ImageViewerApp: React.FC<{ payload?: { path?: string } }> = ({ payload }) => {
  const { getNode } = useFileSystemStore();
  const [node, setNode] = useState<FileSystemNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (payload?.path) {
      load(payload.path);
    }
  }, [payload?.path]);

  const load = async (id: string) => {
    setIsLoading(true);
    const n = await getNode(id);
    if (n && n.type === 'file') {
      setNode(n);
      setZoom(1);
      setRotation(0);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center bg-nova-surface"><Icons.Loader2 className="animate-spin text-nova-text-dim" /></div>;
  }

  if (!node) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-nova-surface text-nova-text-dim gap-4">
        <Icons.Image size={48} className="opacity-50" />
        <p>No image selected.</p>
        <p className="text-xs">Open an image from the File Manager.</p>
      </div>
    );
  }

  // Fallback for actual images (since we only seeded dummy text files masquerading as images)
  const isRealImage = node.content?.startsWith('data:image');
  const imageSrc = isRealImage ? node.content : "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="w-full h-full flex flex-col bg-nova-surface">
      {/* Toolbar */}
      <div className="h-12 border-b border-nova-border flex items-center justify-center px-4 gap-4 bg-nova-surface-2 flex-shrink-0 z-10">
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-nova-border">
          <button className="p-1.5 rounded hover:bg-white/10" onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} title="Zoom Out"><Icons.ZoomOut size={16} /></button>
          <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button className="p-1.5 rounded hover:bg-white/10" onClick={() => setZoom(z => Math.min(5, z + 0.2))} title="Zoom In"><Icons.ZoomIn size={16} /></button>
        </div>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-nova-border">
          <button className="p-1.5 rounded hover:bg-white/10" onClick={() => setRotation(r => r - 90)} title="Rotate Left"><Icons.RotateCcw size={16} /></button>
          <button className="p-1.5 rounded hover:bg-white/10" onClick={() => setRotation(r => r + 90)} title="Rotate Right"><Icons.RotateCw size={16} /></button>
        </div>
        
        <button 
          className={`ml-auto p-1.5 rounded transition-colors ${showInfo ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-nova-text-dim hover:text-white'}`}
          onClick={() => setShowInfo(!showInfo)}
          title="Info"
        >
          <Icons.Info size={18} />
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative overflow-hidden bg-black/60 flex items-center justify-center">
        <div className="w-full h-full overflow-auto flex items-center justify-center">
          <img 
            src={imageSrc} 
            alt={node.name}
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
            }}
            className="max-w-none shadow-2xl object-contain pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Info Panel Overlay */}
        {showInfo && (
          <div className="absolute right-0 top-0 bottom-0 w-64 glass-heavy border-l border-nova-border p-4 flex flex-col gap-4 shadow-xl z-20">
            <h3 className="font-semibold text-nova-text border-b border-nova-border pb-2">Image Info</h3>
            
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-nova-text-dim text-xs uppercase tracking-wider">Name</span>
              <span className="truncate" title={node.name}>{node.name}</span>
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <span className="text-nova-text-dim text-xs uppercase tracking-wider">Size</span>
              <span>{formatBytes(node.size || 0)}</span>
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <span className="text-nova-text-dim text-xs uppercase tracking-wider">Modified</span>
              <span>{formatDate(node.modifiedAt)}</span>
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <span className="text-nova-text-dim text-xs uppercase tracking-wider">Created</span>
              <span>{formatDate(node.createdAt)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
