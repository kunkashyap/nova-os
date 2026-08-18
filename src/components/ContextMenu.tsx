import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import type { ContextMenuItem } from '@/types';
import { useClickOutside } from '@/hooks/useClickOutside';
import { clsx } from 'clsx';
import * as Icons from 'lucide-react';

interface ContextMenuContextType {
  showMenu: (e: React.MouseEvent, items: ContextMenuItem[]) => void;
  hideMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export const useContextMenu = () => {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) throw new Error('useContextMenu must be used within ContextMenuProvider');
  return ctx;
};

export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ContextMenuItem[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const showMenu = (e: React.MouseEvent, newItems: ContextMenuItem[]) => {
    e.preventDefault();
    e.stopPropagation();

    let x = e.clientX;
    let y = e.clientY;

    const menuHeight = newItems.length * 30 + 12;
    const menuWidth = 196;

    if (x + menuWidth > window.innerWidth) x -= menuWidth;
    if (y + menuHeight > window.innerHeight) y -= menuHeight;

    setPosition({ x: Math.max(0, x), y: Math.max(0, y) });
    setItems(newItems);
    setIsOpen(true);
  };

  const hideMenu = () => setIsOpen(false);

  return (
    <ContextMenuContext.Provider value={{ showMenu, hideMenu }}>
      {children}
      {isOpen && (
        <VoidContextMenu
          items={items}
          position={position}
          onClose={hideMenu}
        />
      )}
    </ContextMenuContext.Provider>
  );
};

const VoidContextMenu: React.FC<{
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}> = ({ items, position, onClose }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);

  return createPortal(
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.10, ease: 'easeOut' }}
      className="context-menu"
      style={{
        top: position.y,
        left: position.x,
        position: 'fixed',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, idx) => {
        if (item.divider) {
          return (
            <div
              key={`div-${idx}`}
              style={{
                height: '1px',
                background: 'rgba(255,255,255,0.05)',
                margin: '3px 6px',
              }}
            />
          );
        }

        const IconComponent = item.icon ? (Icons as any)[item.icon] : null;

        return (
          <button
            key={item.id}
            disabled={item.disabled}
            className={clsx(
              "flex items-center gap-[10px] w-full text-left transition-colors duration-100 cursor-pointer",
              item.disabled && "opacity-25 cursor-not-allowed"
            )}
            style={{
              padding: '6px 10px',
              margin: '1px 2px',
              borderRadius: '5px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              color: item.danger && !item.disabled
                ? 'rgba(239,68,68,0.80)'
                : 'rgba(255,255,255,0.70)',
              background: 'transparent',
              border: 'none',
            }}
            onMouseEnter={e => {
              if (!item.disabled) {
                (e.currentTarget as HTMLElement).style.background = item.danger
                  ? 'rgba(239,68,68,0.08)'
                  : 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.color = item.danger
                  ? 'rgba(239,68,68,1)'
                  : 'rgba(255,255,255,0.90)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = item.danger && !item.disabled
                ? 'rgba(239,68,68,0.80)'
                : 'rgba(255,255,255,0.70)';
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
          >
            {IconComponent && (
              <IconComponent
                size={12}
                strokeWidth={1.5}
                style={{ flexShrink: 0, color: 'inherit' }}
              />
            )}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span
                style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.22)',
                  marginLeft: '12px',
                  flexShrink: 0,
                }}
              >
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </motion.div>,
    document.body
  );
};
