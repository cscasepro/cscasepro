// ============================================
// EKWIPUNEK GRACZA (startowy)
// ============================================
const inventory = [
    { id: 'i1', name: 'AK-47 | Redline', wear: 'FT', price: 18.50, rarity: 'rarity-classified', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
    { id: 'i2', name: 'M4A4 | Evil Daimyo', wear: 'FN', price: 5.20, rarity: 'rarity-restricted', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
    { id: 'i3', name: 'AWP | Atheris', wear: 'MW', price: 11.00, rarity: 'rarity-restricted', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
    { id: 'i4', name: 'USP-S | Cyrex', wear: 'FT', price: 3.80, rarity: 'rarity-restricted', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
    { id: 'i5', name: 'Glock-18 | Water Elemental', wear: 'MW', price: 9.50, rarity: 'rarity-classified', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
    { id: 'i6', name: 'Desert Eagle | Mecha Industries', wear: 'FT', price: 7.00, rarity: 'rarity-classified', img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZFCb4rdY608p458Ka0aBO2bld455ODBDq054454B44554245454542454545454542/360fx360f' },
];

// ============================================
// SKLEP CSCASEPRO
// ============================================
const storeCatalog = [
    { id: 's1', name: 'AK-47 | Empress', wear: 'FT', price: 32.00, rarity: 'rarity-covert', img: 'https://placehold.co/180x130/15132a/8b5cf6?text=AK-47+Empress' },
    { id: 's2', name: 'AWP | Asiimov', wear: 'FT', price: 68.00, rarity: 'rarity-covert', img: 'https://placehold.co/180x130/15132a/38bdf8?text=AWP+Asiimov' },
    { id: 's3', name: 'M4A1-S | Printstream', wear: 'MW', price: 110.00, rarity: 'rarity-covert', img: 'https://placehold.co/180x130/15132a/8b5cf6?text=M4A1-S+Printstream' },
    { id: 's4', name: 'AK-47 | Vulcan', wear: 'FT', price: 145.00, rarity: 'rarity-covert', img: 'https://placehold.co/180x130/15132a/38bdf8?text=AK-47+Vulcan' },
    { id: 's5', name: 'USP-S | Kill Confirmed', wear: 'FN', price: 175.00, rarity: 'rarity-covert', img: 'https://placehold.co/180x130/15132a/8b5cf6?text=USP-S+Kill+Confirmed' },
    { id: 's6', name: 'Gut Knife | Freehand', wear: 'FT', price: 215.00, rarity: 'rarity-knife', img: 'https://placehold.co/180x130/15132a/ffd700?text=Gut+Knife' },
    { id: 's7', name: 'Bowie Knife | Tiger Tooth', wear: 'FN', price: 350.00, rarity: 'rarity-knife', img: 'https://placehold.co/180x130/15132a/ffd700?text=Bowie+Knife' },
    { id: 's8', name: 'Karambit | Doppler Phase 2', wear: 'FN', price: 1250.00, rarity: 'rarity-knife', img: 'https://placehold.co/180x130/15132a/ffd700?text=Karambit+Doppler' },
];
