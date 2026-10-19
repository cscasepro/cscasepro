// ============================================
// BAZA WSZYSTKICH 27 SKINÓW I STAN GRY
// ============================================
window.storeCatalog = [
    { id: 's1', name: 'AK-47 | Safari Mesh', wear: 'FT', price: 0.46, rarity: 'rarity-milspec', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wjFL0P-re6xSNPGdMWuZxuZi_rIxSirkkElyt2qEzI2heXiTaVIiX5siROQJtxnul4XnYbvgswOMgolbjXKpnRk9Yjk' },
    { id: 's2', name: 'M4A4 | Urban DDPAT', wear: 'FT', price: 0.75, rarity: 'rarity-milspec', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwipC0PaqeKV5H-WBDFicyOl-pK8xF3DjzR5_4zncnouhcSjGPQ8jA5B3ELFbuhPqloDkPrvjsgXY2t5N02yg2Rf5X8A9' },
    { id: 's3', name: 'P2000 | Imperial', wear: 'MW', price: 1.25, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0POjV7Q_cKDDMW6d0etkueBlcDu2kSIrujqNjsGrJH6XPQ9xAsZ5FLIDtBG5mtfhY7nl4gGNiosTzH792ntOvC1stbsDT-N7ra_mVv2F' },
    { id: 's4', name: 'Five-SeveN | Violent Daimyo', wear: 'FT', price: 1.52, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3l4Dl7idN6vyRa7FSJvmFC1iDxPhzvt5tTiC-jBIYvzSCkpu3cXjCPAB2WZMmQ-EK4BTqlNSzNOLk71GI3tpGmX2oii5N6nk667kDWL1lpPNv4wCTtw' },
    { id: 's5', name: 'M4A1-S | Night Terror', wear: 'FT', price: 1.89, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_eAMWrEwL9lj-hnXCa-mxQmjDGMnYftby3FPFVxA5ZwRecOtUXuxtPiNL_jsQLc2NkTzS38jC5L7ydj5u8EUKo7uvqAgGSM4LM' },
    { id: 's6', name: 'StatTrak™ PP-Bizon | Space Cat', wear: 'MW', price: 2.47, rarity: 'rarity-classified', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLzl4zv8x1Y-s2sYb5iLs-AHmaTxO13pN5lRi67gVN04jvcmYv6IHnGbw51XsYmQO5ftBG9xoexNrix4gPYjIJEzX_2iX9I8G81tOIzQC5J' },
    { id: 's7', name: 'MAC-10 | Lapis Gator', wear: 'FT', price: 2.74, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1a4s2jaac8cM-WAmKT1fx_s-h9Vha_nBovp3ODztegd3LEawcnX5ByFLQPtxSxldyxPrjg5QCPj94Ty3j8j3tLu30__a9cBu41m2up' },
    { id: 's8', name: 'StatTrak™ USP-S | Silent Shot', wear: 'WW', price: 3.24, rarity: 'rarity-classified', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSNeODHViDyOJzvvVWTSaqqhEutDWR1Nf8cn_CPAQmW8Z5Ee8P4UbuxILmMLu3tAXYj4hByyWsjCscvy89sOYcEf1yCvXTIoM' },
    { id: 's9', name: 'Glock-18 | Green Line', wear: 'MW', price: 3.63, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c4_2tY5t5MvGaAFiX0-tzvt5lRi67gVNw5TjSy4mseXqXagEpW8FyQu5cu0Hpw4ayNLjntFeNgoJEnyWqjCNN8G81tF3dwatE' },
    { id: 's10', name: 'StatTrak™ Desert Eagle | Trigger Discipline', wear: 'BS', price: 4.15, rarity: 'rarity-classified', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ8-HHG6Xxutkj-VgXCq6hREuvTi6lob-KT-Ja1UlWMAkTOMCt0G9kIHlP77l5FbW344XxX_4iSJJv31r4bxRUKUn_rqX0V-d-rquYA' },
    { id: 's11', name: 'Glock-18 | Candy Apple', wear: 'MW', price: 4.64, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1I4M28baBSLPmUBnPelb93teA-FivjzB5wsjzTyI2pIn_CPAMoW8N3ROJZshm5w9zgNbnk5xue1dyMA9ZU_Q' },
    { id: 's12', name: 'Tec-9 | Sultan', wear: 'MW', price: 5.50, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLlm5W5wjZe7KuRe7FhNPGdMWuZxuZi_rQ9F3yykUV_42_Qytiuc32VPQMoX5EjReZfshG8kYWyPr7ks1DeiYNbjXKpvEFNuPw' },
    { id: 's13', name: 'P250 | X-Ray', wear: 'MW', price: 6.37, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiFO0Oq8ab1SMKLGXlicyOl-pK8_HSjjxx9wsmXQnIv6cH2TaAQoWZd4RuAKshe7wdS1NOvi5VCIi48Q02yg2fSIc8-4' },
    { id: 's14', name: 'StatTrak™ Glock-18 | Catacombs', wear: 'MW', price: 6.98, rarity: 'rarity-classified', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK8-XC2aEyfp5vO1WQyC0nQlptWWDzIz8dy6QalMgXsMiQbEJtRjskdW2M7nn71Dcj49Fm3qsiClB7jErvbhnnfwjgw' },
    { id: 's15', name: 'Desert Eagle | Blue Ply', wear: 'FT', price: 7.50, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ_yWMXWV0eJ_s-BWQyC0nQlpsjzdwtqgIHqfZgAgDZBwROBbtRDsm4HiM7zislfYitpBniz6iy5K7DErvbjLUTqBnA' },
    { id: 's16', name: 'AK-47 | Uncharted', wear: 'MW', price: 7.91, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSIeqHC2SvzedxuPUnFnCwwBl_5D_Syon8dnyUaQUlD5oiQ7ECuxW7l920ZL-w4AfX2IlByTK-0H0PRM7cOA' },
    { id: 's17', name: 'StatTrak™ Galil AR | Akoben', wear: 'WW', price: 8.27, rarity: 'rarity-classified', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2n5rp8SNJ0OG-V6NsLPmfMWabzuxzvt5lRi67gVMlt2_dzd6qcH2TOgN0CpIlE7Ve5hbukdW0MrixslPW2IgQzyv8jypI8G81tJzCUipD' },
    { id: 's18', name: 'M4A4 | Magnesium', wear: 'FT', price: 9.63, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiVI0P_6afBSI_icHneV09FxuO56Wxa_nBovp3OAzo2vdHPFPFUmCJRxRbNZ4xewx9W1Nb7j4gzXg99Ayy73iC1Aun1q_a9cBiEfMG3G' },
    { id: 's19', name: 'UMP-45 | Arctic Wolf', wear: 'FT', price: 10.63, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1Y-s27ZbQ5dc-EBm6ExNFwse9ucCW6khUz_WiGzY6pJyjCZwN1A5p5Q-MCuxa7ldW0Ne3ntQHW2YpFmSv63S1B73t1o7FVFkKgM50' },
    { id: 's20', name: 'Glock-18 | Moonrise', wear: 'FT', price: 11.00, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1a7s2pZKtuK8_CVliF0-x3vt5kQCa9qhsipTiXpYPwJiPTcANzXJNyFOEMthXsktHhMLzl4FaK3toWn3iqhi9BvHw9su5UU6Zw-_bJz1aWcX-Jd_0' },
    { id: 's21', name: 'UMP-45 | Crimson Foil', wear: 'MW', price: 12.00, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1c_PGmV7d9L-KHMXKd0bojj-1gSCGn20V2tm_Sn9irdX3EZwUkA5B1R-IL5Ebsk9O2MOni4AKIgogUmH333SlXrnE8E6oIYXY' },
    { id: 's22', name: 'StatTrak™ PP-Bizon | Blue Streak', wear: 'BS', price: 13.02, rarity: 'rarity-classified', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLzl4zv8x1T9s29eKhsNOSWHFicyOl-pK8-Hyzjx0t1sWjdy4v_dXyVaFcpC5ElTO4OsxSxkILjYu3k5wKM2dlG02yg2QMXfH6m' },
    { id: 's23', name: 'USP-S | Sleeping Potion', wear: 'MW', price: 13.14, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSM_-WMXeF0_56td5lRi67gVMh4D-Gn4qheH6RPFIoCcAhELVf5kK-xNexMe_rtFfai45EnC_8iH9I8G81tAH9GDu2' },
    { id: 's24', name: 'UMP-45 | Scaffold', wear: 'FT', price: 13.58, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1c_M27ZbRSIfKKHXSvzedxuPUnGi2ywBwhsmuDnNn9cX_EbA4mCcF1QbJZ5BPtm9fjZejnslDciNgUzTK-0H2MLp31Hw' },
    { id: 's25', name: 'MP9 | Arctic Tri-Tone', wear: 'MW', price: 14.65, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f-jFk7uCtfK1uH_2DV1icyOl-pK86HHrrwE5ztWSGydv_eCifOAF2DMB5Fu5etEK9lt3hMuLh5gWPitgX02yg2dKG9WA-' },
    { id: 's26', name: 'USP-S | Alpine Camo', wear: 'FN', price: 16.02, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSJ-OQBliS0-dxuPVWTCi-miIyoC26lob-KT-JaVIpXpRxFuIMtRe4x9PjYrni7wfejYpFnn3-jCNB6C4_5u4FU6It8rqX0V8gYmZtWA' },
    { id: 's27', name: 'MAG-7 | Hard Water', wear: 'MW', price: 16.80, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wiNW0P-vb_NSI_GGHXOZwtF6ueZhW2eykx534j_VydygIi6fPQJ0DJcmQrIMukK7k9HvZO224FbajI8WnC-tkGoXudK2z8cj' }
];

// Wyczyszczony ekwipunek startowy (pusty)
window.inventory = [];

// ============================================
// KONFIGURACJA KASYNA (RTP / House Edge)
// ============================================
const CASINO_CONFIG = {
    RTP_FACTOR: 0.95,
    MIN_CHANCE: 1.0,  
    MAX_CHANCE: 80.0  
};

// ============================================
// GAME ENGINE
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

// ============================================
// STAN APLIKACJI (Wyzerowane saldo: $0.00)
// ============================================
let balance = 0.00;
let addedCash = 0.00;
let isSpinning = false;
let audioMuted = false;
let selectedSourceItem = null;
let selectedTargetItem = null;
let calculatedChance = 0;

let inventory = window.inventory;
let storeCatalog = window.storeCatalog;

// ============================================
// AUDIO SYNTH
// ============================================
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
        p.style.boxShadow = `0 0 8px ${p.style.background}`;
        container.appendChild(p);
        setTimeout(() => p.remove(), 1600);
    }
}

// ============================================
// AUTOMATYCZNE RENDEROWANIE PO ZAŁADOWANIU
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    const balanceEl = document.getElementById('user-balance');
    if (balanceEl) balanceEl.innerText = `$${balance.toFixed(2)}`;
    
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

function renderPlayerInventory() {
    const grid = document.getElementById('inventory-grid');
    const badge = document.getElementById('inventory-count-badge');
    if (!grid) return;
    grid.innerHTML = '';
    if (badge) badge.innerText = `${inventory.length} przedmiotów`;
    
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
    
    const balanceEl = document.getElementById('user-balance');
    if (balanceEl) balanceEl.innerText = `$${balance.toFixed(2)}`;
    
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

// ============================================
// PROCES LOSOWANIA I ANIMACJA KOŁA
// ============================================
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
        const balanceEl = document.getElementById('user-balance');
        const slider = document.getElementById('cash-slider');
        if (balanceEl) balanceEl.innerText = `$${balance.toFixed(2)}`;
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

    const wheelSvg = document.getElementById('wheel-svg');
    if (wheelSvg) wheelSvg.classList.add('spinning-glow');

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
        if (wheelSvg) wheelSvg.classList.remove('spinning-glow');
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

// ============================================
// MODALE I LIVE FEED
// ============================================
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
        if (desc) desc.innerText = "Twój nowy skin powędrował do ekwipunku.";
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

// ============================================
// KODY PROMOCYJNE
// ============================================
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
        { id: 'promo2_' + Date.now(), name: 'M4A4 | Urban DDPAT', wear: 'FT', price: 0.75, rarity: 'rarity-milspec', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwipC0PaqeKV5H-WBDFicyOl-pK8xF3DjzR5_4zncnouhcSjGPQ8jA5B3ELFbuhPqloDkPrvjsgXY2t5N02yg2Rf5X8A9' },
        { id: 'promo3_' + Date.now(), name: 'P2000 | Imperial', wear: 'MW', price: 1.25, rarity: 'rarity-restricted', img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0POjV7Q_cKDDMW6d0etkueBlcDu2kSIrujqNjsGrJH6XPQ9xAsZ5FLIDtBG5mtfhY7nl4gGNiosTzH792ntOvC1stbsDT-N7ra_mVv2F' }
    ];

    promoItems.forEach(it => inventory.push(it));
    localStorage.setItem(PROMO_STORAGE_KEY, 'true');

    renderPlayerInventory();
    msg.innerHTML = `<span class="text-emerald-400 font-bold">✅ Odebrano! Dodano skiny do ekwipunku.</span>`;

    setTimeout(() => closePromoModal(), 1500);
}
