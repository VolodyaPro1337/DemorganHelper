const { app, BrowserWindow, ipcMain, globalShortcut, screen, Tray, Menu } = require('electron');
const path = require('path');
const ConfigManager = require('./config');

let mainWindow;
let tray = null;
let isClickThrough = false;
let configManager;

function initializeConfig() {
    configManager = new ConfigManager(app.getPath('userData'));
    configManager.load();
}

function createTray() {
    const iconPath = path.join(__dirname, 'icon.png');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show/Hide',
            click: () => {
                if (mainWindow) {
                    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
                }
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('DemorganHelper');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        }
    });
}

function createWindow() {
    const config = configManager.get();
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const bounds = config.windowBounds || { x: undefined, y: undefined };

    mainWindow = new BrowserWindow({
        width: bounds.width || 450,
        height: bounds.height || 500,
        x: bounds.x || width - 400,
        y: bounds.y || 50,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: true,
        hasShadow: false,
        skipTaskbar: true,
        type: 'toolbar',
        focusable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setVisibleOnAllWorkspaces(true);
    mainWindow.loadFile('renderer/index.html');
    mainWindow.setOpacity(config.opacity);

    setClickThrough(false);

    // mainWindow.webContents.openDevTools({ mode: 'detach' }); // Basic detach
    mainWindow.webContents.openDevTools();

    const saveBounds = () => {
        if (mainWindow) {
            const bounds = mainWindow.getBounds();
            configManager.save({ windowBounds: bounds });
        }
    };

    mainWindow.on('moved', saveBounds);
    mainWindow.on('resized', saveBounds);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


function setClickThrough(ignore) {
    isClickThrough = ignore;
    if (mainWindow) {
        if (ignore) {
            mainWindow.setIgnoreMouseEvents(true, { forward: true });
        } else {
            mainWindow.setIgnoreMouseEvents(false);
        }
        mainWindow.webContents.send('click-through-state', ignore);
    }
}

app.whenReady().then(() => {
    initializeConfig();
    createWindow();
    createTray();

    registerShortcuts();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

function registerShortcuts() {
    const config = configManager.get();
    console.log('Registering shortcuts. Config timers:', config.timers);
    globalShortcut.unregisterAll();

    globalShortcut.register(config.hotkeys.toggleClickThrough, () => {
        setClickThrough(!isClickThrough);
    });
    globalShortcut.register(config.hotkeys.toggleVisibility, () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
            }
        }
    });

    if (config.timers && Array.isArray(config.timers)) {
        config.timers.forEach(timer => {
            if (timer.hotkey) {
                try {
                    console.log(`Registering hotkey ${timer.hotkey} for timer ${timer.id}`);
                    const ret = globalShortcut.register(timer.hotkey, () => {
                        console.log(`Hotkey ${timer.hotkey} pressed. Sending trigger-timer for id ${timer.id}`);
                        if (mainWindow) {
                            mainWindow.webContents.send('trigger-timer', timer.id);
                        } else {
                            console.error('mainWindow is undefined, cannot send IPC');
                        }
                    });
                    if (!ret) {
                        console.error(`Registration failed for ${timer.hotkey}`);
                    }
                } catch (e) {
                    console.error(`Failed to register hotkey ${timer.hotkey} for timer ${timer.id}:`, e);
                }
            }
        });
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

ipcMain.handle('save-settings', (event, newConfig) => {
    configManager.save(newConfig);
    registerShortcuts();
    if (mainWindow) mainWindow.setOpacity(configManager.get().opacity);
    return true;
});

ipcMain.handle('load-settings', () => {
    return configManager.get();
});

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.setIgnoreMouseEvents(ignore, options);
});

ipcMain.on('resize-window', (event, width, height) => {
    if (mainWindow) {
        mainWindow.setSize(Math.round(width), Math.round(height));
    }
});
