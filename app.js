// --- OBSŁUGA PŁATNOŚCI I NOWEGO INTERFEJSU ---
function openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    const msg = document.getElementById('payment-message');
    if (modal) modal.classList.remove('hidden');
    if (msg) msg.innerHTML = '';
    
    // Sprawdzamy, czy kod jest aktywny, żeby zaktualizować baner w oknie doładowania
    const promoInput = document.getElementById('main-promo-input');
    const promoStatusText = document.getElementById('promo-status-text');
    const hasBonus = promoInput && promoInput.value.trim().toUpperCase() === 'FREE';
    
    if (promoStatusText) {
        if (hasBonus) {
            promoStatusText.innerHTML = `<span class="text-[#a3e635] font-bold">Kod FREE jest aktywny! Otrzymujesz 10% bonusu.</span>`;
        } else {
            promoStatusText.innerHTML = `Wpisz kod na stronie głównej, aby otrzymać bonus.`;
        }
    }
    
    calculateBonus();
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('hidden');
}

function selectAmount(amount) {
    const input = document.getElementById('payment-input');
    if (input) {
        input.value = amount;
        calculateBonus();
    }
}

function calculateBonus() {
    const input = document.getElementById('payment-input');
    const receiveEl = document.getElementById('payment-receive-amount');
    const btnAmountEl = document.getElementById('payment-button-amount');
    const bonusTagContainer = document.getElementById('bonus-tag-container');
    
    if (!input || !receiveEl || !btnAmountEl) return;

    let amount = parseFloat(input.value) || 0;
    if (amount < 0) amount = 0;

    // Pobieranie kodu z GŁÓWNEGO pola (na samej górze strony)
    const promoInput = document.getElementById('main-promo-input');
    const promoCode = promoInput ? promoInput.value.trim().toUpperCase() : '';
    const hasBonus = promoCode === 'FREE';

    // 10% bonusu tylko jeśli kod to FREE
    const finalAmount = hasBonus ? amount * 1.1 : amount;

    receiveEl.innerText = `${finalAmount.toFixed(2)} PLN`;
    btnAmountEl.innerText = `${amount.toFixed(2)} PLN`;

    if (bonusTagContainer) {
        if (hasBonus) {
            bonusTagContainer.style.opacity = '1';
        } else {
            bonusTagContainer.style.opacity = '0.3';
        }
    }
}

function executePayment() {
    const input = document.getElementById('payment-input');
    const msg = document.getElementById('payment-message');
    if (!input || !msg) return;

    let amount = parseFloat(input.value) || 0;
    if (amount < 4) {
        msg.innerHTML = `<span class="text-red-400">Minimalna kwota to 4 PLN.</span>`;
        return;
    }

    // Pobieranie kodu z GŁÓWNEGO pola
    const promoInput = document.getElementById('main-promo-input');
    const promoCode = promoInput ? promoInput.value.trim().toUpperCase() : '';
    const hasBonus = promoCode === 'FREE';
    const finalAmount = hasBonus ? amount * 1.1 : amount;

    msg.innerHTML = `<span class="text-yellow-400"><i class="fa-solid fa-spinner fa-spin"></i> Przetwarzanie BLIK...</span>`;
    
    setTimeout(() => {
        balance += finalAmount;
        
        if (hasBonus) {
            msg.innerHTML = `<span class="text-[#a3e635]">✅ Pomyślnie doładowano ${finalAmount.toFixed(2)} PLN (w tym 10% bonusu)!</span>`;
        } else {
            msg.innerHTML = `<span class="text-[#a3e635]">✅ Pomyślnie doładowano ${finalAmount.toFixed(2)} PLN.</span>`;
        }
        
        updateBalanceDisplay();
        
        const slider = document.getElementById('cash-slider');
        if (slider) slider.max = Math.max(0, balance).toFixed(2);
        
        recalculateOdds();

        setTimeout(() => {
            closePaymentModal();
            msg.innerHTML = '';
        }, 2500);

    }, 1500);
}

// Obsługa zielonego ptaszka i dynamiczne przeliczanie w GŁÓWNYM polu (na górze)
document.addEventListener('DOMContentLoaded', () => {
    const promoInput = document.getElementById('main-promo-input');
    const checkIcon = document.getElementById('main-promo-check-icon');
    
    if (promoInput && checkIcon) {
        promoInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toUpperCase();
            if (val === 'FREE') {
                checkIcon.classList.remove('text-gray-600');
                checkIcon.classList.add('text-[#a3e635]');
            } else {
                checkIcon.classList.add('text-gray-600');
                checkIcon.classList.remove('text-[#a3e635]');
            }
            // Jeśli okno płatności jest otwarte, od razu przeliczamy kwotę
            calculateBonus();
        });
    }
});
