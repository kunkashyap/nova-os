import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDraggable } from '@/hooks/useDraggable';
import { useResizable } from '@/hooks/useResizable';
import type { WindowInstance } from '@/types';
import { TASKBAR_HEIGHT } from '@/config/apps';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface WindowProps {
  instance: WindowInstance;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ instance, children }) => {
  const {
    id, title, state, rect, zIndex, isFocused, isResizable, minWidth, minHeight
  } = instance;

  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, updateWindowRect } = useWindowStore();
  const { animationIntensity, windowTransparency } = useSettingsStore(s => s.settings);

  const titleBarRef = useRef<HTMLDivElement>(null);
  
  // Dragging
  const { position: dragPos, startDrag } = useDraggable({
    initialPosition: { x: rect.x, y: rect.y },
    handleRef: titleBarRef,
    disabled: state === 'maximized',
    onDragStart: () => focusWindow(id),
    onDragEnd: (pos) => updateWindowRect(id, { x: pos.x, y: pos.y })
  });

  // Resizing
  const { rect: resizeRect, startResize } = useResizable({
    initialRect: rect,
    minWidth,
    minHeight,
    disabled: state === 'maximized' || !isResizable,
    onResizeStart: () => focusWindow(id),
    onResizeEnd: (newRect) => updateWindowRect(id, newRect)
  });

  // Sync external rect updates (e.g. restore from maximized)
  useEffect(() => {
    if (state === 'normal') {
      // Need a way to sync useDraggable and useResizable internally
      // For a simpler approach, we'll let Framer Motion drive the final position
      // based on instance.rect, but if user drags, we use dragPos.
    }
  }, [state, rect]);

  const handleDoubleClickTitle = () => {
    if (!isResizable) return;
    if (state === 'maximized') restoreWindow(id);
    else maximizeWindow(id);
  };

  if (state === 'minimized') return null;

  const isMaximized = state === 'maximized';
  
  // Determine final geometry
  const currentX = isMaximized ? 0 : (dragPos.x !== rect.x ? dragPos.x : resizeRect.x);
  const currentY = isMaximized ? 0 : (dragPos.y !== rect.y ? dragPos.y : resizeRect.y);
  const currentWidth = isMaximized ? '100vw' : resizeRect.width;
  const currentHeight = isMaximized ? `calc(100vh - ${TASKBAR_HEIGHT}px)` : resizeRect.height;

  const spring: any = { type: "spring", stiffness: 400, damping: 30 };
  const transition = animationIntensity === 'none' ? { duration: 0 } : (animationIntensity === 'reduced' ? { duration: 0.15 } : spring);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: currentX, 
        y: currentY, 
        width: currentWidth, 
        height: currentHeight 
      }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={transition}
      style={{ zIndex }}
      className={twMerge(
        clsx(
          "window-base flex flex-col absolute",
          isFocused && "focused",
          windowTransparency && "glass-heavy",
          !windowTransparency && "bg-nova-surface",
          isMaximized && "rounded-none border-0"
        )
      )}
      onMouseDownCapture={() => focusWindow(id)}
    >
      {/* Title Bar */}
      <div 
        ref={titleBarRef}
        className="window-titlebar flex justify-between"
        onDoubleClick={handleDoubleClickTitle}
      >
        {/* Left: Window Controls (macOS style) */}
        <div className="flex gap-2 items-center">
          <button className="traffic-light close flex items-center justify-center group" onClick={(e) => { e.stopPropagation(); closeWindow(id); }}>
            <X size={10} className="opacity-0 group-hover:opacity-100 text-black/50" />
          </button>
          <button className="traffic-light minimize flex items-center justify-center group" onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}>
            <Minus size={10} className="opacity-0 group-hover:opacity-100 text-black/50" />
          </button>
          <button 
            className="traffic-light maximize flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={!isResizable}
            onClick={(e) => { 
              e.stopPropagation(); 
              if(isResizable) isMaximized ? restoreWindow(id) : maximizeWindow(id); 
            }}
          >
            {isMaximized ? (
              <Minus size={10} className="opacity-0 group-hover:opacity-100 text-black/50" />
            ) : (
              <Maximize2 size={10} className="opacity-0 group-hover:opacity-100 text-black/50" />
            )}
          </button>
        </div>

        {/* Center: Title */}
        <div className="text-xs font-semibold text-nova-text text-center flex-1 no-select truncate px-4">
          {title}
        </div>

        {/* Right: Spacer to balance */}
        <div className="w-[52px]"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-black/40">
        {children}
      </div>

      {/* Resize Handles */}
      {!isMaximized && isResizable && (
        <>
          <div className="resize-handle se" onMouseDown={(e) => startResize(e, 'se')} onTouchStart={(e) => startResize(e, 'se')} />
          <div className="resize-handle sw" onMouseDown={(e) => startResize(e, 'sw')} onTouchStart={(e) => startResize(e, 'sw')} />
          <div className="resize-handle ne" onMouseDown={(e) => startResize(e, 'ne')} onTouchStart={(e) => startResize(e, 'ne')} />
          <div className="resize-handle nw" onMouseDown={(e) => startResize(e, 'nw')} onTouchStart={(e) => startResize(e, 'nw')} />
          <div className="resize-handle n" onMouseDown={(e) => startResize(e, 'n')} onTouchStart={(e) => startResize(e, 'n')} />
          <div className="resize-handle s" onMouseDown={(e) => startResize(e, 's')} onTouchStart={(e) => startResize(e, 's')} />
          <div className="resize-handle e" onMouseDown={(e) => startResize(e, 'e')} onTouchStart={(e) => startResize(e, 'e')} />
          <div className="resize-handle w" onMouseDown={(e) => startResize(e, 'w')} onTouchStart={(e) => startResize(e, 'w')} />
        </>
      )}
    </motion.div>
  );
};
