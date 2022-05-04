/*
    jQuery is essential to run the game. I decided to inform the user of this because occasionally jQuery can fail to load even with the correct scripts available. I inform them that they should try again to prevent them from thinking the game is broken and giving up. 

    SweetAlert.js should not be used here: in the event that the client's internet is not connected, that won't run and so neither will the sweet alert and therefore the function.
*/

window.onload = () => {
    if (!window.jQuery) {
        alert("jQuery Not Loaded \n\njQuery is essential for this app to run. Please refresh the page as it is likely that the server was down or internet was unavailable.");
    }
}

// **** NATION CONSTRUCTION FUNCTIONS ****


// Random Number Generator: set range for use when defining all nation objects (data & stats)

const RNG = (min, max) => Math.floor(Math.random() * (max - min) + min);

/* 
    Clear previous commands so that latest button clicked can run. Difference between use when clicking the button is that the game will not ask the user if it wants to run the function again, unless the corresponding button is again clicked.
    The 'conscription' command must be exempt - otherwise, clicking on an alternate command button whilst conscription is active will cancel the conscription function - which relies on the its command method being truthy in order to run.
*/

clearPrevious = () => {

    for (const command in commands) {
        if (command === "conscription") {
            continue;
        }
        commands[command] = false;
    }
}

/*
    This function handles the darkening of the screen via an overlay with diminishing opacity. The overlay is displayed and a css class handles the animation / effect. Following this, the story text will scroll and the intro track will play.
*/

intro = () => {
    $(".title-overlay").addClass("displayBlock");
    introTrack.play();
}

// Function Probability - return a random number between a specified input range

probability = (n => Math.random() < n);

// Function that more easily deals with the adding of totals in the game

sum = (array => array.reduce((total, currentValue) => total + currentValue, 0));

// Execute monthly actions here, ie expenditures
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
// Execute daily actions here, ie expenditures
dailyActions = () => {
    militaryOilExpenditure();
    generalResourceExpenditure();
}
// Execute yearly action. Only one, which resetns defence budget
yearlyActions = () => {
    defenceBudgetGDP();
}

/*
    Time in this game passes similarly to real life, with periods measured in daily, weekly, monthly and yearly intervals. To make sure that the measurement of an individual calendar month is as accurate as possible, the day count is initiated as a float (see globals). This is so that I can bolt on an additional 30.41 onto the day count when checking if a month has elapsed.
    If we divide the number of days in a year (365) by the number of months in a year (12), the number is 30.41 - the average length of a month. Hence, after 30 days, the player will be subject to a monthly report, with their unit maintainance and other upkeeps requiring expenditure.

    The user agent can see what day, week, month or year it is. All of them are set as variables, all of which initially require rounding up (not down) with Math.ceil. If not rounded up, the functions use this code for carrying out other operations will produce bugs. Division is used to accurately measure how long each period is (ie, 7 days in a week = day / 7). I then use jQuery to insert the periods into the DOM.

    Two setIntervals are operating in this function. The first displays the passage of time by incrementing the days (therefore the weeks, months and years, eventually) every 5 minutes. This is not a real-time strategy game: days pass every 5 mins. The final setInterval tracks when over 30 days have passed (an average month) and they then 'monthlyActions' is called, a parent / carrier function that contains other functions containing various scripts, such as billing the player for the upkeep of any bases that they own etc.

    Finally, if the 'monthlyInterval' variable is not reset after a month has elapsed, the monthly actions will run only once at the end of the first 30 days and never again. Setting this again is my way of ensuring that the script sees runtime every 30.4 days - every month.
*/


// Main time functionality, disabled if no jQuery or game start, preventing repeated errors to console.

addTimeDOM = (week, month) => {
    $("#day").text("DAY: " + parseInt(day++));
    $("#week").text("WEEK: " + week);
    $("#month").text("MONTH: " + month);
}

// setInterval detects a week before month up but includes failsafe to stop repeat

trackDueExpenditure = (monthlyInterval) => {

    const handleInterval = setInterval(() => {

        if (day >= monthlyInterval - 7 && day <= monthlyInterval - 6) {
            expenditureAlert();
            clearInterval(handleInterval);
        }

    }, 200);
}

// Also resets intervals

milestones = (monthlyInterval, yearlyInterval, currentYear) => {

    if (day >= monthlyInterval) {
        //monthlyActions();
    } else if (day >= yearlyInterval) {
        currentYear++;
        $("#year").text("YEAR: " + currentYear);
        yearlyActions();
    }
}

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
        //trackDueExpenditure(monthlyInterval);
        checkConscription(monthlyInterval);
        milestones(monthlyInterval, yearlyInterval, currentYear);

        if (day >= monthlyInterval) {
            monthlyInterval = day + 30.41;
        } else if (day >= yearlyInterval) {
            yearlyInterval = day + 365;
        }

    }, 2000);
}

checkConscription = (monthlyInterval) => {
    if (commands.conscription) conscriptTroops(monthlyInterval);
}

// Skip forward in time via ui click (1 day per click)
fastForward = (monthlyInterval) => {
    $("#day").text("DAY: " + parseInt(day++));
    $("#week").text("WEEK: " + Math.ceil(day / 7));
    checkConscription(monthlyInterval);
}


/*

*************************************************************************************************

    BUILDING & TRAINING INTERFACE: FUNCTIONS 

    Base facilities and construction are represented as a 'Base' class, which ultimately keeps track of what facilities are built and allows other functions of the game to act on that premise - for instance, if a player has structures, those must be maintained and a cost for their upkeep will be deducted at the end of each month.

*************************************************************************************************

*/


// Adds the building to the new 'Buildings' instance derived from the 'Base' class
// Base object then tracks what has been constructed and ultimately what can be built

confirmConstruction = (structureKey, structureValue, cost) => {

    swal({
        title: `Construction Complete: ${structureValue}`,
        icon: "success"
    });

    constructionComplete.play();
    structureKey = structureValue;
    playerBase[structureKey] = structureKey;
    playerNation.resources.defenceBudget -= cost;
}

constructionManager = (structureKey, structureValue, daysToBuild, cost, value) => {

    const structureCost = cost;
    const buildTime = daysToBuild;
    swal(`Construct ${structureValue}?`,
        `ETA: ${buildTime} days 
        Cost: $${cost}`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            confirmPurchase(structureValue);
            swal("Building");

            const handleInterval = setInterval(() => {
                if (day === buildTime) {
                    clearInterval(handleInterval);
                    confirmConstruction(structureKey, structureValue, cost);
                }
            }, 0);
        }
    });
}

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

