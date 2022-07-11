/*
*************************************************************************************************
    jQUERY: ERROR FUNCTION   
*************************************************************************************************

    jQuery is essential to run thIS game. I decided to inform the user of this because occasionally jQuery can fail to load even with the correct scripts available. 

    SweetAlert.js (swal) should not be used as an alert here: in the event that the client's internet is not connected, swal won't run either and therefore the function will fail to alert.
*/

window.onload = () => {
    if (!window.jQuery) {
        alert("jQuery Not Loaded \n\njQuery is essential for this app to run. Please refresh the page as it is likely that the server was down or internet was unavailable.");
    }
}

/*
*************************************************************************************************
    ES6 SINGLE-LINE KEY FUNCTIONS   
*************************************************************************************************
*/

// Random Number Generator: set range for use when defining all nation objects (stats) etc.

const RNG = (min, max) => Math.floor(Math.random() * (max - min) + min);

// Return a random number between a specified input range

probability = (n => Math.random() < n);

// Function that more easily deals with the adding of totals in the game

sum = (array => array.reduce((total, currentValue) => total + currentValue, 0));

/*
*************************************************************************************************
    CLEAR COMMAND
*************************************************************************************************

    Clear previous commands so that only the last button clicked (function) will run. The difference between use when clicking the button is that the game will not ask the user if it wants to run the function again, unless the corresponding button is again clicked.
    The 'conscription' command must be exempt - otherwise, clicking on an alternate command button whilst conscription is active will cancel the conscription function - which relies on the its command method being truthy in order to run.
*/

clearPrevious = () => {

    for (const command in commands) {
        if (command === "conscription") continue;
        commands[command] = false;
    }
}


/*
*************************************************************************************************
    INTRO: RENDERS THE GAME'S INTRODUCTION
*************************************************************************************************

    The 'intro' function handles the darkening of the screen via an overlay with diminishing opacity. The overlay is displayed and a CSS class handles the animation / effect. Following this, the story text will scroll and the intro track will play. I'm quite proud of the introduction and music choice - it gives the game a more polished feel and introduces an ominous yet adrenaline-fuelled atmosphere.
*/

intro = () => {
    $(".title-overlay").addClass("displayBlock");
    introTrack.play();
}

/*
*************************************************************************************************
    GAME TIME: HOW SHOULD IT ELAPSE?   
*************************************************************************************************

    Time in this game is absolutely one of the central pillars of how TOW works. I wanted time to determine when bases were built, when armies arrive...How should time pass in a game? It was an interesting question that led me to remember my fond memories of X-COM: Enemy Unknown, the inspiration behind my game time object - specifically the 'geoscape'. Time in this game passes with some similarity to real life, with periods measured in daily, weekly, monthly and yearly intervals. To make sure that the measurement of an individual calendar month is as accurate as possible, the day count is initiated as a float (see globals). This is so that I can bolt on an additional 30.41 onto the day count when checking if a month has elapsed. 
    
    However, what if a player didn't want to wait for a certain period of time whilst waiting for their weapons to be delivered, for instance? In response, I programmed a 'fast forward' functionality to the game that allows the user to skip ahead, one day at a time. To start, a day passes in one second whilst in the testing phase, but may be increased to 30 secs or so by the time I start to release a beta.
    
    If we divide the number of days in a year (365) by the number of months in a year (12), the number is 30.41 - the average length of a month. Hence, after 30 days, the player will be subject to a monthly report, with their unit maintainance and other upkeeps requiring expenditure.

    The user agent can see what day, week, month or year it is. All of them are set as variables, all of which initially require rounding up (not down) with Math.ceil. If not rounded up, the functions use this code for carrying out other operations will produce bugs. Division is used to accurately measure how long each period is (ie, 7 days in a week = day / 7). I then use jQuery to insert the periods into the DOM.

    Two setIntervals are operating in this function. The first displays the passage of time by incrementing the days (therefore the weeks, months and years, eventually) every 5 minutes. This is not a real-time strategy game: days pass every 5 mins. The final setInterval tracks when over 30 days have passed (an average month) and they then 'monthlyActions' is called, a parent / carrier function that contains other functions containing various scripts, such as billing the player for the upkeep of any bases that they own etc.

    Finally, if the 'monthlyInterval' variable is not reset after a month has elapsed, the monthly actions will run only once at the end of the first 30 days and never again. Setting this again is my way of ensuring that the script sees runtime every 30.4 days - every month.
*/

// jQuery inserts the vars of day, week and month into the DOM for visual display

addTimeDOM = (week, month) => {
    $("#day").text("DAY: " + parseInt(day++));
    $("#week").text("WEEK: " + week);
    $("#month").text("MONTH: " + month);
}

// Check when the monthly or yearly points have been reached, increment year and run actions

milestones = (monthlyInterval, yearlyInterval, currentYear) => {

    if (day >= monthlyInterval) {
        monthlyActions();
    } else if (day >= yearlyInterval) {
        currentYear++;
        $("#year").text("YEAR: " + currentYear);
        yearlyActions();
    }
}

// Main time object: disabled if no jQuery or game start, preventing repeated errors 

runGameTime = () => {

    if (!window.jQuery) return;
    let monthlyInterval = day + 30.41;
    let yearlyInterval = day + 365;
    let currentYear = 2022;

    setInterval(() => {

        if (!gameState.gameStarted) return;
        let week = Math.ceil(day / 7);
        let month = Math.ceil(week / 4);
        dailyActions();
        addTimeDOM(week, month);
        checkConscription(monthlyInterval);
        milestones(monthlyInterval, yearlyInterval, currentYear);

        if (day >= monthlyInterval) {
            monthlyInterval = day + 30.41;
        } else if (day >= yearlyInterval) {
            yearlyInterval = day + 365;
        }
    }, 5000);
}

// If player has activated conscription, and run conscription daily for one month 

checkConscription = (monthlyInterval) => {
    if (commands.conscription) conscriptTroops();
}

// Skip forward in time via btn click (1 day per click). Monitor for any conscription

fastForward = (monthlyInterval) => {
    $("#day").text("DAY: " + parseInt(day++));
    $("#week").text("WEEK: " + Math.ceil(day / 7));
    checkConscription(monthlyInterval);
}

/*
*************************************************************************************************
    MILESTONE FUNCTIONS   
*************************************************************************************************
    
    Each day, month and year in TOW sees certain events happening, such as a player gaining benefits for any treaties they have signed and any resources acquired from defeated nations.
    
    However, there may be drawbacks to the milestone events - if any hostages are held by other nations, a player's approval rating will drop further.
*/

monthlyActions = () => {
    militaryMaintenance();
    resourceIncome();
    agriculturalBonus();
    oilBonus();
    intelBonus();
    lowerApprovalHostages();
    baseExpenditure();
    expenditureReport();
}

dailyActions = () => {
    militaryOilExpenditure();
    generalResourceExpenditure();
}

yearlyActions = () => {
    defenceBudgetGDP();
}

/*
*************************************************************************************************
   BUILDING & TRAINING INTERFACE: FUNCTIONS 
*************************************************************************************************

    Base facilities and construction are represented as a 'Base' class, which ultimately keeps track of what facilities are built and allows other functions of the game to act on that premise - for instance, if a player has structures, those must be maintained and a cost for their upkeep will be deducted at the end of each month.

   'constructionManager' effectively adds any constructed building to the new 'Buildings' instance derived from the 'Base' class. This Base object then tracks what has been constructed and ultimately what can be built.
   
   This function, in tandem with its other internal functions, takes 5 parameters:
   
   'structureKey' is the key in the Base class.
   'structureValue' is the value in the Base class.
   'daysToBuild' is the time (current day + additional days) to build the structure.
   'cost' is how much a building needs to complete.
   
   When a building is clicked on to be built, those values are passed in. Firstly, the structure type (structureValue) is used along with its cost and build time to display what building the player has clicked on to confirm their choice. Secondly, if the player confirms, 'confirmPurchase' takes the structure type and disables the respective button to prevent it from being used again. The cost of the building is then deducted from the player's defence budget.
   
   Finally, a setInterval tracks the build time by checking the current day against the day it is to be completed. Once they match, construction must complete. 'confirmConstruction' then sets the stuctureKey as the structureValue, before adding it into the object value slot - it is then defined as 'airbase' or 'silo', and thus it is constructed. 
*/

confirmConstruction = (structureKey, structureValue) => {

    swal({
        title: `Construction Complete: ${structureValue}`,
        icon: "info"
    });

    constructionComplete.play();
    structureKey = structureValue;
    playerBase[structureKey] = structureKey;
}

constructionManager = (structureKey, structureValue, daysToBuild, cost) => {

    const structureCost = cost;
    const buildTime = daysToBuild;
    swal(`Construct ${structureValue}?`,
        `ETA: ${buildTime} days 
        Cost: $${cost}`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            playerNation.resources.defenceBudget -= cost;
            confirmPurchase(structureValue);
            swal("Building");
            const handleInterval = setInterval(() => {
                if (day === buildTime) {
                    clearInterval(handleInterval);
                    confirmConstruction(structureKey, structureValue);
                }
            }, 0);
        }
    });
}

// Pass the structure value after building to disable respective button and show 'purchased' 

confirmPurchase = (structureValue) => {

    switch (structureValue) {

        case "airbase":
            $("#airbase").text("Purchased").attr("disabled", "true");
            break;

        case "intelOps":
            $("#intel-ops").text("Purchased").attr("disabled", "true");
            break;

        case "barracks":
            $("#barracks").text("Purchased").attr("disabled", "true");
            break;

        case "navalYard":
            $("#naval-yard").text("Purchased").attr("disabled", "true");
            break;

        case "warFactory":
            $("#war-factory").text("Purchased").attr("disabled", "true");
            break;

        case "launchPad":
            $("#launch-pad").text("Purchased").attr("disabled", "true");
            break;

        case "researchCentre":
            $("#research-centre").text("Purchased").attr("disabled", "true");
            break;

        case "missileSilo":
            $("#missile-silo").text("Purchased").attr("disabled", "true");
            break;

        default:
            console.log("No matching cases.");
    }
}

// If a player tries to build or train a unit requiring a building they don't have, alert them

playerHasBuilding = (building, text) => {

    if (!playerBase[building]) {
        swal({
            title: `Facility Required: ${text}`,
            icon: "warning"
        });
        return false;
    }

    return true;
}

// Alert player to insufficient funds while showing how much they need for a certain unit 

checkFunds = (unitCost) => {

    if (playerNation.resources.defenceBudget < unitCost) {
        swal({
            title: "Insufficient Funds",
            text: `Funds available: $${playerNation.resources.defenceBudget}. 
            Funds required: $${unitCost}.`,
            icon: "error"
        });
        return true;
    }

    return false;
}

// Do not allow a player to pass in 0 as an amount of units to be built / trained

disallowZeroUnits = (quantity) => {

    if (quantity <= 0) {
        swal({
            title: "Cannot Train or Build Zero Units",
            icon: "error"
        });
        return true;
    }

    return false;
}

// Show "Building" alert if unit is a structure, "Training" if a unit

alertUnitBuilding = (unitType) => {

    if (unitType === "nuclearWeapons" ||
        unitType === "satellites" ||
        unitType === "missileShield") {
        swal("Building");
    } else {
        swal("Training");
    }
}

// Play different sound depending on whether unit is a structure or unit

alertUnitReady = (unitType, numberOfUnits) => {

    if (unitType === "nuclearWeapons" ||
        unitType === "satellites" ||
        unitType === "missileShield") {
        constructionComplete.play();
    } else {
        unitReady.play();
    }

    swal({
        title: "Units Ready",
        text: `${numberOfUnits} ${unitType} have entered service, commander.`,
        icon: "info"
    });
}

/*
*************************************************************************************************
   UNIT TRAINING / BUILDING
*************************************************************************************************
    
    Similar to the 'constructionManager' above that deals with base building, 'processUnitTraining' has one key difference: the amount of time required for a unit to be ready is directly proportionate to how many units are ordered.
    
    In TOW, units must be delivered as a batch. If you order 100 soldiers, for instance, you must wait until all 100 are trained until they are delivered.
    
    As a rough scale, 10 infantry would take 10 days to build, while 1000 infantry would take 100 days to build. However, a control flow increases the time factor to 0.5 for both nuclear weapons and the missile shield - this means the player needs to consider them as an option well in advance, as these take longer to build. Thus, 10 nukes will take around 100 days to complete.
    
    'disableSatellites' ensures that only one satellite can ever be constructed, as the only satellite can be used multiple times. However, there is both a cost to its use each time and a monthly upkeep, so it does not come cheap.
    
    Finally, once all checks are complete, 'addUnits' increments the respective nation stats by the amount the player originally ordered, and subsequently deducting their cost per item.
*/

addUnits = (playerUnits, unitType, numberOfUnits, unitCost) => {
    playerUnits[unitType] += numberOfUnits;
    playerNation.resources.defenceBudget -= unitCost;
}

disableSatellites = (unitType) => {
    if (unitType === "satellites") {
        $("#launch-satellite").text("Satellite Orbiting").attr("disabled", "true");
    }
}

// Are units affordable? Is there more than zero selected for building / training?

processUnitTraining = (quantity, cost, playerUnits, unitType) => {

    const numberOfUnits = quantity;
    const unitCost = numberOfUnits * cost;
    if (checkFunds(unitCost)) return;
    if (disallowZeroUnits(quantity)) return;

    let timeFactor;
    
    if (unitType === "nuclearWeapons" || unitType === "missileShield") {
        timeFactor = 10;
    } else {
        timeFactor = 0.10;
    }
    
    const unitCompletionTime = Math.trunc(day + (timeFactor * quantity));

    swal(`${quantity} ${unitType}: $${unitCost}?`,
        `ETA: Day ${unitCompletionTime}`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            alertUnitBuilding(unitType);
            const handleInterval = setInterval(() => {
                if (day >= unitCompletionTime) {
                    clearInterval(handleInterval);
                    alertUnitReady(unitType, numberOfUnits);
                    disableSatellites(unitType);
                    addUnits(playerUnits, unitType, numberOfUnits, unitCost);
                    if (unitType === "researchers") displayResearcherInfo();
                }
            }, 0);
        }
    });
}

/*
*************************************************************************************************
   UPKEEP & EXPENDITURE: MAINTENANCE COSTS FOR PLAYER ASSETS 
*************************************************************************************************    
    In TOW, a player incurs expenditures on items such as their military units and oil consumption. These are deducted on either a daily or monthly basis.
*/

/*
    DAILY EXPENDITURE: functions run daily inside 'dailyActions' function.
    
   The variable 'dailyOilProduction' tracks the original starting oil of the player's nation. This is in turn stored as 'originalDailyOilProduction' to track its starting value, minus the oil consumption rate of the nation.
   
   The actual amount of oil that a player has ('oilProduction'), therefore, is equal to original totals minus daily consumption. 
*/

generalResourceExpenditure = () => {
    dailyOilProduction += originalDailyOilProduction - playerNation.resources.oilConsumption;
    playerNation.resources.oilProduction = dailyOilProduction;
}

/*
   Military units except for infantry consume oil on a daily basis, and per unit. However, if units are on a campaign (deployed), then this increases by 20%. Oil production (current supply) is then reduced by the the sum of oil the oil being consumed, calculated by the 'sum' function, which is array.reduce.
*/

militaryOilExpenditure = () => {

    const oilExpenditure = [
    playerNation.militaryUnits.air * 1000,
    playerNation.militaryUnits.naval * 1500,
    playerNation.militaryUnits.tanks * 2000
];

    if (gameState.unitsOnCampaign) {
        oilExpenditure.forEach((unit) => {
            unit += (20 / 100) * unit;
        });
    }
    playerNation.resources.oilProduction -= Math.trunc(sum(oilExpenditure));
}

/*
    MONTHLY EXPENDITURE
    
    Military unit upkeep is entered into an array where each unit is multiplied by a cost. 'nuclearExpenditure' tracks whether a player has a nuclear programme (has any nuclear weapons). If so, an additional cost is pushed into the 'unitsToMaintain' array for totalling up, before an alert lets the player know what that monthly cost is.
*/

militaryMaintenance = () => {

    const unitsToMaintain = [
    playerNation.militaryUnits.air * 10000,
    playerNation.militaryUnits.infantry * 25000,
    playerNation.militaryUnits.naval * 1500000,
    playerNation.militaryUnits.tanks * 20000,
    playerNation.surveillance.fieldAgents * 30000,
    playerNation.surveillance.satellites * 125000,
    playerNation.specialWeapons.nuclearWeapons * 2916666666,
    playerNation.researchers * 40000,
    playerNation.specialWeapons.nuclearWeapons * 20000
];
    nuclearExpenditure(unitsToMaintain);
    playerNation.resources.defenceBudget -= sum(unitsToMaintain);
    alert(`Monthly Report 
    \nMilitary Expenditure (including any Nuclear Programmes): $${sum(unitsToMaintain)}`);
}

/*
    Iterate through the player's base and structure maintenance object, deducting costs for any buildings that exist (if base buidings are not undefined, deduct the respective cost for that building for that month).
*/

