# DemorganHelper

Electron-based game overlay for## Features
*   **3 Preset Timers**:
    *   Toilet (35s)
    *   Floor Wash (55s)
    *   Sweeping (75s)
*   **Visual Enhancements**:
    *   **Themes**: Default (Green), Blue, Purple, Neon.
    *   **Compact Mode**: Minimalist view with only progress bars.
    *   **Info Panel**: Helper footer with hotkeys (can be toggled).
*   **Always on Top**: Keeps the overlay visible over the game.
*   **Click-Through Mode**: Interact with the game while keeping timers visible.
*   **Global Hotkeys**: Control timers even when the app is not focused.
*   **Draggable**: Hold `Alt` to drag the window (disabled in Click-Through mode).

## Usage
1.  **Launch the App**: Run `npm start` (or the built executable).
2.  **Settings**: Click the generic 'Gear' icon or drag to position.
3.  **Start Timers**: Use hotkeys or the settings menu to remap them.
    *   `Alt+1`: Toilet
    *   `Alt+2`: Floor Wash
    *   `Alt+3`: Sweeping
4.  **Click-Through**: Press `Alt+X` to toggle. When red dot is active, clicks go through to the game.
5.  **Visibility**: Press `Alt+V` to hide/show the overlay.

## Configuration
All settings (Opacity, Scale, Themes, Hotkeys) are saved automatically.

## Installation
1.  Clone repository.
2.  Run `npm install`.
3.  Run `npm start` to launch.

## Building (for Windows)
To package the app for distribution:
1.  Install electron-builder: `npm install electron-builder --save-dev`
2.  Add build script to `package.json`: `"build": "electron-builder"`
3.  Run `npm run build`.

## Usage
- **Drag Window**: Hold `Alt` and drag the window.
- **Settings**: Click the gear icon to configure.
- **Quit**: Use system tray or task manager (Taskbar icon hidden by default).
