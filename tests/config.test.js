const ConfigManager = require('../config');
const fs = require('fs');

jest.mock('fs');

describe('ConfigManager', () => {
    const mockPath = '/mock/user/data';
    let configManager;

    beforeEach(() => {
        configManager = new ConfigManager(mockPath);
        jest.clearAllMocks();
    });

    it('should initialize with default config', () => {
        expect(configManager.get()).toHaveProperty('opacity', 0.75);
        expect(configManager.get().hotkeys).toHaveProperty('timer1', 'Alt+2');
    });

    it('should load config from file if exists', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(JSON.stringify({ opacity: 0.5 }));

        configManager.load();
        expect(configManager.get().opacity).toBe(0.5);
    });

    it('should fall back to defaults if file does not exist', () => {
        fs.existsSync.mockReturnValue(false);

        configManager.load();
        expect(configManager.get().opacity).toBe(0.75);
    });

    it('should save config to file', () => {
        const newConfig = { opacity: 0.9 };
        configManager.save(newConfig);

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('config.json'),
            expect.stringContaining('"opacity": 0.9')
        );
        expect(configManager.get().opacity).toBe(0.9);
    });
});
