/* ============================================= */
/* ===== KONFIGURACJA I SILNIK GRY ============= */
/* ============================================= */

const CASINO_CONFIG = { RTP_FACTOR: 0.95, MIN_CHANCE: 1.0, MAX_CHANCE: 80.0 };

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
        if (typeof chance !== 'number' || chance < 0 || chance > 100 || isNaN(chance)) throw new Error('Invalid chance');
        const roll = secureRandom() * 100;
        return { roll, chance, outcome: roll <= chance, timestamp: Date.now(), spinId: 'spin_' + (++_spinCount) };
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

/* ============================================= */
/* ===== STAN GLOBALNY ========================== */
/* ============================================= */

let balance = 100.00;
let addedCash = 0.00;
let isSpinning = false;
let audioMuted = false;
let selectedSourceItem = null;
let selectedTargetItem = null;
let calculatedChance = 0;

let inventory = [];
let storeCatalog = [];
let catalogPage = 1;
let shopPage = 1;
const ITEMS_PER_PAGE = 8;

/* ============================================= */
/* ===== AUDIO SYNTH ============================ */
/* ============================================= */

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
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.025);
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
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.3);
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
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.2);
        });
    }
};

/* ============================================= */
/* ===== PARTYKUŁY I POMOCNICZE ================= */
/* ============================================= */

function spawnParticles(container, count, colors) {
    if (!container) return;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 150;
        p.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(p);
        setTimeout(() => p.remove(), 1600);
    }
}

function getRandomWear(minFloat, maxFloat) {
    const wears = [
        { name: 'Factory New', min: 0.00, max: 0.07 },
        { name: 'Minimal Wear', min: 0.07, max: 0.15 },
        { name: 'Field-Tested', min: 0.15, max: 0.38 },
        { name: 'Well-Worn', min: 0.38, max: 0.45 },
        { name: 'Battle-Scarred', min: 0.45, max: 1.00 }
    ];
    const possibleWears = wears.filter(w => w.max > minFloat && w.min < maxFloat);
    const randomWear = possibleWears.length > 0 ? possibleWears[Math.floor(Math.random() * possibleWears.length)] : wears[2];
    const shortMap = { 'Factory New': 'FN', 'Minimal Wear': 'MW', 'Field-Tested': 'FT', 'Well-Worn': 'WW', 'Battle-Scarred': 'BS' };
    return shortMap[randomWear.name] || 'FT';
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        document.body.appendChild(toast);
    }
    const colors = {
        success: 'text-emerald-400 border-emerald-500/40',
        error: 'text-red-400 border-red-500/40',
        info: 'text-[#a78bfa] border-[#8b5cf6]/40'
    };
    toast.className = `fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 modal-shell ${colors[type] || colors.info}`;
    toast.textContent = message;
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 0)';
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, -8px)';
    });
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 0)';
    }, 2200);
}

/* ============================================= */
/* ===== ŁADOWANIE SKINÓW ======================= */
/* ============================================= */

async function loadSkinsData() {
    try {
        const url = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json';
        const response = await fetch(url);
        if (!response.ok) throw new Error("Błąd sieci");
        let data = await response.json();

        const uniqueSkins = Array.from(new Map(data.map(item => [item.name, item])).values());
        uniqueSkins.sort(() => Math.random() - 0.5);
        const selectedSkins = uniqueSkins.slice(0, 1000);

        storeCatalog = selectedSkins.map(skin => {
            let basePrice = 1.00;
            let rarityClass = 'rarity-milspec';
            if (skin.rarity && skin.rarity.name) {
                const rName = skin.rarity.name;
                if (rName === 'Covert') { basePrice = 45.00; rarityClass = 'rarity-covert'; }
                else if (rName === 'Classified') { basePrice = 20.00; rarityClass = 'rarity-classified'; }
                else if (rName === 'Restricted') { basePrice = 8.00; rarityClass = 'rarity-restricted'; }
                else if (rName === 'Mil-Spec Grade') { basePrice = 2.50; }
                else if (rName === 'Industrial Grade' || rName === 'Consumer Grade') { basePrice = 0.50; }
                if (skin.name.includes('★') || (skin.category && skin.category.name === 'Gloves') || rName === 'Extraordinary' || rName === 'Contraband') {
                    basePrice = 350.00;
                    rarityClass = 'rarity-knife';
                }
            }
            const priceMultiplier = 0.7 + (Math.random() * 0.6);
            const finalPrice = (basePrice * priceMultiplier).toFixed(2);
            return {
                id: skin.id || 'skin_' + Math.random(),
                name: skin.name || 'Unknown Skin',
                wear: getRandomWear(skin.min_float || 0, skin.max_float || 1),
                price: parseFloat(finalPrice),
                rarity: rarityClass,
                img: skin.image || ''
            };
        });

        renderPlayerInventory();
        renderStoreCatalog(1);
        renderShop(1);
        populateLiveFeed();
    } catch (error) {
        console.error("Błąd:", error);
        showToast("Nie udało się pobrać skinów z GitHuba.", "error");
    }
}

