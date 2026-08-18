import React, { useState } from 'react';
import { useSettingsStore, WALLPAPER_OPTIONS } from '@/stores/settingsStore';
import { useShellStore } from '@/stores/shellStore';
import { useFileSystemStore } from '@/stores/fsStore';
import * as Icons from 'lucide-react';

type SettingsSection = 'appearance' | 'system';

const SECTIONS: { id: SettingsSection; label: string; icon: keyof typeof Icons }[] = [
  { id: 'appearance', label: 'Appearance', icon: 'Palette' },
  { id: 'system', label: 'System', icon: 'Settings' },
];

export const SettingsApp: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { reboot } = useShellStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');

  const handleFactoryReset = async () => {
    if (confirm('Are you sure? This will wipe all files, settings, and reboot NOVA OS.')) {
      resetSettings();
      const { db } = await import('@/filesystem/db');
      await db.nodes.clear();
      reboot();
    }
  };

  // Only show the VOID wallpaper options (not legacy aliases)
  const voidWallpapers = ['void', 'grain', 'depth', 'geometric', 'flat'];

  return (
    <div
      className="w-full h-full flex"
      style={{
        background: '#111111',
        color: 'rgba(255,255,255,0.80)',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px',
      }}
    >
      {/* Sidebar */}
      <div
        className="flex flex-col flex-shrink-0"
        style={{
          width: '180px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: '#0D0D0D',
          padding: '16px 8px',
          gap: '2px',
        }}
      >
        <div
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.80)',
            padding: '4px 10px 16px',
            letterSpacing: '-0.01em',
          }}
        >
          Settings
        </div>

        {SECTIONS.map(s => {
          const Icon = Icons[s.icon] as React.FC<any>;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className="flex items-center gap-2 cursor-pointer transition-colors duration-100"
              style={{
                padding: '7px 10px',
                borderRadius: '7px',
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.09)' : 'transparent'}`,
                color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.40)',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '12.5px',
                fontWeight: isActive ? 500 : 400,
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.40)';
              }}
            >
              <Icon size={13} strokeWidth={1.5} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '28px 32px' }}
      >
        {activeSection === 'appearance' && (
          <>
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.85)',
                marginBottom: '28px',
                letterSpacing: '-0.01em',
              }}
            >
              Appearance
            </h1>

            {/* Wallpaper */}
            <SettingsSection label="Wallpaper">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '8px',
                }}
              >
                {voidWallpapers.map(key => {
                  const label = WALLPAPER_OPTIONS[key] || key;
                  const isActive = settings.wallpaper === key ||
                    // handle legacy persisted values
                    (key === 'void' && settings.wallpaper === 'aurora') ||
                    (key === 'grain' && settings.wallpaper === 'nebula') ||
                    (key === 'depth' && settings.wallpaper === 'matrix') ||
                    (key === 'flat' && settings.wallpaper === 'minimal');

                  return (
                    <button
                      key={key}
                      onClick={() => updateSettings({ wallpaper: key as any })}
                      className="relative overflow-hidden transition-all duration-150 cursor-pointer"
                      style={{
                        height: '72px',
                        borderRadius: '8px',
                        border: `1px solid ${isActive ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.07)'}`,
                        background: '#050505',
                        outline: 'none',
                      }}
                    >
                      {/* Mini wallpaper preview */}
                      <WallpaperPreview variant={key} />
                      {/* Label */}
                      <div
                        className="absolute inset-0 flex items-end justify-start"
                        style={{ padding: '6px 7px' }}
                      >
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 500,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: isActive ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.30)',
                          }}
                        >
                          {label}
                        </span>
                      </div>
                      {isActive && (
                        <div
                          className="absolute top-2 right-2 flex items-center justify-center rounded-full"
                          style={{
                            width: '14px',
                            height: '14px',
                            background: 'rgba(255,255,255,0.90)',
                          }}
                        >
                          <Icons.Check size={8} strokeWidth={2.5} style={{ color: '#000' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </SettingsSection>

            {/* Window Transparency */}
            <SettingsSection label="Windows">
              <SettingsToggle
                label="Window Transparency"
                description="Apply backdrop blur to windows"
                checked={settings.windowTransparency}
                onChange={v => updateSettings({ windowTransparency: v })}
              />
            </SettingsSection>

            {/* Animations */}
            <SettingsSection label="Motion">
              <div className="flex gap-2">
                {(['full', 'reduced', 'none'] as const).map(intensity => (
                  <button
                    key={intensity}
                    onClick={() => updateSettings({ animationIntensity: intensity })}
                    className="transition-all duration-100 cursor-pointer capitalize"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '7px',
                      border: `1px solid ${settings.animationIntensity === intensity ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}`,
                      background: settings.animationIntensity === intensity ? 'rgba(255,255,255,0.07)' : 'transparent',
                      color: settings.animationIntensity === intensity ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.40)',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '12.5px',
                      fontWeight: settings.animationIntensity === intensity ? 500 : 400,
                    }}
                  >
                    {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                  </button>
                ))}
              </div>
            </SettingsSection>

            {/* Clock Format */}
            <SettingsSection label="Clock">
              <div className="flex gap-2">
                {(['12h', '24h'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => updateSettings({ clockFormat: fmt })}
                    className="transition-all duration-100 cursor-pointer"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '7px',
                      border: `1px solid ${settings.clockFormat === fmt ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}`,
                      background: settings.clockFormat === fmt ? 'rgba(255,255,255,0.07)' : 'transparent',
                      color: settings.clockFormat === fmt ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.40)',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '12.5px',
                      fontWeight: settings.clockFormat === fmt ? 500 : 400,
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </SettingsSection>
          </>
        )}

        {activeSection === 'system' && (
          <>
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.85)',
                marginBottom: '28px',
                letterSpacing: '-0.01em',
              }}
            >
              System
            </h1>

            {/* System info */}
            <SettingsSection label="About">
              <div className="flex flex-col" style={{ gap: '8px' }}>
                {[
                  ['System', 'NOVA OS · VOID'],
                  ['Version', '2.0.0'],
                  ['Kernel', 'WebAssembly/V8'],
                  ['Shell', 'nova-sh'],
                  ['User', settings.username],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{k}</span>
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', fontWeight: 400 }}>{v}</span>
                  </div>
                ))}
              </div>
            </SettingsSection>

            {/* Danger zone */}
            <div
              style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(239,68,68,0.12)',
              }}
            >
              <div
                style={{
                  fontSize: '9.5px',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  color: 'rgba(239,68,68,0.55)',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Danger Zone
              </div>
              <button
                onClick={handleFactoryReset}
                className="flex items-center gap-2 cursor-pointer transition-colors duration-150"
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  color: 'rgba(239,68,68,0.80)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '12.5px',
                  fontWeight: 400,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.80)';
                }}
              >
                <Icons.AlertTriangle size={13} strokeWidth={1.5} />
                Factory Reset NOVA OS
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Internal helper components ── */

