/* ============================================= */
/* ===== KONFIGURACJA I SILNIK GRY ============= */
/* ============================================= */

const CASINO_CONFIG = { RTP_FACTOR: 0.95, MIN_CHANCE: 1.0, MAX_CHANCE: 80.0 };

const GameEngine = (() => {
    let _lastSpinTime = 0; let _spinCount = 0; const MIN_SPIN_INTERVAL = 2500;
    function secureRandom() { const arr = new Uint32Array(1); crypto.getRandomValues(arr); return arr[0] / 4294967296; }
    function canSpin() { const now = Date.now(); if (now - _lastSpinTime < MIN_SPIN_INTERVAL) return { allowed: false, reason: 'Zwolnij! Odczekaj chwilę.' }; return { allowed: true }; }
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
    return { canSpin, calculateRealChance, rollOutcome, getSpinCount: () => _spinCount, resetRateLimit: () => { _lastSpinTime = 0; }, recordSpin: () => { _lastSpinTime = Date.now(); } };
})();

/* ============================================= */
/* ===== STAN GLOBALNY ========================== */
/* ============================================= */

let balance = 100.00; // Startowe saldo
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
const SHOP_ITEMS_PER_PAGE = 15;

/* ============================================= */
/* ===== AUDIO SYNTH ============================ */
/* ============================================= */

const AudioSynth = {
    ctx: null,
    init() { if (!this.ctx) { const AudioContext = window.AudioContext || window.webkitAudioContext; if (AudioContext) this.ctx = new AudioContext(); } },
    playTick(speedFactor = 1) {
        if (audioMuted) return; this.init(); if (!this.ctx) return;
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = 'sine'; const baseFreq = 500 + speedFactor * 500;
        osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.025);
        const vol = Math.min(0.02 + speedFactor * 0.025, 0.06);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.025);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.025);
    },
    playWin() {
        if (audioMuted) return; this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
            osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.1, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.3);
        });
    },
    playLoss() {
        if (audioMuted) return; this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [200, 160, 120].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            gain.gain.setValueAtTime(0.07, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.2);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.1); osc.stop(now + idx * 0.1 + 0.2);
        });
    }
};

/* ============================================= */
/* ===== POMOCNICZE ============================= */
/* ============================================= */

function spawnParticles(container, count, colors) {
    if (!container) return;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div'); p.className = 'particle';
        const angle = Math.random() * Math.PI * 2; const distance = 80 + Math.random() * 150;
        p.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
        p.style.left = '50%'; p.style.top = '50%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(p); setTimeout(() => p.remove(), 1600);
    }
}

function getRandomWear(minFloat, maxFloat) {
    const wears = [
        { name: 'Factory New', min: 0.00, max: 0.07 }, { name: 'Minimal Wear', min: 0.07, max: 0.15 },
        { name: 'Field-Tested', min: 0.15, max: 0.38 }, { name: 'Well-Worn', min: 0.38, max: 0.45 },
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
        toast = document.createElement('div'); toast.id = 'app-toast'; document.body.appendChild(toast);
    }
    const colors = { success: 'text-lime-400 border-lime-500/40', error: 'text-red-400 border-red-500/40', info: 'text-lime-400 border-lime-500/40' };
    toast.className = `fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 modal-shell ${colors[type] || colors.info}`;
    toast.textContent = message;
    toast.style.opacity = '0'; toast.style.transform = 'translate(-50%, 0)';
    requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translate(-50%, -8px)'; });
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translate(-50%, 0)'; }, 2200);
}

/* ============================================= */
/* ===== ŁADOWANIE SKINÓW ======================= */
/* ============================================= */

async function loadSkinsData() {
    try {
        const url = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json';
        const response = await fetch(url); if (!response.ok) throw new Error("Błąd sieci");
        let data = await response.json();
        const uniqueSkins = Array.from(new Map(data.map(item => [item.name, item])).values());
        uniqueSkins.sort(() => Math.random() - 0.5); const selectedSkins = uniqueSkins.slice(0, 1000);
        storeCatalog = selectedSkins.map(skin => {
            let basePrice = 1.00; let rarityClass = 'rarity-milspec';
            if (skin.rarity && skin.rarity.name) {
                const rName = skin.rarity.name;
                if (rName === 'Covert') { basePrice = 45.00; rarityClass = 'rarity-covert'; }
                else if (rName === 'Classified') { basePrice = 20.00; rarityClass = 'rarity-classified'; }
                else if (rName === 'Restricted') { basePrice = 8.00; rarityClass = 'rarity-restricted'; }
                else if (rName === 'Mil-Spec Grade') { basePrice = 2.50; }
                else if (rName === 'Industrial Grade' || rName === 'Consumer Grade') { basePrice = 0.50; }
                if (skin.name.includes('★') || (skin.category && skin.category.name === 'Gloves') || rName === 'Extraordinary' || rName === 'Contraband') {
                    basePrice = 350.00; rarityClass = 'rarity-knife';
                }
            }
            const priceMultiplier = 0.7 + (Math.random() * 0.6); const finalPrice = (basePrice * priceMultiplier).toFixed(2);
            return { id: skin.id || 'skin_' + Math.random(), name: skin.name || 'Unknown Skin', wear: getRandomWear(skin.min_float || 0, skin.max_float || 1), price: parseFloat(finalPrice), rarity: rarityClass, img: skin.image || '' };
        });
        renderPlayerInventory(); renderStoreCatalog(1); renderShop(1); populateLiveFeed();
    } catch (error) { console.error("Błąd:", error); showToast("Nie udało się pobrać skinów z GitHuba.", "error"); }
}