baseExpenditure = () => {

    baseMaintenanceTotals = [];

    for (const value in playerBase) {
        if (playerBase[value] !== undefined) {
            playerNation.resources.defenceBudget -= structureMaintenance[value];
            alert(`${value} Constructed: $${structureMaintenance[value]}`);
            baseMaintenanceTotals.push(structureMaintenance[value]);
        }
    }

    alert(`Monthly Base Maintenance Expenditure: - $${sum(baseMaintenanceTotals)}`);
}

// Alert the player to current GDP and defence budgets each month

expenditureReport = () => {

    swal({
        title: "Monthly Expenditure Report",
        text: `Current GDP: $${playerNation.gdp},
        Current Defence Budget: $${playerNation.resources.defenceBudget}`,
        icon: "info"
    });
}

// Once the player enters the nuclear arms race, they must pay for it...

nuclearExpenditure = (unitsToMaintain) => {
    if (playerNation.specialWeapons.nuclearWeapons) unitsToMaintain.push(300);
}

/*
***************************************************************************************************
    INCOME: SOURCES OF REVENUE 
***************************************************************************************************

    Each year, a player receives their GDP and defence budget allocation according to the average GDP of that nation each year. In short, they receive what they started with again, effectively replenishing the nation's coffers. Isn't that nice?
    
    Perhaps if the player wasn't at risk of becoming annihilated in a nuclear firestorm, it would be. However, there are also multiple sources of additional revenue in TOW for those players who may not survive the year.
    
    Each nation conquered in TOW provides monthly revenue due to the player occupying that territory. Furthermore, the player can also sell excess oil for cash, and even enter the lucrative arms trade, building small arms and selling them off to the global marketplace. Guns really can put food on the table.
*/

// Tally up the arrays holding player's resources from other nations & award monthly

resourceIncome = () => {
    playerNation.resources.defenceBudget += Math.trunc(sum(defeatedNationGDP));
    playerNation.resources.oilProduction += Math.trunc(sum(defeatedNationOil));
}

// Reassign original defence budgets and GDP at the end of the year

defenceBudgetGDP = () => {
    playerNation.resources.defenceBudget += yearlyDefenceBudget;
    playerNation.gdp += yearlyGDP;
    swal("Yearly GDP and Defence Budget Allocated",
        `GDP: $${playerNation.gdp} 
    Defence Budget: $${playerNation.resources.defenceBudget}`);
}


// OIL & WEAPON SALES

// Check player has sufficient oil to sell

checkOilBarrels = (numberOfBarrels) => {

    if (playerNation.resources.oilProduction < numberOfBarrels || playerNation.resources.oilProduction <= 0) {
        swal({
            title: "Insufficient Oil",
            text: `Oil remaining: ${playerNation.resources.oilProduction} barrels.`,
            icon: "warning"
        });
        return false;
    }

    return true;
}

// Confirm oil sale, deducting the amount of oil and adding the selling price to defence budget

confirmOilSale = (numberOfBarrels, oilSalePrice) => {

    sale.play();
    playerNation.resources.oilProduction -= numberOfBarrels;
    playerNation.resources.defenceBudget += oilSalePrice;

    swal({
        title: "Sale Successful",
        text: `Oil remaining: ${playerNation.resources.oilProduction} barrels.`,
        icon: "info"
    });
}

/*
    First, we grab the value of the input which is how much the player wishes to sell and store the value of each barrel. If there is sufficient oil to sell, the player can choose whether to make the sale or cancel it. If confirmed, ''confirmOilSale' will be called and the transaction completed.
*/

sellOil = () => {

    const numberOfBarrels = parseInt($("#oil").val());
    const oilSalePrice = numberOfBarrels * 75;
    if (!checkOilBarrels(numberOfBarrels)) return;

    swal("Sell Oil", `Sell ${numberOfBarrels} oil for $${oilSalePrice}?`, {
        buttons: ["Cancel", "Confirm"]
    }).then((value) => {
        if (value) {
            confirmOilSale(numberOfBarrels, oilSalePrice);
        }
    });
}

// Ensure that the player has sufficient weapons to sell

checkWeaponCount = (numberOfWeapons) => {

    if (playerNation.resources.weaponStocks < numberOfWeapons ||
        playerNation.resources.weaponStocks <= 0) {
        swal({
            title: "Insufficient Weapons",
            text: `Not enough weapons. Weapons remaining: ${playerNation.resources.weaponStocks}.`,
            icon: "warning"
        });
        return false;
    }

    return true;
}

// Deduct the amount of weapons to sell from stocks and add their value to the defence budget

confirmWeaponSale = (numberOfWeapons, weaponSalePrice) => {

    sale.play();
    playerNation.resources.weaponStocks -= numberOfWeapons;
    playerNation.resources.defenceBudget += weaponSalePrice;

    swal({
        title: "Sale Successful",
        text: `Weapons remaining: ${playerNation.resources.weaponStocks}.`,
        icon: "info"
    });
}

/*
    As in the oil sale function, we store the number of weapons the player wants to sell from the input element. The price per unit is also stored. If the player has enough weapons to make the sale, they are then given an option to confirm or cancel, with 'confirm' finalising the sale.
*/

sellWeapons = () => {

    const numberOfWeapons = parseInt($("#weapons-to-sell").val());
    const weaponSalePrice = numberOfWeapons * 1400;
    if (!checkWeaponCount(numberOfWeapons)) return;

    swal("Sell Weapons", `Sell ${numberOfWeapons} weapons for $${weaponSalePrice}?`, {
        buttons: ["Cancel", "Confirm"]
    }).then((value) => {
        if (value) {
            confirmWeaponSale(numberOfWeapons, weaponSalePrice);
        }
    });
}

// WEAPON MANUFACTURING

// Increase the amount of weapons in stock by the amount manufactured

addWeapons = (numberOfWeapons) => {

    constructionComplete.play();
    playerNation.resources.weaponStocks += numberOfWeapons;

    swal({
        title: "Manufacture Complete",
        text: `Weapons in stock: ${playerNation.resources.weaponStocks}.`,
        icon: "info"
    });
}

/*
    'manufactureWeapons' handles the building of weapons by first storing the input value of how many to build, the cost per unit and even the time required for their manufacture.
    
    Manufacture time calculation: CURRENT DAY + (NUMBER OF WEAPONS / 100) * 5
    
    This adds a time factor of 5% and as an example, 5 days is required for 100 weapons ordered. So, if we are on day 5 and 100 weapons are confirmed, the player will receive them on day 10 (current day + 5 days).
    
    On confirm, a setInterval monitors when that day is reached before adding the weapons to the stocks. 
*/

manufactureWeapons = () => {

    const numberOfWeapons = parseInt($("#weapons-to-build").val());
    const costOfManufacture = numberOfWeapons * 700;
    const timeToManufacture = Math.trunc(day + (numberOfWeapons / 100) * 5);

    swal("Manufacture Weapons",
        `Manufacture ${numberOfWeapons} weapons at a cost of $${costOfManufacture}?`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            swal(`Completion Time: Day ${timeToManufacture}.`);
            const handle = setInterval(() => {
                if (day >= timeToManufacture) {
                    clearInterval(handle);
                    addWeapons(numberOfWeapons);
                }
            }, 500);
        }
    });
}

/*
***************************************************************************************************
    UPGRADES & RESEARCH
***************************************************************************************************
    
    All research requires research personnel, and the amount of researchers directly affects the speed of any projects (I know, another X-COM influence).
 
    All research in TOW is handled by multiple callbacks. There are 5 research projects available and all of them have benefits to the player's military.
    
    Research requires funds, a research center and a sufficient number of researchers to commence. The amount of time taken for research to complete depends on the amount of researchers assigned. Multiple researchers can be assigned to multiple projects simultaneously.
    
    HYPERSONIC MISSILES: Missiles fired at Mach 5. Increases air tech by 5.
    CYRE ASSAULT RIFLE: High-capacity, high-velocity assault rifles. Increases infantry skill by 5.
    RAILGUNS: Aluminium slugs propelled a light-speed. Naval tech increased by 5.
    KINETIC ARMOUR: State-of-the-art armour that deflects rounds. Armour tech increased by 5.
    PARTICLE CANNON: Precision orbital kinetic-strike weapon. Allows cannon use in sidebar.
*/

// Return an array with the value of research costs and time to complete 

setResearchAndCostFactor = (costOfResearch, timeFactor) => {
    return [costOfResearch, timeFactor];
}

/*
    First, we capture the value of the input element that determines the amount of researchers to assign to a project, as well as the value (name) of the project from the select dropdown.
    
    If the player has enough researchers available that are not assigned to various other projects, and the appropriate amount of researchers that have been hired, the project can commence.
    
    It is then time to set the cost of the project and the length of time required to complete it.
    Utilising the value of the research project, a control flow uses the values of the 'setResearchAndCostFactor' and applies them to the returned array of the 'costOfResearch' and 'timeFactor', and thus they are set.
    
    The time to complete the project is calculated as follows:
    
    TIME TO COMPLETE PROJECT = (DAY + (TIMEFACTOR / RESEARCHER ALLOCATION))
    
    Effectively, the current day is added to to make a future day when the project is completed.
    In short, the amount of researchers allocated to a project directly affects the speed of its completion. Another callback is then invoked to allocate the researchers and track its completion.
*/

beginResearch = () => {

    const researcherAllocation = parseInt($("#researcher-allocation").val());
    let researchProject = $("#research-options").val();

    if (!checkResearchCapacity(researcherAllocation) ||
        preventNullValues(researchProject) ||
        checkResearchersAvailable(researcherAllocation, researchersAvailable)) {
        return;
    }

    let costOfResearch, timeFactor;

    if (researchProject === "hypersonicMissiles") {
        [costOfResearch, timeFactor] = setResearchAndCostFactor(50, 400);
    } else if (researchProject === "cyreAssaultRifle") {
        [costOfResearch, timeFactor] = setResearchAndCostFactor(1000, 400);
    } else if (researchProject === "railguns") {
        [costOfResearch, timeFactor] = setResearchAndCostFactor(2000, 800);
    } else if (researchProject === "kineticArmour") {
        [costOfResearch, timeFactor] = setResearchAndCostFactor(2000, 400);
    } else if (researchProject === "particleCannon") {
        [costOfResearch, timeFactor] = setResearchAndCostFactor(2000, 10000);
    }

    let timeToCompleteProject = Math.trunc(day + (timeFactor / researcherAllocation));

    researchProjectStart(researcherAllocation, researchProject, costOfResearch, timeToCompleteProject);
}

// Ensure research facility is built before any research is allowed

researchFacilityAvailability = () => {

    if (!playerBase.researchCentre) {
        swal({
            title: "No Research Centre",
            text: "Research Facility Required for Upgrades",
            icon: "warning"
        });
        return false;
    }

    return true;
}

/*
   UPGRADING UNITS
   
   This is handled by first checking that there is enough money and a research facility is available. See UI script for specific details.
   
   It contains 4 parameters - the upgrade cost, the unit to upgrade, the rating that must be increased and the value of the increase, which is an integer. Once a button is clicked the appropriate arguments are fed in, and the cost of the upgrade is deducted whilst the respective rating is increased.
*/

upgradeUnits = (costOfUpgrade, unitToUpgrade, ratingToIncrease, upgradeValue) => {

    const cost = costOfUpgrade;
    const upgradeUnit = unitToUpgrade;
    const ratingIncrease = ratingToIncrease;

    swal({
        title: "Upgrade Successful",
        text: `Upgrading ${unitToUpgrade} for ${costOfUpgrade}`,
        icon: "info"
    });

    upgradeComplete.play();
    playerNation.resources.defenceBudget -= costOfUpgrade;
    playerNation.unitTechAndSkillRating[ratingToIncrease] += upgradeValue;
}

// These functions check that there are researchers hired, and whether any are available

checkResearchCapacity = (researcherAllocation) => {

    if (!playerNation.researchers || researcherAllocation > playerNation.researchers) {
        swal({
            title: "Not Enough Researchers",
            text: `Researchers available: ${playerNation.researchers}`,
            icon: "warning"
        });
        return false;
    }

    return true;
}

preventNullValues = (researchProject) => {

    if (researchProject === null) {
        return true;
    }

    return false;
}

checkResearchersAvailable = (researcherAllocation, researchersAvailable) => {

    if (researcherAllocation > researchersAvailable) {
        swal({
            title: `You have ${researchersAvailable} researchers available for projects.`,
            icon: "warning"
        });
        return true;
    }

    return false;
}

// Check what researchers are not assigned to projects by checking the total of 'assigned' array

getResearchersAvailable = () => {
    researchersAvailable = playerNation.researchers - Math.trunc(sum(researchersAssigned));
    $("#researchers-available").text(" " + researchersAvailable);
}

/*
    When the project is confirmed, we need to keep track of several important factors: the amount of researchers the player has allocated, the name of the project, its cost and the scheduled completion time.
    
    If the player confirms a project, the amount of researchers they assigned via the input element is recorded and pushed to an array. The amount of researchers allocated is then deducted and refreshed in the DOM for the player to see who is tied up and who is free. Researchers, once assigned to a project, are unavailable for the entire duration of the research length, and this must be tracked and tied with the project that they are working on.
    
    The 'assigned' object literal (see globals.js) stores the value of the researchers assigned to a given project. The cost is deducted and 'researchProjectCompletion' begins the process of research to its completion. See below.
*/

researchProjectStart = (researcherAllocation, researchProject, costOfResearch, timeToCompleteProject) => {

    swal("Begin Research", `Assign ${researcherAllocation} researchers to the ${researchProject} for $${costOfResearch}?`, {
        buttons: ["Cancel", "Confirm"]
    }).then((value) => {
        if (value) {
            researchersAssigned.push(researcherAllocation);
            getResearchersAvailable();
            $("select option[value='" + researchProject + "']").attr("disabled", true);
            assigned[researchProject] = researcherAllocation;
            swal(`Researching ${researchProject}`, `Completion: Day ${timeToCompleteProject}.`);
            playerNation.resources.defenceBudget -= costOfResearch;
            researchProjectCompletion(timeToCompleteProject, researchProject, researchProject, researcherAllocation);
        }
    });
}

// Produce an audio / visual alert of the project completion

alertProjectComplete = (researchProject) => {

    swal({
        title: `Project ${researchProject} Complete.`,
        icon: "info"
    });

    if (researchProject === "particleCannon") {
        constructionComplete.play();
    } else {
        upgradeComplete.play();
    }
}

/*
    'researchProjectCompletion' handles the outcome of research and the researcher assignment. It tracks the time to complete, the project name, the project to be unassigned (which is the SAME value as the project name when passed in as an argument), and how many researchers were assigned to the project who must now be returned to 'available' status.
    
    Once the current day matches the completion day, 'removeAssignedResearchers' works to return the assigned researchers back to the player's use, but 'getResearchersAvailable' is invoked first to refresh the current amount of researchers. This is critical to stop bugs with the amount of researchers being shown to the player in the DOM, also.
    
    The global 'researchersAvailable' tracks the total amount of researchers available to the player that have been hired but are not on projects currently. This value is incremented by the amount of researchers stored on a project: now that it is over, they are 'returned' to the player via the incrementation of this value by the amount that was originally deducted (assigned). The value then stored in the 'assigned' object literal is then deleted as it is unnecessary at this stage.
    
    'researchImpact' is responsible for handling the rating increases that a given project provides.
*/

researchProjectCompletion = (timeToCompleteProject, researchProject, projectToUnassign, researcherAllocation) => {

    const handle = setInterval(() => {
        if (day >= timeToCompleteProject) {
            clearInterval(handle);
            removeAssignedResearchers(researcherAllocation);
            alertProjectComplete(researchProject);
            researchersAvailable += assigned[projectToUnassign];
            $("#researchers-available").text(" " + researchersAvailable);
            delete assigned[projectToUnassign];
            researchImpact(researchProject);
        }
    }, 0);
}

/*
    Researchers are unassigned (returned) by matching the allocated value with one in the 'assigned' array. Once a match is found via a for loop, we grab the index of that value and remove it via the splice method. Once completed, the loop must be exited to prevent other values that also match being taken off (essentially, where the player may assign the same amount of researchers on two different projects).
*/

removeAssignedResearchers = (researcherAllocation) => {

    getResearchersAvailable();

    for (let i = 0; i < researchersAssigned.length; i++) {
        if (researcherAllocation == researchersAssigned[i]) {
            researchersAssigned.splice(i, 1);
            break;
        }
    }
}

// Check the research project completed and add the corresponding benefits to the nation object

researchImpact = (researchProject) => {

    switch (researchProject) {

        case "hypersonicMissiles":
            playerNation.unitTechAndSkillRating.airTech += 5;
            swal("Upgrade Bonus", "Air technology: + 5");
            break;

        case "cyreAssaultRifle":
            playerNation.unitTechAndSkillRating.infantrySkill += 8;
            swal("Upgrade Bonus", "Infantry skill: + 8");
            break;

        case "railguns":
            playerNation.unitTechAndSkillRating.navalTech += 7;
            swal("Upgrade Bonus", "Naval technology: + 7");
            break;

        case "kineticArmour":
            playerNation.unitTechAndSkillRating.armourTech += 6;
            swal("Upgrade Bonus", "Armour technology: + 6");
            break;

        case "particleCannon":
            $("#p-cannon-btn").toggleClass("hidden");
            swal("Particle Cannon Orbiting", "Utilize this weapon in the 'Commands' sidebar.");
            break;

        default:
            console.log("Possible error - check research functions");
    }
}

// Set the max value of researchers available in DOM as player's total researcher number

