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
            windowBounds: { x: undefined, y: undefined, width: 450, height: 500 }
        };
        this.config = { ...this.defaults };
    }

    load() {
        try {
            if (fs.existsSync(this.path)) {
                const parsed = JSON.parse(fs.readFileSync(this.path, 'utf8'));

                // Initialize config with defaults
                this.config = { ...this.defaults };

                // Merge hotkeys specifically to preserve defaults for unconfigured hotkeys
                if (parsed.hotkeys) {
                    this.config.hotkeys = { ...this.defaults.hotkeys, ...parsed.hotkeys };
                } else {
                    this.config.hotkeys = this.defaults.hotkeys;
                }

                // Merge other properties safely, ensuring hotkeys are not overwritten by a shallow merge
                this.config = { ...this.defaults, ...parsed, hotkeys: this.config.hotkeys };
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
