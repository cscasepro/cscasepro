// ============================================
// GAME ENGINE (silnik losujący)
// ============================================
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

    function rollOutcome(chance) {
        if (typeof chance !== 'number' || isNaN(chance) || chance < 0 || chance > 100) {
            throw new Error('Invalid chance');
        }
        const roll = secureRandom() * 100;
        return {
            roll,
            chance,
            outcome: roll <= chance,
            timestamp: Date.now()
        };
    }

    return {
        canSpin,
        rollOutcome,
        getSpinCount: () => _spinCount,
        registerSpin: () => {
            _lastSpinTime = Date.now();
            _spinCount++;
        }
    };
})();

// ============================================
// STAN APLIKACJI
// ============================================
const state = {
    balance: 0,
    sourceItem: null,   // przedmiot z ekwipunku
    targetItem: null,   // przedmiot ze sklepu (cel)
    selectedInventoryId: null,
    cashAdd: 0,
    audioEnabled: true,
    loggedIn: false,
    spinning: false,
};

// ============================================
// HELPERS
// ============================================
const $ = (id) => document.getElementById(id);
const fmt = (n) => '$' + Number(n).toFixed(2);

function updateBalance() {
    const el = $('user-balance');
    if (el) el.textContent = fmt(state.balance);
}

function setStatus(msg, color = 'text-gray-400') {
    const el = $('status-msg');
    if (!el) return;
    el.className = `h-6 text-xs font-semibold text-center uppercase tracking-wider ${color}`;
    el.textContent = msg;
}

