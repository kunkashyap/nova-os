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
      // Multiple windows open: simple behavior is focus the most recently active one,
      // or if it's already focused, minimize it.
      // (A real OS would show a thumbnail preview here)
      const win = appWindows.find(w => w.id === activeWindowId) || appWindows[0];
      if (win.id === activeWindowId && win.state !== 'minimized') {
        minimizeWindow(win.id);
      } else {
        if (win.state === 'minimized') restoreWindow(win.id);
        focusWindow(win.id);
      }
    }
  };

  return (
    <>
      {showStartMenu && <StartMenu onClose={() => setShowStartMenu(false)} />}
      
      <div className="taskbar pointer-events-auto">
        {/* Start Button */}
        <button 
          className={clsx(
            "w-10 h-10 mx-1 rounded-md flex items-center justify-center transition-colors",
            showStartMenu ? "bg-white/20" : "hover:bg-white/10"
          )}
          onClick={() => setShowStartMenu(!showStartMenu)}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-accent to-accent-light shadow-glow-accent" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* App Icons */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
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
                  "relative w-10 h-10 rounded-md flex items-center justify-center transition-all group",
                  isActive ? "bg-white/15" : "hover:bg-white/10"
                )}
                title={app.name}
              >
                <IconComponent 
                  size={20} 
                  className={clsx("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-white/80")} 
                  strokeWidth={isActive ? 2 : 1.5}
                />
                
                {/* Running Indicator */}
                {isRunning && (
                  <div className={clsx(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-t-sm transition-all",
                    isActive ? "w-4 bg-accent-light" : "w-1.5 bg-white/40"
                  )} />
                )}
              </button>
            );
          })}
        </div>

        {/* System Tray & Clock */}
        <div className="flex items-center gap-2 pr-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors text-white/80">
            <Icons.Wifi size={16} />
            <Icons.Volume2 size={16} />
            <Icons.Battery size={16} />
          </div>
          <div className="text-xs text-right leading-tight px-2 py-1 rounded hover:bg-white/10 transition-colors select-none">
            <div>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-[10px] text-white/60">{time.toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </>
  );
};
