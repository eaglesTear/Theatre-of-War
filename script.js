// Globals
const l = console.log;
// Parsing as float allows the most accurate measurement of an average calendar month later on
let day = parseFloat(1);
// Player's selection will decide the value of this variable - undefine when ready to deploy
let playerNation = Russia;
// Define the newly created country (object) for use in the battle function 
let targetNation;
// Set a binary that disables the initial alert info window after first use of 'espionage' ability
let firstTimeEspionageUse = true;

/* Keep track of the original value for player's oil production as we need to increment it by itself later on */
let dailyOilProduction = playerNation.resources.oilProduction;
let originalDailyOilProduction = dailyOilProduction;

// Define an array to hold all the nations that are defeated by the player
const territoriesConqueredByCode = [];
// By region is to allow the player to see the actual country names rather than the codes
const territoriesConqueredByRegion = [];
// Set array ready to receive all the generated nation objects
const allNationsAsObjects = [];
// Set array ready to receive all nation / country codes in the JQVMap object (182 total)
const allNationsCodeArray = [];
// Ensure the yearly defence budget / GDP allocation remains unchanged for awarding each year
const yearlyDefenceBudget = playerNation.resources.defenceBudget;
const yearlyGDP = playerNation.gdp;

// Option / nation ability bools
const options = {
    attack: false,
    deploy: false,
    recon: false,
    sabotage: false,
    incite: false,
    conscription: false,
    diplomacy: false,
    spying: false,
    fireParticleCannon: false,
    allianceReinforcement: false,
    hacking: false,
    unitsOnCampaign: false,
    targetNationSelected: false
}

let agentsCaptured = false;
let rescue = false;

//// Execute monthly actions here, ie expenditures
//monthlyActions = () => {
//    //expenditure();
//    militaryUnitMaintenanceMonthly();
//    //resourceIncomeMonthly();
//awardAgriculturalDealBonus();
//}
//// Execute daily actions here, ie expenditures
//dailyActions = () => {
//    militaryOilExpenditureDaily();
//    generalResourceExpenditureDaily();
//    defineNationStance();
//}
//
//yearlyActions = () => {
//    annualDefenceBudgetAndGDP();
//    $("#assign-GDP-btn").prop("disabled", false);
//}

/*
    Time in this game passes similarly to real life, with periods measured in daily, weekly, monthly and yearly intervals. To make sure that the measurement of an individual calendar month is as accurate as possible, the day count is initiated as a float (see globals). This is so that I can bolt on an additional 30.41 onto the day count when checking if a month has elapsed.
    If we divide the number of days in a year (365) by the number of months in a year (12), the number is 30.41 - the average length of a month. Hence, after 30 days, the player will be subject to a monthly report, with their unit maintainance and other upkeeps requiring expenditure.
    
    The user agent can see what day, week, month or year it is. All of them are set as variables, all of which initially require rounding up (not down) with Math.ceil. If not rounded up, the functions use this code for carrying out other operations will produce bugs. Division is used to accurately measure how long each period is (ie, 7 days in a week = day / 7). I then use jQuery to insert the periods into the DOM.
    
    Two setIntervals are operating in this function. The first displays the passage of time by incrementing the days (therefore the weeks, months and years, eventually) every 5 minutes. This is not a real-time strategy game: days pass every 5 mins. The final setInterval tracks when over 30 days have passed (an average month) and they then 'monthlyActions' is called, a parent / carrier function that contains other functions containing various scripts, such as billing the player for the upkeep of any bases that they own etc.
    
    Finally, if the 'monthlyInterval' variable is not reset after a month has elapsed, the monthly actions will run only once at the end of the first 30 days and never again. Setting this again is my way of ensuring that the script sees runtime every 30.4 days - every month.
*/


