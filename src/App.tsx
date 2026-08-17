import React, { useEffect } from 'react';
import { useShellStore } from '@/stores/shellStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFileSystemStore } from '@/stores/fsStore';
import { Desktop } from '@/features/desktop/Desktop';
import { BootSequence } from '@/features/boot/BootSequence';
import { LoginScreen } from '@/features/boot/LoginScreen';
import { ContextMenuProvider } from '@/components/ContextMenu';
import { CommandPalette } from '@/components/CommandPalette';

export const App: React.FC = () => {
  const { phase } = useShellStore();
  const { settings } = useSettingsStore();
  const { initialize } = useFileSystemStore();

  useEffect(() => {
    // Apply accent color to document root
    document.documentElement.dataset.accent = settings.accentColor;
  }, [settings.accentColor]);

  useEffect(() => {
    // Initialize VFS on load
    initialize();
  }, [initialize]);

  // Prevent default context menu everywhere
  useEffect(() => {
    const preventDefault = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', preventDefault);
    return () => document.removeEventListener('contextmenu', preventDefault);
  }, []);

  return (
    <ContextMenuProvider>
      <div className="w-full h-full overflow-hidden bg-black text-white selection:bg-accent-dim selection:text-white">
        {phase === 'boot' && <BootSequence />}
        {phase === 'login' && <LoginScreen />}
        {phase === 'desktop' && (
          <>
            <Desktop />
            <CommandPalette />
          </>
        )}
      </div>
    </ContextMenuProvider>
  );
};
