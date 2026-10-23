const CASINO_CONFIG = { RTP_FACTOR: 0.95, MIN_CHANCE: 1.0, MAX_CHANCE: 80.0 };
const GameEngine = (() => {
    let _lastSpinTime = 0; let _spinCount = 0; const MIN_SPIN_INTERVAL = 2500;
    function secureRandom() { const arr = new Uint32Array(1); crypto.getRandomValues(arr); return arr[0] / 4294967296; }
    function canSpin() { const now = Date.now(); if (now - _lastSpinTime < MIN_SPIN_INTERVAL) return { allowed: false, reason: 'Zwolnij! Odczekaj chwilę.' }; return { allowed: true }; }
    function calculateRealChance(sourceValue, targetValue) { if (sourceValue <= 0 || targetValue <= 0) return 0; const rawChance = (sourceValue / targetValue) * 100; const adjustedChance = rawChance * CASINO_CONFIG.RTP_FACTOR; return Math.min(Math.max(adjustedChance, CASINO_CONFIG.MIN_CHANCE), CASINO_CONFIG.MAX_CHANCE); }
    function rollOutcome(chance) { if (typeof chance !== 'number' || chance < 0 || chance > 100 || isNaN(chance)) throw new Error('Invalid chance'); const roll = secureRandom() * 100; return { roll, chance, outcome: roll <= chance, timestamp: Date.now(), spinId: 'spin_' + (++_spinCount) }; }
    return { canSpin, calculateRealChance, rollOutcome, getSpinCount: () => _spinCount, resetRateLimit: () => { _lastSpinTime = 0; }, recordSpin: () => { _lastSpinTime = Date.now(); } };
})();

let balance = 0.00; let addedCash = 0.00; let isSpinning = false; let audioMuted = false; let selectedSourceItem = null; let selectedTargetItem = null; let calculatedChance = 0;
let inventory = []; let storeCatalog = []; let catalogPage = 1; let shopPage = 1; const ITEMS_PER_PAGE = 8;

const AudioSynth = {
    ctx: null,
    init() { if (!this.ctx) { const AudioContext = window.AudioContext || window.webkitAudioContext; if (AudioContext) this.ctx = new AudioContext(); } },
    playTick(speedFactor = 1) { if (audioMuted) return; this.init(); if (!this.ctx) return; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sine'; const baseFreq = 500 + speedFactor * 500; osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.025); const vol = Math.min(0.02 + speedFactor * 0.025, 0.06); gain.gain.setValueAtTime(vol, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.025); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.025); },
    playWin() { if (audioMuted) return; this.init(); if (!this.ctx) return; const now = this.ctx.currentTime; [440, 554.37, 659.25, 880].forEach((freq, idx) => { const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, now + idx * 0.08); gain.gain.setValueAtTime(0.1, now + idx * 0.08); gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.3); }); },
    playLoss() { if (audioMuted) return; this.init(); if (!this.ctx) return; const now = this.ctx.currentTime; [200, 160, 120].forEach((freq, idx) => { const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, now + idx * 0.1); gain.gain.setValueAtTime(0.07, now + idx * 0.1); gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.2); osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now + idx * 0.1); osc.stop(now + idx * 0.1 + 0.2); }); }
};

function spawnParticles(container, count, colors) { if (!container) return; for (let i = 0; i < count; i++) { const p = document.createElement('div'); p.className = 'particle'; const angle = Math.random() * Math.PI * 2; const distance = 80 + Math.random() * 150; p.style.setProperty('--tx', Math.cos(angle) * distance + 'px'); p.style.setProperty('--ty', Math.sin(angle) * distance + 'px'); p.style.left = '50%'; p.style.top = '50%'; p.style.background = colors[Math.floor(Math.random() * colors.length)]; container.appendChild(p); setTimeout(() => p.remove(), 1600); } }

function getRandomWear(minFloat, maxFloat) {
    const wears = [{ name: 'Factory New', min: 0.00, max: 0.07 }, { name: 'Minimal Wear', min: 0.07, max: 0.15 }, { name: 'Field-Tested', min: 0.15, max: 0.38 }, { name: 'Well-Worn', min: 0.38, max: 0.45 }, { name: 'Battle-Scarred', min: 0.45, max: 1.00 }];
    const possibleWears = wears.filter(w => w.max > minFloat && w.min < maxFloat);
    const randomWear = possibleWears.length > 0 ? possibleWears[Math.floor(Math.random() * possibleWears.length)] : wears[2];
    const shortMap = { 'Factory New': 'FN', 'Minimal Wear': 'MW', 'Field-Tested': 'FT', 'Well-Worn': 'WW', 'Battle-Scarred': 'BS' };
    return shortMap[randomWear.name] || 'FT';
}

async function loadSkinsData() {
    try {
        const url = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json';
        const response = await fetch(url); if (!response.ok) throw new Error("Błąd sieci"); let data = await response.json();
        const uniqueSkins = Array.from(new Map(data.map(item => [item.name, item])).values()); uniqueSkins.sort(() => Math.random() - 0.5);
        const selectedSkins = uniqueSkins.slice(0, 1000);
        storeCatalog = selectedSkins.map(skin => {
            let basePrice = 1.00; let rarityClass = 'rarity-milspec';
            if (skin.rarity && skin.rarity.name) {
                const rName = skin.rarity.name;
                if (rName === 'Covert') { basePrice = 45.00; rarityClass = 'rarity-covert'; }
                else if (rName === 'Classified') { basePrice = 20.00; rarityClass = 'rarity-classified'; }
                else if (rName === 'Restricted') { basePrice = 8.00; rarityClass = 'rarity-restricted'; }
                else if (rName === 'Mil-Spec Grade') { basePrice = 2.50; }
                else if (rName === 'Industrial Grade' || rName === 'Consumer Grade') { basePrice = 0.50; }
                if (skin.name.includes('★') || (skin.category && skin.category.name === 'Gloves') || rName === 'Extraordinary' || rName === 'Contraband') { basePrice = 350.00; rarityClass = 'rarity-knife'; }
            }
            const priceMultiplier = 0.7 + (Math.random() * 0.6); const finalPrice = (basePrice * priceMultiplier).toFixed(2);
            return { id: skin.id || 'skin_' + Math.random(), name: skin.name || 'Unknown Skin', wear: getRandomWear(skin.min_float || 0, skin.max_float || 1), price: parseFloat(finalPrice), rarity: rarityClass, img: skin.image || '' };
        });
        renderPlayerInventory(); renderStoreCatalog(1); renderPopShop(1); populateLiveFeed();
    } catch (error) { console.error("Błąd:", error); alert("Nie udało się pobrać skinów z GitHuba."); }
}

window.addEventListener('DOMContentLoaded', () => {
    loadSkinsData(); updateBalanceDisplay(); updateWheelArc(0);
    const slider = document.getElementById('cash-slider'); if (slider) slider.max = Math.max(0, balance).toFixed(2);
    const promoInput = document.getElementById('main-promo-input'); const checkIcon = document.getElementById('main-promo-check-icon');
    if (promoInput && checkIcon) {
        promoInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toUpperCase();
            if (val === 'FREE') { checkIcon.classList.remove('bg-gray-600'); checkIcon.classList.add('bg-emerald-400'); }
            else { checkIcon.classList.add('bg-gray-600'); checkIcon.classList.remove('bg-emerald-400'); }
            calculateBonus();
        });
    }
});

function changePage(context, dir) { if (context === 'catalog') { catalogPage += dir; if (catalogPage < 1) catalogPage = 1; renderStoreCatalog(catalogPage); } else if (context === 'shop') { shopPage += dir; if (shopPage <
