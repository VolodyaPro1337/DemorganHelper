// Generate UUID for new timers
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const appEl = document.getElementById('app');
const timersContainer = document.getElementById('timers-container');
const statusDot = document.getElementById('status-indicator');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('cancel-settings');
const saveBtn = document.getElementById('save-settings');
const cancelBtn = document.getElementById('cancel-settings');

const opacitySlider = document.getElementById('opacity-slider');
const scaleSlider = document.getElementById('scale-slider');
const soundToggle = document.getElementById('sound-toggle');

const themeSelect = document.getElementById('theme-select');
const compactToggle = document.getElementById('compact-toggle');
const infoToggle = document.getElementById('info-toggle');
const infoPanel = document.getElementById('info-panel');

const hotkeyInputs = {
    toggleClickThrough: document.getElementById('hotkey-ct'),
    toggleVisibility: document.getElementById('hotkey-vis')
};

// New Timer Form Elements
const timersListEl = document.getElementById('timers-settings-list');
const newTimerName = document.getElementById('new-timer-name');
const newTimerDuration = document.getElementById('new-timer-duration');
const newTimerHint = document.getElementById('new-timer-hint');
const newTimerHotkey = document.getElementById('new-timer-hotkey');
const addTimerBtn = document.getElementById('add-timer-btn');

async function init() {
    try {
        settings = await window.electronAPI.loadSettings();
        console.log('Settings loaded in init:', settings);
        applySettings();

        window.electronAPI.onTriggerTimer((id) => {
            console.log('Renderer received trigger-timer event for id:', id);
            // alert('Renderer received signal for ID: ' + id);
            startTimer(id);
        });

        window.electronAPI.onClickThroughState((isClickThrough) => {
            if (isClickThrough) {
                appEl.classList.add('click-through');
            } else {
                appEl.classList.remove('click-through');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Alt') {
                if (!appEl.classList.contains('click-through')) {
                    document.body.classList.add('draggable');
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Alt') {
                document.body.classList.remove('draggable');
            }
        });

        settingsBtn.addEventListener('click', () => {
            populateSettingsUI();
            settingsModal.classList.remove('hidden');
        });

        cancelBtn.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });

        saveBtn.addEventListener('click', async () => {
            const newSettings = {
                opacity: parseFloat(opacitySlider.value),
                scale: parseFloat(scaleSlider.value),
                soundsEnabled: soundToggle.checked,
                theme: themeSelect.value,
                compactMode: compactToggle.checked,
                showInfo: infoToggle.checked,

                // Preserve existing timers array which is modified in real-time in the UI
                timers: settings.timers,

                hotkeys: {
                    toggleClickThrough: hotkeyInputs.toggleClickThrough.value,
                    toggleVisibility: hotkeyInputs.toggleVisibility.value
                    // Timer hotkeys are now stored in the timers array
                }
            };

            await window.electronAPI.saveSettings(newSettings);
            settings = newSettings;
            applySettings();
            settingsModal.classList.add('hidden');
        });

        setupHotkeyInput(hotkeyInputs.toggleClickThrough);
        setupHotkeyInput(hotkeyInputs.toggleVisibility);
        setupHotkeyInput(newTimerHotkey);

        addTimerBtn.addEventListener('click', addNewTimer);

    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function setupHotkeyInput(input) {
    if (!input) return;
    input.addEventListener('keydown', (e) => {
        e.preventDefault();
        const keys = [];
        if (e.metaKey) keys.push('Command');
        if (e.ctrlKey) keys.push('Ctrl');
        if (e.altKey) keys.push('Alt');
        if (e.shiftKey) keys.push('Shift');

        if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

        let key = e.key.toUpperCase();
        if (key === ' ') key = 'Space';

        keys.push(key);
        input.value = keys.join('+');
    });

    input.addEventListener('focus', () => input.classList.add('recording'));
    input.addEventListener('blur', () => input.classList.remove('recording'));
}

function populateSettingsUI() {
    opacitySlider.value = settings.opacity;
    scaleSlider.value = settings.scale;
    soundToggle.checked = settings.soundsEnabled;

    themeSelect.value = settings.theme || 'default';
    compactToggle.checked = settings.compactMode || false;
    infoToggle.checked = settings.showInfo !== false;

    hotkeyInputs.toggleClickThrough.value = settings.hotkeys.toggleClickThrough;
    hotkeyInputs.toggleVisibility.value = settings.hotkeys.toggleVisibility;

    renderTimersList();
}

function renderTimersList() {
    if (!settings.timers) settings.timers = [];
    timersListEl.innerHTML = '';

    settings.timers.forEach((timer, index) => {
        const item = document.createElement('div');
        item.className = 'timer-setting-item';
        item.innerHTML = `
            <div class="timer-setting-info">
                <span class="timer-setting-name">${timer.name} (${timer.duration}s)</span>
                <span class="timer-setting-details">Key: ${timer.hotkey} | Hint: ${timer.hint || '-'}</span>
            </div>
            <button class="delete-timer-btn" data-index="${index}">Delete</button>
        `;
        timersListEl.appendChild(item);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-timer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            settings.timers.splice(index, 1);
            renderTimersList();
        });
    });
}

function addNewTimer() {
    const name = newTimerName.value.trim();
    const duration = parseInt(newTimerDuration.value);
    const hotkey = newTimerHotkey.value.trim();
    const hint = newTimerHint.value.trim();

    if (!name || !duration || !hotkey) {
        alert('Please fill in Name, Duration and Hotkey');
        return;
    }

    settings.timers.push({
        id: generateUUID(),
        name,
        duration,
        hint,
        hotkey
    });

    // Clear form
    newTimerName.value = '';
    newTimerDuration.value = '';
    newTimerHint.value = '';
    newTimerHotkey.value = '';

    renderTimersList();
}

