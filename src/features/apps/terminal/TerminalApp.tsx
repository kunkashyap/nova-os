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
    const documents = await fsStore.resolvePath('/Documents');
    if (documents) {
      currentDir.current = documents.id;
      currentPathStr.current = '~/Documents';
    }
  };

  // VOID monochrome prompt: no green/blue, just white/gray
  const getPrompt = () => {
    const user = useSettingsStore.getState().settings.username;
    return `\x1b[0;37m${user}@nova\x1b[0m \x1b[2;37m${currentPathStr.current}\x1b[0m \x1b[0;37m%\x1b[0m `;
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
        background: '#050505',
        foreground: '#D4D4D4',
        cursor: '#F5F5F5',
        cursorAccent: '#050505',
        selectionBackground: 'rgba(255,255,255,0.15)',
        black: '#111111',
        brightBlack: '#383838',
        white: '#D4D4D4',
        brightWhite: '#F5F5F5',
        red: '#A3A3A3',
        brightRed: '#D4D4D4',
        green: '#A3A3A3',
        brightGreen: '#D4D4D4',
        yellow: '#C8C8C8',
        brightYellow: '#E8E8E8',
        blue: '#A3A3A3',
        brightBlue: '#D4D4D4',
        magenta: '#A3A3A3',
        brightMagenta: '#D4D4D4',
        cyan: '#C0C0C0',
        brightCyan: '#E0E0E0',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 1000,
      allowTransparency: true,
    });

    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);
    term.current.loadAddon(new WebLinksAddon());

    term.current.open(terminalRef.current);

    setTimeout(() => {
      fitAddon.current?.fit();
    }, 50);

    initFs().then(() => {
      printLine(`\x1b[2;37mNOVA OS v${OS_VERSION}\x1b[0m`);
      printLine(`\x1b[2;37mType 'help' to see available commands.\x1b[0m`);
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
        printLine('\x1b[2;37mAvailable commands:\x1b[0m');
        const cmds = [
          ['ls',      'List directory contents'],
          ['cd',      'Change directory'],
          ['pwd',     'Print working directory'],
          ['cat',     'Print file contents'],
          ['mkdir',   'Create a new directory'],
          ['touch',   'Create an empty file'],
          ['rm',      'Remove a file or directory'],
          ['whoami',  'Print current user'],
          ['echo',    'Print text'],
          ['clear',   'Clear terminal'],
          ['date',    'Print current date and time'],
          ['history', 'Print command history'],
          ['neofetch','System information'],
        ];
        cmds.forEach(([c, d]) => {
          printLine(`  \x1b[0;37m${c.padEnd(12)}\x1b[0m\x1b[2;37m${d}\x1b[0m`);
        });
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
        commandHistory.current.forEach((c, i) => {
          printLine(`  \x1b[2;37m${String(i + 1).padStart(3)}\x1b[0m  ${c}`);
        });
        break;

      case 'neofetch':
        const user = useSettingsStore.getState().settings.username;
        printLine(`\x1b[0;37m       .---.         \x1b[0m  \x1b[1;37m${user}\x1b[0m\x1b[2;37m@nova\x1b[0m`);
        printLine(`\x1b[0;37m      /     \\        \x1b[0m  \x1b[2;37m──────────────\x1b[0m`);
        printLine(`\x1b[0;37m      \\.@-@./        \x1b[0m  \x1b[0;37mOS\x1b[0m      \x1b[2;37mNOVA OS v${OS_VERSION} VOID\x1b[0m`);
        printLine(`\x1b[0;37m      /\\_-_/\\        \x1b[0m  \x1b[0;37mKernel\x1b[0m  \x1b[2;37mWebAssembly/V8\x1b[0m`);
        printLine(`\x1b[0;37m    //  _  \\\\       \x1b[0m  \x1b[0;37mShell\x1b[0m   \x1b[2;37mnova-sh\x1b[0m`);
        printLine(`\x1b[0;37m   | \\     / |      \x1b[0m  \x1b[0;37mRes\x1b[0m     \x1b[2;37m${window.innerWidth}x${window.innerHeight}\x1b[0m`);
        printLine(`\x1b[0;37m   \\_\\_'-'_/_/      \x1b[0m  \x1b[0;37mTerm\x1b[0m    \x1b[2;37mxterm.js\x1b[0m`);
        break;

      case 'ls':
        const list = await fsStore.listDirectory(currentDir.current);
        if (list.length === 0) break;
        let out = '';
        list.forEach(node => {
          if (node.trashedAt) return;
          if (node.type === 'folder') {
            out += `\x1b[0;37m${node.name}/\x1b[0m  `;
          } else {
            out += `\x1b[2;37m${node.name}\x1b[0m  `;
          }
        });
        if (out) printLine(out);
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
          printLine(`\x1b[2;37mcd: ${target}: No such file or directory\x1b[0m`);
        }
        break;

      case 'cat':
        if (args.length < 2) { printLine('\x1b[2;37mcat: missing operand\x1b[0m'); break; }
        const catNodes = await fsStore.listDirectory(currentDir.current);
        const catFile = catNodes.find(n => n.name === args[1]);
        if (!catFile) {
          printLine(`\x1b[2;37mcat: ${args[1]}: No such file or directory\x1b[0m`);
        } else if (catFile.type === 'folder') {
          printLine(`\x1b[2;37mcat: ${args[1]}: Is a directory\x1b[0m`);
        } else {
          const content = catFile.content || '';
          content.split('\n').forEach(line => printLine(line));
        }
        break;

      case 'mkdir':
        if (args.length < 2) { printLine('\x1b[2;37mmkdir: missing operand\x1b[0m'); break; }
        await fsStore.createFolder(currentDir.current, args[1]);
        break;

      case 'touch':
        if (args.length < 2) { printLine('\x1b[2;37mtouch: missing operand\x1b[0m'); break; }
        await fsStore.createFile(currentDir.current, args[1]);
        break;

      case 'rm':
        if (args.length < 2) { printLine('\x1b[2;37mrm: missing operand\x1b[0m'); break; }
        const rmNodes = await fsStore.listDirectory(currentDir.current);
        const rmFile = rmNodes.find(n => n.name === args[1]);
        if (rmFile) {
          await fsStore.deleteNode(rmFile.id);
        } else {
          printLine(`\x1b[2;37mrm: ${args[1]}: No such file or directory\x1b[0m`);
        }
        break;

      default:
        printLine(`\x1b[2;37mnova-sh: command not found: ${cmd}\x1b[0m`);
    }
  };

  return (
    <div
      className="w-full h-full terminal-container flex flex-col"
      style={{ background: '#050505' }}
    >
      <div ref={terminalRef} className="flex-1" />
    </div>
  );
};
