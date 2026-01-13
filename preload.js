const { contextBridge, ipcRenderer } = require('electron');

const TIMERS = {
    1: { id: 1, name: 'Туалеты', duration: 35, hint: 'Кабинки в туалете' },
    2: { id: 2, name: 'Мойка полов', duration: 55, hint: 'Швабра в коридоре' },
    3: { id: 3, name: 'Подмести полы', duration: 75, hint: 'Метла на улице' }
};

contextBridge.exposeInMainWorld('electronAPI', {
    TIMERS: TIMERS,
    toggleIgnoreMouseEvents: (ignore) => ipcRenderer.send('set-ignore-mouse-events', ignore, { forward: true }),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    resizeWindow: (width, height) => ipcRenderer.send('resize-window', width, height),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    onClickThroughState: (callback) => ipcRenderer.on('click-through-state', (event, state) => callback(state))
});