function applySettings() {
    document.documentElement.style.setProperty('--scale', settings.scale || 1.0);

    const themes = {
        'default': {
            '--bg-color': 'rgba(0, 0, 0, 0.7)',
            '--text-color': '#fff',
            '--border-color': 'rgba(255, 255, 255, 0.1)',
            '--button-bg': 'rgba(255, 255, 255, 0.1)',
            '--modal-bg': 'rgba(20, 20, 20, 0.98)',
            '--timer-green': '#4caf50',
            '--timer-yellow': '#ff9800',
            '--timer-red': '#f44336'
        },
        'blue': {
            '--bg-color': 'rgba(13, 25, 42, 0.9)',
            '--text-color': '#e3f2fd',
            '--border-color': 'rgba(33, 150, 243, 0.3)',
            '--button-bg': 'rgba(33, 150, 243, 0.2)',
            '--modal-bg': 'rgba(10, 20, 35, 0.98)',
            '--timer-green': '#2196f3',
            '--timer-yellow': '#03a9f4',
            '--timer-red': '#00bcd4'
        },
        'purple': {
            '--bg-color': 'rgba(20, 10, 30, 0.9)',
            '--text-color': '#f3e5f5',
            '--border-color': 'rgba(156, 39, 176, 0.3)',
            '--button-bg': 'rgba(156, 39, 176, 0.2)',
            '--modal-bg': 'rgba(25, 10, 35, 0.98)',
            '--timer-green': '#9c27b0',
            '--timer-yellow': '#ba68c8',
            '--timer-red': '#e1bee7'
        },
        'neon': {
            '--bg-color': 'rgba(0, 0, 0, 0.85)',
            '--text-color': '#fff',
            '--border-color': '#39ff14',
            '--button-bg': 'rgba(57, 255, 20, 0.15)',
            '--modal-bg': 'rgba(0, 0, 0, 0.95)',
            '--timer-green': '#39ff14',
            '--timer-yellow': '#ff00ff',
            '--timer-red': '#00ffff'
        }
    };

    const currentTheme = themes[settings.theme] || themes['default'];
    Object.entries(currentTheme).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
    });
    if (settings.compactMode) {
        document.body.classList.add('compact');
    } else {
        document.body.classList.remove('compact');
    }

    if (settings.showInfo !== false) {
        infoPanel.classList.remove('hidden');
    } else {
        infoPanel.classList.add('hidden');
    }
    updateInfoPanel();

    // Adaptive resizing based on scale
    const baseWidth = 450;
    const baseHeight = 500;
    const newWidth = baseWidth * settings.scale;
    const newHeight = baseHeight * settings.scale;
    window.electronAPI.resizeWindow(newWidth, newHeight);
}

function updateInfoPanel() {
    const grid = infoPanel.querySelector('.info-grid');
    if (!grid) return;

    const hotkeys = settings.hotkeys;

    let html = '';

    // Configured Timers
    if (settings.timers) {
        settings.timers.forEach(timer => {
            html += `<span>${timer.hotkey}: ${timer.name}</span>`;
        });
    }

    // Static Global Hotkeys
    if (hotkeys.toggleClickThrough) html += `<span>${hotkeys.toggleClickThrough}: Click-Through</span>`;
    if (hotkeys.toggleVisibility) html += `<span>${hotkeys.toggleVisibility}: Hide/Show</span>`;

    grid.innerHTML = html;
}

function startTimer(id) {
    // Look up timer in settings.timers
    // console.log('startTimer called with id:', id);
    // console.log('Current settings.timers:', settings.timers);

    const def = settings.timers.find(t => t.id === id || String(t.id) === String(id));
    if (!def) {
        alert('Timer NOT FOUND for id: ' + id);
        console.error('Timer not found for id:', id);
        return;
    }
    // alert('Starting timer: ' + def.name);

    // If timer exists, remove it first (restart behavior)
    if (timers[id]) {
        clearInterval(timers[id].interval);
        if (timers[id].el) timers[id].el.remove();
        delete timers[id];
    }

    const el = document.createElement('div');
    el.className = 'timer green';
    el.dataset.id = id;

    el.innerHTML = `
        <div class="timer-content">
            <div class="timer-header">
                <span>${def.name}</span>
                <button class="close-timer" title="Remove">×</button>
            </div>
            <span class="hint">${def.hint || ''}</span>
            <span class="time">${def.duration}s</span>
        </div>
        <div class="progress-bar" style="width: 100%;"></div>
    `;
    timersContainer.appendChild(el);

    // Add close button handler
    const closeBtn = el.querySelector('.close-timer');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent drag or other events
        if (timers[id]) {
            clearInterval(timers[id].interval);
            delete timers[id];
        }
        el.remove();
    });

    let remaining = def.duration;

    const intervalId = setInterval(() => {
        remaining--;

        el.querySelector('.time').textContent = remaining + 's';

        const percent = (remaining / def.duration) * 100;
        el.querySelector('.progress-bar').style.width = percent + '%';
        if (percent > 50) el.className = 'timer green';
        else if (percent > 20) el.className = 'timer yellow';
        else el.className = 'timer red';

        if (remaining <= 0) {
            clearInterval(timers[id].interval);
            delete timers[id];
            timerFinished(el);
        }
    }, 1000);

    timers[id] = { interval: intervalId, el: el };
}

function timerFinished(el) {
    el.classList.add('finish-pulse');
    el.querySelector('.time').textContent = 'Готово!';

    // Remove close button when finished
    const closeBtn = el.querySelector('.close-timer');
    if (closeBtn) closeBtn.remove();

    if (settings.soundsEnabled) {
    }

    setTimeout(() => {
        el.remove();
    }, 3000);
}

init();
