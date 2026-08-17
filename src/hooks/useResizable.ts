import { useEffect, useRef, useState } from 'react';
import type { WindowRect } from '@/types';

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ResizableOptions {
  initialRect: WindowRect;
  minWidth?: number;
  minHeight?: number;
  onResizeStart?: () => void;
  onResize?: (rect: WindowRect) => void;
  onResizeEnd?: (rect: WindowRect) => void;
  disabled?: boolean;
}

export function useResizable({
  initialRect,
  minWidth = 300,
  minHeight = 200,
  onResizeStart,
  onResize,
  onResizeEnd,
  disabled = false,
}: ResizableOptions) {
  const [rect, setRect] = useState<WindowRect>(initialRect);
  const isResizing = useRef(false);
  const resizeDirection = useRef<ResizeDirection | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startRect = useRef<WindowRect>({ x: 0, y: 0, width: 0, height: 0 });

  // Expose a way to externally update the internal state (e.g. when maximized/restored)
  useEffect(() => {
    setRect(initialRect);
  }, [initialRect.x, initialRect.y, initialRect.width, initialRect.height]);

  const startResize = (e: React.MouseEvent | React.TouchEvent, direction: ResizeDirection) => {
    if (disabled) return;
    
    // Prevent default drag behaviors
    e.stopPropagation();
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    isResizing.current = true;
    resizeDirection.current = direction;
    startPos.current = { x: clientX, y: clientY };
    startRect.current = { ...rect };

    if (onResizeStart) onResizeStart();

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('touchmove', handleResize, { passive: false });
    document.addEventListener('touchend', stopResize);
  };

  const handleResize = (e: MouseEvent | TouchEvent) => {
    if (!isResizing.current) return;
    
    if ('touches' in e && e.cancelable) e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;

    const dir = resizeDirection.current!;
    const newRect = { ...startRect.current };

    if (dir.includes('e')) {
      newRect.width = Math.max(minWidth, startRect.current.width + deltaX);
    }
    if (dir.includes('s')) {
      newRect.height = Math.max(minHeight, startRect.current.height + deltaY);
    }
    if (dir.includes('w')) {
      const w = Math.max(minWidth, startRect.current.width - deltaX);
      if (w > minWidth) {
        newRect.width = w;
        newRect.x = startRect.current.x + deltaX;
      }
    }
    if (dir.includes('n')) {
      const h = Math.max(minHeight, startRect.current.height - deltaY);
      if (h > minHeight) {
        newRect.height = h;
        newRect.y = startRect.current.y + deltaY;
      }
    }

    setRect(newRect);
    if (onResize) onResize(newRect);
  };

  const stopResize = () => {
    if (!isResizing.current) return;
    isResizing.current = false;
    resizeDirection.current = null;

    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('touchmove', handleResize);
    document.removeEventListener('touchend', stopResize);

    if (onResizeEnd) onResizeEnd(rect);
  };

  return { rect, startResize, setRect };
}