alertUnitBuilding = (unitType) => {

    if (unitType === "nuclearWeapons" || unitType === "satellites") {
        swal("Building");
    } else {
        swal("Training");
    }
}

alertUnitReady = (unitType, numberOfUnits) => {

    if (unitType === "nuclearWeapons" || unitType === "satellites") {
        constructionComplete.play();
    } else {
        unitReady.play();
    }

    swal({
        title: "Units Ready",
        text: `${numberOfUnits} ${unitType} have entered service, commander.`,
        icon: "success"
    });
}

addUnits = (playerUnits, unitType, numberOfUnits, unitCost) => {
    playerUnits[unitType] += numberOfUnits;
    playerNation.resources.defenceBudget -= unitCost;
}

// Are units affordable? Is there more than zero selected for building / training?

processUnitTraining = (quantity, cost, playerUnits, unitType) => {

    const numberOfUnits = quantity;
    const unitCost = numberOfUnits * cost;

    if (checkFunds(unitCost)) return;
    if (disallowZeroUnits(quantity)) return;

    const timeFactor = 0.10;
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

*/


// DAILY EXPENDITURE

// Player oil supply is how much oil player actually has
// Oil: production minus consumption, daily

generalResourceExpenditure = () => {
    dailyOilProduction += originalDailyOilProduction - playerNation.resources.oilConsumption;
    playerNation.resources.oilProduction = dailyOilProduction;
}

// Oil used by military units each day
// Assets covered by the defence budget
// If units are deployed, they use 20% more oil

militaryOilExpenditure = () => {

    const militaryUnitsOilExpenditure = [
    playerNation.militaryUnits.air * 1000,
    playerNation.militaryUnits.naval * 1500,
    playerNation.militaryUnits.tanks * 2000
];

    if (gameState.unitsOnCampaign) {
        militaryUnitsOilExpenditure.forEach((unit) => {
            unit += (20 / 100) * unit;
        });
    }

    playerNation.resources.oilProduction -= Math.trunc(sum(militaryUnitsOilExpenditure));
}

// MONTHLY EXPENDITURE

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
    alert(`Military (including any Nuclear Programmes): $${sum(unitsToMaintain)}`);
}

/*
    Iterate through the player's base and structure maintenance object, deducting costs for any buildings that exist (if base buidings are not undefined, take respective cost for that building for that month).
*/

baseExpenditure = () => {

    baseMaintenanceTotals = [];

    for (const value in playerBase) {
        if (playerBase[value] !== undefined) {
            playerNation.resources.defenceBudget -= structureMaintenance[value];
            alert(`${value}: ${structureMaintenance[value]}`);
            baseMaintenanceTotals.push(structureMaintenance[value]);
        }
    }

    alert(`Monthly Base Maintenance Report: - $${sum(baseMaintenanceTotals)}`);
}

expenditureReport = () => {

    swal({
        title: "Monthly Expenditure Report",
        text: `Current GDP: $${playerNation.gdp},
        Current Defence Budget: $${playerNation.resources.defenceBudget}`,
        icon: "info"
    });
}

// Alert player to incoming monthly expenditures (embedded in 'runGameTime' fn)

expenditureAlert = () => {
    swal({
        title: "Expenditures Due: 1 Week",
        icon: "warning"
    });
}

// WHEN NUCLEAR PROGRAMME ACTIVE, COST IS $65,000,000,000???

nuclearExpenditure = (unitsToMaintain) => {
    if (playerNation.specialWeapons.nuclearWeapons) unitsToMaintain.push(300);
}


/*

*************************************************************************************************
    
    INCOME: SOURCES OF REVENUE FOR PLAYER'S NATION
 

*************************************************************************************************

*/


// MONTHLY REVENUES

// Tally up the arrays holding player's resources from other nations & award monthly

resourceIncome = () => {
    playerNation.resources.defenceBudget += Math.trunc(sum(defeatedNationGDP));
    playerNation.resources.oilProduction += Math.trunc(sum(defeatedNationOil));
}

// Yearly revenue

defenceBudgetGDP = () => {
    playerNation.resources.defenceBudget += yearlyDefenceBudget;
    playerNation.gdp += yearlyGDP;
    swal("Yearly GDP and Defence Budget Allocated",
        `GDP: $${playerNation.gdp} 
    Defence Budget: $${playerNation.resources.defenceBudget}`);
}

/*

*************************************************************************************************
    
    TRADE: OIL & WEAPONS
 

*************************************************************************************************

*/

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

confirmOilSale = (numberOfBarrels, oilSalePrice) => {

    sale.play();
    playerNation.resources.oilProduction -= numberOfBarrels;
    playerNation.resources.defenceBudget += oilSalePrice;

    swal({
        title: "Sale Successful",
        text: `Oil remaining: ${playerNation.resources.oilProduction} barrels.`,
        icon: "success"
    });
}

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

confirmWeaponSale = (numberOfWeapons, weaponSalePrice) => {

    sale.play();
    playerNation.resources.weaponStocks -= numberOfWeapons;
    playerNation.resources.defenceBudget += weaponSalePrice;

    swal({
        title: "Sale Successful",
        text: `Weapons remaining: ${playerNation.resources.weaponStocks}.`,
        icon: "success"
    });
}

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

addWeapons = (numberOfWeapons) => {

    constructionComplete.play();
    playerNation.resources.weaponStocks += numberOfWeapons;

    swal({
        title: "Manufacture Complete",
        text: `Weapons in stock: ${playerNation.resources.weaponStocks}.`,
        icon: "success"
    });
}

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

*************************************************************************************************
    
    UPGRADES & RESEARCH: All research requires research personnel, and amount affects speed
 

*************************************************************************************************

*/


// Time factor to be in increments of 1000s, ie 6000 for 60 days if 100 researchers

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

    // Divide timefactor by researchers, then add day - otherwise get strange results
    let timeToCompleteProject = Math.trunc(day + (timeFactor / researcherAllocation));

    researchProjectStart(researcherAllocation, researchProject, costOfResearch, timeToCompleteProject);
}

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

// Upgrade military units: aircraft, infantry, navy and armour

upgradeUnits = (costOfUpgrade, unitToUpgrade, ratingToIncrease, upgradeValue) => {

    const cost = costOfUpgrade;
    const upgradeUnit = unitToUpgrade;
    const ratingIncrease = ratingToIncrease;

    swal({
        title: "Upgrade Successful",
        text: `Upgrading ${unitToUpgrade} for ${costOfUpgrade}`,
        icon: "success"
    });

    upgradeComplete.play();
    playerNation.resources.defenceBudget -= costOfUpgrade;
    playerNation.unitTechAndSkillRating[ratingToIncrease] += upgradeValue;
}

