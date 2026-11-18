// AHON! game content: original Pinoy-themed cards. Numbers are game math, not real-life returns.

const BOARD = [
  'payday','opp','doodad','opp','market','charity',
  'payday','opp','doodad','baby','opp','market',
  'payday','opp','doodad','opp','downsized','market',
  'payday','opp','doodad','baby','opp','charity'
];

const PROFESSIONS = [
  { name: 'Guro', emoji: '🧑‍🏫', salary: 28000, taxes: 3500, other: 9000, childCost: 2000, cash: 30000,
    liabs: [ {name:'Student loan', balance:120000, pay:2000}, {name:'Car loan', balance:180000, pay:3000}, {name:'Credit card', balance:40000, pay:2000} ] },
  { name: 'Nurse', emoji: '🧑‍⚕️', salary: 35000, taxes: 5000, other: 10000, childCost: 2500, cash: 28000,
    liabs: [ {name:'Student loan', balance:150000, pay:3000}, {name:'Car loan', balance:200000, pay:3500}, {name:'Credit card', balance:50000, pay:2500} ] },
  { name: 'Call Center Agent', emoji: '🎧', salary: 26000, taxes: 3000, other: 9000, childCost: 2000, cash: 25000,
    liabs: [ {name:'Motorcycle loan', balance:60000, pay:2000}, {name:'Student loan', balance:70000, pay:1500}, {name:'Credit card', balance:30000, pay:1500} ] },
  { name: 'Delivery Rider', emoji: '🛵', salary: 24000, taxes: 2500, other: 9000, childCost: 1800, cash: 22000,
    liabs: [ {name:'Motorcycle loan', balance:90000, pay:3000}, {name:'Credit card', balance:20000, pay:1000} ] },
  { name: 'Sales Associate', emoji: '🛍️', salary: 22000, taxes: 2200, other: 8500, childCost: 1800, cash: 20000,
    liabs: [ {name:'Personal loan', balance:50000, pay:2000}, {name:'Credit card', balance:30000, pay:1500} ] },
  { name: 'Admin Staff', emoji: '🗂️', salary: 30000, taxes: 3800, other: 9500, childCost: 2200, cash: 26000,
    liabs: [ {name:'Student loan', balance:90000, pay:2000}, {name:'Car loan', balance:150000, pay:2800}, {name:'Credit card', balance:35000, pay:1800} ] }
];

// type: property | business | stock
const SMALL_DEALS = [
  { name:'Sari-sari store sa kanto', type:'business', cost:30000, down:30000, mortgage:0, cf:3000, blurb:'May bakanteng puwesto sa kanto. Kailangan lang ng paninda at tiyaga.', lesson:'Negosyo = asset kung may sistema at hindi ikaw ang laging nakabantay.' },
  { name:'Online reseller starter pack', type:'business', cost:25000, down:25000, mortgage:0, cf:2500, blurb:'Bulk supplier + Facebook/Shopee shop. Maliit na puhunan, mabilis ang ikot.', lesson:'Mababa ang puhunan pero kailangan ng oras at sistema.' },
  { name:'Bedspace paupahan (4 kama)', type:'property', cost:90000, down:20000, mortgage:70000, cf:2400, blurb:'May extra room malapit sa opisina. Down payment lang ang kailangan ngayon.', lesson:'Ang utang na ginamit pambili ng asset na may kita ay iba sa utang pambili ng gamit.' },
  { name:'Dividend stocks (blue-chip)', type:'stock', cost:30000, down:30000, mortgage:0, cf:1500, blurb:'100 shares ng matatag na kumpanya na nagbibigay ng dividends.', lesson:'Ang stocks ay may panganib; mag-diversify at mag-aral muna.' },
  { name:'Index fund / UITF units', type:'stock', cost:20000, down:20000, mortgage:0, cf:1200, blurb:'Diversified fund, mababa ang minimum, hindi mo kailangang pumili ng isang kumpanya lang.', lesson:'Diversification: huwag ilagay lahat ng itlog sa isang basket.' },
  { name:'Tricycle pang-arkila', type:'business', cost:60000, down:15000, mortgage:45000, cf:2200, blurb:'May driver na handang mag-boundary. Hulugan ang natitira.', lesson:'Tingnan ang kabuuang bayarin (maintenance, boundary) bago bumili.' },
  { name:'Water refilling station', type:'business', cost:80000, down:20000, mortgage:60000, cf:2800, blurb:'Madaming kabahayan sa paligid at walang kakumpitensya.', lesson:'Hanapin ang pangangailangang paulit-ulit: tubig, pagkain, transportasyon.' },
  { name:'Puwesto sa palengke', type:'property', cost:70000, down:14000, mortgage:56000, cf:2000, blurb:'Puwesto na nirerentahan sa mga suki ng palengke.', lesson:'Lokasyon ang kalahati ng halaga ng property.' },
  { name:'Xerox & printing shop', type:'business', cost:55000, down:55000, mortgage:0, cf:3200, blurb:'Malapit sa eskwelahan at munisipyo. Siksik ang customers tuwing enrollment.', lesson:'Alamin kung seasonal ang kita para hindi ka magulat.' },
  { name:'Laundry kiosk', type:'business', cost:45000, down:45000, mortgage:0, cf:2800, blurb:'Self-service na may attendant sa condo area.', lesson:'Ang asset na may part-time na tao ay mas malapit sa tunay na passive income.' }
];

