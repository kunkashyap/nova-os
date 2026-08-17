import React, { useRef } from 'react';
import * as Icons from 'lucide-react';
import { clsx } from 'clsx';
import type { DesktopIcon as DesktopIconType } from '@/types';
import { useDesktopStore } from '@/stores/desktopStore';
import { useWindowStore } from '@/stores/windowStore';
import { useDraggable } from '@/hooks/useDraggable';

interface DesktopIconProps {
  icon: DesktopIconType;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ icon }) => {
  const { selectedIconIds, selectIcon, updateIconPosition } = useDesktopStore();
  const { openWindow } = useWindowStore();
  const isSelected = selectedIconIds.includes(icon.id);
  const IconComponent = (Icons as any)[icon.icon] || Icons.File;
  const ref = useRef<HTMLDivElement>(null);

  const { position, startDrag } = useDraggable({
    initialPosition: { x: icon.x, y: icon.y },
    handleRef: ref,
    onDragStart: () => {
      selectIcon(icon.id);
    },
    onDragEnd: (pos) => {
      // Snap to grid (roughly)
      const gridX = Math.round(pos.x / 80) * 80 + 24;
      const gridY = Math.round(pos.y / 96) * 96 + 24;
      updateIconPosition(icon.id, gridX, gridY);
    }
  });

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (icon.appId) {
      openWindow(icon.appId, icon.fileId ? { path: icon.fileId } : undefined);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); // prevent desktop from clearing selection
    startDrag(e);
  };

  return (
    <div
      ref={ref}
      className={clsx(
        "absolute flex flex-col items-center justify-start w-[72px] h-[84px] p-1 rounded transition-colors pointer-events-auto",
        isSelected ? "bg-white/20 border border-white/20" : "hover:bg-white/10 border border-transparent"
      )}
      style={{ left: position.x, top: position.y }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="w-10 h-10 flex items-center justify-center text-white drop-shadow-md mb-1">
        <IconComponent size={32} strokeWidth={1.5} />
      </div>
      <span className="text-xs text-white text-center w-full truncate px-1 drop-shadow-md text-shadow">
        {icon.label}
      </span>
    </div>
  );
};