// Next 2 functions check that there are researchers hired, and whether any are available

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

setResearchAndCostFactor = (costOfResearch, timeFactor) => {
    return [costOfResearch, timeFactor];
}

getResearchersAvailable = () => {
    researchersAvailable = playerNation.researchers - Math.trunc(sum(researchersAssigned));
    $("#researchers-available").text(" " + researchersAvailable);
}

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

alertProjectComplete = (researchProject) => {

    swal({
        title: `Project ${researchProject} Complete.`,
        icon: "success"
    });

    if (researchProject === "particleCannon") {
        constructionComplete.play();
    } else {
        upgradeComplete.play();
    }
}

// effects of research, assigning researchers
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

// 'removeAssignedResearchers' MUST BE REDECLARED TO CHECK CURRENT AMOUNT OF RESEARCHERS!!!

removeAssignedResearchers = (researcherAllocation) => {

    getResearchersAvailable();

    for (let i = 0; i < researchersAssigned.length; i++) {
        if (researcherAllocation == researchersAssigned[i]) {
            researchersAssigned.splice(i, 1);
            break;
        }
    }
}

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

// Set the max value of researchers available in html as player's total researcher number

displayResearcherInfo = () => {
    $("#researcher-allocation").attr("max", playerNation.researchers);
    $("#researchers-employed").text(" " + playerNation.researchers);
    $("#researchers-available").text(" " + playerNation.researchers);
}


/*

*************************************************************************************************
    
    MONTHLY REPORT DISPLAY: Show useful info to player, such as unit info and budget etc.
 
    

*************************************************************************************************

*/


outputMainStats = () => {

    $("li").remove();
    $("#overview").append(`<li>GDP: $ ${playerNation.gdp}</li>`)
        .append(`<li>Defence Budget: $ ${playerNation.resources.defenceBudget}</li>`)
        .append(`<li>Researchers Employed: ${playerNation.researchers}</li>`)
        .append(`<li>Nations Conquered: ${nationsConqueredCode.length}</li>`)
        .append(`<li>Public Approval: ${playerNation.status.govtApprovalRating}</li>`)
        .append(`<li>Agents Imprisoned: ${nationsHoldingAgents.length}</li>`);
}


outputAuxStats = (info) => {

    info.forEach(item => {
        for (const value in item) {
            if (value === "defenceBudget") {
                continue;
            }
            $("#overview").append(`<li>${value}: ${item[value]}</li>`);
        }
    });
}

// Main status: overview of all the main stats in the game

// Print resources to DOM with jQuery chaining

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
    
    WARFARE: CONVENTIONAL OR NUCLEAR - WHATEVER FLOATS YOUR BOAT
 
    There are many ways to deal with other pesky nations in TOW. They need not all be overt, neither, but this section is dedicated to the forceful removal of those who stand in your way. As such, any diplomats among you should look away now.

*************************************************************************************************

*/


/* 
    Military battles are uniquely calculated to account for drastic differences in a nation's military force. The formulas below scale well, returning reasonable results whether a country has an army in the millions or the dozens.

    Instead of a 'tech' rating, infantry possess a 'skill' attribute that helps them to sway the course of a battle. The formula ensures that both infantry skill and numbers contribute to the course of a battle, and all being equal, a difference in any of these factors will play a deciding factor in the outcome. If numbers are even, the skill of a nation's infantry will be decisive, and vice versa. If all factors are equal, control flow can decide a course of action for the player.

    Player infantry strength: (players infantry skill / 100) * player infantry numbers
    Enemy infantry strength: (enemy infantry skill / 100) * enemy infantry numbers

    After calculating the player infantry strength and the enemy infantry strength using the above, they are subtracted from each other for each opposing nation to determine remaining infantry numbers on both sides - and therefore the course of the battle:

    Troops remaing for player: player infantry strength - enemy infantry strength
    Troops remaining for the enemy: enemy infantry strength - player infantry strength
*/


/* 
    Attacking a region is undertaken via this function. Region is defined as a parameter because 'region' does not yet exist until user clicks on the map object. It also notifies the player as to what territory they are attacking. 
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
    
    This scales more gradually when tech or skill levels are increased and thus still allow a weaker nation to damage a nation with vastly superior military.
*/

/* 
    Initiate unit battles - parameter for war is required for randomAttack function.
    
    'war' calls the 'battle' function on each military arm so they face each other
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

// Control what happens when a battle is concluded - 'armiesDefeated' MUST BE RESET!!!
// If even one army is not defeated, player is deemed to lose or draw

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

winWar = (region, targetNation) => {
    militaryVictory(targetNation);
    awardResources();
    militaryUnitsGainXP(2);
    releaseHostagesWar(targetNation);
}

militaryVictory = (targetNation) => {

    enemyEliminated.play();

    swal("Victory",
        `${targetNation.name} has been defeated in battle and is now under your control. 

        ${playerNation.name} units: 
        Infantry: ${playerNation.militaryUnits.infantry} 
        Tanks: ${playerNation.militaryUnits.tanks} 
        Aircraft: ${playerNation.militaryUnits.air} 
        Navy: ${playerNation.militaryUnits.naval}`, {
            button: "Bonuses"
        }).then((value) => {
        swal("Debrief", `Resources: + 1% of the total GDP of ${targetNation.name} $${parseInt(targetNation.gdp / 100 * 1)} - awarded monthly to player defence budget
        Military Units XP: + 2 
        Any agents held in ${targetNation.name} will be released`);
    });
}

militaryDefeat = () => {

    swal("Defeat",
        `${targetNation.name} has held your forces

        ${playerNation.name} units: 
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

loseWar = () => {
    militaryDefeat();
    militaryUnitsGainXP(0.5);
    playerNation.status.govtApprovalRating -= 5;
}

// Exp is awarded for military participants, so we don't want to award exp to the agents here

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

*************************************************************************************************

    NUCLEAR WARFARE

    If a nation suffers nuclear annihilation, colour is same as bg and is wiped and unable to be acquired for resources. If the target has nuclear defense, and they defend, they may launch against you if hostility or stance says so. Add new strategic element to object. Remember, nukes needed to validate function.

*************************************************************************************************

*/


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

alertNoNukes = () => {
    swal({
        title: "Nuclear Capability Offline",
        text: "No nuclear weapons in current arsenal",
        icon: "error"
    });
}

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

