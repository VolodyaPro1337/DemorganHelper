const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    toggleIgnoreMouseEvents: (ignore) => ipcRenderer.send('set-ignore-mouse-events', ignore, { forward: true }),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    resizeWindow: (width, height) => ipcRenderer.send('resize-window', width, height),
    onTriggerTimer: (callback) => ipcRenderer.on('trigger-timer', (event, id) => callback(id)),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    onClickThroughState: (callback) => ipcRenderer.on('click-through-state', (event, state) => callback(state))
});