displayResearcherInfo = () => {
    $("#researcher-allocation").attr("max", playerNation.researchers);
    $("#researchers-employed").text(" " + playerNation.researchers);
    $("#researchers-available").text(" " + playerNation.researchers);
}

/*
*************************************************************************************************
    STATUS REPORT DISPLAY: SHOWING WHAT MATTERS IN TOW
*************************************************************************************************

    It is useful from a design / UI perspective to show the player the most useful information regarding the status and health of their nation's condition. The functions below must be updated constantly to ensure it keeps up with all the dynamic events in TOW.
    
    The information displayed can be accessed by clicking the 'Status' button at the top of the game page, and all information is added as a list via jQuery chaining.
*/

// The list is removed first each time the function is called to prevent multiple DOM prints

outputMainStats = () => {

    $("li").remove();
    $("#overview").append(`<li>GDP: $ ${playerNation.gdp}</li>`)
        .append(`<li>Defence Budget: $ ${playerNation.resources.defenceBudget}</li>`)
        .append(`<li>Researchers Employed: ${playerNation.researchers}</li>`)
        .append(`<li>Nations Conquered: ${nationsConqueredCode.length}</li>`)
        .append(`<li>Public Approval: ${playerNation.status.govtApprovalRating}</li>`)
        .append(`<li>Agents Imprisoned: ${nationsHoldingAgents.length}</li>`);
}

// Iterate through each value in the info array EXCEPT defence budget, as it is appended above

outputAuxStats = (info) => {

    info.forEach(item => {
        for (const value in item) {
            if (value === "defenceBudget") continue;
            $("#overview").append(`<li>${value}: ${item[value]}</li>`);
        }
    });
}

// Store all relevant stats in the 'info' array. Functions then iterate through and add to DOM

displayMainStatus = () => {

    const info = [
    playerNation.resources,
    playerNation.internationalRelations,
    playerNation.militaryUnits,
    playerNation.surveillance,
    playerNation.unitTechAndSkillRating,
    playerNation.specialWeapons
];
    outputMainStats();
    outputAuxStats(info);
}

/*
*************************************************************************************************
    WARFARE: CONVENTIONAL OR NUCLEAR - WHATEVER FLOATS YOUR BOAT!
*************************************************************************************************
 
    There are many ways to deal with other pesky nations in TOW. They need not all be overt, but this section is dedicated to the forceful removal of those who stand in your way. As such, the diplomats among you should look away now.
    
    In order to attack a nation, the player must deploy its units there first. This state is known as on 'campaign', and in this state a military will use 20% more oil per day. There are four arms in TOW: infantry, naval, air and armour. To defeat a nation, all 4 must be defeated. If any one holds out, the war is considered lost.

    Military battles are uniquely calculated to account for drastic differences in a nation's military force. The formulas below scale well, returning reasonable results whether a country has an army in the millions or the dozens. Each arm faces off against each other: air vs air, armour vs armour etc.

    Instead of a 'tech' rating, infantry possess a 'skill' attribute that helps them to sway the course of a battle. The formula ensures that both infantry skill and numbers contribute to the course of a battle, and all being equal, a difference in any of these factors will play a deciding factor in the outcome. If numbers are even, the skill of a nation's infantry will be decisive, and vice versa. If all factors are equal, control flow can decide a course of action for the player.

    PLAYER INFANTRY STRENGTH: (PLAYERS INFANTRY SKILL / 100) * PLAYER INFANTRY NUMBERS
    ENEMY INFANTRY STRENGTH: (ENEMY INFANTRY SKILL / 100) * ENEMY INFANTRY NUMBERS

    After calculating the player infantry strength and the enemy infantry strength using the above, they are subtracted from each other for each opposing nation to determine remaining infantry numbers on both sides - and therefore the course of the battle:

    TROOPS REMAING FOR PLAYER: PLAYER INFANTRY STRENGTH - ENEMY INFANTRY STRENGTH
    TROOPS REMAINING FOR THE ENEMY: ENEMY INFANTRY STRENGTH - PLAYER INFANTRY STRENGTH
    
    To win a battle in TOW, all 4 player military wings MUST have more units remaining than those on the enemy side. For instance, a player's army must have more infantry remaining than those of the enemy, and so on. If ANY military arm loses, the player is held (defeated).
*/

/* 
    CONVENTIONAL MILITARY ATTACK
    
    Attacking a region: 'region' is defined as a parameter because 'region' does not yet exist until user clicks on the map object (as mandated by the JQVMap object). It also notifies the player as to what territory they are attacking. 
    
    On confirming the attack, a control flow checks that the player has deployed to the correct region first. If so, attack commences and the player's aggression level rises. If no 'value' is present, the player is aborting the mission using the 'cancel' button (the else if condition).
*/

attackNation = (region, code, targetNation) => {

    clearPrevious();

    swal(`Attack ${region}?`, {
        buttons: ["Cancel", "Confirm"]
    }).then((value) => {
        if (value && deployedToRegion === region) {
            swal(`Commencing Attack: ${playerNation.name} is attacking the nation of ${region}`);
            playerNation.status.aggressionLevel += 5;
            war(targetNation);
            trackDefeatedNations(region, code, targetNation);
            colourDefeatedNations(code, "#AA0000");
        } else if (!value) {
            swal("Attack Aborted");
        } else {
            swal("Military Undeployed", `Units not positioned in ${region}. Please deploy forces.`);
        }
    });
}

/*
    A big challenge in developing TOW was determining how battles should be fought, their victory and defeat conditions and in particular, how casualties should be calculated. Ultimately, I decided to use a damage system adapted from RPG games such as World's End by Mezzanine Stairs.
    
    I needed to be careful about having a situation where attacks against an opponent with a strong defence do virtually no damage at all. 
     
    To avoid this, the basic calculation is as follows:
    
    PLAYER DAMAGE = PLAYER SKILL OR TECH / 100 * NUMBER OF PLAYER MILITARY UNITS
    ENEMY DAMAGE = ENEMY SKILL OR TECH / 100 * NUMBER OF ENEMY MILITARY UNITS
    
    This scales more gradually when tech or skill levels are increased and thus still allow a weaker nation to deal some damage to a nation with vastly superior military.

    'war' initiates unit battles. The 'targetNation' parameter is essential for the randomAttack function, where the AI attacks the player after a target nation is selected. 'war' calls the 'battle' function on each military arm so they all face each other. 
    
    'battle' is the function that is called inside to determine the outcome of the fight. The control flow checks whether a particular target nation military branch has lost all of its forces. If so, the 'armiesDefeated' var is incremented. If that var subsequently reaches 4 after all 4 fights, the win condition is detected and met.
*/

war = (targetNation) => {

    battle((playerNation.unitTechAndSkillRating.infantrySkill / 100) * playerNation.militaryUnits.infantry, (targetNation.unitTechAndSkillRating.infantrySkill / 100) * targetNation.militaryUnits.infantry, "infantry", "infantry", targetNation);

    battle((playerNation.unitTechAndSkillRating.airTech / 100) * playerNation.militaryUnits.air, (targetNation.unitTechAndSkillRating.airTech / 100) * targetNation.militaryUnits.air, "air", "air", targetNation);

    battle((playerNation.unitTechAndSkillRating.navalTech / 100) * playerNation.militaryUnits.naval, (targetNation.unitTechAndSkillRating.navalTech / 100) * targetNation.militaryUnits.naval, "naval", "naval", targetNation);

    battle((playerNation.unitTechAndSkillRating.armourTech / 100) * playerNation.militaryUnits.tanks, (targetNation.unitTechAndSkillRating.armourTech / 100) * targetNation.militaryUnits.tanks, "tanks", "tanks", targetNation);
}

// Function dealing with combat between nation's armed forces - air, naval, armour and infantry

battle = (playerStrength, enemyStrength, playerUnits, enemyUnits, targetNation) => {

    playerUnitsRemaining = playerStrength - enemyStrength;
    enemyUnitsRemaining = enemyStrength - playerStrength;
    playerNation.militaryUnits[playerUnits] = Math.trunc(playerUnitsRemaining);
    targetNation.militaryUnits[enemyUnits] = Math.trunc(enemyUnitsRemaining);

    if (targetNation.militaryUnits[enemyUnits] <= 0) armiesDefeated++;
}

/*
    When recording who has been defeated, the region and code parameters must be set from JQVMaps to track this. The targetNation must also be passed as the stats of that nation will be affected. The code and region are stored in arrays if the win condition is met. Functions dealing with the loss are ran otherwise, but either way, the military campaign stage is over and declared back to false.
*/

trackDefeatedNations = (region, code, targetNation) => {

    if (armiesDefeated >= 4) {
        nationsConqueredCode.push(code);
        nationsConqueredRegion.push(region);
        winWar(region, targetNation);
    } else {
        loseWar();
    }
    armiesDefeated = 0;
    gameState.unitsOnCampaign = false;
}

// Functions governing win & lose conditions

winWar = (region, targetNation) => {
    militaryVictory(targetNation);
    awardResources();
    militaryUnitsGainXP(2);
    releaseAgents(targetNation);
}

loseWar = () => {
    militaryDefeat();
    militaryUnitsGainXP(0.5);
    playerNation.status.govtApprovalRating -= 5;
}

// Alert player to military victory and bonuses awarded

militaryVictory = (targetNation) => {

    enemyEliminated.play();

    swal("Victory",
        `${targetNation.name} has been defeated in battle and is now under your control. 

        ${playerNation.name} units remaining:

        Infantry: ${playerNation.militaryUnits.infantry} 
        Tanks: ${playerNation.militaryUnits.tanks} 
        Aircraft: ${playerNation.militaryUnits.air} 
        Navy: ${playerNation.militaryUnits.naval}`, {
            button: "Bonuses"
        }).then((value) => {
        swal("Debrief", `Resources: + 1% of the total GDP of ${targetNation.name} $${parseInt(targetNation.gdp / 100 * 1)} defence budget increase
        Military Units XP: + 2 
        Any agents held in ${targetNation.name} will be released`);
    });
}

// Alert player to military defeat and the impact of such

militaryDefeat = () => {

    swal("Defeat",
        `${targetNation.name} has held your forces

        ${playerNation.name} units remaining:

        Infantry: ${playerNation.militaryUnits.infantry}
        Tanks: ${playerNation.militaryUnits.tanks}
        Aircraft: ${playerNation.militaryUnits.air}
        Navy: ${playerNation.militaryUnits.naval}`, {
            button: "Bonuses"
        }).then((value) => {
        swal("Debrief", `Military Units XP: + 0.5
        Public Approval: - 5`);
    });
}

// Exp is awarded for military participants, but we don't want to award exp to the agents here

militaryUnitsGainXP = (XP) => {

    for (rating in playerNation.unitTechAndSkillRating) {
        if (rating === "infiltration") continue;
        playerNation.unitTechAndSkillRating[rating] += XP;
        unitRatingCap();
    }
}

// Units should max out at 100 on skill and tech ratings

unitRatingCap = () => {
    for (rating in playerNation.unitTechAndSkillRating) {
        if (playerNation.unitTechAndSkillRating[rating] > 100) {
            playerNation.unitTechAndSkillRating[rating] = 100;
        }
    }
}

/*
    CONQUERED NATION BONUSES
    
    Resources are stockpiled after successfully defeating another nation and added to monthly totals. A lump sum is awarded to the player's national defence budget (1% of defeated nation's GDP), and that applies for every defeated nation. Oil is also awarded to the player each month for occupying a nation (0.5% of every defeated nation's oil). This function runs after the nation in question is defeated.
*/

awardResources = () => {

    const nationGDP = targetNation.gdp;
    const nationOil = targetNation.resources.oilProduction;
    playerNation.resources.defenceBudget += targetNation.gdp / 100 * 1;
    defeatedNationGDP.push(nationGDP / 100 * 0.5);
    defeatedNationOil.push(nationOil / 100 * 0.5);
}

/*
***************************************************************************************************
    NUCLEAR WARFARE
***************************************************************************************************
    
    Launching a nuclear strike in TOW is a swift way to remove a nation from the map. However, it requires many resources, including a launch silo, money and - if you want to survive the year - missile defence shields. What? You don't think the enemy won't retaliate if it is able, do you?

    If a nation suffers nuclear annihilation, it turns white and is unable to be acquired for resources. If the target has nuclear defense, they WILL defend, they WILL launch against you in response. It is prudent to check whether a nation has defences before nuking it, or at least ensure you do before you take a chance. 
*/

// Deduct the warhead from player stocks and increase its aggression level

missileFired = () => {

    missileLaunch.play();
    playerNation.specialWeapons.nuclearWeapons -= 1;
    playerNation.status.aggressionLevel += 5;

    swal({
        title: "Nuclear Missile Launched",
        text: "Your nation has increased its aggression: +5",
        icon: "warning"
    });
}

// Alert player that they have no nukes

alertNoNukes = () => {
    swal({
        title: "Nuclear Capability Offline",
        text: "No nuclear weapons in current arsenal",
        icon: "error"
    });
}

/*
    The region and code parameters are tracked to monitor the outcome. Two 'let' vars store who is hit later in the program. If the player has nuclear weapons, they can confirm or abort the strike. Otherwise, they are alerted that they have none (see above).
*/

nuclearStrike = (region, code) => {

    clearPrevious();
    let playerIsNuked, enemyIsNuked;

    if (playerNation.specialWeapons.nuclearWeapons) {
        swal("Nuclear Strike",
            `Confirm Nuclear Strike On ${region}?`, {
                buttons: ["Cancel", "Confirm"]
            }).then((value) => {
            if (value) {
                missileFired();
                definePlayerStance();
                nuclearOutcomePlayer(enemyIsNuked, playerIsNuked, code, region, targetNation);
            }
        });
    } else alertNoNukes();
}

// Alert player to their own missile being intercepted

intercepted = () => {
    weaponDestroyed.play();
    swal("Missile Intercept", `${playerNation.name}'s missile destroyed`);
}

// Alert player to their nuclear attack being successful

hit = () => {
    targetDestroyed.play();
    swal("Missile Strike", "Target nation hit");
}

// If player launches, it is intercepted after 3 secs. Enemy response after further 3 secs

nuclearOutcomePlayer = (enemyIsNuked, playerIsNuked, code, region, targetNation) => {

    setTimeout(() => {
        if (targetNation.specialWeapons.missileShield) {
            targetNation.specialWeapons.missileShield -= 1;
            intercepted();
            nuclearTargetStance(region, targetNation);
            setTimeout(() => {
                enemyNuclearRetaliation(enemyIsNuked, playerIsNuked, code, region, targetNation);
            }, 3000);
            return;
        } else {
            hit();
            setTimeout(() => {
                nuclearDetonation.play();
            }, 600);
            enemyIsNuked = true;
            nuclearAftermath(enemyIsNuked, playerIsNuked, code, region);
        }
    }, 4000);
}

/*
    The following determines what happens if an enemy nation strikes at the player, and the function take 4 parameters, tracking who is hit, as well as the region and code attributes.
    
    If the player has a missile shield, the enemy missile is shot down and the player has a shield deducted. Otherwise, 2 seconds after the enemy launches, the player's nation is hit and the 'aftermath' function doles out the dire consequences. The 'gamestate.playerNuked' bool records the strike, which is passed to the 'gameOver' function to render a different game-over image, should the strike end the game.
*/

nuclearOutcomeEnemy = (enemyIsNuked, playerIsNuked, code, region) => {

    setTimeout(() => {
        if (playerNation.specialWeapons.missileShield) {
            setTimeout(() => {
                weaponDestroyed.play();
                swal("Enemy Missile Intercept", "A nuclear missile has been shot down");
            }, 2000);
            playerNation.specialWeapons.missileShield -= 1;
            return;
        } else {
            nuclearDetonation.play();
            swal("Nuclear Strike", `${playerNation.name} has suffered a nuclear strike from ${region}`);
            setTimeout(() => {
                criticalDamage.play();
            }, 2000);
            playerIsNuked = true;
            gameState.playerNuked = true;
            nuclearAftermath(enemyIsNuked, playerIsNuked, code, region);
        }
    }, 4000);
}

// Targeting a nation will elevate the their aggression level to max

nuclearTargetStance = (region, targetNation) => {
    targetNation.status.aggressionLevel = 100;
    defineNationStance();
    swal("Target Nation Aggression Maxed", `${region} is fully hostile.`);
}

// If targeted nation has nukes and are hostile, they will strike back

enemyNuclearRetaliation = (enemyIsNuked, playerIsNuked, code, region, targetNation) => {

    if (targetNation.status.stance === "hostile" && targetNation.specialWeapons.nuclearWeapons) {
        launchDetected.play();
        swal("Nuclear Missile Warning", `${targetNation.name} has launched a nuclear missile at you!`);
        targetNation.specialWeapons.nuclearWeapons -= 1;
        nuclearOutcomeEnemy(enemyIsNuked, playerIsNuked, code, region);
    }
}

// Render the consequences of the player or enemy being hit

nuclearAftermath = (enemyIsNuked, playerIsNuked, code, region) => {

    if (playerIsNuked) {
        playerNation.status.resistance -= 40;
        playerNation.status.govtApprovalRating -= 10;
        const gdpBeforeStrike = playerNation.gdp;
        playerNation.gdp -= RNG(10000000000, 30000000000);
        swal({
            title: "You Suffered a Nuclear Strike",
            text: `Rebuilding Costs Allocated: GDP -$${gdpBeforeStrike - playerNation.gdp}`,
            icon: "warning",
        });
    } else if (enemyIsNuked) {
        nationsConqueredCode.push(code);
        colourDefeatedNations(code, "#fff");
    }
}

