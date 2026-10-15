const GameEngine = (() => {
    let _lastSpinTime = 0;
    let _spinCount = 0;
    const MIN_SPIN_INTERVAL = 2500;
    function secureRandom() {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        return arr[0] / 4294967296;
    }
    function canSpin() {
        const now = Date.now();
        if (now - _lastSpinTime < MIN_SPIN_INTERVAL) return { allowed: false, reason: 'Zwolnij! Odczekaj chwilę.' };
        return { allowed: true };
    }
    function rollOutcome(chance) {
        if (typeof chance !== 'number' || chance < 0 || chance > 100 || isNaN(chance)) throw new Error('Invalid chance');
        const roll = secureRandom() * 100;
        return { roll, chance, outcome: roll <= chance, timestamp: Date.now(), spinId: 'spin_' + (++_spinCount) };
    }
    return { canSpin, rollOutcome, getSpinCount: () => _spinCount,
        resetRateLimit: () => { _lastSpinTime = 0; }, recordSpin: () => { _lastSpinTime = Date.now(); } };
})();

(function protectAgainstTampering() {
    let devtoolsOpen = false;
    const threshold = 160;
    setInterval(() => {
        const w = window.outerWidth - window.innerWidth > threshold;
        const h = window.outerHeight - window.innerHeight > threshold;
        if (w || h) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                console.clear();
                console.log('%c⚠️ WYKRYTO DEVTOOLS', 'color: #eb4b4b; font-size: 20px; font-weight: bold;');
            }
        } else devtoolsOpen = false;
    }, 1000);
    try { Object.freeze(GameEngine); } catch (e) {}
})();

let balance = 0.00;
let addedCash = 0.00;
let isSpinning = false;
let audioMuted = false;
let selectedSourceItem = null;
let selectedTargetItem = null;
let calculatedChance = 0;

// inventory i storeCatalog są w items.js (globalnie dostępne)

const AudioSynth = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    playTick(speedFactor = 1) {
        if (audioMuted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const baseFreq = 500 + speedFactor * 500;
        osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.025);
        const vol = Math.min(0.02 + speedFactor * 0.025, 0.06);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.025);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.025);
    },
    playWin() {
        if (audioMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.1, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.3);
        });
    },
    playLoss() {
        if (audioMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        [200, 160, 120].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            gain.gain.setValueAtTime(0.07, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.2);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.1); osc.stop(now + idx * 0.1 + 0.2);
        });
    }
};

function spawnParticles(container, count, colors) {
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 150;
        p.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
        p.style.left = '50%'; p.style.top = '50%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.boxShadow = `0 0 8px ${p.style.background}`;
        container.appendChild(p);
        setTimeout(() => p.remove(), 1600);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('user-balance').innerText = `$${balance.toFixed(2)}`;
    renderPlayerInventory();
    renderStoreCatalog();
    populateLiveFeed();
    updateWheelArc(0);
    setInterval(() => {
        const el = document.getElementById('online-counter');
        let count = parseInt(el.innerText.replace(/,/g, ''));
        count += Math.floor(Math.random() * 5) - 2;
        el.innerText = count.toLocaleString('en-US');
    }, 4000);
});

function renderPlayerInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';
    document.getElementById('inventory-count-badge').innerText = `${inventory.length} przedmiotów`;
    inventory.forEach(item => {
        const isSelected = selectedSourceItem && selectedSourceItem.id === item.id;
        const node = document.createElement('div');
        node.className = `item-card bg-cardBg/80 border ${isSelected ? 'border-accentViolet bg-accentViolet/10 shadow-lg shadow-accentViolet/20' : 'border-borderBorder/60'} ${item.rarity} hover:border-accentViolet/60 rounded-lg p-2 flex flex-col justify-between cursor-pointer transition select-none h-28`;
        node.onclick = () => selectSourceItem(item);
        node.innerHTML = `
            <div class="flex justify-between items-center text-[9px] font-bold text-gray-400">
                <span>${item.wear}</span>
                <span class="text-white font-mono">$${item.price.toFixed(2)}</span>
            </div>
            <img src="${item.img}" class="w-16 h-12 object-contain mx-auto my-1">
            <div class="text-[10px] font-semibold text-gray-200 truncate text-center">${item.name}</div>
        `;
        grid.appendChild(node);
    });
}

function renderStoreCatalog() {
    const search = document.getElementById('catalog-search').value.toLowerCase();
    const sort = document.getElementById('catalog-sort').value;
    let items = storeCatalog.filter(i => i.name.toLowerCase().includes(search));
    if (sort === 'asc') items.sort((a, b) => a.price - b.price);
    if (sort === 'desc') items.sort((a, b) => b.price - a.price);
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';
    items.forEach(item => {
        const isSelected = selectedTargetItem && selectedTargetItem.id === item.id;
        const node = document.createElement('div');
        node.className = `item-card bg-cardBg/80 border ${isSelected ? 'border-accentBlue bg-accentBlue/10 shadow-lg shadow-accentBlue/20' : 'border-borderBorder/60'} ${item.rarity} hover:border-accentBlue/60 rounded-lg p-2 flex flex-col justify-between cursor-pointer transition select-none h-28`;
        node.onclick = () => selectTargetItem(item);
        node.innerHTML = `
            <div class="flex justify-between items-center text-[9px] font-bold text-gray-400">
                <span>${item.wear}</span>
                <span class="text-white font-mono">$${item.price.toFixed(2)}</span>
            </div>
            <img src="${item.img}" class="w-16 h-12 object-contain mx-auto my-1">
            <div class="text-[10px] font-semibold text-gray-200 truncate text-center">${item.name}</div>
        `;
        grid.appendChild(node);
    });
}

