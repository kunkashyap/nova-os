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
      const gridX = Math.round((pos.x - 32) / 80) * 80 + 32;
      const gridY = Math.round((pos.y - 32) / 104) * 104 + 32;
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
    e.stopPropagation();
    startDrag(e);
  };

  return (
    <div
      ref={ref}
      className="absolute flex flex-col items-center justify-start w-[76px] pointer-events-auto select-none group cursor-pointer"
      style={{ left: position.x, top: position.y }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Icon container — monochrome states */}
      <div
        className={clsx(
          "w-[56px] h-[56px] rounded-[10px] flex items-center justify-center border transition-all duration-150 ease-out",
          isSelected
            ? "bg-[#282828] border-white/[0.18] text-white shadow-[0_4px_12px_rgba(0,0,0,0.40)]"
            : "bg-[#111111] border-white/[0.06] text-white/60 group-hover:bg-[#1A1A1A] group-hover:border-white/[0.10] group-hover:text-white/90 group-hover:-translate-y-[1px]"
        )}
      >
        <IconComponent size={22} strokeWidth={1.5} />
      </div>

      {/* Label */}
      <span
        className={clsx(
          "mt-[7px] text-[11.5px] tracking-normal text-center w-full truncate px-1 transition-colors select-none font-normal",
          isSelected ? "text-white" : "text-white/65 group-hover:text-white/90"
        )}
        style={{
          textShadow: '0 1px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.70)',
          lineHeight: 1.2,
        }}
      >
        {icon.label}
      </span>
    </div>
  );
};
