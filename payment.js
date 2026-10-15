// ============================================
// SYSTEM DOŁADOWANIA (skiny + reszta do salda)
// ============================================

function openPaymentModal() {
    document.getElementById('payment-modal').classList.remove('hidden');
    document.getElementById('payment-message').innerHTML = '';
    document.getElementById('payment-input').value = '5.00';
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
}

// Losuje skiny ze storeCatalog aż suma nie przekroczy zadanej kwoty,
// a resztę zwraca jako remainder (do salda).
function generateItemsForAmount(amount) {
    const items = [];
    let remaining = amount;
    // Sortuj od najtańszego do najdroższego
    const sorted = [...storeCatalog].sort((a, b) => a.price - b.price);

    // Znajdź najtańszy item
    const cheapest = sorted[0].price;
    if (amount < cheapest) return { items: [], remainder: amount };

    let safety = 0;
    while (remaining >= cheapest && safety < 100) {
        safety++;
        // Kandydaci: wszystkie itemy <= remaining
        const candidates = sorted.filter(i => i.price <= remaining);
        if (candidates.length === 0) break;

        // Preferuj droższe itemy, gdy zostaje dużo kasy (żeby nie robić 50 tanich)
        const pool = candidates.filter(i => i.price >= remaining * 0.3);
        const chosenPool = pool.length > 0 ? pool : candidates;
        const chosen = chosenPool[Math.floor(Math.random() * chosenPool.length)];

        items.push(chosen);
        remaining -= chosen.price;
        remaining = Math.round(remaining * 100) / 100; // zaokrąglenie do groszy
    }

    return { items, remainder: Math.round(remaining * 100) / 100 };
}

function confirmPayment() {
    const input = document.getElementById('payment-input');
    const msg = document.getElementById('payment-message');
    const amount = parseFloat(input.value);

    if (isNaN(amount) || amount <= 0) {
        msg.innerHTML = `<span class="text-red-400 font-bold">❌ Wpisz poprawną kwotę.</span>`;
        return;
    }

    if (amount > 10000) {
        msg.innerHTML = `<span class="text-red-400 font-bold">❌ Maksymalna kwota to $10,000.</span>`;
        return;
    }

    const { items, remainder } = generateItemsForAmount(amount);

    if (items.length === 0) {
        // Kwota mniejsza niż najtańszy skin – wszystko do salda
        balance += amount;
        document.getElementById('user-balance').innerText = `$${balance.toFixed(2)}`;
        document.getElementById('cash-slider').max = Math.max(0, balance).toFixed(2);
        recalculateOdds();
        msg.innerHTML = `<span class="text-emerald-400 font-bold">✅ Dodano $${amount.toFixed(2)} do salda.</span>`;
        setTimeout(() => closePaymentModal(), 1800);
        return;
    }

    // Dodaj skiny do ekwipunku
    items.forEach((it, idx) => {
        inventory.push({
            ...it,
            id: 'pay_' + Date.now() + '_' + idx
        });
    });

    // Reszta do salda
    if (remainder > 0) {
        balance += remainder;
        document.getElementById('user-balance').innerText = `$${balance.toFixed(2)}`;
        document.getElementById('cash-slider').max = Math.max(0, balance).toFixed(2);
    }

    renderPlayerInventory();
    recalculateOdds();

    const totalItemsValue = items.reduce((s, i) => s + i.price, 0);
    msg.innerHTML = `<span class="text-emerald-400 font-bold">✅ ${items.length} skinów ($${totalItemsValue.toFixed(2)}) + $${remainder.toFixed(2)} do salda.</span>`;

    setTimeout(() => closePaymentModal(), 2200);
}