/*
   Nations defeated militarily, or by turning inward via rebellion, turn red. I wrote this small function to directly interact with JQVMaps to take both a colour value and the code of the nation being dealt with to change its colour, reflecting its status. 
*/

colourDefeatedNations = (code, colour) => {
    for (let i = 0; i < nationsConqueredCode.length; i++) {
        if (code === nationsConqueredCode[i]) {
            $("#vmap").vectorMap("set", "colors", {
                [code]: colour
            });
        }
    }
}

/*
***************************************************************************************************
    INTRODUCING: THE PARTICLE CANNON
***************************************************************************************************

    The Particle Cannon Strike must be researched before use, and it will appear inside the 'Commands' sidebar once it has done so.
   
   It takes 8 hours to arrive in a target orbit above the unsuspecting nation, calculated as follows:
   
   CURRENT DAY / 3 (8 hours is one-third of a 24-hour day)
   
   Once confirmed, and the weapon is above, it fires, causing a devastating morale drop that may well see the nation capitulate to you immediately.
*/

// Implement the effects of the particle cannon strike on a target nation 

cannonDamage = (region, targetNation) => {

    targetNation.status.resistance -= 50;
    targetNation.militaryUnits.infantry -= 1000;
    targetNation.militaryUnits.tanks -= 40;
    particleCannon.play();
    cannonImpact.play();
    swal("Target Hit",
        `${region} Resistance: - 50
        ${region} Infantry: - 1000 
        ${region} Tanks: -40`
    );
}

// Set the orbit time (time to position), the impelement the strike and monitor the aftermath 

particleCannonStrike = (region, code) => {

    clearPrevious();
    const targetOrbitTime = day / 3;

    swal("Particle Cannon Strike",
        `Confirm Particle Deployment Above ${region}?`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            const handle = setInterval(() => {
                if (value && day >= targetOrbitTime) {
                    clearInterval(handle);
                    cannonDamage(region, targetNation);
                    monitorNationResistance(region, code);
                }
            }, 500);
        }
    });
}

/*
***************************************************************************************************
    DEPLOYMENTS: AGENTS & ARMIES
***************************************************************************************************

    Both field agents and armies must be deployed to a global destination for them to do their stuff.
 
    A new variable sets the time of arrival to be after a week, using whatever day the game is currently on and then tacking on + 7 days. A function is then run constantly, checking whether this new 'military arrival day' matches with the current day. In short, if the current day is equal to the future day, the troops are determined to arrive. The player is then able to attack now that the troops are in theatre.
    
    This script determines the travel time to all destinations for various forces. It takes 4 parameters passed between the various functions: 

    'region' determines the destination country of the sent units, which is itself defined via JQVMaps objects. 
    'unit' takes a string argument which indicates the type of unit that is being sent and is arriving. This stored info is used in messages to the player.
    'time' sets how many days must pass from the current day before the units can arrive. This future arrival date is determined by adding the current day (the day units are sent) to the arrival day (the day the units will get there).
    'orders' takes a callback function that determines what the units do when they get to where they are sent. Each unit will arrive in a country to do something specific. Agents, for example, will arrive to sabotage a nation's operations whilst military units arriving can attack them.
*/

/* 
    Military forces that are already deployed in a specific theatre need to be alerted to the player. Following this, if deployment is confirmed then the unit arrival time is set at two days but as they are only deployed no orders are given, so the last argument is the 'unitArrivalTime' function is missing (orders), and caught in a try-catch to prevent an error being thrown.
    
    Finally, the region they are now ordered to is stored as the region method of JQVMaps.
*/

deployForces = (region) => {

    if (deployedToRegion === region) {
        swal("Military already deployed to " + region)
        return;
    }

    clearPrevious();

    swal("Military Deployment",
        `Confirm Deployment to ${region}?`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            unitArrivalTime(region, "military", 2);
            deployedToRegion = region;
        }
    });
}

/*
    Similar to the military deployment above, agents are sent to a region but once they get there, they automatically try to acquire intel there. 
    
    If agents are already held by the nation they are trying to enter again, they will not be allowed until they are rescued or bartered for. A player also needs to have an agent in his service.
    
    Agents run the risk of capture: see 'gatherIntel' later in the script.
    
    The intel aqcuistion time is 3 days, to accomodate 2 days to arrive and 2 days to acquire it.
*/

deployAgents = (region) => {

    clearPrevious();
    if (preventIntel(region)) return;
    if (!checkAgents()) return;
    const timeToAcquireIntel = day + 4;

    swal("Agent Deployment",
        `Confirm Agent Deployment to ${region}?`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            swal("Agents Deployed", `Agents on the way to ${region}`);
            unitArrivalTime(region, "agents", 2);
            const handle = setInterval(() => {
                if (day === timeToAcquireIntel) {
                    clearInterval(handle);
                    gatherIntel(region);
                }
            }, 0);
        }
    });
}

// Ensure player has at least one agent to utilise

checkAgents = () => {

    if (playerNation.surveillance.fieldAgents <= 0) {
        swal({
            title: "No Agents In Service",
            text: "No more agents to spare. Train some at an Intel-Ops Centre.",
            icon: "warning",
        });
        return false;
    }

    return true;
}

// If units deployed are military, change the campaign bool to true so more oil is used 

unitCampaign = (units, region) => {

    if (units === "military") {
        gameState.unitsOnCampaign = true;
        swal(`Military Deployed to ${region}`, "Commander, we are ready to attack this nation.");
    } else {
        swal(`Agents Deployed to ${region}`, "Commander, we are ready to infiltrate this nation.");
    }
}

/*
   The try-catch here stops an error being thrown if no orders are given to units to carry out automatically on arrival (the last argument when the function is invoked). Here, the time of arrival is set as the current day + time (time = integer). Once the current day is equal to the arrival time, units arrive and either await further orders (armies) or attempt to syphon intel (agents).
*/

unitArrivalTime = (region, units, time, orders) => {

    const arrivalDay = day + time;

    const handleInterval = setInterval(() => {

        if (day >= arrivalDay) {
            clearInterval(handleInterval);
            unitCampaign(units, region);
            try {
                orders();
            } catch (err) {
                console.log(`No orders given for units after arriving in ${region}.`);
            }
        }
    }, 0);
}

/*
***************************************************************************************************
    AI AGGRESSION: SHALL WE PLAY A GAME?
***************************************************************************************************
    
    Out of the 182 nations operating in TOW, it would be rather a shame not to have some of them pull off some antics from time to time.
    
    AI aggression reminds the player that this is a dynamic and dangerous world and they are not alone. AI aggression takes the form of pseudo-random attacks, the type of which is itself  determined via probability (using the 'probabilty' function declared above).

    ATTACKING THE PLAYER
    
    Random attacks need to be prevented if the game ends, which is the first control flow order. After passing, we loop through the nations array and select a nation to attack. The nation selected must meet several conditions simultaneously:
    
    1. Their stance MUST be hostile.
    2. They can not have attacked the player before (previous attacks are stored in an array).
    3. The nation must not have already been conquered / defeated.
    4. It cannont be currently selected with the mouse (another player command acting on it).
    
    Only when these conditions are met will the nation be pushed into a 'previousAttackers' array as it is then that they will attack and be recorded doing so. The target nation (enemy) is then set as the nation in the 'nations' array that matches those conditions as the country that will attack, before the loop is broken. Finally, the attack type is determined by a corresponding function.
    
    If any conditions are not met, (the else statement), continue and skip over that nation and check until one is found. I have not set a condition as to what happens if no matches are found due to the extreme unlikelihood of that happening!
*/

attackPlayer = (enemyIsNuked, playerIsNuked, code, region, targetNation) => {

    if (!gameState.gameStarted) return;

    for (let i = 0; i < nations.length; i++) {
        if (!previousAttackers.includes(nations[i].name) &&
            !gameState.targetNationSelected &&
            !nationsConqueredRegion.includes(nations[i].name) &&
            nations[i].status.stance === "hostile") {
            targetNation = nations[i];
            previousAttackers.push(targetNation.name);
            setAttackTypeCPU(enemyIsNuked, playerIsNuked, code, region, targetNation);
            break;
        } else continue;
    }
}

/* 
    AI ATTACK TYPES
    
    There is a set probability of either a military, cyber or nuclear attack (40%, 50% & 10% respectively).
    
    All 5 params are ESSENTIAL for nuclear function to run as they are passed between multiple functions to achieve the desired result.
    
    Currently set to:
    40% chance of military attack
    50% chance of cyber attack
    10% chance of nuclear attack
        
    After war is declared, a control flow needs to alert the player to the nation that has attacked the player.
    
    The 'warOutcome' function deals with any incoming attacking.
    
    In case of the nuclear strike, this works by simply by calling the nuclear retaliation function that usually fires when the player strikes a target nation with a nuke, and so is repeated here to avoid repetition.
    
    Cyber attack will steal funds from the player and alert them as to who did it, and how much.
*/

warOutcome = (targetNation) => {

    if (armiesDefeated >= 4) {
        swal(`${playerNation.name} has fought off ${targetNation.name}`);
    } else {
        swal(`${playerNation.name}'s armies defeated by ${targetNation.name},
            "Public Approval: -5"`);
        playerNation.status.govtApprovalRating -= 5;
        gameoverDefeated();
    }
    armiesDefeated = 0;
}

setAttackTypeCPU = (enemyIsNuked, playerIsNuked, code, region, targetNation) => {

    if (probability(0.40)) {
        swal(`${targetNation.name} Attacking`, "Your armies are engaging in combat");
        war(targetNation);
        warOutcome(targetNation);
    } else if (probability(0.50)) {
        cyberAttack(targetNation);
    } else {
        enemyNuclearRetaliation(enemyIsNuked, playerIsNuked, code, region, targetNation);
    }
}

cyberAttack = (targetNation) => {

    const budget = playerNation.resources.defenceBudget;
    playerNation.resources.defenceBudget -= RNG(100000, 5000000000);
    swal(`Hacked by ${targetNation.name}`, `$${budget - playerNation.resources.defenceBudget} has been stolen.`);
}

/*
*************************************************************************************************
    RANDOM WORLD EVENTS
*************************************************************************************************
    
    The world in Theatre of War is no different to our present-day reality - events can happen suddenly and without warning. There are 5 major global events in Theatre of War, ranging from dangerous terror strikes and natural disasters to more positive (but still challenging!) commitments such as giving global aid.

    The functions have been defined, and are saved inside an array in the 'randomWorldEvent' function. This array is then accessed and a function is chosen at random.
*/


// Set an array of events that can be randomised to produce game-changing dynamics

randomWorldEvent = () => {

    const worldEvents = [militaryCoup, naturalDisaster, terrorStrike, internationalAid, globalTreaty];
    const randomFunction = Math.floor(Math.random() * worldEvents.length);

    for (let i = 0; i < worldEvents.length; i++) {
        worldEvents[randomFunction]();
        break;
    }
}

/*
    If a nation undergoes a coup, it will militarise heavily by increasing its armies. If it does not have any nuclear weapons, it has a 50% chance of arming itself with one.
    
    This means that another nation in the world is now heavily armed and nuclear, meaning that the player's risk has just gone up slightly: remember, a nation can attack at any time.
*/

mobilise = (nation) => {

    if (probability(0.50) && !nation.specialWeapons.nuclearWeapons) {
        nation.specialWeapons.nuclearWeapons += 1;
        console.log(nation.specialWeapons.nuclearWeapons)
    }

    for (units in nation.militaryUnits) {
        nation.militaryUnits[units] += RNG(5000, 10000);
    }
}

/*
    The nation chosen to undergo a coup is selected as follows:
    
    1. A nation that is NOT already hostile will be the random aggressor.
    2. If a selected nation is not hostile, no coup takes place and the player remains unaware.
    
    Furthermore, a selected nation will have its hostility increased to the max.
*/

const militaryCoup = () => {

    const randomNation = Math.floor(Math.random() * nations.length);

    for (let i = 0; i < nations.length; i++) {
        if (nations[i] === nations[randomNation] &&
            nations[i].status.stance !== "hostile") {

            swal(`${nations[i].name} is experiencing a coup d'état!`,
                `Aggression Level: 100 
                Stance: Hostile 

            This nation's military power has increased and it may now have nuclear arms.`);

            nations[i].status.aggressionLevel = 100;
            mobilise(nations[i]);
        }
    }
}

// A natural disaster will cost the player money from the defence budget

const naturalDisaster = () => {

    const disasters = ["forest fires", "flooding", "volcanoes", "earthquakes"];
    const randomDisaster = Math.floor(Math.random() * disasters.length);
    const previousDefenceBudget = playerNation.resources.defenceBudget;
    playerNation.resources.defenceBudget -= RNG(100000, 1000000);

    swal("Natural Disaster", `Your nation has been hit by ${disasters[randomDisaster]}! Reparations are necessary and money has been diverted from your defence budget. 

    Defence Budget: - $${previousDefenceBudget - playerNation.resources.defenceBudget}`);
}

/*
    TERRORIST ACTIVITY 
    
    A terror strike on a city hits the player's budget, but more dangerously, also affects your approval rating by -5 as the population begins to anger at you. A refinery strike will cost the player oil supplies.
*/

cityStrike = () => {
    playerNation.status.govtApprovalRating -= 5;
    playerNation.resources.defenceBudget -= 100000;
    swal("Terror Attack", "Terrorists have attacked a city in your nation. Civilian casualties are reported and reparations are required. \n\nApproval Rating: -5 \nDefence Budget: - $100000");
}

refineryStrike = () => {

    const previousOilProduction = playerNation.resources.oilProduction;
    playerNation.resources.oilProduction -= RNG(50000, 100000);

    swal("Terror Attack",
        `Terrorists have attacked a vital oil refinery in your nation. 

        Oil Production: - ${previousOilProduction - playerNation.resources.oilProduction} barrels`);
}

const terrorStrike = () => {
    const terrorTargets = ["city", "vital oil refinery"];
    const randomTarget = Math.floor(Math.random() * terrorTargets.length);
    terrorTargets[randomTarget] === "city" ? cityStrike() : refineryStrike();
}

// International aid treaty is signed, seeing reduction of aggression and increase in approval

aidSuccess = () => {

    swal("International Aid", "Your nation is donating capital to several impoverished nations. \n\n Approval Rating: +2 \nAll Nations Aggression Level: -2 \nGDP: - $5200000");
    playerNation.gdp -= 5200000;
    playerNation.status.govtApprovalRating + 2;

    nations.forEach(nation => {
        nation.status.aggressionLevel -= 2;
    });
}

// Aid treaty has failed, resulting in lower approval and increase in world nation aggression

aidFailed = () => {

    swal("Insufficient GDP For International Aid Provision", "Many impoverished nations in the world were relying on you to provide support. \nApproval Rating: -2 \nAll Nations Aggression Level: +2");
    playerNation.status.govtApprovalRating -= 2;

    nations.forEach(nation => {
        nation.status.aggressionLevel += 2;
    });
}

const internationalAid = () => {
    playerNation.gdp >= 5200000 ? aidSuccess() : aidFailed();
}

// Diplomatic treaty signed: lowers world aggression and resistance and increases GDP & diplomacy

treatySuccess = () => {

    swal("International Treaty Signed", "Your nation has signed a treaty that benefits many of the world's nations, including yours. Congratulations. \n\n All Nations Aggression Level: -5 \nAll Nations Resistance: -2 \nAll Nations GDP: + $1000000000 \nAll Nations Diplomacy: +5");

    nations.forEach(nation => {
        nation.status.aggressionLevel -= 5;
        nation.status.resistance -= 2;
        nation.gdp += 1000000000;
        nation.diplomacy += 5;
    });
}

// Diplomatic treaty failed: increases world aggression & diplomacy

treatyFailed = () => {

    swal("Treaty Diplomacy Failed", "Your nation attempted to agree a global treaty that reduces aggression and military action worldwide. Alas, negotiations broke down and hostilities will continue to escalate. \nAll Nations Diplomacy: +3 \nAll Nations Aggression Level: +5");

    nations.forEach(nation => {
        nation.diplomacy += 3;
        nation.status.aggressionLevel += 5;
    });
}

const globalTreaty = () => {
    playerNation.diplomacy >= 50 ? treatySuccess() : treatyFailed();
}

// If a player clicks on their own nation (via the map), show the status overlay for it

showStatusPlayerNation = (region) => {
    if (playerNation === Russia && region === "Russian Federation" ||
        playerNation === USA && region === "United States of America") {
        $(".status-overlay").addClass("status-open");
    }
}

// After the player selects their nation, its name is added to the status screen as a heading

displayNationNameStatus = () => {
    $("#nation-name").text(playerNation.name);
}

