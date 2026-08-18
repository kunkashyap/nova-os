import React from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export const Wallpaper: React.FC = () => {
  const { wallpaper } = useSettingsStore(s => s.settings);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#050505] pointer-events-none">
      {/* ── Wallpaper Image ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("/wallpaper.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Subtle dark overlay for UI readability */}
      <div className="absolute inset-0 bg-black/45" />

      {/* ── Wallpaper Variant Overlays ── */}

      {/* void — default: soft center depth */}
      {(wallpaper === 'void' || wallpaper === 'aurora') && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 70%)',
          }}
        />
      )}

      {/* grain — extra grain / texture */}
      {(wallpaper === 'grain' || wallpaper === 'nebula') && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 65%)',
          }}
        />
      )}

      {/* depth — edge vignette */}
      {(wallpaper === 'depth' || wallpaper === 'matrix') && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)',
          }}
        />
      )}

      {/* geometric — tiny diamond pattern overlay */}
      {wallpaper === 'geometric' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Cpath d=\'M20 2L38 20L20 38L2 20Z\' stroke=\'rgba(255,255,255,0.015)\' stroke-width=\'0.5\' fill=\'none\'/%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
            maskImage:
              'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)',
          }}
        />
      )}

      {/* ── Shared Visual Textures ── */}

      {/* Dot grid — faint overlay */}
      {wallpaper !== 'flat' && wallpaper !== 'minimal' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 0%, transparent 100%)',
          }}
        />
      )}

      {/* Grain noise overlay */}
      <div className="void-grain" style={{ opacity: wallpaper === 'grain' || wallpaper === 'nebula' ? 0.22 : 0.12 }} />
    </div>
  );
};
