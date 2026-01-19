// --- DATA MODEL & LOGIC (Embedded) ---

const LOOT_TEMPLATES = {
    'gold_1': { id: 'gold_1', label: '1 Gold', img: 'assets/fh-one-coin-1361.png', payload: { gold: 1 } },
    'gold_2': { id: 'gold_2', label: '2 Gold', img: 'assets/fh-two-coins-1374.png', payload: { gold: 2 } },
    'gold_3': { id: 'gold_3', label: '3 Gold', img: 'assets/fh-three-coins-1379.png', payload: { gold: 3 } },
    'lumber_1': { id: 'lumber_1', label: '1 Lumber', img: 'assets/fh-lumber-1401.png', payload: { lumber: 1 } },
    'lumber_2': { id: 'lumber_2', label: '2 Lumber', img: 'assets/fh-lumber-1401.png', payload: { lumber: 2 } },
    'metal_1': { id: 'metal_1', label: '1 Metal', img: 'assets/fh-metal-1409.png', payload: { metal: 1 } },
    'metal_2': { id: 'metal_2', label: '2 Metal', img: 'assets/fh-metal-1409.png', payload: { metal: 2 } },
    'hide_1': { id: 'hide_1', label: '1 Hide', img: 'assets/fh-hide-1393.png', payload: { hide: 1 } },
    'hide_2': { id: 'hide_2', label: '2 Hide', img: 'assets/fh-hide-1393.png', payload: { hide: 2 } },
    'arrowvine': { id: 'arrowvine', label: 'Arrowvine', img: 'assets/fh-arrowvine-1381.png', payload: { arrowvine: 1 } },
    'axenut': { id: 'axenut', label: 'Axenut', img: 'assets/fh-axenut-1383.png', payload: { axenut: 1 } },
    'corpsecap': { id: 'corpsecap', label: 'Corpsecap', img: 'assets/fh-corpsecap-1385.png', payload: { corpsecap: 1 } },
    'flamefruit': { id: 'flamefruit', label: 'Flamefruit', img: 'assets/fh-flamefruit-1387.png', payload: { flamefruit: 1 } },
    'rockroot': { id: 'rockroot', label: 'Rockroot', img: 'assets/fh-rockroot-1389.png', payload: { rockroot: 1 } },
    'snowthistle': { id: 'snowthistle', label: 'Snowthistle', img: 'assets/fh-snowthistle-1391.png', payload: { snowthistle: 1 } },
    'random_item': { id: 'random_item', label: 'Random Item', img: 'assets/fh-random-item-1417.png', payload: {} }
};

// Definitions of the physical supply of cards available to build the deck
// Only multi-copy resources used for random draws are defined here.
// Single-card / direct groups (herbs, items, etc.) are handled separately via 'direct' type
// in BUILDER_GROUPS, so they don't need supply deck entries.
const SUPPLY_DECK = {
    'money': {
        label: 'Money',
        cards: [
            ...Array(1).fill('gold_1'),
            ...Array(6).fill('gold_2'),
            ...Array(2).fill('gold_3')
        ] // Total 9
    },
    'lumber': {
        label: 'Lumber',
        cards: [
            ...Array(2).fill('lumber_1'),
            ...Array(6).fill('lumber_2')
        ] // Total 8
    },
    'metal': {
        label: 'Metal',
        cards: [
            ...Array(2).fill('metal_1'),
            ...Array(6).fill('metal_2')
        ] // Total 8
    },
    'hide': {
        label: 'Hide',
        cards: [
            ...Array(2).fill('hide_1'),
            ...Array(5).fill('hide_2')
        ] // Total 7
    }
};

// UI Groups for the builder
const BUILDER_GROUPS = [
    { id: 'money', label: 'Money', type: 'random', max: 9 },
    { id: 'lumber', label: 'Lumber', type: 'random', max: 8 },
    { id: 'metal', label: 'Metal', type: 'random', max: 8 },
    { id: 'hide', label: 'Hide', type: 'random', max: 7 },
    { id: 'arrowvine', label: 'Arrowvine', type: 'direct' },
    { id: 'axenut', label: 'Axenut', type: 'direct' },
    { id: 'corpsecap', label: 'Corpsecap', type: 'direct' },
    { id: 'flamefruit', label: 'Flamefruit', type: 'direct' },
    { id: 'rockroot', label: 'Rockroot', type: 'direct' },
    { id: 'snowthistle', label: 'Snowthistle', type: 'direct' },
    { id: 'random_item', label: 'Random Item', type: 'direct' }
];