/*
***************************************************************************************************
    INTELLIGENCE GATHERING & SURVEILLANCE: SNEAKY, SNEAKY!
***************************************************************************************************
    
    Agents must be deployed to a nation in TOW in order to do anything. There is also a probablilty that agents can be captured, which has several effects, including lower approval ratings the longer an agent is held, increasing nation aggression and may result in them being killed if you attempt to rescue them. Agents are released if the nation holding them captive is defeated in war.
 
    This function uses several control flows to determine the outcome of any attempted espionage. Firstly, if the player's nation has an infiltation rating higher than the target nation, they have a 75% chance of gaining access to a nation's data. If the player's nation has a lower infiltration rating than the nation they have chosen to spy on, the chance to successfully obtain any data drops to 30%. This mirrors the unpredictable and cut-throat world of espionage!
    
    Any intel discovered will be shown to you each time you click a nation on the map.
*/

/*
    The probability of agent capture is set in 'captured'. If less than the number defined by the probability function, itself returned from the 'probabilityAgentCapture' function, agents successfully report back with nation data. No matter what, each time an agent is deployed, its skill goes up by 1.
    
    If captured, the region of capture is recorded in an array before being added to the rescue attempt dropdown: a list of nations holding hostages that the player can launch a spec-ops raid on, amongst other things. See below.
*/

gatherIntel = (region) => {

    const captured = probabilityAgentCapture();

    if (captured) {
        agentsCaptured(region);
        captureRegion = region;
        nationsHoldingAgents.push(captureRegion);
        $(".agents-imprisoned").append(`<option value="${captureRegion}">${captureRegion}</option>`).addClass("displayBlock");
    } else if (probability(0.86)) {
        espionageSuccessful(region);
    }
}

// If agents are still captive in a certain nation, no further agents are allowed there

preventIntel = (region) => {

    if (nationsHoldingAgents.includes(region)) {
        swal("Gathering Intel Disallowed", `Agents are already being held by ${region}. They will be on heightened alert and we should not send any more agents at this time.`);
        return true;
    }

    return false;
}

/*
    The 'agentCaptured' bool tracks if any agents are being held in order to stop any rescue menus popping if no one is being held hostage in any nation. Thus, when captured it is set to true.
    
    The agent is deducted from the player's service and the resulting media storm leads to a drop in approval. After looping through the nations array, if the region they have been captured in is equal to any of those nations, their aggression level rises due to a perceived hostile act.
*/

agentsCaptured = (region) => {

    agentCaptured = true;
    playerNation.surveillance.fieldAgents -= 1;
    playerNation.status.govtApprovalRating -= 2;

    for (let i = 0; i < nations.length; i++) {
        if (region === nations[i].name) {
            swal(`${region} Has Captured Your Agent`, `Field Agents: -1 
            Approval Rating: -2 
            ${region} Aggression Level: +5`);
            nations[i].status.aggressionLevel += 5;
        }
    }
}

/*
   Return stringified nation data in an alert if agents are successful. The agent also gains extra skill bonuses for obtaining intel, and the region of infiltration is recorded in an array. This array is iterated through each time a player clicks a nation, and if intel is stored on that nation, they can see it in the same alert. 
*/

espionageSuccessful = (region) => {

    for (let i = 0; i < nations.length; i++) {
        if (region === nations[i].name) {
            swal({
                title: "Data Retrieved",
                text: JSON.stringify(nations[i], null, 4),
                icon: "info",
            });
        }
    }

    playerNation.unitTechAndSkillRating.infiltration += 3;
    playerNation.surveillance.infiltratedNations.push(region);
}

/*
    Probability of the player's agents being captured is set at 15%, if players own agents have higher infiltration ratings than the enemy. Otherwise, it is set at 30%.
*/

probabilityAgentCapture = () => {

    if (playerNation.unitTechAndSkillRating.infiltration > targetNation.unitTechAndSkillRating.infiltration) {
        captured = probability(0.35);
    } else {
        captured = probability(0.65);
    }

    return captured;
}

/*
*************************************************************************************************
    HOSTAGE (AGENT) RESCUE
*************************************************************************************************

    In TOW, captured agents can be rescued by special forces teams or liberated if a nation holding agents is successfully invaded. Captive agents DO have consequences for the player: their approval rating will lower with each passing month that an agent is held. Furthermore, the more agents being held hostage, the greater the decrease in approval ratings.

    'releaseAgents' runs when a country holding any of the player's agents is successfully invaded. Any hostages will be liberated. It takes the targetNation parameter to track the nation invaded, then checks whether that nation exists in the array of nations who hold hostages.
    
    If so, get the index of that nation name and remove it from the array now hostages are being freed. The nation is also removed from the dropdown list of nations holding hostages before the agent is returned to the player's inventory. The 'hideCaptiveDropdown' function hides the dropdown select again if no nations have hostages.
*/

releaseAgents = (targetNation) => {

    if (nationsHoldingAgents.includes(targetNation.name)) {
        const indexRescueNation = nationsHoldingAgents.indexOf(targetNation.name);
        nationsHoldingAgents.splice(indexRescueNation, 1);
        $(`.agents-imprisoned option[value=${targetNation.name}]`).remove();
        playerNation.surveillance.fieldAgents += 1;
        hideCaptiveDropdown();
    }
}

// Prevent rescue functions running if no agents are captured

agentsHostage = () => {

    if (!agentCaptured) {
        swal({
            title: "No Hostages Detected",
            icon: "warning"
        });
        return false;
    }

    return true;
}

/*
    If agents are being held, a dropdown list will show where inside the command sidebar. Once a player selects the nation to raid and free their agent, this is stored as a var.
    
    This var is then check against all nations holding hostages before the raid is confirmed. Once it is, the list of nations is disabled until the mission is completed - this prevents a player clicking on another nation simultaneously: in TOW, only one rescue can be conducted at a time. The special forces team arrival time is then set at 2 days until target destination is reached.
*/

launchHostageRescue = (region) => {

    if (!agentsHostage()) return;
    rescueAttemptNation = $(".agents-imprisoned").val();

    for (let i = 0; i < nationsHoldingAgents.length; i++) {
        if (nationsHoldingAgents[i] === rescueAttemptNation) {
            swal("Spec-Ops Raid",
                `Confirm Hostage Rescue in ${rescueAttemptNation}?`, {
                    buttons: ["Cancel", "Confirm"]
                }).then((value) => {
                if (value) {
                    swal({
                        title: "Raid In Progress",
                        text: `Your Spec Ops team is beginning their raid on ${rescueAttemptNation}.`,
                        icon: "info"
                    });
                    $("select option[value='" + rescueAttemptNation + "']").attr("disabled", true);
                    unitArrivalTime(rescueAttemptNation, "spec-ops", 2, beginSpecOps);
                }
            });
        }
    }
}

// swal placeholder function for displaying messages to player

rescueAlert = (title, text, icon) => {
    swal({
        title: title,
        text: text,
        icon: icon
    });
}

/*
    Rescue outcomes are determined in this function. Success results in an agent being returned to the player and slight approval increase; failure results in their death and loss of public approval. 
    
    NOTE: Agents are not removed after being killed - they are already removed from the nation object when captured.
*/

rescueOutcome = (rescued) => {

    if (rescued) {
        rescueAlert("Mission Accomplished", `Agent retrieved from ${rescueAttemptNation}. 
            Field Agents: +1`, "success");
        playerNation.status.govtApprovalRating += 1;
        playerNation.surveillance.fieldAgents += 1;
    } else {
        rescueAlert("Mission Failure", `Your agent was killed in the rescue attempt. 
            Field Agents: -1`, "error");
        playerNation.status.govtApprovalRating -= 2;
    }
    clearHostageStatus();
    hideCaptiveDropdown();
}

/*
    This function preludes the rescue by setting the probability of agent rescue, which is higher if the player's infantry skill exceeds that of the enemy. 
*/

beginSpecOps = (region) => {

    let rescued;

    if (playerNation.unitTechAndSkillRating.infantrySkill > targetNation.unitTechAndSkillRating.infantrySkill) {
        rescued = probability(0.55);
    } else {
        rescued = probability(0.30);
    }
    rescueOutcome(rescued);
}

// Hostages are spliced from the dropdown and relevant array once rescued (also works for ransom)

clearHostageStatus = () => {
    const indexAgentRescueNation = nationsHoldingAgents.indexOf(rescueAttemptNation);
    nationsHoldingAgents.splice(indexAgentRescueNation, 1);
    $(`.agents-imprisoned option[value=${rescueAttemptNation}]`).remove();
    hideCaptiveDropdown();
}

// Remove dropdown list of agents being held in certain countries when empty

hideCaptiveDropdown = () => {
    if (!nationsHoldingAgents.length) {
        $(".agents-imprisoned").removeClass("displayBlock");
    }
}

/*
    Player approval decreases should agents be held after each month, checked by iterating through the respective array and then lowering approval for each agent held.
*/

lowerApprovalHostages = () => {

    if (!nationsHoldingAgents.length) return;

    alert(`Monthly Report 
    \nOngoing Hostage Crisis  
    \n${nationsHoldingAgents.length} agents being held. 
    \nApproval Rating: -1 per agent held.`);

    nationsHoldingAgents.forEach(agent => {
        playerNation.status.govtApprovalRating -= 2;
    });
}

/*
    Ransoms can also be paid to a nation in order to release hostages. This function takes the 'ransomNation' parameter that stores the nation selected by the player to pay the ransom to, and the ransom amount itself ('ransom'). The ransom amount is always $50 million. 
    
    The 'ransomOptions' function then uses both arguments to display a confirm message. If the player selects yes, the ransom is paid from the defence budget funds and the agent returned.
*/

payRansom = (region, ransom, ransomNation) => {
    ransomNation = $(".agents-imprisoned").val();
    ransom = 50000000;
    ransomOptions(ransom, ransomNation);
}

ransomOptions = (ransom, ransomNation) => {

    if (!agentsHostage() || ransomNation === null) return;

    swal("Ransom Payment",
        `Release agent from captivity in ${ransomNation} by paying $${ransom}?`, {
            buttons: {
                cancel: "Refuse Ransom Request",
                confirm: "Pay Ransom Request"
            },
        }).then((value) => {
        if (value) {
            ransomSuccess(ransom, ransomNation);
        } else {
            ransomDenied(ransom, ransomNation);
        }
    });
}

ransomSuccess = (ransom, ransomNation) => {

    swal({
        title: "Ransom Paid",
        text: `Your agent has been released from ${ransomNation}. 
        Field Agents: +1 
        GDP: - $${ransom}`,
        icon: "info"
    });

    playerNation.surveillance.fieldAgents += 1;
    playerNation.resources.defenceBudget -= ransom;
    clearHostageStatus();
    hideCaptiveDropdown();
    $(`.agents-imprisoned option[value=${ransomNation}]`).remove();
}

ransomDenied = (ransom, ransomNation) => {
    swal({
        title: "Ransom Request Denied",
        text: `You have refused to pay $${ransom} to ${ransomNation}. 
            Your agent will continue to be held until you order a spec-ops team to release them, pay a ransom, or invade this nation.`,
        icon: "info"
    });
}

/*
*************************************************************************************************
    SATELLITE SURVEILLANCE
*************************************************************************************************
    
    Spy satellites can be used to display information on a nation's military, and is safer than sending agents who are at risk of getting captured. However, unlike agents, satellites are unable to identify what special weapons a nation has (nuclear weapons and strategic defences).
    
    The satellite also costs money ($10000000) if employed, and the 'spySatellite' function contains checks that ensure a satellite exists and that the player can afford its use.
*/

confirmSatelliteUse = (region) => {

    playerNation.resources.defenceBudget -= 10000000;

    swal({
        title: `Military Capability: ${region}`,
        text: `Military Forces: ${JSON.stringify(targetNation.militaryUnits, null, 4)}`,
        icon: "info"
    });
}

spySatellite = (region, code) => {

    clearPrevious();
    if (checkFunds(10000000)) return;

    if (!playerNation.surveillance.satellites) {
        swal({
            title: "Satellite Unavailable",
            text: "You do not yet have a satellite in orbit, commander.",
            icon: "warning"
        });
        return;
    } else confirmSatelliteUse(region);
}

/*
************************************************************************************************* 
    AGENTS: HACKING
*************************************************************************************************

    Agents are able to utilise cyberattacks to steal funds from a target nation - the success rate
    of which is determined by their infiltration skill points. A successful hack means that a random amount of money between $50000 and $1000000, but an unsuccessful hack may carry consequences - namely your hack being detected and traced back to you. In this case, the nation you tried to pilfer will become more aggressive toward you! 
*/

// If the hack probablity favours the player, money is stolen and hacking bonus awarded

chanceOfHack = (successfulHack, region, targetNation) => {

    if (successfulHackProbability(successfulHack)) {
        const amountStolen = RNG(50000, 1000000);
        awardHackingBonus(region, targetNation, amountStolen);
        swal({
            title: "Hack Successful",
            text: `You have stolen $${amountStolen} from ${region}.`,
            icon: "info"
        });
    } else {
        swal({
            title: "Hack Unsuccessful",
            text: `${region} has prevented you from acquiring resources.`,
            icon: "info"
        });
    }
}

// There is a cost to cyberattack attempts. Successful hack and detected vars defined for use

hackFunds = (region, targetNation) => {

    clearPrevious();

    swal("Cyberattack",
        `Attempt to syphon funds from ${region}?`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            playerNation.resources.defenceBudget -= RNG(50000, 150000);
            let successfulHack, detected;
            chanceOfHack(successfulHack, region, targetNation);
            hackDetected(region, detected, targetNation);
        } else return;
    });
}

/*
    HACKING CONSEQUENCES 
    
    This function takes the detected argument which defines the probability of detection (see below). Detected hacks bring embarrassment for your leadership and decreases approval. 
    
    The for each is used here to prevent use of 'targetNation', which can change quickly if the player tries to click another nation with the same function soon after - therefore not detecting the correct nation being interacted with. It raises the target nation's resistance and aggression. All this is on a 3-second delay.
*/

hackDetected = (region, detected, targetNation) => {

    setTimeout(() => {
        if (hackDetectionProbability(detected)) {
            playerNation.status.govtApprovalRating -= 5;

            swal({
                title: `${region} Detected Your Hack!`,
                text: `${region} Aggression Level: + 10 
                ${region} Resistance Level: + 5 
                Your Approval Rating: - 5`,
                icon: "warning"
            });

            nations.forEach(nation => {
                if (nation.name === targetNation.name) {
                    nation.status.aggressionLevel += 10;
                    nation.status.resistance += 5;
                }
            });
        }
    }, 3000);
}

// Chance of successful hack and subsequent detection: determined by skill of each nation's agents

successfulHackProbability = () => {

    if (playerNation.unitTechAndSkillRating.infiltration > targetNation.unitTechAndSkillRating.infiltration) {
        successfulHack = probability(0.90);
    } else {
        successfulHack = probability(0.95);
    }

    return successfulHack;
}

hackDetectionProbability = () => {

    if (playerNation.unitTechAndSkillRating.infiltration < targetNation.unitTechAndSkillRating.infiltration) {
        detected = probability(0.90);
    } else {
        detected = probability(0.90);
    }

    return detected;
}

// Steal from target's GDP, and add to defence budget

awardHackingBonus = (region, targetNation, amountStolen) => {
    playerNation.resources.defenceBudget += amountStolen;
    targetNation.gdp -= amountStolen;
}

/*
*************************************************************************************************
   AGENTS: SABOTAGE  
*************************************************************************************************
    
    Agents in TOW can be used to help undermine a nation's ability to function correctly, especially militarily. This carries a cost of $10000000. Again, once selected, agents take 2 days to be ready to act. Successful sabotage causes military losses of between 100 and 1000 units. THE SET TIMEOUT HERE MUST BE SET TO MORE THAN WHATEVER TIME THE PASSAGE OF A DAY IS: for testing a day is one second, in production it is 30. This ensures that the sabotage function takes place only after the agents have reached the destination. Agents are not required to be in the field for this ability and the result is returned immediately for the game's sake.
*/

undertakeSabotage = (region, code, targetNation) => {

    clearPrevious();

    swal("Sabotage: $10000000",
        `Attempt to sabotage the operations of ${region}?`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            playerNation.resources.defenceBudget -= 10000000;
            chanceToSabotage(targetNation);
        }
    });
}

chanceToSabotage = (targetNation) => {

    if (probability(0.50)) {
        swal("Sabotage Successful",
            `Agents have successfully sabotaged enemy radar of ${targetNation.name} 
        Enemy Air Units: - 5000`);

        for (units in targetNation.militaryUnits) {
            targetNation.militaryUnits[units] -= RNG(100, 1000);
        }
    } else {
        swal("Sabotage Unsuccessful");
    }
}

/*
*************************************************************************************************
    AGENTS: INCITE REBELLION
*************************************************************************************************
        
    Use agents to whip up dissent, start a coup and overthrow the government of a selected nation. This can only be attempted once, and the 'disallowIncite' function checks that the code of a selected nation is not in an array that tracks the attempts before running the 'inciteRebellion' function. As with the sabotage ability, agents do not need to be in the country targeted to cause the upheaval and the result is returned immediately for the game's sake.
*/

disallowIncite = (region, code) => {

    if (rebellionAttempted.includes(code)) {
        swal({
            title: `Rebellion Attempted: ${region}`,
            text: "Inciting rebellion can only be attempted once on each nation.",
            icon: "warning",
        });
        return true;
    }

    return false;
}

// If player incite level is higher than enemy level, chance for success is 25%. Else 10%.