function selectSourceItem(item) {
    if (isSpinning) return;
    selectedSourceItem = item;
    document.getElementById('source-empty').classList.add('hidden');
    document.getElementById('source-filled').classList.remove('hidden');
    document.getElementById('source-img').src = item.img;
    document.getElementById('source-name').innerText = item.name;
    document.getElementById('source-price').innerText = `$${item.price.toFixed(2)}`;
    document.getElementById('offered-item-wear').innerText = item.wear;
    renderPlayerInventory();
    recalculateOdds();
}

function clearSourceItem() {
    if (isSpinning) return;
    selectedSourceItem = null;
    document.getElementById('source-empty').classList.remove('hidden');
    document.getElementById('source-filled').classList.add('hidden');
    document.getElementById('offered-item-wear').innerText = 'Brak';
    renderPlayerInventory();
    recalculateOdds();
}

function sellSelectedItem() {
    if (!selectedSourceItem || isSpinning) return;
    balance += selectedSourceItem.price;
    document.getElementById('user-balance').innerText = `$${balance.toFixed(2)}`;
    const idx = inventory.findIndex(i => i.id === selectedSourceItem.id);
    if (idx > -1) inventory.splice(idx, 1);
    clearSourceItem();
}

function selectTargetItem(item) {
    if (isSpinning) return;
    selectedTargetItem = item;
    document.getElementById('target-empty').classList.add('hidden');
    document.getElementById('target-filled').classList.remove('hidden');
    document.getElementById('target-img').src = item.img;
    document.getElementById('target-name').innerText = item.name;
    document.getElementById('target-price').innerText = `$${item.price.toFixed(2)}`;
    document.getElementById('target-item-wear').innerText = item.wear;
    renderStoreCatalog();
    recalculateOdds();
}

function clearTargetItem() {
    if (isSpinning) return;
    selectedTargetItem = null;
    document.getElementById('target-empty').classList.remove('hidden');
    document.getElementById('target-filled').classList.add('hidden');
    document.getElementById('target-item-wear').innerText = 'Brak';
    renderStoreCatalog();
    recalculateOdds();
}

function onCashSliderChange(val) {
    if (isSpinning) return;
    addedCash = parseFloat(val);
    document.getElementById('cash-add-label').innerText = `$${addedCash.toFixed(2)}`;
    recalculateOdds();
}

function recalculateOdds() {
    const btn = document.getElementById('upgrade-btn');
    const statusMsg = document.getElementById('status-msg');
    const sourceVal = (selectedSourceItem ? selectedSourceItem.price : 0) + addedCash;
    document.getElementById('total-source-val').innerText = `$${sourceVal.toFixed(2)}`;
    const targetVal = selectedTargetItem ? selectedTargetItem.price : 0;
    document.getElementById('total-target-val').innerText = `$${targetVal.toFixed(2)}`;

    if (sourceVal <= 0 || targetVal <= 0) {
        calculatedChance = 0;
        updateWheelArc(0);
        document.getElementById('win-chance-text').innerText = '0.00%';
        document.getElementById('multiplier-text').innerText = '0.00x';
        btn.disabled = true;
        btn.className = "w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-cardBg text-gray-600 border border-borderBorder cursor-not-allowed z-10";
        statusMsg.innerText = "Wybierz przedmioty do ulepszenia";
        return;
    }
    let rawChance = (sourceVal / targetVal) * 100;
    calculatedChance = Math.min(Math.max(rawChance, 1.0), 80.0);
    const multiplier = (100 / calculatedChance).toFixed(2);
    document.getElementById('win-chance-text').innerText = `${calculatedChance.toFixed(2)}%`;
    document.getElementById('multiplier-text').innerText = `${multiplier}x`;
    updateWheelArc(calculatedChance);

    if (addedCash > balance) {
        btn.disabled = true;
        btn.className = "w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-red-950/40 text-red-400 border border-red-800/60 cursor-not-allowed z-10";
        statusMsg.innerText = "Brak wystarczającego salda";
        return;
    }
    btn.disabled = false;
    btn.className = "upgrade-btn-active w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest text-white border border-accentViolet/50 cursor-pointer z-10";
    statusMsg.innerText = `Szansa na sukces: ${calculatedChance.toFixed(2)}%`;
}

function pickGradient(percentage) {
    if (percentage < 35) return 'url(#gradRed)';
    if (percentage < 50) return 'url(#gradOrange)';
    if (percentage < 60) return 'url(#gradYellow)';
    return 'url(#gradGreen)';
}

function updateWheelArc(percentage) {
    const leftArc = document.getElementById('win-arc-left');
    const rightArc = document.getElementById('win-arc-right');
    const circumference = 452.38;

    const halfPercent = percentage / 2;
    const strokeLength = (halfPercent / 100)
