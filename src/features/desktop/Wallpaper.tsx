import React from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { clsx } from 'clsx';

export const Wallpaper: React.FC = () => {
  const { wallpaper } = useSettingsStore(s => s.settings);

  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-nova-black pointer-events-none">
      {wallpaper === 'aurora' && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-nova-black to-accent-glow/20">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent-dim blur-[120px] mix-blend-screen animate-nova-float" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen animate-nova-pulse" />
        </div>
      )}
      
      {wallpaper === 'nebula' && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-nova-darker to-black">
          <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay" />
        </div>
      )}

      {wallpaper === 'matrix' && (
        <div className="absolute inset-0 bg-nova-black">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-900/10 to-nova-black" />
        </div>
      )}

      {wallpaper === 'geometric' && (
        <div className="absolute inset-0 bg-nova-dark">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik01NC42MjcgMTEuMjVsLTQuMjQzLTQuMjQzTDQ0LjAyIDExLjI1bDUuNjU3IDUuNjU3LTUuNjU3IDUuNjU3IDQuMjQzIDQuMjQzIDUuNjU3LTUuNjU3IDUuNjU3IDUuNjU3IDQuMjQzLTQuMjQzLTUuNjU3LTUuNjU3IDUuNjU3LTUuNjU3LTQuMjQzLTQuMjQzLTUuNjU3IDUuNjU3eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyNCIgZmlsbC1ydWxlPSJldmVub2RkIi8+Cjwvc3ZnPg==')] opacity-50" />
        </div>
      )}

      {wallpaper === 'minimal' && (
        <div className="absolute inset-0 bg-gradient-to-b from-nova-surface to-nova-black" />
      )}
    </div>
  );
};
