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
    {
        id: 's5',
        name: 'M4A1-S | Night Terror',
        wear: 'FT',
        price: 1.89,
        rarity: 'rarity-restricted',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_eAMWrEwL9lj-hnXCa-mxQmjDGMnYftby3FPFVxA5ZwRecOtUXuxtPiNL_jsQLc2NkTzS38jC5L7ydj5u8EUKo7uvqAgGSM4LM'
    },
    {
        id: 's6',
        name: 'StatTrak™ PP-Bizon | Space Cat',
        wear: 'MW',
        price: 2.47,
        rarity: 'rarity-classified',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLzl4zv8x1Y-s2sYb5iLs-AHmaTxO13pN5lRi67gVN04jvcmYv6IHnGbw51XsYmQO5ftBG9xoexNrix4gPYjIJEzX_2iX9I8G81tOIzQC5J'
    },
    {
        id: 's7',
        name: 'MAC-10 | Lapis Gator',
        wear: 'FT',
        price: 2.74,
        rarity: 'rarity-restricted',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1a4s2jaac8cM-WAmKT1fx_s-h9Vha_nBovp3ODztegd3LEawcnX5ByFLQPtxSxldyxPrjg5QCPj94Ty3j8j3tLu30__a9cBu41m2up'
    },
    {
        id: 's8',
        name: 'StatTrak™ USP-S | Silent Shot',
        wear: 'WW',
        price: 3.24,
        rarity: 'rarity-classified',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSNeODHViDyOJzvvVWTSaqqhEutDWR1Nf8cn_CPAQmW8Z5Ee8P4UbuxILmMLu3tAXYj4hByyWsjCscvy89sOYcEf1yCvXTIoM'
    },
    {
        id: 's9',
        name: 'Glock-18 | Green Line',
        wear: 'MW',
        price: 3.63,
        rarity: 'rarity-restricted',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c4_2tY5t5MvGaAFiX0-tzvt5lRi67gVNw5TjSy4mseXqXagEpW8FyQu5cu0Hpw4ayNLjntFeNgoJEnyWqjCNN8G81tF3dwatE'
    },
    {
        id: 's10',
        name: 'StatTrak™ Desert Eagle | Trigger Discipline',
        wear: 'BS',
        price: 4.15,
        rarity: 'rarity-classified',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ8-HHG6Xxutkj-VgXCq6hREuvTi6lob-KT-Ja1UlWMAkTOMCt0G9kIHlP77l5FbW344XxX_4iSJJv31r4bxRUKUn_rqX0V-d-rquYA'
    },
    {
        id: 's11',
        name: 'Tec-9 | Sultan',
        wear: 'MW',
        price: 5.50,
        rarity: 'rarity-restricted',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLlm5W5wjZe7KuRe7FhNPGdMWuZxuZi_rQ9F3yykUV_42_Qytiuc32VPQMoX5EjReZfshG8kYWyPr7ks1DeiYNbjXKpvEFNuPw'
    },
    {
        id: 's12',
        name: 'P250 | X-Ray',
        wear: 'MW',
        price: 6.37,
        rarity: 'rarity-restricted',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiFO0Oq8ab1SMKLGXlicyOl-pK8_HSjjxx9wsmXQnIv6cH2TaAQoWZd4RuAKshe7wdS1NOvi5VCIi48Q02yg2fSIc8-4'
    },
    {
        id: 's13',
        name: 'StatTrak™ Glock-18 | Catacombs',
        wear: 'MW',
        price: 6.98,
        rarity: 'rarity-classified',
        img: 'https://community.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK8-XC2aEyfp5vO1WQyC0nQlptWWDzIz8dy6QalMgXsMiQbEJtRjskdW2M7nn71Dcj49Fm3qsiClB7jErvbhnnfwjgw'
    },
];