// ============================================
// RENDER: EKWIPUNEK
// ============================================
function renderInventory() {
    const grid = $('inventory-grid');
    const badge = $('inventory-count-badge');
    if (!grid) return;

    if (badge) badge.textContent = `${inventory.length} przedmiotów`;

    if (inventory.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center text-gray-500 py-8 gap-2">
                <i class="fa-solid fa-box-open text-2xl text-borderBorder"></i>
                <span class="text-xs uppercase font-semibold">Ekwipunek jest pusty</span>
                <span class="text-[10px] text-gray-600">Doładuj konto, aby otrzymać skiny</span>
            </div>`;
        return;
    }

    grid.innerHTML = inventory.map(item => `
        <div class="item-card ${item.rarity} bg-cardBg/60 border border-borderBorder/60 rounded-lg p-2 flex flex-col items-center cursor-pointer ${state.selectedInventoryId === item.id ? 'ring-2 ring-accentViolet' : ''}"
             data-id="${item.id}" onclick="selectInventoryItem('${item.id}')">
            <img src="${item.img}" alt="${item.name}" class="w-full h-12 object-contain mb-1" loading="lazy">
            <div class="text-[9px] font-bold text-white truncate w-full text-center">${item.name}</div>
            <div class="text-[9px] text-gray-500 font-mono">${item.wear}</div>
            <div class="text-[10px] font-bold text-accentViolet font-mono">${fmt(item.price)}</div>
        </div>
    `).join('');
}

// ============================================
// RENDER: SKLEP
// ============================================
function renderStoreCatalog() {
    const grid = $('catalog-grid');
    if (!grid) return;

    const search = ($('catalog-search')?.value || '').toLowerCase();
    const sort = $('catalog-sort')?.value || 'asc';

    let items = storeCatalog.filter(it =>
        it.name.toLowerCase().includes(search)
    );

    items.sort((a, b) => sort === 'asc' ? a.price - b.price : b.price - a.price);

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center text-gray-500 py-8 gap-2">
                <i class="fa-solid fa-magnifying-glass text-2xl text-borderBorder"></i>
                <span class="text-xs uppercase font-semibold">Brak wyników</span>
            </div>`;
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="item-card ${item.rarity} bg-cardBg/60 border border-borderBorder/60 rounded-lg p-2 flex flex-col items-center cursor-pointer"
             data-id="${item.id}" onclick="selectTargetItem('${item.id}')">
            <img src="${item.img}" alt="${item.name}" class="w-full h-12 object-contain mb-1" loading="lazy">
            <div class="text-[9px] font-bold text-white truncate w-full text-center">${item.name}</div>
            <div class="text-[9px] text-gray-500 font-mono">${item.wear}</div>
            <div class="text-[10px] font-bold text-accentBlue font-mono">${fmt(item.price)}</div>
        </div>
    `).join('');
}

// ============================================
// WYBÓR PRZEDMIOTÓW
// ============================================
function selectInventoryItem(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    state.selectedInventoryId = id;

    // Ustaw jako source
    state.sourceItem = item;
    renderSourceItem();
    renderInventory();

    // Suwak – maksymalna kwota = różnica między celem a source
    updateCashSliderMax();
    updateUpgradeChance();
}

function selectTargetItem(id) {
    const item = storeCatalog.find(i => i.id === id);
    if (!item) return;
    state.targetItem = item;
    renderTargetItem();
    updateCashSliderMax();
    updateUpgradeChance();
}

function renderSourceItem() {
    const empty = $('source-empty');
    const filled = $('source-filled');
    if (!empty || !filled) return;

    if (!state.sourceItem) {
        empty.classList.remove('hidden');
        filled.classList.add('hidden');
        $('offered-item-wear').textContent = 'Brak';
        $('total-source-val').textContent = fmt(0);
        return;
    }

    empty.classList.add('hidden');
    filled.classList.remove('hidden');
    $('source-img').src = state.sourceItem.img;
    $('source-name').textContent = state.sourceItem.name;
    $('source-price').textContent = fmt(state.sourceItem.price);
    $('offered-item-wear').textContent = state.sourceItem.wear;
    updateTotalSource();
}

function renderTargetItem() {
    const empty = $('target-empty');
    const filled = $('target-filled');
    if (!empty || !filled) return;

    if (!state.targetItem) {
        empty.classList.remove('hidden');
        filled.classList.add('hidden');
        $('target-item-wear').textContent = 'Brak';
        $('total-target-val').textContent = fmt(0);
        return;
    }

    empty.classList.add('hidden');
    filled.classList.remove('hidden');
    $('target-img').src = state.targetItem.img;
    $('target-name').textContent = state.targetItem.name;
    $('target-price').textContent = fmt(state.targetItem.price);
    $('target-item-wear').textContent = state.targetItem.wear;
    $('total-target-val').textContent = fmt(state.targetItem.price);
}

function clearSourceItem() {
    state.sourceItem = null;
    state.selectedInventoryId = null;
    state.cashAdd = 0;
    const slider = $('cash-slider');
    if (slider) slider.value = 0;
    $('cash-add-label').textContent = fmt(0);
    renderSourceItem();
    renderInventory();
    updateCashSliderMax();
    updateUpgradeChance();
}

function clearTargetItem() {
    state.targetItem = null;
    renderTargetItem();
    updateCashSliderMax();
    updateUpgradeChance();
}

// ============================================
// SUWAK DODATKOWEJ KWOTY
// ============================================
function updateCashSliderMax() {
    const slider = $('cash-slider');
    if (!slider) return;

    if (!state.sourceItem || !state.targetItem) {
        slider.max = 0;
        slider.value = 0;
        state.cashAdd = 0;
        $('cash-add-label').textContent = fmt(0);
        return;
    }

    const diff = Math.max(0, state.targetItem.price - state.sourceItem.price);
    const maxAdd = Math.min(diff, state.balance);
    slider.max = maxAdd.toFixed(2);
    if (parseFloat(slider.value) > maxAdd) {
        slider.value = maxAdd.toFixed(2);
        state.cashAdd = maxAdd;
    }
    $('cash-add-label').textContent = fmt(state.cashAdd);
    updateTotalSource();
}

function onCashSliderChange(val) {
    state.cashAdd = Math.max(0, parseFloat(val) || 0);
    $('cash-add-label').textContent = fmt(state.cashAdd);
    updateTotalSource();
    updateUpgradeChance();
}

function updateTotalSource() {
    const total = (state.sourceItem?.price || 0) + state.cashAdd;
    $('total-source-val').textContent = fmt(total);
}

// ============================================
// OBLICZANIE SZANSY// ============================================
function updateUpgradeChance() {
    const chanceEl = $('win-chance-text');
    const multEl = $('multiplier-text');
    const btn = $('upgrade-btn');
    if (!chanceEl || !multEl || !btn) return;

    if (!state.sourceItem || !state.targetItem) {
        chanceEl.textContent = '0.00%';
        multEl.textContent = '0.00x';
        btn.disabled = true;
        btn.className = 'w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-cardBg text-gray-600 border border-borderBorder cursor-not-allowed z-10';
        setStatus('Wybierz przedmioty do ulepszenia');
        return;
    }

    const totalSource = state.sourceItem.price + state.cashAdd;
    const target = state.targetItem.price;
    const chance = Math.min(100, (totalSource / target) * 100);
    const multiplier = totalSource > 0 ? target / totalSource : 0;

    chanceEl.textContent = chance.toFixed(2) + '%';
    multEl.textContent = multiplier.toFixed(2) + 'x';

    // Aktualizuj łuki na kole
    updateWheelArcs(chance);

    // Walidacja
    if (target <= totalSource) {
        btn.disabled = true;
        btn.className = 'w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-cardBg text-gray-600 border border-borderBorder cursor-not-allowed z-10';
        setStatus('Cel musi być droższy od wpłaty', 'text-yellow-500');
        return;
    }

    if (state.cashAdd > state.balance) {
        btn.disabled = true;
        btn.className = 'w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all bg-cardBg text-gray-600 border border-borderBorder cursor-not-allowed z-10';
        setStatus('Za mało środków na saldzie', 'text-red-500');
        return;
    }

    btn.disabled = false;
    btn.className = 'w-full py-3.5 rounded-xl font-rajdhani text-xl font-bold uppercase tracking-widest transition-all upgrade-btn-active text-white border border-accentViolet/40 cursor-pointer z-10';
    setStatus('Gotowe do ulepszenia', 'text-green-400');
}

function updateWheelArcs(chance) {
    const leftArc = $('win-arc-left');
    const rightArc = $('win-arc-right');
    if (!leftArc || !rightArc) return;

    const circumference = 2 * Math.PI * 72; // ~452.38
    const winLen = (chance / 100) * circumference;
    const loseLen = circumference - winLen;

    // Lewy łuk – wygrana (kolor czerwony w oryginale, ale to Twój wybór)
    leftArc.setAttribute('stroke-dasharray', `${winLen} ${circumference}`);
    // Prawy łuk – przegrana
    rightArc.setAttribute('stroke-dasharray', `${loseLen} ${circumference}`);
    rightArc.setAttribute('stroke', 'url(#gradOrange)');
}

// ============================================
// START ULEPSZENIA
// ============================================
function startUpgrade() {
    if (!state.sourceItem || !state.targetItem) return;
    if (state.spinning) return;

    const spinCheck = GameEngine.canSpin();
    if (!spinCheck.allowed) {
        setStatus(spinCheck.reason, 'text-yellow-500');
        return;
    }

    const totalSource = state.sourceItem.price + state.cashAdd;
    const chance = Math.min(100, (totalSource / state.targetItem.price) * 100);

    state.spinning = true;
    GameEngine.registerSpin();

    const btn = $('upgrade-btn');
    btn.disabled = true;
    btn.textContent = 'KRĘCENIE...';
    btn.classList.add('spinning-glow');

    // Animacja igły
    const needle = $('needle');
    const targetRot = 360 * 5 + Math.random() * 360;
    if (needle) {
        needle.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.21, 0.99)';
        needle.style.transform = `rotate(${targetRot}deg)`;
    }

    setStatus('Losowanie...', 'text-accentViolet');

    setTimeout(() => {
        let result;
        try {
            result = GameEngine.rollOutcome(chance);
        } catch (e) {
            console.error(e);
            result = { outcome: false };
        }

        // Zatrzymaj igłę dokładnie tam, gdzie wypadło
        const finalDeg = (result.roll / 100) * 360;
        if (needle) {
            needle.style.transition = 'transform 0.4s ease-out';
            needle.style.transform = `rotate(${finalDeg}deg)`;
        }

        setTimeout(() => {
            finishUpgrade(result.outcome);
        }, 450);
    }, 3000);
}

function finishUpgrade(won) {
    const btn = $('upgrade-btn');
    state.spinning = false;
    btn.classList.remove('spinning-glow');
    btn.textContent = 'ULEPSZ';

    // Reset igły
    const needle = $('needle');
    if (needle) {
        setTimeout(() => {
            needle.style.transition = 'none';
            needle.style.transform = 'rotate(0deg)';
        }, 500);
    }

    if (won) {
        // Wygrana – sourceItem znika, targetItem trafia do ekwipunku
        const wonItem = {
            id: 'inv_' + Date.now(),
            name: state.targetItem.name,
            wear: state.targetItem.wear,
            price: state.targetItem.price,
            rarity: state.targetItem.rarity,
            img: state.targetItem.img,
        };

        // Usuń source z ekwipunku (jeśli to był item z inventory)
        const srcIdx = inventory.findIndex(i => i.id === state.sourceItem.id);
        if (srcIdx !== -1) inventory.splice(srcIdx, 1);

        // Odejmij dodatek z salda
        state.balance -= state.cashAdd;

        // Dodaj wygrany przedmiot
        inventory.push(wonItem);

        showResultModal(true, wonItem);
        spawnParticles(true);
    } else {
        // Przegrana – sourceItem znika z ekwipunku, dodatek z salda też
        const srcIdx = inventory.findIndex(i => i.id === state.sourceItem.id);
        if (srcIdx !== -1) inventory.splice(srcIdx, 1);
        state.balance -= state.cashAdd;

        showResultModal(false, state.targetItem);
        spawnParticles(false);
    }

    // Reset stanu
    state.sourceItem = null;
    state.targetItem = null;
    state.cashAdd = 0;
    state.selectedInventoryId = null;

    const slider = $('cash-slider');
    if (slider) { slider.max = 0; slider.value = 0; }
    $('cash-add-label').textContent = fmt(0);

    renderSourceItem();
    renderTargetItem();
    renderInventory();
    updateBalance();
    updateUpgradeChance();
}

// ============================================
// MODAL WYNIKU
// ============================================
function showResultModal(won, item) {
    const modal = $('result-modal');
    const content = $('result-modal-content');
    const icon = $('modal-status-icon');
    const title = $('modal-title');
    const desc = $('modal-desc');

    if (!modal || !content) return;

    if (won) {
        icon.className = 'w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 border relative z-10 bg-green-500/20 border-green-500/50 text-green-400';
        icon.innerHTML = '<i class="fa-solid fa-check"></i>';
        title.textContent = 'WYGRANA!';
        title.className = 'font-rajdhani text-2xl font-bold uppercase tracking-wider text-green-400 relative z-10';
        desc.textContent = 'Twój przedmiot został pomyślnie zastąpiony.';
    } else {
        icon.className = 'w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 border relative z-10 bg-red-500/20 border-red-500/50 text-red-400';
        icon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        title.textContent = 'PRZEGRANA';
        title.className = 'font-rajdhani text-2xl font-bold uppercase tracking-wider text-red-400 relative z-10';
        desc.textContent = 'Tym razem się nie udało. Spróbuj ponownie!';
    }

    $('modal-item-img').src = item.img;
    $('modal-item-name').textContent = item.name;
    $('modal-item-price').textContent = fmt(item.price);

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        content.classList.add('modal-in');
    });
}

function closeResultModal() {
    const modal = $('result-modal');
    const content = $('result-modal-content');
    if (!modal) return;
    modal.classList.add('opacity-0');
    content?.classList.remove('modal-in');
    setTimeout(() => modal.classList.add('hidden'), 200);
}

// ============================================
// CZĄSTECZKI
// ============================================
function spawnParticles(won) {
    const container = $('result-modal-content');
    if (!container) return;
    const colors = won ? ['#22c55e', '#8b5cf6', '#38bdf8', '#fde047'] : ['#ef4444', '#b91c1c', '#7f1d1d'];
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.setProperty('--tx', (Math.random() - 0.5) * 300 + 'px');
        p.style.setProperty('--ty', (Math.random() - 0.5) * 300 + 'px');
        container.appendChild(p);
        setTimeout(() => p.remove(), 1500);
    }
}

// ============================================
// SPRZEDAŻ
// ============================================
function sellSelectedItem() {
    if (!state.selectedInventoryId) {
        setStatus('Nie zaznaczono przedmiotu', 'text-yellow-500');
        return;
    }
    const idx = inventory.findIndex(i => i.id === state.selectedInventoryId);
    if (idx === -1) return;

    const item = inventory[idx];
    // Sprzedaż za 85% ceny
    const sellPrice = item.price * 0.85;
    state.balance += sellPrice;
    inventory.splice(idx, 1);
    state.selectedInventoryId = null;

    if (state.sourceItem && state.sourceItem.id === item.id) {
        clearSourceItem();
    }

    updateBalance();
    renderInventory();
    setStatus(`Sprzedano za ${fmt(sellPrice)}`, 'text-green-400');
}

// ============================================
// MODALE: PŁATNOŚĆ / PROMO
// ============================================
function openPaymentModal() {
    $('payment-modal')?.classList.remove('hidden');
    $('payment-message').textContent = '';
}
function closePaymentModal() {
    $('payment-modal')?.classList.add('hidden');
}

function confirmPayment() {
    const input = $('payment-input');
    const msg = $('payment-message');
    const amount = parseFloat(input.value);

    if (!amount || amount <= 0 || amount > 10000) {
        msg.textContent = 'Podaj kwotę między 0.01 a 10000';
        msg.className = 'text-xs mb-3 h-4 text-red-400';
        return;
    }

    // Symulacja: dodaj skiny o wartości ~kwoty + resztę do salda
    // (w prawdziwej aplikacji – integracja z API płatności)
    state.balance += amount;

    // Dodaj losowy skin z sklepu o podobnej wartości
    const affordable = storeCatalog.filter(i => i.price <= amount);
    if (affordable.length > 0) {
        const pick = affordable[Math.floor(Math.random() * affordable.length)];
        const remaining = amount - pick.price;

        inventory.push({
            id: 'inv_' + Date.now(),
            name: pick.name,
            wear: pick.wear,
            price: pick.price,
            rarity: pick.rarity,
            img: pick.img,
        });

        state.balance -= pick.price;
        state.balance += 0; // reszta już dodana wcześniej

        msg.textContent = `Dodano: ${pick.name} + ${fmt(amount - pick.price)} salda`;
    } else {
        msg.textContent = `Dodano ${fmt(amount)} do salda`;
    }
    msg.className = 'text-xs mb-3 h-4 text-green-400';

    updateBalance();
    renderInventory();
    updateCashSliderMax();

    setTimeout(closePaymentModal, 1200);
}

function openPromoModal() {
    $('promo-modal')?.classList.remove('hidden');
    $('promo-input').value = '';
    $('promo-message').textContent = '';
}
function closePromoModal() {
    $('promo-modal')?.classList.add('hidden');
}

function redeemPromoCode() {
    const code = $('promo-input').value.trim().toUpperCase();
    const msg = $('promo-message');

    if (!code) {
        msg.textContent = 'Wpisz kod';
        msg.className = 'text-xs mb-3 h-4 text-red-400';
        return;
    }

    // Przykładowe kody
    const codes = {
        'WELCOME': 5,
        'CS2PRO': 10,
        'FREE': 1,
    };

    if (codes[code]) {
        state.balance += codes[code];
        updateBalance();
        msg.textContent = `+${fmt(codes[code])} dodane!`;
        msg.className = 'text-xs mb-3 h-4 text-green-400';
        setTimeout(closePromoModal, 1200);
    } else {
        msg.textContent = 'Nieprawidłowy kod';
        msg.className = 'text-xs mb-3 h-4 text-red-400';
    }
}

// ============================================
// LOGIN / AUDIO
// ============================================
function toggleLogin() {
    state.loggedIn = !state.loggedIn;
    const txt = $('steam-btn-text');
    if (txt) txt.textContent = state.loggedIn ? 'Wyloguj' : 'Steam User';
    setStatus(state.loggedIn ? 'Zalogowano' : 'Wylogowano', 'text-green-400');
}

function toggleAudio() {
    state.audioEnabled = !state.audioEnabled;
    const icon = $('sound-icon');
    if (icon) {
        icon.className = state.audioEnabled
            ? 'fa-solid fa-volume-high'
            : 'fa-solid fa-volume-xmark';
    }
}

// ============================================
// LIVE FEED (symulacja)
// ============================================
function startLiveFeed() {
    const feed = $('live-feed');
    if (!feed) return;

    const names = storeCatalog.map(i => i.name);
    const addFeed = () => {
        const name = names[Math.floor(Math.random() * names.length)];
        const win = Math.random() > 0.5;
        const el = document.createElement('div');
        el.className = 'flex items-center gap-1.5 text-[10px] whitespace-nowrap px-2 py-1 rounded bg-cardBg/60 border border-borderBorder/40';
        el.innerHTML = `
            <span class="font-mono text-gray-500">User${Math.floor(Math.random()*9999)}</span>
            <span class="${win ? 'text-green-400' : 'text-red-400'}">${win ? 'wygrał' : 'przegrał'}</span>
            <span class="text-white font-semibold truncate max-w-[140px]">${name}</span>
        `;
        feed.insertBefore(el, feed.firstChild);
        while (feed.children.length > 15) feed.removeChild(feed.lastChild);
    };

    for (let i = 0; i < 8; i++) addFeed();
    setInterval(addFeed, 4000);
}

// ============================================
// LICZNIKI (symulacja)
// ============================================
function startCounters() {
    const setCounters = (val) => {
        ['online-counter', 'online-counter-mobile'].forEach(id => {
            const el = $(id);
            if (el) el.textContent = val.toLocaleString('pl-PL');
        });
    };
    const setUpgrades = (val) => {
        ['total-upgrades-counter', 'total-upgrades-counter-mobile'].forEach(id => {
            const el = $(id);
            if (el) el.textContent = val.toLocaleString('pl-PL');
        });
    };

    let online = 1842;
    let upgrades = 14290120;

    setCounters(online);
    setUpgrades(upgrades);

    setInterval(() => {
        online += Math.floor(Math.random() * 7) - 3;
        if (online < 1500) online = 1500;
        setCounters(online);
    }, 5000);

    setInterval(() => {
        upgrades += Math.floor(Math.random() * 5) + 1;
        setUpgrades(upgrades);
    }, 3000);
}

// ============================================
// INICJALIZACJA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Startowy bonus
    state.balance = 0;

    renderInventory();
    renderStoreCatalog();
    updateBalance();
    updateUpgradeChance();
    startLiveFeed();
    startCounters();

    // Wyszukiwarka i sort już mają oninput/onchange w HTML

    console.log('[CSCASEPRO] Zainicjalizowano. Sklep:', storeCatalog.length, 'pozycji.');
});
