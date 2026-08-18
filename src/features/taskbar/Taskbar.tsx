import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import * as Icons from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { getPinnedApps, getApp } from '@/config/apps';
import { StartMenu } from './StartMenu';

export const Taskbar: React.FC = () => {
  const { windows, activeWindowId, openWindow, focusWindow, minimizeWindow, restoreWindow } = useWindowStore();
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

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const formattedDate = time.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <>
      {showStartMenu && <StartMenu onClose={() => setShowStartMenu(false)} />}
      
      {/* ── Refined Symmetrical Taskbar ── */}
      <div className="taskbar pointer-events-auto grid grid-cols-3 w-full px-4 items-center justify-between">
        
        {/* Left Zone: Start Button / Launcher */}
        <div className="flex items-center justify-start">
          <button 
            className={clsx(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer",
              showStartMenu 
                ? "bg-accent-dim/40 border border-accent/25 shadow-glow-accent/15" 
                : "bg-transparent border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06] hover:scale-105 active:scale-95"
            )}
            onClick={() => setShowStartMenu(!showStartMenu)}
            title="NOVA Menu"
          >
            {/* Custom vector launcher sigil (matching center diamond/star theme) */}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M10 1.5L12.7 7.3L18.5 10L12.7 12.7L10 18.5L7.3 12.7L1.5 10L7.3 7.3L10 1.5Z" 
                fill="url(#launcher-grad)" 
              />
              <defs>
                <linearGradient id="launcher-grad" x1="1.5" y1="1.5" x2="18.5" y2="18.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a78bfa" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </button>
        </div>

        {/* Center Zone: Active/Pinned Apps Area */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
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
                  "relative w-9.5 h-9.5 rounded-lg flex items-center justify-center transition-all duration-200 group border cursor-pointer",
                  isActive 
                    ? "bg-white/[0.08] border-white/[0.06] shadow-sm shadow-black/35" 
                    : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.04] hover:-translate-y-[2px]"
                )}
                title={app.name}
              >
                <IconComponent 
                  size={17} 
                  className={clsx(
                    "transition-all duration-200", 
                    isActive ? "text-white scale-105" : "text-white/60 group-hover:text-white/95"
                  )} 
                  strokeWidth={1.5}
                />
                
                {/* Modern Indicator Dot */}
                {isRunning && (
                  <div 
                    className={clsx(
                      "absolute bottom-[2px] left-1/2 -translate-x-1/2 h-[3.5px] rounded-full transition-all duration-300",
                      isActive 
                        ? "w-2.5 bg-accent-light shadow-glow-accent" 
                        : "w-1 bg-white/40"
                    )} 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Zone: System Tray & Clock */}
        <div className="flex items-center justify-end gap-1">
          {/* System status tray */}
          <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.03] transition-colors text-white/65 hover:text-white/90 cursor-pointer">
            <Icons.Wifi size={14} strokeWidth={1.5} />
            <Icons.Volume2 size={14} strokeWidth={1.5} />
            <Icons.Battery size={14} strokeWidth={1.5} />
          </div>
          
          {/* Clock */}
          <div className="text-right select-none px-2.5 py-0.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer flex flex-col items-end">
            <div className="text-[11.5px] text-white/90 font-medium tracking-wide">
              {formattedTime}
            </div>
            <div className="text-[9px] text-white/40 tracking-widest font-normal mt-0.5">
              {formattedDate}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
