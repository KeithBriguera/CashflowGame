// AHON! game content (English). Original cards with a Philippine flavour.
// Returns in this game are intentionally higher than real life; this is a teaching game.

const BOARD = [
  'payday','opp','doodad','opp','market','charity',
  'payday','opp','doodad','baby','opp','market',
  'payday','opp','doodad','opp','downsized','market',
  'payday','opp','doodad','baby','opp','charity'
];

const PROFESSIONS = [
  { name: 'Teacher', salary: 28000, taxes: 3500, other: 9000, childCost: 2000, cash: 30000,
    liabs: [ {name:'Student loan', balance:120000, pay:2000}, {name:'Car loan', balance:180000, pay:3000}, {name:'Credit card', balance:40000, pay:2000} ] },
  { name: 'Nurse', salary: 35000, taxes: 5000, other: 10000, childCost: 2500, cash: 28000,
    liabs: [ {name:'Student loan', balance:150000, pay:3000}, {name:'Car loan', balance:200000, pay:3500}, {name:'Credit card', balance:50000, pay:2500} ] },
  { name: 'Call Center Agent', salary: 26000, taxes: 3000, other: 9000, childCost: 2000, cash: 25000,
    liabs: [ {name:'Motorcycle loan', balance:60000, pay:2000}, {name:'Student loan', balance:70000, pay:1500}, {name:'Credit card', balance:30000, pay:1500} ] },
  { name: 'Delivery Rider', salary: 24000, taxes: 2500, other: 9000, childCost: 1800, cash: 22000,
    liabs: [ {name:'Motorcycle loan', balance:90000, pay:3000}, {name:'Credit card', balance:20000, pay:1000} ] },
  { name: 'Sales Associate', salary: 22000, taxes: 2200, other: 8500, childCost: 1800, cash: 20000,
    liabs: [ {name:'Personal loan', balance:50000, pay:2000}, {name:'Credit card', balance:30000, pay:1500} ] },
  { name: 'Admin Staff', salary: 30000, taxes: 3800, other: 9500, childCost: 2200, cash: 26000,
    liabs: [ {name:'Student loan', balance:90000, pay:2000}, {name:'Car loan', balance:150000, pay:2800}, {name:'Credit card', balance:35000, pay:1800} ] }
];

// type: property | business | stock. icon: key into art.js
const SMALL_DEALS = [
  { name:'Corner Sari-Sari Store', type:'business', icon:'store', cost:30000, down:30000, mortgage:0, cf:3000, blurb:'A vacant spot on the busiest corner. Stock the shelves and the neighbours become regulars.', lesson:'A business is only an asset if it runs without you standing behind the counter all day.' },
  { name:'Online Reseller Starter Pack', type:'business', icon:'online', cost:25000, down:25000, mortgage:0, cf:2500, blurb:'A bulk supplier plus a Facebook and Shopee shop. Small capital, fast turnover.', lesson:'Low capital is great, but your time is also a cost. Build a system you can hand to someone else.' },
  { name:'4-Bed Bedspace Rental', type:'property', icon:'bedspace', cost:90000, down:20000, mortgage:70000, cf:2400, blurb:'A spare room near the business district. You only need the down payment today.', lesson:'Debt used to buy something that pays you is very different from debt used to buy things that do not.' },
  { name:'Blue-Chip Dividend Stocks', type:'stock', icon:'stocks', cost:30000, down:30000, mortgage:0, cf:1500, blurb:'100 shares of a steady company that shares profits as dividends.', lesson:'Stocks can go down as well as up. Learn the basics first and never invest money you will need soon.' },
  { name:'Index Fund Units', type:'stock', icon:'fund', cost:20000, down:20000, mortgage:0, cf:1200, blurb:'A diversified fund with a low minimum. You own a slice of many companies at once.', lesson:'Diversification: do not put all your eggs in one basket.' },
  { name:'Tricycle for Rent', type:'business', icon:'tricycle', cost:60000, down:15000, mortgage:45000, cf:2200, blurb:'A driver is ready to pay daily boundary. Pay off the rest in instalments.', lesson:'Check the full cost (maintenance, repairs, downtime) before you count the income.' },
  { name:'Water Refilling Station', type:'business', icon:'water', cost:80000, down:20000, mortgage:60000, cf:2800, blurb:'Many homes nearby and no competitor in sight.', lesson:'Look for needs that repeat every week: water, food, transport.' },
  { name:'Public Market Stall', type:'property', icon:'stall', cost:70000, down:14000, mortgage:56000, cf:2000, blurb:'A stall rented out to loyal market vendors.', lesson:'Location is half the value of any property.' },
  { name:'Xerox & Printing Shop', type:'business', icon:'print', cost:55000, down:55000, mortgage:0, cf:3200, blurb:'Right beside the school and city hall. Packed during enrolment season.', lesson:'Know whether your income is seasonal so you are never surprised by a slow month.' },
  { name:'Laundry Kiosk', type:'business', icon:'laundry', cost:45000, down:45000, mortgage:0, cf:2800, blurb:'Self-service machines with one attendant, in a busy condo area.', lesson:'The closer an asset is to running by itself, the more passive its income.' }
];