intercepted = () => {
    weaponDestroyed.play();
    swal("Missile Intercept", `${playerNation.name}'s missile destroyed`);
}

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

// Elevate the targeted nation to max aggression
nuclearTargetStance = (region, targetNation) => {
    targetNation.status.aggressionLevel = 100;
    defineNationStance();
    swal("Target Nation Aggression Maxed", `${region} is fully hostile.`);
}

enemyNuclearRetaliation = (enemyIsNuked, playerIsNuked, code, region, targetNation) => {

    if (targetNation.status.stance === "hostile" && targetNation.specialWeapons.nuclearWeapons) {
        launchDetected.play();
        swal("Nuclear Missile Warning", `${targetNation.name} has launched a nuclear missile at you!`);
        targetNation.specialWeapons.nuclearWeapons -= 1;
        nuclearOutcomeEnemy(enemyIsNuked, playerIsNuked, code, region);
    }
}

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


// Nations defeated (either militarily or by turning inward via rebellion or civil war) turn red

colourDefeatedNations = (code, colour) => {
    for (let i = 0; i < nationsConqueredCode.length; i++) {
        if (code === nationsConqueredCode[i]) {
            $("#vmap").vectorMap("set", "colors", {
                [code]: colour
            });
        }
    }
}

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

// 8 hours until weapon above target

particleCannonStrike = (region, code) => {

    clearPrevious();
    const timeToTargetOrbit = day / 3;

    swal("Particle Cannon Strike",
        `Confirm Particle Deployment Above ${region}?`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            const handle = setInterval(() => {
                if (value && day >= timeToTargetOrbit) {
                    clearInterval(handle);
                    cannonDamage(region, targetNation);
                    monitorNationResistance(region, code);
                }
            }, 500);
        }
    });
}

/* 
    Determine when the player's forces arrive at a global destination. A new variable sets the time of arrival to be in a week's time, using whatever day the game is currently on and then tacking on + 7 days. A function is then run constantly, checking whether this new 'military arrival day' matches with the current day. In short, if the current day is equal to the future day, the troops are determined to arrive. The player is then able to attack now that the troops are in theatre.
    This script determines the travel time to all destinations for various forces. It takes 4 parameters: 

    'region' determines the destination country of the sent units, which is itself defined via JQVMaps objects. 
    'unit' takes a string argument which indicates the type of unit that is being sent and is arriving. This stored info is used in messages to the player.
    'time' sets how many days must pass from the current day before the units can arrive. This future arrival date is determined by adding the current day (the day units are sent) to the arrival day (the day the units will get there).
    'orders' takes a callback function that determines what the units do when they get to where they are sent. Each unit will arrive in a country to do something specific. Agents, for example, will arrive to sabotage a nation's operations whilst military units arriving will pressure a nation or attack them.
*/

unitCampaign = (units, region) => {

    if (units === "military") {
        gameState.unitsOnCampaign = true;
        swal("Military Deployed", `Commander, ${units} have arrived in ${region}.`);
    } else {
        swal("Agents Deployed", `Commander, ${units} have arrived in ${region}.`);
    }
}

// The try-catch here stops an error being thrown if no orders are given to units (missing param)

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

// Nations attacking player: pseudo-random hostile nation attacks
// prevent running if game ended - REMOVE IF GAME SUCCESSFULLY WRAPPED IN IF
// Go through all nations and see if any are hostile...
// If hostile nation has not been conquered
// If any hostile nation is not defeated or already engaged, that is the target
// Insert current chosen target nation into array to prevent same nation attack
// If no conditions match first nation (ie not hostile), find the next one nation

