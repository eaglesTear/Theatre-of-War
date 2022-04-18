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

// Initialise a small array of goverment types and then select one at random

const randomGovt = () => government = Math.random() < 0.5 ? "Republic" : "Monarchy";


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

// Introduction function starts the game when called by overlaying title screen and playing audio 

intro = () => {
    $(".title-overlay").addClass("displayBlock");
    introTrack.play();
}

// Function Probability - return a random number between a specified input range

probability = (n => Math.random() < n);

// Function that more easily deals with the adding of totals in the game

reduce = (array => array.reduce((total, currentValue) => total + currentValue, 0));

// Execute monthly actions here, ie expenditures
monthlyActions = () => {
    militaryUnitMaintenanceMonthly();
    resourceIncomeMonthly();
    awardAgriculturalDealBonus();
    awardOilExportDealBonus();
    awardIntelCollaborationDealBonus();
    lowerApprovalRatingIfAgentsAreHostages();
    monthlyBaseExpenditure();
    monthlyExpenditureReport();
}
// Execute daily actions here, ie expenditures
dailyActions = () => {
    militaryOilExpenditureDaily();
    generalResourceExpenditureDaily();
}
// Execute yearly action. Only one, which resetns defence budget
yearlyActions = () => {
    annualDefenceBudgetAndGDP();
}

/*
    Time in this game passes similarly to real life, with periods measured in daily, weekly, monthly and yearly intervals. To make sure that the measurement of an individual calendar month is as accurate as possible, the day count is initiated as a float (see globals). This is so that I can bolt on an additional 30.41 onto the day count when checking if a month has elapsed.
    If we divide the number of days in a year (365) by the number of months in a year (12), the number is 30.41 - the average length of a month. Hence, after 30 days, the player will be subject to a monthly report, with their unit maintainance and other upkeeps requiring expenditure.
    
    The user agent can see what day, week, month or year it is. All of them are set as variables, all of which initially require rounding up (not down) with Math.ceil. If not rounded up, the functions use this code for carrying out other operations will produce bugs. Division is used to accurately measure how long each period is (ie, 7 days in a week = day / 7). I then use jQuery to insert the periods into the DOM.
    
    Two setIntervals are operating in this function. The first displays the passage of time by incrementing the days (therefore the weeks, months and years, eventually) every 5 minutes. This is not a real-time strategy game: days pass every 5 mins. The final setInterval tracks when over 30 days have passed (an average month) and they then 'monthlyActions' is called, a parent / carrier function that contains other functions containing various scripts, such as billing the player for the upkeep of any bases that they own etc.
    
    Finally, if the 'monthlyInterval' variable is not reset after a month has elapsed, the monthly actions will run only once at the end of the first 30 days and never again. Setting this again is my way of ensuring that the script sees runtime every 30.4 days - every month.
*/


// Main time functionality, disabled if no jQuery or game start, preventing repeated errors to console.

runGameTime = () => {

    if (!window.jQuery) return;

    let monthlyInterval = day + 30.41;
    let yearlyInterval = day + 365;
    let currentYear = 2022;

    setInterval(() => {

        if (!gameState.gameStarted) return;

        let week = Math.ceil(day / 7);
        let month = Math.ceil(week / 4);

        $("#day").text("DAY: " + parseInt(day++));
        $("#week").text("WEEK: " + week);
        $("#month").text("MONTH: " + month);

        // First control flow detects a week before month up but includes failsafe to stop repeat

        //        if (day >= monthlyInterval - 7 && day <= monthlyInterval - 6) {
        //            alertMonthlyExpenditure();
        //        } else if (day >= monthlyInterval) {
        //            //monthlyActions();
        //            monthlyInterval = day + 30.41;
        //        } else if (day >= yearlyInterval) {
        //            currentYear++;
        //            $("#year").text("YEAR: " + currentYear);
        //            yearlyActions();
        //            yearlyInterval = day + 365;
        //        }

        checkIfConscription(monthlyInterval);
        dailyActions();
    }, 2000);
}

checkIfConscription = (monthlyInterval) => {
    if (commands.conscription) conscriptTroops(monthlyInterval);
}

// Skip forward in time via ui click (1 day per click)
fastForward = (monthlyInterval) => {

    $("#day").text("DAY: " + parseInt(day++));
    $("#week").text("WEEK: " + Math.ceil(day / 7));

    checkIfConscription(monthlyInterval);
}

// ************************************************************************************
// ************************************************************************************
// ABILITY FUNCTIONS OF THE PLAYER'S CHOSEN NATION


// ************************************************************************************
// ************************************************************************************
// BATTLE FUNCTIONS & OBJECTS


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
            nationsAtWar(targetNation);
            trackDefeatedNations(region, code, targetNation);
            colourDefeatedNations(code, "#AA0000");
        } else if (!value) {
            swal("Attack Aborted");
        } else {
            swal("Military Undeployed", `Units not positioned in ${region}. Please deploy forces.`);
        }
    });
}

// Initiate unit battles

// Parameter for nationsAtWar is required for randomAttack function

nationsAtWar = (targetNation) => {

    war.play();

    battle((playerNation.unitTechAndSkillRating.infantrySkill / 100) * playerNation.militaryUnits.infantry, (targetNation.unitTechAndSkillRating.infantrySkill / 100) * targetNation.militaryUnits.infantry, "infantry", "infantry", targetNation);

    battle((playerNation.unitTechAndSkillRating.airTech / 100) * playerNation.militaryUnits.air, (targetNation.unitTechAndSkillRating.airTech / 100) * targetNation.militaryUnits.air, "air", "air", targetNation);

    battle((playerNation.unitTechAndSkillRating.navalTech / 100) * playerNation.militaryUnits.naval, (targetNation.unitTechAndSkillRating.navalTech / 100) * targetNation.militaryUnits.naval, "naval", "naval", targetNation);

    battle((playerNation.unitTechAndSkillRating.armourTech / 100) * playerNation.militaryUnits.tanks, (targetNation.unitTechAndSkillRating.armourTech / 100) * targetNation.militaryUnits.tanks, "tanks", "tanks", targetNation);

    console.log(targetNation)
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
// CHECK BACK HERE IF ANY ERRORS IN VICTORY IN BATTLE
trackDefeatedNations = (region, code, targetNation) => {

    if (armiesDefeated >= 4) {
        territoriesConqueredByCode.push(code);
        console.log(territoriesConqueredByCode)
        console.log("defeated: " + region)
        territoriesConqueredByRegion.push(region);
        console.log(territoriesConqueredByRegion)
        warConsequencesIfWin(region, targetNation);
    } else {
        warConsequencesIfLose();
    }
    armiesDefeated = 0;
    gameState.unitsOnCampaign = false;
}

warConsequencesIfWin = (region, targetNation) => {
    militaryVictory(targetNation);
    awardResources();
    militaryUnitsGainExp();
    releaseAgentHostagesAfterSuccessfulWar();
    removeNationFromPlay(region);
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
            })
        .then((value) => {
            console.log(targetNation.gdp)
            swal(`Resources: + 1% of the total GDP of ${targetNation.name} $${parseInt(targetNation.gdp / 100 * 1)} - awarded monthly to player defence budget
            Military Units Exp: + 12.5 
            Any agents held in ${targetNation.name} will be released`);
        });
}