const BIG_DEALS = [
  { name:'6-Unit Apartment', type:'property', icon:'apartment', cost:1200000, down:240000, mortgage:960000, cf:14000, blurb:'Near the BPO hub. Someone is always looking for a place to rent.', lesson:'Leverage (debt) can grow your income, but it also magnifies the risk when tenants leave.' },
  { name:'Milk Tea Franchise', type:'business', icon:'tea', cost:350000, down:350000, mortgage:0, cf:12000, blurb:'A well-known brand with training and supply included. The franchise fee is the whole investment.', lesson:'A franchise sells you a system. Read the royalty terms and the contract carefully.' },
  { name:'Rental Townhouse', type:'property', icon:'townhouse', cost:1500000, down:150000, mortgage:1350000, cf:9000, blurb:'A brand-new townhouse with a tenant already signed.', lesson:'A small down payment means a big monthly loan. Know what you can carry.' },
  { name:'Coconut Farm (2 hectares)', type:'property', icon:'farm', cost:600000, down:120000, mortgage:480000, cf:7000, blurb:'A caretaker is in place and the harvests are regular.', lesson:'Land is an asset, but prices and harvests depend on the seasons and the market.' },
  { name:'3-Door Commercial Stall', type:'property', icon:'commercial', cost:900000, down:180000, mortgage:720000, cf:10000, blurb:'Beside a new subdivision, with three tenants waiting to move in.', lesson:'Many small, steady incomes add up. Repeat what works.' },
  { name:'Gas Station Partner Share', type:'business', icon:'gas', cost:500000, down:500000, mortgage:0, cf:14000, blurb:'A minority share in a station run by experienced operators.', lesson:'Partnering with real experts can multiply your results.' },
  { name:'12-Room Boarding House', type:'property', icon:'boarding', cost:2000000, down:200000, mortgage:1800000, cf:16000, blurb:'Next to the university. Full every semester.', lesson:'Always ask: what if there are no tenants for three months?' },
  { name:'Mini Grocery Share', type:'business', icon:'grocery', cost:400000, down:400000, mortgage:0, cf:11000, blurb:'A partner stake in a grocery that has its own manager.', lesson:'A good manager and good systems are what make income truly passive.' }
];

const DOODADS = [
  { text:'You joined the 11.11 sale. You did not need it, but it was so cheap!', cost:4500, icon:'sale', lesson:'A sale is still spending if you did not need it.' },
  { text:'A brand-new smartphone, even though your old one still works.', cost:18000, icon:'phone', lesson:'Wants vs needs: ask yourself if you need it or simply want it.' },
  { text:'Milk tea every single day for a month.', cost:3500, icon:'cup', lesson:'Small expenses that repeat quietly become big ones.' },
  { text:'VIP tickets to see your favourite band.', cost:8000, icon:'ticket', lesson:'Fun is fine, but plan for it in your budget instead of borrowing for it.' },
  { text:'Limited-edition sneakers.', cost:6000, icon:'sneaker', lesson:'Things that lose value over time are not assets.' },
  { text:'A weekend staycation.', cost:9000, icon:'resort', lesson:'Save first, enjoy later. Do not put treats on a credit card.' },
  { text:'A gaming PC upgrade.', cost:15000, icon:'gaming', lesson:'Save before you buy rather than paying instalments with interest.' },
  { text:'You paid for the whole barkada\'s dinner.', cost:3000, icon:'party', lesson:'Learn to politely say no when something is not in your budget.' }
];