/* ============================================= */
/* ===== EKWIPUNEK ============================== */
/* ============================================= */

function renderPlayerInventory() {
    const grid = document.getElementById('inventory-grid'); const badge = document.getElementById('inventory-count-badge'); if (!grid) return;
    if (badge) badge.textContent = `${inventory.length} szt.`;
    grid.innerHTML = '';
    if (inventory.length === 0) {
        grid.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center text-gray-500 gap-2 py-6 sm:py-8"><i class="fa-solid fa-box-open text-xl sm:text-2xl"></i><span class="text-[10px] sm:text-xs uppercase font-semibold tracking-wider">Ekwipunek jest pusty</span></div>`;
        return;
    }
    inventory.forEach(item => {
        const card = document.createElement('div');
        const isSelected = selectedSourceItem && selectedSourceItem.id === item.id;
        card.className = `item-card ${item.rarity} p-1.5 sm:p-2 cursor-pointer ${isSelected ? 'ring-2 ring-lime-400' : ''}`;
        card.innerHTML = `
            <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-start justify-between gap-1">
                    <span class="text-[8px] sm:text-[9px] font-mono uppercase text-gray-400 bg-black/30 px-1 sm:px-1.5 py-0.5 rounded">${item.wear}</span>
                    <span class="text-[9px] sm:text-[10px] font-bold text-lime-400">$${item.price.toFixed(2)}</span>
                </div>
                <div class="flex-1 flex items-center justify-center py-1">
                    <img src="${item.img}" alt="${item.name}" class="max-h-12 sm:max-h-20 w-auto object-contain drop-shadow-lg" onerror="this.style.opacity=0.3">
                </div>
                <div class="text-[9px] sm:text-[10px] font-semibold text-white leading-tight line-clamp-2 min-h-[2em] sm:min-h-[2.2em]">${item.name}</div>
            </div>`;
        card.onclick = () => selectSourceItem(item); grid.appendChild(card);
    });
}

function selectSourceItem(item) {
    if (isSpinning) return;
    selectedSourceItem = item; addedCash = 0;
    document.getElementById('source-empty').classList.add('hidden'); document.getElementById('source-filled').classList.remove('hidden');
    document.getElementById('source-img').src = item.img; document.getElementById('source-name').textContent = item.name;
    document.getElementById('source-price').textContent = `$${item.price.toFixed(2)}`; document.getElementById('offered-item-wear').textContent = item.wear;
    const slider = document.getElementById('cash-slider'); if (slider) { slider.value = 0; slider.max = Math.max(0, balance).toFixed(2); }
    document.getElementById('cash-add-label').textContent = '$0.00';
    document.getElementById('source-slot').classList.add('border-lime-400', 'bg-lime-400/5');
    renderPlayerInventory(); recalculateOdds();
}

function clearSourceItem() {
    if (isSpinning) return;
    selectedSourceItem = null; addedCash = 0;
    document.getElementById('source-empty').classList.remove('hidden'); document.getElementById('source-filled').classList.add('hidden');
    document.getElementById('offered-item-wear').textContent = 'Brak';
    const slider = document.getElementById('cash-slider'); if (slider) slider.value = 0;
    document.getElementById('cash-add-label').textContent = '$0.00';
    document.getElementById('source-slot').classList.remove('border-lime-400', 'bg-lime-400/5');
    renderPlayerInventory(); recalculateOdds();
}

function sellSelectedItem() {
    if (!selectedSourceItem || isSpinning) return;
    balance = parseFloat((balance + selectedSourceItem.price).toFixed(2));
    inventory = inventory.filter(i => i.id !== selectedSourceItem.id);
    showToast(`Sprzedano: ${selectedSourceItem.name}`, 'success');
    clearSourceItem(); updateBalanceDisplay(); renderPlayerInventory();
    const slider = document.getElementById('cash-slider'); if (slider) slider.max = Math.max(0, balance).toFixed(2);
}

/* ============================================= */
/* ===== KATALOG CELÓW ========================== */
/* ============================================= */

