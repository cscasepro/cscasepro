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

let balance = 125.00;
let addedCash = 0.00;
let isSpinning = false;
let audioMuted = false;
let selectedSourceItem = null;
let selectedTargetItem = null;
let calculatedChance = 0;

let inventory = [
    { id: 'i1', name: 'AK-47 | Redline', wear: 'FT', price: 18.50, rarity: 'rarity-classified', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
    { id: 'i2', name: 'M4A4 | Evil Daimyo', wear: 'FN', price: 5.20, rarity: 'rarity-restricted', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
    { id: 'i3', name: 'AWP | Atheris', wear: 'MW', price: 11.00, rarity: 'rarity-restricted', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
    { id: 'i4', name: 'USP-S | Cyrex', wear: 'FT', price: 3.80, rarity: 'rarity-restricted', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
    { id: 'i5', name: 'Glock-18 | Water Elemental', wear: 'MW', price: 9.50, rarity: 'rarity-classified', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
    { id: 'i6', name: 'Desert Eagle | Mecha Industries', wear: 'FT', price: 7.00, rarity: 'rarity-classified', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
];

const storeCatalog = [
    { id: 's1', name: 'AK-47 | Empress', wear: 'FT', price: 32.00, rarity: 'rarity-covert', img: 'https://placehold.co/180x130/15132a/8b5cf6?text=AK-47+Empress' },
    { id: 's2', name: 'AWP | Asiimov', wear: 'FT', price: 68.00, rarity: 'rarity-covert', img: 'https://placehold.co/180x130/15132a/38bdf8?text=AWP+Asiimov' },
    { id: 's3', name: 'M4A1-S | Printstream', wear: 'MW', price: 110.00, rarity: 'rarity-covert', img: 'https://placehold.co/180x130/15132a/8b5cf6?text=M4A1-S+Printstream' },
    { id: 's4', name: 'AK-47 | Vulcan', wear: 'FT', price: 145.00, rarity: 'rarity-covert', img: 'https://placehold.co/180x130/15132a/38bdf8?text=AK-47+Vulcan' },
    { id: 's5', name: 'USP-S | Kill Confirmed', wear: 'FN', price: 175.00, rarity: 'rarity-covert', img: 'https://placehold.co/180x130/15132a/8b5cf6?text=USP-S+Kill+Confirmed' },
    { id: 's6', name: 'Gut Knife | Freehand', wear: 'FT', price: 215.00, rarity: 'rarity-knife', img: 'https://placehold.co/180x130/15132a/ffd700?text=Gut+Knife' },
    { id: 's7', name: 'Bowie Knife | Tiger Tooth', wear: 'FN', price: 350.00, rarity: 'rarity-knife', img: 'https://placehold.co/180x130/15132a/ffd700?text=Bowie+Knife' },
    { id: 's8', name: 'Karambit | Doppler Phase 2', wear: 'FN', price: 1250.00, rarity: 'rarity-knife', img: 'https://placehold.co/180x130/15132a/ffd700?text=Karambit+Doppler' },
];

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
    const strokeLength = (halfPercent / 100) * circumference;

    leftArc.setAttribute('stroke-dasharray', `${strokeLength} ${circumference}`);
    rightArc.setAttribute('stroke-dasharray', `${strokeLength} ${circumference}`);

    const gradient = pickGradient(percentage);
    leftArc.setAttribute('stroke', gradient);
    rightArc.setAttribute('stroke', gradient);
}

function drawSpinAngle(realChance) {
    const halfAngleDeg = (realChance / 2 / 100) * 360;
    const EDGE = 1.5;
    const roll = Math.random() * 100;

    if (roll < realChance) {
        const side = Math.random() < 0.5 ? 'right' : 'left';
        const minA = EDGE;
        const maxA = Math.max(halfAngleDeg - EDGE, minA + 0.5);
        const angleInArc = minA + Math.random() * (maxA - minA);
        return side === 'right' ? angleInArc : (360 - angleInArc);
    } else {
        const minA = halfAngleDeg + EDGE;
        const maxA = 360 - halfAngleDeg - EDGE;
        if (maxA <= minA) return 180;
        return minA + Math.random() * (maxA - minA);
    }
}

function readOutcomeFromAngle(offsetDeg, realChance) {
    const halfAngleDeg = (realChance / 2 / 100) * 360;
    const a = ((offsetDeg % 360) + 360) % 360;
    const inRight = a <= halfAngleDeg;
    const inLeft = a >= 360 - halfAngleDeg;
    return inRight || inLeft;
}

async function startUpgrade() {
    if (isSpinning || !selectedTargetItem) return;
    if (addedCash > balance) return;

    const rateCheck = GameEngine.canSpin();
    if (!rateCheck.allowed) {
        const statusMsg = document.getElementById('status-msg');
        statusMsg.innerHTML = `<span class="text-yellow-400 font-bold"><i class="fa-solid fa-clock mr-1"></i> ${rateCheck.reason}</span>`;
        return;
    }

    const sourceVal = (selectedSourceItem ? selectedSourceItem.price : 0) + addedCash;
    const targetVal = selectedTargetItem.price;
    const realChance = Math.min(Math.max((sourceVal / targetVal) * 100, 1.0), 80.0);

    if (addedCash > 0) {
        balance -= addedCash;
        document.getElementById('user-balance').innerText = `$${balance.toFixed(2)}`;
    }

    isSpinning = true;
    GameEngine.recordSpin();

    const btn = document.getElementById('upgrade-btn');
    btn.disabled = true;
    btn.className = "w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-cardBg text-gray-500 border border-borderBorder cursor-not-allowed z-10";
    btn.innerText = "LOSOWANIE...";

    const wheelSvg = document.getElementById('wheel-svg');
    wheelSvg.classList.add('spinning-glow');

    const wonItemSnapshot = { ...selectedTargetItem };
    const sacrificedItemSnapshot = selectedSourceItem ? { ...selectedSourceItem } : null;

    const targetOffsetDeg = drawSpinAngle(realChance);
    const isWin = readOutcomeFromAngle(targetOffsetDeg, realChance);

    console.log(`[SPIN] chance=${realChance.toFixed(2)}% offset=${targetOffsetDeg.toFixed(2)}° → ${isWin ? '✅ WYGRANA' : '❌ PRZEGRANA'}`);

    const totalRotations = (5 * 360) + targetOffsetDeg;
    const needle = document.getElementById('needle');
    const duration = 4500;

    needle.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.9, 0.2, 1)`;
    needle.style.transform = `rotate(${totalRotations}deg)`;

    const TICK_STEP = 6;
    let lastTickAngle = 0;
    let animationStartTime = null;
    let rafId = null;

    function cubicBezier(t, p1x, p1y, p2x, p2y) {
        const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
        const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
        let x = t;
        for (let i = 0; i < 8; i++) {
            const xEst = ((ax * x + bx) * x + cx) * x;
            const dx = (3 * ax * x + 2 * bx) * x + cx;
            if (Math.abs(dx) < 1e-6) break;
            x -= (xEst - t) / dx;
        }
        return ((ay * x + by) * x + cy) * x;
    }

    function tickLoop(timestamp) {
        if (!animationStartTime) animationStartTime = timestamp;
        const elapsed = timestamp - animationStartTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = cubicBezier(progress, 0.1, 0.9, 0.2, 1);
        const currentAngle = easedProgress * totalRotations;
        if (currentAngle - lastTickAngle >= TICK_STEP) {
            const steps = Math.floor((currentAngle - lastTickAngle) / TICK_STEP);
            lastTickAngle += steps * TICK_STEP;
            const speedDegPerSec = elapsed > 0 ? (currentAngle / elapsed) * 1000 : 0;
            const speedFactor = Math.min(speedDegPerSec / 2000, 1.5);
            AudioSynth.playTick(speedFactor);
        }
        if (progress < 1) rafId = requestAnimationFrame(tickLoop);
    }
    rafId = requestAnimationFrame(tickLoop);

    setTimeout(() => {
        if (rafId) cancelAnimationFrame(rafId);
        wheelSvg.classList.remove('spinning-glow');
        finishUpgrade(isWin, totalRotations, wonItemSnapshot, sacrificedItemSnapshot);
    }, duration);
}

function finishUpgrade(isWin, finalDegree, wonItem, sacrificedItem) {
    isSpinning = false;

    const normalizedDegree = finalDegree % 360;
    const needle = document.getElementById('needle');
    needle.style.transition = 'none';
    needle.style.transform = `rotate(${normalizedDegree}deg)`;

    const statusMsg = document.getElementById('status-msg');

    if (isWin) {
        AudioSynth.playWin();
        statusMsg.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-check mr-1"></i> ULEPSZENIE UDANE!</span>`;
        if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
        inventory.push({ ...wonItem, id: 'i' + Date.now() });
        if (sacrificedItem) {
            const idx = inventory.findIndex(i => i.id === sacrificedItem.id);
            if (idx > -1) inventory.splice(idx, 1);
        }
        pushLiveFeed(wonItem, true);
        openResultModal(true, wonItem);
    } else {
        AudioSynth.playLoss();
        statusMsg.innerHTML = `<span class="text-red-400 font-bold"><i class="fa-solid fa-xmark mr-1"></i> ULEPSZENIE NIEUDANE</span>`;
        if (navigator.vibrate) navigator.vibrate(200);
        if (sacrificedItem) {
            const idx = inventory.findIndex(i => i.id === sacrificedItem.id);
            if (idx > -1) inventory.splice(idx, 1);
        }
        const wheelContainer = document.querySelector('.lg\\:col-span-4 .relative');
        if (wheelContainer) {
            wheelContainer.classList.add('shake');
            setTimeout(() => wheelContainer.classList.remove('shake'), 400);
        }
        pushLiveFeed(wonItem, false);
        openResultModal(false, wonItem);
    }

    setTimeout(() => {
        needle.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';
        needle.style.transform = 'rotate(0deg)';
    }, 800);

    document.getElementById('cash-slider').value = 0;
    onCashSliderChange(0);
    clearSourceItem();
    clearTargetItem();
    document.getElementById('upgrade-btn').innerText = "ULEPSZ";

    setTimeout(() => GameEngine.resetRateLimit(), 2500);
}

function openResultModal(isWin, item) {
    if (!item) return;
    const modal = document.getElementById('result-modal');
    const content = document.getElementById('result-modal-content');
    const icon = document.getElementById('modal-status-icon');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');

    if (isWin) {
        icon.className = "w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 relative z-10";
        icon.innerHTML = `<i class="fa-solid fa-trophy"></i>`;
        title.className = "font-rajdhani text-2xl font-bold uppercase tracking-wider text-emerald-400 relative z-10";
        title.innerText = "WYGRANA!";
        desc.innerText = "Twój nowy skin powędrował do ekwipunku.";
    } else {
        icon.className = "w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 bg-red-500/20 text-red-400 border border-red-500/50 relative z-10";
        icon.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        title.className = "font-rajdhani text-2xl font-bold uppercase tracking-wider text-red-400 relative z-10";
        title.innerText = "PORAŻKA!";
        desc.innerText = "Przedmiot spłonął podczas próby ulepszenia.";
    }
    document.getElementById('modal-item-img').src = item.img;
    document.getElementById('modal-item-name').innerText = item.name;
    document.getElementById('modal-item-price').innerText = `$${item.price.toFixed(2)}`;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('modal-in');
        void content.offsetWidth;
        content.classList.add('modal-in');
    }, 10);

    if (isWin) {
        setTimeout(() => spawnParticles(content, 25, ['#10b981', '#34d399', '#6ee7b7', '#8b5cf6', '#38bdf8']), 100);
    }
}

function closeResultModal() {
    const modal = document.getElementById('result-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 200);
}

function pushLiveFeed(item, isWin) {
    const feed = document.getElementById('live-feed');
    const node = document.createElement('div');
    node.className = `bg-cardBg/80 border ${isWin ? 'border-emerald-500/40' : 'border-red-500/40'} rounded-lg px-2.5 py-1.5 flex items-center gap-2 flex-shrink-0 min-w-[130px] transition hover:border-accentViolet/40`;
    node.innerHTML = `
        <img src="${item.img}" class="w-8 h-6 object-contain">
        <div class="flex flex-col text-[10px]">
            <span class="font-bold text-gray-200 truncate max-w-[70px]">${item.name}</span>
            <span class="${isWin ? 'text-emerald-400' : 'text-red-400'} font-mono font-bold">$${item.price.toFixed(2)}</span>
        </div>
    `;
    feed.insertBefore(node, feed.firstChild);
    if (feed.children.length > 9) feed.removeChild(feed.lastChild);
}

function populateLiveFeed() {
    for (let i = 0; i < 8; i++) {
        const item = storeCatalog[Math.floor(Math.random() * storeCatalog.length)];
        pushLiveFeed(item, Math.random() > 0.5);
    }
}

function toggleAudio() {
    audioMuted = !audioMuted;
    document.getElementById('sound-icon').className = audioMuted ? "fa-solid fa-volume-xmark text-red-400" : "fa-solid fa-volume-high text-gray-400";
}

function toggleLogin() {
    const btn = document.getElementById('steam-btn-text');
    btn.innerText = btn.innerText === "Steam User" ? "Niezalogowany" : "Steam User";
}
