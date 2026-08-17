import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useFileSystemStore } from '@/stores/fsStore';
import * as Icons from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';

export const TextEditorApp: React.FC<{ payload?: { path?: string } }> = ({ payload }) => {
  const { getNode, updateFileContent } = useFileSystemStore();
  const { updateWindowRect } = useWindowStore(); // Just to access windows state indirectly if needed, but not strictly required
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
      // In a full implementation, this would trigger a "Save As" file picker dialogue
      // For now, we'll just alert that a Save As feature is needed for untitled files
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
    return <div className="w-full h-full flex items-center justify-center bg-nova-surface"><Icons.Loader2 className="animate-spin text-nova-text-dim" /></div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-nova-surface">
      {/* Menu Bar */}
      <div className="h-10 border-b border-nova-border flex items-center px-2 gap-2 bg-nova-surface-2 flex-shrink-0">
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-sm text-nova-text transition-colors"
        >
          <Icons.Save size={14} />
          <span>Save</span>
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <span className="text-xs text-nova-text-dim flex-1 text-center pr-12 pointer-events-none">
          {fileName} {isModified ? '•' : ''}
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1 w-full bg-nova-surface relative">
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
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            wordWrap: 'on',
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
          }}
          loading={<Icons.Loader2 className="animate-spin text-nova-text-dim absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
        />
      </div>
    </div>
  );
};
