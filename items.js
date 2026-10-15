// ============================================
// EKWIPUNEK GRACZA (startowy)
// ============================================
const inventory = [];

// ============================================
// SKLEP CSCASEPRO
// ============================================
const storeCatalog = [
    {
        id: 's1',
        name: 'AK-47 | Safari Mesh',
        wear: 'FT',
        price: 0.46,
        rarity: 'rarity-milspec',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wjFL0P-re6xSNPGdMWuZxuZi_rIxSirkkElyt2qEzI2heXiTaVIiX5siROQJtxnul4XnYbvgswOMgolbjXKpnRk9Yjk'
    },
    {
        id: 's2',
        name: 'M4A4 | Urban DDPAT',
        wear: 'FT',
        price: 0.75,
        rarity: 'rarity-milspec',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwipC0PaqeKV5H-WBDFicyOl-pK8xF3DjzR5_4zncnouhcSjGPQ8jA5B3ELFbuhPqloDkPrvjsgXY2t5N02yg2Rf5X8A9'
    },
    {
        id: 's3',
        name: 'P2000 | Imperial',
        wear: 'MW',
        price: 1.25,
        rarity: 'rarity-restricted',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0POjV7Q_cKDDMW6d0etkueBlcDu2kSIrujqNjsGrJH6XPQ9xAsZ5FLIDtBG5mtfhY7nl4gGNiosTzH792ntOvC1stbsDT-N7ra_mVv2F'
    },
    {
        id: 's4',
        name: 'Five-SeveN | Violent Daimyo',
        wear: 'FT',
        price: 1.52,
        rarity: 'rarity-restricted',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3l4Dl7idN6vyRa7FSJvmFC1iDxPhzvt5tTiC-jBIYvzSCkpu3cXjCPAB2WZMmQ-EK4BTqlNSzNOLk71GI3tpGmX2oii5N6nk667kDWL1lpPNv4wCTtw'
    },
];
