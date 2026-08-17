# NOVA OS 2.0

NOVA OS is a futuristic, premium, production-grade browser-based desktop operating system simulation built with React, TypeScript, and Vite.

## Architecture

The system is built on a robust architecture:
- **Core**: React + TypeScript + Vite
- **Global State**: Zustand for Window Manager, VFS, Desktop Icons, and OS Settings
- **Virtual Filesystem (VFS)**: Persistent storage using Dexie.js (IndexedDB)
- **Window Manager**: Advanced drag/resize hooks with focus management (z-index) and bounds checking
- **Design System**: Glassmorphism, dynamic accents, and smooth transitions powered by Framer Motion and Tailwind CSS

## Applications Included

1. **Terminal**: Full virtual terminal using `xterm.js` that interacts with the VFS (`ls`, `cd`, `cat`, `mkdir`, `touch`, `rm`, `neofetch`).
2. **File Manager**: Complete file explorer with Grid/List views, navigation history, and right-click context menus.
3. **Text Editor**: Integrated Monaco editor with syntax highlighting and VFS read/write.
4. **Calculator**: Fully functional arithmetic calculator with safe evaluation.
5. **Image Viewer**: View images from the VFS with zoom, rotation, and metadata.
6. **Settings**: Customize the wallpaper, accent colors, animations, and transparency (persisted).
7. **Trash**: Manage deleted files with restore and permanent delete capabilities.
8. **Command Palette**: Press `Ctrl+K` for global fuzzy search across apps, files, and system commands.

## Running Locally

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173` in your browser.

## Project Structure
- `src/stores/` - Core OS state (fs, windows, settings, shell)
- `src/features/apps/` - The actual application binaries
- `src/window-manager/` - The dragging, resizing, and window Chrome
- `src/config/` - The OS application registry
- `src/filesystem/` - The Dexie DB instance

Enjoy exploring NOVA OS!