chanceOfRebellion = (region, code, playerInciteLvl, targetInciteLvl) => {

    let successfulRebellion;

    if (playerInciteLvl > targetInciteLvl) {
        successfulRebellion = probability(0.25);
    } else {
        successfulRebellion = probability(0.10);
    }

    if (successfulRebellion) {
        nationRebelled(region, code);
    } else {
        rebellionFailed(region);
        return;
    }
}

/*    
    If a rebellion attempt is selected, a cost is payed and the country targeted is stored in an array via its JQVMaps code. The player and target nation have their 'incite level' set as their respective infiltration ratings, passed to the 'chanceOfRebellion' function above. Nations that suffer a goivernment overthrow are removed from the game and coloured, as if defeated militarily. They are classed as 'conquered' in the game's eyes. Hey, the name of the game is to remove as many nations as possible!
*/

inciteRebellion = (region, code) => {

    clearPrevious();
    if (disallowIncite(region, code)) return;

    swal("Incite Unrest: $500000000",
        `Attempt to stir trouble against the government of ${region}?`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            playerNation.resources.defenceBudget -= 500000000;
            rebellionAttempted.push(code);

            const playerInciteLvl =
                playerNation.unitTechAndSkillRating.infiltration + playerNation.diplomacy;
            const targetInciteLvl =
                targetNation.unitTechAndSkillRating.infiltration + targetNation.diplomacy;
            chanceOfRebellion(region, code);
        }
    });
}

nationRebelled = (region, code) => {

    swal({
        title: "Rebellion Incited",
        text: `Your agents have caused ${region} to suffer internal dissent. They are no longer a player in the theatre of war.`,
        icon: "info"
    });
    
    nationsConqueredCode.push(code);
    nationsConqueredRegion.push(region);
    colourDefeatedNations(code, "#AA0000");
}

rebellionFailed = (region) => {
    swal({
        title: "Rebellion Failed",
        text: `Your agents have failed to stir up enough dissent in ${region}. Perhaps the conditions are not yet right.`,
        icon: "warning"
    });
}

/*
*************************************************************************************************
    CONSCRIPTION (MANDATED MILITARY SERVICE)
*************************************************************************************************

    You are able to use your defence budget to draft soldiers into compulsory military service on a daily basis, in a month-long campaign to round up as many poor souls as possible for your cause. Training troops costs much more money and time, but conscription can help bolster any fledgling army.

    The IF condition stops an alert playing every game day, as this function exists inside of the 'runGameTime' function. The alert plays only once when startedm and the bool prevents it thereafter. The number of troops conscripted per day is random up to a maximum of 1000. Each day, the player's infantry ranks grow by that random conscription number.
    
    The 'infantryRecruits' array stores each daily recruit tally, which allows the 'reportConscription' function to run at the end of the month, sum up that array and inform the player of how many new soldiers it now has. 
    How does it know a month has passed? It checks the length of the recruit array each day: if the length is 30 or more, 30 days must have passed - the tally is added to daily, remember! Once the conscription bool is set back to false, it will never be set back to true again. In TOW, conscription can only occur once.
*/

conscriptTroops = () => {

    if (!gameState.conscriptionStarted) {
        swal("Conscripting Troops", "Total recruits will be reported in one month.");
        gameState.conscriptionStarted = true;
    }

    const randomConscriptionNumber = Math.floor(Math.random() * 1000);
    playerNation.militaryUnits.infantry += randomConscriptionNumber;
    infantryRecruits.push(randomConscriptionNumber);
    reportConscription();
}

reportConscription = () => {

    if (infantryRecruits.length >= 30) {
        commands.conscription = false;
        swal({
            title: "Recruitment Drive Report",
            text: `You have managed to recruit ${sum(infantryRecruits)} new soldiers this month.`,
            icon: "info"
        });
    }
}

/*
*************************************************************************************************
    DIPLOMACY
*************************************************************************************************   
    
    This is one of the more complex mechanics in TOW, and it was very challenging to program, manage and debug. A player can sign trade deals with other nations, and even form alliances with others who can provide you with some of their troops in the event you need to leverage greater military power against your enemies. Nations can only be negotiated with if they are not hostile and have not already been successfully negotiated with (i.e., a deal has already been signed).
*/

// Alliances can only be formed with friendly nations

disallowAllianceStance = (region, targetNation) => {

    if (targetNation.status.stance !== "friendly") {
        swal({
            title: "Alliance Not Possible",
            text: `${region} must be classed as 'friendly'.`,
            icon: "warning"
        });
        return true;
    }

    return false;
}

/*
    This function takes 5 parameters that are passed as arguments when negotiations have started. The purpose is to ensure that the target nation is not hostile or has not already been successfully negotiated with. That is entered as the 'condition' argument and if any of these are true, false is returned and diplomacy will be prevented with messages displayed as the 'title' and 'text' parameters.
*/

checkCondition = (region, targetNation, condition, title, text) => {

    if (condition) {
        swal({
            title: title,
            text: text,
            icon: "warning"
        });
        return true;
    }

    return false;
}

/*
    Alliances are also probability-based, determined by the probability function. The probability is set at 50%. If successful, the alliance pact is made. If the nation has not been approached for an alliance before, that nation is pushed to an array to track this.
*/

determineAllianceSuccess = (region, code) => {

    const chanceOfAlliance = 0.95;

    if (probability(chanceOfAlliance)) {
        alliancePact(region, code);
    } else {
        swal({
            title: "Alliance Unsuccessful",
            text: `${region} refuses to enter into an alliance with your nation at present.`,
            icon: "warning"
        });
        if (!diplomacyAttempted.includes(region)) {
            diplomacyAttempted.push(region);
        }

        return;
    }
}

// Chance of trade agreement is dependent on stance: higher if nation is friendly 

determineChanceOfAgreement = (targetNation) => {

    if (targetNation.status.stance === "neutral") {
        successfulTradeProbability = 0.35;
    } else if (targetNation.status.stance === "friendly") {
        successfulTradeProbability = 0.50;
    } else {
        successfulTradeProbability = 0.95;
    }
}

/*
    TRADE DEALS
    
    When conducting trade deals, there are two main stages and functions. Stage 1 checks that a nation is not hostile and that player has selected the option to attempt to sign a deal. If so, that nation is considered to have been approached and saved into an array: players cannot approach a nation for successive deals nor approach again should the deal fall through. This array is used to track this.
    
    The successful trade probability is then initialised and determined, and passed into the 'determineChanceOfAgreement' function. If successful, stage 2 follows.
*/

agreementStage1 = (region, value, code, targetNation) => {

    if (value === "alliance" && !disallowAllianceStance(region, targetNation)) {
        diplomacyAttempted.push(region);
        determineAllianceSuccess(region, code);
    } else if (value === "deals") {
        swal("Deals",
            "Which deal would you like to propose?", {
                buttons: {
                    cancel: `Cancel negotiations with ${region}`,
                    agriculture: {
                        text: `Reduce tariffs on foodstuffs between you and ${region}`,
                        value: "agriculture",
                    },
                    oil: {
                        text: `Allow ${region} to export cars to your nation`,
                        value: "oil",
                    },
                    intelligence: {
                        text: `Share intelligence with ${region}`,
                        value: "intelligence",
                    },
                },
            }).then((value) => {
            if (value) diplomacyAttempted.push(region);
            let successfulTradeProbability;
            determineChanceOfAgreement(targetNation);
            agreementStage2(value, region, targetNation);
        });
    }
}

/*
    Stage 2 sees the player select the type of trade deal available. Should probability allow, the function for each deal is invoked. Otherwise, a message informs the player of what occurs.
*/

agreementStage2 = (value, region, targetNation) => {

    if (value === "agriculture" && probability(successfulTradeProbability)) {
        tariffSuspension(region, targetNation);
    } else if (value === "oil" && probability(successfulTradeProbability)) {
        oilExports(region, targetNation);
    } else if (value === "intelligence" && probability(successfulTradeProbability)) {
        intelCollaboration(region, targetNation);
    } else if (!value) {
        swal({
            title: "Negotiation Cancelled",
            icon: "info"
        });
    } else {
        swal({
            title: "Negotiation Unsuccessful",
            text: `Attempt at negotiation with ${region} has been unsuccessful.`,
            icon: "info"
        });
    }
}

/*
    Negotiation is the starter function for the entire diplomatic channel mechanic. It calls the 'checkCondition' function twice, checking that a nation is not hostile nor has been approached before. It ensures diplomacy can take place and display messages according to the result. If all checks are passed in the control flows, stage 1 is successfully invoked.
*/

negotiation = (region, code, targetNation) => {

    clearPrevious();

    if (checkCondition(
        region, 
        targetNation, 
        diplomacyAttempted.includes(region), 
        "Diplomacy Disallowed", 
        `${region} is not open to negotiation.`)) 
        return;

    if (checkCondition(
        region, 
        targetNation, 
        targetNation.status.stance === "hostile", 
        "Hostile Nation", 
        `Commander, ${region} is hostile and will not negotiate.`)) 
        return;

    swal("Negotiation & Diplomacy",
        `What do you wish to attempt with ${region}?`, {
            buttons: {
                cancel: `Cancel negotiations with ${region}`,
                trade: {
                    text: `Attempt to strike an international deal with ${region}`,
                    value: "deals",
                },
                alliance: {
                    text: `Attempt to form an alliance with ${region}`,
                    value: "alliance",
                },
            },
        }).then((value) => {
        agreementStage1(region, value, code, targetNation);
    });
}

/*
    AGRICULTURE
    
    If there is no trade deal already in the international relations array that exists inside each nation's object, then the deal is made. The 'pushDeal' function has the player's nation inserted into it, to log that a deal is now signed with that nation. Likewise, the same happens for the player's nation - the target nation is recorded inside their own array. This tracks who has a deal with who.
    
    Note that the region parameter is used to record the name of the nation, but the targetNation parameter is ESSENTIAL to track the actual object (actual nation) being interacted with. Failure to include this caused me many strange bugs as the intended nations to be inserted into arrays would not be inserted into any nation.
*/

tariffSuspension = (region, targetNation) => {

    if (!playerNation.internationalRelations.tradeDeals.includes(region)) {
        pushDeal(region, targetNation, "tradeDeals");
        swal("New Trade Deal Ratified",
            `Congratulations commander, you have signed a trade deal with ${region}. 
            Benefits of the deal will be awarded on a monthly basis.`, {
                button: "View Monthly Bonuses"
            }).then((value) => {
            swal(`Approval Rating: + 1 
        GDP: + 0.2% of the total GDP of ${region}`);
        });
    } else {
        swal({
            title: "Previous Trade Deal Signed",
            text: `You already have a trade deal with ${region}.`,
            icon: "warning"
        });
    }
}

/*
    When an agricultural deal is signed, the bonuses of such a deal are set here. This function in turn runs inside the 'monthlyActions' function of the game time object, so that every 30 game days will award the player with a percentage of the partner nation's GDP (2%). Signing deals is good for the economy, and approval is also increased. Of course, for realism, the nation that is providing the GDP needs to have it removed from their own accounts, and the bonus for their side is that their resistance is buffed. Resistance increases a nation's determination to tolerate war, however. So, if you fall out, you'd better watch out! 
    
    The function works by iterating through every nation in the game and checking that a nation is assigned to one of your (player nation) arrays by matching them up. It performs this via a double for loop. If the nation is there, that nation has its money taken and given to you. Pretty nice, huh? The alert allows the user to see results of the deal with F12. I did this to reduce the amount of alerts and information shown to the user at once. They may not need to see the same message all the time after a few times - the benefits are generally uniform.
    
    ** The oil export and intel collaboration mechanics function in similar ways.
*/

agriculturalBonus = () => {

    for (let i = 0; i < nations.length; i++) {
        for (let j = 0; j < playerNation.internationalRelations.tradeDeals.length; j++) {
            if (nations[i].name === playerNation.internationalRelations.tradeDeals[i]) {
                playerNation.gdp += Math.trunc(nations[i].gdp / 100 * 0.2);
                playerNation.status.govtApprovalRating += 1;
                nations[i].gdp -= Math.trunc(nations[i].gdp / 100 * 0.2);
                nations[i].status.resistance += 5;
            }
        }
    }
    
    if (!playerNation.internationalRelations.tradeDeals) {
        let eachDeal = playerNation.internationalRelations.tradeDeals.length;
        alert(`Agricultural Deal Bonuses Awarded: ${eachDeal}`); 
    }  
}

oilExports = (region, targetNation) => {

    if (!playerNation.internationalRelations.oilExportDeals.includes(region)) {
        pushDeal(region, targetNation, "oilExportDeals");
        swal("New Oil Export Deal Ratified",
            `Congratulations commander, you have signed a trade deal with ${region}. 
            Benefits of the deal will be awarded on a monthly basis.`, {
                button: "View Monthly Bonuses"
            }).then((value) => {
            swal(`GDP: + 0.3% of ${region} GDP 
            ${region} Resistance: +1`);
        });
    } else {
        swal({
            title: "Oil Export Deal Already Exists",
            text: `${playerNation.name} is currently exporting to ${region}.`,
            icon: "info",
        });

        return;
    }
}

oilBonus = () => {

    for (let i = 0; i < nations.length; i++) {
        for (let j = 0; j < playerNation.internationalRelations.oilExportDeals.length; j++) {
            if (nations[i].name === playerNation.internationalRelations.oilExportDeals[i]) {
                playerNation.resources.oilProduction += Math.trunc(nations[i].resources.oilProduction / 100 * 0.3);
                playerNation.status.govtApprovalRating += 1;
                nations[i].resources.oilProduction -= Math.trunc(nations[i].resources.oilProduction / 100 * 0.3);
                nations[i].status.resistance += 1;
            }
        }
    }
    
    if (!playerNation.internationalRelations.oilExportDeals) {
        let eachDeal = playerNation.internationalRelations.oilExportDeals.length;
        alert(`Oil Export Bonuses Awarded: ${eachDeal}`); 
    }  
}

intelCollaboration = (region, targetNation) => {

    if (!playerNation.internationalRelations.intelCollaborationDeals.includes(region)) {
        pushDeal(region, targetNation, "intelCollaborationDeals");
        swal("Share Intel Agreement Ratified",
            `Congratulations commander, you have signed an intel deal with ${region}. 
            Benefits of the deal will be awarded on a monthly basis.`, {
                button: "View Monthly Bonuses"
            }).then((value) => {
            swal(`Both Nations: Agent Skill + 1
            ${region} Resistance: +1
            ${playerNation.name} Govt Approval: + 1`);
        });
    } else {
        swal({
            title: "Intel Pact Exists",
            text: `${playerNation.name} is currently exchanging intel with ${region}.`,
            icon: "info"
        });

        return;
    }
}

intelBonus = () => {

    for (let i = 0; i < nations.length; i++) {
        for (let j = 0; j < playerNation.internationalRelations.intelCollaborationDeals.length; j++) {
            if (nations[i].name === playerNation.internationalRelations.intelCollaborationDeals[i]) {
                playerNation.unitTechAndSkillRating.infiltration += 1;
                playerNation.status.govtApprovalRating += 1;
                nations[i].unitTechAndSkillRating.infiltration += 1;
                nations[i].status.resistance += 1;
            }
        }
    }
    
    if (!playerNation.internationalRelations.intelCollaborationDeals) {
        let eachDeal = playerNation.internationalRelations.intelCollaborationDeals.length;
        alert(`Intel Collaboration Bonuses Awarded: ${eachDeal}`); 
    }  
}

/*
    ALLIANCE STATUS / COLOURS
    
    In TOW, a nation changes its colour to green when entering into an alliance with you. 
    
    If no alliance is formed previously, the deal is pushed to each nation's arrays as usual. By pushing the your ally to the region array, I can track the name of the nation to remove from the alliance if it suddenly becomes hostile: allies turn green, and this name allows the program to remove the green colour from the map if that relationship breaks down. It is coloured by the 'colourDefeatedNation' function. Although not semantically correct name-wise, it has allowed me to not repeat code for that mechanic - so it stays for now. 
    
    Allies are treated as 'conquered' nations - they are under your influence.
*/

alliancePact = (region, code) => {

    if (!playerNation.internationalRelations.alliances.includes(region)) {
        pushDeal(region, targetNation, "alliances");
        nationsConqueredCode.push(code);
        nationsConqueredRegion.push(region);
        colourDefeatedNations(code, "#329B24");
        swal({
            title: "Alliance Forged",
            text: `${playerNation.name} and ${region} have become allies.`,
            icon: "info"
        });
    } else {
        swal({
            title: "Alliance Already Ratified",
            text: `${playerNation.name} and ${region} are allies.`,
            icon: "info"
        });
    }
}

/*
    MILITARY ASSISTANCE
    
    A nation allied to your cause can provide limited military assistance, but do check a nation's stance and aggression rating before attempting this agreement - if their rating is close to neutral, it may not take long for a country to lose patience with you! Neutral status will nullify the alliance. You can only request this once.
    
    The function ensures that assitance has not been requested before, then recording that it now has been if not within an array. It then checks the player's alliance array, and if it includes the region being asked for help, it will assign units to the player from that nation's arsenal. Lastly, there is also a check that the nation in question actually has any military units.
*/

