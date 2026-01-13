const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor(userDataPath) {
        this.path = path.join(userDataPath, 'config.json');
        this.defaults = {
            opacity: 0.75,
            scale: 1.0,
            soundsEnabled: false,
            theme: 'default',
            compactMode: false,
            showInfo: true,
            hotkeys: {
                toggleClickThrough: 'Alt+X',
                toggleVisibility: 'Alt+V',
                timer1: 'Alt+1',
                timer2: 'Alt+2',
                timer3: 'Alt+3'
            },
            windowBounds: { x: undefined, y: undefined, width: 500, height: 600 }
        };
        this.config = { ...this.defaults };
    }

    load() {
        try {
            if (fs.existsSync(this.path)) {
                const loaded = JSON.parse(data);
                this.config = {
                    ...this.defaults,
                    ...loaded,
                    hotkeys: { ...this.defaults.hotkeys, ...(loaded.hotkeys || {}) }
                };
            }
        } catch (e) {
            console.error('Failed to load config:', e);
        }
        return this.config;
    }

    save(newConfig) {
        try {
            this.config = { ...this.config, ...newConfig };
            fs.writeFileSync(this.path, JSON.stringify(this.config, null, 2));
            return true;
        } catch (e) {
            console.error('Failed to save config:', e);
            return false;
        }
    }

    get() {
        return this.config;
    }
}

module.exports = ConfigManager;
