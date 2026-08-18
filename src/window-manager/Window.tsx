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

  const transition = animationIntensity === 'none'
    ? { duration: 0 }
    : animationIntensity === 'reduced'
    ? { duration: 0.12 }
    : { duration: 0.18, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 4 }}
      animate={{
        opacity: isFocused ? 1.0 : 0.90,
        scale: isMaximized ? 1.0 : (isFocused ? 1.0 : 0.995),
        x: currentX,
        y: currentY,
        width: currentWidth,
        height: currentHeight,
      }}
      exit={{ opacity: 0, scale: 0.98, y: 3, transition: { duration: 0.12, ease: 'easeIn' } }}
      transition={transition}
      style={{ zIndex }}
      className={twMerge(
        clsx(
          "window-base flex flex-col absolute",
          isFocused
            ? "border-white/[0.10] shadow-window-focus"
            : "border-white/[0.05] shadow-window",
          windowTransparency && "glass-heavy",
          !windowTransparency && "bg-[#1A1A1A]",
          isMaximized && "rounded-none border-0"
        )
      )}
      onMouseDownCapture={() => focusWindow(id)}
    >
      {/* Title Bar */}
      <div
        ref={titleBarRef}
        className={clsx(
          "window-titlebar flex justify-between items-center transition-colors duration-200",
          isFocused
            ? "bg-[#141414]/90 border-b border-white/[0.07]"
            : "bg-[#101010]/80 border-b border-white/[0.04]"
        )}
        onDoubleClick={handleDoubleClickTitle}
      >
        {/* Window controls — monochrome circles */}
        <div
          className={clsx(
            "flex gap-[7px] items-center transition-opacity duration-200",
            isFocused ? "opacity-100" : "opacity-40 hover:opacity-100"
          )}
        >
          {/* Close */}
          <button
            className="traffic-light close flex items-center justify-center group cursor-pointer"
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            aria-label="Close window"
          >
            <X
              size={6}
              strokeWidth={2.5}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'rgba(0,0,0,0.60)' }}
            />
          </button>
          {/* Minimize */}
          <button
            className="traffic-light minimize flex items-center justify-center group cursor-pointer"
            onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
            aria-label="Minimize window"
          >
            <Minus
              size={6}
              strokeWidth={2.5}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'rgba(0,0,0,0.60)' }}
            />
          </button>
          {/* Maximize */}
          <button
            className="traffic-light maximize flex items-center justify-center group disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            disabled={!isResizable}
            onClick={(e) => {
              e.stopPropagation();
              if (isResizable) isMaximized ? restoreWindow(id) : maximizeWindow(id);
            }}
            aria-label="Maximize window"
          >
            {isMaximized ? (
              <Minus size={6} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'rgba(0,0,0,0.60)' }} />
            ) : (
              <Maximize2 size={5} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'rgba(0,0,0,0.60)' }} />
            )}
          </button>
        </div>

        {/* Title */}
        <div
          className={clsx(
            "text-[11.5px] text-center flex-1 no-select truncate px-4 font-normal transition-colors duration-200",
            isFocused ? "text-white/70" : "text-white/28"
          )}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </div>

        {/* Right spacer */}
        <div className="w-[52px]" />
      </div>

      {/* Content Area */}
      <div
        className="flex-1 overflow-hidden relative flex flex-col"
        style={{ background: 'rgba(0,0,0,0.20)' }}
      >
        {children}
      </div>

      {/* Resize Handles */}
      {!isMaximized && isResizable && (
        <>
          <div className="resize-handle se" onMouseDown={(e) => startResize(e, 'se')} onTouchStart={(e) => startResize(e, 'se')} />
          <div className="resize-handle sw" onMouseDown={(e) => startResize(e, 'sw')} onTouchStart={(e) => startResize(e, 'sw')} />
          <div className="resize-handle ne" onMouseDown={(e) => startResize(e, 'ne')} onTouchStart={(e) => startResize(e, 'ne')} />
          <div className="resize-handle nw" onMouseDown={(e) => startResize(e, 'nw')} onTouchStart={(e) => startResize(e, 'nw')} />
          <div className="resize-handle n"  onMouseDown={(e) => startResize(e, 'n')}  onTouchStart={(e) => startResize(e, 'n')} />
          <div className="resize-handle s"  onMouseDown={(e) => startResize(e, 's')}  onTouchStart={(e) => startResize(e, 's')} />
          <div className="resize-handle e"  onMouseDown={(e) => startResize(e, 'e')}  onTouchStart={(e) => startResize(e, 'e')} />
          <div className="resize-handle w"  onMouseDown={(e) => startResize(e, 'w')}  onTouchStart={(e) => startResize(e, 'w')} />
        </>
      )}
    </motion.div>
  );
};