function renderStoreCatalog(page = 1) {
    const grid = document.getElementById('catalog-grid'); if (!grid) return;
    const search = (document.getElementById('catalog-search')?.value || '').toLowerCase().trim();
    const sort = document.getElementById('catalog-sort')?.value || 'default';
    let filtered = storeCatalog.filter(item => item.name.toLowerCase().includes(search));
    if (sort === 'asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'desc') filtered.sort((a, b) => b.price - a.price);
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (page < 1) page = 1; if (page > totalPages) page = totalPages;
    catalogPage = page;
    const start = (page - 1) * ITEMS_PER_PAGE; const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);
    const totalEl = document.getElementById('catalog-page-total'); if (totalEl) totalEl.textContent = `/ ${totalPages}`;
    const pageInput = document.getElementById('catalog-page-input'); if (pageInput) pageInput.value = page;
    grid.innerHTML = '';
    if (pageItems.length === 0) {
        grid.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center text-gray-500 gap-2 py-6 sm:py-8"><i class="fa-solid fa-box-open text-xl sm:text-2xl"></i><span class="text-[10px] sm:text-xs uppercase font-semibold tracking-wider">Brak wyników</span></div>`;
        return;
    }
    pageItems.forEach(item => {
        const isSelected = selectedTargetItem && selectedTargetItem.id === item.id;
        const card = document.createElement('div');
        card.className = `item-card ${item.rarity} p-1.5 sm:p-2 cursor-pointer group ${isSelected ? 'ring-2 ring-lime-400' : ''}`;
        card.innerHTML = `
            <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-start justify-between gap-1">
                    <span class="text-[8px] sm:text-[9px] font-mono uppercase text-gray-400 bg-black/30 px-1 sm:px-1.5 py-0.5 rounded">${item.wear}</span>
                    <span class="text-[9px] sm:text-[10px] font-bold text-lime-400">$${item.price.toFixed(2)}</span>
                </div>
                <div class="flex-1 flex items-center justify-center py-1">
                    <img src="${item.img}" alt="${item.name}" class="max-h-12 sm:max-h-20 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-200" onerror="this.style.opacity=0.3">
                </div>
                <div class="text-[9px] sm:text-[10px] font-semibold text-white leading-tight line-clamp-2 min-h-[2em] sm:min-h-[2.2em]">${item.name}</div>
            </div>`;
        card.onclick = () => selectTargetItem(item); grid.appendChild(card);
    });
}

function selectTargetItem(item) {
    if (isSpinning) return;
    selectedTargetItem = item;
    document.getElementById('target-empty').classList.add('hidden'); document.getElementById('target-filled').classList.remove('hidden');
    document.getElementById('target-img').src = item.img; document.getElementById('target-name').textContent = item.name;
    document.getElementById('target-price').textContent = `$${item.price.toFixed(2)}`; document.getElementById('target-item-wear').textContent = item.wear;
    document.getElementById('target-slot').classList.add('border-lime-400', 'bg-lime-400/5');
    renderStoreCatalog(catalogPage); recalculateOdds();
}

function clearTargetItem() {
    if (isSpinning) return;
    selectedTargetItem = null;
    document.getElementById('target-empty').classList.remove('hidden'); document.getElementById('target-filled').classList.add('hidden');
    document.getElementById('target-item-wear').textContent = 'Brak';
    document.getElementById('target-slot').classList.remove('border-lime-400', 'bg-lime-400/5');
    renderStoreCatalog(catalogPage); recalculateOdds();
}

function onCatalogSearch() { catalogPage = 1; renderStoreCatalog(1); }

/* ============================================= */
/* ===== SKLEP (PEŁNOEKRANOWY WIDOK) ============ */
/* ============================================= */

function openShop() {
    const view = document.getElementById('shop-view'); if (!view) return;
    view.classList.add('active'); document.body.style.overflow = 'hidden';
    updateShopBalance(); renderShop(shopPage);
}

function closeShop() {
    const view = document.getElementById('shop-view'); if (!view) return;
    view.classList.remove('active'); document.body.style.overflow = '';
}

function updateShopBalance() { const el = document.getElementById('shop-balance'); if (el) el.textContent = `$${balance.toFixed(2)}`; }

