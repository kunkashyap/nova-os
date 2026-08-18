import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useFileSystemStore } from '@/stores/fsStore';
import * as Icons from 'lucide-react';

export const TextEditorApp: React.FC<{ payload?: { path?: string } }> = ({ payload }) => {
  const { getNode, updateFileContent } = useFileSystemStore();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled.txt');
  const [isModified, setIsModified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);

  useEffect(() => {
    if (payload?.path) {
      load(payload.path);
    }
  }, [payload?.path]);

  const load = async (id: string) => {
    setIsLoading(true);
    const node = await getNode(id);
    if (node && node.type === 'file') {
      setFileId(node.id);
      setFileName(node.name);
      setContent(node.content || '');
      setIsModified(false);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (fileId) {
      await updateFileContent(fileId, content);
      setIsModified(false);
    } else {
      alert('Save As feature coming soon for new files!');
    }
  };

  const getLanguage = (name: string) => {
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript';
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript';
    if (name.endsWith('.json')) return 'json';
    if (name.endsWith('.css')) return 'css';
    if (name.endsWith('.html')) return 'html';
    if (name.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  if (isLoading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: '#111111' }}
      >
        <Icons.Loader2
          size={18}
          strokeWidth={1.5}
          className="animate-void-spin"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#111111' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 flex-shrink-0"
        style={{
          height: '40px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#0D0D0D',
          padding: '0 10px',
        }}
      >
        <button
          onClick={handleSave}
          className="flex items-center gap-[6px] transition-colors duration-100 cursor-pointer"
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'transparent',
            border: '1px solid transparent',
            color: 'rgba(255,255,255,0.50)',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.80)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.50)';
          }}
        >
          <Icons.Save size={12} strokeWidth={1.5} />
          <span>Save</span>
        </button>

        <div
          style={{
            width: '1px',
            height: '14px',
            background: 'rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        />

        {/* File name + modified indicator */}
        <span
          className="flex-1 text-center pointer-events-none select-none truncate"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '11.5px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.35)',
            paddingRight: '48px',
          }}
        >
          {fileName}
          {isModified && (
            <span style={{ marginLeft: '5px', color: 'rgba(255,255,255,0.25)' }}>·</span>
          )}
        </span>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 w-full relative" style={{ background: '#0A0A0A' }}>
        <Editor
          theme="vs-dark"
          language={getLanguage(fileName)}
          value={content}
          onChange={(val) => {
            setContent(val || '');
            setIsModified(true);
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 22,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorStyle: 'line',
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
            },
          }}
          loading={
            <div className="w-full h-full flex items-center justify-center" style={{ background: '#0A0A0A' }}>
              <Icons.Loader2
                size={18}
                strokeWidth={1.5}
                className="animate-void-spin"
                style={{ color: 'rgba(255,255,255,0.20)' }}
              />
            </div>
          }
        />
      </div>
    </div>
  );
};