// Preset for Sample Demo Pool
const SAMPLE_PRESET = {
    'money': 4,
    'lumber': 2,
    'metal': 2,
    'hide': 2,
    'arrowvine': 1, 'axenut': 1, 'corpsecap': 1,
    'flamefruit': 1, 'rockroot': 1, 'snowthistle': 1,
    'random_item': 1
};

class LootLogic {
    constructor() {
        this.composition = {};
        this.pool = [];
        this.log = [];

        // Initialize composition with 0 for all builder groups
        BUILDER_GROUPS.forEach(group => {
            this.composition[group.id] = 0;
        });
    }

    setCount(groupId, count) {
        if (count < 0) return;
        this.composition[groupId] = parseInt(count) || 0;
    }

    getConfiguredSize() {
        return Object.values(this.composition).reduce((sum, c) => sum + c, 0);
    }

    buildPool() {
        this.pool = [];
        this.log = [];
        const warnings = [];

        for (const [groupId, count] of Object.entries(this.composition)) {
            if (count <= 0) continue;

            const groupDef = BUILDER_GROUPS.find(g => g.id === groupId);
            if (!groupDef) continue;

            if (groupDef.type === 'direct') {
                // Direct mapping: groupId matches a template ID
                for (let i = 0; i < count; i++) {
                    this.pool.push(groupId);
                }
            } else if (groupDef.type === 'random') {
                // Random draw from supply
                const supply = [...SUPPLY_DECK[groupId].cards]; // copy

                // Shuffle supply so that any subset or full usage is randomized
                for (let i = supply.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [supply[i], supply[j]] = [supply[j], supply[i]];
                }

                // Shuffle supply
                for (let i = supply.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [supply[i], supply[j]] = [supply[j], supply[i]];
                }

                if (count > supply.length) {
                    showError(`Warning: You requested ${count} ${groupDef.label}, but only ${supply.length} are available. Using all available.`);
                    // Add all available (now shuffled)
                    this.pool.push(...supply);
                } else {
                    // Take top N from shuffled supply
                    this.pool.push(...supply.slice(0, count));
                }
            }
        }
        return { success: true, warnings: warnings };
    }

    draw(n) {
        if (n <= 0) {
            return { success: false, error: "Must draw at least 1 token" };
        }
        if (n > this.pool.length) {
            return { success: false, error: `Cannot draw ${n} cards. Only ${this.pool.length} remaining.` };
        }

        const drawnIds = [];
        for (let i = 0; i < n; i++) {
            const index = Math.floor(Math.random() * this.pool.length);
            const [item] = this.pool.splice(index, 1);
            drawnIds.push(item);
        }

        this.log.unshift({
            timestamp: Date.now(),
            draws: drawnIds
        });

        return { success: true, draws: drawnIds };
    }

    getRemainingCount(templateId) {
        return this.pool.filter(id => id === templateId).length;
    }

    getRemainingCounts() {
        // Aggregate counts by display group (family)
        const counts = {};

        // Initialize counts for all builder groups
        BUILDER_GROUPS.forEach(group => {
            counts[group.label] = 0;
        });

        for (const id of this.pool) {
            // Find which group this card belongs to
            // First check if it's a direct match (like herbs)
            let group = BUILDER_GROUPS.find(g => g.id === id);

            if (!group) {
                // If not direct, check if it belongs to a supply deck (e.g. gold_1 in 'money')
                const supplyEntry = Object.entries(SUPPLY_DECK).find(([key, val]) => val.cards.includes(id));
                if (supplyEntry) {
                    const [supplyKey] = supplyEntry;
                    group = BUILDER_GROUPS.find(g => g.id === supplyKey);
                }
            }

            if (group) {
                counts[group.label] = (counts[group.label] || 0) + 1;
            } else {
                // Fallback for unknown items
                counts[id] = (counts[id] || 0) + 1;
            }
        }
        return counts;
    }

    resetSession() {
        this.pool = [];
        this.log = [];
    }

    clearCounts() {
        Object.keys(this.composition).forEach(id => {
            this.composition[id] = 0;
        });
    }

    applyPreset(preset) {
        this.clearCounts();
        Object.entries(preset).forEach(([id, count]) => {
            if (this.composition.hasOwnProperty(id)) {
                this.composition[id] = count;
            }
        });
    }
}

// --- UI CONTROLLER ---

const app = new LootLogic();

// Create a Map for O(1) lookup of BUILDER_GROUPS
const BUILDER_GROUPS_MAP = new Map(BUILDER_GROUPS.map(g => [String(g.id), g]));

// DOM Elements
const builderView = document.getElementById('builderView');
const activeView = document.getElementById('activeView');
const templateGrid = document.getElementById('templateGrid');
const configuredSizeDisplay = document.getElementById('configuredSizeDisplay');
const remainingCountDisplay = document.getElementById('remainingCountDisplay');
const statsTableBody = document.getElementById('statsTableBody');
const drawLogList = document.getElementById('drawLogList');
// inputTokens removed
const drawError = document.getElementById('drawError');

