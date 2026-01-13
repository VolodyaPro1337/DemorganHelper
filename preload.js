const { contextBridge, ipcRenderer } = require('electron');

const TIMERS = {
    1: { id: 1, name: 'Туалеты', duration: 35, hint: 'Кабинки в туалете' },
    2: { id: 2, name: 'Мойка полов', duration: 55, hint: 'Швабра в коридоре' },
    3: { id: 3, name: 'Подмести полы', duration: 75, hint: 'Метла на улице' }
};

contextBridge.exposeInMainWorld('electronAPI', {
    TIMERS: TIMERS,
    toggleIgnoreMouseEvents: (ignore) => ipcRenderer.send('set-ignore-mouse-events', ignore, { forward: true }),
    saveSettings: (config) => ipcRenderer.invoke('save-settings', config),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    onTriggerTimer: (callback) => ipcRenderer.on('trigger-timer', (event, id) => callback(id)),
    onClickThroughState: (callback) => ipcRenderer.on('click-through-state', (event, state) => callback(state))
});