function attackPlayer(enemyIsNuked, playerIsNuked, code, region, targetNation) {

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

// Certain probability of either military, cyber or nuclear attack (40, 50, 10 respectively)

/* 
    All 5 params are ESSENTIAL for nuclear function to run as they are passed between multiple functions to achieve the desired result.
    Currently set to:
        40% chance of military attack
        50% chance of cyber attack
        10% chance of nuclear attack
*/

setAttackTypeCPU = (enemyIsNuked, playerIsNuked, code, region, targetNation) => {

    if (probability(0.40)) {
        swal(`${targetNation.name} Attacking`, "Your armies are engaging in combat");
        war(targetNation);
        if (armiesDefeated >= 4) {
            swal(`${playerNation.name} has fought off ${targetNation.name}`);
        } else {
            swal(`${playerNation.name}'s armies defeated by ${targetNation.name}`, "Game Over");
            gameoverDefeated();
        }
        armiesDefeated = 0;
    } else if (probability(0.50)) {
        cyberAttack(targetNation);
    } else {
        enemyNuclearRetaliation(enemyIsNuked, playerIsNuked, code, region, targetNation);
    }
}

cyberAttack = (targetNation) => {

    const playerGDPBeforeHack = playerNation.gdp;
    playerNation.gdp -= RNG(100000, 5000000000);
    swal(`Hacked by ${targetNation.name}`, `$${playerGDPBeforeHack - playerNation.gdp} has been stolen.`);
}


/*

*************************************************************************************************

    RANDOM WORLD EVENTS

    The world in Theatre of War is no different to our present-day reality - events can happen suddenly and without warning. There are 5 major global events in Theatre of War, ranging from dangerous terror strikes and natural disasters to more positive (but still challenging!) commitments such as giving global aid.

    The functions have been defined, and are saved inside an array in the 'randomWorldEvent' function. This array is then accessed and a function is chosen at random.

*************************************************************************************************

*/


// COMPLETE EVENT WHEN FINISHED - call this somehow
// Set an array of events that can be randomised to produce game-changing dynamics

randomWorldEvent = () => {

    const worldEvents = [militaryCoup, naturalDisaster, terrorStrike, internationalAid, globalTreaty];
    const randomFunction = Math.floor(Math.random() * worldEvents.length);

    for (let i = 0; i < worldEvents.length; i++) {
        worldEvents[randomFunction]();
        break;
    }
}

mobilise = (nation) => {

    if (probability(0.50) && !nation.specialWeapons.nuclearWeapons) {
        nation.specialWeapons.nuclearWeapons += 1;
        console.log(nation.specialWeapons.nuclearWeapons)
    }

    for (units in nation.militaryUnits) {
        nation.militaryUnits[units] += RNG(5000, 10000);
    }
}

// Nation begins military build up
// Select a nation that is not already hostile as the random aggressor
// If nation selected is not hostile, nothing happens and player remains unaware
// 50% chance of nuclear armament IF nation has none to begin with
// An extra nuclear nation makes the world more dangerous!

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

const naturalDisaster = () => {

    const disasters = ["forest fires", "flooding", "volcanoes", "earthquakes"];
    const randomDisaster = Math.floor(Math.random() * disasters.length);
    const previousDefenceBudget = playerNation.resources.defenceBudget;
    playerNation.resources.defenceBudget -= RNG(100000, 1000000);

    swal("Natural Disaster", `Your nation has been hit by ${disasters[randomDisaster]}! Reparations are necessary and money has been diverted from your defence budget. 

    Defence Budget: - $${previousDefenceBudget - playerNation.resources.defenceBudget}`);
}

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

// Terror attack on player's nation
const terrorStrike = () => {
    const terrorTargets = ["city", "vital oil refinery"];
    const randomTarget = Math.floor(Math.random() * terrorTargets.length);
    terrorTargets[randomTarget] === "city" ? cityStrike() : refineryStrike();
}

aidSuccess = () => {

    swal("International Aid", "Your nation is donating capital to several impoverished nations. \n\n Approval Rating: +2 \nAll Nations Aggression Level: -2 \nGDP: - $5200000");
    playerNation.gdp -= 5200000;
    playerNation.status.govtApprovalRating + 2;

    nations.forEach(nation => {
        nation.status.aggressionLevel -= 2;
    });
}

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

treatySuccess = () => {

    swal("International Treaty Signed", "Your nation has signed a treaty that benefits many of the world's nations, including yours. Congratulations. \n\n All Nations Aggression Level: -5 \nAll Nations Resistance: -2 \nAll Nations GDP: + $1000000000 \nAll Nations Diplomacy: +5");

    nations.forEach(nation => {
        nation.status.aggressionLevel -= 5;
        nation.status.resistance -= 2;
        nation.gdp += 1000000000;
        nation.diplomacy += 5;
    });
}

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

showStatusPlayerNation = (region) => {
    if (playerNation === Russia && region === "Russian Federation" ||
        playerNation === USA && region === "United States of America") {
        $(".status-overlay").addClass("status-open");
    }
}

// Call after nation select is completed
displayNationNameStatus = () => {
    $("#nation-name").text(playerNation.name);
}

/* 
    Need to only allow country targeted to be auto attacked as soon as amount of waiting days are over. save country region as global var to then run inside a new deployment attack fn. once this new fn runs, can consider switching attack disallowed bool back to false.
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
            gameState.unitsOnCampaign = true;
            deployedToRegion = region;
        }
    });
}

// Set intel aqcuistion date to be +4, so that arrival after two and intel 2 days after that
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

/*
    This function uses several control flows to determine the outcome of any attempted espionage. Firstly, if the player's nation has an infiltation rating higher than the target nation, they have a 75% chance of gaining access to a nation's data. If the player's nation has a lower infiltration rating than the nation they have chosen to spy on, the chance to successfully obtain any data drops to 30%. This mirrors the unpredictable and cut-throat world of espionage!
*/

// If less than the number defined by 'prob', agents successfully report back with nation data 

gatherIntel = (region) => {

    const captured = setProbabilityOfAgentCapture();
    playerNation.unitTechAndSkillRating.infiltration += 1;

    if (captured) {
        agentsCaptured(region);
        captureRegion = region;
        nationsHoldingAgents.push(captureRegion);
        $(".agents-imprisoned").append(`<option value="${captureRegion}">${captureRegion}</option>`).addClass("displayBlock");
    } else if (probability(0.86)) {
        espionageSuccessful(region);
    }
}

// If agents are captive
preventIntel = (region) => {

    if (nationsHoldingAgents.includes(region)) {
        swal("Gathering Intel Disallowed", `Agents are already being held by ${region}. They will be on heightened alert and we should not send any more agents at this time.`);
        return true;
    }

    return false;
}

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

espionageSuccessful = (region) => {

    for (let i = 0; i < nations.length; i++) {
        if (region === nations[i].name) {
            swal({
                title: "Data Retrieved",
                text: JSON.stringify(nations[i], null, 4),
                icon: "success",
            });
        }
    }

    playerNation.unitTechAndSkillRating.infiltration += 3;
    playerNation.surveillance.infiltratedNations.push(region);
}

setProbabilityOfAgentCapture = () => {

    if (playerNation.unitTechAndSkillRating.infiltration > targetNation.unitTechAndSkillRating.infiltration) {
        captured = probability(1.00);
    } else {
        captured = probability(1.00);
    }

    return captured;
}

// Refactor this into one function with params, as it is used several times
releaseHostagesWar = (targetNation) => {

    if (nationsHoldingAgents.includes(targetNation.name)) {
        const indexRescueNation = nationsHoldingAgents.indexOf(targetNation.name);
        nationsHoldingAgents.splice(indexRescueNation, 1);
        $(`.agents-imprisoned option[value=${targetNation.name}]`).remove();
        hideCaptiveDropdown();
    }
}

// Prevent certain functions running if no agents are captured
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

// Successful or fail, remove nation holding the agents from respective array and dropdown list

rescueAlert = (title, text, icon) => {
    swal({
        title: title,
        text: text,
        icon: icon
    });
}

rescueOutcome = (rescued) => {

    if (rescued) {
        rescueAlert("Mission Accomplished", `Agent retrieved from ${rescueAttemptNation}. 
            Field Agents: +1`, "success");
        playerNation.surveillance.fieldAgents += 1;
    } else {
        rescueAlert("Mission Failure", `Your agent was killed in the rescue attempt. 
            Field Agents: -1`, "error");
        playerNation.surveillance.fieldAgents -= 1;
    }
    clearHostageStatus();
    hideCaptiveDropdown();
}

beginSpecOps = (region) => {

    let rescued;

    if (playerNation.unitTechAndSkillRating.infantrySkill > targetNation.unitTechAndSkillRating.infantrySkill) {
        rescued = probability(0.60);
    } else {
        rescued = probability(0.40);
    }
    rescueOutcome(rescued);
}

// How is this clearing array in ransom function????!!!

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

lowerApprovalHostages = () => {

    if (nationsHoldingAgents.length === 0) return;

    alert("Ongoing Hostage Crisis", `${nationsHoldingAgents.length} agents being held. 
    Approval Rating: -1 per agent held.`);

    nationsHoldingAgents.forEach(agent => {
        playerNation.status.govtApprovalRating -= 2;
    });
}

payRansom = (region, ransom, ransomNation) => {
    ransomNation = $(".agents-imprisoned").val();
    ransom = RNG(5000000, 50000000);
    ransomOptions(ransom, ransomNation);
}

//How to solve the null dilemma?
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
        icon: "success"
    });

    playerNation.surveillance.fieldAgents += 1;
    playerNation.gdp -= ransom;
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