function renderShop(page = 1) {
    const grid = document.getElementById('shop-grid'); if (!grid) return;
    const search = (document.getElementById('shop-search')?.value || '').toLowerCase().trim();
    const sort = document.getElementById('shop-sort')?.value || 'asc';
    let filtered = storeCatalog.filter(item => item.name.toLowerCase().includes(search));
    filtered.sort((a, b) => sort === 'asc' ? a.price - b.price : b.price - a.price);
    const totalPages = Math.max(1, Math.ceil(filtered.length / SHOP_ITEMS_PER_PAGE));
    if (page < 1) page = 1; if (page > totalPages) page = totalPages;
    shopPage = page;
    const start = (page - 1) * SHOP_ITEMS_PER_PAGE; const pageItems = filtered.slice(start, start + SHOP_ITEMS_PER_PAGE);
    const badge = document.getElementById('shop-count-badge'); if (badge) badge.textContent = `${filtered.length} szt.`;
    const totalEl = document.getElementById('shop-page-total'); if (totalEl) totalEl.textContent = `/ ${totalPages}`;
    const pageInput = document.getElementById('shop-page-input'); if (pageInput) pageInput.value = page;
    grid.innerHTML = '';
    if (pageItems.length === 0) {
        grid.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center text-gray-500 gap-2 py-10 sm:py-12"><i class="fa-solid fa-box-open text-2xl sm:text-3xl"></i><span class="text-xs sm:text-sm uppercase font-semibold tracking-wider">Brak wyników</span></div>`;
        return;
    }
    pageItems.forEach(item => {
        const canAfford = balance >= item.price;
        const card = document.createElement('div');
        card.className = `item-card ${item.rarity} p-2 sm:p-2.5 cursor-pointer group ${canAfford ? '' : 'opacity-60'}`;
        card.innerHTML = `
            <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-start justify-between gap-1">
                    <span class="text-[8px] sm:text-[9px] font-mono uppercase text-gray-400 bg-black/30 px-1 sm:px-1.5 py-0.5 rounded">${item.wear}</span>
                    <span class="${canAfford ? 'text-lime-400' : 'text-red-400'} text-[9px] sm:text-[11px] font-bold">$${item.price.toFixed(2)}</span>
                </div>
                <div class="flex-1 flex items-center justify-center py-1 sm:py-2">
                    <img src="${item.img}" alt="${item.name}" class="max-h-16 sm:max-h-24 w-auto object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-200" onerror="this.style.opacity=0.3">
                </div>
                <div class="text-[9px] sm:text-[11px] font-semibold text-white leading-tight line-clamp-2 min-h-[2.2em] sm:min-h-[2.4em]">${item.name}</div>
                <button onclick="event.stopPropagation(); buyShopItem('${item.id}')" class="mt-1.5 sm:mt-2 w-full py-1.5 sm:py-2 rounded-lg bg-lime-400/15 border border-lime-400/30 text-lime-400 hover:bg-lime-400/25 hover:border-lime-400/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition">
                    <i class="fa-solid fa-cart-shopping mr-0.5 sm:mr-1"></i> Kup
                </button>
            </div>`;
        grid.appendChild(card);
    });
}