requestAllianceReinforcement = (region, targetNation) => {

    clearPrevious();

    if (!assistanceProvided.includes(region)) {
        assistanceProvided.push(region);
        if (playerNation.internationalRelations.alliances.includes(region) && targetNation.militaryUnits) {
            swal("Reinforcement Request", `${region} is sending troops to assist your war efforts.`);
            assignAlliedUnitsToPlayer(targetNation);
            reinforcementImpact(targetNation);
        } else {
            swal({
                title: "No Alliance Found",
                text: `You are not allied with ${region} and cannot request military support.`,
                icon: "warning"
            });
        }
    } else {
        swal({
            title: "Nation Cannot Assist",
            text: `${region} has aided your military once before.`,
            icon: "warning"
        });

        return;
    }
}

// After requesting reinforcements, both positive and negative consequences ensue...

reinforcementImpact = (targetNation) => {
    
    setTimeout(() => {
        swal("Reinforcement Report", `Payed $500000000 to ${targetNation.name}
        Government Approval: -2
        ${targetNation.name} Aggression: +2`);
    }, 3000);
    
    playerNation.resources.defenceBudget -= 500000000;
    targetNation.resources.defenceBudget += 500000000;
    playerNation.status.govtApprovalRating -= 2;
    targetNation.status.aggressionLevel += 2;
}

// Increment player units with 10% of the ally's military, removing them from allied nation

assignAlliedUnitsToPlayer = (targetNation) => {

    for (units in playerNation.militaryUnits) {
        playerNation.militaryUnits[units] += targetNation.militaryUnits[units] / 100 * 10;
    }
    for (units in targetNation.militaryUnits) {
        targetNation.militaryUnits[units] -= targetNation.militaryUnits[units] / 100 * 10;
    }
}

// Function that takes 3 parameters to insert each party into each other's relation arrays

pushDeal = (region, targetNation, deal) => {
    playerNation.internationalRelations[deal].push(region);
    targetNation.internationalRelations[deal].push(playerNation.name);
}

/*
*************************************************************************************************
    DEFINING NATION STANCES
*************************************************************************************************    
    'defineNationStance' runs at various point in the game, usually after events that may trigger a stance change (such as aggression level increases etc). However, it is also used immediately used after the creation of all 182 nation objects in TOW to set their initial stances based on their randomly-determined aggression levels. This is achieved via looping through all nations after creation, checking their assigned aggression levels and then categorising them as follows:
    
    0-40: Friendly
    40-50: Neutral
    50+: Hostile
    
    The player also has the same measured stance, set with 'definePlayerStance'.
*/

defineNationStance = () => {

    for (let i = 0; i < nations.length; i++) {
        if (nations[i].status.aggressionLevel >= 0 && nations[i].status.aggressionLevel < 40) {
            nations[i].status.stance = "friendly";
        } else if (nations[i].status.aggressionLevel >= 40 &&
            nations[i].status.aggressionLevel <= 50) {
            nations[i].status.stance = "neutral";
        } else {
            nations[i].status.stance = "hostile";
        }
    }
}

definePlayerStance = () => {

    if (playerNation.status.aggressionLevel >= 0 && playerNation.status.aggressionLevel < 40) {
        playerNation.status.stance = "friendly";
    } else if (playerNation.status.aggressionLevel >= 40 &&
        playerNation.status.aggressionLevel <= 50) {
        playerNation.status.stance = "neutral";
    } else {
        playerNation.status.stance = "hostile";
    }
}

/*
*************************************************************************************************
    TRACKING NATION STANCE CHANGES
*************************************************************************************************
    
    Nations in TOW mimic (in a basic sense) the shifting and dynamic patterns of relating that real-world international relations may bring. However, given the backdrop and narrative of TOW, this world shifts more often and more unpredictably. I wished, like many other parts of TOW, that I had time to flesh more of this out.
    
    However, the essential premise is that the stance of each nation must be monitored constantly in order to affect the changes in the game that this may bring. I wanted any changes to have an impact on the game somehow. 

    'detectStanceChange' runs every couple of seconds inside the game's tick function. It iterates through both the previous stances (saved to an array) AND the current ones, checking for differences. 'setTimeOut' prevents message being overridden by other messages that occur concurrently - this is one drawback of the sweetAlert library as opposed to the generic alert found in the window object. 'defineNationStance' is called in sync with this, as it is responsible for actually setting the stances after events. If this not called, it is not possible to detect any status change as they won't change!
    
    The global 'stanceHasChanged' bool is essential as it detects a difference in the stances after a loop through the previous nation stance array and the current one. This is then used in the 'controlStanceChange' function, which resets the previous nation stance array only if there is change - we need to obviously track the next state change accurately, so a 'new' old state is needed for tracking. The player also has their own stance monitored, as them being aggressive can also see nations leaving alliances and treaties. This is the domain of the 'treatyWithdrawal' function.
*/

detectStanceChange = () => {

    controlStanceChange();
    defineNationStance();
    definePlayerStance();

    for (let i = 0; i < previousNationStances.length; i++) {
        for (let j = 0; j < nations.length; j++) {
            if (previousNationStances[i] !== nations[i].status.stance) {
                stanceHasChanged = true;
                setTimeout(() => {
                    swal("Nation Stances Changed", "F12 for details.");
                }, 3000);
                console.log(`${nations[i].name} has become ${nations[i].status.stance}`);
                break;
            }
        }
    }
    treatyWithdrawal();
}

// If state has changed: repopulate the array, save current stances and reset change bool

controlStanceChange = () => {

    if (stanceHasChanged) {
        console.log("States have changed - emptying old state")
        previousNationStances = [];
        console.log("state has changed - storing current state")
        storeNationStance();
        stanceHasChanged = false;
    }
}

// Iterate through all nation stances and store in an array

storeNationStance = () => {
    nations.forEach(nation => {
        previousNationStances.push(nation.status.stance);
    });
}

/*
    This function removes both parties from each other's corresponding arrays after a relationship breakdown (either party becomes hostile), running only if the stance has changed to check this. It applies the 'severTies' function to each nation: see below.
*/

treatyWithdrawal = () => {
    if (stanceHasChanged) {
        nations.forEach(nation => {
            severTies(playerNation.internationalRelations, nation.name, nation);
            severTies(nation.internationalRelations, playerNation.name, nation);
        });
    }
}

/*
    Each nation will withdraw from a treaty once a nation involved becomes hostile.
    'severTies' takes 3 parameters in order to allow any diplomatic relations to be disbanded:

    relations = the array of treaties belonging to either the player or CPU nation.
    member = the name of either the player's nation or the CPU nation.
    nation = this is essential as 'severTies' is encased in a forEach, using a 'nation' argument.

    1. Loop through the player or CPU 'internationalRelations' object, holding the treaty arrays.
    2. If any of those arrays contain a member who is now also hostile, alert the player that both sides are now withdrawing from whatever relationship deal they were part of.
    3. Get the index of any specific hostile member involved, and use splice to remove them.
    4. The process is repeated on the player's nation and CPU nation - function is called twice.
*/

severTies = (relations, member, nation) => {

    for (relationship in relations) {
        if (relations[relationship].includes(member) && nation.status.stance === "hostile") {
            alert(`${member} is withdrawing from the ${relationship}`);
            let index = relations[relationship].indexOf(member);
            relations[relationship].splice(index, 1);
            removeAlliedColours(nation);
        }
    }
}

/*
    Of course, once an alliance is broken, the colour green must be removed from the allied nation. In order to do this, we loop through an array containing 'conquered' nations. If any of those nations are equal to the nations in the array - and their stance is hostile - that nation must now have a pact with the player. This nation is input into the vmap colour object where their colour is reset.
    
    Finally, the conquered nation array is returned without the nation that has now left. This is achieved using a filter method, populating the array only with nations not equal to the nation needing to be removed. The loop is then exited. 
*/

removeAlliedColours = (nation) => {

    for (let i = 0; i < nationsConqueredRegion.length; i++) {
        if (nation.status.stance === "hostile" &&
            nationsConqueredRegion[i] === nation.name) {
            
            $("#vmap").vectorMap("set", "colors", {
                [nationsConqueredCode[i]]: "#005FC5"
            });
            
            nationsConqueredRegion = nationsConqueredRegion.filter(value => value !== nationsConqueredRegion[i]);
            break;
        }
    }
}

/*
*************************************************************************************************
    GOVERNMENT LEADERSHIP & APPROVAL
*************************************************************************************************

    Government approval lowers when a you develop a hostile reputation or squander public finances. In 'lowerApprovalAggression', this displays a window alerting the player to their now aggressive stance approval decrease. The global 'LAAInvoked' bool prevents the function from running more than once as it exists inside the game's tick functions and would otherwise repeat every second. 'lowerApprovalBankruptcy' works the same way after checking whether the player's defence budget has dropped to 0 or below.
*/

lowerApprovalAggression = () => {

    if (playerNation.status.stance === "hostile" && !LAAInvoked) {
        swal(`${playerNation.name} Now Hostile`, "You have led the nation into an aggessive stance. Your people perceive you as a cruel tyrant.");
        playerNation.status.govtApprovalRating -= 2;
        LAAInvoked = true;
    }
}

lowerApprovalBankruptcy = () => {

    if (playerNation.resources.defenceBudget <= 0 && !LABInvoked) {
        swal(`${playerNation.name} Now Bankrupt`, "You have led the nation into bankruptcy, and your people are suffering. Try to balance your nation's books!");
        playerNation.status.govtApprovalRating -= 2;
        LABInvoked = true;
    }
}

/*
*************************************************************************************************
    GAME OVER: VICTORY & DEFEAT SCREENS
*************************************************************************************************

    This section determines what happens when the game is declared over, either through victory or defeat.
*/

/*
    WIN CONDITION
    
    Defeating a certain amount of nations will beat the game. Once that happens, 'checkForGameWin' determines what nation the player selected to beat the game and passes it to the 'initEndgame' function so that the nation not selected can be recommended for use in the next game. 
*/

checkForGameWin = () => {

    if (nationsConqueredRegion.length === 10) {
        if (playerNation.name === "Russian Federation") {
            initEndgame(USA.name);
        } else {
            initEndgame(Russia.name);
        }
    }
}

initEndgame = (nationName) => {

    let suggestion = swal("You Did It, Commander!", `You have conqured 10 of the world's nations. Try playing as the ${nationName} next game!`);
    suggestion;
    gameover();
    setEndTitles();
}

/*
*************************************************************************************************
    DEFEAT CONDITIONS: PLAYER & CPU
*************************************************************************************************
    
    Function also monitor the effects of public mood and feeling: one of those measurements in TOW is the resistance rating. If it drops too low for either side, public will and appetite for further conflict melts. For the player, that is game over. For the enemy, that is a conquered and subservient nation. Resistance ratings for the player can be lowered by war, nuclear strikes or terror attacks etc. It is similar for the enemy (minus terror attacks). 
    
    Government approval is unique to the player's leadership. If that drops too low, public confidence in you dissipates and you are removed from office. Both functions are invoked following events that alter these ratings.
*/

monitorNationResistance = (region, code) => {

    if (playerNation.status.resistance <= 10) {
        swal("DEFEAT", "You have failed in your mission, commander. \nYour people's resistance is now so low that there is no more desire for the struggle for supremacy. \nChaos reigns in the streets, and you have no option now but to step down before you are overthrown.");
        gameoverDefeated();
    } else if (targetNation.status.resistance <= 10) {
        nationsConqueredCode.push(code);
        colourDefeatedNations(code, "#AA0000");
    }
}

monitorPlayerApproval = () => {

    if (playerNation.status.govtApprovalRating <= 10 && !gameState.playerNuked) {
        swal("DEFEAT", "You have failed in your mission, commander. \nYour approval rating is too low and after a no-confidence vote, you have been removed from power.");
        gameoverDefeated();
    }
}

// Function attached to the button generated on the game over screen: allows player to restart

reloadGame = () => {
    gameOverTrack.pause();
    attemptingReboot.play();
    setTimeout(() => {
        location.reload();
    }, 3000);
}

// All game overs: pause music, disable sidebar & radar image, falsify game started bool 

gameover = () => {
    
    if ($(".sidebar").hasClass("open")) {
        $(".sidebar").toggleClass("open");
    }
    
    inGameTrack.pause();
    $(".title-overlay").addClass("darken-overlay");
    gameState.gameStarted = false;
    $(".sidebar button").attr("disabled", true);
    $(".radar").removeClass("slow-reveal");
}

// Dynamic game over screen: if player loses due to nuclear strike, display different image

gameOverImg = () => {

    if (gameState.playerNuked) {
        $(".status-overlay").append(`<img src="images/nuked-city.jpg" alt="city destroyed by nuclear blast" class="game-over-img" />`);
    } else {
        $(".status-overlay").append(`<img src="images/grief.jpg" alt="woman in despair on ground" class="game-over-img" />`);
    }
}

// Clear in-game elements so that overlay can display (append) game over screen elements

gameOverScreen = () => {
    $("#removable-status-content, .game-hud, .status-closebtn").remove();
    $(".status-overlay").addClass("status-open game-over-transition")
        .append(`<h2 class="end-header">GAME OVER</h2>`)
        .append(`<button type="button" class="reload-btn" onclick="reloadGame()">Reload</button>`);
}

// Defeated game over function nests applicable functions (see above)

gameoverDefeated = () => {
    gameover();
    gameOverTrack.play();
    gameOverTrack.loop = true;
    gameOverScreen();
    gameOverImg();
}

/*
*************************************************************************************************
    MAP INTERACTION (PLAYER COMMANDS)
*************************************************************************************************

    The player must be able to interact with each nation within the JQVMap object in order to issue certain commands. Essentially, these commands MUST have a desired map target to work and they are found in the sidebar action menu. They call functions embedded in the player's nation class object (see classes.js).
    
    Code found elsewhere that displays the status screen when the player clicks their own nation also serves to prevent the player using the commands on their own nation.
    
    When a player selects an action and then a nation, the corresponding action in the 'commands' object literal has it's value set to true (checked in the switch statement) - this is how the program knows which action is selected and therefore which function to invoke. Most functions require the JQVMap-exclusive 'region' and 'code' arguments to be passed into them to log the regions being interacted with.
*/

handlePlayerActions = (region, code) => {

    switch (true) {

        case commands.attack:
            playerNation.attackNation(region, code, targetNation);
            break;

        case commands.deploy:
            playerNation.deployForces(region);
            break;

        case commands.recon:
            playerNation.deployAgents(region, code);
            break;

        case commands.sabotage:
            playerNation.undertakeSabotage(region, code, targetNation);
            break;

        case commands.incite:
            playerNation.inciteRebellion(region, code);
            break;

        case commands.diplomacy:
            playerNation.negotiation(region, code, targetNation);
            break;

        case commands.spying:
            playerNation.spySatellite(region, code);
            break;

        case commands.launchNuclearMissile:
            playerNation.nuclearStrike(region, code);
            break;

        case commands.fireParticleCannon:
            playerNation.particleCannonStrike(region, code);
            break;

        case commands.allianceReinforcement:
            playerNation.requestAllianceReinforcement(region, targetNation);
            break;

        case commands.hacking:
            playerNation.hackFunds(region, targetNation);
            break;

        default:
            console.log("No player actions selected.");
    }
}

/*
*************************************************************************************************
    JQVMAP OBJECT & FUNCTIONALITY: THE ENGINE OF THEATRE OF WAR
*************************************************************************************************
    
    JQVMaps has built-in click and hover events of its own. However, for my purposes, they were rather limited: capable initially of only displaying a name of a country using the 'region' parameter, for instance. I have edited the basic options of the map object, but I have also had to program extensive functionality into the object to accomodate the design of Theater of War.
    
    I have basically combined the fuel of the game - the nation class objects - with the engine of the game - the map object (specifically the click and hover events).
    
    Various functions operate here in order for the game to work.
*/
    
/*
    Disallow all interaction with nations already conquered (if region exists in 'conquered' array), but only if they are not also in the alliance array (allied to the player). The AND condition ensures that the allied nation can still be clicked on to initiate the allied reinforcement request.
*/ 

conqueredNation = (region) => {
    
    for (let i = 0; i < nationsConqueredRegion.length; i++) {
        if (nationsConqueredRegion[i] === region && !playerNation.internationalRelations.alliances.includes(region)) {
            swal(`${region}`, "Nation Conquered / Allied");
            return true;
        }
    }
}

/*
    When clicking on a nation, intel recovered by agents regarding it will be displayed. When intel on a nation is successfully retreived, the nation that it is regarding is stored in an array. If that matches the JQVMap 'region' argument (therefore the nation clicked on), it is shown using JSON stringify. This shows the player the full nation class object with all its data in all its glory. Otherwise, it will display a different message.
*/

showIntel = (region, targetNation) => {

    const noIntelAlert = swal(`${region}`, "Send agents or use satellites to spy on this nation.");

    playerNation.surveillance.infiltratedNations.forEach(nation => {
        if (!playerNation.surveillance.infiltratedNations.length) {
            noIntelAlert;
        } else if (targetNation.name === nation) {
            const stringifiedNationInfo = JSON.stringify(targetNation, null, 4);
            swal(stringifiedNationInfo);
        } else {
            noIntelAlert;
        }
    });
}

