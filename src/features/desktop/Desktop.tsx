import React, { useRef } from 'react';
import { useDesktopStore } from '@/stores/desktopStore';
import { useContextMenu } from '@/components/ContextMenu';
import { Wallpaper } from './Wallpaper';
import { DesktopIcon } from './DesktopIcon';
import { WindowManager } from '@/window-manager/WindowManager';
import { Taskbar } from '@/features/taskbar/Taskbar';
import { NotificationsProvider } from '@/components/Notifications';

export const Desktop: React.FC = () => {
  const { icons, clearSelection } = useDesktopStore();
  const { showMenu } = useContextMenu();
  const desktopRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    // Only show desktop context menu if clicking directly on the desktop
    if (e.target === desktopRef.current) {
      showMenu(e, [
        { id: 'new-folder', label: 'New Folder', icon: 'FolderPlus' },
        { id: 'new-text', label: 'New Text File', icon: 'FileText' },
        { divider: true, id: 'd1' },
        { id: 'refresh', label: 'Refresh', icon: 'RefreshCw', action: () => window.location.reload() },
        { divider: true, id: 'd2' },
        { id: 'display', label: 'Display Settings', icon: 'Monitor' },
      ]);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === desktopRef.current) {
      clearSelection();
    }
  };

  return (
    <div 
      ref={desktopRef}
      className="relative w-full h-full overflow-hidden"
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
    >
      <Wallpaper />
      
      {/* Desktop Icons Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {icons.map((icon) => (
          <DesktopIcon key={icon.id} icon={icon} />
        ))}
      </div>

      {/* Window Manager Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none [&>*]:pointer-events-auto">
        <WindowManager />
      </div>

      {/* UI Overlays */}
      <NotificationsProvider />

      {/* Taskbar Layer */}
      <Taskbar />
    </div>
  );
};