function buyShopItem(itemId) {
    const item = storeCatalog.find(i => i.id === itemId); if (!item) return;
    if (balance < item.price) {
        showToast('Za mało środków na saldzie!', 'error');
        const panel = document.querySelector('.stat-badge'); if (panel) { panel.classList.add('shake'); setTimeout(() => panel.classList.remove('shake'), 400); }
        return;
    }
    balance = parseFloat((balance - item.price).toFixed(2));
    updateBalanceDisplay(); updateShopBalance();
    const newItem = { ...item, id: 'inv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) };
    inventory.push(newItem); renderPlayerInventory();
    AudioSynth.init(); AudioSynth.playWin(); showToast(`Kupiono: ${item.name}`, 'success');
    const slider = document.getElementById('cash-slider'); if (slider) { slider.max = Math.max(0, balance).toFixed(2); if (parseFloat(slider.value) > balance) slider.value = 0; }
    renderShop(shopPage);
}

function onShopSearch() { shopPage = 1; renderShop(1); }

/* ============================================= */
/* ===== PAGINACJA ============================== */
/* ============================================= */

function changePage(context, dir) {
    if (context === 'catalog') { catalogPage += dir; if (catalogPage < 1) catalogPage = 1; renderStoreCatalog(catalogPage); }
    else if (context === 'shop') { shopPage += dir; if (shopPage < 1) shopPage = 1; renderShop(shopPage); }
}

function jumpToPage(context, value) {
    const page = parseInt(value) || 1;
    if (context === 'catalog') { catalogPage = page; renderStoreCatalog(page); }
    else if (context === 'shop') { shopPage = page; renderShop(page); }
}

/* ============================================= */
/* ===== SALDO / SLIDER / ODDS ================== */
/* ============================================= */

function updateBalanceDisplay() {
    const el = document.getElementById('user-balance'); if (el) el.textContent = `$${balance.toFixed(2)}`;
    const modalEl = document.getElementById('modal-user-balance'); if (modalEl) modalEl.textContent = `$${balance.toFixed(2)}`;
    updateShopBalance();
}

function onCashSliderChange(value) {
    if (isSpinning) return;
    let v = parseFloat(value) || 0; if (v < 0) v = 0; if (v > balance) v = balance;
    addedCash = v;
    const slider = document.getElementById('cash-slider'); if (slider) slider.value = v;
    document.getElementById('cash-add-label').textContent = `$${addedCash.toFixed(2)}`;
    recalculateOdds();
}

function recalculateOdds() {
    const sourceVal = (selectedSourceItem ? selectedSourceItem.price : 0) + addedCash;
    const targetVal = selectedTargetItem ? selectedTargetItem.price : 0;
    document.getElementById('total-source-val').textContent = `$${sourceVal.toFixed(2)}`;
    document.getElementById('total-target-val').textContent = `$${targetVal.toFixed(2)}`;
    const btn = document.getElementById('upgrade-btn');
    const status = document.getElementById('status-msg');

    if (sourceVal <= 0 || targetVal <= 0) {
        calculatedChance = 0; document.getElementById('win-chance-text').textContent = '0.00%';
        document.getElementById('multiplier-text').textContent = '0.00x'; updateWheelArc(0);
        btn.disabled = true; btn.className = 'w-full py-3 sm:py-3.5 rounded-xl font-rajdhani text-lg sm:text-xl font-bold uppercase tracking-widest transition-all bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed z-10';
        status.textContent = 'Wybierz przedmioty do ulepszenia'; return;
    }
    if (targetVal <= sourceVal) {
        calculatedChance = 0; document.getElementById('win-chance-text').textContent = '0.00%';
        document.getElementById('multiplier-text').textContent = '0.00x'; updateWheelArc(0);
        btn.disabled = true; btn.className = 'w-full py-3 sm:py-3.5 rounded-xl font-rajdhani text-lg sm:text-xl font-bold uppercase tracking-widest transition-all bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed z-10';
        status.textContent = 'Cel musi być droższy'; return;
    }
    calculatedChance = GameEngine.calculateRealChance(sourceVal, targetVal);
    const multiplier = (targetVal / sourceVal).toFixed(2);
    document.getElementById('win-chance-text').textContent = `${calculatedChance.toFixed(2)}%`;
    document.getElementById('multiplier-text').textContent = `${multiplier}x`;
    updateWheelArc(calculatedChance);

    if (addedCash > balance) {
        btn.disabled = true; btn.className = 'w-full py-3 sm:py-3.5 rounded-xl font-rajdhani text-lg sm:text-xl font-bold uppercase tracking-widest transition-all bg-red-950/40 text-red-400 border border-red-800/60 cursor-not-allowed z-10';
        status.textContent = 'Brak wystarczającego salda'; return;
    }
    btn.disabled = false; btn.className = 'upgrade-btn-active w-full py-3 sm:py-3.5 rounded-xl font-rajdhani text-lg sm:text-xl font-bold uppercase tracking-widest text-white cursor-pointer z-10';
    status.textContent = `Szansa na sukces: ${calculatedChance.toFixed(2)}%`;
}

function pickGradient(percentage) { if (percentage < 35) return 'url(#gradRed)'; if (percentage < 50) return 'url(#gradOrange)'; if (percentage < 60) return 'url(#gradYellow)'; return 'url(#gradGreen)'; }

function updateWheelArc(percentage) {
    const leftArc = document.getElementById('win-arc-left'); const rightArc = document.getElementById('win-arc-right');
    if (!leftArc || !rightArc) return;
    const circumference = 452.38; const halfPercent = percentage / 2; const strokeLength = (halfPercent / 100) * circumference;
    leftArc.setAttribute('stroke-dasharray', `${strokeLength} ${circumference}`);
    rightArc.setAttribute('stroke-dasharray', `${strokeLength} ${circumference}`);
    const gradient = pickGradient(percentage); leftArc.setAttribute('stroke', gradient); rightArc.setAttribute('stroke', gradient);
}

/* ============================================= */
/* ===== UPGRADE (LOSOWANIE) ==================== */
/* ============================================= */

async function startUpgrade() {
    if (isSpinning) return;
    if (!selectedTargetItem) { showToast('Wybierz cel ulepszenia!', 'error'); return; }
    if (!selectedSourceItem && addedCash <= 0) { showToast('Wybierz przedmiot lub dodaj saldo!', 'error'); return; }
    if (addedCash > balance) { showToast('Brak wystarczającego salda!', 'error'); return; }
    const rateCheck = GameEngine.canSpin(); const statusMsg = document.getElementById('status-msg');
    if (!rateCheck.allowed) { if (statusMsg) statusMsg.innerHTML = `<span class="text-yellow-400 font-bold"><i class="fa-solid fa-clock mr-1"></i> ${rateCheck.reason}</span>`; return; }

    const sourceVal = (selectedSourceItem ? selectedSourceItem.price : 0) + addedCash;
    const targetVal = selectedTargetItem.price;
    const chance = GameEngine.calculateRealChance(sourceVal, targetVal);
    const rollRes = GameEngine.rollOutcome(chance); const isWin = rollRes.outcome;

    if (addedCash > 0) { balance -= addedCash; updateBalanceDisplay(); const slider = document.getElementById('cash-slider'); if (slider) slider.max = Math.max(0, balance).toFixed(2); }
    isSpinning = true; GameEngine.recordSpin();

    const btn = document.getElementById('upgrade-btn');
    if (btn) { btn.disabled = true; btn.className = 'w-full py-3 sm:py-3.5 rounded-xl font-rajdhani text-lg sm:text-xl font-bold uppercase tracking-widest transition-all bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed z-10'; btn.innerText = 'LOSOWANIE...'; }

    const wonItemSnapshot = { ...selectedTargetItem }; const sacrificedItemSnapshot = selectedSourceItem ? { ...selectedSourceItem } : null;
    let targetOffsetDeg = 0;
    if (isWin) { targetOffsetDeg = chance / 2; } 
    else { const startRed = chance; const endRed = 360; targetOffsetDeg = startRed + ((endRed - startRed) / 2); }

    const totalRotations = (5 * 360) + targetOffsetDeg;
    const needle = document.getElementById('needle'); const duration = 4500;

    if (needle) { needle.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.9, 0.2, 1)`; needle.style.transform = `rotate(${totalRotations}deg)`; }
    const TICK_STEP = 6; let lastTickAngle = 0; let animationStartTime = null; let rafId = null;
    function cubicBezier(t, p1x, p1y, p2x, p2y) {
        const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
        const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
        let x = t;
        for (let i = 0; i < 8; i++) {
            const xEst = ((ax * x + bx) * x + cx) * x;
            const dx = (3 * ax * x + 2 * bx) * x + cx;
            if (Math.abs(dx) < 1e-6) break; x -= (xEst - t) / dx;
        }
        return ((ay * x + by) * x + cy) * x;
    }

    function tickLoop(timestamp) {
        if (!animationStartTime) animationStartTime = timestamp;
        const elapsed = timestamp - animationStartTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = cubicBezier(progress, 0.1, 0.9, 0.2, 1);
        const currentAngle = eased * totalRotations;
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
    setTimeout(() => { if (rafId) cancelAnimationFrame(rafId); finishUpgrade(isWin, totalRotations, wonItemSnapshot, sacrificedItemSnapshot); }, duration);
}

function finishUpgrade(isWin, finalDegree, wonItem, sacrificedItem) {
    isSpinning = false;
    const normalizedDegree = finalDegree % 360;
    const needle = document.getElementById('needle');
    if (needle) { needle.style.transition = 'none'; needle.style.transform = `rotate(${normalizedDegree}deg)`; }
    const statusMsg = document.getElementById('status-msg');

    if (isWin) {
        AudioSynth.playWin(); if (statusMsg) statusMsg.innerHTML = `<span class="text-lime-400 font-bold"><i class="fa-solid fa-check mr-1"></i> ULEPSZENIE UDANE!</span>`;
        if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
        inventory.push({ ...wonItem, id: 'i' + Date.now() });
        if (sacrificedItem) { const idx = inventory.findIndex(i => i.id === sacrificedItem.id); if (idx > -1) inventory.splice(idx, 1); }
        pushLiveFeed(wonItem, true); openResultModal(true, wonItem);
    } else {
        AudioSynth.playLoss(); if (statusMsg) statusMsg.innerHTML = `<span class="text-red-400 font-bold"><i class="fa-solid fa-xmark mr-1"></i> ULEPSZENIE NIEUDANE</span>`;
        if (navigator.vibrate) navigator.vibrate(200);
        if (sacrificedItem) { const idx = inventory.findIndex(i => i.id === sacrificedItem.id); if (idx > -1) inventory.splice(idx, 1); }
        const wheelContainer = document.querySelector('.lg\\:col-span-4 .relative');
        if (wheelContainer) { wheelContainer.classList.add('shake'); setTimeout(() => wheelContainer.classList.remove('shake'), 400); }
        pushLiveFeed(wonItem, false); openResultModal(false, wonItem);
    }

    setTimeout(() => { if (needle) { needle.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)'; needle.style.transform = 'rotate(0deg)'; } }, 800);
    const sliderEl = document.getElementById('cash-slider');
    if (sliderEl) { sliderEl.max = Math.max(0, balance).toFixed(2); sliderEl.value = 0; }
    onCashSliderChange(0);

    selectedSourceItem = null; selectedTargetItem = null; addedCash = 0;
    document.getElementById('source-empty').classList.remove('hidden'); document.getElementById('source-filled').classList.add('hidden');
    document.getElementById('offered-item-wear').textContent = 'Brak'; document.getElementById('source-slot').classList.remove('border-lime-400', 'bg-lime-400/5');
    document.getElementById('target-empty').classList.remove('hidden'); document.getElementById('target-filled').classList.add('hidden');
    document.getElementById('target-item-wear').textContent = 'Brak'; document.getElementById('target-slot').classList.remove('border-lime-400', 'bg-lime-400/5');
    document.getElementById('cash-add-label').textContent = '$0.00';
    renderPlayerInventory(); renderStoreCatalog(catalogPage); recalculateOdds();
    const btn = document.getElementById('upgrade-btn'); if (btn) btn.innerText = 'ULEPSZ';
    setTimeout(() => GameEngine.resetRateLimit(), 2500);
}

/* ============================================= */
/* ===== MODAL WYNIKU =========================== */
/* ============================================= */

function openResultModal(isWin, item) {
    if (!item) return;
    const modal = document.getElementById('result-modal'); const content = document.getElementById('result-modal-content');
    const icon = document.getElementById('modal-status-icon'); const title = document.getElementById('modal-title'); const desc = document.getElementById('modal-desc');
    if (!modal) return;

    if (isWin) {
        if (icon) { icon.className = 'w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3 border shadow-inner bg-lime-400/20 text-lime-400 border-lime-400/50 relative z-10'; icon.innerHTML = '<i class="fa-solid fa-trophy"></i>'; }
        if (title) { title.className = 'font-rajdhani text-xl sm:text-2xl font-bold uppercase tracking-wider text-lime-400 drop-shadow-md relative z-10'; title.innerText = 'WYGRANA!'; }
        if (desc) desc.innerText = 'Twój nowy skin powędrował do ekwipunku.';
    } else {
        if (icon) { icon.className = 'w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3 border shadow-inner bg-red-500/20 text-red-400 border-red-500/50 relative z-10'; icon.innerHTML = '<i class="fa-solid fa-xmark"></i>'; }
        if (title) { title.className = 'font-rajdhani text-xl sm:text-2xl font-bold uppercase tracking-wider text-red-400 drop-shadow-md relative z-10'; title.innerText = 'PORAŻKA!'; }
        if (desc) desc.innerText = 'Przedmiot spłonął podczas próby ulepszenia.';
    }

    const imgEl = document.getElementById('modal-item-img'); const nameEl = document.getElementById('modal-item-name'); const priceEl = document.getElementById('modal-item-price');
    if (imgEl) imgEl.src = item.img; if (nameEl) nameEl.innerText = item.name; if (priceEl) priceEl.innerText = `$${item.price.toFixed(2)}`;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (content) { content.classList.remove('modal-in'); void content.offsetWidth; content.classList.add('modal-in'); }
    }, 10);

    if (isWin && content) setTimeout(() => spawnParticles(content, 25, ['#a3e635', '#84cc16', '#bef264', '#d9f99d', '#facc15']), 100);
}

function closeResultModal() {
    const modal = document.getElementById('result-modal'); if (!modal) return;
    modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 200);
}

/* ============================================= */
/* ===== LIVE FEED ============================== */
/* ============================================= */

function pushLiveFeed(item, isWin) {
    const feed = document.getElementById('live-feed'); if (!feed) return;
    const node = document.createElement('div');
    node.className = 'live-drop-item px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 min-w-[100px] sm:min-w-[130px] relative overflow-hidden';
    node.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-b ${isWin ? 'from-lime-500/10' : 'from-red-500/10'} to-transparent pointer-events-none"></div>
        <img src="${item.img}" class="w-8 h-5 sm:w-10 sm:h-7 object-contain drop-shadow-md z-10">
        <div class="flex flex-col z-10">
            <span class="font-bold text-[9px] sm:text-[10px] text-gray-300 truncate max-w-[60px] sm:max-w-[70px]">${item.name}</span>
            <span class="${isWin ? 'text-lime-400' : 'text-red-400'} font-mono font-bold text-[9px] sm:text-[10px]">$${item.price.toFixed(2)}</span>
        </div>`;
    feed.insertBefore(node, feed.firstChild); if (feed.children.length > 9) feed.removeChild(feed.lastChild);
}

function populateLiveFeed() {
    if (!storeCatalog || storeCatalog.length === 0) return;
    for (let i = 0; i < 8; i++) {
        const item = storeCatalog[Math.floor(Math.random() * storeCatalog.length)];
        pushLiveFeed(item, Math.random() > 0.5);
    }
}

/* ============================================= */
/* ===== AUDIO / STEAM ========================== */
/* ============================================= */

function toggleAudio() {
    audioMuted = !audioMuted;
    const icon = document.getElementById('sound-icon');
    if (icon) icon.className = audioMuted ? 'fa-solid fa-volume-xmark text-red-400 text-xs sm:text-sm' : 'fa-solid fa-volume-high text-xs sm:text-sm';
}

function toggleLogin() {
    const btn = document.getElementById('steam-btn-text');
    if (btn) btn.innerText = btn.innerText === 'Steam' ? 'Niezalogowany' : 'Steam';
}

/* ============================================= */
/* ===== PROMO ================================== */
/* ============================================= */

const PROMO_CODE = '98CASE'; const PROMO_STORAGE_KEY = 'cscasepro_promo_used';

function openPromoModal() {
    const modal = document.getElementById('promo-modal'); const msg = document.getElementById('promo-message'); const input = document.getElementById('promo-input');
    if (modal) modal.classList.remove('hidden'); if (msg) msg.innerHTML = ''; if (input) input.value = '';
}
function closePromoModal() { const modal = document.getElementById('promo-modal'); if (modal) modal.classList.add('hidden'); }

function redeemPromoCode() {
    const inputEl = document.getElementById('promo-input'); const msg = document.getElementById('promo-message'); if (!inputEl || !msg) return;
    const input = inputEl.value.trim().toUpperCase();
    if (localStorage.getItem(PROMO_STORAGE_KEY) === 'true') { msg.innerHTML = `<span class="text-red-400 font-bold">❌ Ten kod został już wykorzystany na tym koncie.</span>`; return; }
    if (input !== PROMO_CODE) { msg.innerHTML = `<span class="text-red-400 font-bold">❌ Nieprawidłowy kod.</span>`; return; }
    const promoItems = [
        { id: 'promo1_' + Date.now(), name: 'AK-47 | Safari Mesh', wear: 'FT', price: 0.46, rarity: 'rarity-milspec', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wjFL0P-re6xSNPGdMWuZxuZi_rIxSirkkElyt2qEzI2heXiTaVIiX5siROQJtxnul4XnYbvgswOMgolbjXKpnRk9Yjk' },
        { id: 'promo2_' + Date.now(), name: 'M4A4 | Urban DDPAT', wear: 'FT', price: 0.75, rarity: 'rarity-milspec', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAopC0PaqeKV5H-WBDFicyOl-pK8xF3DjzR5_4zncnouhcSjGPQ8jA5B3ELFbuhPqloDkPrvjsgXY2t5N02yg2Rf5X8A9' },
        { id: 'promo3_' + Date.now(), name: 'P2000 | Imperial', wear: 'MW', price: 1.25, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0POjV7Q_cKDDMW6d0etkueBlcDu2kSIrujqNjsGrJH6XPQ9xAsZ5FLIDtBG5mtfhY7nl4gGNiosTzH792ntOvC1stbsDT-N7ra_mVv2F' }
    ];
    promoItems.forEach(it => inventory.push(it)); localStorage.setItem(PROMO_STORAGE_KEY, 'true');
    renderPlayerInventory(); msg.innerHTML = `<span class="text-lime-400 font-bold">✅ Odebrano! Dodano skiny do ekwipunku.</span>`;
    setTimeout(() => closePromoModal(), 1500);
}

/* ============================================= */
/* ===== MODAL PŁATNOŚCI (DOŁADOWANIE) ========== */
/* ============================================= */

function openPaymentModal() {
    const modal = document.getElementById('payment-modal'); const content = document.getElementById('payment-modal-content'); const msg = document.getElementById('payment-message');
    if (modal) { modal.classList.remove('hidden'); setTimeout(() => { modal.classList.remove('opacity-0'); if (content) content.classList.add('modal-in'); }, 10); }
    if (msg) msg.innerHTML = '';
    const input = document.getElementById('payment-input'); if (input && !input.value) input.value = 20;
    updateBalanceDisplay(); calculateBonus();
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal'); const content = document.getElementById('payment-modal-content');
    if (modal) { modal.classList.add('opacity-0'); if (content) content.classList.remove('modal-in'); setTimeout(() => modal.classList.add('hidden'), 300); }
}

function selectAmount(amount, btnElement) {
    const input = document.getElementById('payment-input');
    if (input) { input.value = amount; calculateBonus(); }
    const btns = document.querySelectorAll('.payment-pack');
    btns.forEach(btn => btn.classList.remove('active'));
    if (btnElement) { btnElement.classList.add('active'); }
}

function calculateBonus() {
    const input = document.getElementById('payment-input');
    const receiveEl = document.getElementById('payment-receive-amount');
    const btnAmountEl = document.getElementById('payment-button-amount');
    const pointsEl = document.getElementById('payment-event-points');
    
    if (!input || !receiveEl || !btnAmountEl) return;

    let amount = parseFloat(input.value) || 0;
    if (amount < 0) amount = 0;

    const finalAmount = amount * 1.10; 
    const points = Math.floor(amount * 25); 

    receiveEl.innerText = `${finalAmount.toFixed(2)} PLN`;
    btnAmountEl.innerText = `${amount.toFixed(2)} PLN`;
    if (pointsEl) pointsEl.innerText = points;
}

function executePayment() {
    const input = document.getElementById('payment-input'); const msg = document.getElementById('payment-message');
    if (!input || !msg) return;

    let amount = parseFloat(input.value) || 0;
    if (amount < 4) { msg.innerHTML = `<span class="text-red-400"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Minimalna kwota to 4 PLN.</span>`; return; }

    const finalAmount = amount * 1.10; 
    msg.innerHTML = `<span class="text-yellow-400"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Przetwarzanie BLIK...</span>`;
    const btn = document.getElementById('payment-submit-btn'); if (btn) btn.disabled = true;

    setTimeout(() => {
        balance += finalAmount;
        msg.innerHTML = `<span class="text-lime-400"><i class="fa-solid fa-check mr-1"></i> Pomyślnie doładowano ${finalAmount.toFixed(2)} PLN (w tym 10% bonusu)!</span>`;
        updateBalanceDisplay(); 
        const slider = document.getElementById('cash-slider'); if (slider) slider.max = Math.max(0, balance).toFixed(2); 
        recalculateOdds();
        if (btn) btn.disabled = false;
        setTimeout(() => { closePaymentModal(); if (msg) msg.innerHTML = ''; }, 2500);
    }, 1500);
}

/* ============================================= */
/* ===== START ================================== */
/* ============================================= */

window.addEventListener('DOMContentLoaded', () => {
    loadSkinsData(); updateBalanceDisplay(); updateWheelArc(0); recalculateOdds();
    const slider = document.getElementById('cash-slider'); if (slider) slider.max = Math.max(0, balance).toFixed(2);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeShop(); closeResultModal(); closePromoModal(); closePaymentModal(); } });
});