const BIG_DEALS = [
  { name:'6-unit apartment', type:'property', cost:1200000, down:240000, mortgage:960000, cf:14000, blurb:'Malapit sa BPO hub. Laging may naghahanap ng uupahan.', lesson:'Leverage (utang) pwedeng magpalaki ng kita, pero pinalalaki rin ang panganib kung walang umuupa.' },
  { name:'Milk tea franchise', type:'business', cost:350000, down:350000, mortgage:0, cf:12000, blurb:'Kilalang brand, may training at supply. Franchise fee lang ang puhunan.', lesson:'Franchise: bayad para sa sistema. Basahin ang royalty at kontrata.' },
  { name:'Townhouse paupahan', type:'property', cost:1500000, down:150000, mortgage:1350000, cf:9000, blurb:'Bagong townhouse na may tenant na.', lesson:'Mababang down payment ay mas malaking buwanang utang.' },
  { name:'Coconut farm (2 hectares)', type:'property', cost:600000, down:120000, mortgage:480000, cf:7000, blurb:'May caretaker at regular na ani ng niyog.', lesson:'Ang lupa ay asset; alamin ang panahon at presyo sa merkado.' },
  { name:'3-door commercial stall', type:'property', cost:900000, down:180000, mortgage:720000, cf:10000, blurb:'Nasa tabi ng bagong subdivision, 3 tenant ang nag-aabang.', lesson:'Ang sunod-sunod na maliit na kita ay lumalaki kapag paulit-ulit.' },
  { name:'Gas station partner share', type:'business', cost:500000, down:500000, mortgage:0, cf:14000, blurb:'Minority share sa pinamamahalaang istasyon.', lesson:'Mas malaki ang kita kapag may kasosyo na eksperto.' },
  { name:'12-room boarding house', type:'property', cost:2000000, down:200000, mortgage:1800000, cf:16000, blurb:'Katabi ng unibersidad. Puno tuwing pasukan.', lesson:'Isipin ang worst case: paano kung walang tenant sa loob ng 3 buwan?' },
  { name:'Mini grocery share', type:'business', cost:400000, down:400000, mortgage:0, cf:11000, blurb:'Kasosyo sa grocery na may sariling manager.', lesson:'Pumili ng maayos na manager at sistema para tunay na passive.' }
];

const DOODADS = [
  { text:'Nag-11.11 sale ka. Hindi mo naman kailangan pero ang mura!', cost:4500, lesson:'Ang "sale" ay gastos pa rin kung hindi mo kailangan.' },
  { text:'Bagong smartphone kahit gumagana pa ang luma mo.', cost:18000, lesson:'Wants vs needs: tanungin muna kung kailangan o gusto lang.' },
  { text:'Milk tea araw-araw sa loob ng isang buwan.', cost:3500, lesson:'Maliit na gastos na paulit-ulit ay unti-unting nagiging malaki.' },
  { text:'VIP concert tickets para sa paboritong banda.', cost:8000, lesson:'Okay ang mag-enjoy, pero ilaan ito sa budget at hindi sa utang.' },
  { text:'Limited-edition sneakers.', cost:6000, lesson:'Ang gamit na bumababa ang halaga ay hindi asset.' },
  { text:'Weekend staycation.', cost:9000, lesson:'Mag-ipon muna para sa luho, huwag mag-credit card.' },
  { text:'Upgrade ng gaming PC.', cost:15000, lesson:'Mag-ipon bago bumili, hindi hulugan na may interes.' },
  { text:'Ikaw ang nagbayad ng libre sa buong barkada.', cost:3000, lesson:'Matutong tumanggi nang magalang kapag hindi pasok sa budget.' }
];

// mult applies to the asset's original cost. Player may sell or keep.
const MARKETS = [
  { text:'May investor na gustong bilhin ang paupahan mo nang mas mataas.', match:'property', mult:1.5, lesson:'Tumataas ang value ng property sa magandang lokasyon, pero hindi ito garantiya.' },
  { text:'Bumaba ang presyo ng lupa sa lugar mo, may nag-aalok ng mababang bilhin.', match:'property', mult:0.7, lesson:'Hindi mo kailangang magbenta kapag bumaba ang presyo; cashflow ang titingnan mo.' },
  { text:'May gustong bumili ng negosyo mo at "turnkey" ang sistema!', match:'business', mult:1.6, lesson:'Ang negosyong may sistema ay mas mahalaga kapag ibinenta.' },
  { text:'May bagong kakumpitensya sa tapat. Mababa ang alok sa negosyo mo.', match:'business', mult:0.6, lesson:'Laging may panganib ang negosyo: kakumpitensya, pandemya, bagong batas.' },
  { text:'Bull market! Tumaas ang presyo ng stocks.', match:'stock', mult:1.8, lesson:'Huwag magbenta dahil lang sa excitement; alamin ang plano mo.' },
  { text:'Market crash! Bumagsak ang presyo ng stocks.', match:'stock', mult:0.5, lesson:'Ang pagbagsak ay normal; ang panic selling ang nagpapalugi.' },
  { text:'Nagtaasan ang upa sa lugar mo, interesado ang mga investor.', match:'property', mult:1.3, lesson:'Pwedeng kumita sa value at sa kita buwan-buwan.' },
  { text:'Tumaas nang kaunti ang stocks ngayong quarter.', match:'stock', mult:1.3, lesson:'Maliit na pagtaas pero tuloy-tuloy ang dividends.' }
];

// Game pacing: boost monthly returns so a training session (about 25 rounds) can produce winners.
// These returns are intentionally higher than real life.
const BOOST = 1.25;
[SMALL_DEALS, BIG_DEALS].forEach(list => list.forEach(d => { d.cf = Math.round(d.cf * BOOST / 100) * 100; }));

module.exports = { BOARD, PROFESSIONS, SMALL_DEALS, BIG_DEALS, DOODADS, MARKETS };
