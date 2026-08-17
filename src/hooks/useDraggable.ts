import { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DraggableOptions {
  initialPosition?: Position;
  handleRef?: React.RefObject<HTMLElement | null>;
  onDragStart?: () => void;
  onDrag?: (pos: Position) => void;
  onDragEnd?: (pos: Position) => void;
  disabled?: boolean;
}

export function useDraggable({
  initialPosition = { x: 0, y: 0 },
  handleRef,
  onDragStart,
  onDrag,
  onDragEnd,
  disabled = false,
}: DraggableOptions) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const isDragging = useRef(false);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const startPosition = useRef<Position>({ x: 0, y: 0 });

  const startDrag = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (disabled) return;
    
    // Only left click
    if ('button' in e && e.button !== 0) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent | React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent | React.MouseEvent).clientY;

    isDragging.current = true;
    dragStartPos.current = { x: clientX, y: clientY };
    startPosition.current = { ...position };

    if (onDragStart) onDragStart();

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    
    // Prevent default to avoid scrolling on touch
    if ('touches' in e && e.cancelable) e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;

    let newX = startPosition.current.x + deltaX;
    let newY = startPosition.current.y + deltaY;

    // Simple bounds check to keep titlebar accessible
    newY = Math.max(0, newY); 

    const newPos = { x: newX, y: newY };
    setPosition(newPos);
    
    if (onDrag) onDrag(newPos);
  };

  const stopDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', handleDrag);
    document.removeEventListener('touchend', stopDrag);

    if (onDragEnd) onDragEnd(position);
  };

  useEffect(() => {
    const handle = handleRef?.current;
    if (handle) {
      handle.addEventListener('mousedown', startDrag);
      handle.addEventListener('touchstart', startDrag, { passive: false });
      return () => {
        handle.removeEventListener('mousedown', startDrag);
        handle.removeEventListener('touchstart', startDrag);
      };
    }
  }, [handleRef, position, disabled]); // Re-bind if dependencies change

  return { position, startDrag, setPosition };
}
