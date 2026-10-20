// ==========================================
// TUTAJ WKLEJ ZAWARTOŚĆ PLIKU skins.json
// Pamiętaj, że musi zaczynać się od [ a kończyć na ];
// ==========================================
const RAW_SKINS_DATA = [
  // Przykład (podmień to na swoją zawartość z pliku skins.json):
  {
    "id": "skin-e757fd7191f9",
    "name": "★ Hand Wraps | Spruce DDPAT",
    "min_float": 0.06,
    "max_float": 0.8,
    "rarity": { "name": "Extraordinary" },
    "image": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu4vx603vRA_Olpfu-TVJ7uK9V6xsLvSEHGaA_u13ve5WSDu2jCIrujqNjsH_InuUaQQmDJd2Fu4NshO7kIGyYeu24Affg98UxCX_iXhJ5i465bwHT-N7rXbV3WG0"
  }
  // ... reszta skinów ...
]; // <-- PAMIĘTAJ O TYM NAWIASIE I ŚREDNIKU

// ==========================================
// LOGIKA GRY (NIE RUSZAJ PONIŻEJ)
// ==========================================

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

let inventory = []; 
let storeCatalog = []; 

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

// --- FUNKCJE PRZETWARZAJĄCE DANE ZE ZMIENNEJ RAW_SKINS_DATA ---
function getRandomWear(minFloat, maxFloat) {
    const wears = [
        { name: 'Factory New', min: 0.00, max: 0.07 },
        { name: 'Minimal Wear', min: 0.07, max: 0.15 },
        { name: 'Field-Tested', min: 0.15, max: 0.38 },
        { name: 'Well-Worn', min: 0.38, max: 0.45 },
        { name: 'Battle-Scarred', min: 0.45, max: 1.00 }
    ];
    const possibleWears = wears.filter(w => w.max > minFloat && w.min < maxFloat);
    const randomWear = possibleWears.length > 0 
        ? possibleWears[Math.floor(Math.random() * possibleWears.length)] 
        : wears[2]; // Domyślnie FT
    
    const shortMap = {
        'Factory New': 'FN',
        'Minimal Wear': 'MW',
        'Field-Tested': 'FT',
        'Well-Worn': 'WW',
        'Battle-Scarred': 'BS'
    };
    return shortMap[randomWear.name] || 'FT';
}