// Initialization
function init() {
    renderBuilder();
    updateConfiguredSize();

    // Builder Event Listeners
    document.getElementById('btnPresetBlank').addEventListener('click', () => {
        app.clearCounts();
        refreshBuilderInputs();
        updateConfiguredSize();
    });

    document.getElementById('btnPresetSample').addEventListener('click', () => {
        app.applyPreset(SAMPLE_PRESET);
        refreshBuilderInputs();
        updateConfiguredSize();
    });

    document.getElementById('btnBuildPool').addEventListener('click', () => {
        if (app.getConfiguredSize() === 0) {
            alert("Please add at least one card to the pool.");
            return;
        }
        const result = app.buildPool();
        if (result.warnings && result.warnings.length > 0) {
            alert(result.warnings.join('\n'));
        }
        switchToActiveView();
    });

    // Active View Event Listeners
    document.getElementById('btnDraw').addEventListener('click', handleDraw);

    document.getElementById('btnResetSession').addEventListener('click', () => {
        if (confirm("Are you sure you want to reset the session? Current pool and history will be lost.")) {
            app.resetSession();
            // inputTokens reset removed
            switchToBuilderView();
        }
    });

    // Overlay dismiss listener
    const drawOverlay = document.getElementById('drawOverlay');
    drawOverlay.addEventListener('click', () => {
        drawOverlay.classList.add('hidden');
    });
}

// Builder Functions
function renderBuilder() {
    templateGrid.innerHTML = '';
    BUILDER_GROUPS.forEach(group => {
        const div = document.createElement('div');
        div.className = 'template-item';

        const labelId = `label_${group.id}`;
        const label = document.createElement('label');
        label.textContent = group.label;
        label.htmlFor = `stepper-${group.id}`;

        // Stepper Control
        const stepperDiv = document.createElement('div');
        stepperDiv.className = 'stepper-control';
        stepperDiv.id = `stepper-${group.id}`;

        const btnDec = document.createElement('button');
        btnDec.type = 'button';
        btnDec.className = 'stepper-btn';
        btnDec.type = 'button';
        btnDec.textContent = '-';
        btnDec.disabled = true; // Initially 0
        btnDec.setAttribute('aria-label', `Decrease ${group.label}`);

        const display = document.createElement('span');
        display.className = 'stepper-value';
        display.textContent = '0';
        display.dataset.id = String(group.id);
        display.setAttribute('role', 'status');
        display.setAttribute('aria-label', `${group.label} count`);
        display.setAttribute('aria-live', 'polite');
        display.setAttribute('tabindex', '0');

        const btnInc = document.createElement('button');
        btnInc.type = 'button';
        btnInc.className = 'stepper-btn';
        btnInc.type = 'button';
        btnInc.textContent = '+';
        btnInc.setAttribute('aria-label', `Increase ${group.label}`);

        // Shared update function for value changes
        const updateValue = (newVal) => {
            display.textContent = newVal;
            updateConfiguredSize();
            btnDec.disabled = (newVal <= 0);
            btnInc.disabled = group.max && newVal >= group.max;
        };

        // Event Handlers
        btnDec.addEventListener('click', () => {
            let currentVal = app.composition[group.id] || 0;
            if (currentVal > 0) {
                currentVal--;
                app.setCount(group.id, currentVal);
                updateValue(currentVal);
            }
        });

        btnInc.addEventListener('click', () => {
            let currentVal = app.composition[group.id] || 0;
            // If there's a max, strictly enforce it for UI
            if (group.max && currentVal >= group.max) {
                return;
            }

            currentVal++;
            app.setCount(group.id, currentVal);
            updateValue(currentVal);
        });

        // Keyboard support for the stepper value display
        display.addEventListener('keydown', (e) => {
            let currentVal = app.composition[group.id] || 0;
            let newVal = currentVal;

            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                e.preventDefault();
                if (!group.max || currentVal < group.max) {
                    newVal = currentVal + 1;
                }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                e.preventDefault();
                if (currentVal > 0) {
                    newVal = currentVal - 1;
                }
            }

            if (newVal !== currentVal) {
                app.setCount(group.id, newVal);
                updateValue(newVal);
            }
        });

        // Keyboard navigation for display
        display.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                e.preventDefault();
                if (!btnInc.disabled) btnInc.click();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                e.preventDefault();
                if (!btnDec.disabled) btnDec.click();
            }
        });

        stepperDiv.appendChild(btnDec);
        stepperDiv.appendChild(display);
        stepperDiv.appendChild(btnInc);

        div.appendChild(label);
        div.appendChild(stepperDiv);
        templateGrid.appendChild(div);
    });
}

