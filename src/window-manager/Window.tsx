import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, X, Maximize2 } from 'lucide-react';
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

  // Sync external rect updates
  useEffect(() => {
    if (state === 'normal') {
      // Handled by Framer Motion rendering
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

  const spring = { type: "spring" as const, stiffness: 380, damping: 28 };
  const transition = animationIntensity === 'none' 
    ? { duration: 0 } 
    : (animationIntensity === 'reduced' ? { duration: 0.15 } : spring);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 4 }}
      animate={{ 
        opacity: isFocused ? 1.0 : 0.88, 
        scale: isMaximized ? 1.0 : (isFocused ? 1.0 : 0.99),
        x: currentX, 
        y: currentY, 
        width: currentWidth, 
        height: currentHeight 
      }}
      exit={{ opacity: 0, scale: 0.97, y: 4 }}
      transition={transition}
      style={{ zIndex }}
      className={twMerge(
        clsx(
          "window-base flex flex-col absolute transition-all duration-300",
          isFocused 
            ? "border-accent/25 shadow-window-focus" 
            : "border-white/[0.04] shadow-window",
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
        className={clsx(
          "window-titlebar flex justify-between items-center transition-all duration-300 px-4",
          isFocused 
            ? "bg-[#13151f]/85 border-b border-white/[0.06] h-[38px]" 
            : "bg-[#0f1017]/70 border-b border-white/[0.04] h-[38px]"
        )}
        onDoubleClick={handleDoubleClickTitle}
      >
        {/* Left: Window Controls (macOS style) with active / inactive opacity states */}
        <div 
          className={clsx(
            "flex gap-2 items-center transition-opacity duration-300", 
            isFocused ? "opacity-100" : "opacity-45 hover:opacity-100"
          )}
        >
          <button 
            className="traffic-light close flex items-center justify-center group cursor-pointer" 
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            aria-label="Close window"
          >
            <X size={7.5} strokeWidth={3} className="opacity-0 group-hover:opacity-100 text-black/50 transition-opacity" />
          </button>
          <button 
            className="traffic-light minimize flex items-center justify-center group cursor-pointer" 
            onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
            aria-label="Minimize window"
          >
            <Minus size={7.5} strokeWidth={3} className="opacity-0 group-hover:opacity-100 text-black/50 transition-opacity" />
          </button>
          <button 
            className="traffic-light maximize flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
            disabled={!isResizable}
            onClick={(e) => { 
              e.stopPropagation(); 
              if(isResizable) isMaximized ? restoreWindow(id) : maximizeWindow(id); 
            }}
            aria-label="Maximize window"
          >
            {isMaximized ? (
              <Minus size={7.5} strokeWidth={3} className="opacity-0 group-hover:opacity-100 text-black/50 transition-opacity" />
            ) : (
              <Maximize2 size={7.5} strokeWidth={3} className="opacity-0 group-hover:opacity-100 text-black/50 transition-opacity" />
            )}
          </button>
        </div>

        {/* Center: Title */}
        <div 
          className={clsx(
            "text-[11px] tracking-wider text-center flex-1 no-select truncate px-4 font-normal transition-colors duration-300",
            isFocused ? "text-white/85" : "text-white/35"
          )}
        >
          {title}
        </div>

        {/* Right: Spacer to balance traffic lights */}
        <div className="w-[52px]"></div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-black/35">
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