passageOfTime = () => {

    let monthlyInterval = day + 30.41;
    let yearlyInterval = day + 365;
    let currentYear = 2021;

    setInterval(() => {

        let week = Math.ceil(day / 7);
        let month = Math.ceil(week / 4);

        $("#day").text("DAY: " + parseInt(day++));
        $("#week").text("WEEK: " + week);
        $("#month").text("MONTH: " + month);

        if (day >= monthlyInterval) {
            //            monthlyActions();
            monthlyInterval = day + 30.41;
        }
        if (day >= yearlyInterval) {
            currentYear++;
            $("#year").text("YEAR: " + currentYear);
            //yearlyActions();
            yearlyInterval = day + 365;
        }

        if (options.conscription === true) {
            conscriptTroopsRussia(monthlyInterval);
        }
        //dailyActions();

    }, 2000);
}

displayMainStatus();
// Skip forward in time via ui click (1 day per click)
fastForward = (monthlyInterval) => {
    $("#day").text("DAY: " + parseInt(day++));
    $("#week").text("WEEK: " + Math.ceil(day / 7));

    if (options.conscription === true) {
        conscriptTroopsRussia(monthlyInterval);
    }
}

// Dynamic function to display colours for each nation when corresponding text is hovered    
ui_mouseover_mouseout = (countryID, color, [country]) => {
    $("#vmap").vectorMap("set", "colors", {
        [country]: color
    });
}

// Control what happens when a battle is concluded - 'armiesDefeated' MUST BE RESET!!!
// If even one army is not defeated, player is deemed to lose or draw
// CHECK BACK HERE IF ANY ERRORS IN VICTORY IN BATTLE
trackDefeatedNations = (region, code) => {

    if (armiesDefeated >= 4) {
        territoriesConqueredByCode.push(code);
        territoriesConqueredByRegion.push(region);
        warConsequencesIfWin();
    } else {
        warConsequencesIfLose();
    }
    armiesDefeated = 0;
    options.unitsOnCampaign = false;
}

warConsequencesIfWin = () => {
    swal("player wins");
    $("#conquered-nations").append(`<li>${territoriesConqueredByRegion[territoriesConqueredByRegion.length - 1]}</li>`);
    awardResources();
    militaryUnitsGainExp();
    targetNation = null;
}

warConsequencesIfLose = () => {
    swal("player has lost the war. game over");
    playerNation.status.govtApprovalRating -= 5;
    monitorNationGovtApproval();
}