function refreshBuilderInputs() {
    const displays = templateGrid.querySelectorAll('.stepper-value');

    // Create lookup map to avoid O(n) search in loop
    const groupMap = new Map();
    BUILDER_GROUPS.forEach(g => groupMap.set(String(g.id), g));

    displays.forEach(display => {
        const id = display.dataset.id;
        const newVal = app.composition[id] || 0;
        display.textContent = newVal;

        // Also update button states (disable/enable)
        const parent = display.parentElement;
        if (parent) {
            const btnDec = parent.querySelector('.stepper-btn:first-child');
            const btnInc = parent.querySelector('.stepper-btn:last-child');

            if (btnDec) {
                btnDec.disabled = (newVal <= 0);
            }

            if (btnInc) {
                // Check max using Map for O(1) lookup
                const group = BUILDER_GROUPS_MAP.get(id);
                if (group && group.max) {
                    btnInc.disabled = (newVal >= group.max);
                } else {
                    btnInc.disabled = false;
                }
            }
        }
    });
}

function updateConfiguredSize() {
    configuredSizeDisplay.textContent = app.getConfiguredSize();
}

// Active View Functions
function switchToActiveView() {
    builderView.classList.add('hidden');
    activeView.classList.remove('hidden');
    drawError.classList.remove('visible');
    updateActiveDisplay();
}

function switchToBuilderView() {
    activeView.classList.add('hidden');
    builderView.classList.remove('hidden');
}

function updateActiveDisplay() {
    // Update total remaining
    const total = app.pool.length;
    remainingCountDisplay.textContent = total;

    // Update counts table
    const counts = app.getRemainingCounts();
    statsTableBody.innerHTML = '';

    // Only display loot templates that currently have a remaining count greater than zero.
    Object.entries(counts).forEach(([label, count]) => {
        if (count > 0) {
            const tr = document.createElement('tr');
            const tdLabel = document.createElement('td');
            const tdCount = document.createElement('td');

            tdLabel.textContent = label;
            tdCount.textContent = String(count);

            tr.appendChild(tdLabel);
            tr.appendChild(tdCount);
            statsTableBody.appendChild(tr);
        }
    });

    if (total === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 2;
        td.className = 'centered-text';
        td.textContent = 'Pool is empty';
        tr.appendChild(td);
        statsTableBody.appendChild(tr);
    }

    // Update Log
    renderLog();

    // Update Draw Button State
    const btnDraw = document.getElementById('btnDraw');
    // Always drawing 1, so simply check if pool is empty
    if (total === 0) {
        btnDraw.disabled = true;
    } else {
        btnDraw.disabled = false;
    }
}

function renderLog() {
    drawLogList.innerHTML = '';
    if (app.log.length === 0) {
        const li = document.createElement('li');
        li.className = 'empty-message';
        li.textContent = 'No draws yet.';
        drawLogList.appendChild(li);
        return;
    }

    app.log.forEach(entry => {
        const li = document.createElement('li');
        li.className = 'log-entry';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = new Date(entry.timestamp).toLocaleTimeString();

        const contentSpan = document.createElement('span');
        contentSpan.className = 'log-content';
        contentSpan.textContent = entry.draws.map(id => LOOT_TEMPLATES[id].label).join(', ');

        li.appendChild(timeSpan);
        li.appendChild(contentSpan);
        drawLogList.appendChild(li);
    });
}

function handleDraw() {
    // Always draw 1
    const result = app.draw(1);
    if (!result.success) {
        showError(result.error);
    } else {
        drawError.classList.remove('visible');
        updateActiveDisplay();

        // Dramatic Overlay
        const drawOverlay = document.getElementById('drawOverlay');
        const drawResultName = document.getElementById('drawResultName');
        const drawResultImage = document.getElementById('drawResultImage');
        const drawnId = result.draws[0];
        const template = LOOT_TEMPLATES[drawnId];
        const label = template.label;

        drawResultName.textContent = label;
        if (template.img) {
            drawResultImage.src = template.img;
            drawResultImage.alt = label;
            drawResultImage.classList.remove('hidden');
        } else {
            drawResultImage.classList.add('hidden');
        }

        drawOverlay.classList.remove('hidden');

        // Auto-hide after 3 seconds if not clicked
        setTimeout(() => {
            drawOverlay.classList.add('hidden');
        }, 3000);
    }
}

function showError(msg) {
    drawError.textContent = msg;
    drawError.classList.add('visible');
    setTimeout(() => {
        drawError.classList.remove('visible');
    }, 3000);
}

// Start
init();

