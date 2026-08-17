import React from 'react';
import { useWindowStore } from '@/stores/windowStore';
import { Window } from './Window';
import { getApp } from '@/config/apps';
import { TerminalApp } from '@/features/apps/terminal/TerminalApp';
import { FileManagerApp } from '@/features/apps/file-manager/FileManagerApp';
import { TextEditorApp } from '@/features/apps/text-editor/TextEditorApp';
import { CalculatorApp } from '@/features/apps/calculator/CalculatorApp';
import { ImageViewerApp } from '@/features/apps/image-viewer/ImageViewerApp';
import { SettingsApp } from '@/features/apps/settings/SettingsApp';
import { TrashApp } from '@/features/apps/trash/TrashApp';

export const WindowManager: React.FC = () => {
  const windows = useWindowStore((state) => state.windows);

  const renderAppContent = (appId: string, payload?: any) => {
    switch (appId) {
      case 'terminal': return <TerminalApp />;
      case 'file-manager': return <FileManagerApp payload={payload} />;
      case 'text-editor': return <TextEditorApp payload={payload} />;
      case 'calculator': return <CalculatorApp />;
      case 'image-viewer': return <ImageViewerApp payload={payload} />;
      case 'settings': return <SettingsApp />;
      case 'trash': return <TrashApp />;
      case 'about': return <div className="p-6 text-center">NOVA OS v2.0<br/>By Antigravity</div>;
      default: return <div className="p-4 text-red-400">App not found: {appId}</div>;
    }
  };

  return (
    <>
      {windows.map((win) => {
        const app = getApp(win.appId);
        if (!app) return null;

        return (
          <Window
            key={win.id}
            instance={win}
          >
            {renderAppContent(win.appId, win.payload)}
          </Window>
        );
      })}
    </>
  );
};
