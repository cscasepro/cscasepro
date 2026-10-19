const CASINO_CONFIG = {
    RTP_FACTOR: 0.95,
    MIN_CHANCE: 1.0,  
    MAX_CHANCE: 80.0  
};

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
        if (now - _lastSpinTime < MIN_SPIN_INTERVAL) {
            return { allowed: false, reason: 'Zwolnij! Odczekaj chwilę.' };
        }
        return { allowed: true };
    }

    function calculateRealChance(sourceValue, targetValue) {
        if (sourceValue <= 0 || targetValue <= 0) return 0;
        const rawChance = (sourceValue / targetValue) * 100;
        const adjustedChance = rawChance * CASINO_CONFIG.RTP_FACTOR;
        return Math.min(Math.max(adjustedChance, CASINO_CONFIG.MIN_CHANCE), CASINO_CONFIG.MAX_CHANCE);
    }

    function rollOutcome(chance) {
        if (typeof chance !== 'number' || chance < 0 || chance > 100 || isNaN(chance)) {
            throw new Error('Invalid chance');
        }
        const roll = secureRandom() * 100;
        return {
            roll,
            chance,
            outcome: roll <= chance,
            timestamp: Date.now(),
            spinId: 'spin_' + (++_spinCount)
        };
    }

    return {
        canSpin,
        calculateRealChance,
        rollOutcome,
        getSpinCount: () => _spinCount,
        resetRateLimit: () => { _lastSpinTime = 0; },
        recordSpin: () => { _lastSpinTime = Date.now(); }
    };
})();

let balance = 0.00;
let addedCash = 0.00;
let isSpinning = false;
let audioMuted = false;
let selectedSourceItem = null;
let selectedTargetItem = null;
let calculatedChance = 0;

let inventory = window.inventory;
let storeCatalog = window.storeCatalog;

const AudioSynth = {
    ctx: null,
    init() { 
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) this.ctx = new AudioContext();
        } 
    },
    playTick(speedFactor = 1) {
        if (audioMuted) return;
        this.init();
        if (!this.ctx) return;
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
        if (!this.ctx) return;
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
        if (!this.ctx) return;
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
    if (!container) return;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 150;
        p.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
        p.style.left = '50%'; p.style.top = '50%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(p);
        setTimeout(() => p.remove(), 1600);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    updateBalanceDisplay();
    renderPlayerInventory();
    renderStoreCatalog();
    populateLiveFeed();
    updateWheelArc(0);
    
    const slider = document.getElementById('cash-slider');
    if (slider) slider.max = Math.max(0, balance).toFixed(2);
    
    setInterval(() => {
        const el = document.getElementById('online-counter');
        if (el) {
            let count = parseInt(el.innerText.replace(/,/g, '')) || 1240;
            count += Math.floor(Math.random() * 5) - 2;
            el.innerText = count.toLocaleString('en-US');
        }
    }, 4000);
});

function updateBalanceDisplay() {
    const balanceEl = document.getElementById('user-balance');
    const modalBalanceEl = document.getElementById('modal-user-balance');
    const val = `$${balance.toFixed(2)}`;
    if (balanceEl) balanceEl.innerText = val;
    if (modalBalanceEl) modalBalanceEl.innerText = val;
}

