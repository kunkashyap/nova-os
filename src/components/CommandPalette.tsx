import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '@/stores/windowStore';
import { useFileSystemStore } from '@/stores/fsStore';
import { useShellStore } from '@/stores/shellStore';
import { APP_REGISTRY } from '@/config/apps';
import { fuzzySearch } from '@/utils';
import * as Icons from 'lucide-react';
import { db } from '@/filesystem/db';
import type { CommandPaletteItem } from '@/types';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CommandPaletteItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { openWindow } = useWindowStore();
  const { reboot } = useShellStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const search = async () => {
      const q = query.toLowerCase();
      let results: CommandPaletteItem[] = [];

      APP_REGISTRY.forEach(app => {
        if (!q || fuzzySearch(q, app.name.toLowerCase()) || app.keywords?.some(kw => fuzzySearch(q, kw))) {
          results.push({
            id: `app-${app.id}`,
            type: 'app',
            label: app.name,
            description: 'Application',
            icon: app.icon,
            action: () => openWindow(app.id)
          });
        }
      });

      const files = await db.nodes.toArray();
      files.forEach(file => {
        if (!file.trashedAt && (fuzzySearch(q, file.name.toLowerCase()))) {
          results.push({
            id: `file-${file.id}`,
            type: 'file',
            label: file.name,
            description: file.type === 'folder' ? 'Folder' : 'File',
            icon: file.type === 'folder' ? 'Folder' : 'File',
            action: () => {
              if (file.type === 'folder') {
                openWindow('file-manager', { path: file.id });
              } else if (file.mimeType?.startsWith('image/')) {
                openWindow('image-viewer', { path: file.id });
              } else {
                openWindow('text-editor', { path: file.id });
              }
            }
          });
        }
      });

      const cmds = [
        { id: 'cmd-reboot', label: 'Reboot NOVA OS', action: reboot },
        { id: 'cmd-settings', label: 'Open Settings', action: () => openWindow('settings') }
      ];
      cmds.forEach(cmd => {
        if (!q || fuzzySearch(q, cmd.label.toLowerCase())) {
          results.push({
            ...cmd,
            type: 'command',
            description: 'System Command',
            icon: 'Terminal'
          });
        }
      });

      setItems(results.slice(0, 10));
      setSelectedIndex(0);
    };

    search();
  }, [query, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-start justify-center pointer-events-auto" style={{ paddingTop: '14vh' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative overflow-hidden flex flex-col"
            style={{
              width: '100%',
              maxWidth: '560px',
              borderRadius: '14px',
              background: 'rgba(12,12,12,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.70), 0 8px 24px rgba(0,0,0,0.45)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Search input */}
            <div
              className="flex items-center"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '0 16px',
                gap: '12px',
              }}
            >
              <Icons.Search
                size={15}
                strokeWidth={1.5}
                style={{ color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}
              />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search apps, files, or commands..."
                className="text-select"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.80)',
                  padding: '16px 0',
                  caretColor: 'rgba(255,255,255,0.70)',
                }}
              />
              <kbd
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '10px',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  flexShrink: 0,
                }}
              >
                esc
              </kbd>
            </div>

            {/* Results */}
            <div className="overflow-y-auto" style={{ maxHeight: '55vh', padding: '4px' }}>
              {items.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center"
                  style={{ padding: '28px 16px', gap: '8px' }}
                >
                  <Icons.Search size={18} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.15)' }} />
                  <span
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.22)',
                    }}
                  >
                    No results
                  </span>
                </div>
              ) : (
                items.map((item, idx) => {
                  const Icon = (Icons as any)[item.icon || 'File'];
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className="w-full flex items-center gap-3 text-left transition-colors duration-75 cursor-pointer"
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(255,255,255,0.07)' : 'transparent',
                        border: 'none',
                        borderLeft: `2px solid ${isSelected ? 'rgba(255,255,255,0.22)' : 'transparent'}`,
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '7px',
                          background: isSelected ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {Icon && (
                          <Icon
                            size={14}
                            strokeWidth={1.5}
                            style={{ color: isSelected ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.40)' }}
                          />
                        )}
                      </div>

                      <div className="flex flex-col flex-1 min-w-0" style={{ gap: '1px' }}>
                        <span
                          style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: '13px',
                            fontWeight: 400,
                            color: isSelected ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.65)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: '11px',
                            fontWeight: 400,
                            color: 'rgba(255,255,255,0.25)',
                          }}
                        >
                          {item.description}
                        </span>
                      </div>

                      {isSelected && (
                        <div
                          className="flex items-center gap-1 flex-shrink-0"
                          style={{
                            color: 'rgba(255,255,255,0.28)',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: '10px',
                          }}
                        >
                          <Icons.CornerDownLeft size={11} strokeWidth={1.5} />
                          <span>enter</span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
