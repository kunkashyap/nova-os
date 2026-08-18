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
    
    // Ensure menu stays within viewport
    let x = e.clientX;
    let y = e.clientY;
    
    const menuHeight = newItems.length * 32;
    const menuWidth = 190;

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
        <ContextMenu 
          items={items} 
          position={position} 
          onClose={hideMenu} 
        />
      )}
    </ContextMenuContext.Provider>
  );
};

const ContextMenu: React.FC<{ items: ContextMenuItem[], position: {x: number, y: number}, onClose: () => void }> = ({ items, position, onClose }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);

  return createPortal(
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="context-menu flex flex-col py-1 shadow-dropdown border border-white/[0.06] backdrop-blur-3xl"
      style={{ 
        top: position.y, 
        left: position.x,
        background: 'rgba(12, 13, 18, 0.93)',
        borderRadius: '8px',
        minWidth: '180px',
        padding: '3px'
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, idx) => {
        if (item.divider) {
          return <div key={`div-${idx}`} className="h-px bg-white/5 my-1 mx-2" />;
        }

        const IconComponent = item.icon ? (Icons as any)[item.icon] : null;

        return (
          <button
            key={item.id}
            disabled={item.disabled}
            className={clsx(
              "flex items-center gap-3 px-2.5 py-1.5 text-xs mx-1 rounded text-left transition-all duration-150 cursor-pointer font-normal tracking-wide",
              item.disabled 
                ? "opacity-30 cursor-not-allowed" 
                : "hover:bg-accent-dim/35 hover:text-white hover:translate-x-[1px] active:scale-[0.98]",
              item.danger && !item.disabled ? "hover:bg-error/20 text-error" : "text-white/80 hover:text-white"
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
          >
            {IconComponent && <IconComponent size={13} className="text-white/60 group-hover:text-white" strokeWidth={1.5} />}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && <span className="text-[10px] opacity-40 ml-4">{item.shortcut}</span>}
          </button>
        );
      })}
    </motion.div>,
    document.body
  );
};
