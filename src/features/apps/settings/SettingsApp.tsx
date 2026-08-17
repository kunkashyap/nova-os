import React from 'react';
import { useSettingsStore, ACCENT_COLORS, WALLPAPER_OPTIONS } from '@/stores/settingsStore';
import { useShellStore } from '@/stores/shellStore';
import { useFileSystemStore } from '@/stores/fsStore';
import { useWindowStore } from '@/stores/windowStore';
import * as Icons from 'lucide-react';

export const SettingsApp: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { reboot } = useShellStore();
  const { initialize: resetFs } = useFileSystemStore(); // Needs more complex reset in reality
  const { closeWindow } = useWindowStore();

  const handleFactoryReset = async () => {
    if (confirm("Are you sure? This will wipe all files, settings, and reboot NOVA OS.")) {
      resetSettings();
      // Wipe DB
      const { db } = await import('@/filesystem/db');
      await db.nodes.clear();
      reboot();
    }
  };

  return (
    <div className="w-full h-full bg-nova-surface flex flex-col sm:flex-row text-sm">
      {/* Sidebar */}
      <div className="w-48 bg-nova-surface-2 border-r border-nova-border p-4 flex flex-col gap-2 flex-shrink-0">
        <h2 className="text-xl font-bold mb-4 px-2">Settings</h2>
        <div className="bg-white/10 px-4 py-2 rounded text-white font-medium cursor-default">Appearance</div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-8 text-nova-text">Appearance</h1>

        {/* Wallpaper */}
        <div className="mb-10">
          <h3 className="text-sm font-medium text-nova-text mb-4 uppercase tracking-wider">Wallpaper</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.entries(WALLPAPER_OPTIONS)).map(([key, label]) => (
              <button
                key={key}
                onClick={() => updateSettings({ wallpaper: key as any })}
                className={`relative h-24 rounded-lg border-2 transition-all overflow-hidden bg-nova-dark ${
                  settings.wallpaper === key ? 'border-accent' : 'border-transparent hover:border-white/20'
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">{label}</span>
                </div>
                {/* Mini-preview based on key */}
                {key === 'aurora' && <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-purple-900" />}
                {key === 'nebula' && <div className="absolute inset-0 bg-radial-gradient from-blue-900 to-black" />}
                {key === 'matrix' && <div className="absolute inset-0 bg-green-900/20" />}
                {key === 'geometric' && <div className="absolute inset-0 bg-nova-darker" />}
                {key === 'minimal' && <div className="absolute inset-0 bg-nova-surface" />}
                
                <div className="absolute bottom-2 right-2 text-xs opacity-50">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="mb-10">
          <h3 className="text-sm font-medium text-nova-text mb-4 uppercase tracking-wider">Accent Color</h3>
          <div className="flex flex-wrap gap-4">
            {(Object.entries(ACCENT_COLORS)).map(([key, color]) => (
              <button
                key={key}
                onClick={() => updateSettings({ accentColor: key as any })}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                  settings.accentColor === key ? 'ring-2 ring-white ring-offset-2 ring-offset-nova-surface' : ''
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              >
                {settings.accentColor === key && <Icons.Check size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Window Transparency */}
        <div className="mb-10">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.windowTransparency}
              onChange={(e) => updateSettings({ windowTransparency: e.target.checked })}
              className="w-5 h-5 rounded border-nova-border bg-nova-surface-3 text-accent focus:ring-accent accent-accent"
            />
            <div>
              <div className="font-medium text-nova-text">Window Transparency</div>
              <div className="text-xs text-nova-text-dim">Enable glassmorphism effects on windows and taskbar</div>
            </div>
          </label>
        </div>

        {/* Animations */}
        <div className="mb-10">
          <h3 className="text-sm font-medium text-nova-text mb-4 uppercase tracking-wider">Animations</h3>
          <div className="flex gap-4">
            {['full', 'reduced', 'none'].map((intensity) => (
              <button
                key={intensity}
                onClick={() => updateSettings({ animationIntensity: intensity as any })}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  settings.animationIntensity === intensity 
                    ? 'border-accent bg-accent/20 text-accent-light' 
                    : 'border-nova-border hover:bg-white/5'
                }`}
              >
                <span className="capitalize">{intensity}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-16 pt-8 border-t border-error/20">
          <h3 className="text-sm font-medium text-error mb-4 uppercase tracking-wider">Danger Zone</h3>
          <button
            onClick={handleFactoryReset}
            className="px-4 py-2 rounded-lg bg-error/20 text-error hover:bg-error hover:text-white transition-colors flex items-center gap-2 font-medium"
          >
            <Icons.AlertTriangle size={16} />
            Factory Reset NOVA OS
          </button>
        </div>

      </div>
    </div>
  );
};