/* ============================================= */
/* ===== EKWIPUNEK ============================== */
/* ============================================= */

function renderPlayerInventory() {
    const grid = document.getElementById('inventory-grid');
    const badge = document.getElementById('inventory-count-badge');
    if (!grid) return;

    if (badge) badge.textContent = `${inventory.length} szt.`;
    grid.innerHTML = '';

    if (inventory.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center text-gray-500 gap-2 py-8">
                <i class="fa-solid fa-box-open text-2xl"></i>
                <span class="text-xs uppercase font-semibold tracking-wider">Ekwipunek jest pusty</span>
            </div>`;
        return;
    }

    inventory.forEach(item => {
        const card = document.createElement('div');
        const isSelected = selectedSourceItem && selectedSourceItem.id === item.id;
        card.className = `item-card ${item.rarity} p-2 cursor-pointer ${isSelected ? 'ring-2 ring-[#a78bfa]' : ''}`;
        card.innerHTML = `
            <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-start justify-between gap-1">
                    <span class="text-[9px] font-mono uppercase text-gray-400 bg-black/30 px-1.5 py-0.5 rounded">${item.wear}</span>
                    <span class="text-[10px] font-bold text-[#a78bfa]">$${item.price.toFixed(2)}</span>
                </div>
                <div class="flex-1 flex items-center justify-center py-1">
                    <img src="${item.img}" alt="${item.name}" class="max-h-16 sm:max-h-20 w-auto object-contain drop-shadow-lg" onerror="this.style.opacity=0.3">
                </div>
                <div class="text-[10px] font-semibold text-white leading-tight line-clamp-2 min-h-[2.2em]">${item.name}</div>
            </div>
        `;
        card.onclick = () => selectSourceItem(item);
        grid.appendChild(card);
    });
}

function selectSourceItem(item) {
    if (isSpinning) return;
    selectedSourceItem = item;
    addedCash = 0;
    document.getElementById('source-empty').classList.add('hidden');
    document.getElementById('source-filled').classList.remove('hidden');
    document.getElementById('source-img').src = item.img;
    document.getElementById('source-name').textContent = item.name;
    document.getElementById('source-price').textContent = `$${item.price.toFixed(2)}`;
    document.getElementById('offered-item-wear').textContent = item.wear;
    const slider = document.getElementById('cash-slider');
    if (slider) { slider.value = 0; slider.max = Math.max(0, balance).toFixed(2); }
    document.getElementById('cash-add-label').textContent = '$0.00';
    document.getElementById('source-slot').classList.add('border-[#a78bfa]', 'bg-[#a78bfa]/5');
    renderPlayerInventory();
    updateTotals();
}

function clearSourceItem() {
    if (isSpinning) return;
    selectedSourceItem = null;
    addedCash = 0;
    document.getElementById('source-empty').classList.remove('hidden');
    document.getElementById('source-filled').classList.add('hidden');
    document.getElementById('offered-item-wear').textContent = 'Brak';
    const slider = document.getElementById('cash-slider');
    if (slider) slider.value = 0;
    document.getElementById('cash-add-label').textContent = '$0.00';
    document.getElementById('source-slot').classList.remove('border-[#a78bfa]', 'bg-[#a78bfa]/5');
    renderPlayerInventory();
    updateTotals();
}

function sellSelectedItem() {
    if (!selectedSourceItem || isSpinning) return;
    balance = parseFloat((balance + selectedSourceItem.price).toFixed(2));
    inventory = inventory.filter(i => i.id !== selectedSourceItem.id);
    showToast(`Sprzedano: ${selectedSourceItem.name}`, 'success');
    clearSourceItem();
    updateBalanceDisplay();
    renderPlayerInventory();
    const slider = document.getElementById('cash-slider');
    if (slider) slider.max = Math.max(0, balance).toFixed(2);
}

/* ============================================= */
/* ===== KATALOG CELÓW ========================== */
/* ============================================= */

function renderStoreCatalog(page = 1) {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    const search = (document.getElementById('catalog-search')?.value || '').toLowerCase().trim();
    const sort = document.getElementById('catalog-sort')?.value || 'asc';

    let filtered = storeCatalog.filter(item => item.name.toLowerCase().includes(search));
    filtered.sort((a, b) => sort === 'asc' ? a.price - b.price : b.price - a.price);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    catalogPage = page;

    const start = (page - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    const totalEl = document.getElementById('catalog-page-total');
    if (totalEl) totalEl.textContent = `/ ${totalPages}`;
    const pageInput = document.getElementById('catalog-page-input');
    if (pageInput) pageInput.value = page;

    grid.innerHTML = '';

    if (pageItems.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center text-gray-500 gap-2 py-8">
                <i class="fa-solid fa-box-open text-2xl"></i>
                <span class="text-xs uppercase font-semibold tracking-wider">Brak wyników</span>
            </div>`;
        return;
    }

    pageItems.forEach(item => {
        const card = document.createElement('div');
        card.className = `item-card ${item.rarity} p-2 cursor-pointer group`;
        card.innerHTML = `
            <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-start justify-between gap-1">
                    <span class="text-[9px] font-mono uppercase text-gray-400 bg-black/30 px-1.5 py-0.5 rounded">${item.wear}</span>
                    <span class="text-[10px] font-bold text-[#38bdf8]">$${item.price.toFixed(2)}</span>
                </div>
                <div class="flex-1 flex items-center justify-center py-1">
                    <img src="${item.img}" alt="${item.name}" class="max-h-16 sm:max-h-20 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-200" onerror="this.style.opacity=0.3">
                </div>
                <div class="text-[10px] font-semibold text-white leading-tight line-clamp-2 min-h-[2.2em]">${item.name}</div>
            </div>
        `;
        card.onclick = () => selectTargetItem(item);
        grid.appendChild(card);
    });
}

