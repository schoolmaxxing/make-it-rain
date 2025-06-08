// =================================================================================
// ||  MAKE IT RAIN! (OR DON'T) - A FINANCIAL LITERACY GAME                       ||
// =================================================================================
// ||  This script contains all the logic for the game, including game state    ||
// ||  management, UI updates, event handling, and simulation mechanics.        ||
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // ||                    CONFIG & STATIC GAME DATA                        ||
    // =========================================================================

    // --- Defines starting conditions based on educational tier ---
    const SCHOOL_DATA = {
        'high': { name: 'High-Tier', income: 12000, debt: 240000, tuition: 60000, schools: ['Harvard', 'Northwestern', 'Duke', 'Stanford'], edu: { master: 0.15, doctorate: 0.25 } },
        'mid':  { name: 'Mid-Tier',  income: 8000,  debt: 160000, tuition: 40000, schools: ['Penn State', 'Michigan State', 'UGA', 'UWA'], edu: { master: 0.10, doctorate: 0.20 } },
        'low':  { name: 'Low-Tier',  income: 4000,  debt: 100000, tuition: 20000, schools: ['UVT', 'George Mason', 'UIA', 'UAZ'], edu: { master: 0.05, doctorate: 0.15 } }
    };

    // --- Tax rates for different economic conditions ---
    const TAX_RATES = {
        normal: 0.20,
        recession: 0.15,
        boom: 0.25
    };

    // --- Educational content for the "Learn More" modals ---
    const LESSON_CONTENT = {
        income: { title: "Income", text: "Income is money received from a job, whether it be daily, weekly, monthly, yearly, or from investments. From your income, it’s recommended to follow the 50/30/20 rule, where 50% of your net income goes to needs, such as housing, utilities, food, etc, while 30% goes to wants like vacations, and 20% goes to savings and debt repayments." },
        debt: { title: "Debt", text: "Debt is money owed to a person, organization, or a business, that you must pay off. Consider following the 50/30/20 rule, where 20% of your income goes towards debt repayments." },
        taxes: { title: "Taxes", text: "Taxes are mandatory charges on different items or imposed by the federal government - examples include federal tax, state tax (percentage varies between states), income tax, sales tax, and many more. " },
        happiness: { title: "Financial Happiness", text: "Financial happiness means that you are living comfortably and are not strained by means. If your happiness drops to 25% or below, you lose the game!" },
        economy: { title: "Economic Cycles", text: "The economy is versatile and changes according to different factors such as supply and demand, and different business operations. There are different economic cycles of an economy such as: expansion (growth), peak (highest point), contraction (decline), and trough (lowest point). The different types of economy in this simulation are normal, meaning the economy is stable; recession, meaning there's a lack of spending which is dropping economic activity; inflation, meaning the average price of goods are raised." },
        budgeting: { title: "Budgeting", text: "Budgeting is limiting your spending amount on different items or generally. It’s important to ensure that you don’t overspend." },
        netflow: { title: "Net Cash Flow", text: "Net cash flow is the difference between the total cash inflows and outflows over a specific period. It's your estimated amount of money after budgeting. A green estimated net flow means that you will have money left, while a red estimated net flow means you are going over your budget. The graph demonstrates the amount of money that you have which will change over time." },
        education: { title: "Education vs. Debt", text: "Educational institutions that provide higher education will result in debt, with more prestigious and rigorous institutions making more debt." },
        investing: {
            title: "Reading the Tea Leaves: An Intro to Chart Patterns",
            text: `<p>Welcome to the world of investing! Skilled investors use <strong>technical analysis</strong> to predict where a stock might go next. They look for recognizable shapes, or <strong>patterns</strong>, in a stock's price history chart. Spotting them can give you a massive advantage!</p><hr>
            <h5 class="text-success fw-bold">Bullish Patterns (Signal a Price INCREASE is Likely)</h5>
            <div class="row align-items-center"><div class="col-md-7"><h6>Double Bottom</h6><p class="small mb-0">Looks like a 'W'. The stock hits a low price, bounces back, then falls to the same low again before a potential major rally.</p></div><div class="col-md-5"><canvas id="pattern-double_bottom" class="pattern-canvas"></canvas></div></div>
            <div class="row align-items-center"><div class="col-md-7"><h6>Cup and Handle</h6><p class="small mb-0">A long, U-shaped "cup" forms, followed by a slight downward drift (the "handle"). The breakout from the handle often signals a strong upward move.</p></div><div class="col-md-5"><canvas id="pattern-cup_and_handle" class="pattern-canvas"></canvas></div></div>
            <div class="row align-items-center"><div class="col-md-7"><h6>Pennant</h6><p class="small mb-0">After a sharp upward spike (the "flagpole"), the price consolidates in a small triangle, or pennant, before another spike up.</p></div><div class="col-md-5"><canvas id="pattern-pennant" class="pattern-canvas"></canvas></div></div>
            <div class="row align-items-center"><div class="col-md-7"><h6>Flag</h6><p class="small mb-0">After a sharp rise, the price trades in a downward-sloping channel (the flag) before breaking out upward.</p></div><div class="col-md-5"><canvas id="pattern-flag" class="pattern-canvas"></canvas></div></div>
            <div class="row align-items-center"><div class="col-md-7"><h6>Ascending Triangle</h6><p class="small mb-0">The price is contained by a flat top line and a rising bottom line. This typically breaks out to the upside.</p></div><div class="col-md-5"><canvas id="pattern-ascending_triangle" class="pattern-canvas"></canvas></div></div>
            <div class="row align-items-center"><div class="col-md-7"><h6>Wedge (Falling)</h6><p class="small mb-0">Two downward-sloping trend lines converge. The price breaking above the top line signals a potential reversal upwards.</p></div><div class="col-md-5"><canvas id="pattern-wedge" class="pattern-canvas"></canvas></div></div>
            <hr>
            <h5 class="text-danger fw-bold">Bearish Patterns (Signal a Price DECREASE is Likely)</h5>
            <div class="row align-items-center"><div class="col-md-7"><h6>Head and Shoulders</h6><p class="small mb-0">Features three peaks: a central, higher peak (the "head") with two lower peaks on either side (the "shoulders"). A break below the neckline is a strong bearish signal.</p></div><div class="col-md-5"><canvas id="pattern-head_and_shoulders" class="pattern-canvas"></canvas></div></div>
            <div class="row align-items-center"><div class="col-md-7"><h6>Double Top</h6><p class="small mb-0">The opposite of a double bottom, this pattern looks like an 'M'. The stock hits a high price, pulls back, then rises to the same high again before a potential major drop.</p></div><div class="col-md-5"><canvas id="pattern-double_top" class="pattern-canvas"></canvas></div></div>
            <div class="row align-items-center"><div class="col-md-7"><h6>Descending Triangle</h6><p class="small mb-0">The price is contained by a flat bottom line and a falling top line. This typically breaks out to the downside.</p></div><div class="col-md-5"><canvas id="pattern-descending_triangle" class="pattern-canvas"></canvas></div></div>
            <div class="row align-items-center"><div class="col-md-7"><h6>Symmetrical Triangle</h6><p class="small mb-0">Two converging trend lines, one falling and one rising. The breakout can be in either direction and often continues the preceding trend.</p></div><div class="col-md-5"><canvas id="pattern-triangle" class="pattern-canvas"></canvas></div></div>
            `
        },
        housing: { title: "Housing Costs", text: "Housing costs fluctuate with the state of the economy that are affected by different factors such as supply and demand, construction costs, interest rates, and even local regulations." },
        transport: { title: "Transportation Costs", text: "Transportation costs change depending on the state of the economy. " },
        food: { title: "Food Costs", text: "Food costs rise, and rarely lower, due to the state of the economy. Inflation especially increases the cost of food." },
        utilities: { title: "Utility Costs", text: "Utilities cost depends on the type of home you have, whether it be a house, townhouse, or apartment, and as well as if you’re owning or renting it. Owners usually pay all the utilities, while the landlords of renters usually don’t." },
        technology: { title: "Technology Costs", text: "Technology costs depend on how good and the price were the components to make that technology. The costs also depend on how new the technology is, where newly released technology tends to have higher prices. " },
        leisure: { title: "Leisure Spending", text: "Leisure is important for happiness, but you mustn't over spend on it when it’s financially straining. Consider following the 50/30/20 rule, where you should spend 30% of your income on wants. Spend on leisure when you know you have the means!" }
    };

    // --- Defines budget categories and minimum spending requirements ---
    const BUDGET_CATEGORIES = ['housing', 'transport', 'food', 'utilities', 'technology', 'leisure'];
    const NEEDS_CATEGORIES = ['housing', 'transport', 'food', 'utilities', 'technology'];
    const MINIMUM_SPENDING = {
        'high': { housing: 1800, transport: 400, food: 600, utilities: 300, technology: 150 },
        'mid':  { housing: 1200, transport: 300, food: 450, utilities: 220, technology: 100 },
        'low':  { housing: 800,  transport: 200, food: 300, utilities: 150, technology: 75  }
    };
    
    // --- Monthly upkeep costs for owned assets ---
    const UPKEEP_COSTS = {
        house: 350,
        car: 150
    };

    // --- All available quests, their completion conditions, and rewards ---
    const QUESTS = [
        { id: 1, text: "Build an emergency fund of $1,000.", isCompleted: false, check: s => s.money >= 1000, reward: { happiness: 5, money: 250 }, tracker: { current: s => s.money, target: 1000 } },
        { id: 2, text: "Go one month without any leisure spending.", isCompleted: false, check: s => s.history.leisure.length > 0 && s.history.leisure[s.history.leisure.length - 1] === 0, reward: { happiness: 5, money: 500 } },
        { id: 3, text: "Make your first investment.", isCompleted: false, check: s => Object.values(s.portfolio).some(v => v.shares > 0), reward: { money: 1000, happiness: 5 } },
        { id: 4, text: "Pay off the first $10,000 of your debt.", isCompleted: false, check: s => s.initialDebt - s.debt >= 10000, reward: { happiness: 10 }, tracker: { current: s => s.initialDebt - s.debt, target: 10000 } },
        { id: 5, text: "Have a positive net cash flow for 3 months in a row.", isCompleted: false, check: s => s.history.netCashFlow.slice(-3).every(n => n > 0), reward: { happiness: 5, income: 100 } },
        { id: 6, text: "Reach $10,000 in savings.", isCompleted: false, check: s => s.money >= 10000, reward: { happiness: 10, money: 1000 }, tracker: { current: s => s.money, target: 10000 } },
        { id: 7, text: "Take a small vacation.", isCompleted: false, check: s => s.history.purchases.includes("Weekend Getaway"), reward: { happiness: 10 } },
        { id: 8, text: "Grow your investment portfolio to $5,000.", isCompleted: false, check: s => calculatePortfolioValue(s) >= 5000, reward: { happiness: 5, money: 500 }, tracker: { current: s => calculatePortfolioValue(s), target: 5000 } },
        { id: 9, text: "Buy your first car.", isCompleted: false, check: s => s.assets.cars.length > 0, reward: { happiness: 10 } },
        { id: 10, text: "Diversify by owning 2 different stocks.", isCompleted: false, check: s => Object.values(s.portfolio).filter(v => v.shares > 0).length >= 2, reward: { money: 2000 }, tracker: { current: s => Object.values(s.portfolio).filter(v => v.shares > 0).length, target: 2 } },
        { id: 11, text: "Pay off 25% of your initial debt.", isCompleted: false, check: s => s.debt <= s.initialDebt * 0.75, reward: { happiness: 15, money: 7500 } },
        { id: 12, text: "Reach $50,000 in savings.", isCompleted: false, check: s => s.money >= 50000, reward: { happiness: 10, money: 5000 }, tracker: { current: s => s.money, target: 50000 } },
        { id: 13, text: "Grow your portfolio to $25,000.", isCompleted: false, check: s => calculatePortfolioValue(s) >= 25000, reward: { happiness: 10, income: 250 }, tracker: { current: s => calculatePortfolioValue(s), target: 25000 } },
        { id: 14, text: "Survive a recession for 6 consecutive months.", isCompleted: false, check: s => s.monthsInRecession >= 6, reward: { happiness: 20, money: 10000 }, tracker: { current: s => s.monthsInRecession, target: 6 } },
        { id: 15, text: "Own a car and have $20,000 in the bank.", isCompleted: false, check: s => s.assets.cars.length > 0 && s.money >= 20000, reward: { happiness: 10 } },
        { id: 16, text: "Go 6 consecutive months without leisure spending.", isCompleted: false, check: s => s.monthsWithoutLeisure >= 6, reward: { happiness: 15, money: 7500 }, tracker: { current: s => s.monthsWithoutLeisure, target: 6 } },
        { id: 17, text: "Have your portfolio value exceed your annual income.", isCompleted: false, check: s => calculatePortfolioValue(s) > s.income * 12, reward: { happiness: 15, income: 500 } },
        { id: 18, text: "Buy a house.", isCompleted: false, check: s => s.assets.properties.includes("Starter Home"), reward: { happiness: 25, money: 10000 } },
        { id: 19, text: "Double your initial income.", isCompleted: false, check: s => s.income >= SCHOOL_DATA[s.tier].income * 2, reward: { happiness: 15, money: 5000 } },
        { id: 20, text: "Spend over $2,000 on leisure in a single month.", isCompleted: false, check: s => s.history.leisure.some(l => l >= 2000), reward: { happiness: 15 } },
        { id: 21, text: "Achieve a net worth of $100,000.", isCompleted: false, check: s => (s.money + calculatePortfolioValue(s) - s.debt) >= 100000, reward: { happiness: 20 }, tracker: { current: s => (s.money + calculatePortfolioValue(s) - s.debt), target: 100000 } },
        { id: 22, text: "Complete a Master's Degree.", isCompleted: false, check: s => s.educationLevel.includes("Master"), reward: { happiness: 20, money: 25000 } },
        { id: 23, text: "Own 2 cars.", isCompleted: false, check: s => s.assets.cars.length >= 2, reward: { happiness: 10 }, tracker: { current: s => s.assets.cars.length, target: 2 } },
        { id: 24, text: "Have a single stock holding worth over $15,000.", isCompleted: false, check: s => Object.entries(s.portfolio).some(([id, stock]) => stock.shares * STOCKS[id].price >= 15000), reward: { happiness: 10 } },
        { id: 25, text: "Pay off half of your initial debt.", isCompleted: false, check: s => s.debt <= s.initialDebt * 0.5, reward: { happiness: 20, income: 500 } },
        { id: 26, text: "Grow your portfolio to $100,000.", isCompleted: false, check: s => calculatePortfolioValue(s) >= 100000, reward: { happiness: 20, income: 1000 }, tracker: { current: s => calculatePortfolioValue(s), target: 100000 } },
        { id: 27, text: "Reach $250,000 in savings.", isCompleted: false, check: s => s.money >= 250000, reward: { happiness: 20, money: 25000 }, tracker: { current: s => s.money, target: 250000 } },
        { id: 28, text: "Own a Family Home.", isCompleted: false, check: s => s.assets.properties.includes("Family Home"), reward: { happiness: 20 } },
        { id: 29, text: "Pay off all your student debt.", isCompleted: false, check: s => s.debt <= 0, reward: { happiness: 50, income: 2000 } },
        { id: 30, text: "Become debt-free for 6 consecutive months.", isCompleted: false, check: s => s.monthsDebtFree >= 6, reward: { happiness: 30, income: 1500 }, tracker: { current: s => s.monthsDebtFree, target: 6 } },
        { id: 31, text: "Achieve a net worth of $500,000.", isCompleted: false, check: s => (s.money + calculatePortfolioValue(s) - s.debt) >= 500000, reward: { happiness: 25, money: 50000 }, tracker: { current: s => (s.money + calculatePortfolioValue(s) - s.debt), target: 500000 } },
        { id: 32, text: "Buy the Electric Hypercar.", isCompleted: false, check: s => s.assets.cars.includes("Electric Hypercar"), reward: { happiness: 25, money: 25000 } },
        { id: 33, text: "Have a monthly income of over $20,000.", isCompleted: false, check: s => s.income >= 20000, reward: { happiness: 20 }, tracker: { current: s => s.income, target: 20000 } },
        { id: 34, text: "Complete a Doctorate.", isCompleted: false, check: s => s.educationLevel.includes("Doctorate"), reward: { happiness: 30, money: 100000 } },
        { id: 35, text: "Have your investment portfolio be worth more than your initial student debt.", isCompleted: false, check: s => calculatePortfolioValue(s) > s.initialDebt, reward: { happiness: 25, income: 1000 } },
        { id: 36, text: "Grow your portfolio to $250,000.", isCompleted: false, check: s => calculatePortfolioValue(s) >= 250000, reward: { happiness: 25, income: 2500 }, tracker: { current: s => calculatePortfolioValue(s), target: 250000 } },
        { id: 37, text: "Own the Luxury Villa.", isCompleted: false, check: s => s.assets.properties.includes("Luxury Villa"), reward: { happiness: 40 } },
        { id: 38, text: "Have a positive net flow for 24 consecutive months.", isCompleted: false, check: s => s.history.netCashFlow.slice(-24).every(n => n > 0), reward: { happiness: 30, money: 50000 } },
        { id: 39, text: "Reach maximum happiness.", isCompleted: false, check: s => s.happiness >= 100, reward: { money: 50000 } },
        { id: 40, text: "Own 5 cars.", isCompleted: false, check: s => s.assets.cars.length >= 5, reward: { happiness: 20, income: 2000 }, tracker: { current: s => s.assets.cars.length, target: 5 } },
        { id: 41, text: "Achieve a net worth of $1,000,000.", isCompleted: false, check: s => (s.money + calculatePortfolioValue(s) - s.debt) >= 1000000, reward: { happiness: 50, money: 100000 }, tracker: { current: s => (s.money + calculatePortfolioValue(s) - s.debt), target: 1000000 } },
        { id: 42, text: "Grow your portfolio to $500,000.", isCompleted: false, check: s => calculatePortfolioValue(s) >= 500000, reward: { happiness: 40, income: 5000 }, tracker: { current: s => calculatePortfolioValue(s), target: 500000 } },
        { id: 43, text: "Go one year without any debt.", isCompleted: false, check: s => s.monthsDebtFree >= 12, reward: { happiness: 50, money: 100000 }, tracker: { current: s => s.monthsDebtFree, target: 12 } },
        { id: 44, text: "Reach $1,000,000 in cash savings.", isCompleted: false, check: s => s.money >= 1000000, reward: { happiness: 50, money: 200000 }, tracker: { current: s => s.money, target: 1000000 } },
        { id: 45, text: "Have a monthly income of over $50,000.", isCompleted: false, check: s => s.income >= 50000, reward: { happiness: 40, income: 10000 }, tracker: { current: s => s.income, target: 50000 } },
        { id: 46, text: "Have your portfolio generate more income than your job (hypothetically, at 4% SWR).", isCompleted: false, check: s => (calculatePortfolioValue(s) * 0.04) / 12 > s.income, reward: { happiness: 50, money: 150000 } },
        { id: 47, text: "Grow your portfolio to $1,000,000.", isCompleted: false, check: s => calculatePortfolioValue(s) >= 1000000, reward: { happiness: 50, income: 10000 }, tracker: { current: s => calculatePortfolioValue(s), target: 1000000 } },
        { id: 48, text: "Achieve a net worth of $2,000,000.", isCompleted: false, check: s => (s.money + calculatePortfolioValue(s) - s.debt) >= 2000000, reward: { happiness: 50, money: 250000 }, tracker: { current: s => (s.money + calculatePortfolioValue(s) - s.debt), target: 2000000 } },
        { id: 49, text: "Own the Luxury Villa and the Electric Hypercar.", isCompleted: false, check: s => s.assets.properties.includes("Luxury Villa") && s.assets.cars.includes("Electric Hypercar"), reward: { happiness: 50 } },
        { id: 50, text: "Win the game by reaching a net worth of $3,000,000.", isCompleted: false, check: s => (s.money + calculatePortfolioValue(s) - s.debt) >= 3000000, reward: { happiness: 100 }, tracker: { current: s => (s.money + calculatePortfolioValue(s) - s.debt), target: 3000000 } }
    ];
    
    // --- All purchasable items in the shop ---
    const SHOP_ITEMS = {
        major: [
            { id: 'car1', name: 'Used Sedan', type: 'car', cost: 15000, happiness: 10 },
            { id: 'car2', name: 'New SUV', type: 'car', cost: 40000, happiness: 15 },
            { id: 'car3', name: 'Luxury Car', type: 'car', cost: 85000, happiness: 20 },
            { id: 'car4', name: 'Sports Car', type: 'car', cost: 120000, happiness: 22 },
            { id: 'car5', name: 'Electric Hypercar', type: 'car', cost: 250000, happiness: 25 },
            { id: 'house1', name: 'Starter Home', type: 'house', cost: 250000, happiness: 30, required: null },
            { id: 'house2', name: 'Family Home', type: 'house', cost: 500000, happiness: 25, required: 'Starter Home' },
            { id: 'house3', name: 'Luxury Villa', type: 'house', cost: 1200000, happiness: 40, required: 'Family Home' }
        ],
        discretionary: [
             { id: 'vacation1', name: 'Weekend Getaway', type: 'discretionary', cost: 1500, happiness: 10 },
             { id: 'tech1', name: 'New Laptop', type: 'discretionary', cost: 2000, happiness: 5 },
             { id: 'vacation2', name: 'International Trip', type: 'discretionary', cost: 7500, happiness: 20 }
        ]
    };

    // --- All available stocks for investment ---
    const STOCKS = {
        'safeCo': { name: 'Steady Growth Inc.', risk: 'low', price: 50, history: [50], trend: 0, pattern: 'none', patternStep: 0 },
        'midCorp': { name: 'Momentum Corp.', risk: 'medium', price: 100, history: [100], trend: 0, pattern: 'none', patternStep: 0 },
        'riskTech': { name: 'High-Risk Tech', risk: 'high', price: 25, history: [25], trend: 0, pattern: 'none', patternStep: 0 },
        'flyer': { name: 'Bio-Pharma Flyer', risk: 'high', price: 10, history: [10], trend: 0, pattern: 'none', patternStep: 0 }
    };

    // --- Defines how different stock chart patterns affect price over time ---
    const STOCK_PATTERNS = {
        double_top: {
            duration: 7,
            getPriceChange: (step) => {
                if (step < 2) return 0.08;
                if (step < 4) return -0.07;
                if (step < 6) return 0.075;
                if (step === 6) return -0.25;
                return 0;
            }
        },
        double_bottom: {
            duration: 7,
            getPriceChange: (step) => {
                if (step < 2) return -0.08;
                if (step < 4) return 0.07;
                if (step < 6) return -0.075;
                if (step === 6) return 0.25;
                return 0;
            }
        },
        head_and_shoulders: {
            duration: 9,
            getPriceChange: (step) => {
                if (step < 2) return 0.06;
                if (step < 3) return -0.04;
                if (step < 5) return 0.10;
                if (step < 7) return -0.08;
                if (step < 8) return 0.05;
                if (step < 9) return -0.04;
                if (step === 9) return -0.20;
                return 0;
            }
        },
        cup_and_handle: {
            duration: 9,
             getPriceChange: (step) => {
                if (step === 0) return -0.08;
                if (step === 1) return -0.05;
                if (step === 2) return -0.02; 
                if (step === 3) return 0.02;
                if (step === 4) return 0.05;
                if (step === 5) return 0.08;
                if (step < 8) return -0.03;
                if (step === 8) return 0.22;
                return 0;
            }
        },
        pennant: {
             duration: 5,
             getPriceChange: (step) => {
                if (step === 0) return 0.20;
                if (step < 4) return (0.02 - (step * 0.01));
                if (step === 4) return 0.15;
                return 0;
            }
        }
    };
    
    // --- Random events that can occur each month ---
    const RANDOM_EVENTS = [
        { id: 'find_cash', text: "You found a wallet on the street. You keep the cash.", effect: { money: 500 }, chance: 0.015 },
        { id: 'car_repair', text: "Your car broke down. The repair is costly.", effect: { money: -1500, happiness: -5 }, chance: 0.02, condition: (s) => s.assets.cars.length > 0 && s.money > 1500 },
        { id: 'tax_refund', text: "You get a small tax refund you weren't expecting!", effect: { money: 2000 }, chance: 0.01 },
        { id: 'market_optimism', text: "Market optimism gives you a confidence boost!", effect: { happiness: 5 }, chance: 0.03 },
        { id: 'home_repair', text: "A pipe burst in your home! Emergency repairs are needed.", effect: { money: -2500, happiness: -5 }, chance: 0.015, condition: (s) => s.assets.properties.length > 0 && s.money > 2500 },
        { id: 'health_issue', text: "You have a minor health issue. A visit to the doctor costs you.", effect: { money: -750, happiness: -5 }, chance: 0.02, condition: (s) => s.money > 750 },
        { id: 'inheritance', text: "A distant relative leaves you a small inheritance.", effect: { money: 10000, happiness: 10 }, chance: 0.005 },
        { id: 'investment_tip', text: "You get a hot stock tip from a friend. It pays off!", effect: { money: 2500 }, chance: 0.01, condition: (s) => calculatePortfolioValue(s) > 1000 },
        { id: 'identity_theft', text: "You were a victim of a minor identity theft scare. It costs money and happiness to resolve.", effect: { money: -3000, happiness: -10 }, chance: 0.005, condition: (s) => s.money > 3000},
        { id: 'bonus', text: "Your company had a great quarter! You receive a surprise bonus.", effect: { money: s => s.income, happiness: 10 }, chance: 0.01 }
    ];

    // =========================================================================
    // ||                       DOM ELEMENT REFERENCES                        ||
    // =========================================================================

    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const confirmSetupBtn = document.getElementById('confirm-setup-btn');
    const tierSelectionCardsContainer = document.getElementById('tier-selection-cards');
    const collegeDropdownsContainer = document.getElementById('college-dropdowns');
    const simulateMonthBtn = document.getElementById('simulate-month-btn');
    const autoAllocateBtn = document.getElementById('auto-allocate-btn');
    const budgetCardBody = document.getElementById('budget-card-body');
    const educationBtn = document.getElementById('education-btn');
    const educationModalBody = document.getElementById('education-modal-body');
    const shopModalBody = document.getElementById('shop-modal-body');
    const investModalBody = document.getElementById('invest-modal-body');
    const propertyList = document.getElementById('property-list');
    const notificationModalTitle = document.getElementById('notification-modal-title');
    const notificationModalBody = document.getElementById('notification-modal-body');
    const lessonModalTitle = document.getElementById('lesson-modal-title');
    const lessonModalBody = document.getElementById('lesson-modal-body');

    // =========================================================================
    // ||                         GAME STATE & VARIABLES                      ||
    // =========================================================================

    let gameState = {};
    let financialChart;
    let stockDetailChart;
    let educationModal, shopModal, investModal, notificationModal, stockDetailModal, lessonModal;
    let notificationQueue = [];

    // =========================================================================
    // ||                         HELPER FUNCTIONS                            ||
    // =========================================================================

    // --- Formats a number into a US dollar currency string ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };

    // --- Calculates the total current value of the player's stock portfolio ---
    const calculatePortfolioValue = (state) => {
        return Object.entries(state.portfolio).reduce((total, [id, stock]) => {
            return total + (stock.shares * STOCKS[id].price);
        }, 0);
    };

    // --- Adds a notification to a queue to be displayed one by one ---
    const queueNotification = (title, message) => {
        notificationQueue.push({ title, message });
    };

    // --- Displays the next notification in the queue if none are currently visible ---
    const processNotificationQueue = () => {
        if (gameState.isGameOver || notificationQueue.length === 0) {
            return;
        }
        
        const isModalVisible = notificationModal._element.classList.contains('show');
        if (!isModalVisible) {
            const notification = notificationQueue.shift();
            notificationModalTitle.textContent = notification.title;
            notificationModalBody.innerHTML = notification.message;
            notificationModal.show();
        }
    };
    
    // --- Formats the reward object from a quest into a readable string ---
    const formatReward = (reward) => {
        let parts = [];
        if (reward.money) parts.push(`Money: ${formatCurrency(reward.money)}`);
        if (reward.happiness) parts.push(`Happiness: +${reward.happiness}`);
        if (reward.income) parts.push(`Income: +${formatCurrency(reward.income)}/mo`);
        return parts.join(', ');
    }

    // =========================================================================
    // ||                       UI INITIALIZATION                             ||
    // =========================================================================

    // --- Dynamically creates the school selection UI on the menu screen ---
    function setupMenu() {
        tierSelectionCardsContainer.innerHTML = '';
        collegeDropdownsContainer.innerHTML = '';
    
        Object.entries(SCHOOL_DATA).forEach(([key, tier]) => {
            const tierCardHTML = `
                <div class="col-md-4">
                    <div class="tier-card p-3 rounded" data-bs-toggle="collapse" data-bs-target="#${key}-tier-colleges">
                        <h3 class="h5 fw-bold tier-text-${key}">${tier.name}</h3>
                        <p class="small mb-0">${formatCurrency(tier.income)}/mo, ${formatCurrency(tier.debt)} debt</p>
                    </div>
                </div>`;
            tierSelectionCardsContainer.innerHTML += tierCardHTML;
    
            let options = tier.schools.map(school => `<option value="${school}">${school}</option>`).join('');
            const dropdownHTML = `
                <div class="collapse mt-4" id="${key}-tier-colleges" data-bs-parent="#school-selection-accordion">
                    <select class="form-select school-select" data-tier="${key}">
                        <option selected disabled>Select a ${tier.name.toLowerCase()} school...</option>
                        ${options}
                    </select>
                </div>`;
            collegeDropdownsContainer.innerHTML += dropdownHTML;
        });
    
        addMenuEventListeners();
    }
    
    // =========================================================================
    // ||                           CORE GAME LOGIC                           ||
    // =========================================================================

    // --- Initializes the main game state and transitions from menu to game screen ---
    function initGame(schoolName, tierKey) {
        const schoolInfo = SCHOOL_DATA[tierKey];
        gameState = {
            year: 2025,
            month: 1, 
            age: 22,
            money: 500,
            debt: schoolInfo.debt,
            initialDebt: schoolInfo.debt,
            income: schoolInfo.income,
            happiness: 60,
            baseIncome: schoolInfo.income,
            school: schoolName,
            tier: tierKey,
            educationLevel: 'Undergraduate',
            assets: { properties: [], cars: [] },
            portfolio: { 'safeCo': { shares: 0 }, 'midCorp': { shares: 0 }, 'riskTech': { shares: 0 }, 'flyer': { shares: 0 } },
            quests: QUESTS.map(q => ({ ...q, isCompleted: false, reward: { ...q.reward }, tracker: q.tracker ? { ...q.tracker } : undefined })),
            history: {
                netCashFlow: [0],
                leisure: [], 
                purchases: [],
                labels: ['Start']
            },
            economy: 'normal',
            taxRate: TAX_RATES.normal,
            monthsWithoutLeisure: 0,
            monthsDebtFree: 0,
            monthsInRecession: 0,
            isGameOver: false,
        };

        setupBudgetSliders();
        initChart();
        updateUI();
        setupEducationModal();
        populateShopModal();
        
        menuScreen.classList.add('d-none');
        gameScreen.classList.remove('d-none');
        
        simulateMonthBtn.disabled = false;
        autoAllocateBtn.disabled = false;
    }

    // --- Triggers random events based on their defined probabilities ---
    function handleRandomEvents() {
        for (const event of RANDOM_EVENTS) {
            if (Math.random() < event.chance) {
                if (event.condition && !event.condition(gameState)) {
                    continue;
                }
                
                if(event.effect.money) {
                    const amount = typeof event.effect.money === 'function' ? event.effect.money(gameState) : event.effect.money;
                    gameState.money += amount;
                }
                if(event.effect.happiness) {
                     gameState.happiness = Math.min(100, Math.max(0, gameState.happiness + event.effect.happiness));
                }
                queueNotification('Random Event!', event.text);
                break; 
            }
        }
    }

    // --- The main function that simulates the passing of one month ---
    function simulateMonth() {
        const budget = {};
        let totalExpenses = 0;
        BUDGET_CATEGORIES.forEach(cat => {
            const value = parseInt(document.getElementById(`budget-${cat}`).value);
            budget[cat] = value;
            totalExpenses += value;
        });

        for(const category of NEEDS_CATEGORIES) {
            const requiredAmount = getRequiredSpending(category);
            if (budget[category] < requiredAmount) {
                queueNotification('Budget Deficit',`You must meet the minimum spending for ${category}. Required: ${formatCurrency(requiredAmount)}`);
                processNotificationQueue();
                return;
            }
        }
        
        let currentIncome = gameState.income;
        if(gameState.economy === 'boom') currentIncome *= 1.10;
        
        const taxesPaid = currentIncome * gameState.taxRate;
        const afterTaxIncome = currentIncome - taxesPaid;

        if (totalExpenses > gameState.money + afterTaxIncome) {
            queueNotification('Insufficient Funds',"You can't spend more money than you'll have this month!");
            processNotificationQueue();
            return;
        }
        
        updateEconomy();
        updateStockPrices();
        
        const netCashFlow = afterTaxIncome - totalExpenses;
        
        if (netCashFlow < 0) {
            gameState.money += netCashFlow;
        }

        if (gameState.debt > 0) {
            const interest = gameState.debt * 0.005; 
            gameState.debt += interest;

            if (netCashFlow > 0) {
                const payment = Math.min(gameState.debt, netCashFlow);
                gameState.debt -= payment;
                const leftover = netCashFlow - payment;
                gameState.money += leftover;
            }
        } else {
             if (netCashFlow > 0) {
                gameState.money += netCashFlow;
            }
        }
        
        gameState.history.netCashFlow.push(netCashFlow);
        gameState.history.leisure.push(budget.leisure);
        
        if (budget.leisure === 0) gameState.happiness -= 3;
        else if (budget.leisure < currentIncome * 0.1) gameState.happiness -= 1;
        else gameState.happiness += 2;
        
        if (gameState.economy === 'recession') gameState.happiness -= 4;
        if (gameState.economy === 'boom') gameState.happiness += 2;
        
        gameState.happiness = Math.max(0, Math.min(100, gameState.happiness));

        if (budget.leisure === 0) gameState.monthsWithoutLeisure++; else gameState.monthsWithoutLeisure = 0;
        if (gameState.debt <= 0) gameState.monthsDebtFree++; else gameState.monthsDebtFree = 0;
        if (gameState.economy === 'recession') gameState.monthsInRecession++; else gameState.monthsInRecession = 0;

        gameState.month++;
        if (gameState.month > 12) {
            gameState.month = 1;
            gameState.year++;
            gameState.age++;
            if (gameState.income > 0) {
                const promotionPercent = 1 + (Math.random() * 0.03 + 0.02);
                gameState.income = Math.round(gameState.income * promotionPercent);
                gameState.baseIncome = Math.round(gameState.baseIncome * promotionPercent);
                queueNotification('Promotion!', `Congratulations! You've received an annual raise. Your new monthly income is ${formatCurrency(gameState.income)}.`);
            }
        }
        
        gameState.history.labels.push(`Y${gameState.year}M${gameState.month}`);

        if (gameState.history.labels.length > 24) {
            gameState.history.labels.shift();
            gameState.history.netCashFlow.shift();
        }

        handleRandomEvents();
        checkQuests();
        checkEndConditions();
        
        updateUI();
        processNotificationQueue();
    }
    
    // --- Checks if any active quests have been completed and grants rewards ---
    function checkQuests() {
        const activeQuests = gameState.quests.filter(q => !q.isCompleted).slice(0, 5);

        activeQuests.forEach(quest => {
            if (!quest.isCompleted && quest.check(gameState)) {
                quest.isCompleted = true;
                if(quest.reward.money) gameState.money += quest.reward.money;
                if(quest.reward.happiness) gameState.happiness = Math.min(100, gameState.happiness + quest.reward.happiness);
                if(quest.reward.income) gameState.income += quest.reward.income;
                queueNotification('Quest Complete!', `${quest.text}<br><br><strong>Reward:</strong> ${formatReward(quest.reward)}`);
            }
        });
    }

    // --- Checks for game over conditions (low happiness, high net worth) ---
    function checkEndConditions() {
        if (gameState.isGameOver) return; 

        const gameOverModalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById('game-over-modal'));
        const netWorth = gameState.money + calculatePortfolioValue(gameState) - gameState.debt;
        let isEnding = false;

        if (gameState.happiness <= 25) {
            document.getElementById('game-over-message').innerHTML = "Your happiness fell to 25% or below. Remember that money isn't everything!";
            isEnding = true;
        }
         if (netWorth >= 3000000) {
            document.getElementById('game-over-message').innerHTML = "Congratulations! You've reached a net worth of $3,000,000 and won the game!";
            isEnding = true;
        }

        if (isEnding) {
            gameState.isGameOver = true;
            gameOverModalInstance.show();
        }
    }

    // --- Simulates the passage of time for pursuing higher education ---
    function fastForward(months, newDebt, incomeBoost, newLevel) {
        gameState.income = 0;
        gameState.debt += newDebt;

        for (let i = 0; i < months; i++) {
             gameState.month++;
             if (gameState.month > 12) {
                 gameState.month = 1;
                 gameState.year++;
                 gameState.age++;
             }
             gameState.history.labels.push(`Y${gameState.year}M${gameState.month}`);
             gameState.history.netCashFlow.push(0);
        }

        gameState.income = gameState.baseIncome + (gameState.baseIncome * incomeBoost);
        gameState.educationLevel = newLevel;
        gameState.happiness = 70;

        checkQuests();
        checkEndConditions();
        updateUI();
        setupEducationModal();
        populateShopModal();
        processNotificationQueue();
    }

    // --- Updates the economic state with a chance to change each month ---
    function updateEconomy() {
        const oldEconomy = gameState.economy;
        const rand = Math.random();
        if (gameState.economy === 'normal') {
            if (rand < 0.03) gameState.economy = 'recession';
            else if (rand < 0.08) gameState.economy = 'boom';
        } else if (gameState.economy === 'recession' || gameState.economy === 'boom') {
            if (rand < 0.15) gameState.economy = 'normal';
        }

        gameState.taxRate = TAX_RATES[gameState.economy];

        if (gameState.economy !== oldEconomy) {
            let message = '';
            if (gameState.economy === 'recession') {
                message = 'The economy has entered a recession! Be prepared for tough times, but goods may be cheaper.';
            } else if (gameState.economy === 'boom') {
                message = 'The economy is booming! Incomes get a temporary 10% boost and investments are on the rise.';
            } else {
                message = 'The economy has stabilized and returned to normal.';
            }
            queueNotification('Economic Shift', message);
        }
    }

    // --- Calculates the minimum required spending for a budget category ---
    function getRequiredSpending(category) {
        const economyMultiplier = (gameState.economy === 'recession') ? 0.9 : 1.0;

        if (category === 'housing' && gameState.assets.properties.length > 0) {
            return UPKEEP_COSTS.house * gameState.assets.properties.length * economyMultiplier;
        }

        if (category === 'transport' && gameState.assets.cars.length > 0) {
            return UPKEEP_COSTS.car * gameState.assets.cars.length * economyMultiplier;
        }

        if (!MINIMUM_SPENDING[gameState.tier][category]) return 0;
        const baseAmount = MINIMUM_SPENDING[gameState.tier][category];
        return baseAmount * economyMultiplier;
    }


    // --- Adjusts the cost of items based on the current economy ---
    function getAdjustedCost(baseCost) {
        if (gameState.economy === 'recession') return baseCost * 0.9;
        return baseCost;
    }

    // --- Automatically allocates budget to needs, setting leisure to zero ---
    function autoAllocateBudget() {
        const needsTotal = gameState.income * 0.5;

        const tierMinimums = MINIMUM_SPENDING[gameState.tier];
        const sumOfMinimums = Object.values(tierMinimums).reduce((a, b) => a + b, 0);

        NEEDS_CATEGORIES.forEach(cat => {
            const proportion = tierMinimums[cat] / sumOfMinimums;
            let allocatedAmount = needsTotal * proportion;
            const requiredAmount = getRequiredSpending(cat);
            const finalAmount = Math.max(allocatedAmount, requiredAmount);

            const slider = document.getElementById(`budget-${cat}`);
            slider.value = Math.round(finalAmount / 50) * 50;
            slider.dispatchEvent(new Event('input'));
        });

        const leisureSlider = document.getElementById('budget-leisure');
        leisureSlider.value = 0; // Set leisure spending to zero
        leisureSlider.dispatchEvent(new Event('input'));
    }

    // =========================================================================
    // ||                           UI UPDATING                               ||
    // =========================================================================

    // --- Refreshes all visible game data on the screen ---
    function updateUI() {
        const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        document.getElementById('status-money').innerHTML = `<strong>Money:</strong> ${formatCurrency(gameState.money)}`;
        document.getElementById('status-income').innerHTML = `<strong>Income:</strong> ${formatCurrency(gameState.income)}/mo <i class="fas fa-question-circle learn-more-icon" data-topic="income"></i>`;
        document.getElementById('status-debt').innerHTML = `<strong>Debt:</strong> ${formatCurrency(gameState.debt)} <i class="fas fa-question-circle learn-more-icon" data-topic="debt"></i>`;
        document.getElementById('status-tax').innerHTML = `<strong>Tax Rate:</strong> ${(gameState.taxRate * 100).toFixed(0)}% <i class="fas fa-question-circle learn-more-icon" data-topic="taxes"></i>`;
        
        document.getElementById('date-display').innerText = `${MONTH_NAMES[gameState.month - 1]} ${gameState.year} (Age: ${gameState.age})`;
        
        const happinessBar = document.getElementById('happiness-bar');
        happinessBar.style.width = `${gameState.happiness}%`;
        happinessBar.setAttribute('aria-valuenow', gameState.happiness);
        happinessBar.innerText = `${gameState.happiness}%`;
        happinessBar.classList.remove('bg-danger', 'bg-warning');
        if (gameState.happiness <= 25) {
            happinessBar.classList.add('bg-danger');
        } else if (gameState.happiness <= 50) {
            happinessBar.classList.add('bg-warning');
        }


        const economyBadge = document.getElementById('status-economy');
        economyBadge.innerText = gameState.economy.charAt(0).toUpperCase() + gameState.economy.slice(1);
        economyBadge.className = 'badge rounded-pill';
        if (gameState.economy === 'normal') economyBadge.classList.add('bg-success');
        else if (gameState.economy === 'boom') economyBadge.classList.add('bg-info', 'text-dark');
        else if (gameState.economy === 'recession') economyBadge.classList.add('bg-danger');

        const questList = document.getElementById('quest-list');
        questList.innerHTML = '';
        const visibleQuests = gameState.quests.filter(q => !q.isCompleted).slice(0, 5);
        if (visibleQuests.length > 0) {
            visibleQuests.forEach(quest => {
                const li = document.createElement('li');
                li.className = `list-group-item d-flex justify-content-between align-items-start`;
                let questText = quest.text;
                if (quest.tracker) {
                    const current = quest.tracker.current(gameState);
                    const target = quest.tracker.target;
                    const displayCurrent = (current >= 1000) ? formatCurrency(current) : Math.floor(current);
                    const displayTarget = (target >= 1000) ? formatCurrency(target) : target;
                    questText += ` (${displayCurrent}/${displayTarget})`;
                }
                li.innerHTML = `<div class="ms-2 me-auto">${questText}</div>`;
                questList.appendChild(li);
            });
        } else {
            questList.innerHTML = '<li class="list-group-item">No new quests at this time. Congratulations!</li>';
        }
        
        document.getElementById('education-level').innerText = gameState.educationLevel;
        propertyList.innerHTML = '';
        if ([...gameState.assets.properties, ...gameState.assets.cars].length === 0) {
            propertyList.innerHTML = '<li class="list-group-item">No assets owned.</li>';
        } else {
            gameState.assets.cars.forEach(car => propertyList.innerHTML += `<li class="list-group-item">Car: ${car}</li>`);
            gameState.assets.properties.forEach(prop => propertyList.innerHTML += `<li class="list-group-item">House: ${prop}</li>`);
        }
        
        financialChart.data.labels = gameState.history.labels;
        financialChart.data.datasets[0].data = gameState.history.netCashFlow;
        financialChart.update();
        updateBudgetUISettings();
        updateBudgetSummary();
    }

    // --- Creates the budget sliders and attaches event listeners ---
    function setupBudgetSliders() {
        const buttons = budgetCardBody.querySelector('.d-grid');
        const summary = budgetCardBody.querySelector('#budget-summary-container');
        budgetCardBody.innerHTML = '';

        BUDGET_CATEGORIES.forEach(cat => {
            const name = cat.charAt(0).toUpperCase() + cat.slice(1);
            const sliderHTML = `
                <div class="mb-2 budget-slider-group">
                    <div class="d-flex justify-content-between">
                        <label for="budget-${cat}" class="form-label">${name} <i class="fas fa-question-circle learn-more-icon" data-topic="${cat}"></i></label>
                        <span id="${cat}-value-display" class="budget-value-display fw-bold"></span>
                    </div>
                    <input type="range" class="form-range" id="budget-${cat}" data-category="${cat}" min="0" step="50">
                    <div class="text-end text-white-50 small" id="${cat}-min-display-container">
                        Min: <span id="${cat}-min-display"></span>
                    </div>
                </div>`;
            budgetCardBody.insertAdjacentHTML('beforeend', sliderHTML);
        });

        budgetCardBody.appendChild(summary);
        budgetCardBody.appendChild(buttons);

        document.querySelectorAll('.form-range').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const display = document.getElementById(`${e.target.dataset.category}-value-display`);
                const value = parseInt(e.target.value);
                display.textContent = formatCurrency(value);
                const minReq = getRequiredSpending(e.target.dataset.category);
                if (e.target.dataset.category !== 'leisure' && value < minReq) {
                    display.classList.add('is-invalid');
                } else {
                    display.classList.remove('is-invalid');
                }
                updateBudgetSummary();
            });
            slider.dispatchEvent(new Event('input'));
        });
    }
    
    // --- Updates the max value and minimum display for budget sliders ---
    function updateBudgetUISettings() {
        document.querySelectorAll('.form-range').forEach(slider => {
            const category = slider.dataset.category;
            const maxAmount = Math.max(gameState.income * 1.2, 5000);
            slider.max = maxAmount;
            
            const minDisplay = document.getElementById(`${category}-min-display`);
            const minContainer = document.getElementById(`${category}-min-display-container`);
            
            if (category !== 'leisure') {
                const requiredAmount = getRequiredSpending(category);
                minDisplay.textContent = formatCurrency(requiredAmount);
                minContainer.style.display = 'block';
            } else {
                minContainer.style.display = 'none';
            }
        });
    }

    // --- Updates the budget summary text (Total Budgeted, Remaining, etc.) ---
    function updateBudgetSummary() {
        let totalBudgeted = 0;
        document.querySelectorAll('.form-range').forEach(slider => {
            totalBudgeted += parseInt(slider.value);
        });

        const currentIncome = gameState.income;
        const afterTaxIncome = currentIncome * (1 - gameState.taxRate);
        const remaining = afterTaxIncome - totalBudgeted;

        const summaryBudgeted = document.getElementById('summary-budgeted');
        const summaryRemaining = document.getElementById('summary-remaining');
        const summarySavings = document.getElementById('summary-savings');

        summaryBudgeted.textContent = formatCurrency(totalBudgeted);
        summaryRemaining.textContent = formatCurrency(remaining);
        summarySavings.textContent = formatCurrency(Math.max(0, remaining));

        if (remaining < 0) {
            summaryRemaining.classList.add('text-danger');
            summarySavings.parentElement.classList.add('d-none');
        } else {
            summaryRemaining.classList.remove('text-danger');
            summarySavings.parentElement.classList.remove('d-none');
        }
    }

    // =========================================================================
    // ||                      MODAL & DYNAMIC CONTENT                        ||
    // =========================================================================
    
    // --- Builds the content for the Higher Education modal ---
    function setupEducationModal() {
        educationModalBody.innerHTML = `
            <div id="education-step-1">
                <h5>Step 1: Choose a Degree</h5>
                <div class="d-grid gap-2">
                    <button class="btn btn-info" id="masters-choice-btn" ${gameState.educationLevel !== 'Undergraduate' ? 'disabled' : ''}>Master's Degree (2 Years)</button>
                    <button class="btn btn-info" id="doctorate-choice-btn" ${gameState.educationLevel.includes('Doctorate') ? 'disabled' : ''}>Doctorate (4 Years)</button>
                </div>
            </div>
            <div id="education-step-2" class="d-none">
                <h5 id="education-step-2-title">Step 2: Choose a University</h5>
                <ul class="list-group" id="university-list"></ul>
                <button class="btn btn-secondary mt-3" id="education-back-btn">Back</button>
            </div>
        `;

        const showStep2 = (degreeType) => {
            document.getElementById('education-step-1').classList.add('d-none');
            document.getElementById('education-step-2').classList.remove('d-none');
            const universityList = document.getElementById('university-list');
            universityList.innerHTML = '';
            
            let duration, levelName, baseBoostKey;
            if (degreeType === 'masters') {
                duration = 24;
                levelName = "Master's Degree";
                baseBoostKey = 'master';
                document.getElementById('education-step-2-title').innerText = "Choose a University for your Master's";
            } else {
                duration = 48;
                levelName = "Doctorate";
                baseBoostKey = 'doctorate';
                document.getElementById('education-step-2-title').innerText = "Choose a University for your Doctorate";
            }

            for (const [tierKey, tierData] of Object.entries(SCHOOL_DATA)) {
                for (const schoolName of tierData.schools) {
                    const isSameSchool = schoolName === gameState.school;
                    const tuitionPerYear = tierData.tuition;
                    let totalCost = tuitionPerYear * (duration / 12);
                    const discount = isSameSchool ? 0.20 : 0;
                    totalCost *= (1 - discount);
                    const incomeBoost = tierData.edu[baseBoostKey];

                    const li = document.createElement('a');
                    li.href = '#';
                    li.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
                    li.innerHTML = `
                        <div>
                            <strong>${schoolName}</strong> (${tierData.name})
                            <br><small class="text-white-50">Boost: +${(incomeBoost * 100).toFixed(0)}%, Cost: ${formatCurrency(totalCost)}</small>
                        </div>
                        ${isSameSchool ? '<span class="badge bg-success">20% Discount</span>' : ''}
                    `;
                    li.onclick = (e) => {
                        e.preventDefault();
                        fastForward(duration, totalCost, incomeBoost, levelName);
                        educationModal.hide();
                    };
                    universityList.appendChild(li);
                }
            }
        };

        document.getElementById('masters-choice-btn').onclick = () => showStep2('masters');
        document.getElementById('doctorate-choice-btn').onclick = () => showStep2('doctorate');
        document.getElementById('education-back-btn').onclick = () => {
             document.getElementById('education-step-1').classList.remove('d-none');
             document.getElementById('education-step-2').classList.add('d-none');
        };
    }
    
    // --- Logic for buying a major item like a car or house ---
    function buyMajorPurchase(itemId) {
        const item = SHOP_ITEMS.major.find(i => i.id === itemId);
        if (!item) return;

        const cost = getAdjustedCost(item.cost);
        if (gameState.money < cost) {
            queueNotification('Insufficient Funds', 'You do not have enough money for this purchase.');
            processNotificationQueue();
            return;
        }

        if (item.type === 'car') {
            if (gameState.assets.cars.includes(item.name)) {
                queueNotification('Already Owned', 'You already own this car.');
                processNotificationQueue();
                return;
            }
            gameState.assets.cars.push(item.name);
        } else if (item.type === 'house') {
            const currentHouse = SHOP_ITEMS.major.find(h => h.type === 'house' && gameState.assets.properties.includes(h.name));
            if (currentHouse && currentHouse.id === item.id) {
                queueNotification('Already Owned', 'You already own this house.');
                processNotificationQueue();
                return;
            }
             if (item.required && !gameState.assets.properties.includes(item.required)) {
                queueNotification('Requirement Not Met', `You must own the ${item.required} before buying this.`);
                processNotificationQueue();
                return;
            }
            if (item.required) {
                const oldHouseIndex = gameState.assets.properties.indexOf(item.required);
                if (oldHouseIndex > -1) gameState.assets.properties.splice(oldHouseIndex, 1);
            }
            gameState.assets.properties.push(item.name);
        }

        gameState.money -= cost;
        gameState.happiness = Math.min(100, gameState.happiness + item.happiness);
        gameState.history.purchases.push(item.name);

        queueNotification('Purchase Successful!', `You bought the ${item.name}! You gained +${item.happiness} happiness.`);
        processNotificationQueue();
        checkQuests();
        updateUI();
        populateShopModal();
        shopModal.hide();
    }

    // --- Logic for buying a one-time discretionary item ---
    function buyDiscretionaryPurchase(itemId) {
        const item = SHOP_ITEMS.discretionary.find(i => i.id === itemId);
        if (!item) return;

        const cost = getAdjustedCost(item.cost);
        if (gameState.money < cost) {
            queueNotification('Insufficient Funds', 'You do not have enough money for this purchase.');
            processNotificationQueue();
            return;
        }

        gameState.money -= cost;
        gameState.happiness = Math.min(100, gameState.happiness + item.happiness);
        gameState.history.purchases.push(item.name);

        queueNotification('Purchase Successful!', `You bought a ${item.name}! You gained +${item.happiness} happiness.`);
        processNotificationQueue();
        checkQuests();
        updateUI();
        shopModal.hide();
    }
    
    // --- Populates the shop modal with all available items and their statuses ---
    function populateShopModal() {
        shopModalBody.innerHTML = '<h5>Major Purchases</h5>';
        const majorItemsContainer = document.createElement('div');
        majorItemsContainer.className = 'row g-3 mb-4';

        SHOP_ITEMS.major.forEach(item => {
            const isOwned = item.type === 'car' ? gameState.assets.cars.includes(item.name) : gameState.assets.properties.includes(item.name);
            const cost = getAdjustedCost(item.cost);
            const canAfford = gameState.money >= cost;
            
            let isDisabled = isOwned || !canAfford;
            let buttonText = 'Buy';

            if (isOwned) {
                buttonText = 'Owned';
            } else if (!canAfford) {
                buttonText = 'Not Enough Funds';
            }

            if (item.type === 'house') {
                if (item.required && !gameState.assets.properties.includes(item.required)) {
                    isDisabled = true;
                    buttonText = `Requires ${item.required}`;
                }
                 const allHouses = SHOP_ITEMS.major.filter(i => i.type === 'house');
                 const currentHouseIndex = allHouses.findIndex(h => gameState.assets.properties.includes(h.name));
                 const itemIndex = allHouses.findIndex(h => h.id === item.id);
                 if (currentHouseIndex > itemIndex) { 
                     isDisabled = true;
                     buttonText = 'Owned Better';
                 }
            } else if (item.type === 'car') {
                if (gameState.assets.cars.length >= 5 && !isOwned) {
                    isDisabled = true;
                    buttonText = 'Car Limit Reached';
                }
            }


            const itemHTML = `
                <div class="col-md-6">
                    <div class="card stock-card h-100">
                        <div class="card-body">
                            <h6 class="card-title">${item.name}</h6>
                            <p class="card-text mb-2">Cost: ${formatCurrency(cost)}<br/>Happiness: +${item.happiness}</p>
                            <button class="btn btn-secondary w-100 btn-buy-major" data-item-id="${item.id}" ${isDisabled ? 'disabled' : ''}>
                                ${buttonText}
                            </button>
                        </div>
                    </div>
                </div>`;
            majorItemsContainer.innerHTML += itemHTML;
        });
        shopModalBody.appendChild(majorItemsContainer);

        shopModalBody.innerHTML += '<h5>Discretionary Spending</h5>';
        const discItemsContainer = document.createElement('div');
        discItemsContainer.className = 'row g-3';
         SHOP_ITEMS.discretionary.forEach(item => {
            const cost = getAdjustedCost(item.cost);
            const canAfford = gameState.money >= cost;
            const itemHTML = `
                 <div class="col-md-6">
                    <div class="card stock-card h-100">
                        <div class="card-body">
                            <h6 class="card-title">${item.name}</h6>
                            <p class="card-text mb-2">Cost: ${formatCurrency(cost)}<br/>Happiness: +${item.happiness}</p>
                            <button class="btn btn-secondary w-100 btn-buy-disc" data-item-id="${item.id}" ${!canAfford ? 'disabled' : ''}>Purchase</button>
                        </div>
                    </div>
                </div>`;
            discItemsContainer.innerHTML += itemHTML;
        });
        shopModalBody.appendChild(discItemsContainer);

        shopModalBody.querySelectorAll('.btn-buy-major').forEach(btn => {
            btn.onclick = () => buyMajorPurchase(btn.dataset.itemId);
        });
        shopModalBody.querySelectorAll('.btn-buy-disc').forEach(btn => {
            btn.onclick = () => buyDiscretionaryPurchase(btn.dataset.itemId);
        });
    }
    
    // --- Populates the investment modal with stocks and portfolio summary ---
    function populateInvestmentModal() {
        investModalBody.innerHTML = `
            <div class="row">
                <div class="col-lg-8" id="stock-list-container"></div>
                <div class="col-lg-4" id="portfolio-summary-container"></div>
            </div>`;
        
        const stockContainer = document.getElementById('stock-list-container');
        const portfolioContainer = document.getElementById('portfolio-summary-container');

        stockContainer.innerHTML = '<h4>Available Stocks</h4>';
        Object.entries(STOCKS).forEach(([id, stock]) => {
            const priceDiff = stock.price - (stock.history[stock.history.length - 2] || stock.price);
            const priceClass = priceDiff >= 0 ? 'price-up' : 'price-down';
            
            const previousPrice = stock.history[stock.history.length - 2] || stock.price;
            const percentChange = previousPrice > 0 ? (priceDiff / previousPrice) * 100 : 0;
            const changeText = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`;

            const stockEl = document.createElement('div');
            stockEl.className = 'card stock-card mb-3';
            stockEl.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <h5 class="mb-0">${stock.name}</h5>
                            <span class="text-white-50">Risk: ${stock.risk}</span>
                        </div>
                        <div class="text-end">
                            <h5 class="mb-0">${formatCurrency(stock.price)} <small class="${priceClass}">(${changeText})</small></h5>
                            <span class="text-white-50 small">Owned: ${gameState.portfolio[id].shares}</span>
                        </div>
                    </div>
                     <div class="d-flex justify-content-end mb-3">
                        <button class="btn btn-chart-view view-chart-btn" data-stock-id="${id}">View Chart</button>
                    </div>
                    <div class="d-flex mt-2 gap-2">
                        <input type="number" class="form-control" placeholder="Qty" id="qty-${id}" min="1">
                        <button class="btn btn-success flex-shrink-0" id="buy-${id}">Buy</button>
                        <button class="btn btn-danger flex-shrink-0" id="sell-${id}">Sell</button>
                    </div>
                </div>
            `;
            stockContainer.appendChild(stockEl);
            document.getElementById(`buy-${id}`).onclick = () => handleStockTrade(id, 'buy');
            document.getElementById(`sell-${id}`).onclick = () => handleStockTrade(id, 'sell');
        });

        stockContainer.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('view-chart-btn')) {
                const stockId = e.target.dataset.stockId;
                showStockDetailChart(stockId);
            }
        });

        const portfolioValue = calculatePortfolioValue(gameState);
        portfolioContainer.innerHTML = `
            <h4>My Portfolio</h4>
            <div class="card stock-card">
                <div class="card-body">
                    <h5 class="card-title">Total Value: <i class="fas fa-question-circle learn-more-icon" data-topic="investing"></i></h5>
                    <p class="display-6 fw-bold">${formatCurrency(portfolioValue)}</p>
                    <hr/>
                    <ul class="list-unstyled" id="portfolio-breakdown"></ul>
                </div>
            </div>`;
        const breakdownList = document.getElementById('portfolio-breakdown');
        Object.entries(gameState.portfolio).forEach(([id, pStock]) => {
            if (pStock.shares > 0) {
                const value = pStock.shares * STOCKS[id].price;
                const li = document.createElement('li');
                li.className = 'd-flex justify-content-between';
                li.innerHTML = `<span>${STOCKS[id].name} (x${pStock.shares})</span> <strong>${formatCurrency(value)}</strong>`;
                breakdownList.appendChild(li);
            }
        });
        if (breakdownList.innerHTML === '') {
            breakdownList.innerHTML = '<p class="text-white-50">You do not own any stocks.</p>';
        }
    }

    // --- Handles the buying and selling of stocks ---
    function handleStockTrade(stockId, type) {
        const qtyInput = document.getElementById(`qty-${stockId}`);
        const quantity = parseInt(qtyInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            queueNotification('Trade Error', 'Please enter a valid quantity.');
            processNotificationQueue();
            return;
        }

        const stock = STOCKS[stockId];
        const cost = stock.price * quantity;

        if (type === 'buy') {
            if (gameState.money >= cost) {
                gameState.money -= cost;
                gameState.portfolio[stockId].shares += quantity;
            } else {
                queueNotification('Trade Error', 'You do not have enough money for this purchase.');
            }
        } else if (type === 'sell') {
            if (gameState.portfolio[stockId].shares >= quantity) {
                gameState.money += cost;
                gameState.portfolio[stockId].shares -= quantity;
            } else {
                queueNotification('Trade Error', "You don't own that many shares to sell.");
            }
        }
        
        checkQuests();
        processNotificationQueue();
        qtyInput.value = '';
        updateUI();
        populateInvestmentModal();
    }

    // --- Updates stock prices based on risk, trends, patterns, and economy ---
    function updateStockPrices() {
        const volatility = { low: 0.03, medium: 0.07, high: 0.15 };
        const patternChance = 0.08; 

        Object.entries(STOCKS).forEach(([id, stock]) => {
            let changePercent = 0;

            if (stock.pattern !== 'none') {
                const pattern = STOCK_PATTERNS[stock.pattern];
                changePercent = pattern.getPriceChange(stock.patternStep);
                stock.patternStep++;
                
                if (stock.patternStep >= pattern.duration) {
                    stock.pattern = 'none';
                    stock.patternStep = 0;
                }
            } 
            else if (Math.random() < patternChance) {
                const availablePatterns = Object.keys(STOCK_PATTERNS);
                stock.pattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
                stock.patternStep = 0;
                changePercent = STOCK_PATTERNS[stock.pattern].getPriceChange(stock.patternStep);
                stock.patternStep++;
            } 
            else {
                if (Math.random() < 0.1) { 
                    stock.trend = (Math.random() - 0.5) * 0.1;
                }
                const randomVolatility = (Math.random() * 2 - 1) * volatility[stock.risk];
                changePercent = stock.trend + randomVolatility;
            }

            if (gameState.economy === 'boom') {
                changePercent += 0.02;
            } else if (gameState.economy === 'recession') {
                changePercent -= 0.015;
            }

            stock.price *= (1 + changePercent);
            stock.price = Math.max(0.5, stock.price);
            stock.history.push(stock.price);
             if (stock.history.length > 60) {
                stock.history.shift();
            }
        });
    }
    
    // --- Displays the detailed price history chart for a selected stock ---
    function showStockDetailChart(stockId) {
        const stock = STOCKS[stockId];
        const canvas = document.getElementById('stock-detail-chart');
        
        if (stockDetailChart) {
            stockDetailChart.destroy();
        }

        const history = stock.history;
        const labels = Array.from({length: history.length}, (_, i) => {
            const monthsAgo = history.length - 1 - i;
            if (monthsAgo === 0) return 'Current';
            return `${monthsAgo}m ago`;
        }).reverse();
        
        const title = stock.pattern !== 'none' 
            ? `${stock.name} - History (Analysts see a ${stock.pattern.replace(/_/g, ' ')} forming)`
            : `${stock.name} - Price History`;

        document.getElementById('stock-detail-modal-title').innerText = title;

        stockDetailChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: history,
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    fill: true,
                    tension: 0.2,
                    pointRadius: 2,
                }]
            },
            options: {
                 responsive: true,
                 maintainAspectRatio: true,
                 plugins: { 
                    legend: { display: false },
                    zoom: { 
                        pan: { enabled: true, mode: 'x' },
                        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
                    }
                 },
                 scales: {
                    y: { ticks: { color: '#e7ecef' }, grid: { color: 'rgba(231, 236, 239, 0.1)' } },
                    x: { 
                        ticks: { color: '#e7ecef', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }, 
                        grid: { color: 'rgba(231, 236, 239, 0.1)' },
                     }
                 }
            }
        });
        
        stockDetailModal.show();
    }
    
    // --- Initializes the main financial chart for net cash flow ---
    function initChart() {
        const ctx = document.getElementById('financial-chart').getContext('2d');
        financialChart = new Chart(ctx, {
            type: 'line',
            data: { 
                labels: [], 
                datasets: [ 
                    { 
                        label: 'Monthly Net Flow',
                        borderColor: '#e7ecef',
                        backgroundColor: 'rgba(32, 201, 151, 0.1)',
                        fill: true,
                        tension: 0.2,
                        pointBackgroundColor: (context) => {
                            const value = context.dataset.data[context.dataIndex];
                            return value < 0 ? '#e76f51' : '#2a9d8f';
                        },
                        pointBorderColor: (context) => {
                            const value = context.dataset.data[context.dataIndex];
                            return value < 0 ? '#e76f51' : '#2a9d8f';
                        },
                        pointRadius: 4
                    } 
                ] 
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        ticks: { color: '#e7ecef' }, 
                        grid: { color: 'rgba(231, 236, 239, 0.1)' },
                        afterBuildTicks: axis => axis.ticks.push({value: 0, major: true})
                    },
                    x: { 
                        ticks: { color: '#e7ecef' }, 
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // =========================================================================
    // ||                         EVENT LISTENERS                             ||
    // =========================================================================

    // --- Adds all necessary event listeners for the menu screen ---
    function addMenuEventListeners() {
        let selectedTier = null, selectedSchoolName = null;
        document.querySelectorAll('.tier-card').forEach(card => card.addEventListener('click', (e) => {
            document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            document.querySelectorAll('.school-select').forEach(s => s.selectedIndex = 0);
            confirmSetupBtn.disabled = true;
        }));
        document.querySelectorAll('.school-select').forEach(select => select.addEventListener('change', (e) => {
            if (e.target.selectedIndex > 0) {
                selectedSchoolName = e.target.value;
                selectedTier = e.target.dataset.tier;
                confirmSetupBtn.disabled = false;
            }
        }));
        confirmSetupBtn.onclick = () => {
            if (selectedSchoolName && selectedTier) initGame(selectedSchoolName, selectedTier);
        };
        document.querySelectorAll('.collapse').forEach(el => {
            el.addEventListener('show.bs.collapse', () => document.querySelectorAll('.tier-card').forEach(card => card.classList.add('animating')));
            el.addEventListener('hidden.bs.collapse', () => document.querySelectorAll('.tier-card').forEach(card => card.classList.remove('animating')));
            el.addEventListener('shown.bs.collapse', () => document.querySelectorAll('.tier-card').forEach(card => card.classList.remove('animating')));
        });
    }

    // --- Draws a small example chart for a given stock pattern ---
    function drawPatternChart(canvasId, patternName) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        const patterns = {
            double_bottom: [80, 40, 65, 40, 80, 95],
            cup_and_handle: [80, 50, 40, 45, 80, 70, 75, 95],
            pennant: [40, 85, 80, 82, 78, 95],
            double_top: [40, 80, 55, 80, 40, 25],
            head_and_shoulders: [40, 60, 50, 80, 50, 65, 55, 30],
            flag: [30, 80, 75, 80, 70, 75, 65, 85],
            wedge: [80, 60, 70, 55, 60, 50, 75],
            ascending_triangle: [40, 70, 50, 70, 60, 70, 85],
            descending_triangle: [80, 40, 70, 40, 60, 40, 25],
            triangle: [50, 70, 55, 65, 60, 80]
        };

        const data = patterns[patternName] || [];
        if (data.length === 0) return;

        ctx.clearRect(0, 0, w, h);
        const isBullish = ['double_bottom', 'cup_and_handle', 'pennant', 'flag', 'ascending_triangle', 'wedge'].includes(patternName);
        ctx.strokeStyle = isBullish ? '#2a9d8f' : '#e76f51';
        ctx.lineWidth = 3;
        
        const padding = 15;
        const range = Math.max(...data) - Math.min(...data);
        const y_start = Math.min(...data) - range * 0.1;
        const y_range = range * 1.2;

        const getX = (i) => padding + i * (w - 2 * padding) / (data.length - 1);
        const getY = (val) => h - padding - ((val - y_start) / y_range) * (h - 2 * padding);

        ctx.beginPath();
        ctx.moveTo(getX(0), getY(data[0]));
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(getX(i), getY(data[i]));
        }
        ctx.stroke();
    }

    // --- Shows the lesson modal with content for the selected topic ---
    function showLesson(topic) {
        const content = LESSON_CONTENT[topic];
        if (content) {
            lessonModalTitle.innerText = content.title;
            lessonModalBody.innerHTML = content.text;
            
            if (topic === 'investing') {
                setTimeout(() => {
                    drawPatternChart('pattern-double_bottom', 'double_bottom');
                    drawPatternChart('pattern-cup_and_handle', 'cup_and_handle');
                    drawPatternChart('pattern-pennant', 'pennant');
                    drawPatternChart('pattern-flag', 'flag');
                    drawPatternChart('pattern-ascending_triangle', 'ascending_triangle');
                    drawPatternChart('pattern-wedge', 'wedge');
                    drawPatternChart('pattern-head_and_shoulders', 'head_and_shoulders');
                    drawPatternChart('pattern-double_top', 'double_top');
                    drawPatternChart('pattern-descending_triangle', 'descending_triangle');
                    drawPatternChart('pattern-triangle', 'triangle');
                }, 100);
            }
            lessonModal.show();
        }
    }

    // =========================================================================
    // ||                         APP INITIALIZATION                          ||
    // =========================================================================

    // --- Initializes all Bootstrap modals ---
    educationModal = new bootstrap.Modal(document.getElementById('education-modal'));
    shopModal = new bootstrap.Modal(document.getElementById('shop-modal'));
    investModal = new bootstrap.Modal(document.getElementById('invest-modal'));
    notificationModal = new bootstrap.Modal(document.getElementById('notification-modal'));
    stockDetailModal = new bootstrap.Modal(document.getElementById('stock-detail-modal'));
    lessonModal = new bootstrap.Modal(document.getElementById('lesson-modal'));

    // --- Sets up global event listeners for modals and dynamic content ---
    document.getElementById('notification-modal').addEventListener('hidden.bs.modal', processNotificationQueue);
    document.getElementById('shop-modal').addEventListener('show.bs.modal', populateShopModal);
    document.getElementById('invest-modal').addEventListener('show.bs.modal', populateInvestmentModal);
    document.getElementById('education-modal').addEventListener('show.bs.modal', setupEducationModal);

    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('learn-more-icon')) {
            e.stopPropagation();
            showLesson(e.target.dataset.topic);
        }
    });

    // --- Attaches listeners to primary action buttons ---
    simulateMonthBtn.addEventListener('click', simulateMonth);
    autoAllocateBtn.addEventListener('click', autoAllocateBudget);
    
    // --- Starts the application by setting up the menu screen ---
    setupMenu();
});