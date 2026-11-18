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
const BOOST = 1.25;
[SMALL_DEALS, BIG_DEALS].forEach(list => list.forEach(d => { d.cf = Math.round(d.cf * BOOST / 100) * 100; }));

module.exports = { BOARD, PROFESSIONS, SMALL_DEALS, BIG_DEALS, DOODADS, MARKETS };