// mult applies to the asset's original cost. The player may sell or keep.
const MARKETS = [
  { text:'An investor wants to buy your rental property for much more than you paid.', match:'property', mult:1.5, lesson:'Property in a good location can rise in value, but it is never guaranteed.' },
  { text:'Land prices dipped in your area and a buyer is offering a low price.', match:'property', mult:0.7, lesson:'You do not have to sell when prices fall. Watch the cashflow, not the daily price.' },
  { text:'A buyer wants your business because it already runs like clockwork.', match:'business', mult:1.6, lesson:'A business with systems is worth much more when you sell it.' },
  { text:'A new competitor opened across the street. Offers for your business are low.', match:'business', mult:0.6, lesson:'Every business carries risk: competitors, shocks, new rules.' },
  { text:'Bull market! Stock prices are climbing.', match:'stock', mult:1.8, lesson:'Do not sell just because of excitement. Follow your plan.' },
  { text:'Market crash! Stock prices tumbled.', match:'stock', mult:0.5, lesson:'Drops are normal. Panic selling is what turns a dip into a loss.' },
  { text:'Rents are rising in your area and investors are interested.', match:'property', mult:1.3, lesson:'You can earn from rising value and from monthly rent.' },
  { text:'Stocks edged up a little this quarter.', match:'stock', mult:1.3, lesson:'A small gain, and your dividends keep coming.' }
];

// Game pacing: boost monthly returns so a training session (about 25 rounds) can produce winners.

// ---------- High Stakes track (players who escape the paycheck race) ----------
const HIGH_BOARD = [
  'payout','hsdeal','windfall','hsdeal','dream','audit',
  'payout','hsdeal','luxury','hsdeal','charity','dream',
  'payout','hsdeal','windfall','hsdeal','luxury','audit',
  'payout','hsdeal','dream','hsdeal','charity','windfall'
];
const HS_MULT = 4; // a High Stakes payout is a quarter's worth of monthly cashflow

// Every player picks one dream in the lobby. Buying it on a Dream Gallery tile wins the game.
const DREAMS = [
  { id:'home',    name:'Family Home',            icon:'house',   cost:450000, blurb:'A house with a garden for your family. No more rent, no more landlord.' },
  { id:'school',  name:'Scholarship Fund',       icon:'cap',     cost:300000, blurb:'Send nieces, nephews and kids from your barangay to college for free.' },
  { id:'resort',  name:'Beach Resort',           icon:'resort',  cost:650000, blurb:'A small resort by the sea. Work becomes welcoming guests.' },
  { id:'tour',    name:'Family World Tour',      icon:'plane',   cost:250000, blurb:'A year of travel with the people you love, with nobody checking the clock.' },
  { id:'clinic',  name:'Community Clinic',       icon:'clinic',  cost:500000, blurb:'A free clinic for your town, with doctors and medicine on hand.' },
  { id:'car',     name:'Dream Car',              icon:'car',     cost:350000, blurb:'The car you have admired for years, paid in full. No loan.' },
  { id:'boat',    name:'Island Boat Tours',      icon:'boat',    cost:320000, blurb:'A boat, a crew and the best island-hopping tours in the province.' },
  { id:'farm',    name:'Farm and Orchard',       icon:'farm',    cost:400000, blurb:'Land of your own with fruit trees, fresh air and a roadside stall.' },
  { id:'found',   name:'Give Back Foundation',   icon:'charity', cost:600000, blurb:'A foundation that funds meals, school supplies and livelihood starts.' },
  { id:'parents', name:'Parents\' Retirement',   icon:'house',   cost:380000, blurb:'A comfortable home and monthly allowance so your parents can finally rest.' }
];