/*
    NATION TOOLTIPS
    
    JQVMaps is capable only of showing a nation's name and very little other info. I have programmed custom labels into the game to show important and useful tactical information about each nation in the form of tooltips. 
    
    'event', 'label' and 'code' are JQVMap-specific, and they are passed as arguments into my own 'showNationLabel' function, which adds HTML into the JQVMap label (tooltip on hover) to show the stance, gdp and resistance rating of the highlighted nation.
    
    It loops through all nations on nation hover and if there is a match with the label name text and name in my nation array, it sets the target nation as the nation from my nation array, therefore providing all of its object / class properties. 
    
    Finally, it sets the text inside the JQVMap label to display the above information. The stance attribute is enclosed inside a span as I wished to edit the colour of this information in the CSS to make it more clear and obvious for the player: stance affects a LOT of gameplay mechanics in TOW.
*/

showNationLabel = (event, label, code) => {

    for (let i = 0; i < nations.length; i++) {
        if (nations[i].name === label[0].innerHTML) {
            targetNation = nations[i];
        }
    }
    label[0].innerHTML = label[0].innerHTML +
        `<br> Stance: <span id="stance">${targetNation.status.stance}</span> <br> 
            GDP: ${targetNation.gdp} <br> 
            Resistance: ${targetNation.status.resistance}`;
}

/*
    Basic map click events are enclosed in this function: the 'gameState.targetNationSelected' aids other functions in detecting whether a nation is selected or not - this prevents bugs with concurrent events. For example, a player may select a nation to attack and then the random event function may select the same nation to attack the player! 
    A sound effect also plays when a nation is clicked, and the status of a nation is shown to the player if they click their own selected nation. The region parameter is required to check which nation that is (see later).
    
    All map events need to pass region and code arguments to track and colour the nations of the map.
*/

basicMapEvents = (region, code) => {
    gameState.targetNationSelected = true;
    nationSelect.play();
    showStatusPlayerNation(region);
}

/*
    Core map events involve player-to-map interaction, intel displays and the setting of the nation's map object on click. 
    
    The first if statement prevents these functions running on the player's own nation before looping through all nations (objects) in the game. If the name in the object matches the region, its data is shown in a swal and player actions are handled for that nation (see above).
    
    NOTE: the 'targetNation' var is one of the game's most important, since it is always set as whatever nation object is clicked on. In effect, each time the player clicks a nation on the map, the nations array is iterated through, matched with the region and therefore its object characteristics can be accessed.
*/

coreMapEvents = (region, code) => {

    if (region !== playerNation.name) {
        for (let i = 0; i < nations.length; i++) {
            if (nations[i].name === region) {
                targetNation = nations[i];
                showIntel(region, targetNation);
                handlePlayerActions(region, code);
            }
        }
    }
}

/*
*************************************************************************************************
    JQVMAP INITIALIZATION, SETUP & INTERACTION
*************************************************************************************************

    The above functions are all invoked when interacting with the JQVMap API, which is itself set up as an object below. The options can all be configured here to the users preferences. Withinn the 'onLabelShow' key I have set my custom label (tooltip) functions, and 'onRegionClick' sees the JQVMap 'element, code, region' arguments passed to my own custom map functions in order to form the basis of all map interactions within TOW. 'gameState.targetNationSelected = false' is set to false after click: it tracks whether nations on the map have been clicked to prevent concurrency - see above. Map styling was inspired by Defcon's ominous tactical world map.
    
    'selectedColor' has been set to undefined to prevent interference with nation colour changes after game events: JQVMap otherwise will colour a nation itself each time it is clicked, so this is prevented. All other options shown in initMap are defined by me, including functions.
*/

initMap = () => {

    $('#vmap').vectorMap({
        backgroundColor: '#151515',
        borderColor: '#151515',
        color: '#005FC5',
        hoverColor: '#12CEFC',
        selectedColor: '',
        onLabelShow: (event, label, code) => {
            showNationLabel(event, label, code);
        },
        onRegionClick: (element, code, region) => {
            if (conqueredNation(region)) return;
            basicMapEvents(region, code);
            coreMapEvents(region, code);
            gameState.targetNationSelected = false;
        }
    });
}

/*
*************************************************************************************************
    FINALISING GAME SETUP
*************************************************************************************************

    Once the game map is rendered, we must show the initial statuses in the DOM once a playable nation is defined (selected). As a result, 'playerNation' being defined is essential for the game to run here on in. This parent function runs all the visual elements that display information for the player and defines their own stance in the game, which is initially set as 10 (friendly). This function runs constantly, to ensure that any changes to the game objects are recorded in the DOM.
*/ 

completeSetup = () => {

    const handleInterval = setInterval(() => {

        if (typeof playerNation !== "undefined") {
            clearInterval(handleInterval);
            displayResearcherInfo();
            displayMainStatus();
            displayNationNameStatus();
            definePlayerStance();
        }
    }, 0);
}

/*
*************************************************************************************************
    GAME START & TICK FUNCTIONS
*************************************************************************************************

    This parent function runs every 2 seconds along with the functions nested within it that are vital for the game's flow and dynamism. It is another core engine component of TOW that monitors the game's state, tracking all changes of status every second, informing the player and enabling action and reactions to the game events.
    
    Once the game has started, the main status (DOM info regarding the player's selected nation) is constantly refreshed ('displayMainStatus'). The other functions are discussed elsewhere, but you can see here that the 'attackPlayer' function is set up here, with a random time between 10 and 15 minutes determining when it is invoked. Essentially, a random attack won't occur for at least 10 minutes at a time. This can be adjusted easily by passing different min and max millisecond arguments into the function below. 
    
    If one wishes, one week & one month in real-time is: 604800000 / 2629800000 (ms). Here, it is set to a random time between 10 and 15 minutes (600000 & 900000 ms).
*/

gameTickFunctions = () => {

    setInterval(() => {
        if (gameState.gameStarted) {
            displayMainStatus();
            checkForGameWin();
            monitorPlayerApproval();
            lowerApprovalAggression();
            lowerApprovalBankruptcy();
            detectStanceChange();
        }
    }, 2000);
    
    setInterval(attackPlayer, RNG(200000, 300000));
}

/*
    START GAME
    
    Start game is called once the player has selected their nation, following the intro. 
    
    The bool allows the sidebar to be activated once the game begins. In addition, the game's music function is called and the tracklist started, and the game's 'clock' (time object) is called. The tick functions are then run and after 8 seconds the nation select screen is removed to show the world map. The UI then becomes visible to the player and if they have chosen to skip the intro, will now be in full control of the game which is fully underway at this point.
*/

startGame = () => {

    gameState.gameStarted = true;
    playinGameTracks(currentTrack);
    gameState.time();
    gameTickFunctions();

    setTimeout(() => {
        removeNationSelectElements();
        $(".options-container").addClass("displayBlock");
    }, 8000);
}

/*
***********************************************************************************************
    IN-GAME FLOW SCREENS: NATION SELECT
***********************************************************************************************

    There are many, many animations and transitions created in TOW that are designed to add a touch of polish and style to the game. Most of the UI elements are created one after another, and are removed when necessary as the game progresses. There is also a full UI designed to work with it but admittedly, like other features and mechanics found in TOW, I have not had the time necessary to flesh everything out. Nevertheless, most game renders can be found in the functions below.
    
    Most of these scripts use jQuery to add or remove elements or classes or run animations.
    
    'renderNationSelectScreen' produces the first screen rendered after the game's intro has concluded - the screen where the player can choose a nation to lead. The 'lock-display' class is toggled off to allow screen scrolling after the intro.
*/

renderNationSelectScreen = () => {

    $("html, body").toggleClass("lock-display");
    $("#skip-intro-btn, #story-scroll-text, .main-titles").remove();
    $(".title-overlay").removeClass("displayBlock");
    renderNationSelectImages();
    $(".title-screen").append("<h1 class='nation-select-title wargate'>Select Your Nation</h1>");
}

// Render the nation images that the player clicks to select their nation

renderNationSelectImages = () => {

    $(".title-overlay").addClass("displayBlock");
    $(".title-screen").append("<div id='nation-select'>");
    $("#nation-select")
        .append("<img id='usa' class='nation-img-usa' src='images/usa.png'/>")
        .append("<img id='russia' class='nation-img-russia' src='images/russia.png'/>");
}

// Clear overlay for subsequent content such as game over screen etc

removeNationSelectElements = () => {
    $("#nation-select, .nation-select-title").remove();
}

// Intro can be skipped: bool is false if user does not click 'quick start' button

skipTutorial = () => {
    if (gameState.skipIntro) {
        startGame();
    }
}

// Animation with nation selected and final touches before game starts: see 'nationSelected' below

setupGameStart = () => {

    nationSelectTrack.pause();
    highlightSelectedNation();
    skipTutorial();

    if (playerNation === USA) {
        nationSelected("#us", 
                       "img#russia", 
                       ".nation-select-title", 
                       "country-select-animation", 
                       "img-fade-out", 
                       "marginAuto");
    } else {
        nationSelected("#ru", 
                       "img#usa", 
                       ".nation-select-title", 
                       "country-select-animation", 
                       "img-fade-out", 
                       "marginAuto");
    }
}

/*
    When a nation is selected, display a message and option to cancel. If selected, the crucial 'playerNation' var is assigned as the respective USA or Russia onbject defined in the classes.js script. The oil and fiscal budgets are set and the animation functionality showing the nation chosen will run. 
    
    This happens on click and the text and nation object arguments are passed into the function. Combined, these methods provide the option to select the United States or the Russian Federation, and have its respective object assigned to the player.
    
    If the player has already selected a nation, the if / return statement prevents them from constantly clicking on a nation to select and therefore constantly running the subsequent code.
*/

setupNation = (text, nation) => {

    if (playerNation !== undefined) return;

    swal(text, "Choose to play as this nation?", {
        buttons: {
            cancel: "No",
            confirm: {
                value: "confirm",
            },
        },
    }).then((value) => {
        if (value) {
            playerNation = nation;
            defineOilAndBudgets();
            setupGameStart();
        }
    });
}

$(document).on("click", "img#usa", () => {
    setupNation("United States of America", USA);
});

$(document).on("click", "img#russia", () => {
    setupNation("Russian Federation", Russia);
});

/* 
    The original oil and budgets for a nation need to stored as we need to increment each by its own self after one year. Basically, a nation has their original budgets reassigned to them each year - somewhat mimicking how nations have income each year in the real-world. The catch is that you have to survive the year!
*/

defineOilAndBudgets = () => {
    dailyOilProduction = playerNation.resources.oilProduction;
    originalDailyOilProduction = dailyOilProduction;
    yearlyDefenceBudget = playerNation.resources.defenceBudget;
    yearlyGDP = playerNation.gdp;
}

// Light up the player's chosen nation on the world map once selected. Colour can be adjusted

highlightSelectedNation = () => {

    if (playerNation === Russia) {
        $("#vmap").vectorMap("set", "colors", {
            ru: "#FFF"
        });
    } else {
        $("#vmap").vectorMap("set", "colors", {
            us: "#FFF"
        });
    }
}

// Radar fades in with voice sample after nation has been selected

addRadarWithAlert = () => {
    $(".radar").addClass("slow-reveal");
    systemsOnline.play();
}

/*
    Function taking multiple parameters in order to produce what follows after a nation is selected. As this is similar for each nation, this function saved much repeated code. It just has the approprate nation id elements inserted so that the correct images, text, CSS classes and logos can be shown for the nation selected. It also removes certain elements and activates the game's tutorial if the skip-intro bool is not truthy. 
*/

nationSelected = (nationId, imageId, element, class1, class2, class3) => {

    $(nationId).addClass(class1);
    $(imageId).addClass(class2);
    setTimeout(() => {
        $(imageId).remove().addClass(class3);
        $(element).text(playerNation.name);
        removeTitleOverlay();
    }, 3000);
    displayNationLogo();
    if (!gameState.skipIntro) scrollToMap();
    addRadarWithAlert();
    displayNationNameStatus();
}

// Display nation logo at the top of the game screen once chosen

displayNationLogo = () => {
    if (playerNation === USA) {
        $("#logo-section").append("<img class='logo-usa' src='images/usa-logo.png'/>");
    } else {
        $("#logo-section").append("<img class='logo-russia' src='images/russia-logo.png'/>");
    }
}

// Once all titles and nation select stages have concluded, clear title overlay from DOM

removeTitleOverlay = () => {
    setTimeout(() => {
        $(".title-overlay").removeClass("displayBlock");
    }, 3000);
}

// Remove story text block on overlay once intro animation has finished, allowing titles to show

$("#story-scroll-text").on("animationend", () => {
    $("#story-scroll-text").remove();
    introTrack.pause();
    mainTitleTrack.play();
});

/*
*************************************************************************************************
    TUTORIAL ANIMATIONS
*************************************************************************************************

    If the player watches the entire intro and clicks the start game button in TOW once the opening titles have concluded, an intro will run, visually outlining the control basics of the game.
    
    Beginning the sequence, the 'scrollToMap' function begins by playing the tutorial track, and scrolling down to the relevant sections to be discussed in swal messages. After set intervals, other tutorials activate and either another scroll ensues or animation runs.
    
    The 'lock-display' CSS class is toggled off to re-enable scrolling after the last animation & intro has ended (the intro locks the screen into place to prevent the player scrolling around whilst the story text rolls).
*/

scrollToMap = () => {

    tutorialTrack.play();

    setTimeout(() => {
        $("html, body").animate({
            scrollTop: $(".scroll-target-map").offset().top
        }, 3000);
        setTimeout(() => {
            mapTutorial();
            scrollToPanel();
            $("html, body").toggleClass("lock-display");
        }, 3200);
    }, 4000);
}

scrollToPanel = () => {

    setTimeout(() => {
        $("html, body").animate({
            scrollTop: $("#scroll-target-cpanel").offset().top
        }, 3000);
        setTimeout(() => {
            controlPanelTutorial();
        }, 4000);
    }, 4000);
}

mapTutorial = () => {
    $(".options-container").addClass("displayBlock");
    swal("Tactical Map", "This is your Theatre of War");
}

controlPanelTutorial = () => {

    swal("Control Panel", "Access facility construction, upgrades and manufacturing processes.");

    setTimeout(() => {
        statusTutorial();
    }, 5000);
}

statusTutorial = () => {

    $(".status-overlay").addClass("status-open");

    setTimeout(() => {
        swal("Status Screen", "Use the Status Screen button to view your nation's overall health. \n\n The Fast Forward button found at the top of the screen will jump forward a whole day each time it is pressed, allowing buildings and other events to finish quicker.");

        setTimeout(() => {
            buildQueueFFwdTutorial();
        }, 6000);
    }, 1000);
}

buildQueueFFwdTutorial = () => {

    $(".status-overlay").removeClass("status-open");

    setTimeout(() => {
        $(".sidebar").toggleClass("open");
        setTimeout(() => {
            swal("Command Menu", "This is where you will make decisions that will change the world. Forever. Use this 'commands' button (or the S key) to give orders. Click on the button, and then click on an area of the world map to execute them.");
            setTimeout(() => {
                endTutorial();
            }, 10000);
        }, 1200);
    }, 1000);
}

// Close the sidebar following the last tutorial and start the game

endTutorial = () => {
    $(".sidebar").toggleClass("open");
    $("html, body").toggleClass("lock-display");
    swal("Good Luck, Commander", "The world and it's events are now in motion.");
    tutorialTrack.pause();
    startGame();
}

/*
*************************************************************************************************
    GAME OVER (VICTORY): ENDING TITLES 
*************************************************************************************************

    If the player should beat the game, they will be treated to the game's credits, a victory screen ending and music unique to the nation they are playing as. Pretty nice, eh?
*/

// Activate game over to stop game, remove unecessary elements and run end title script

setEndTitles = () => {
    
    gameover();
    $("#story-scroll-text, #skip-intro-btn, .options-container, .main-titles, .game-hud").remove();
    $("html, body").toggleClass("lock-display");
    $(".title-overlay").addClass("displayBlock");
    $(".options-container").removeClass("displayBlock");
    runEndTitles();
}

// Determine which nation's end titles should be inserted back into DOM and enacted

runEndTitles = () => {

    missionCompleted.play();
    $(".title-overlay-text").addClass("new-top-setting");
    insertVictoryImage();

    if (playerNation.name === "Russian Federation") {
        $(".end-titles-russia").addClass("displayBlock");
        playEndTheme(ruAnthem);
    } else {
        $(".end-titles-usa").addClass("displayBlock");
        playEndTheme(usAnthemInstrumental);
    }
}

// 4 seconds after the game ends, pass the nation's anthem as the end music

playEndTheme = (endTheme) => {
    setTimeout(() => {
        endTheme.play();
    }, 4000);
}

// Reveal all elements of the victory screen

renderVictoryScreen = () => {
    $(".victory-heading, .authour-credit, #reload-btn, .victory-img").addClass("reveal");
    $(".end-text-1, .end-text-2, .end-text-3").addClass("reveal-flame");
}

// Display nation's image and remove the ending text so it displays correctly onscreen

selectImg = (element, imgSrc) => {
    $(element).remove();
    $(".victory-img-section").append("<img class='victory-img' src=" + imgSrc + "/>");
}

// Display the victory image section first, then render all other elements and animations 

insertVictoryImage = () => {

    $(".victory-img-section").addClass("displayBlock");

    $(".end-titles-usa, .end-titles-russia").on("animationend", () => {
        if (playerNation.name === "Russian Federation") {
            selectImg(".end-titles-russia", 'images/russia-victory.png')
        } else {
            selectImg(".end-titles-usa", 'images/usa-victory.png');
        }
        renderVictoryScreen();
    });
}