function selectTargetItem(item) {
    if (isSpinning) return;
    selectedTargetItem = item;
    document.getElementById('target-empty').classList.add('hidden');
    document.getElementById('target-filled').classList.remove('hidden');
    document.getElementById('target-img').src = item.img;
    document.getElementById('target-name').textContent = item.name;
    document.getElementById('target-price').textContent = `$${item.price.toFixed(2)}`;
    document.getElementById('target-item-wear').textContent = item.wear;
    document.getElementById('target-slot').classList.add('border-[#38bdf8]', 'bg-[#38bdf8]/5');
    updateTotals();
}

function clearTargetItem() {
    if (isSpinning) return;
    selectedTargetItem = null;
    document.getElementById('target-empty').classList.remove('hidden');
    document.getElementById('target-filled').classList.add('hidden');
    document.getElementById('target-item-wear').textContent = 'Brak';
    document.getElementById('target-slot').classList.remove('border-[#38bdf8]', 'bg-[#38bdf8]/5');
    updateTotals();
}

function onCatalogSearch() { renderStoreCatalog(1); }

/* ============================================= */
/* ===== SKLEP Z SKINAMI ======================== */
/* ============================================= */

function renderShop(page = 1) {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;

    const search = (document.getElementById('shop-search')?.value || '').toLowerCase().trim();
    const sort = document.getElementById('shop-sort')?.value || 'asc';

    let filtered = storeCatalog.filter(item => item.name.toLowerCase().includes(search));
    filtered.sort((a, b) => sort === 'asc' ? a.price - b.price : b.price - a.price);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    shopPage = page;

    const start = (page - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    const badge = document.getElementById('shop-count-badge');
    if (badge) badge.textContent = `${filtered.length} szt.`;
    const totalEl = document.getElementById('shop-page-total');
    if (totalEl) totalEl.textContent = `/ ${totalPages}`;
    const pageInput = document.getElementById('shop-page-input');
    if (pageInput) pageInput.value = page;

    grid.innerHTML = '';

    if (pageItems.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center text-gray-500 gap-2 py-8">
                <i class="fa-solid fa-box-open text-2xl"></i>
                <span class="text-xs uppercase font-semibold tracking-wider">Brak wyników</span>
            </div>`;
        return;
    }

    pageItems.forEach(item => {
        const card = document.createElement('div');
        card.className = `item-card ${item.rarity} p-2 cursor-pointer group`;
        card.innerHTML = `
            <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-start justify-between gap-1">
                    <span class="text-[9px] font-mono uppercase text-gray-400 bg-black/30 px-1.5 py-0.5 rounded">${item.wear}</span>
                    <span class="text-[10px] font-bold text-emerald-400">$${item.price.toFixed(2)}</span>
                </div>
                <div class="flex-1 flex items-center justify-center py-1">
                    <img src="${item.img}" alt="${item.name}" class="max-h-16 sm:max-h-20 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-200" onerror="this.style.opacity=0.3">
                </div>
                <div class="text-[10px] font-semibold text-white leading-tight line-clamp-2 min-h-[2.2em]">${item.name}</div>
                <button onclick="event.stopPropagation(); buyShopItem('${item.id}')"
                    class="mt-1.5 w-full py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-400/50 text-[10px] font-bold uppercase tracking-wider transition">
                    <i class="fa-solid fa-cart-shopping mr-1"></i> Kup
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function buyShopItem(itemId) {
    const item = storeCatalog.find(i => i.id === itemId);
    if (!item) return;

    if (balance < item.price) {
        showToast('Za mało środków na saldzie!', 'error');
        const panel = document.querySelector('.stat-badge');
        if (panel) { panel.classList.add('shake'); setTimeout(() => panel.classList.remove('shake'), 400); }
        return;
    }

    balance = parseFloat((balance - item.price).toFixed(2));
    updateBalanceDisplay();

    const newItem = {
        ...item,
        id: 'inv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
    };
    inventory.push(newItem);
    renderPlayerInventory();

    AudioSynth.init();
    AudioSynth.playWin();
    showToast(`Kupiono: ${item.name}`, 'success');

    const slider = document.getElementById('cash-slider');
    if (slider) {
        slider.max = Math.max(0, balance).toFixed(2);
        if (parseFloat(slider.value) > balance) slider.value = 0;
    }
}

function onShopSearch() { renderShop(1); }

/* ============================================= */
/* ===== PAGINACJA ============================== */
/* ============================================= */

function changePage(context, dir) {
    if (context === 'catalog') {
        catalogPage += dir;
        if (catalogPage < 1) catalogPage = 1;
        renderStoreCatalog(catalogPage);
    } else if (context === 'shop') {
        shopPage += dir;
        if (shopPage < 1) shopPage = 1;
        renderShop(shopPage);
    }
}

function jumpToPage(context, value) {
    const page = parseInt(value) || 1;
    if (context === 'catalog') { catalogPage = page; renderStoreCatalog(page); }
    else if (context === 'shop') { shopPage = page; renderShop(page); }
}

/* ============================================= */
/* ===== SALDO I SLIDER ========================= */
/* ============================================= */

function updateBalanceDisplay() {
    const el = document.getElementById('user-balance');
    if (el) el.textContent = `$${balance.toFixed(2)}`;
}

function onCashSliderChange(value) {
    if (isSpinning) return;
    addedCash = parseFloat(value) || 0;
    if (addedCash > balance) addedCash = balance;
    document.getElementById('cash-add-label').textContent = `$${addedCash.toFixed(2)}`;
    updateTotals();
}

function updateTotals() {
    const sourceVal = (selectedSourceItem ? selectedSourceItem.price : 0) + addedCash;
    document.getElementById('total-source-val').textContent = `$${sourceVal.toFixed(2)}`;

    const targetVal = selectedTargetItem ? selectedTargetItem.price : 0;
    document.getElementById('total-target-val').textContent = `$${targetVal.toFixed(2)}`;

    const btn = document.getElementById('upgrade-btn');
    const status = document.getElementById('status-msg');

    if (!selectedSourceItem && addedCash <= 0) {
        btn.disabled = true;
        btn.className = 'w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed z-10';
        status.textContent = 'Wybierz przedmioty';
        document.getElementById('win-chance-text').textContent = '0.00%';
        document.getElementById('multiplier-text').textContent = '0.00x';
        updateWheelArc(0);
        return;
    }
    if (!selectedTargetItem) {
        btn.disabled = true;
        btn.className = 'w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed z-10';
        status.textContent = 'Wybierz cel ulepszenia';
        return;
    }
    if (targetVal <= sourceVal) {
        btn.disabled = true;
        btn.className = 'w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed z-10';
        status.textContent = 'Cel musi być droższy';
        document.getElementById('win-chance-text').textContent = '0.00%';
        document.getElementById('multiplier-text').textContent = '0.00x';
        updateWheelArc(0);
        return;
    }

    calculatedChance = GameEngine.calculateRealChance(sourceVal, targetVal);
    const multiplier = (targetVal / sourceVal).toFixed(2);
    document.getElementById('win-chance-text').textContent = `${calculatedChance.toFixed(2)}%`;
    document.getElementById('multiplier-text').textContent = `${multiplier}x`;
    updateWheelArc(calculatedChance);

    btn.disabled = false;
    btn.className = 'w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all upgrade-btn-active text-white cursor-pointer z-10 hover:brightness-110';
    status.textContent = 'Gotowe do ulepszenia';
}

function updateWheelArc(chance) {
    const circumference = 2 * Math.PI * 72;
    const arcLength = (chance / 100) * circumference;
    const left = document.getElementById('win-arc-left');
    const right = document.getElementById('win-arc-right');
    if (left) left.setAttribute('stroke-dasharray', `${arcLength} ${circumference}`);
    if (right) right.setAttribute('stroke-dasharray', `${arcLength} ${circumference}`);
}

/* ============================================= */
/* ===== UPGRADE ================================ */
/* ============================================= */

function startUpgrade() {
    if (isSpinning || !selectedSourceItem || !selectedTargetItem) return;

    const sourceVal = (selectedSourceItem ? selectedSourceItem.price : 0) + addedCash;
    const targetVal = selectedTargetItem ? selectedTargetItem.price : 0;

    const spinCheck = GameEngine.canSpin();
    if (!spinCheck.allowed) {
        showToast(spinCheck.reason, 'error');
        return;
    }

    isSpinning = true;
    GameEngine.recordSpin();

    const btn = document.getElementById('upgrade-btn');
    btn.disabled = true;
    btn.textContent = 'KRĘCENIE...';
    document.getElementById('status-msg').textContent = 'Losowanie...';

    const result = GameEngine.rollOutcome(calculatedChance);

    // Animacja igły
    const needle = document.getElementById('needle');
    let angle = 0;
    const duration = 2800;
    const start = performance.now();
    const targetAngle = 720 + Math.random() * 360;

    function animateNeedle(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        angle = eased * targetAngle;
        if (needle) needle.style.transform = `rotate(${angle}deg)`;
        if (progress < 1) {
            if (Math.random() < 0.15) AudioSynth.playTick(1 - progress);
            requestAnimationFrame(animateNeedle);
        } else {
            finishUpgrade(result, sourceVal, targetVal);
        }
    }
    requestAnimationFrame(animateNeedle);
}

function finishUpgrade(result, sourceVal, targetVal) {
    isSpinning = false;

    if (result.outcome) {
        // WYGRANA
        if (addedCash > 0) {
            balance = parseFloat((balance - addedCash).toFixed(2));
        }
        inventory = inventory.filter(i => i.id !== selectedSourceItem.id);

        const winItem = {
            ...selectedTargetItem,
            id: 'inv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
        };
        inventory.push(winItem);

        AudioSynth.playWin();
        showResultModal(true, winItem);
    } else {
        // PRZEGRANA
        if (addedCash > 0) {
            balance = parseFloat((balance - addedCash).toFixed(2));
        }
        inventory = inventory.filter(i => i.id !== selectedSourceItem.id);

        AudioSynth.playLoss();
        showResultModal(false, selectedTargetItem);
    }

    updateBalanceDisplay();
    renderPlayerInventory();
    clearSourceItem();
    clearTargetItem();

    const slider = document.getElementById('cash-slider');
    if (slider) { slider.max = Math.max(0, balance).toFixed(2); slider.value = 0; }

    const btn = document.getElementById('upgrade-btn');
    btn.textContent = 'ULEPSZ';
}

/* ============================================= */
/* ===== MODAL WYNIKU =========================== */
/* ============================================= */

function showResultModal(isWin, item) {
    const modal = document.getElementById('result-modal');
    const content = document.getElementById('result-modal-content');
    if (!modal) return;

    const icon = document.getElementById('modal-status-icon');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const img = document.getElementById('modal-item-img');
    const name = document.getElementById('modal-item-name');
    const price = document.getElementById('modal-item-price');

    if (isWin) {
        icon.className = 'w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 border shadow-inner bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
        icon.innerHTML = '<i class="fa-solid fa-trophy"></i>';
        title.textContent = 'WYGRANA!';
        desc.textContent = 'Skin powędrował do ekwipunku.';
        spawnParticles(content, 30, ['#34d399', '#10b981', '#a78bfa', '#fde047']);
    } else {
        icon.className = 'w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 border shadow-inner bg-red-500/15 border-red-500/30 text-red-400';
        icon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        title.textContent = 'PRZEGRANA';
        desc.textContent = 'Przedmiot przepadł.';
    }

    img.src = item.img;
    name.textContent = item.name;
    price.textContent = `$${item.price.toFixed(2)}`;

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        content.classList.add('modal-in');
    });
}

function closeResultModal() {
    const modal = document.getElementById('result-modal');
    const content = document.getElementById('result-modal-content');
    if (!modal) return;
    modal.classList.add('opacity-0');
    content.classList.remove('modal-in');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

/* ============================================= */
/* ===== MODAL PROMO ============================ */
/* ============================================= */

function openPromoModal() {
    const modal = document.getElementById('promo-modal');
    if (modal) modal.classList.remove('hidden');
}

function closePromoModal() {
    const modal = document.getElementById('promo-modal');
    if (modal) modal.classList.add('hidden');
    const msg = document.getElementById('promo-message');
    if (msg) msg.textContent = '';
}

function redeemPromoCode() {
    const input = document.getElementById('promo-input');
    const msg = document.getElementById('promo-message');
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        msg.textContent = 'Wpisz kod!';
        msg.className = 'text-[11px] mb-2 h-4 text-red-400';
        return;
    }

    if (code === 'FREE') {
        balance = parseFloat((balance + 10).toFixed(2));
        updateBalanceDisplay();
        msg.textContent = '+$10.00 dodane do salda!';
        msg.className = 'text-[11px] mb-2 h-4 text-emerald-400';
        showToast('Kod wykorzystany: +$10.00', 'success');
        setTimeout(closePromoModal, 1500);
    } else {
        msg.textContent = 'Nieprawidłowy kod.';
        msg.className = 'text-[11px] mb-2 h-4 text-red-400';
    }
}

/* ============================================= */
/* ===== AUDIO TOGGLE =========================== */
/* ============================================= */

function toggleAudio() {
    audioMuted = !audioMuted;
    const icon = document.getElementById('sound-icon');
    if (icon) {
        icon.className = audioMuted ? 'fa-solid fa-volume-xmark text-sm' : 'fa-solid fa-volume-high text-sm';
    }
}

/* ============================================= */
/* ===== LIVE FEED ============================== */
/* ============================================= */

function populateLiveFeed() {
    const feed = document.getElementById('live-feed');
    if (!feed) return;
    feed.innerHTML = '';
    const sample = storeCatalog.slice(0, 8);
    sample.forEach(item => {
        const el = document.createElement('div');
        el.className = 'live-drop-item flex items-center gap-2 px-2 py-1 shrink-0';
        el.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="w-6 h-6 object-contain" onerror="this.style.opacity=0.3">
            <span class="text-[10px] font-semibold text-white truncate max-w-[100px]">${item.name}</span>
            <span class="text-[10px] font-bold text-[#a78bfa]">$${item.price.toFixed(2)}</span>
        `;
        feed.appendChild(el);
    });
}

/* ============================================= */
/* ===== STEAM LOGIN (PLACEHOLDER) ============= */
/* ============================================= */

function toggleLogin() {
    showToast('Logowanie Steam — wkrótce!', 'info');
}

/* ============================================= */
/* ===== START ================================== */
/* ============================================= */

window.addEventListener('DOMContentLoaded', () => {
    loadSkinsData();
    updateBalanceDisplay();
    updateWheelArc(0);

    const slider = document.getElementById('cash-slider');
    if (slider) slider.max = Math.max(0, balance).toFixed(2);

    renderShop(1);
});