// Exp is awarded for military participants, so we don't want to award exp to the agents here
militaryUnitsGainExp = () => {

    for (rating in playerNation.unitTechAndSkillRating) {

        if (rating === "infiltration") continue;
        //l("rating before: " + playerNation.unitTechAndSkillRating[rating]);
        playerNation.unitTechAndSkillRating[rating] += 12.5;
        unitRatingCap();
        //l("rating after capping: " + playerNation.unitTechAndSkillRating[rating]);
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

// Functions to monitor the effects of public mood and feeling. Enemy is conquered if it melts
monitorNationResistance = (region, code) => {

    if (playerNation.status.resistance <= 10) {
        console.log("GG");
    } else if (targetNation.status.resistance <= 10) {
        territoriesConqueredByCode.push(code);
        colourDefeatedNations(code, "#AA0000");
        targetNation = null;
    }
}

monitorNationGovtApproval = () => {

    if (playerNation.status.govtApprovalRating <= 10) {
        console.log("GG");
    }
}

//l(playerNation.unitTechAndSkillRating.airTech) // DELETE WHEN FINISHED
//l(playerNation.unitTechAndSkillRating.infantrySkill) // DELETE WHEN FINISHED
//militaryUnitsGainExp(); // DELETE WHEN FINISHED
//l(playerNation.unitTechAndSkillRating.airTech) // DELETE WHEN FINISHED
//l(playerNation.unitTechAndSkillRating.infantrySkill) // DELETE WHEN FINISHED

// Commander will be asked to confirm each option, whether attack, commit sabotage etc
executiveDecision = (region) => {

    const confirmAttack = confirm("Military in position. Attack " + region + " ?");

    if (confirmAttack) {
        swal("You have given your forces permission to engage. Select " + region + " to attack");
    }
}

// Get user-selected option that determines game winning conditions
$("#accept-option").click(() => {
    const userSelectedCondition = $("input[name=options]:checked").val();
    checkWinConditions(userSelectedCondition);
});

checkWinConditions = (userSelectedCondition) => {

    const winningConditionSetByPlayer = userSelectedCondition;

    if (winningConditionSetByPlayer === "option1") {
        swal("1");
    } else {
        swal("2");
    }
}
//checkWinConditions(userSelectedCondition);


playerActions = (region, code) => {

    options.targetNationSelected = true;

    switch (true) {

        case options.attack:
            playerNation.attack(region, code);
            options.attack = false;
            break;

        case options.deploy:
            playerNation.deployForces(region, code);
            options.deploy = false;
            break;

        case options.recon:
            playerNation.deployAgents(region, code);
            options.recon = false;
            break;

        case options.rescue:
            playerNation.launchHostageRescue(region, code);
            options.rescue = false;
            break;

        case options.sabotage:
            playerNation.undertakeSabotage(region, code);
            options.sabotage = false;
            break;

        case options.incite:
            playerNation.inciteRebellion(region, code);
            options.incite = false;
            break;

        case options.diplomacy:
            playerNation.negotiation(region, code);
            options.diplomacy = false;
            break;

        case options.spying:
            playerNation.spySatellite(region, code);
            options.spying = false;
            break;

        case options.launchNuclearMissile:
            playerNation.nuclearStrike(region, code);
            options.launchNuclearMissile = false;
            break;

        case options.fireParticleCannon:
            playerNation.particleCannonStrike(region, code);
            options.fireParticleCannon = false;
            break;

        case options.allianceReinforcement:
            playerNation.requestAllianceReinforcement(region, code);
            options.allianceReinforcement = false;
            break;

        case options.hacking:
            playerNation.hackFunds(region, code);
            options.hacking = false;
            break;

            // Log if no cases match 
        default:
            console.log("No player actions selected.");
    }
    options.targetNationSelected = false;
}

// Function Probability
function probability(n) {
    return Math.random() < n;
}

//console.log(`${x} of 10000000 given results by "Math.random()" were under ${prob}`);
//console.log(`Hence so, a probability of ${x / 100000} %`);

$(document).ready(() => {

    passageOfTime();

    const worldNationsObjectLength = Object.keys(worldNations).length;

    for (let i = 0; i < worldNationsObjectLength; i++) {

        const allNations = new Nation(

            // Leave the country 'name' parameter as undefined - will be defined later
            this.name = "",
            // Define random nation GDP between $50 billion & $3 trillion
            nationStats(3000000000000, 50000000000),
            // Define a random govt type
            randomGovt,
            // Define a random population between 3 million and 1.5 billion people
            nationStats(1500000000, 3000000),
            // Assign a random diplomacy rating between 0 and 100
            nationStats(100, 0),
            // Trade deals, alliances, oil export deals & intel collaboration deals
            [],
            [],
            [],
            [],
            // Set a random amount of researchers between 0 and 1000
            nationStats(1000, 0),
            // Define a random amount of oil production
            nationStats(80000000, 20000000),
            // Set a random amount of oil consumption
            nationStats(50000000, 100000),
            // Set a random starting defence budget
            nationStats(500000000, 50000000),
            // Set weapon stocks to 0, as this is only important to the player
            0,
            // Set a random amount of air, tank and naval units
            nationStats(5000, 250),
            nationStats(5000, 250),
            nationStats(210, 160),
            // Set a random amount of infantry units
            nationStats(1000000, 20000),
            // Set a random amount of field agents
            nationStats(5, 0),
            // Set a random amount of satellites
            nationStats(50, 0),
            // Air tech
            nationStats(100, 10),
            // Armour tech
            nationStats(100, 10),
            // Infantry tech
            nationStats(100, 10),
            // Naval tech
            nationStats(100, 10),
            // Agent infiltration
            nationStats(100, 10),
            // Nuclear weapons & special weapons
            nationStats(5, 0),
            nationStats(3, 0),
            nationStats(1, 0),
            // Aggression Level
            nationStats(100, 5),
            // Stance / attitude = defined by function 'defineNationStance' below
            "",
            // Resistance - how much fight a country has left to wage war / resist submission
            nationStats(100, 1),
            // Approval rating for a nation's govt: if this becomes low, game over
            nationStats(100, 1)
        );

        allNationsAsObjects.push(allNations);
    }

    defineNationStance = () => {

        for (let i = 0; i < allNationsAsObjects.length; i++) {
            if (allNationsAsObjects[i].status.aggressionLevel > 50) {
                allNationsAsObjects[i].status.stance = "hostile";
            } else if (allNationsAsObjects[i].status.aggressionLevel > 40 &&
                allNationsAsObjects[i].status.aggressionLevel < 50) {
                allNationsAsObjects[i].status.stance = "neutral";
            } else {
                allNationsAsObjects[i].status.stance = "friendly";
            }
        }
    }
    // Set once on game start, then recalled daily to dynamically adapt nation behaviour
    defineNationStance();

    // How often or where to run this??? Twice every game day? Make saved stance array global?
    informPlayerOfNationStanceChange = () => {

        for (let i = 0; i < allNationsAsObjects.length; i++) {

            let previousNationStances = [];
            previousNationStances.push(allNationsAsObjects[i].status.stance);

            allNationsAsObjects[i].status.aggressionLevel += 10;
            defineNationStance();

            for (let j = 0; j < previousNationStances.length; j++) {

                if (previousNationStances[j] !== allNationsAsObjects[i].status.stance) {
                    swal("Nations Have Changed Stance", "Changes are waiting on the overlay.");

                    // Print this out on the overlay or for loop section
                    //                    alert(`${allNationsAsObjects[i].name} has gone from ${previousNationStances[j]} to ${allNationsAsObjects[i].status.stance}`);
                }
            }
        }
    }

    for (let i = 0; i < allNationsAsObjects.length; i++) {
        for (let j = 0; j < worldNations.length; j++) {

            allNationsAsObjects[i].name = worldNations[i];
        }
    }

    hostileNationsTreatyWithdrawal = () => {

        playerNation.internationalRelations.tradeDeals.push("Australia");
        playerNation.internationalRelations.intelCollaborationDeals.push("Australia");

        allNationsAsObjects.forEach(nation => {

            if (nation.name === "Australia") {
                nation.internationalRelations.tradeDeals.push(playerNation.name, "UK", "USA");
                nation.internationalRelations.intelCollaborationDeals.push(playerNation.name);
            }

            for (relationship in nation.internationalRelations) {

                if (nation.internationalRelations[relationship].length !== 0 && nation.status.stance === "hostile") {
                    
                    // AGAIN, USE NORMAL ALERT AS SWAL DOES NOT CYCLE ALL ITERATIONS!!!
                    alert(`${nation.name} is withdrawing from the ${relationship}`);

                    // Remove playernation from nation's treaty arrays
                    const playerNationIndex = nation.internationalRelations[relationship].indexOf(playerNation.name);
                    
                    nation.internationalRelations[relationship].splice(playerNationIndex, 1);
                }
            }
        });
    }
    hostileNationsTreatyWithdrawal();

    // Important that this is declared after the name
    //informPlayerOfNationStanceChange();

    // Nations attacking player: pseudo-random hostile nation attacks
    function nationAttacksPlayerAfterRandomTime() {

        // Go through all nations and see if any are hostile...
        for (let i = 0; i < allNationsAsObjects.length; i++) {

            if (allNationsAsObjects[i].status.stance === "hostile") {

                // If any hostile nation is not defeated or already engaged, that is the target
                if (!territoriesConqueredByRegion.includes(allNationsAsObjects[i].name) &&
                    !options.targetNationSelected) {
                    targetNation = allNationsAsObjects[i];
                    determineAttackTypeOnPlayer();
                    break;
                } else return;
            }
        }
    }

    // Certain probability of either military, cyber or nuclear attack (40, 50, 10 respectively)
    determineAttackTypeOnPlayer = () => {

        if (probability(0.40)) {
            swal(`${targetNation.name} is attacking you!`);
            nationsAtWar();
            if (armiesDefeated >= 4) {
                swal(`${playerNation.name} has fought off ${targetNation.name}!`);
            } else {
                swal(`${playerNation.name} has been obliterated by ${targetNation.name}!\n Game Over.`);
            }
            armiesDefeated = 0;
        } else if (probability(0.50)) {
            cyberAttack();
        } else {
            swal("no nukes");
            enemyNuclearRetaliation(targetNation.name);
        }
    }

    cyberAttack = () => {

        const playerGDPBeforeHack = playerNation.gdp;

        swal(`You've been hacked by ${targetNation.name}!`);
        playerNation.gdp -= nationStats(100000, 5000000000);
        swal(`${targetNation.name} stole $${playerGDPBeforeHack - playerNation.gdp}!`);
    }

    //After a certain random time: one week & one month (ms) 604800000, 2629800000
    //setInterval(nationAttacksPlayerAfterRandomTime, nationStats(5000, 4000));

    preventPlayerNationFromBeingSelected = (region) => {

        if (playerNation === Russia && region === "Russian Federation" ||
            playerNation === USA && region === "United States of America") {
            swal(`Cannot select your own nation: ${region}.`);
            return;
        }
    }

    $('#vmap').vectorMap({
        map: 'world_en',
        backgroundColor: '#000',
        borderColor: '#818181',
        borderOpacity: 0.25,
        borderWidth: 1,
        color: '#f4f3f0',
        enableZoom: true,
        hoverColor: 'grey',
        hoverOpacity: null,
        normalizeFunction: 'linear',
        scaleColors: ['#b6d6ff', '#005ace'],
        // Undefine 'selectedColor' to prevent interference with color change onclick
        selectedColor: '',
        selectedRegions: null,
        showTooltip: true,

        // Tap into 'onLabelShow' to show nation info on tooltip hover
        onLabelShow: (event, label, code) => {

            for (let i = 0; i < allNationsAsObjects.length; i++) {
                if (allNationsAsObjects[i].name === label[0].innerHTML) {
                    targetNation = allNationsAsObjects[i];
                }
            }

            label[0].innerHTML = label[0].innerHTML +
                `<br> Stance: ${targetNation.status.stance} <br> 
                GDP: ${targetNation.gdp} <br> 
                Population: ${targetNation.population} <br> 
                Government: ${targetNation.govt} <br> 
                Resistance: ${targetNation.status.resistance}`;
        },

        onRegionClick: (element, code, region) => {

            preventPlayerNationFromBeingSelected(region);

            // Nation's name method is defined only on-click as needed!
            for (let i = 0; i < allNationsAsObjects.length; i++) {

                if (allNationsAsObjects[i].name === region) {
                    targetNation = allNationsAsObjects[i];
                    const stringifiedNationInfo = JSON.stringify(targetNation, null, 4);
                    swal(stringifiedNationInfo);

                    // User-enabled options
                    playerActions(region, code);
                }
            }

            // Prevent attack upon nations that are already conquered
            for (let i = 0; i < territoriesConqueredByCode.length; i++) {
                if (territoriesConqueredByCode[i] === code) return;
            }
        }
    });
});
