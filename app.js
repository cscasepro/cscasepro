let balance = 0.00;
let addedCash = 0.00;
let isSpinning = false;
let audioMuted = false;
let selectedSourceItem = null;
let selectedTargetItem = null;
let calculatedChance = 0;

let inventory = []; // Zaczynamy z pustym ekwipunkiem
let storeCatalog = [];

// Funkcja generująca losowy stan zużycia na podstawie min_float i max_float z JSON
function getRandomWear(minFloat, maxFloat) {
    const wears = [
        { name: 'Factory New', min: 0.00, max: 0.07 },
        { name: 'Minimal Wear', min: 0.07, max: 0.15 },
        { name: 'Field-Tested', min: 0.15, max: 0.38 },
        { name: 'Well-Worn', min: 0.38, max: 0.45 },
        { name: 'Battle-Scarred', min: 0.45, max: 1.00 }
    ];
    
    // Znajdź stopnie, które pasują do zakresu float danego skina
    const possibleWears = wears.filter(w => w.max > minFloat && w.min < maxFloat);
    const randomWear = possibleWears[Math.floor(Math.random() * possibleWears.length)];
    
    // Zwracamy skrót (np. FT) do wyświetlania
    const shortMap = {
        'Factory New': 'FN',
        'Minimal Wear': 'MW',
        'Field-Tested': 'FT',
        'Well-Worn': 'WW',
        'Battle-Scarred': 'BS'
    };
    return shortMap[randomWear.name];
}

// Pobieranie i konwersja skinów
async function loadSkinsData() {
    try {
        const response = await fetch('skins.json');
        const data = await response.json();

        // Mieszamy tablicę (żeby nie było zawsze tych samych na początku)
        data.sort(() => Math.random() - 0.5);

        // Bierzemy 50% skinów (zgodnie z Twoją prośbą)
        const halfCount = Math.floor(data.length * 0.5);
        const selectedSkins = data.slice(0, halfCount);

        // Mapujemy format z GitHuba na format Twojej strony
        storeCatalog = selectedSkins.map(skin => {
            // Generujemy losową cenę na podstawie rzadkości (możesz to zmienić)
            let basePrice = 1.00;
            if (skin.rarity.name === 'Covert') basePrice = 50.00;
            else if (skin.rarity.name === 'Classified') basePrice = 20.00;
            else if (skin.rarity.name === 'Restricted') basePrice = 5.00;
            else if (skin.rarity.name === 'Mil-Spec Grade') basePrice = 1.50;
            else if (skin.rarity.name.includes('Knife') || skin.rarity.name.includes('Gloves')) basePrice = 150.00;

            // Losowa cena z widełek +/- 20%
            const finalPrice = (basePrice * (0.8 + Math.random() * 0.4)).toFixed(2);

            // Mapowanie rzadkości na klasy CSS
            let rarityClass = 'rarity-milspec';
            if (skin.rarity.name === 'Covert') rarityClass = 'rarity-covert';
            if (skin.rarity.name === 'Classified') rarityClass = 'rarity-classified';
            if (skin.rarity.name === 'Restricted') rarityClass = 'rarity-restricted';
            if (skin.rarity.name.includes('Knife') || skin.rarity.name.includes('Gloves')) rarityClass = 'rarity-knife';

            return {
                id: skin.id,
                name: skin.name,
                wear: getRandomWear(skin.min_float || 0, skin.max_float || 1),
                price: parseFloat(finalPrice),
                rarity: rarityClass,
                img: skin.image
            };
        });

        // Opcjonalnie: na start dodaj graczowi 3 losowe skiny do ekwipunku
        for(let i=0; i<3; i++) {
            const randomItem = storeCatalog[Math.floor(Math.random() * storeCatalog.length)];
            inventory.push({ ...randomItem, id: 'start_' + Date.now() + '_' + i });
        }

        // Odświeżamy widok po załadowaniu danych
        renderPlayerInventory();
        renderStoreCatalog();
        populateLiveFeed();
        
    } catch (error) {
        console.error("Błąd podczas ładowania skins.json:", error);
    }
}

// Wywołaj ładowanie danych po załadowaniu strony
window.addEventListener('DOMContentLoaded', () => {
    loadSkinsData(); // <-- To ładuje nasze nowe skiny
    updateBalanceDisplay();
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
