import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useFileSystemStore, ROOT_DIR_ID } from '@/stores/fsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { OS_VERSION } from '@/config/apps';
import type { FileSystemNode } from '@/types';

export const TerminalApp: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  
  const fsStore = useFileSystemStore();

  const currentDir = useRef<string>(ROOT_DIR_ID);
  const currentPathStr = useRef<string>('~');
  
  const currentInput = useRef('');
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef(-1);

  const initFs = async () => {
    // Start at Documents by default
    const documents = await fsStore.resolvePath('/Documents');
    if (documents) {
      currentDir.current = documents.id;
      currentPathStr.current = '~/Documents';
    }
  };

  const getPrompt = () => {
    const user = useSettingsStore.getState().settings.username;
    return `\x1b[1;32m${user}@nova\x1b[0m:\x1b[1;34m${currentPathStr.current}\x1b[0m$ `;
  };

  const printLine = (text: string) => {
    term.current?.write(text + '\r\n');
  };

  const prompt = () => {
    term.current?.write(getPrompt());
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    term.current = new Terminal({
      theme: {
        background: '#0a0b0f', // nova-dark
        foreground: '#ffffff',
        cursor: '#7c3aed', // accent
        selectionBackground: 'rgba(124, 58, 237, 0.3)',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontSize: 14,
      cursorBlink: true,
      scrollback: 1000,
    });

    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);
    term.current.loadAddon(new WebLinksAddon());

    term.current.open(terminalRef.current);
    
    // Fit needs a tiny delay to measure correctly in flex containers
    setTimeout(() => {
      fitAddon.current?.fit();
    }, 50);

    initFs().then(() => {
      printLine(`NOVA OS v${OS_VERSION} (WebAssembly/V8)`);
      printLine(`Type 'help' to see available commands.`);
      printLine('');
      prompt();
    });

    term.current.onKey(({ key, domEvent }) => {
      const ev = domEvent as KeyboardEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.key === 'Enter') {
        const cmd = currentInput.current.trim();
        printLine('');
        if (cmd.length > 0) {
          commandHistory.current.push(cmd);
          historyIndex.current = commandHistory.current.length;
          executeCommand(cmd).then(() => {
            currentInput.current = '';
            prompt();
          });
        } else {
          prompt();
        }
      } else if (ev.key === 'Backspace') {
        if (currentInput.current.length > 0) {
          currentInput.current = currentInput.current.slice(0, -1);
          term.current?.write('\b \b');
        }
      } else if (ev.key === 'ArrowUp') {
        if (historyIndex.current > 0) {
          historyIndex.current -= 1;
          const histCmd = commandHistory.current[historyIndex.current];
          // Clear current line
          term.current?.write('\x1b[2K\r');
          term.current?.write(getPrompt() + histCmd);
          currentInput.current = histCmd;
        }
      } else if (ev.key === 'ArrowDown') {
        if (historyIndex.current < commandHistory.current.length - 1) {
          historyIndex.current += 1;
          const histCmd = commandHistory.current[historyIndex.current];
          term.current?.write('\x1b[2K\r');
          term.current?.write(getPrompt() + histCmd);
          currentInput.current = histCmd;
        } else {
          historyIndex.current = commandHistory.current.length;
          term.current?.write('\x1b[2K\r');
          term.current?.write(getPrompt());
          currentInput.current = '';
        }
      } else if (printable) {
        currentInput.current += key;
        term.current?.write(key);
      }
    });

    const handleResize = () => fitAddon.current?.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.current?.dispose();
    };
  }, []);

  const executeCommand = async (commandLine: string) => {
    const args = commandLine.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(a => a.replace(/(^"|"$)/g, '')) || [];
    if (args.length === 0) return;

    const cmd = args[0].toLowerCase();
    
    switch (cmd) {
      case 'help':
        printLine('Available commands:');
        printLine('  ls         List directory contents');
        printLine('  cd         Change directory');
        printLine('  pwd        Print working directory');
        printLine('  cat        Print file contents');
        printLine('  mkdir      Create a new directory');
        printLine('  touch      Create an empty file');
        printLine('  rm         Remove a file or directory');
        printLine('  whoami     Print current user');
        printLine('  echo       Print text');
        printLine('  clear, cls Clear terminal');
        printLine('  date       Print current date and time');
        printLine('  history    Print command history');
        printLine('  neofetch   System information');
        break;

      case 'clear':
      case 'cls':
        term.current?.clear();
        break;

      case 'pwd':
        const pwdStr = await fsStore.getPathString(currentDir.current);
        printLine(pwdStr);
        break;

      case 'whoami':
        printLine(useSettingsStore.getState().settings.username);
        break;

      case 'date':
        printLine(new Date().toString());
        break;

      case 'echo':
        printLine(args.slice(1).join(' '));
        break;

      case 'history':
        commandHistory.current.forEach((c, i) => printLine(`  ${i + 1}  ${c}`));
        break;

      case 'neofetch':
        const user = useSettingsStore.getState().settings.username;
        printLine(`\x1b[1;36m       .---.\x1b[0m          \x1b[1;32m${user}\x1b[0m@\x1b[1;32mnova\x1b[0m`);
        printLine(`\x1b[1;36m      /     \\\x1b[0m         -------------`);
        printLine(`\x1b[1;36m      \\.@-@./\x1b[0m         \x1b[1;33mOS\x1b[0m: NOVA OS v${OS_VERSION}`);
        printLine(`\x1b[1;36m      /\\_-_/\\\x1b[0m         \x1b[1;33mKernel\x1b[0m: WebAssembly/V8`);
        printLine(`\x1b[1;36m    //  _  \\\\ \x1b[0m        \x1b[1;33mShell\x1b[0m: nova-sh`);
        printLine(`\x1b[1;36m   | \\     / |\x1b[0m        \x1b[1;33mResolution\x1b[0m: ${window.innerWidth}x${window.innerHeight}`);
        printLine(`\x1b[1;36m   \\_\\_'-'_/_/\x1b[0m        \x1b[1;33mTerminal\x1b[0m: xterm.js`);
        break;

      case 'ls':
        const list = await fsStore.listDirectory(currentDir.current);
        if (list.length === 0) break;
        let out = '';
        list.forEach(node => {
          if (node.trashedAt) return;
          if (node.type === 'folder') {
            out += `\x1b[1;34m${node.name}\x1b[0m  `; // blue for folder
          } else {
            out += `${node.name}  `;
          }
        });
        printLine(out);
        break;

      case 'cd':
        if (args.length < 2) {
          currentDir.current = ROOT_DIR_ID;
          currentPathStr.current = '~';
          break;
        }
        
        let target = args[1];
        if (target === '~') {
          currentDir.current = ROOT_DIR_ID;
          currentPathStr.current = '~';
          break;
        }

        if (target === '..') {
          if (currentDir.current !== ROOT_DIR_ID) {
            const current = await fsStore.getNode(currentDir.current);
            if (current?.parentId) {
              currentDir.current = current.parentId;
              currentPathStr.current = (await fsStore.getPathString(current.parentId)).replace(/^\//, '~/');
            }
          }
          break;
        }

        const nodes = await fsStore.listDirectory(currentDir.current);
        const nextFolder = nodes.find(n => n.name === target && n.type === 'folder');
        if (nextFolder) {
          currentDir.current = nextFolder.id;
          currentPathStr.current = (await fsStore.getPathString(nextFolder.id)).replace(/^\//, '~/');
        } else {
          printLine(`cd: ${target}: No such file or directory`);
        }
        break;

      case 'cat':
        if (args.length < 2) {
          printLine('cat: missing operand');
          break;
        }
        const catNodes = await fsStore.listDirectory(currentDir.current);
        const catFile = catNodes.find(n => n.name === args[1]);
        if (!catFile) {
          printLine(`cat: ${args[1]}: No such file or directory`);
        } else if (catFile.type === 'folder') {
          printLine(`cat: ${args[1]}: Is a directory`);
        } else {
          const content = catFile.content || '';
          content.split('\n').forEach(line => printLine(line));
        }
        break;

      case 'mkdir':
        if (args.length < 2) {
          printLine('mkdir: missing operand');
          break;
        }
        await fsStore.createFolder(currentDir.current, args[1]);
        break;

      case 'touch':
        if (args.length < 2) {
          printLine('touch: missing operand');
          break;
        }
        await fsStore.createFile(currentDir.current, args[1]);
        break;

      case 'rm':
        if (args.length < 2) {
          printLine('rm: missing operand');
          break;
        }
        const rmNodes = await fsStore.listDirectory(currentDir.current);
        const rmFile = rmNodes.find(n => n.name === args[1]);
        if (rmFile) {
          await fsStore.deleteNode(rmFile.id);
        } else {
          printLine(`rm: ${args[1]}: No such file or directory`);
        }
        break;

      default:
        printLine(`nova-sh: command not found: ${cmd}`);
    }
  };

  return (
    <div className="w-full h-full bg-nova-dark p-1 terminal-container flex flex-col">
      <div ref={terminalRef} className="flex-1" />
    </div>
  );
};
