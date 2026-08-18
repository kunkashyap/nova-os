import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import * as Icons from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { getPinnedApps, getApp } from '@/config/apps';
import { StartMenu } from './StartMenu';
import { useSettingsStore } from '@/stores/settingsStore';

export const Taskbar: React.FC = () => {
  const { windows, activeWindowId, openWindow, focusWindow, minimizeWindow, restoreWindow } = useWindowStore();
  const { settings } = useSettingsStore();
  const [time, setTime] = useState(new Date());
  const [showStartMenu, setShowStartMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pinnedApps = getPinnedApps();
  const runningAppIds = Array.from(new Set(windows.map(w => w.appId)));
  const allTaskbarAppIds = Array.from(new Set([...pinnedApps.map(a => a.id), ...runningAppIds]));

  const handleAppClick = (appId: string) => {
    const appWindows = windows.filter(w => w.appId === appId);

    if (appWindows.length === 0) {
      openWindow(appId);
    } else if (appWindows.length === 1) {
      const win = appWindows[0];
      if (win.id === activeWindowId && win.state !== 'minimized') {
        minimizeWindow(win.id);
      } else {
        if (win.state === 'minimized') restoreWindow(win.id);
        focusWindow(win.id);
      }
    } else {
      const win = appWindows.find(w => w.id === activeWindowId) || appWindows[0];
      if (win.id === activeWindowId && win.state !== 'minimized') {
        minimizeWindow(win.id);
      } else {
        if (win.state === 'minimized') restoreWindow(win.id);
        focusWindow(win.id);
      }
    }
  };

  // Clock formatting
  const hours = settings.clockFormat === '12h'
    ? String(time.getHours() % 12 || 12).padStart(2, '0')
    : String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const period  = settings.clockFormat === '12h'
    ? (time.getHours() >= 12 ? 'PM' : 'AM')
    : null;

  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const formattedDate = `${months[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`;

  return (
    <>
      {showStartMenu && <StartMenu onClose={() => setShowStartMenu(false)} />}

      {/* ── VOID Taskbar ── */}
      <div
        className="taskbar pointer-events-auto w-full select-none flex items-center justify-between"
        style={{
          paddingLeft: '28px',
          paddingRight: '28px',
        }}
      >
        {/* Left: Launcher & App dock */}
        <div className="flex items-center gap-3">
          <button
            className={clsx(
              "w-[38px] h-[38px] rounded-[10px] flex items-center justify-center transition-all duration-150 cursor-pointer select-none border",
              showStartMenu
                ? "bg-[#282828] border-white/[0.18]"
                : "bg-[#111111] border-white/[0.07] hover:bg-[#1A1A1A] hover:border-white/[0.12] active:bg-[#0D0D0D]"
            )}
            onClick={() => setShowStartMenu(!showStartMenu)}
            title="Launcher"
            aria-label="Open launcher"
            aria-expanded={showStartMenu}
          >
            {/* 4-point star — monochrome, no glow */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M12 2C12 2 12.3 8.3 13.5 9.5C14.7 10.7 21 11 21 11C21 11 14.7 11.3 13.5 12.5C12.3 13.7 12 20 12 20C12 20 11.7 13.7 10.5 12.5C9.3 11.3 3 11 3 11C3 11 9.3 10.7 10.5 9.5C11.7 8.3 12 2 12 2Z"
                fill={showStartMenu ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.55)'}
                style={{ transition: 'fill 0.15s ease' }}
              />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.06]" aria-hidden="true" />

          {/* App shortcuts */}
          <div className="flex items-center gap-2">
            {allTaskbarAppIds.map(appId => {
              const app = getApp(appId);
              if (!app) return null;

              const isRunning = runningAppIds.includes(appId);
              const appWindows = windows.filter(w => w.appId === appId);
              const isActive = appWindows.some(w => w.id === activeWindowId && w.state !== 'minimized');
              const IconComponent = (Icons as any)[app.icon] || Icons.Square;

              return (
                <button
                  key={appId}
                  onClick={() => handleAppClick(appId)}
                  className={clsx(
                    "relative w-9 h-9 rounded-[8px] flex items-center justify-center transition-all duration-150 border cursor-pointer select-none",
                    isActive
                      ? "bg-[#282828] border-white/[0.14]"
                      : "bg-[#111111] border-white/[0.05] hover:bg-[#1A1A1A] hover:border-white/[0.09] hover:-translate-y-[1px]"
                  )}
                  title={app.name}
                  aria-label={app.name}
                >
                  <IconComponent
                    size={16}
                    strokeWidth={1.5}
                    className="transition-all duration-150"
                    style={{
                      color: isActive ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.55)',
                    }}
                  />

                  {/* Running indicator — small white dot */}
                  {isRunning && (
                    <span
                      className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 rounded-full"
                      aria-hidden="true"
                      style={{
                        width: '3px',
                        height: '3px',
                        background: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Flexible spacer */}
        <div className="flex-1" aria-hidden="true" />

        {/* Right: System tray & Clock */}
        <div className="flex items-center gap-5">
          {/* System tray icons */}
          <div className="flex items-center gap-3.5 text-white/40">
            <button className="hover:text-white/80 transition-colors cursor-pointer p-1 rounded" title="Wi-Fi">
              <Icons.Wifi size={14} strokeWidth={1.5} />
            </button>
            <button className="hover:text-white/80 transition-colors cursor-pointer p-1 rounded" title="Volume">
              <Icons.Volume2 size={14} strokeWidth={1.5} />
            </button>
            <button className="hover:text-white/80 transition-colors cursor-pointer p-1 rounded" title="Battery">
              <Icons.Battery size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.06]" aria-hidden="true" />

          {/* Clock */}
          <div className="text-right select-none flex flex-col items-end justify-center" style={{ gap: '2px', minWidth: '85px' }}>
            <div
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.80)',
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              {hours}:{minutes}
              {period && (
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginLeft: '3px', fontWeight: 400 }}>
                  {period}
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '9px',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.28)',
                letterSpacing: '0.04em',
              }}
            >
              {formattedDate}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