const SettingsSection: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: '28px' }}>
    <div
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '9.5px',
        fontWeight: 500,
        letterSpacing: '0.14em',
        color: 'rgba(255,255,255,0.25)',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}
    >
      {label}
    </div>
    {children}
  </div>
);

const SettingsToggle: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <label
    className="flex items-center justify-between cursor-pointer"
    style={{ gap: '16px' }}
  >
    <div className="flex flex-col" style={{ gap: '2px' }}>
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '13px', fontWeight: 400, color: 'rgba(255,255,255,0.75)' }}>
        {label}
      </span>
      {description && (
        <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.30)' }}>
          {description}
        </span>
      )}
    </div>
    {/* Toggle switch */}
    <div
      className="relative flex-shrink-0 cursor-pointer"
      style={{
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        background: checked ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.10)',
        border: `1px solid ${checked ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'background 0.18s ease, border-color 0.18s ease',
      }}
      onClick={() => onChange(!checked)}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '18px' : '2px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: checked ? '#fff' : 'rgba(255,255,255,0.40)',
          transition: 'left 0.18s ease, background 0.18s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.30)',
        }}
      />
    </div>
  </label>
);

// Minimal wallpaper preview thumbnail
const WallpaperPreview: React.FC<{ variant: string }> = ({ variant }) => {
  const base: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
  };

  if (variant === 'void') return (
    <div style={{ ...base, background: '#050505' }}>
      <div style={{ ...base, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
    </div>
  );
  if (variant === 'grain') return (
    <div style={{ ...base, background: '#060606' }}>
      <div style={{ ...base, background: 'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 65%)' }} />
    </div>
  );
  if (variant === 'depth') return (
    <div style={{ ...base, background: '#050505' }}>
      <div style={{ ...base, background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />
    </div>
  );
  if (variant === 'geometric') return (
    <div style={{ ...base, background: '#050505' }}>
      <div style={{
        ...base,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\'%3E%3Cpath d=\'M10 1L19 10L10 19L1 10Z\' stroke=\'rgba(255,255,255,0.06)\' stroke-width=\'0.5\' fill=\'none\'/%3E%3C/svg%3E")',
        backgroundSize: '20px 20px',
      }} />
    </div>
  );
  if (variant === 'flat') return (
    <div style={{ ...base, background: '#030303' }} />
  );
  return <div style={{ ...base, background: '#050505' }} />;
};