undertakeSabotage = (region) => {

    clearPrevious();

    swal("Sabotage: $10000000",
        `Attempt to sabotage the operations of ${region}?`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            playerNation.resources.defenceBudget -= 10000000;
            unitArrivalTime(region, "agents", 2, chanceToSabotage);
        }
    });
}

// Effects of a nation being successfully sabotaged
chanceToSabotage = () => {

    if (probability(0.50)) {

        swal("Sabotage Successful",
            `Agents have successfully sabotaged enemy radar of ${targetNation.name} 
        Enemy Air Units: - 5000`);

        targetNation.militaryUnits.air -= 5000;
    }
}

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

// If incite lvl is higher than enemy lvl, your chance for success is 25%. Else, 10%

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
        icon: "success"
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

// Use defence budget to draft soldiers into compulsory military service on a daily basis
// Campaign lasts one month
// 1st IF: Stop alert playing every second, as it is inside psg of time function
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

*/


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

// Run what happens in event of alliance

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

// Chance of agreement is dependent on stances

determineChanceOfAgreement = (targetNation) => {

    if (targetNation.status.stance === "neutral") {
        successfulTradeProbability = 0.95;
    } else if (targetNation.status.stance === "friendly") {
        successfulTradeProbability = 0.95;
    } else {
        successfulTradeProbability = 0.95;
    }
}

// Check that option is not cancel, so that attempted diplomacy is confirmed and recorded 
// Record that diplomacy has been attempted with this nation

agreementStage1 = (region, value, code, targetNation) => {

    if (value === "alliance" && !disallowAllianceStance(region, targetNation)) {
        diplomacyAttempted.push(region);
        determineAllianceSuccess(region, code);
    } else if (value === "deals") {
        swal("Deals",
            `How would you like to approach ${region}?`, {
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

negotiation = (region, code, targetNation) => {

    clearPrevious();

    if (checkCondition(region, targetNation, diplomacyAttempted.includes(region), "Diplomacy Disallowed", `${region} is not open to negotiation.`)) return;

    if (checkCondition(region, targetNation, targetNation.status.stance === "hostile", "Hostile Nation", `Commander, ${region} is hostile and will not negotiate.`)) return;

    swal("Negotiation & Diplomacy",
        `How would you like to approach this nation?`, {
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

// AGRICULTURE

// If no trade deal already, push the new one's region

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

// Monthly award of any trade deal bonuses. Ran inside 'monthly Actions'
agriculturalBonus = () => {

    for (let i = 0; i < nations.length; i++) {
        for (let j = 0; j < playerNation.internationalRelations.tradeDeals.length; j++) {
            if (nations[i].name === playerNation.internationalRelations.tradeDeals[j]) {
                playerNation.gdp += Math.trunc(nations[i].gdp / 100 * 0.2);
                playerNation.status.govtApprovalRating += 1;
                nations[i].gdp -= Math.trunc(nations[i].gdp / 100 * 0.2);
                nations[i].status.resistance += 5;
            }
        }
    }

    alert("Agricultural Deal Bonus: See 'console' (F12)")
}

// ALLIANCE ASSISTANCE

// Push to region array allows nation alliance colours to be removed if hostile 
// Check no current alliance formed

alliancePact = (region, code) => {

    if (!playerNation.internationalRelations.alliances.includes(region)) {
        pushDeal(region, targetNation, "alliances");
        nationsConqueredCode.push(code);
        nationsConqueredRegion.push(region);
        colourDefeatedNations(code, "dodgerblue");
        swal({
            title: "Alliance Forged",
            text: `${playerNation.name} and ${region} have become allies.`,
            icon: "success"
        });
    } else {
        swal({
            title: "Alliance Already Ratified",
            text: `${playerNation.name} and ${region} are allies.`,
            icon: "info"
        });
    }
}

// Be careful about this - check a nations status. They may be close to losing patience!
requestAllianceReinforcement = (region) => {

    clearPrevious();

    if (!assistanceProvided.includes(region)) {
        assistanceProvided.push(region);
        if (playerNation.internationalRelations.alliances.includes(region) && targetNation.militaryUnits) {
            swal("Reinforcement Request", `${region} is sending troops to assist your war efforts.`);
            assignAlliedUnitsToPlayer();
            reinforcementImpact();
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

reinforcementImpact = () => {
    playerNation.resources.defenceBudget -= 1000000;
    targetNation.resources.defenceBudget += 1000000;
    playerNation.status.govtApprovalRating -= 2;
    targetNation.status.aggressionLevel += 2;
}

// Increment player units with allied units
// Decrement allied units

assignAlliedUnitsToPlayer = () => {

    for (units in playerNation.militaryUnits) {
        playerNation.militaryUnits[units] += targetNation.militaryUnits[units] / 100 * 10;
    }
    for (units in targetNation.militaryUnits) {
        targetNation.militaryUnits[units] -= targetNation.militaryUnits[units] / 100 * 10;
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
            if (nations[i].name === playerNation.internationalRelations.oilExportDeals[j]) {
                playerNation.resources.oilProduction += Math.trunc(nations[i].resources.oilProduction / 100 * 0.3);
                playerNation.status.govtApprovalRating += 1;
                nations[i].resources.oilProduction -= Math.trunc(nations[i].resources.oilProduction / 100 * 0.3);
                nations[i].status.resistance += 1;
            }
        }
    }
}

pushDeal = (region, targetNation, deal) => {
    playerNation.internationalRelations[deal].push(region);
    targetNation.internationalRelations[deal].push(playerNation.name);
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
            if (nations[i].name === playerNation.internationalRelations.intelCollaborationDeals[j]) {
                playerNation.unitTechAndSkillRating.infiltration += 1;
                playerNation.status.govtApprovalRating += 1;
                nations[i].unitTechAndSkillRating.infiltration += 1;
                nations[i].status.resistance += 1;
            }
        }
    }
}

// If state has changed, repopulate the array and save current stances

controlStanceChange = () => {

    if (stanceHasChanged) {
        console.log("States have changed - emptying old state")
        previousNationStances = [];
        console.log("state has changed - storing current state")
        storeNationStance();
        stanceHasChanged = false;
    }
}

storeNationStance = () => {
    nations.forEach(nation => {
        previousNationStances.push(nation.status.stance);
    });
}

// Iterate through both the previous stances and the current ones - check for discrepancies
// setTimeOut prevents message being overridden by other messages that occur concurrently
// Hostile nations are removed from treaties / deals on both sides

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

removeAlliedColours = (nation) => {

    for (let i = 0; i < nationsConqueredRegion.length; i++) {
        if (nation.status.stance === "hostile" &&
            nationsConqueredRegion[i] === nation.name) {

            $("#vmap").vectorMap("set", "colors", {
                [nationsConqueredCode[i]]: "#000"
            });

            nationsConqueredRegion = nationsConqueredRegion.filter(value => value !== nationsConqueredRegion[i]);
            break;
        }
    }
}

// Ensure a satellite exists

spySatellite = (region, code) => {

    clearPrevious();

    if (!playerNation.surveillance.satellites) {      
        swal({
            title: "Satellite Unavailable",
            text: "You do not yet have a satellite in orbit, commander.",
            icon: "warning"
        });

        return;
    }
    
    swal({
        title: `Military Capability: ${region}`,
        text: `Military Forces: ${JSON.stringify(targetNation.militaryUnits, null, 4)}
        Special Weapons: ${JSON.stringify(targetNation.specialWeapons, null, 4)}`,
        icon: "info"
    });
}

// Probability of hack

chanceOfHack = (successfulHack, region) => {

    if (successfulHackProbability(successfulHack)) {
        const amountStolen = RNG(50000, 1000000);
        awardHackingBonus(region, amountStolen);
        swal({
            title: "Hack Successful",
            text: `You have stolen $${amountStolen} from ${region}.`,
            icon: "success"
        });
    } else {
        swal({
            title: "Hack Unsuccessful",
            text: `${region} has prevented you from acquiring resources.`,
            icon: "success"
        });
    }
}

// There is a cost to cyberattack attempts

hackFunds = (region) => {

    clearPrevious();

    swal("Cyberattack",
        `Attempt to syphon funds from ${region}?`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {
            playerNation.resources.defenceBudget -= RNG(50000, 150000);
            let successfulHack, detected;
            chanceOfHack(successfulHack, region);
            hackDetectedAction(region, detected);
        } else return;
    });
}

// For each used here to prevent use of 'targetNation', which can change quickly if player tries to click another nation with the same function soon after, and not applying to correct nation
hackDetectedAction = (region, detected) => {

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
                if (nation.name === region) {
                    nation.status.aggressionLevel += 10;
                    nation.status.resistance += 5;
                }
            });
        }
    }, 3000);
}

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

awardHackingBonus = (region, amountStolen) => {
    playerNation.resources.defenceBudget += amountStolen;
    targetNation.gdp -= amountStolen;
}

// Resources stockpiled after successfully defeating another nation - added to monthly totals
// Lump sum  awarded to player's national defence budget (1% of defeated nation's GDP)
// Figure awarded to player's national defence budget each month for occupying a nation
// Oil awarded to player each month for occupying a nation (0.5% of defeated nation's oil) 
awardResources = () => {

    const nationGDP = targetNation.gdp;
    const nationOil = targetNation.resources.oilProduction;
    playerNation.resources.defenceBudget += targetNation.gdp / 100 * 1;
    defeatedNationGDP.push(nationGDP / 100 * 0.5);
    defeatedNationOil.push(nationOil / 100 * 0.5);
}

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

// Functions to monitor the effects of public mood and feeling. Enemy is conquered if it melts
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

    if (playerNation.status.govtApprovalRating <= 10) {
        swal("DEFEAT", "You have failed in your mission, commander. \nYour approval rating is too low and after a no-confidence vote, you have been removed from power.");
        gameoverDefeated();
    }
}

