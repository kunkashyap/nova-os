import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useWindowStore } from '@/stores/windowStore';
import { APP_REGISTRY, getPinnedApps } from '@/config/apps';
import { useSettingsStore } from '@/stores/settingsStore';
import { TASKBAR_HEIGHT } from '@/config/apps';
import { useShellStore } from '@/stores/shellStore';

export const StartMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { openWindow } = useWindowStore();
  const { settings } = useSettingsStore();
  const { reboot } = useShellStore();
  const ref = useRef<HTMLDivElement>(null);
  
  useClickOutside(ref, onClose);

  const handleLaunch = (appId: string) => {
    openWindow(appId);
    onClose();
  };

  const pinnedApps = getPinnedApps();
  const otherApps = APP_REGISTRY.filter(a => !a.isPinned);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute z-[9500] w-[400px] h-[520px] left-2 rounded-2xl shadow-panel glass-heavy flex flex-col overflow-hidden pointer-events-auto"
      style={{ bottom: TASKBAR_HEIGHT + 12 }}
    >
      {/* Search Bar */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nova-text-dim" size={16} />
          <input 
            type="text" 
            placeholder="Search apps, files, and settings..."
            className="w-full bg-black/40 border border-nova-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent-light transition-colors text-nova-text placeholder:text-nova-text-dim"
            onClick={() => {
              // Later: trigger command palette
              openWindow('command-palette'); 
              onClose();
            }}
          />
        </div>
      </div>

      {/* Pinned Apps */}
      <div className="px-6 py-4 flex-1 overflow-y-auto no-scrollbar">
        <h3 className="text-xs font-semibold text-nova-text-dim mb-4 uppercase tracking-wider">Pinned</h3>
        <div className="grid grid-cols-4 gap-4">
          {pinnedApps.map(app => {
            const Icon = (Icons as any)[app.icon];
            return (
              <button
                key={app.id}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors group"
                onClick={() => handleLaunch(app.id)}
              >
                <div className="w-12 h-12 rounded-xl bg-nova-surface-3 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border border-nova-border">
                  {Icon && <Icon size={24} className="text-white" strokeWidth={1.5} />}
                </div>
                <span className="text-xs text-nova-text truncate w-full text-center">{app.name}</span>
              </button>
            );
          })}
        </div>

        <h3 className="text-xs font-semibold text-nova-text-dim mb-4 mt-8 uppercase tracking-wider">All Apps</h3>
        <div className="flex flex-col gap-1">
          {otherApps.map(app => {
            const Icon = (Icons as any)[app.icon];
            return (
              <button
                key={app.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => handleLaunch(app.id)}
              >
                <div className="w-8 h-8 rounded bg-nova-surface-3 flex items-center justify-center border border-nova-border">
                  {Icon && <Icon size={16} className="text-white" />}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm text-nova-text">{app.name}</span>
                  <span className="text-xs text-nova-text-dim">{app.description}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom Profile / Power Bar */}
      <div className="h-16 bg-black/40 border-t border-nova-border px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-accent-light flex items-center justify-center shadow-glow-accent">
            <Icons.User size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-nova-text">{settings.username}</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center text-nova-text-dim hover:text-white transition-colors"
            title="Settings"
            onClick={() => handleLaunch('settings')}
          >
            <Icons.Settings size={16} />
          </button>
          <button 
            className="w-8 h-8 rounded hover:bg-error/20 flex items-center justify-center text-nova-text-dim hover:text-error transition-colors"
            title="Shut Down"
            onClick={() => { onClose(); reboot(); }}
          >
            <Icons.Power size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