function processSkinsData() {
    try {
        // Mieszamy tablicę
        RAW_SKINS_DATA.sort(() => Math.random() - 0.5);

        // Bierzemy 50% skinów (lub mniej, jeśli plik jest mniejszy)
        const halfCount = Math.floor(RAW_SKINS_DATA.length * 0.5);
        const selectedSkins = RAW_SKINS_DATA.slice(0, halfCount);

        storeCatalog = selectedSkins.map(skin => {
            let basePrice = 1.00;
            let rarityClass = 'rarity-milspec';

            if (skin.rarity && skin.rarity.name) {
                const rName = skin.rarity.name;
                // Mapowanie rzadkości z JSON na klasy CSS z Twojej strony
                if (rName === 'Covert' || rName === 'Extraordinary' || rName === 'Contraband') { 
                    basePrice = 50.00; 
                    rarityClass = 'rarity-covert'; 
                }
                else if (rName === 'Classified') { basePrice = 20.00; rarityClass = 'rarity-classified'; }
                else if (rName === 'Restricted') { basePrice = 5.00; rarityClass = 'rarity-restricted'; }
                else if (rName === 'Mil-Spec Grade') { basePrice = 1.50; }
                else if (rName === 'Industrial Grade' || rName === 'Consumer Grade') { basePrice = 0.50; }
                
                // Specjalne traktowanie dla broni i rękawic
                if (skin.name.includes('★') || skin.category.name === 'Gloves' || rName === 'Extraordinary') {
                    basePrice = 150.00; 
                    rarityClass = 'rarity-knife';
                }
            }

            const finalPrice = (basePrice * (0.8 + Math.random() * 0.4)).toFixed(2);

            return {
                id: skin.id || 'skin_' + Math.random(),
                name: skin.name || 'Unknown Skin',
                wear: getRandomWear(skin.min_float || 0, skin.max_float || 1),
                price: parseFloat(finalPrice),
                rarity: rarityClass,
                img: skin.image || ''
            };
        });

        // Dodaj 5 startowych skinów do ekwipunku, żeby nie było pusto
        for(let i=0; i<5; i++) {
            if(storeCatalog.length === 0) break;
            const randomItem = storeCatalog[Math.floor(Math.random() * storeCatalog.length)];
            inventory.push({ ...randomItem, id: 'start_' + Date.now() + '_' + i });
        }

        // Odśwież widoki
        renderPlayerInventory();
        renderStoreCatalog();
        populateLiveFeed();
        
    } catch (error) {
        console.error("Błąd podczas przetwarzania danych skinów:", error);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    processSkinsData(); // Przetwarzamy dane wklejone do JS
    updateBalanceDisplay();
    updateWheelArc(0);
    
    const slider = document.getElementById('cash-slider');
    if (slider) slider.max = Math.max(0, balance).toFixed(2);
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
    if (badge) badge.innerText = `${inventory.length} szt.`;
    
    inventory.forEach(item => {
        const isSelected = selectedSourceItem && selectedSourceItem.id === item.id;
        const node = document.createElement('div');
        node.className = `item-card bg-cardBg/80 border ${isSelected ? 'border-accentViolet bg-accentViolet/10' : 'border-borderBorder/60'} ${item.rarity} rounded-lg p-2 flex flex-col justify-between cursor-pointer transition select-none h-24 sm:h-28`;
        node.onclick = () => selectSourceItem(item);
        node.innerHTML = `
            <div class="flex justify-between items-center text-[9px] font-bold text-gray-400">
                <span>${item.wear}</span>
                <span class="text-white font-mono">$${item.price.toFixed(2)}</span>
            </div>
            <img src="${item.img}" class="w-14 sm:w-16 h-10 sm:h-12 object-contain mx-auto my-0.5" alt="${item.name}">
            <div class="text-[9px] sm:text-[10px] font-semibold text-gray-200 truncate text-center">${item.name}</div>
        `;
        grid.appendChild(node);
    });
}

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
        node.className = `item-card bg-cardBg/80 border ${isSelected ? 'border-accentBlue bg-accentBlue/10' : 'border-borderBorder/60'} ${item.rarity} rounded-lg p-2 flex flex-col justify-between cursor-pointer transition select-none h-24 sm:h-28`;
        node.onclick = () => selectTargetItem(item);
        node.innerHTML = `
            <div class="flex justify-between items-center text-[9px] font-bold text-gray-400">
                <span>${item.wear}</span>
                <span class="text-white font-mono">$${item.price.toFixed(2)}</span>
            </div>
            <img src="${item.img}" class="w-14 sm:w-16 h-10 sm:h-12 object-contain mx-auto my-0.5" alt="${item.name}">
            <div class="text-[9px] sm:text-[10px] font-semibold text-gray-200 truncate text-center">${item.name}</div>
        `;
        grid.appendChild(node);
    });
}

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
        node.className = `item-card bg-cardBg/80 border border-borderBorder/60 ${item.rarity} rounded-lg p-2 flex flex-col justify-between cursor-pointer transition select-none h-24 sm:h-28 ${canAfford ? 'hover:border-emerald-500/60' : 'opacity-60 cursor-not-allowed'}`;
        node.onclick = () => buyItemDirectly(item);
        node.innerHTML = `
            <div class="flex justify-between items-center text-[9px] font-bold text-gray-400">
                <span>${item.wear}</span>
                <span class="${canAfford ? 'text-emerald-400' : 'text-red-400'} font-mono font-bold">Kup $${item.price.toFixed(2)}</span>
            </div>
            <img src="${item.img}" class="w-14 sm:w-16 h-10 sm:h-12 object-contain mx-auto my-0.5" alt="${item.name}">
            <div class="text-[9px] sm:text-[10px] font-semibold text-gray-200 truncate text-center">${item.name}</div>
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

    if (msg) msg.innerHTML = `<span class="text-emerald-400 font-bold">✅ Zakupiono ${item.name}!</span>`;
    setTimeout(() => { if (msg) msg.innerHTML = ''; }, 2500);
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
        document.getElementById('cash-add-label').innerText = `$${addedCash.toFixed(2)}`;
    }

    const sourceVal = (selectedSourceItem ? selectedSourceItem.price : 0) + addedCash;
    const targetVal = selectedTargetItem ? selectedTargetItem.price : 0;

    document.getElementById('total-source-val').innerText = `$${sourceVal.toFixed(2)}`;
    document.getElementById('total-target-val').innerText = `$${targetVal.toFixed(2)}`;

    if (sourceVal <= 0 || targetVal <= 0 || !btn) {
        calculatedChance = 0;
        updateWheelArc(0);
        document.getElementById('win-chance-text').innerText = '0.00%';
        document.getElementById('multiplier-text').innerText = '0.00x';
        if (btn) {
            btn.disabled = true;
            btn.className = "w-full py-3 sm:py-3.5 rounded-xl font-rajdhani text-lg sm:text-xl font-bold uppercase tracking-widest transition-all bg-cardBg text-gray-600 border border-borderBorder cursor-not-allowed z-10";
        }
        if (statusMsg) statusMsg.innerText = "Wybierz przedmioty do ulepszenia";
        return;
    }

    calculatedChance = GameEngine.calculateRealChance(sourceVal, targetVal);
    const multiplier = (100 / calculatedChance).toFixed(2);
    
    document.getElementById('win-chance-text').innerText = `${calculatedChance.toFixed(2)}%`;
    document.getElementById('multiplier-text').innerText = `${multiplier}x`;
    
    updateWheelArc(calculatedChance);

    if (addedCash > balance) {
        btn.disabled = true;
        btn.className = "w-full py-3 sm:py-3.5 rounded-xl font-rajdhani text-lg sm:text-xl font-bold uppercase tracking-widest transition-all bg-red-950/40 text-red-400 border border-red-800/60 cursor-not-allowed z-10";
        if (statusMsg) statusMsg.innerText = "Brak wystarczającego salda";
        return;
    }
    
    btn.disabled = false;
    btn.className = "upgrade-btn-active w-full py-3 sm:py-3.5 rounded-xl font-rajdhani text-lg sm:text-xl font-bold uppercase tracking-widest text-white border border-accentViolet/50 cursor-pointer z-10";
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
        btn.className = "w-full py-3 sm:py-3.5 rounded-xl font-rajdhani text-lg sm:text-xl font-bold uppercase tracking-widest transition-all bg-cardBg text-gray-500 border border-borderBorder cursor-not-allowed z-10";
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
            icon.className = "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 relative z-10";
            icon.innerHTML = `<i class="fa-solid fa-trophy"></i>`;
        }
        if (title) {
            title