// Govt approval lowers when a nation 

lowerApprovalAggression = () => {

    if (playerNation.status.stance === "hostile" && !LAOAHasRan) {
        swal(`${playerNation.name} Now Hostile`, "You have led the nation into an aggessive stance. Your people perceive you as a cruel tyrant.");
        playerNation.status.govtApprovalRating -= 2;
        LAOAHasRan = true;
    }
}

lowerApprovalBankruptcy = () => {

    if (playerNation.resources.defenceBudget <= 0 && !LAOBHasRan) {
        swal(`${playerNation.name} Now Bankrupt`, "You have led the nation into bankruptcy, and your people are suffering. Try to balance your nation's books!");
        playerNation.status.govtApprovalRating -= 2;
        LAOBHasRan = true;
    }
}

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

// Refresh button
reloadGame = () => {
    gameOverTrack.pause();
    attemptingReboot.play();
    setTimeout(() => {
        location.reload();
    }, 3000);
}

gameover = () => {
    inGameTrack.pause();
    gameState.gameStarted = false;
    $(".sidebar button").attr("disabled", true);
    $(".radar").removeClass("slow-reveal");
}

gameOverImg = () => {

    if (gameState.playerNuked) {
        $(".status-overlay").append(`<img src="images/nuked-city.jpg" alt="city destroyed by nuclear blast" class="game-over-img" />`);
    } else {
        $(".status-overlay").append(`<img src="images/grief.jpg" alt="woman in despair on ground" class="game-over-img" />`);
    }
}

gameOverScreen = () => {

    $("#removable-status-content, .game-hud, .status-closebtn").remove();
    $(".status-overlay").addClass("status-open game-over-transition")
        .append(`<h2 class="end-header">GAME OVER</h2>`)
        .append(`<button type="button" class="reload-btn" onclick="reloadGame()">Reload</button>`);
}

// Main game over function - gamestarted = false also prevents sidebar opening
gameoverDefeated = () => {
    gameover();
    gameOverTrack.play();
    gameOverTrack.loop = true;
    gameOverScreen();
    gameOverImg();
}

// These commands MUST have a desired map target
// 1st IF: Prevent commands being used on player's own nation

handlePlayerActions = (region, code) => {

    if (playerNation.name === region) return;

    switch (true) {

        case commands.attack:
            playerNation.attackNation(region, code, targetNation);
            break;

        case commands.deploy:
            playerNation.deployForces(region, code);
            break;

        case commands.recon:
            playerNation.deployAgents(region, code);
            break;

        case commands.sabotage:
            playerNation.undertakeSabotage(region, code);
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
            playerNation.requestAllianceReinforcement(region, code);
            break;

        case commands.hacking:
            playerNation.hackFunds(region, code);
            break;

        default:
            console.log("No player actions selected.");
    }
}


