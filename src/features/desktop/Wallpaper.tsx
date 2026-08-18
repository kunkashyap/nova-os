import React from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export const Wallpaper: React.FC = () => {
  const { wallpaper } = useSettingsStore(s => s.settings);

  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-[#07080a] pointer-events-none">
      
      {/* ── Wallpaper Variant Renderers ── */}
      {wallpaper === 'aurora' && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-[#07080a] to-violet-950/15">
          {/* Drifting glow spots */}
          <div className="absolute top-[-25%] left-[-15%] w-[70%] h-[70%] rounded-full bg-accent-dim/30 blur-[130px] mix-blend-screen animate-nova-float" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px] mix-blend-screen animate-nova-pulse" />
        </div>
      )}
      
      {wallpaper === 'nebula' && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#0a0b0f] to-[#050507]">
          {/* Subtle grid pattern inside nebula */}
          <div className="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMC41IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMTUiLz4KPC9zdmc+')] mix-blend-overlay" />
        </div>
      )}

      {wallpaper === 'matrix' && (
        <div className="absolute inset-0 bg-[#050507]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-[#050507]" />
        </div>
      )}

      {wallpaper === 'geometric' && (
        <div className="absolute inset-0 bg-[#07080a]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik01NC42MjcgMTEuMjVsLTQuMjQzLTQuMjQzTDQ0LjAyIDExLjI1bDUuNjU3IDUuNjU3LTUuNjU3IDUuNjU3IDQuMjQzIDQuMjQzIDUuNjU3LTUuNjU3IDUuNjU3IDUuNjU3IDQuMjQzLTQuMjQzLTUuNjU3LTUuNjU3IDUuNjU3LTUuNjU3LTQuMjQzLTQuMjQzLTUuNjU3IDUuNjU3eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjAxMiIgZmlsbC1ydWxlPSJldmVub2RkIi8+Cjwvc3ZnPg==')] opacity-40" />
        </div>
      )}

      {wallpaper === 'minimal' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e1017] via-[#07080a] to-[#040406]" />
      )}

      {/* ── Premium Ambient Textures (shared across all wallpapers) ── */}
      
      {/* 1. Subtle central lighting */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle 50vw at 50% 50%, rgba(139,92,246,0.02) 0%, transparent 100%)'
        }}
      />

      {/* 2. Micro noise texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          opacity: 0.35,
          mixBlendMode: 'overlay',
        }}
      />

      {/* ── 3. Subtle Central OS Branding Anchor ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-[1]">
        <div className="flex flex-col items-center opacity-[0.05] md:opacity-[0.07]">
          <span 
            className="font-extralight tracking-[0.32em] text-white leading-none mb-1.5"
            style={{ fontSize: '32px' }}
          >
            NOVA
          </span>
          <span 
            className="tracking-[0.42em] text-white/70"
            style={{ fontSize: '8px' }}
          >
            SYSTEM ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};
