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
        if (typeof chance !== 'number' || chance < 0 || chance > 100 || isNaN(chance)) {
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
