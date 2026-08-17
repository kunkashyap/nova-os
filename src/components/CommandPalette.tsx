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

      // Apps
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

      // Files
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

      // System Commands
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

      setItems(results.slice(0, 10)); // Limit to top 10
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
        <div className="fixed inset-0 z-[100000] flex items-start justify-center pt-[15vh] pointer-events-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-2xl bg-nova-surface-2 rounded-xl shadow-panel border border-nova-border overflow-hidden flex flex-col"
          >
            {/* Input */}
            <div className="flex items-center px-4 border-b border-nova-border">
              <Icons.Search className="text-accent mr-3" size={20} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search apps, files, or commands..."
                className="w-full bg-transparent py-4 text-lg text-nova-text focus:outline-none placeholder:text-nova-text-dim"
              />
              <div className="flex items-center gap-1 text-xs text-nova-text-dim bg-black/30 px-2 py-1 rounded">
                <span>esc</span>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {items.length === 0 ? (
                <div className="py-8 text-center text-nova-text-dim">No results found</div>
              ) : (
                items.map((item, idx) => {
                  const Icon = (Icons as any)[item.icon || 'File'];
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center px-4 py-3 gap-4 text-left transition-colors ${
                        idx === selectedIndex ? 'bg-accent/20 border-l-2 border-accent' : 'border-l-2 border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${
                        idx === selectedIndex ? 'bg-accent text-white' : 'bg-nova-surface-3 text-nova-text-dim'
                      }`}>
                        {Icon && <Icon size={16} />}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className={`text-sm font-medium ${idx === selectedIndex ? 'text-white' : 'text-nova-text'}`}>
                          {item.label}
                        </span>
                        <span className="text-xs text-nova-text-dim">
                          {item.description}
                        </span>
                      </div>
                      {idx === selectedIndex && (
                        <div className="text-xs text-accent mr-2 flex items-center gap-1">
                          <Icons.CornerDownLeft size={14} /> Enter
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
