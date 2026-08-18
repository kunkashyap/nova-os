import React, { useRef, useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');

  useClickOutside(ref, onClose);

  const handleLaunch = (appId: string) => {
    openWindow(appId);
    onClose();
  };

  const pinnedApps = getPinnedApps();
  const otherApps = APP_REGISTRY.filter(a => !a.isPinned);

  // Filter by search
  const filteredPinned = searchQuery
    ? pinnedApps.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.keywords?.some(k => k.includes(searchQuery.toLowerCase()))
      )
    : pinnedApps;

  const filteredOther = searchQuery
    ? otherApps.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.keywords?.some(k => k.includes(searchQuery.toLowerCase()))
      )
    : otherApps;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute z-[9500] pointer-events-auto"
      style={{
        width: '340px',
        bottom: '82px',
        left: '16px',
        borderRadius: '14px',
        background: 'rgba(12,12,12,0.96)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.40)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '480px',
      }}
    >
      {/* Search */}
      <div style={{ padding: '14px 14px 8px' }}>
        <div className="relative">
          <Icons.Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={13}
            strokeWidth={1.5}
            style={{ color: 'rgba(255,255,255,0.28)' }}
          />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-select"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              height: '36px',
              paddingLeft: '32px',
              paddingRight: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px',
              outline: 'none',
              color: 'rgba(255,255,255,0.80)',
              caretColor: 'rgba(255,255,255,0.70)',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          />
        </div>
      </div>

      {/* App list */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '4px 8px 8px' }}>
        {/* Pinned */}
        {filteredPinned.length > 0 && (
          <>
            <div
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '9.5px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase',
                padding: '8px 8px 6px',
              }}
            >
              Pinned
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '4px',
                marginBottom: '8px',
              }}
            >
              {filteredPinned.map(app => {
                const Icon = (Icons as any)[app.icon];
                return (
                  <button
                    key={app.id}
                    className="flex flex-col items-center gap-[7px] cursor-pointer transition-colors duration-100"
                    style={{
                      padding: '10px 6px 8px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    }}
                    onClick={() => handleLaunch(app.id)}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {Icon && <Icon size={18} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.70)' }} />}
                    </div>
                    <span
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '10.5px',
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.60)',
                        textAlign: 'center',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {app.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* All Apps */}
        {filteredOther.length > 0 && (
          <>
            <div
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '9.5px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase',
                padding: '8px 8px 6px',
              }}
            >
              All Apps
            </div>
            <div className="flex flex-col" style={{ gap: '1px' }}>
              {filteredOther.map(app => {
                const Icon = (Icons as any)[app.icon];
                return (
                  <button
                    key={app.id}
                    className="flex items-center gap-3 cursor-pointer transition-colors duration-100"
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    onClick={() => handleLaunch(app.id)}
                  >
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '7px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {Icon && <Icon size={14} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.60)' }} />}
                    </div>
                    <div className="flex flex-col items-start" style={{ gap: '1px' }}>
                      <span
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: '12.5px',
                          fontWeight: 400,
                          color: 'rgba(255,255,255,0.75)',
                        }}
                      >
                        {app.name}
                      </span>
                      <span
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: '10.5px',
                          fontWeight: 400,
                          color: 'rgba(255,255,255,0.28)',
                        }}
                      >
                        {app.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Empty search state */}
        {searchQuery && filteredPinned.length === 0 && filteredOther.length === 0 && (
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: '32px 16px', gap: '8px' }}
          >
            <Icons.Search size={20} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.20)' }} />
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.25)',
              }}
            >
              No apps found
            </span>
          </div>
        )}
      </div>

      {/* Footer — profile + power */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.User size={13} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.55)' }} />
          </div>
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '12.5px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            {settings.username}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="flex items-center justify-center transition-colors duration-150 cursor-pointer"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              background: 'transparent',
              color: 'rgba(255,255,255,0.35)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}
            title="Settings"
            onClick={() => handleLaunch('settings')}
          >
            <Icons.Settings size={14} strokeWidth={1.5} />
          </button>
          <button
            className="flex items-center justify-center transition-colors duration-150 cursor-pointer"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              background: 'transparent',
              color: 'rgba(255,255,255,0.35)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.10)'; (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.80)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}
            title="Shut Down"
            onClick={() => { onClose(); reboot(); }}
          >
            <Icons.Power size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