/*

*************************************************************************************************
    
    JQVMAP OBJECT & FUNCTIONALITY: THE ENGINE OF THEATRE OF WAR
 
    JQVMaps has built-in click and hover events of its own. However, for my purposes, they were rather limited, capable initially of only displaying a name of a country using the 'region' parameter, for instance. I have edited the basic options of the map object, but I have also had to program extensive functionality into the object to accomodate the design of Theater of War.
    
    I have essentially combined the fuel of the game - the nation class objects, with the engine of the game - the map object, specifically the click and hover events.
    
    Various functions operate here in order for the game to work.
    
*************************************************************************************************

*/

conqueredNation = (region) => {

    for (let i = 0; i < nationsConqueredRegion.length; i++) {
        if (nationsConqueredRegion[i] === region) {
            swal("Nation Conquered / Allied");
            return true;
        }

        return false;
    }
}

// Data for nation is displayed only if nation has been infiltrated

showIntel = (region, targetNation) => {

    const noIntelAlert = swal(`No Intel on ${region}`, "Send agents or use satellites to spy.");

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

basicMapEvents = (region, code) => {
    gameState.targetNationSelected = true;
    nationSelect.play();
    showStatusPlayerNation(region);
}

// First 'if' prevents code running on the player's selected nation
// If name in object matches region, show it's data in a swal
// Allows player to perform commands

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

// Undefine 'selectedColor' to prevent interference with color change onclick
// Tap into 'onLabelShow' to show nation info on tooltip hover
// #01826d, #12cefc, #5b565e #9575ad - lilac: hover colors?

initMap = () => {

    $('#vmap').vectorMap({
        backgroundColor: '#151515',
        borderColor: '#12CEFC',
        borderOpacity: 0.25,
        borderWidth: 0.6,
        color: '#000',
        hoverColor: '#9575AD',
        scaleColors: ['#B6D6FF', '#005ACE'],
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

// Ticks to monitor game state

// Track all all changes of status every second, to inform the player and enable actions
// HOW OFTEN TO RUN BELOW FUNCTION? DAILY IN TIME OBJECT? OR SET INTERVAL
// Important that this is declared after the name of nation is set

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

    //After a certain random time: one week & one month (ms) 604800000, 2629800000

    //setInterval(attackPlayer, RNG(10000, 12000));
}

// Reactivate sidebar and control panel buttons, start clock & in-game music
// Call main time object

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

    POST-INTRO GAME FLOW: NATION SELECT, TUTORIAL, GAME OVER & END CREDITS

    If a nation suffers nuclear annihilation, colour is same as bg and is wiped and unable to be acquired for resources. If the target has nuclear defense, and they defend, they may launch against you if hostility or stance says so. Add new strategic element to object. Remember, nukes needed to validate function.

***********************************************************************************************

*/


// UI

renderNationSelectScreen = () => {

    $("html, body").toggleClass("lock-display");
    $("#skip-intro-btn, #story-scroll-text, .main-titles").remove();
    $(".title-overlay").removeClass("displayBlock");
    renderNationSelectImages();
    $(".title-screen").append("<h1 class='nation-select-title wargate'>Select Your Nation</h1>");
}

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

skipTutorial = () => {
    if (gameState.skipIntro) {
        startGame();
    }
}

setupGameStart = () => {

    nationSelectTrack.pause();
    highlightSelectedNation();
    skipTutorial();

    if (playerNation === USA) {
        nationSelected("#us", "img#russia", ".nation-select-title", "country-select-animation", "img-fade-out", "marginAuto");
    } else {
        nationSelected("#ru", "img#usa", ".nation-select-title", "country-select-animation", "img-fade-out", "marginAuto");
    }
}

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

// Option to select the United States or the Russian Federation

$(document).on("click", "img#usa", () => {
    setupNation("United States of America", USA);
});

$(document).on("click", "img#russia", () => {
    setupNation("Russian Federation", Russia);
});

/* Keep track of the original value for player's oil production as we need to increment it by itself later on */
// Ensure the yearly defence budget / GDP allocation remains unchanged for awarding each year

defineOilAndBudgets = () => {
    dailyOilProduction = playerNation.resources.oilProduction;
    originalDailyOilProduction = dailyOilProduction;
    yearlyDefenceBudget = playerNation.resources.defenceBudget;
    yearlyGDP = playerNation.gdp;
}

highlightSelectedNation = () => {

    if (playerNation === Russia) {
        $("#vmap").vectorMap("set", "colors", {
            ru: "#6B0000"
        });
    } else {
        $("#vmap").vectorMap("set", "colors", {
            us: "#1E90FF"
        });
    }
}

addRadarWithAlert = () => {
    $(".radar").addClass("slow-reveal");
    systemsOnline.play();
}

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

displayNationLogo = () => {
    if (playerNation === USA) {
        $("#logo-section").append("<img class='logo-usa' src='images/usa-logo.png'/>");
    } else {
        $("#logo-section").append("<img class='logo-russia' src='images/russia-logo.png'/>");
    }
}

//Once all title and nation select stages have concluded, clear title overlay from DOM
removeTitleOverlay = () => {

    setTimeout(() => {
        $(".title-overlay").removeClass("displayBlock");
    }, 3000);

}

// Remove story text block on overlay once animation has finished, allowing titles to show
$("#story-scroll-text").on("animationend", () => {
    $("#story-scroll-text").remove();
    introTrack.pause();
    mainTitleTrack.play();
});

scrollToMap = () => {

    tutorialTrack.play();

    setTimeout(() => {
        $("html, body").animate({
            scrollTop: $(".scroll-target-map").offset().top
        }, 3000);
        setTimeout(() => {
            mapTutorial();
            scrollToPanel();
            // Re-enable scrolling after last animation & intro has ended
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

endTutorial = () => {
    $(".sidebar").toggleClass("open");
    swal("Good Luck, Commander", "The world and it's events are now in motion.");
    tutorialTrack.pause();
    startGame();
}


// Ending titles

// Prepare end titles

// main titles: remove after testing - what's mean?

setEndTitles = () => {

    gameover();
    $("#story-scroll-text, #skip-intro-btn, .main-titles, .game-hud").remove();
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

playEndTheme = (endTheme) => {

    setTimeout(() => {
        endTheme.play();
    }, 4000);

}


renderVictoryScreen = () => {
    $(".victory-heading, .authour-credit, #reload-btn, .victory-img").addClass("reveal");
    $(".end-text-1, .end-text-2, .end-text-3").addClass("reveal-flame");
}

selectImg = (element, imgSrc) => {
    $(element).remove();
    $(".victory-img-section").append("<img class='victory-img' src=" + imgSrc + "/>");
}

// Display the victory img section first

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

// Show initial statuses when nation is defined = 'playerNation' is essential

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
