// Globals

// Player's selection will decide the value of this variable - undefine when ready to deploy
let playerNation = USA;

playerNation.specialWeapons.nuclearWeapons = 10; // DELETE WHEN FINISHED
playerNation.specialWeapons.missileShield = 1; // DELETE WHEN FINISHED

/* Keep track of the original value for player's oil production as we need to increment it by itself later on */
let dailyOilProduction = playerNation.resources.oilProduction;
let originalDailyOilProduction = dailyOilProduction;

// Ensure the yearly defence budget / GDP allocation remains unchanged for awarding each year
const yearlyDefenceBudget = playerNation.resources.defenceBudget;
const yearlyGDP = playerNation.gdp;

// Execute monthly actions here, ie expenditures
monthlyActions = () => {
    monthlyBaseExpenditure();
    militaryUnitMaintenanceMonthly();
    resourceIncomeMonthly();
    awardAgriculturalDealBonus();
    lowerApprovalRatingIfAgentsAreHostages();
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


/*
    This function handles the darkening of the screen via an overlay with diminishing opacity. The overlay is displayed and a css class handles the animation / effect. Following this, the story text will scroll and the intro track will play.
*/

//intro();

// Show initial status
displayMainStatus();

// Control what happens when a battle is concluded - 'armiesDefeated' MUST BE RESET!!!
// If even one army is not defeated, player is deemed to lose or draw
// CHECK BACK HERE IF ANY ERRORS IN VICTORY IN BATTLE
trackDefeatedNations = (region, code) => {

    if (armiesDefeated >= 4) {
        territoriesConqueredByCode.push(code);
        territoriesConqueredByRegion.push(region);
        warConsequencesIfWin(region);
    } else {
        warConsequencesIfLose();
    }
    armiesDefeated = 0;
    gameState.unitsOnCampaign = false;
}

warConsequencesIfWin = (region) => {
    militaryVictory(region);
    $("#conquered-nations").append(`<li>${territoriesConqueredByRegion[territoriesConqueredByRegion.length - 1]}</li>`);
    awardResources();
    militaryUnitsGainExp();
    releaseAgentHostagesAfterSuccessfulWar();
    removeNationFromPlay(region);
}

militaryVictory = (region) => {

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
            swal(`Resources: + 1% of the total GDP of ${region} ($${targetNation.gdp / 100 * 1}) - awarded monthly
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
    monitorNationGovtApproval();
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

// Commander will be asked to confirm each option, whether attack, commit sabotage etc
// CURRENTLY UNUSED - DELETE IF NOT UTILISED
executiveDecision = (region) => {

    swal("Confirm Attack",
            `Military in position. 

        Attack ${region}?`, {
                buttons: ["Cancel", "Confirm"]
            })
        .then((value) => {
            if (value) {
                swal("Permission to Engage", `Select ${region} to attack it.`);
            }
        });
}

// add other functions to the below block???
checkForGameWin = () => {
    if (territoriesConqueredByCode.length === 1) {
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

// These commands MUST have a desired map target

playerActions = (region, code) => {

    // Prevent commands being used on player's own nation
    if (playerNation.name === region) return;

    switch (true) {

        case commands.attack:
            playerNation.attackNation(region, code);
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
            playerNation.negotiation(region, code);
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

$(document).ready(() => {

    const worldNationsObjectLength = Object.keys(worldNations).length;

    for (let i = 0; i < worldNationsObjectLength; i++) {

        const allNations = new Nation(

            // Leave the country 'name' parameter as undefined - will be defined later
            this.name = "",
            // Define random nation GDP between $50 billion & $3 trillion
            RNG(3000000000000, 50000000000),
            // Define a random govt type
            randomGovt(),
            // Define a random population between 3 million and 1.5 billion people
            RNG(1500000000, 3000000),
            // Assign a random diplomacy rating between 0 and 100
            RNG(100, 0),
            // Trade deals, alliances, oil export deals & intel collaboration deals
            [], [], [], [],
            // Set a random amount of researchers between 0 and 1000
            RNG(1000, 0),
            // Define a random amount of oil production
            RNG(80000000, 20000000),
            // Set a random amount of oil consumption
            RNG(50000000, 100000),
            // Set a random starting defence budget
            RNG(500000000, 50000000),
            // Set weapon stocks to 0, as this is only important to the player
            0,
            // Set a random amount of air, tank and naval units
            RNG(5000, 250),
            RNG(5000, 250),
            RNG(210, 160),
            // Set a random amount of infantry units
            RNG(1000000, 20000),
            // Set a random amount of field agents
            RNG(5, 0),
            // Set a random amount of satellites
            RNG(50, 0),
            [],
            // Air, armour, infantry & naval tech
            RNG(100, 10),
            RNG(100, 10),
            RNG(100, 10),
            RNG(100, 10),
            // Agent infiltration
            RNG(100, 10),
            // Nuclear weapons & missile shield
            RNG(5, 0),
            RNG(3, 0),
            // Aggression Level
            RNG(100, 5),
            // Stance is defined by function 'defineNationStance'
            "",
            // Resistance - how much fight a country has left to wage war / resist submission
            RNG(100, 1),
            // Approval rating for a nation's govt: if this becomes low, game over
            RNG(100, 1)
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

            // DELETE AGGRESSION INCREASE BELOW WHEN FINISHED
            // allNationsAsObjects[i].status.aggressionLevel += 10;
            defineNationStance();

            for (let j = 0; j < previousNationStances.length; j++) {

                if (previousNationStances[j] !== allNationsAsObjects[i].status.stance) {
                    swal("Nations Have Changed Stance", "Changes are waiting on the overlay.");

                    // Print this out on the overlay or for loop section
                    alert(`${allNationsAsObjects[i].name} has gone from ${previousNationStances[j]} to ${allNationsAsObjects[i].status.stance}`);
                }
            }
        }
        // Hostile nations are removed from treaties / deals on both sides
        hostileNationsTreatyWithdrawal();
    }

    for (let i = 0; i < allNationsAsObjects.length; i++) {
        for (let j = 0; j < worldNations.length; j++) {

            allNationsAsObjects[i].name = worldNations[i];
        }
    }

    hostileNationsTreatyWithdrawal = () => {

        allNationsAsObjects.forEach(nation => {
            removePlayerNationFromPartnerArray(nation);
            removePartnerNationFromPlayerArray(nation);
        });
    }

    removePlayerNationFromPartnerArray = (nation) => {

        // Remove playernation from nation's treaty arrays
        for (relationship in nation.internationalRelations) {

            if (nation.internationalRelations[relationship].length !== 0 && nation.status.stance === "hostile") {

                // AGAIN, USE NORMAL ALERT AS SWAL DOES NOT CYCLE ALL ITERATIONS!!!
                alert(`${nation.name} is withdrawing from the ${relationship}`);

                const playerNationIndex = nation.internationalRelations[relationship].indexOf(playerNation.name);

                nation.internationalRelations[relationship].splice(playerNationIndex, 1);
            }
        }
    }

    removePartnerNationFromPlayerArray = (nation) => {

        // Remove enemy nation from player's treaty arrays
        for (relationship in playerNation.internationalRelations) {

            if (playerNation.internationalRelations[relationship].length !== 0 && nation.status.stance === "hostile") {

                const enemyNationIndex = playerNation.internationalRelations[relationship].indexOf(nation.name);

                playerNation.internationalRelations[relationship].splice(enemyNationIndex, 1);
            }
        }
    }

    // Track all all changes of status every second, to inform the player and enable actions
    // HOW OFTEN TO RUN BELOW FUNCTION? DAILY IN TIME OBJECT? OR SET INTERVAL
    // Important that this is declared after the name of nation is set
    setInterval(() => {
        informPlayerOfNationStanceChange();
    }, 1000);

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
            cyberAttack();
        } else {
            enemyNuclearRetaliation(enemyIsNuked, playerIsNuked, code, region, targetNation);
        }
    }

    cyberAttack = () => {

        const playerGDPBeforeHack = playerNation.gdp;

        playerNation.gdp -= RNG(100000, 5000000000);
        swal(`Hacked by ${targetNation.name}`, `$${playerGDPBeforeHack - playerNation.gdp} has been stolen.`);
    }

    // Don't need definenationstance if being called every second above??
    // Nation begins military build up

    const militaryCoup = () => {

        const randomNation = Math.floor(Math.random() * allNationsAsObjects.length);

        for (let i = 0; i < allNationsAsObjects.length; i++) {

            if (allNationsAsObjects[i] === allNationsAsObjects[randomNation]) {
                allNationsAsObjects[i].status.aggressionLevel = 100;

                // 50% chance of nuclear armament
                if (probability(0.50)) {
                    allNationsAsObjects[i].specialWeapons.nuclearWeapons += 1;
                }

                for (units in allNationsAsObjects[i].militaryUnits) {
                    allNationsAsObjects[i].militaryUnits[units] += RNG(5000, 10000);
                }

                swal(`${allNationsAsObjects[i].name} is experiencing a coup d'état!`, `Aggression Level: 100 
                Stance: Hostile, 

                Nation's Military Power Increased`);
            }
        }
    }

    const naturalDisaster = () => {

        const disasters = ["forest fires", "flooding", "volcanoes", "earthquakes"];
        const randomDisaster = Math.floor(Math.random() * disasters.length);
        const previousPlayerGDP = playerNation.gdp;

        playerNation.gdp -= RNG(100000, 1000000);
        swal("Natural Disaster", `Your nation has been hit by ${disasters[randomDisaster]}! Reparations are necessary. 

        GDP: - $${previousPlayerGDP - playerNation.gdp}`);
        playerNation.resources.defenceBudget -= RNG(50000, 100000);
    }

    // Terror attack on player's nation
    const terroristStrike = () => {

        const terrorTargets = ["city", "vital oil refinery"];
        const randomTarget = Math.floor(Math.random() * terrorTargets.length);

        if (terrorTargets[randomTarget] === terrorTargets[0]) {
            playerNation.status.govtApprovalRating -= 5;
            playerNation.resources.defenceBudget -= 100000;
            swal("Terror Attack", `Terrorists have attacked a ${terrorTargets[randomTarget]} in your nation. Civilian casualties are reported and a clean-up bill is required. 

            Approval Rating: -5 
            Defence Budget: - $100000`);
        } else {
            const previousOilProduction = playerNation.resources.oilProduction;
            playerNation.resources.oilProduction -= RNG(50000, 100000);
            swal("Terror Attack", `Terrorists have attacked a ${terrorTargets[randomTarget]} in your nation. Reparations are necessary. 

            Oil Production: - ${previousOilProduction - playerNation.resources.oilProduction}`);
        }
    }

    const internationalAid = () => {

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

    // Set an array of events that can be randomised to produce game-changing dynamics
    const worldEvents = [
            militaryCoup,
            naturalDisaster,
            terroristStrike,
            internationalAid,
            globalTreaty
    ];

    // COMPLETE EVENT WHEN FINISHED

    runRandomWorldEvent = () => {

        const randomFunction = Math.floor(Math.random() * worldEvents.length);

        for (let i = 0; i < worldEvents.length; i++) {
            console.log(worldEvents[randomFunction]());
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
    displayNationNameOnStatus();

    $('#vmap').vectorMap({
        backgroundColor: '#151515',
        borderColor: '#12CEFC',
        borderOpacity: 0.25,
        borderWidth: 0.6,
        color: '#000',
        // #01826d, #12cefc, #5b565e #9575ad - lilac
        hoverColor: '#9575AD',
        scaleColors: ['#B6D6FF', '#005ACE'],
        // Undefine 'selectedColor' to prevent interference with color change onclick
        selectedColor: '',

        // Tap into 'onLabelShow' to show nation info on tooltip hover
        onLabelShow: (event, label, code) => {

            for (let i = 0; i < allNationsAsObjects.length; i++) {
                if (allNationsAsObjects[i].name === label[0].innerHTML) {
                    targetNation = allNationsAsObjects[i];
                }
            }

            label[0].innerHTML = label[0].innerHTML +
                `<br> Stance: <span id="stance">${targetNation.status.stance}</span> <br> 
                GDP: ${targetNation.gdp} <br> 
                Resistance: ${targetNation.status.resistance}`;
        },

        onRegionClick: (element, code, region) => {

            nationSelect.play();
            showStatusOnPlayerNationSelect(region);

            // First 'if' prevents code running on the player's selected nation

            if (region !== playerNation.name) {

                // If name in object matches region, show it's data in a swal

                for (let i = 0; i < allNationsAsObjects.length; i++) {

                    if (allNationsAsObjects[i].name === region) {
                        targetNation = allNationsAsObjects[i];

                        // Data for nation is displayed only if nation has been infiltrated

                        playerNation.surveillance.infiltratedNations.forEach(nation => {

                            const noIntelAlert = swal(`No Intel on ${region}`, "Send agents or use satellites to spy.");

                            if (playerNation.surveillance.infiltratedNations.length === 0) {
                                noIntelAlert;
                            } else if (targetNation.name === nation) {
                                const stringifiedNationInfo = JSON.stringify(targetNation, null, 4);
                                swal(stringifiedNationInfo);
                            } else {
                                noIntelAlert;
                            }
                        });

                        // User-enabled options
                        playerActions(region, code);
                    }
                }
            }

            // MAY NOT BE NECESSARY
            // Prevent attack upon nations that are already conquered
            for (let i = 0; i < territoriesConqueredByCode.length; i++) {
                if (territoriesConqueredByCode[i] === code) return;
            }
        }
    });
});

playerNation.resources.defenceBudget = 1000000000000;