function renderPlayerInventory() {
    const grid = document.getElementById('inventory-grid');
    const badge = document.getElementById('inventory-count-badge');
    if (!grid) return;
    grid.innerHTML = '';
    if (badge) badge.innerText = `${inventory.length} przedmiotów`;
    
    inventory.forEach(item => {
        const isSelected = selectedSourceItem && selectedSourceItem.id === item.id;
        const node = document.createElement('div');
        node.className = `item-card bg-cardBg/80 border ${isSelected ? 'border-accentViolet bg-accentViolet/10' : 'border-borderBorder/60'} ${item.rarity} rounded-lg p-2 flex flex-col justify-between cursor-pointer transition select-none h-28`;
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

// Sklep wyboru celu ulepszenia
function renderStoreCatalog() {
    const searchInput = document.getElementById('catalog-search');
    const sortInput = document.getElementById('catalog-sort');
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const sort = sortInput ? sortInput.value : 'default';

    let items = storeCatalog.filter(i => i.name.toLowerCase().includes(search));
    if (sort === 'asc') items.sort((a, b) => a.price - b.price);
    if (sort === 'desc') items.sort((a, b) => b.price - a.price);

    grid.innerHTML = '';
    items.forEach(item => {
        const isSelected = selectedTargetItem && selectedTargetItem.id === item.id;
        const node = document.createElement('div');
        node.className = `item-card bg-cardBg/80 border ${isSelected ? 'border-accentBlue bg-accentBlue/10' : 'border-borderBorder/60'} ${item.rarity} rounded-lg p-2 flex flex-col justify-between cursor-pointer transition select-none h-28`;
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

// Sklep w wyskakującym okienku (Pop-up)
function openShopModal() {
    const modal = document.getElementById('shop-modal');
    if (modal) {
        modal.classList.remove('hidden');
        renderPopShop();
        const msg = document.getElementById('shop-pop-msg');
        if (msg) msg.innerHTML = '';
    }
}

function closeShopModal() {
    const modal = document.getElementById('shop-modal');
    if (modal) modal.classList.add('hidden');
}

function renderPopShop() {
    const searchInput = document.getElementById('pop-shop-search');
    const sortInput = document.getElementById('pop-shop-sort');
    const grid = document.getElementById('pop-shop-grid');
    if (!grid) return;

    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const sort = sortInput ? sortInput.value : 'default';

    let items = storeCatalog.filter(i => i.name.toLowerCase().includes(search));
    if (sort === 'asc') items.sort((a, b) => a.price - b.price);
    if (sort === 'desc') items.sort((a, b) => b.price - a.price);

    grid.innerHTML = '';
    items.forEach(item => {
        const canAfford = balance >= item.price;
        const node = document.createElement('div');
        node.className = `item-card bg-cardBg/80 border border-borderBorder/60 ${item.rarity} rounded-lg p-2 flex flex-col justify-between cursor-pointer transition select-none h-28 ${canAfford ? 'hover:border-emerald-500/60' : 'opacity-60 cursor-not-allowed'}`;
        node.onclick = () => buyItemDirectly(item);
        node.innerHTML = `
            <div class="flex justify-between items-center text-[9px] font-bold text-gray-400">
                <span>${item.wear}</span>
                <span class="${canAfford ? 'text-emerald-400' : 'text-red-400'} font-mono font-bold">Kup $${item.price.toFixed(2)}</span>
            </div>
            <img src="${item.img}" class="w-16 h-12 object-contain mx-auto my-1">
            <div class="text-[10px] font-semibold text-gray-200 truncate text-center">${item.name}</div>
        `;
        grid.appendChild(node);
    });
}

function buyItemDirectly(item) {
    const msg = document.getElementById('shop-pop-msg');
    if (balance < item.price) {
        if (msg) msg.innerHTML = `<span class="text-red-400 font-bold">❌ Masz za mało środków w saldzie!</span>`;
        return;
    }
    balance -= item.price;
    inventory.push({
        ...item,
        id: 'buy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    });

    updateBalanceDisplay();

    const slider = document.getElementById('cash-slider');
    if (slider) slider.max = Math.max(0, balance).toFixed(2);

    renderPlayerInventory();
    renderPopShop();
    recalculateOdds();
    AudioSynth.playWin();

    if (msg) msg.innerHTML = `<span class="text-emerald-400 font-bold">✅ Zakupiono ${item.name}! Dodano do ekwipunku.</span>`;
    setTimeout(() => { if (msg) msg.innerHTML = ''; }, 2500);
}

function selectSourceItem(item) {
    if (isSpinning) return;
    selectedSourceItem = item;
    
    const emptyEl = document.getElementById('source-empty');
    const filledEl = document.getElementById('source-filled');
    if (emptyEl) emptyEl.classList.add('hidden');
    if (filledEl) filledEl.classList.remove('hidden');
    
    const imgEl = document.getElementById('source-img');
    const nameEl = document.getElementById('source-name');
    const priceEl = document.getElementById('source-price');
    const wearEl = document.getElementById('offered-item-wear');

    if (imgEl) imgEl.src = item.img;
    if (nameEl) nameEl.innerText = item.name;
    if (priceEl) priceEl.innerText = `$${item.price.toFixed(2)}`;
    if (wearEl) wearEl.innerText = item.wear;

    renderPlayerInventory();
    recalculateOdds();
}

function clearSourceItem() {
    if (isSpinning) return;
    selectedSourceItem = null;
    
    const emptyEl = document.getElementById('source-empty');
    const filledEl = document.getElementById('source-filled');
    const wearEl = document.getElementById('offered-item-wear');

    if (emptyEl) emptyEl.classList.remove('hidden');
    if (filledEl) filledEl.classList.add('hidden');
    if (wearEl) wearEl.innerText = 'Brak';

    renderPlayerInventory();
    recalculateOdds();
}

function sellSelectedItem() {
    if (!selectedSourceItem || isSpinning) return;
    balance += selectedSourceItem.price;
    
    updateBalanceDisplay();
    
    const idx = inventory.findIndex(i => i.id === selectedSourceItem.id);
    if (idx > -1) inventory.splice(idx, 1);
    
    clearSourceItem();
    
    const slider = document.getElementById('cash-slider');
    if (slider) slider.max = Math.max(0, balance).toFixed(2);
    
    recalculateOdds();
}

function selectTargetItem(item) {
    if (isSpinning) return;
    selectedTargetItem = item;

    const emptyEl = document.getElementById('target-empty');
    const filledEl = document.getElementById('target-filled');
    if (emptyEl) emptyEl.classList.add('hidden');
    if (filledEl) filledEl.classList.remove('hidden');

    const imgEl = document.getElementById('target-img');
    const nameEl = document.getElementById('target-name');
    const priceEl = document.getElementById('target-price');
    const wearEl = document.getElementById('target-item-wear');

    if (imgEl) imgEl.src = item.img;
    if (nameEl) nameEl.innerText = item.name;
    if (priceEl) priceEl.innerText = `$${item.price.toFixed(2)}`;
    if (wearEl) wearEl.innerText = item.wear;

    renderStoreCatalog();
    recalculateOdds();
}

function clearTargetItem() {
    if (isSpinning) return;
    selectedTargetItem = null;

    const emptyEl = document.getElementById('target-empty');
    const filledEl = document.getElementById('target-filled');
    const wearEl = document.getElementById('target-item-wear');

    if (emptyEl) emptyEl.classList.remove('hidden');
    if (filledEl) filledEl.classList.add('hidden');
    if (wearEl) wearEl.innerText = 'Brak';

    renderStoreCatalog();
    recalculateOdds();
}

function onCashSliderChange(val) {
    if (isSpinning) return;
    const slider = document.getElementById('cash-slider');
    let v = parseFloat(val);
    if (isNaN(v) || v < 0) v = 0;
    if (v > balance) v = balance;
    addedCash = v;
    if (slider) slider.value = v;
    
    const label = document.getElementById('cash-add-label');
    if (label) label.innerText = `$${addedCash.toFixed(2)}`;
    recalculateOdds();
}

function recalculateOdds() {
    const btn = document.getElementById('upgrade-btn');
    const statusMsg = document.getElementById('status-msg');
    const slider = document.getElementById('cash-slider');
    
    const safeBalance = Math.max(0, balance);
    if (slider) slider.max = safeBalance.toFixed(2);
    
    if (addedCash > safeBalance) {
        addedCash = safeBalance;
        if (slider) slider.value = safeBalance;
        const label = document.getElementById('cash-add-label');
        if (label) label.innerText = `$${addedCash.toFixed(2)}`;
    }

    const sourceVal = (selectedSourceItem ? selectedSourceItem.price : 0) + addedCash;
    const targetVal = selectedTargetItem ? selectedTargetItem.price : 0;

    const totalSourceValEl = document.getElementById('total-source-val');
    if (totalSourceValEl) totalSourceValEl.innerText = `$${sourceVal.toFixed(2)}`;

    const totalTargetValEl = document.getElementById('total-target-val');
    if (totalTargetValEl) totalTargetValEl.innerText = `$${targetVal.toFixed(2)}`;

    if (sourceVal <= 0 || targetVal <= 0 || !btn) {
        calculatedChance = 0;
        updateWheelArc(0);
        const winChanceEl = document.getElementById('win-chance-text');
        const multEl = document.getElementById('multiplier-text');
        if (winChanceEl) winChanceEl.innerText = '0.00%';
        if (multEl) multEl.innerText = '0.00x';
        if (btn) {
            btn.disabled = true;
            btn.className = "w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-cardBg text-gray-600 border border-borderBorder cursor-not-allowed z-10";
        }
        if (statusMsg) statusMsg.innerText = "Wybierz przedmioty do ulepszenia";
        return;
    }

    calculatedChance = GameEngine.calculateRealChance(sourceVal, targetVal);
    const multiplier = (100 / calculatedChance).toFixed(2);
    
    const winChanceEl = document.getElementById('win-chance-text');
    const multEl = document.getElementById('multiplier-text');
    if (winChanceEl) winChanceEl.innerText = `${calculatedChance.toFixed(2)}%`;
    if (multEl) multEl.innerText = `${multiplier}x`;
    
    updateWheelArc(calculatedChance);

    if (addedCash > balance) {
        btn.disabled = true;
        btn.className = "w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-red-950/40 text-red-400 border border-red-800/60 cursor-not-allowed z-10";
        if (statusMsg) statusMsg.innerText = "Brak wystarczającego salda";
        return;
    }
    
    btn.disabled = false;
    btn.className = "upgrade-btn-active w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest text-white border border-accentViolet/50 cursor-pointer z-10";
    if (statusMsg) statusMsg.innerText = `Szansa na sukces: ${calculatedChance.toFixed(2)}%`;
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
    if (!leftArc || !rightArc) return;

    const circumference = 452.38;
    const halfPercent = percentage / 2;
    const strokeLength = (halfPercent / 100) * circumference;

    leftArc.setAttribute('stroke-dasharray', `${strokeLength} ${circumference}`);
    rightArc.setAttribute('stroke-dasharray', `${strokeLength} ${circumference}`);

    const gradient = pickGradient(percentage);
    leftArc.setAttribute('stroke', gradient);
    rightArc.setAttribute('stroke', gradient);
}

async function startUpgrade() {
    if (isSpinning || !selectedTargetItem) return;
    if (addedCash > balance) return;

    const rateCheck = GameEngine.canSpin();
    const statusMsg = document.getElementById('status-msg');
    if (!rateCheck.allowed) {
        if (statusMsg) statusMsg.innerHTML = `<span class="text-yellow-400 font-bold"><i class="fa-solid fa-clock mr-1"></i> ${rateCheck.reason}</span>`;
        return;
    }

    const sourceVal = (selectedSourceItem ? selectedSourceItem.price : 0) + addedCash;
    const targetVal = selectedTargetItem.price;
    const chance = GameEngine.calculateRealChance(sourceVal, targetVal);

    const rollRes = GameEngine.rollOutcome(chance);
    const isWin = rollRes.outcome;

    if (addedCash > 0) {
        balance -= addedCash;
        updateBalanceDisplay();
        const slider = document.getElementById('cash-slider');
        if (slider) slider.max = Math.max(0, balance).toFixed(2);
    }

    isSpinning = true;
    GameEngine.recordSpin();

    const btn = document.getElementById('upgrade-btn');
    if (btn) {
        btn.disabled = true;
        btn.className = "w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-cardBg text-gray-500 border border-borderBorder cursor-not-allowed z-10";
        btn.innerText = "LOSOWANIE...";
    }

    const wonItemSnapshot = { ...selectedTargetItem };
    const sacrificedItemSnapshot = selectedSourceItem ? { ...selectedSourceItem } : null;

    const targetOffsetDeg = isWin
        ? (Math.random() * (chance / 2) + 1)
        : (chance / 2 + 5 + Math.random() * (360 - chance - 10));

    const totalRotations = (5 * 360) + targetOffsetDeg;
    const needle = document.getElementById('needle');
    const duration = 4500;

    if (needle) {
        needle.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.9, 0.2, 1)`;
        needle.style.transform = `rotate(${totalRotations}deg)`;
    }

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
        finishUpgrade(isWin, totalRotations, wonItemSnapshot, sacrificedItemSnapshot);
    }, duration);
}

function finishUpgrade(isWin, finalDegree, wonItem, sacrificedItem) {
    isSpinning = false;

    const normalizedDegree = finalDegree % 360;
    const needle = document.getElementById('needle');
    if (needle) {
        needle.style.transition = 'none';
        needle.style.transform = `rotate(${normalizedDegree}deg)`;
    }

    const statusMsg = document.getElementById('status-msg');

    if (isWin) {
        AudioSynth.playWin();
        if (statusMsg) statusMsg.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-check mr-1"></i> ULEPSZENIE UDANE!</span>`;
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
        if (statusMsg) statusMsg.innerHTML = `<span class="text-red-400 font-bold"><i class="fa-solid fa-xmark mr-1"></i> ULEPSZENIE NIEUDANE</span>`;
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
        if (needle) {
            needle.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';
            needle.style.transform = 'rotate(0deg)';
        }
    }, 800);

    const sliderEl = document.getElementById('cash-slider');
    if (sliderEl) {
        sliderEl.max = Math.max(0, balance).toFixed(2);
        sliderEl.value = 0;
    }
    onCashSliderChange(0);
    clearSourceItem();
    clearTargetItem();
    
    const btn = document.getElementById('upgrade-btn');
    if (btn) btn.innerText = "ULEPSZ";

    setTimeout(() => GameEngine.resetRateLimit(), 2500);
}

function openResultModal(isWin, item) {
    if (!item) return;
    const modal = document.getElementById('result-modal');
    const content = document.getElementById('result-modal-content');
    const icon = document.getElementById('modal-status-icon');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');

    if (!modal) return;

    if (isWin) {
        if (icon) {
            icon.className = "w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 relative z-10";
            icon.innerHTML = `<i class="fa-solid fa-trophy"></i>`;
        }
        if (title) {
            title.className = "font-rajdhani text-2xl font-bold uppercase tracking-wider text-emerald-400 relative z-10";
            title.innerText = "WYGRANA!";
        }
        if (desc) desc.innerText = "Twój nový skin powędrował do ekwipunku.";
    } else {
        if (icon) {
            icon.className = "w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 bg-red-500/20 text-red-400 border border-red-500/50 relative z-10";
            icon.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        }
        if (title) {
            title.className = "font-rajdhani text-2xl font-bold uppercase tracking-wider text-red-400 relative z-10";
            title.innerText = "PORAŻKA!";
        }
        if (desc) desc.innerText = "Przedmiot spłonął podczas próby ulepszenia.";
    }
    
    const imgEl = document.getElementById('modal-item-img');
    const nameEl = document.getElementById('modal-item-name');
    const priceEl = document.getElementById('modal-item-price');

    if (imgEl) imgEl.src = item.img;
    if (nameEl) nameEl.innerText = item.name;
    if (priceEl) priceEl.innerText = `$${item.price.toFixed(2)}`;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (content) {
            content.classList.remove('modal-in');
            void content.offsetWidth;
            content.classList.add('modal-in');
        }
    }, 10);

    if (isWin && content) {
        setTimeout(() => spawnParticles(content, 25, ['#10b981', '#34d399', '#6ee7b7', '#8b5cf6', '#38bdf8']), 100);
    }
}

function closeResultModal() {
    const modal = document.getElementById('result-modal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 200);
}

function pushLiveFeed(item, isWin) {
    const feed = document.getElementById('live-feed');
    if (!feed) return;
    const node = document.createElement('div');
    node.className = `bg-cardBg/80 border ${isWin ? 'border-emerald-500/40' : 'border-red-500/40'} rounded-lg px-2.5 py-1.5 flex items-center gap-2 flex-shrink-0 min-w-[130px] transition`;
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
    if (!storeCatalog || storeCatalog.length === 0) return;
    for (let i = 0; i < 8; i++) {
        const item = storeCatalog[Math.floor(Math.random() * storeCatalog.length)];
        pushLiveFeed(item, Math.random() > 0.5);
    }
}

function toggleAudio() {
    audioMuted = !audioMuted;
    const icon = document.getElementById('sound-icon');
    if (icon) {
        icon.className = audioMuted ? "fa-solid fa-volume-xmark text-red-400" : "fa-solid fa-volume-high text-gray-400";
    }
}

function toggleLogin() {
    const btn = document.getElementById('steam-btn-text');
    if (btn) btn.innerText = btn.innerText === "Steam User" ? "Niezalogowany" : "Steam User";
}

const PROMO_CODE = '98CASE';
const PROMO_STORAGE_KEY = 'cscasepro_promo_used';

function openPromoModal() {
    const modal = document.getElementById('promo-modal');
    const msg = document.getElementById('promo-message');
    const input = document.getElementById('promo-input');
    if (modal) modal.classList.remove('hidden');
    if (msg) msg.innerHTML = '';
    if (input) input.value = '';
}

function closePromoModal() {
    const modal = document.getElementById('promo-modal');
    if (modal) modal.classList.add('hidden');
}

function redeemPromoCode() {
    const inputEl = document.getElementById('promo-input');
    const msg = document.getElementById('promo-message');
    if (!inputEl || !msg) return;

    const input = inputEl.value.trim().toUpperCase();

    if (localStorage.getItem(PROMO_STORAGE_KEY) === 'true') {
        msg.innerHTML = `<span class="text-red-400 font-bold">❌ Ten kod został już wykorzystany na tym koncie.</span>`;
        return;
    }

    if (input !== PROMO_CODE) {
        msg.innerHTML = `<span class="text-red-400 font-bold">❌ Nieprawidłowy kod.</span>`;
        return;
    }

    const promoItems = [
        { id: 'promo1_' + Date.now(), name: 'AK-47 | Safari Mesh', wear: 'FT', price: 0.46, rarity: 'rarity-milspec', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wjFL0P-re6xSNPGdMWuZxuZi_rIxSirkkElyt2qEzI2heXiTaVIiX5siROQJtxnul4XnYbvgswOMgolbjXKpnRk9Yjk' },
        { id: 'promo2_' + Date.now(), name: 'M4A4 | Urban DDPAT', wear: 'FT', price: 0.75, rarity: 'rarity-milspec', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAopC0PaqeKV5H-WBDFicyOl-pK8xF3DjzR5_4zncnouhcSjGPQ8jA5B3ELFbuhPqloDkPrvjsgXY2t5N02yg2Rf5X8A9' },
        { id: 'promo3_' + Date.now(), name: 'P2000 | Imperial', wear: 'MW', price: 1.25, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0POjV7Q_cKDDMW6d0etkueBlcDu2kSIrujqNjsGrJH6XPQ9xAsZ5FLIDtBG5mtfhY7nl4gGNiosTzH792ntOvC1stbsDT-N7ra_mVv2F' }
    ];

    promoItems.forEach(it => inventory.push(it));
    localStorage.setItem(PROMO_STORAGE_KEY, 'true');

    renderPlayerInventory();
    msg.innerHTML = `<span class="text-emerald-400 font-bold">✅ Odebrano! Dodano skiny do ekwipunku.</span>`;

    setTimeout(() => closePromoModal(), 1500);
}

function openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    const msg = document.getElementById('payment-message');
    if (modal) modal.classList.remove('hidden');
    if (msg) msg.innerHTML = '';
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('hidden');
}

function confirmPayment() {
    const inputEl = document.getElementById('payment-input');
    const msg = document.getElementById('payment-message');
    const directCheckbox = document.getElementById('direct-balance-checkbox');
    if (!inputEl || !msg) return;

    const amount = parseFloat(inputEl.value);
    if (isNaN(amount) || amount <= 0) {
        msg.innerHTML = `<span class="text-red-400 font-bold">❌ Wpisz poprawną kwotę.</span>`;
        return;
    }

    const directToBalance = directCheckbox ? directCheckbox.checked : false;

    if (directToBalance) {
        balance += amount;
        msg.innerHTML = `<span class="text-emerald-400 font-bold">✅ Doładowano $${amount.toFixed(2)} do salda!</span>`;
    } else {
        if (!storeCatalog || storeCatalog.length === 0) {
            msg.innerHTML = `<span class="text-red-400 font-bold">❌ Baza skinów jest pusta.</span>`;
            return;
        }

        let remainingAmount = amount;
        let addedItemsCount = 0;

        const sortedCatalog = [...storeCatalog].sort((a, b) => a.price - b.price);
        const minPrice = sortedCatalog[0].price;

        while (remainingAmount >= minPrice) {
            const affordableItems = sortedCatalog.filter(item => item.price <= remainingAmount);
            if (affordableItems.length === 0) break;

            const randomItem = affordableItems[Math.floor(Math.random() * affordableItems.length)];
            
            inventory.push({ 
                ...randomItem, 
                id: 'dep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) 
            });

            remainingAmount -= randomItem.price;
            addedItemsCount++;
        }

        balance += remainingAmount;
        msg.innerHTML = `<span class="text-emerald-400 font-bold">✅ Otrzymano ${addedItemsCount} skin(ów)! Reszta ($${remainingAmount.toFixed(2)}) w saldzie.</span>`;
    }

    renderPlayerInventory();
    updateBalanceDisplay();

    const slider = document.getElementById('cash-slider');
    if (slider) slider.max = Math.max(0, balance).toFixed(2);

    recalculateOdds();

    setTimeout(() => {
        closePaymentModal();
        msg.innerHTML = '';
    }, 2000);
}