// Remove nation from play. Runs when nation is defeated or turns on itself 
removeNationFromPlay = (region) => {

    allNationsAsObjects.forEach(nation => {
        if (nation.name === region) {
            const indexOfNation = allNationsAsObjects.indexOf(nation);
            allNationsAsObjects.splice(indexOfNation, 1);
        }
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
            })
        .then((value) => {
            swal("XP Up", `Military Units Exp: + 3`);
        });
}

warConsequencesIfLose = () => {
    militaryDefeat();
    playerNation.status.govtApprovalRating -= 5;
}

// Exp is awarded for military participants, so we don't want to award exp to the agents here
militaryUnitsGainExp = () => {

    for (rating in playerNation.unitTechAndSkillRating) {

        if (rating === "infiltration") continue;
        playerNation.unitTechAndSkillRating[rating] += 12.5;
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


nuclearStrike = (region, code) => {

    clearPrevious();

    let playerIsNuked, enemyIsNuked;

    if (playerNation.specialWeapons.nuclearWeapons) {
        swal("Nuclear Strike",
                `Confirm Nuclear Strike On ${region}?`, {
                    buttons: ["Cancel", "Confirm"]
                })
            .then((value) => {
                if (value) {
                    missileLaunch.play();
                    swal({
                        title: "Nuclear Missile Launched",
                        icon: "warning",
                    });
                    playerNation.specialWeapons.nuclearWeapons -= 1;
                    nuclearStrikeOutcomePlayerSide(enemyIsNuked, playerIsNuked, code, region, targetNation);
                }
            });
    } else {
        swal({
            title: "Nuclear Capability Offline",
            text: "No nuclear weapons in current arsenal",
            icon: "error",
        });
    }
}

// If player launches, it is intercepted after 3 secs. Enemy response after further 3 secs
nuclearStrikeOutcomePlayerSide = (enemyIsNuked, playerIsNuked, code, region, targetNation) => {

    setTimeout(() => {
        console.log("nuclearstrikeoutcome player:")
        console.log("target: " + region)
        console.log("nukes: " + targetNation.specialWeapons.nuclearWeapons)
        console.log("shield: " + targetNation.specialWeapons.missileShield)
        if (targetNation.specialWeapons.missileShield) {
            console.log("shield present!: " + targetNation.specialWeapons.missileShield)
            targetNation.specialWeapons.missileShield -= 1;
            console.log("shield after 1st defence!: " + targetNation.specialWeapons.missileShield)
            weaponDestroyed.play();
            swal("Missile Intercept", `${playerNation.name}'s missile destroyed`);
            nuclearAttackTargetNationStance(region, targetNation);
            setTimeout(() => {
                enemyNuclearRetaliation(enemyIsNuked, playerIsNuked, code, region, targetNation);
            }, 3000);
            return;
        } else {
            enemyIsNuked = true;
            targetDestroyed.play();
            setTimeout(() => {
                nuclearDetonation.play();
            }, 600);
            swal("Missile Strike", "Target nation hit");
            nuclearAftermath(enemyIsNuked, playerIsNuked, code, region);
        }
    }, 4000);
}

nuclearStrikeOutcomeEnemySide = (enemyIsNuked, playerIsNuked, code, region) => {

    playerNation.specialWeapons.missileShield = 10;
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
nuclearAttackTargetNationStance = (region, targetNation) => {
    targetNation.status.aggressionLevel = 100;
    defineNationStance();
    swal("Target Nation Aggression Maxed", `${region} is fully hostile.`);
    console.log("aggression after attack: " + targetNation.status.aggressionLevel)
}

enemyNuclearRetaliation = (enemyIsNuked, playerIsNuked, code, region, targetNation) => {

    if (targetNation.status.stance === "hostile" && targetNation.specialWeapons.nuclearWeapons) {
        launchDetected.play();
        swal("Nuclear Missile Warning", `${targetNation.name} has launched a nuclear missile at you!`);
        targetNation.specialWeapons.nuclearWeapons -= 1;
        nuclearStrikeOutcomeEnemySide(enemyIsNuked, playerIsNuked, code, region);
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
        territoriesConqueredByCode.push(code);
        colourDefeatedNations(code, "#fff");
        // 'REGION' IS POSSIBLE - RETURN AFTER TESTING
        removeNationFromPlay(region);
    }
}


// Nations defeated (either militarily or by turning inward via rebellion or civil war) turn red

colourDefeatedNations = (code, colour) => {

    // Defeated nation is rendered in the colour of the successfully invading nation
    for (let i = 0; i < territoriesConqueredByCode.length; i++) {
        if (code === territoriesConqueredByCode[i]) {
            $("#vmap").vectorMap("set", "colors", {
                    [code]: colour
            });
        }
    }
}

particleCannonStrike = (region, code) => {

    clearPrevious();

    // 8 hours until weapon above target
    const timeToTargetOrbit = day / 3;

    swal("Particle Cannon Strike",
            `Confirm Particle Deployment Above ${region}?`, {
                buttons: ["Cancel", "Confirm"]
            })
        .then((value) => {
            if (value) {
                const handle = setInterval(() => {
                    if (value && day >= timeToTargetOrbit) {
                        clearInterval(handle);
                        targetNation.status.resistance -= 50;
                        targetNation.militaryUnits.infantry -= 1000;
                        targetNation.militaryUnits.tanks -= 40;
                        particleCannon.play();
                        cannonImpact.play();
                        swal("Target Hit", `${region} Resistance: - 50
                        ${region} Infantry: - 1000 
                        ${region} Tanks: -40`);
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

// The try-catch here stops an error being thrown if no orders are given to units (missing param)
unitArrivalTime = (region, units, time, orders) => {

    const arrivalDay = day + time;

    const handleInterval = setInterval(() => {

        if (day >= arrivalDay) {
            clearInterval(handleInterval);

            if (units === "military") {
                gameState.unitsOnCampaign = true;
                swal("Military Deployed", `Commander, ${units} have arrived in ${region}.`);
            } else {
                swal("Agents Deployed", `Commander, ${units} have arrived in ${region}.`);
            }

            try {
                orders();
            } catch (err) {
                console.log(`No orders given for units after arriving in ${region}.`);
            }
        }
    }, 0);
}

const previousAttackers = [];
// Nations attacking player: pseudo-random hostile nation attacks
function attackPlayerAfterRandomTime(enemyIsNuked, playerIsNuked, code, region, targetNation) {

    // prevent running if game ended - REMOVE IF GAME SUCCESSFULLY WRAPPED IN IF
    if (!gameState.gameStarted) return;

    // Go through all nations and see if any are hostile...
    for (let i = 0; i < allNationsAsObjects.length; i++) {

        // DO I NEED TO CHECK IF DEFEATED IF NATION IS REMOVED FROM OBJECTS ANYWAY?
        // If any hostile nation is not defeated or already engaged, that is the target
        if (!previousAttackers.includes(allNationsAsObjects[i].name) &&
            !gameState.targetNationSelected &&
            allNationsAsObjects[i].status.stance === "hostile") {
            targetNation = allNationsAsObjects[i];

            // Insert current chosen target nation into array to prevent same nation attack
            previousAttackers.push(targetNation.name);
            console.log("target chosen: " + targetNation.name)
            console.log(previousAttackers);
            determineAttackTypeOnPlayer(enemyIsNuked, playerIsNuked, code, region, targetNation);
            break;
            // If no conditions match first nation (ie not hostile), find the next one nation
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

determineAttackTypeOnPlayer = (enemyIsNuked, playerIsNuked, code, region, targetNation) => {

    if (probability(0.40)) {
        console.log("det attack type running probability")
        swal(`${targetNation.name} Attacking`, "Your armies are engaging in combat");
        nationsAtWar(targetNation);
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

randomWorldEvent = () => {
    
    // Set an array of events that can be randomised to produce game-changing dynamics

    const worldEvents = [militaryCoup, naturalDisaster, terrorStrike, internationalAid, globalTreaty];

    const randomFunction = Math.floor(Math.random() * worldEvents.length);
console.log(randomFunction)
    for (let i = 0; i < worldEvents.length; i++) {
        worldEvents[randomFunction]();
        console.log(randomFunction)
        break;
    }
}

// Nation begins military build up

const militaryCoup = () => {
console.log("terror")
    const randomNation = Math.floor(Math.random() * allNationsAsObjects.length);

    for (let i = 0; i < allNationsAsObjects.length; i++) {
        console.log("terror")
        
        // Select a nation that is not already hostile as the random aggressor

        if (allNationsAsObjects[i] === allNationsAsObjects[randomNation]
           && allNationsAsObjects[i].status.stance === "friendly"
           || allNationsAsObjects[i] === allNationsAsObjects[randomNation]
            && allNationsAsObjects[i].status.stance === "neutral") {
            console.log("terror")
            allNationsAsObjects[i].status.aggressionLevel = 100;

            // 50% chance of nuclear armament IF nation has none to begin with
            // An extra nuclear nation makes the world more dangerous!
            
            console.log(allNationsAsObjects[i].specialWeapons.nuclearWeapons)
            if (probability(0.50) && !allNationsAsObjects[i].specialWeapons.nuclearWeapons) {
                allNationsAsObjects[i].specialWeapons.nuclearWeapons += 1;
                console.log(allNationsAsObjects[i].specialWeapons.nuclearWeapons)
            }

            for (units in allNationsAsObjects[i].militaryUnits) {
                allNationsAsObjects[i].militaryUnits[units] += RNG(5000, 10000);
            }

            swal(`${allNationsAsObjects[i].name} is experiencing a coup d'état!`, `Aggression Level: 100 
                Stance: Hostile, 

            This nation's military power has increased and it may now have nuclear arms.`);
            console.log("terror loop")
        }
    }
}

const naturalDisaster = () => {
console.log("t")
    const disasters = ["forest fires", "flooding", "volcanoes", "earthquakes"];
    const randomDisaster = Math.floor(Math.random() * disasters.length);
    const previousPlayerGDP = playerNation.gdp;

    playerNation.gdp -= RNG(100000, 1000000);
    swal("Natural Disaster", `Your nation has been hit by ${disasters[randomDisaster]}! Reparations are necessary. 

        GDP: - $${previousPlayerGDP - playerNation.gdp}`);
    playerNation.resources.defenceBudget -= RNG(50000, 100000);
}

// Terror attack on player's nation
const terrorStrike = () => {
console.log("t")
    const terrorTargets = ["city", "vital oil refinery"];
    const randomTarget = Math.floor(Math.random() * terrorTargets.length);

    if (terrorTargets[randomTarget] === "city") {
        playerNation.status.govtApprovalRating -= 5;
        playerNation.resources.defenceBudget -= 100000;
        swal("Terror Attack", "Terrorists have attacked a city in your nation. Civilian casualties are reported and reparations are required. \n\nApproval Rating: -5 \nDefence Budget: - $100000");
    } else {
        const previousOilProduction = playerNation.resources.oilProduction;
        playerNation.resources.oilProduction -= RNG(50000, 100000);
        swal("Terror Attack", `Terrorists have attacked a vital oil refinery in your nation. 

        Oil Production: - ${previousOilProduction - playerNation.resources.oilProduction} barrels`);
    }
}

const internationalAid = () => {
console.log("t")
    if (playerNation.gdp >= 5200000) {
        swal("International Aid", "You nation is donating capital to several impoverished nations. \n\n Approval Rating: +2 \nAll Nations Aggression Level: -2 \nGDP: - $5200000");

        playerNation.gdp -= 5200000;
        playerNation.status.govtApprovalRating + 2;

        allNationsAsObjects.forEach(nation => {
            nation.status.aggressionLevel -= 2;
        });

    } else {
        swal("Insufficient GDP For International Aid Provision", "Many impoverished nations in the world were relying on you to provide support. \nApproval Rating: -2 \nAll Nations Aggression Level: +2");

        playerNation.status.govtApprovalRating - 2;

        allNationsAsObjects.forEach(nation => {
            nation.status.aggressionLevel + 2;
        });
    }
}

const globalTreaty = () => {
console.log("t")
    if (playerNation.diplomacy >= 50) {
        swal("International Treaty", "Your nation has signed a treaty that benefits many of the world's nations, including yours. Congratulations. \n\n All Nations Aggression Level: -5 \nAll Nations Resistance: -2 \nAll Nations GDP: + $1000000000 \nAll Nations Diplomacy: +5");

        allNationsAsObjects.forEach(nation => {
            nation.status.aggressionLevel - 5;
            nation.status.resistance - 2;
            nation.gdp + 1000000000;
            nation.diplomacy + 5;
        });

    } else {
        swal("Treaty Diplomacy Failed", "Your nation attempted to sign a global treaty. Alas, negotiations broke down and it will need to wait for another day. \nAll Nations Diplomacy: +3");

        allNationsAsObjects.forEach(nation => {
            nation.diplomacy + 3;
        });
    }
}

showStatusOnPlayerNationSelect = (region) => {
    if (playerNation === Russia && region === "Russian Federation" ||
        playerNation === USA && region === "United States of America") {
        $(".status-overlay").addClass("status-open");
    }
}

// Call after nation select is completed
displayNationNameOnStatus = () => {
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
            })
        .then((value) => {
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

    if (disallowIntelGatheringIfAgentsCaptive(region)) return;

    const timeToAcquireIntel = day + 4;

    swal("Agent Deployment",
            `Confirm Agent Deployment to ${region}?`, {
                buttons: ["Cancel", "Confirm"]
            })
        .then((value) => {
            if (value) {
                swal("Agents Deployed", `Agents on the way to ${region}`);
                unitArrivalTime(region, "agents", 2);

                const handleInterval = setInterval(() => {

                    if (day === timeToAcquireIntel) {
                        clearInterval(handleInterval);
                        gatherIntel(region);
                    }
                }, 0);
            }
        });

    if (playerNation.surveillance.fieldAgents <= 0) {
        swal({
            title: "No Agents In Service",
            text: "No more agents to spare. Train some at an Intel-Ops Centre.",
            icon: "warning",
        });
        return;
    }
}

/*
    This function uses several control flows to determine the outcome of any attempted espionage. Firstly, if the player's nation has an infiltation rating higher than the target nation, they have a 75% chance of gaining access to a nation's data. If the player's nation has a lower infiltration rating than the nation they have chosen to spy on, the chance to successfully obtain any data drops to 30%. This mirrors the unpredictable and cut-throat world of espionage!
*/

gatherIntel = (region) => {

    playerNation.unitTechAndSkillRating.infiltration += 1;

    const captured = setProbabilityOfAgentCapture();

    if (captured) {
        agentsAreCaptured(region);
        captureRegion = region;
        nationsHoldingAgents.push(captureRegion);
        $(".agents-imprisoned").append(`<option value="${captureRegion}">${captureRegion}</option>`).removeClass("hidden");
        // If less than the number defined by 'prob', agents successfully report back with nation data 
    } else if (probability(0.86)) {
        espionageSuccessful(region);
    }
}

disallowIntelGatheringIfAgentsCaptive = (region) => {

    if (nationsHoldingAgents.includes(region)) {
        swal("Gathering Intel Disallowed", `Agents are already being held by ${region}. They will be on heightened alert and we should not send any more agents at this time.`);
        return true;
    }
    return false;
}

agentsAreCaptured = (region) => {

    agentsCaptured = true;

    for (let i = 0; i < allNationsAsObjects.length; i++) {
        if (region === allNationsAsObjects[i].name) {
            swal(`${region} Has Captured Your Agent`, `Field Agents: -1 
            Approval Rating: -2 
            ${region} Aggression Level: +5`);
            allNationsAsObjects[i].status.aggressionLevel + 5;
        }
    }
    playerNation.surveillance.fieldAgents -= 1;
    playerNation.status.govtApprovalRating -= 3;
}

espionageSuccessful = (region) => {

    for (let i = 0; i < allNationsAsObjects.length; i++) {
        if (region === allNationsAsObjects[i].name) {
            swal({
                title: "Data Retrieved",
                text: JSON.stringify(allNationsAsObjects[i], null, 4),
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
releaseAgentHostagesAfterSuccessfulWar = (region) => {

    if (nationsHoldingAgents.includes(region)) {

        const indexForNationOfAgentRescue = nationsHoldingAgents.indexOf(region);
        nationsHoldingAgents.splice(indexForNationOfAgentRescue, 1);

        $(`.agents-imprisoned option[value=${region}]`).remove();
    }
}

// Prevent certain functions running if no agents are captured
checkIfAgentsAreHostages = () => {

    if (!agentsCaptured) {
        swal({
            title: "No Hostages Detected",
            icon: "warning",
        });
        return true;
    } //checkif needed
    return false;
}

launchHostageRescue = (region) => {

    if (checkIfAgentsAreHostages()) return;

    nationChosenForRescueAttempt = $(".agents-imprisoned").val();

    for (let i = 0; i < nationsHoldingAgents.length; i++) {

        if (nationsHoldingAgents[i] === nationChosenForRescueAttempt) {

            swal("Spec-Ops Raid",
                    `Confirm Hostage Rescue in ${nationChosenForRescueAttempt}?`, {
                        buttons: ["Cancel", "Confirm"]
                    })
                .then((value) => {
                    if (value) {
                        swal("Spec-Ops Team Deploying", '"Seal Team 1 here, Sir. We are moving out and will be in position in 3 days."');
                        unitArrivalTime(nationChosenForRescueAttempt, "spec-ops", 2, beginSpecOps);
                    }
                });
        }
    }
}

beginSpecOps = (region) => {

    swal({
        title: "Raid In Progress",
        text: `Your Spec Ops team is beginning their raid on ${nationChosenForRescueAttempt}.`,
        icon: "info",
    });

    let rescued;

    if (playerNation.unitTechAndSkillRating.infantrySkill > targetNation.unitTechAndSkillRating.infantrySkill) {
        rescued = probability(0.60);
    } else {
        rescued = probability(0.40);
    }

    if (rescued) {
        agentRescued(region);
    } else {
        agentKilled();
    }
}

// If successful rescue, remove nation holding the agents from respective array and dropdown list
agentRescued = (region) => {

    swal({
        title: "Mission Accomplished",
        text: `Agent has been retrieved from ${region}. 
                Field Agents: +1`,
        icon: "success",
    });

    removeAgentFromHostageArray();
    clearEmptyDropdown();
    playerNation.surveillance.fieldAgents += 1;
}

agentKilled = () => {

    swal({
        title: "Mission Failure",
        text: `Your agent was killed in the rescue attempt. 
                Field Agents: -1`,
        icon: "error",
    });

    removeAgentFromHostageArray();
    clearEmptyDropdown();
    playerNation.surveillance.fieldAgents -= 1;
}

// How is this clearing array in ransom function????!!!
removeAgentFromHostageArray = () => {

    const indexForNationOfAgentRescue = nationsHoldingAgents.indexOf(nationChosenForRescueAttempt);
    nationsHoldingAgents.splice(indexForNationOfAgentRescue, 1);

    $(`.agents-imprisoned option[value=${nationChosenForRescueAttempt}]`).remove();
}

// Clear the dropdown from sidebar if no living agents are captive 

clearEmptyDropdown = () => {
    if (nationsHoldingAgents.length === 0) {
        $(".agents-imprisoned").addClass("hidden");
    }
}

lowerApprovalRatingIfAgentsAreHostages = () => {

    if (nationsHoldingAgents.length === 0) return;

    alert("Ongoing Hostage Crisis", `${nationsHoldingAgents.length} agents being held. 
    Approval Rating: -1 per agent held.`);

    nationsHoldingAgents.forEach(agent => {
        playerNation.status.govtApprovalRating -= 2;
    });
}

payRansom = (region, ransom, nationChosenForRansomPayment) => {

    nationChosenForRansomPayment = $(".agents-imprisoned").val();
    ransom = RNG(5000000, 50000000);
    ransomOptions(ransom, nationChosenForRansomPayment);
}

//How to solve the null dilemma?
ransomOptions = (ransom, nationChosenForRansomPayment) => {

    if (checkIfAgentsAreHostages() || nationChosenForRansomPayment === null) return;

    swal("Ransom Payment",
            `Release agent from captivity in ${nationChosenForRansomPayment} by paying $${ransom}?`, {
                buttons: {
                    cancel: "Refuse Ransom Request",
                    confirm: "Pay Ransom Request"
                },
            })
        .then((value) => {
            if (value) {
                ransomSuccessful(ransom, nationChosenForRansomPayment);
            } else {
                ransomDenied(ransom, nationChosenForRansomPayment);
            }
        });
}

ransomSuccessful = (ransom, nationChosenForRansomPayment) => {

    swal({
        title: "Ransom Paid",
        text: `Your agent has been released from ${nationChosenForRansomPayment}. 
                Field Agents: +1 
                GDP: - $${ransom}`,
        icon: "success",
    });

    playerNation.surveillance.fieldAgents += 1;
    playerNation.gdp -= ransom;
    removeAgentFromHostageArray();
    clearEmptyDropdown();
    $(`.agents-imprisoned option[value=${nationChosenForRansomPayment}]`).remove();
}

ransomDenied = (ransom, nationChosenForRansomPayment) => {

    swal({
        title: "Ransom Request Denied",
        text: `You have refused to pay $${ransom} to ${nationChosenForRansomPayment}. 
                Your agent will continue to be held until you order a spec-ops team to release them, negotiate a release, or invade this nation.`,
        icon: "error",
    });
}

undertakeSabotage = (region) => {

    clearPrevious();

    swal("Sabotage",
            `Attempt to sabotage the operations of ${region}?`, {
                buttons: ["Cancel", "Confirm"]
            })
        .then((value) => {
            if (value) {
                unitArrivalTime(region, "agents", 2, chanceToSabotage);
            }
        });
}

// Effects of a nation being successfully sabotaged
chanceToSabotage = () => {

    if (probability(0.50)) {
        swal("Sabotage Successful", `Agents have successfully sabotaged enemy radar of ${targetNation.name} 
        Enemy Air Units: - 5000`);
        targetNation.militaryUnits.air -= 5000;
    }
}

inciteRebellion = (region, code) => {

    clearPrevious();

    swal("Incite Unrest",
            `Attempt to stir trouble against the government of ${region}?`, {
                buttons: ["Cancel", "Confirm"]
            })
        .then((value) => {
            if (value) {

                const playerInciteLvl =
                    playerNation.unitTechAndSkillRating.infiltration + playerNation.diplomacy;
                const targetInciteLvl =
                    targetNation.unitTechAndSkillRating.infiltration + targetNation.diplomacy;

                // If incite lvl is higher than enemy lvl, your chance for success is 25%. Else, 10%
                let chanceOfSuccessfulRebellion;

                if (playerInciteLvl > targetInciteLvl) {
                    chanceOfSuccessfulRebellion = probability(0.25);
                } else {
                    chanceOfSuccessfulRebellion = probability(0.10);
                }

                if (chanceOfSuccessfulRebellion) {

                    swal({
                        title: "Rebellion Incited",
                        text: `Your agents have caused ${region} to suffer internal dissent. They are no longer a player in the theatre of war`,
                        icon: "success",
                    });

                    territoriesConqueredByCode.push(code);
                    territoriesConqueredByRegion.push(region);
                    console.log(territoriesConqueredByRegion)

                    // Remove the nation's object and therefore the game
                    removeNationFromPlay(region);
                }
                colourDefeatedNations(code, "#AA0000");
            }
        });
}

// Use defence budget to draft soldiers into compulsory military service on a daily basis
// Campaign lasts one month
conscriptTroops = () => {

    // Stop alert playing every second, as it is inside psg of time function
    if (!gameState.conscriptionStarted) {
        swal("Conscripting Troops", "Total recruits will be reported in one month.");
        gameState.conscriptionStarted = true;
    }

    const randomConscriptionNumber = Math.floor(Math.random() * 1000);
    playerNation.militaryUnits.infantry += randomConscriptionNumber;

    dailyInfantryRecruits.push(randomConscriptionNumber);
    console.log(dailyInfantryRecruits)

    if (dailyInfantryRecruits.length >= 30) {

        commands.conscription = false;

        swal({
            title: "Recruitment Drive Report",
            text: `You have managed to recruit ${reduce(dailyInfantryRecruits)} new soldiers this month.`,
            icon: "info",
        });
    }
}

// ************************************************************************************
// ************************************************************************************
// DIPLOMACY


disallowNegotitationIfDealSignedOrAttempted = (region) => {

    if (diplomacyAttempted.includes(region)) {
        swal({
            title: "Diplomacy Disallowed",
            text: `${region} is not open to negotiation.`,
            icon: "warning",
        });
        return true;
    }
    return false;
}

disallowNegotitationIfRegionHostile = (region) => {

    if (targetNation.status.stance === "hostile") {
        swal({
            title: "Hostile Nation",
            text: `Commander, ${region} is hostile and will not negotiate.`,
            icon: "warning",
        });
        return true;
    }
    return false;
}

disallowAllianceIfNationHostile = (region) => {

    if (targetNation.status.stance !== "friendly") {
        swal({
            title: "Alliance Not Possible",
            text: `${region} must be classed as 'friendly'.`,
            icon: "warning",
        });
        return true;
    }
    return false;
}

determineAllianceSuccess = (region, code) => {
    console.log("TN Name: " + targetNation.name);
    const chanceOfAlliance = 0.95;

    if (probability(chanceOfAlliance)) {
        // Run what happens in event of alliance
        alliancePact(region, code);
    } else {
        swal({
            title: "Alliance Unsuccessful",
            text: `${region} refuses to enter into an alliance with your nation at present.`,
            icon: "warning",
        });
        if (!diplomacyAttempted.includes(region)) {
            diplomacyAttempted.push(region);
        }
        return;
    }
    console.log("TN Name: " + targetNation.name);
}

// Chance of agreement is dependent on stances
determineChanceOfAgreement = (targetNation) => {
    console.log("TN Name: " + targetNation.name);
    if (targetNation.status.stance === "neutral") {
        successfulTradeProbability = 0.95;
    } else if (targetNation.status.stance === "friendly") {
        successfulTradeProbability = 0.95;
    } else {
        successfulTradeProbability = 0.95;
    }
    console.log("TN Name: " + targetNation.name);
}

runAgreementChoicePartOne = (region, value, code, targetNation) => {
    console.log("TN Name: " + targetNation.name); // ok
    if (value === "alliance" && !disallowAllianceIfNationHostile(region)) {
        determineAllianceSuccess(region, code);
    } else if (value === "deals") {
        console.log("TN Name: " + targetNation.name); // ok
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
            console.log("TN Name: " + targetNation.name);
            let successfulTradeProbability;
            console.log("TN Name: " + targetNation.name);
            determineChanceOfAgreement(targetNation);
            console.log("TN Name: " + targetNation.name);
            runAgreementChoicePartTwo(value, region, targetNation);
            console.log("TN Name: " + targetNation.name);
        });
    }
}

runAgreementChoicePartTwo = (value, region, targetNation) => {
    console.log("TN Name: " + targetNation.name);
    if (value === "agriculture" && probability(successfulTradeProbability)) {
        agriculturalTariffSuspension(region, targetNation);
    } else if (value === "oil" && probability(successfulTradeProbability)) {
        oilExportDeal(region, targetNation);
    } else if (value === "intelligence" && probability(successfulTradeProbability)) {
        intelCollaborationDeal(region, targetNation);
    } else {
        swal({
            title: "Negotiation Unsuccessful",
            text: `Attempt at negotiation with ${region} has been unsuccessful.`,
            icon: "info",
        });
    }
    console.log("TN Name: " + targetNation.name);
}

negotiation = (region, code, targetNation) => {

    clearPrevious();

    if (disallowNegotitationIfDealSignedOrAttempted(region)) return;
    if (disallowNegotitationIfRegionHostile(region)) return;

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
        // Check that option is not cancel, so that attempted diplomacy is confirmed and recorded
        if (value) {
            // Record that diplomacy has been attempted with this nation
            diplomacyAttempted.push(region);
            runAgreementChoicePartOne(region, value, code, targetNation);
        }
    });
}

// AGRICULTURE

agriculturalTariffSuspension = (region, targetNation) => {
    console.log("TN Name: " + targetNation.name);
    // If no trade deal already, push the new one's region
    if (!playerNation.internationalRelations.tradeDeals.includes(region)) {
        playerNation.internationalRelations.tradeDeals.push(region);
        targetNation.internationalRelations.tradeDeals.push(playerNation.name);
        console.log(targetNation.internationalRelations.tradeDeals)
        console.log("TN Name " + targetNation.name)
        swal("New Trade Deal Ratified", `Congratulations commander, you have signed a trade deal with ${region}. 
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
            icon: "warning",
        });
    }
    console.log("TN Name: " + targetNation.name);
}

// Monthly award of any trade deal bonuses. Ran inside 'monthly Actions'
awardAgriculturalDealBonus = () => {

    for (let i = 0; i < allNationsAsObjects.length; i++) {
        for (let j = 0; j < playerNation.internationalRelations.tradeDeals.length; j++) {

            if (allNationsAsObjects[i].name === playerNation.internationalRelations.tradeDeals[j]) {
                playerNation.gdp += Math.trunc(allNationsAsObjects[i].gdp / 100 * 0.2);
                playerNation.status.govtApprovalRating += 1;
                allNationsAsObjects[i].gdp -= Math.trunc(allNationsAsObjects[i].gdp / 100 * 0.2);
                allNationsAsObjects[i].status.resistance += 5;
            }
        }
    }
    alert("Agricultural Deal Bonus: See 'console' (F12)")
}

// ALLIANCE ASSISTANCE

alliancePact = (region, code) => {
    // Check no current alliance formed
    if (!playerNation.internationalRelations.alliances.includes(region)) {
        playerNation.internationalRelations.alliances.push(region);
        targetNation.internationalRelations.alliances.push(playerNation.name);
        territoriesConqueredByCode.push(code);
        colourDefeatedNations(code, "dodgerblue");
        swal({
            title: "Alliance Forged",
            text: `${playerNation.name} and ${region} have become allies.`,
            icon: "success",
        });
    } else {
        swal({
            title: "Alliance Already Ratified",
            text: `${playerNation.name} and ${region} are allies.`,
            icon: "info",
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
            assignAlliedUnitsToPlayerNation();
            requestReinforcementImpact();
        } else {
            swal({
                title: "No Alliance Found",
                text: `You are not allied with ${region} and cannot request military support.`,
                icon: "warning",
            });
        }
    } else {
        swal({
            title: "Nation Cannot Assist",
            text: `${region} has aided your military once before.`,
            icon: "warning",
        });
        return;
    }
}

requestReinforcementImpact = () => {
    playerNation.resources.defenceBudget -= 1000000;
    targetNation.resources.defenceBudget += 1000000;
    playerNation.status.govtApprovalRating -= 2;
    targetNation.status.aggressionLevel += 2;
}

assignAlliedUnitsToPlayerNation = () => {
    // Increment player units with allied units
    for (units in playerNation.militaryUnits) {
        playerNation.militaryUnits[units] += targetNation.militaryUnits[units] / 100 * 10;
    }
    // Decrement allied units
    for (units in targetNation.militaryUnits) {
        targetNation.militaryUnits[units] -= targetNation.militaryUnits[units] / 100 * 10;
    }
}

oilExportDeal = (region, targetNation) => {
    console.log("TN Name: " + targetNation.name);
    if (!playerNation.internationalRelations.oilExportDeals.includes(region)) {
        playerNation.internationalRelations.oilExportDeals.push(region);
        targetNation.internationalRelations.oilExportDeals.push(playerNation.name);
        console.log(targetNation.internationalRelations.oilExportDeals)
        console.log("TN Name " + targetNation.name)
        swal("New Oil Export Deal Ratified", `Congratulations commander, you have signed a trade deal with ${region}. 
        Benefits of the deal will be awarded on a monthly basis.`, {
                button: "View Monthly Bonuses"
            })
            .then((value) => {
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
    console.log("TN Name: " + targetNation.name);
}

awardOilExportDealBonus = () => {

    console.log(playerNation.resources.oilProduction);
    for (let i = 0; i < allNationsAsObjects.length; i++) {
        for (let j = 0; j < playerNation.internationalRelations.oilExportDeals.length; j++) {

            if (allNationsAsObjects[i].name === playerNation.internationalRelations.oilExportDeals[j]) {
                playerNation.resources.oilProduction += Math.trunc(allNationsAsObjects[i].resources.oilProduction / 100 * 0.3);
                playerNation.status.govtApprovalRating += 1;
                allNationsAsObjects[i].resources.oilProduction -= Math.trunc(allNationsAsObjects[i].resources.oilProduction / 100 * 0.3);
                allNationsAsObjects[i].status.resistance += 1;
            }
        }
    }
}

intelCollaborationDeal = (region, targetNation) => {
    console.log("TN Name: " + targetNation.name);
    if (!playerNation.internationalRelations.intelCollaborationDeals.includes(region)) {
        playerNation.internationalRelations.intelCollaborationDeals.push(region);
        targetNation.internationalRelations.intelCollaborationDeals.push(playerNation.name);

        swal("Share Intel Agreement Ratified", `Congratulations commander, you have signed an intel deal with ${region}. 
        Benefits of the deal will be awarded on a monthly basis.`, {
                button: "View Monthly Bonuses"
            })
            .then((value) => {
                swal(`Both Nations: Agent Skill + 1
                ${region} Resistance: +1
                ${playerNation.name} Govt Approval: + 1`);
            });
    } else {
        swal({
            title: "Intel Pact Exists",
            text: `${playerNation.name} is currently exchanging intel with ${region}.`,
            icon: "info",
        });
        return;
    }
    console.log("TN Name: " + targetNation.name);
}

awardIntelCollaborationDealBonus = () => {

    console.log(playerNation.unitTechAndSkillRating.infiltration);
    for (let i = 0; i < allNationsAsObjects.length; i++) {
        for (let j = 0; j < playerNation.internationalRelations.intelCollaborationDeals.length; j++) {
            if (allNationsAsObjects[i].name === playerNation.internationalRelations.intelCollaborationDeals[j]) {
                playerNation.unitTechAndSkillRating.infiltration += 1;
                playerNation.status.govtApprovalRating += 1;
                allNationsAsObjects[i].unitTechAndSkillRating.infiltration += 1;
                allNationsAsObjects[i].status.resistance += 1;
            }
        }
    }
}

// Iterate through both the previous stances and the current ones - check for discrepancies

detectStanceChange = () => {

    controlStanceChange();
    // DEL WHEN TESTING OVER
    //allNationsAsObjects[0].status.aggressionLevel += 20;
    defineNationStance();

    // setTimeOut prevents message being overridden by other messages that occur concurrently
    
    for (let i = 0; i < previousNationStances.length; i++) {
        for (let j = 0; j < allNationsAsObjects.length; j++) {
            if (previousNationStances[i] !== allNationsAsObjects[i].status.stance) {
                stanceHasChanged = true;
                setTimeout(() => {
                    swal("Nation Stances Changed", "F12 for details.");
                }, 3000);
                console.log(`${allNationsAsObjects[i].name} has become ${allNationsAsObjects[i].status.stance}`);
                break;
            }
        }
    }

    // Hostile nations are removed from treaties / deals on both sides
    treatyWithdrawal();
}

treatyWithdrawal = () => {
    allNationsAsObjects.forEach(nation => {
        severTies(playerNation.internationalRelations, nation.name, nation);
        severTies(nation.internationalRelations, playerNation.name, nation);
    });
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
        }
    }
}

spySatellite = (region, code) => {

    clearPrevious();

    // Ensure a satellite exists
    if (!playerNation.surveillance.satellites) {
        swal({
            title: "Satellite Unavailable",
            text: "You do not yet have a satellite in orbit, commander.",
            icon: "warning",
        });
        return;
    }
    swal("Military Forces Reported: \n" + JSON.stringify(targetNation.militaryUnits, null, 4));
    swal("Nuclear Weapons Identifed: " + JSON.stringify(targetNation.specialWeapons.nuclearWeapons, null, 4));
}

hackFunds = (region) => {

    clearPrevious();

    swal("Cyberattack",
            `Attempt to syphon funds from ${region}?`, {
                buttons: ["Cancel", "Confirm"]
            })
        .then((value) => {

            // If cyberattack confirmed...
            if (value) {

                // There is a cost to cyberattack attempts
                playerNation.resources.defenceBudget -= RNG(50000, 150000);

                // Probability of hack
                let successfulHack, detected;

                if (setProbablityOfSuccessfulHack(successfulHack)) {
                    const amountStolen = RNG(50000, 1000000);
                    swal({
                        title: "Hack Successful",
                        text: `You have stolen $${amountStolen} from ${region}.`,
                        icon: "success",
                    });
                    awardHackingBonus(region, amountStolen);
                } else {
                    swal({
                        title: "Hack Unsuccessful",
                        text: `${region} has prevented you from acquiring resources.`,
                        icon: "success",
                    });
                }
                actionIfHackDetected(region, detected);
            } else return;
        });
}

// For each used here to prevent use of 'targetNation', which can change quickly if player tries to click another nation with the same function soon after, and not applying to correct nation
actionIfHackDetected = (region, detected) => {

    setTimeout(() => {

        if (setProbablityOfDetection(detected)) {
            swal({
                title: `${region} Detected Your Hack!`,
                text: `${region} Aggression Level: + 10 
                        ${region} Resistance Level: + 5 
                        Your Approval Rating: - 5`,
                icon: "warning",
            });

            allNationsAsObjects.forEach(nation => {
                if (nation.name === region) {
                    nation.status.aggressionLevel += 10;
                    nation.status.resistance += 5;
                }
            });
            playerNation.status.govtApprovalRating -= 5;
        }
    }, 3000);
}

setProbablityOfSuccessfulHack = () => {

    if (playerNation.unitTechAndSkillRating.infiltration > targetNation.unitTechAndSkillRating.infiltration) {
        successfulHack = probability(0.90);
    } else {
        successfulHack = probability(0.95);
    }
    return successfulHack;
}

setProbablityOfDetection = () => {

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
awardResources = () => {

    const nationGDP = targetNation.gdp;
    const nationOil = targetNation.resources.oilProduction;

    // Lump sum  awarded to player's national defence budget (1% of defeated nation's GDP)
    playerNation.resources.defenceBudget += targetNation.gdp / 100 * 1;
    // Figure awarded to player's national defence budget each month for occupying a nation
    defeatedNationGDP.push(nationGDP / 100 * 0.5);
    // Oil awarded to player each month for occupying a nation (0.5% of defeated nation's oil) 
    defeatedNationOil.push(nationOil / 100 * 0.5);

    console.log(defeatedNationGDP)
    console.log(defeatedNationOil)
}

defineNationStance = () => {

    for (let i = 0; i < allNationsAsObjects.length; i++) {
        if (allNationsAsObjects[i].status.aggressionLevel >= 0 && allNationsAsObjects[i].status.aggressionLevel < 40) {
            allNationsAsObjects[i].status.stance = "friendly";
        } else if (allNationsAsObjects[i].status.aggressionLevel >= 40 &&
            allNationsAsObjects[i].status.aggressionLevel <= 50) {
            allNationsAsObjects[i].status.stance = "neutral";
        } else {
            allNationsAsObjects[i].status.stance = "hostile";
        }
    }
}

// Functions to monitor the effects of public mood and feeling. Enemy is conquered if it melts
monitorNationResistance = (region, code) => {

    if (playerNation.status.resistance <= 10) {
        swal("DEFEAT", "You have failed in your mission, commander. \nYour people's resistance is now so low that there is no more desire for the struggle for supremacy. \nChaos reigns in the streets, and you have no option now but to step down before you are overthrown.");
        gameoverDefeated();
    } else if (targetNation.status.resistance <= 10) {
        territoriesConqueredByCode.push(code);
        colourDefeatedNations(code, "#AA0000");
        removeNationFromPlay(region);
    }
}

monitorNationGovtApproval = () => {

    if (playerNation.status.govtApprovalRating <= 10) {
        swal("DEFEAT", "You have failed in your mission, commander. \nYour approval rating is too low and after a no-confidence vote, you have been removed from power.");
        gameoverDefeated();
    }
}


// add other functions to the below block???
checkForGameWin = () => {
    if (territoriesConqueredByCode.length === 10) {
        suggestPlayOtherNation();
    }
}

// Only one of each function needed here outside of 'if' block?
suggestPlayOtherNation = () => {

    const playerCurrentNation = playerNation.name;

    if (playerCurrentNation === "Russian Federation") {
        swal("You Did It, Commander!", `You have conqured 10 of the world's nations. 
        The game will reload, so try playing as the ${USA.name}. `);
        gameover();
        setEndTitles();
    } else {
        swal("You Did It, Commander!", `You have conqured 10 of the world's nations. 
        The game will reload, so try playing as the ${Russia.name}. `);
        gameover();
        setEndTitles();
    }
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
    gameState.gameStarted = false;
    $(".sidebar button").attr("disabled", true);
    $(".radar").removeClass("slow-reveal");
    gameState.gameStarted = false;
    inGameTrack.pause();
}

// Main game over function - gamestarted = false also prevents sidebar opening
gameoverDefeated = (playerIsNuked) => {

    gameover();

    gameOverTrack.play();
    gameOverTrack.loop = true;

    $("#removable-status-content, .game-hud, .status-closebtn").remove();
    $(".status-overlay").addClass("status-open game-over-transition")
        .append(`<h2 class="end-header">GAME OVER</h2>`)
        .append(`<button type="button" class="reload-btn" onclick="reloadGame()">Reload</button>`);
    if (gameState.playerNuked) {
        $(".status-overlay").append(`<img src="images/nuked-city.png" alt="city destroyed by nuclear blast" class="game-over-img" />`);
    } else {
        $(".status-overlay").append(`<img src="images/grief.jpg" alt="woman in despair on ground" class="game-over-img" />`);
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
    allNationsAsObjects.forEach(nation => {
        previousNationStances.push(nation.status.stance);
    });
}