const HS_DEALS = [
  { name:'Milk Tea Franchise Network', type:'business', icon:'tea', cost:160000, down:160000, mortgage:0, cf:13000, blurb:'Five franchise kiosks in busy malls, run by managers you trained.', lesson:'Systems and managers let a business earn without you standing behind the counter.' },
  { name:'Laundry Franchise Chain', type:'business', icon:'laundry', cost:200000, down:200000, mortgage:0, cf:17000, blurb:'Self-service laundry shops near dorms and condos, open day and night.', lesson:'Boring, repeat-demand businesses are often the steadiest earners.' },
  { name:'Water Refilling Network', type:'business', icon:'water', cost:180000, down:180000, mortgage:0, cf:15000, blurb:'Refilling stations in five barangays with a delivery tricycle.', lesson:'Everyone needs water. Needs beat wants when you pick a business.' },
  { name:'Grocery Chain Share', type:'business', icon:'grocery', cost:350000, down:350000, mortgage:0, cf:29000, blurb:'A partner share in a growing neighbourhood grocery chain.', lesson:'Being a partner means sharing in profits you do not have to work for.' },
  { name:'Gas Station Stake', type:'business', icon:'gas', cost:300000, down:300000, mortgage:0, cf:24000, blurb:'A stake in a station on a busy highway, with a convenience store.', lesson:'Location is value. Traffic you do not create can still pay you.' },
  { name:'Farm Land and Packing House', type:'business', icon:'farm', cost:250000, down:250000, mortgage:0, cf:19000, blurb:'Farmland plus a packing house that sells to supermarkets.', lesson:'Owning part of the supply chain captures more of the profit.' },
  { name:'Commercial Building', type:'property', icon:'commercial', cost:600000, down:150000, mortgage:450000, cf:20000, blurb:'Ground-floor shops with tenants already signed for three years.', lesson:'Leverage multiplies returns, and also the risk if tenants leave.' },
  { name:'Condotel Units', type:'property', icon:'apartment', cost:420000, down:105000, mortgage:315000, cf:13000, blurb:'Two furnished units in a tourist area, managed by a hotel operator.', lesson:'Hands-off management costs a share of income but frees your time.' },
  { name:'Boarding House Complex', type:'property', icon:'boarding', cost:500000, down:125000, mortgage:375000, cf:16000, blurb:'Twelve rooms beside a university, nearly always full.', lesson:'Steady demand from students keeps occupancy high.' },
  { name:'Index Fund Block', type:'stock', icon:'fund', cost:120000, down:120000, mortgage:0, cf:9500, blurb:'A diversified fund holding dozens of strong companies.', lesson:'Diversification lowers the chance that one bad bet sinks you.' }
];

const HS_LUXURY = [
  { cost:25000, icon:'sale',   text:'You booked a luxury staycation for the whole family.', lesson:'Rewards are fine. Pay for them from income, not from the money meant for your dream.' },
  { cost:40000, icon:'gaming', text:'You upgraded your whole home entertainment setup.', lesson:'Every upgrade is a trade: you are choosing it over your dream.' },
  { cost:60000, icon:'party',  text:'You hosted a grand celebration for your whole barangay.', lesson:'Generosity feels great. Decide the amount before the party, not after.' },
  { cost:30000, icon:'sneaker',text:'You bought a closet of designer shoes and bags.', lesson:'Lifestyle creep quietly eats the money your dream needs.' }
];

const HS_WINDFALLS = [
  { amount:30000, text:'A supplier gave you a loyalty rebate for paying on time.', lesson:'Good relationships and reliable habits can pay you back.' },
  { amount:50000, text:'One of your properties was revalued after a new road opened.', lesson:'Assets in growing areas can gain value while you sleep.' },
  { amount:40000, text:'A business award came with prize money.', lesson:'Doing good work in public brings opportunities.' },
  { amount:60000, text:'A partner bought back a small stake at a premium.', lesson:'Good deals can have a profitable exit.' },
  { amount:25000, text:'A viral post sent a wave of customers to your shops.', lesson:'Marketing can multiply a business, but do not rely on luck alone.' }
];

const BOOST = 1.25;
[SMALL_DEALS, BIG_DEALS].forEach(list => list.forEach(d => { d.cf = Math.round(d.cf * BOOST / 100) * 100; }));

module.exports = { BOARD, HIGH_BOARD, HS_MULT, DREAMS, HS_DEALS, HS_LUXURY, HS_WINDFALLS, PROFESSIONS, SMALL_DEALS, BIG_DEALS, DOODADS, MARKETS };
