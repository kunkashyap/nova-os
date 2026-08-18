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
        "absolute flex flex-col items-center justify-center w-[74px] h-[86px] p-2 rounded-xl border transition-all duration-200 ease-out pointer-events-auto select-none group",
        isSelected 
          ? "bg-accent-dim/40 border-accent/25 shadow-glow-accent/10" 
          : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.05] hover:-translate-y-[2px]"
      )}
      style={{ left: position.x, top: position.y }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Icon Wrapper */}
      <div className="relative w-11 h-11 flex items-center justify-center text-white/90 group-hover:text-white mb-2 transition-colors">
        <IconComponent size={28} strokeWidth={1.25} />
        
        {/* Subtle dot at corner for selected state */}
        {isSelected && (
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-accent-light shadow-glow-accent" />
        )}
      </div>

      {/* Icon Label */}
      <span 
        className={clsx(
          "text-[11px] text-center w-full truncate px-1 tracking-wide transition-all select-none font-normal",
          isSelected ? "text-white font-medium" : "text-white/80 group-hover:text-white"
        )}
        style={{
          textShadow: '0 1px 3px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.5)'
        }}
      >
        {icon.label}
      </span>
    </div>
  );
};
