// This variable stores the location (nation) of any captured agents
let captureRegion;
// Store the location that spec-ops will be sent to raid
let nationChosenForRescueAttempt;
// Store how many army types have been defeated - if all 4, nation has lost war
let armiesDefeated = 0;
// The following array holds the name of any nations that have captured the player's agents
const nationsHoldingAgents = [];
// Track where troops are deployed to
let deployedToRegion;

let researchersAssigned = [];
let researchersAvailable;

const assigned = {
    asatMissile: "",
    cyreAssaultRifle: "",
    railguns: "",
    kineticArmour: "",
    particleCannon: "",
    missileDefenceShield: ""
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

attackScript = (region, code) => {

    const confirmAttack = confirm("Attack " + region + " ?");

    if (confirmAttack && deployedToRegion === region) {
        swal(playerNation.name + " is attacking the nation of: " + region);
        nationsAtWar();
    } else {
        swal(`Commander, no units are in position to attack ${region}. Please deploy forces.`);
        return;
    }

    // Check whether that nation suffered total defeat - if so, send code to array
    trackDefeatedNations(region, code);
    colourDefeatedNations(code, "#AA0000");
}

// Initiate unit battles
nationsAtWar = () => {

    battle((playerNation.unitTechAndSkillRating.infantrySkill / 100) * playerNation.militaryUnits.infantry, (targetNation.unitTechAndSkillRating.infantrySkill / 100) * targetNation.militaryUnits.infantry, "infantry", "infantry");

    battle((playerNation.unitTechAndSkillRating.airTech / 100) * playerNation.militaryUnits.air, (targetNation.unitTechAndSkillRating.airTech / 100) * targetNation.militaryUnits.air, "air", "air");

    battle((playerNation.unitTechAndSkillRating.navalTech / 100) * playerNation.militaryUnits.naval, (targetNation.unitTechAndSkillRating.navalTech / 100) * targetNation.militaryUnits.naval, "naval", "naval");

    battle((playerNation.unitTechAndSkillRating.armourTech / 100) * playerNation.militaryUnits.tanks, (targetNation.unitTechAndSkillRating.armourTech / 100) * targetNation.militaryUnits.tanks, "tanks", "tanks");
}

// Function dealing with combat between nation's armed forces - air, naval, armour and infantry
battle = (playerStrength, enemyStrength, playerUnits, enemyUnits) => {

    playerUnitsRemaining = playerStrength - enemyStrength;
    enemyUnitsRemaining = enemyStrength - playerStrength;

    playerNation.militaryUnits[playerUnits] = playerUnitsRemaining;
    targetNation.militaryUnits[enemyUnits] = enemyUnitsRemaining;

    if (targetNation.militaryUnits[enemyUnits] <= 0) armiesDefeated++;
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


// ************************************************************************************
// ************************************************************************************
// NUCLEAR WARFARE


/* If a nation suffers nuclear annihilation, colour is same as bg and is wiped and unable to be acquired for resources. If the target has nuclear defense, and they defend, they may launch against you if hostility or stance says so. Add new strategic element to object. Remember, nukes needed to validate function
 */

nuclearStrike = (region, code) => {

    playerNation.specialWeapons.nuclearWeapons = 10; // DELETE WHEN FINISHED
    playerNation.specialWeapons.missileShield = 0; // DELETE WHEN FINISHED

    let playerIsNuked, enemyIsNuked;

    if (playerNation.specialWeapons.nuclearWeapons) {

        const confirmNuclearStrike = confirm(`Launch a nuclear warhead against ${region}?`);

        if (confirmNuclearStrike) {

            playerNation.specialWeapons.nuclearWeapons -= 1;
            console.log("Nuclear missile launched");
            //missileFiredFromPlayer = true;
            nuclearStrikeOutcomePlayerSide(enemyIsNuked, playerIsNuked, code, region);
        }
    } else {
        console.log("You do not yet have nuclear capability.");
    }
}

nuclearStrikeOutcomePlayerSide = (enemyIsNuked, playerIsNuked, code, region) => {

    setTimeout(() => {
        if (targetNation.specialWeapons.missileShield) {
            console.log("russian missile intercepted.")
            nuclearAttackTargetNationStance();
            enemyNuclearRetaliation(region);
            return;
        } else {
            enemyIsNuked = true;
            console.log("Target nation hit!");
            nuclearAftermath(enemyIsNuked, playerIsNuked, code);
        }
    }, 3000);
}

nuclearStrikeOutcomeEnemySide = (region, enemyIsNuked, playerIsNuked, code) => {

    setTimeout(() => {
        if (playerNation.specialWeapons.missileShield) {
            console.log("enemy missile intercepted")
            targetNation.specialWeapons.missileShield -= 1;
            return;
        } else {
            console.log(`${playerNation.name} has suffered a nuclear strike from ${targetNation.name}`);
            playerIsNuked = true;
            nuclearAftermath(enemyIsNuked, playerIsNuked, code);
        }
    }, 3000);
}

// Elevate the targeted nation to max aggression
nuclearAttackTargetNationStance = () => {
    targetNation.status.aggressionLevel = 100;
    defineNationStance();
}

enemyNuclearRetaliation = (region, enemyIsNuked, playerIsNuked, code) => {

    if (targetNation.status.stance === "hostile" && targetNation.specialWeapons.nuclearWeapons) {
        console.log(`${region} has launched a missile at you!`);
        targetNation.specialWeapons.nuclearWeapons -= 1;
        nuclearStrikeOutcomeEnemySide(region, enemyIsNuked, playerIsNuked, code);
    }
}

nuclearAftermath = (enemyIsNuked, playerIsNuked, code) => {

    console.log("aftermath is running")
    if (playerIsNuked) {
        for (building in playerBase) {
            playerBase[building] = undefined;
            console.log("player base: " + playerBase[building]);
            playerNation.status.resistance -= 40;
            playerNation.status.govtApprovalRating -= 10;
            monitorNationGovtApproval();
        }
    } else if (enemyIsNuked) {
        console.log(targetNation);
        territoriesConqueredByCode.push(code);
        colourDefeatedNations(code, "#000");
    }
}

/* kinetic bombardment / kinetic orbital strike - rods of God
Project Thor is an idea for a weapons system that launches telephone pole-sized kinetic projectiles made from tungsten from Earth's orbit to damage targets on the ground.
“kinetic energy projectile”: a super-dense, super-fast projectile that, operating free of complex systems and volatile chemicals, destroys everything in its path.
Those “tungsten thunderbolts,” as the New York Times called them, would impact enemy strongholds below with the devastating velocity of a dino-exterminating impact, obliterating highly fortified targets — like, say, Iranian centrifuges or North Korean bunkers — without the mess of nuclear fallout. */

particleCannonStrike = (region, code) => {

    // 8 hours until weapon above target
    const timeToTargetOrbit = day / 3;
    const deployParticleCannon = confirm(`Deploy Particle Cannon above ${region}?`);

    const handle = setInterval(() => {

        if (deployParticleCannon && day >= timeToTargetOrbit) {
            clearInterval(handle);
            const confirmParticleCannonStrike = confirm(`Fire Particle Cannon at ${region}?`);

            if (confirmParticleCannonStrike) {
                console.log("f")
                targetNation.status.resistance -= 50;
                targetNation.militaryUnits.infantry -= 1000;
                targetNation.militaryUnits.tanks -= 1000;
                monitorNationResistance(region, code);
            }
        }
    }, 500);
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

            if (units === "military") options.unitsInTheatre = true;
            swal(`Commander, ${units} have arrived in ${region}.`);

            try {
                orders();
            } catch (err) {
                console.log(`No orders given for units after arriving in ${region}.`);
            }
        }
    }, 0);
}

/* 
    Need to only allow country targeted to be auto attacked as soon as amount of waiting days are over. save country region as global var to then run inside a new deployment attack fn. once this new fn runs, can consider switching attack disallowed bool back to false 
*/

deployForces = (region) => {

    const confirmDeployment = confirm("Deploy MILITARY to " + region + " ?");

    if (confirmDeployment) {
        unitArrivalTime(region, "military", 2);
        options.unitsOnCampaign = true;
        deployedToRegion = region;
    }
}

// Set intel aqcuistion date to be +4, so that arrival after two and intel 2 days after that
deployAgents = (region) => {

    const confirmEspionage = confirm("Deploy AGENTS to " + region + " ?");
    const timeToAcquireIntel = day + 4;

    if (playerNation.surveillance.fieldAgents <= 0) {
        swal("You have no more agents to spare! Train some at an Intel-Ops Centre.");
        return;
    }

    if (confirmEspionage) {
        swal("Agents on the way to " + region);
        unitArrivalTime(region, "agents", 2);
    }

    const handleInterval = setInterval(() => {

        if (day === timeToAcquireIntel) {
            clearInterval(handleInterval);
            gatherIntel();
        }
    }, 0);

    // Don't show this message after the first time espionage function is utilised
    if (!firstTimeEspionageUse) return;

    swal("Agents will take 4 weeks (28 days) to recover useful intel - if successful at all.");

    firstTimeEspionageUse = false;
}

/*
    This function uses several control flows to determine the outcome of any attempted espionage. Firstly, if the player's nation has an infiltation rating higher than the target nation, they have a 75% chance of gaining access to a nation's data. If the player's nation has a lower infiltration rating than the nation they have chosen to spy on, the chance to successfully obtain any data drops to 30%. This mirrors the unpredictable and cut-throat world of espionage!
*/

gatherIntel = (region) => {

    let chanceOfCapture;

    // Award some exp for simply being in the field
    playerNation.unitTechAndSkillRating.infiltration += 1;

    if (playerNation.unitTechAndSkillRating.infiltration > targetNation.unitTechAndSkillRating.infiltration) {
        chanceOfCapture = probability(0.99);
    } else {
        chanceOfCapture = probability(0.15);
    }

    if (chanceOfCapture) {

        swal("YOUR AGENTS HAVE BEEN CAPTURED!");

        agentsCaptured = true;
        playerNation.surveillance.fieldAgents -= 1;
        playerNation.status.govtApprovalRating -= 3;
        monitorNationGovtApproval();
        console.log(playerNation.surveillance.fieldAgents)

        // Log where the agents have been captured so that rescue can be mounted
        captureRegion = targetNation.name;
        nationsHoldingAgents.push(captureRegion.toUpperCase());
        console.log(nationsHoldingAgents);

        return;
    }

    // If less than the number defined by 'prob', agents successfully report back with nation data 
    if (probability(0.86)) {
        swal(JSON.stringify(targetNation, null, 4));
        playerNation.unitTechAndSkillRating.infiltration += 3;
    }
}

launchHostageRescue = (region) => {

    // Prevent function running if no agents are captured
    if (!agentsCaptured) {
        swal("No agents are known to be in custody at this time, commander.");
        return;
    }

    for (let i = 0; i < nationsHoldingAgents.length; i++) {
        nationsHoldingAgents[i] = nationsHoldingAgents[i].toUpperCase();
    }

    nationChosenForRescueAttempt = prompt(nationsHoldingAgents.join(", ") + " Please enter nation to rescue from: ");

    nationChosenForRescueAttempt = nationChosenForRescueAttempt.toUpperCase();

    for (let i = 0; i < nationsHoldingAgents.length; i++) {

        if (nationsHoldingAgents[i] === nationChosenForRescueAttempt) {

            const confirmRescue = confirm("Mount rescue operation in " + nationChosenForRescueAttempt + "?");

            if (confirmRescue) {
                swal('"Seal Team 1 here, Sir. We are moving out and will be in position in 3 days."');
                console.log(nationChosenForRescueAttempt)
                unitArrivalTime(nationChosenForRescueAttempt, "spec-ops", 2, beginSpecOps);
            }
        }
    }
}

beginSpecOps = () => {

    swal("Seal team 1 is beginning their assault on " + nationChosenForRescueAttempt + ". Standby, commander....");

    const chanceOfRescue = probability(0.10);

    if (chanceOfRescue) {
        swal("Mission failed");
    } else {
        swal("Rescued!");

        // If successful rescue, remove the nation that is holding the agents from respective array
        const indexForNationOfAgentRescue = nationsHoldingAgents.indexOf(nationChosenForRescueAttempt);

        nationsHoldingAgents.splice(indexForNationOfAgentRescue, 1);

        playerNation.surveillance.fieldAgents += 1;

        console.log(indexForNationOfAgentRescue);
        console.log(nationsHoldingAgents);
        console.log(playerNation.surveillance.fieldAgents);
    }
}

undertakeSabotage = (region) => {

    const confirmSabotage = confirm(`Try to sabotage the operations of ${region}?`);

    if (confirmSabotage) {
        unitArrivalTime(region, "agents", 2, chanceToSabotage);
    }
}

// Effects of a nation being successfully sabotaged
chanceToSabotage = () => {

    if (probability(0.50)) {
        swal("sab" + targetNation.name)
        targetNation.militaryUnits.infantry -= 5000;
    }
}

inciteRebellion = (region, code) => {

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
        swal("rebelled");
        territoriesConqueredByCode.push(code);
        territoriesConqueredByRegion.push(region);
        console.log(territoriesConqueredByRegion)
        $("#conquered-nations").append(`<li>${territoriesConqueredByRegion[territoriesConqueredByRegion.length - 1]}</li>`);
        // Remove the nation's object and therefore the game
        targetNation = null;
    }
    colourDefeatedNations(code, "#AA0000");
}

// Keep track of the number of daily conscripts so total can be relayed to commander (player)
const dailyInfantryRecruits = [];

// Use defence budget to draft soldiers into compulsory military service on a daily basis
// Campaign lasts one month
conscriptTroopsRussia = (monthlyInterval) => {

    const randomConscriptionNumber = Math.floor(Math.random() * 1000);
    playerNation.militaryUnits.infantry += randomConscriptionNumber;

    dailyInfantryRecruits.push(randomConscriptionNumber);
    console.log(dailyInfantryRecruits)

    if (day >= monthlyInterval || dailyInfantryRecruits.length >= 30) {
        console.log("month over")
        options.conscription = false;

        const numberOfnewRecruits = dailyInfantryRecruits.reduce((total, currentValue) => total + currentValue, 0);

        swal(`You have managed to recruit ${numberOfnewRecruits} new soldiers this month.`);
    }
}


// Diplomacy

// Only have one shot at any deal with a nation
// Allowed to access options UNTIL any one negotiation fails - then menu won't open
const diplomacyAttempted = [];

negotiation = (region, code) => {

    if (diplomacyAttempted.includes(region)) {
        swal("Diplomacy Disallowed", `${region} is not open to negotiation.`);
        return;
    }

    if (targetNation.status.stance === "hostile") {
        swal("Hostile Nation", `Commander, ${region} is hostile and will not negotiate.`);
        return;
    } else {
        swal("Negotiation & Diplomacy", `How would you like to approach this nation?`, {
                buttons: {
                    cancel: `Cancel negotiations with ${region}`,
                    trade: {
                        text: `Attempt to strike a trade deal with ${region}`,
                        value: "trade",
                    },
                    alliance: {
                        text: `Attempt to form an alliance with ${region}`,
                        value: "alliance",
                    },
                },
            })
            .then((value) => {

                if (value === "alliance") {

                    if (targetNation.status.stance !== "friendly") {
                        swal("Alliance Not Possible", `${region} must be classed as 'friendly'.`);
                        return;
                    }

                    const chanceOfAlliance = 0.95;

                    if (probability(chanceOfAlliance)) {
                        // Run what happens in event of alliance
                        alliancePact(region, code);
                    } else {
                        swal("Alliance Unsuccessful", `${region} does not wish to enter into an alliance with your nation at present.`);
                        if (!diplomacyAttempted.includes(region)) {
                            diplomacyAttempted.push(region);
                        }
                        return;
                    }

                } else if (value === "trade") {
                    swal("Trade", `What would you like to offer ${region}?`, {
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
                        })
                        .then((value) => {

                            // Chance of agreement dependent on stances
                            let successfulTradeProbability;
                            if (targetNation.status.stance === "neutral") {
                                successfulTradeProbability = 0.95;
                            } else if (targetNation.status.stance === "friendly") {
                                successfulTradeProbability = 0.95;
                            } else {
                                successfulTradeProbability = 0;
                            }
                            console.log(successfulTradeProbability)

                            if (value === "agriculture" && probability(successfulTradeProbability)) {
                                agriculturalTariffSuspension(region);
                            } else if (value === "oil" && probability(successfulTradeProbability)) {
                                oilExportDeal(region);
                            } else if (value === "intelligence" && probability(successfulTradeProbability)) {
                                intelCollaborationDeal(region);
                            } else {
                                swal(`Attempt at negotiation with ${region} has been unsuccessful.`);
                                if (!diplomacyAttempted.includes(region)) {
                                    diplomacyAttempted.push(region);
                                }
                                return;
                            }
                        });
                }
            });
    }
}

// AGRICULTURE

agriculturalTariffSuspension = (region) => {

    // If no trade deal already, push the new one's region
    if (!playerNation.internationalRelations.tradeDeals.includes(region)) {
        playerNation.internationalRelations.tradeDeals.push(region);
        swal("New Trade Deal Ratified", `Congratulations commander, you have signed a trade deal with ${region}. \n Benefits of the deal will be awarded on a monthly basis.`, {
            button: "See monthly bonuses for this deal"
        }).then((value) => {
            swal(`Approval Rating: + 1 \n GDP: + 0.2% of the total GDP of ${region}`);
        });
    } else {
        swal("Trade Deal Already Signed", `You already have a trade deal with ${region}.`);
    }
}

// Monthly award of any trade deal bonuses. Ran inside 'monthly Actions'
awardAgriculturalDealBonus = () => {

    console.log(playerNation.gdp);
    for (let i = 0; i < allNationsAsObjects.length; i++) {
        for (let j = 0; j < playerNation.internationalRelations.tradeDeals.length; j++) {

            if (allNationsAsObjects[i].name === playerNation.internationalRelations.tradeDeals[j]) {
                playerNation.gdp += Math.trunc(allNationsAsObjects[i].gdp / 100 * 0.2);
                playerNation.status.govtApprovalRating += 1;
                allNationsAsObjects[i].gdp -= Math.trunc(allNationsAsObjects[i].gdp / 100 * 0.2);
                allNationsAsObjects[i].status.resistance += 5;
                console.log(playerNation.gdp);
            }
        }
    }
}

// ALLIANCE ASSISTANCE

// Track whether assistance from one country has already been provided
const assistanceProvided = [];

alliancePact = (region, code) => {

    // Check no current alliance formed
    if (!playerNation.internationalRelations.alliances.includes(region)) {
        playerNation.internationalRelations.alliances.push(region);
        territoriesConqueredByCode.push(code);
        colourDefeatedNations(code, "dodgerblue");
    } else {
        swal("Nation Allied", `${playerNation.name} and ${region} are current allies.`);
    }
}

// Be careful about this - check a nations status. They may be close to losing patience!
requestAllianceReinforcement = (region) => {

    if (!assistanceProvided.includes(region)) {
        assistanceProvided.push(region);
        if (playerNation.internationalRelations.alliances.includes(region) && targetNation.militaryUnits) {
            swal("Reinforcement Request", `${region} is sending troops to assist your war efforts.`);
            assignAlliedUnitsToPlayerNation();
            requestReinforcementImpact();
        } else {
            swal(`You are not allied with ${region} and cannot request military support.`);
        }
    } else {
        swal("Nation Cannot Assist", `${region} has aided your military once before.`);
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

oilExportDeal = (region) => {

    if (!playerNation.internationalRelations.oilExportDeals.includes(region)) {
        playerNation.internationalRelations.oilExportDeals.push(region);
        targetNation.internationalRelations.oilExportDeals.push(playerNation.name);
    } else {
        swal("Oil Export Deal Already Exists", `${playerNation.name} is currently exporting to ${region}.`);
        return;
    }
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
                console.log(playerNation.resources.oilProduction);
            }
        }
    }
}

intelCollaborationDeal = (region) => {

    if (!playerNation.internationalRelations.intelCollaborationDeals.includes(region)) {
        playerNation.internationalRelations.intelCollaborationDeals.push(region);
        targetNation.internationalRelations.intelCollaborationDeals.push(playerNation.name);
    } else {
        swal("Intel Pact Already Exists", `${playerNation.name} is currently exchanging intel with ${region}.`);
        return;
    }
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
                console.log(playerNation.unitTechAndSkillRating.infiltration);
            }
        }
    }
}

spySatellite = (region, code) => {

    // Ensure a satellite exists
    if (!playerNation.surveillance.satellites) {
        swal("You do not yet have a satellite in orbit, commander.");
        return;
    }
    swal("Military Forces Reported: \n" + JSON.stringify(targetNation.militaryUnits, null, 4));
    swal("Nuclear Weapons Spotted: " + JSON.stringify(targetNation.specialWeapons.nuclearWeapons, null, 4));
}

hackFunds = (region) => {

    swal("Cyberattack", `Attempt to syphon funds from ${region}?`, {
            buttons: ["Cancel", "Confirm"]
        })
        .then((value) => {

            // If cyberattack confirmed...
            if (value) {

                // There is a cost to cyberattack attempts
                playerNation.resources.defenceBudget -= nationStats(50000, 150000);

                // Probability of hack
                let successfulHack, detected;

                if (setProbablityOfSuccessfulHack(successfulHack)) {
                    const amountStolen = nationStats(50000, 1000000);
                    swal("Hack Successful", `You have stolen $${amountStolen} from ${region}.`);
                    awardHackingBonus(region, amountStolen);
                } else {
                    swal("Hack Unsuccessful", `${region} has prevented you from acquiring resources.`);
                }
                actionIfHackDetected(region, detected);
            } else return;
        });
}

// For each used here to prevent use of 'targetNation', which can change quickly if player tries to click another nation with the same function soon after, and not applying to correct nation
actionIfHackDetected = (region, detected) => {

    setTimeout(() => {
        
        if (setProbablityOfDetection(detected)) {
            swal(`${region} Detected Your Hack!`, `${region} Aggression Level: + 10 \n ${region} Resistance Level: + 5 \n Your Approval Rating: - 5`);
            
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

const GDP = [];
const oilProduction = [];

// Resources stockpiled after successfully defeating another nation - added to monthly totals 
awardResources = () => {

    const defeatedNationGDP = targetNation.gdp;
    const defeatedNationOil = targetNation.resources.oilProduction;

    // Lump sum  awarded to player's national defence budget (1% of defeated nation's GDP)
    playerNation.gdp += targetNation.gdp / 100 * 1;
    // Figure awarded to player's national defence budget each month for occupying a nation
    GDP.push(defeatedNationGDP / 100 * 0.5);
    // Oil awarded to player each month for occupying a nation (0.5% of defeated nation's oil) 
    oilProduction.push(defeatedNationOil / 100 * 0.5);

    resourceIncomeMonthly();
}


// Initialise nations as objects 
class Nation {

    constructor(name, gdp, govt, population, diplomacy, tradeDeals, alliances, oilExportDeals, intelCollaborationDeals, researchers, oilProduction, oilConsumption, defenceBudget, weaponStocks, air, tanks, naval, infantry, fieldAgents, satellites, airTech, armourTech, infantrySkill, navalTech, infiltration, nuclearWeapons, missileShield, specialWeapon1, aggressionLevel, stance, resistance, govtApprovalRating) {

        this.name = name;
        this.gdp = gdp - defenceBudget;
        this.govt = govt;
        this.population = population;
        this.diplomacy = diplomacy;
        this.internationalRelations = {
            tradeDeals: [],
            alliances: [],
            oilExportDeals: [],
            intelCollaborationDeals: []
        };
        this.researchers = researchers,
            this.resources = {
                oilProduction: oilProduction,
                oilConsumption: oilConsumption,
                defenceBudget: defenceBudget,
                weaponStocks: weaponStocks
            };
        this.militaryUnits = {
            air: air,
            tanks: tanks,
            naval: naval,
            infantry: infantry
        };
        this.surveillance = {
            fieldAgents: fieldAgents,
            satellites: satellites
        };
        this.unitTechAndSkillRating = {
            airTech: airTech,
            armourTech: armourTech,
            infantrySkill: infantrySkill,
            navalTech: navalTech,
            infiltration: infiltration
        };
        this.specialWeapons = {
            nuclearWeapons: nuclearWeapons,
            missileShield: missileShield,
            specialWeapon1: specialWeapon1
        };
        this.status = {
            aggressionLevel: aggressionLevel,
            stance: stance,
            resistance: resistance,
            govtApprovalRating: govtApprovalRating
        };
        this.attack = attackScript,
            this.deployForces = deployForces,
            this.deployAgents = deployAgents,
            this.launchHostageRescue = launchHostageRescue,
            this.beginSpecOps = beginSpecOps,
            this.undertakeSabotage = undertakeSabotage,
            this.inciteRebellion = inciteRebellion,
            this.conscriptTroopsRussia = conscriptTroopsRussia,
            this.negotiation = negotiation,
            this.spySatellite = spySatellite,
            this.nuclearStrike = nuclearStrike,
            this.particleCannonStrike = particleCannonStrike,
            this.requestAllianceReinforcement = requestAllianceReinforcement,
            this.hackFunds = hackFunds
    }
}


// ************************************************************************************
// ************************************************************************************
// SELECTABLE NATIONS - RUSSIA & THE USA - OBJECT DEFINITIONS
// All data correct as of 25 July 2021. Various sources inc. Global Firepower (add link / citation)


// May not need name as can tap into 'region' method in JQVMap
const USA = new Nation(
    "The United States of America",
    281928,
    "Republic",
    350000000, // Population
    11000000, // Oil production (bbl)
    20000000, // Oil consumption (bbl)
    740500000000, // Defence budget (USD)
    13233, // Air Power
    6100, // Tanks
    223, // Naval Units
    2245500, // Infantry
    80.2, // Air tech
    92.7, // Armour tech
    85, // Infantry skill
    95.8, // Naval tech
    87.8, // Infiltration
    5174 // Nuclear Weapons
);

const Russia = new Nation(
    "The Russian Federation",
    1700000000000,
    "Republic",
    150000000, // Population
    60, // Diplomacy
    [], // Trade deals
    [], // Alliances
    [], // Oil export nations
    [], // Intel collaboration deals
    0, // Researchers
    10760000, // Oil production (oil left after production - consumption: bbl)
    3225000, // Oil consumption (bbl)
    42129000000, // Defence budget (USD)
    0, // Weapon stocks (from small arms manufacture)
    14144, // Air Power
    13000, // Tanks
    279, // Naval units
    13569000, // Infantry
    0, // Field agents
    0, // Satellites
    20, // Air tech
    30.5, // Armour tech
    15.2, // Infantry skill
    10.9, // Naval tech
    50.8, // Infiltration
    0, // Nuclear Weapons
    0, // Missile Shield
    "Iron Curtain", // Special weapon
    10, // Aggression
    "", // Stance - defined by aggression level
    50, // Resistance
    20 // Approval rating
);


// ************************************************************************************
// ************************************************************************************
// STATS GENERATOR FUNCTION THAT DEFINES ALL OTHER NATION'S DATA & OBJECTS


// Generate random numbers between a set range for use when creating nation stats
const nationStats = (lowerLimit, upperLimit) => {
    return Math.floor(Math.random() * (upperLimit - lowerLimit) + lowerLimit);
}

// Initialise a small array of goverment types and then select one at random
const governmentTypeArray = ["Republic", "Monarchy"];
const govtArrayRandomSelector = Math.floor(Math.random() * 2);
const randomGovt = governmentTypeArray[govtArrayRandomSelector];

// ************************************************************************************
// ************************************************************************************
// BUILDING INTERFACE: NEW CONSTRUCTION OPTIONS


class Base {
    constructor(intelOps, airbase, barracks, warFactory, navalYard, launchPad, researchCentre, missileSilo) {

        this.intelOps = intelOps,
            this.airbase = airbase,
            this.barracks = barracks,
            this.warFactory = warFactory,
            this.navalYard = navalYard,
            this.launchPad = launchPad,
            this.researchCentre = researchCentre,
            this.missileSilo = missileSilo
    }
}

// Changes building brings need to be implemented - ie unit + or skill tree
// Also need to allow other buttons to function - ie, intelops allows agent training + purchase

// Create new instance of 'Base' class, which effectively becomes the player's base
const playerBase = new Base();

// Adds the building to the new 'Buildings' instance derived from the 'Base' class
// Base object then tracks what has been constructed and ultimately what can be built
constructionManager = (structureKey, structureValue, daysToBuild, cost) => {

    const buildTime = daysToBuild;
    const structureCost = cost;

    if (checkFunds(structureCost)) return;

    const handleInterval = setInterval(() => {

        if (day === buildTime) {
            clearInterval(handleInterval);
            structureKey = structureValue;
            playerBase[structureKey] = structureKey;
            swal("Construction complete: " + structureKey);

            playerNation.resources.defenceBudget -= cost;
        }
    }, 0);
}

$("#airbase").click(() => {
    if (playerBase.airbase) return;
    constructionManager(playerBase.airbase, "airbase", day + 3, 280000000);
});
$("#intel-ops").click(() => {
    if (playerBase.intelOps) return;
    constructionManager(playerBase.intelOps, "intelOps", day + 2, 5470000000);
});
$("#barracks").click(() => {
    if (playerBase.barracks) return;
    constructionManager(playerBase.barracks, "barracks", day + 2, 2000000);
});
$("#naval-yard").click(() => {
    if (playerBase.navalYard) return;
    constructionManager(playerBase.navalYard, "navalYard", day + 2, 2600000000);
});
$("#war-factory").click(() => {
    if (playerBase.warFactory) return;
    constructionManager(playerBase.warFactory, "warFactory", day + 2, 11300000000);
});
$("#launch-pad").click(() => {
    if (playerBase.launchPad) return;
    constructionManager(playerBase.launchPad, "launchPad", day + 2, 444000000);
});
$("#research-centre").click(() => {
    if (playerBase.researchCentre) return;
    constructionManager(playerBase.researchCentre, "researchCentre", day + 2, 48859900);
});
$("#missile-silo").click(() => {
    if (playerBase.missileSilo) return;
    constructionManager(playerBase.missileSilo, "missileSilo", day + 2, 120000000);
});


// ************************************************************************************
// ************************************************************************************
// UNIT TRAINING INTERFACE: WHEN RELEVANT FACILITIES ARE CONSTRUCTED 


$("#train-agents").click(() => {

    // Ensure agents cannot be trained if the intel-ops facility has not been constructed
    // Alternatively, could use display none to keep element hidden until built
    if (!playerBase.intelOps) {
        swal("Unable to train agents: Please construct an Intel-Ops Centre.");
        return;
    }
    processUnitTraining(parseInt($("#field-agents").val()), 100000, day + 2, playerNation.surveillance, "fieldAgents");
});

$("#purchase-infantry").click(() => {

    if (!playerBase.barracks) {
        swal("Unable to train infantry: Please construct a barracks.");
        return;
    }
    processUnitTraining(parseInt($("#infantry").val()), 80000, day + 2, playerNation.militaryUnits, "infantry");
});

$("#purchase-aircraft").click(() => {

    if (!playerBase.airbase) {
        swal("Unable to purchase aircraft: Please construct an airbase.");
        return;
    }
    processUnitTraining(parseInt($("#aircraft").val()), 64000000, day + 2, playerNation.militaryUnits, "air");
});

$("#purchase-warships").click(() => {

    if (!playerBase.navalYard) {
        swal("Unable to purchase warships: Please construct a Naval Yard.");
        return;
    }
    processUnitTraining(parseInt($("#warships").val()), 64000000, day + 2, playerNation.militaryUnits, "naval");
});

$("#purchase-tanks").click(() => {

    if (!playerBase.warFactory) {
        swal("Unable to purchase tanks: Please construct a War Factory.");
        return;
    }
    processUnitTraining(parseInt($("#tanks").val()), 64000000, day + 2, playerNation.militaryUnits, "tanks");
});

$("#launch-satellite").click(() => {
    // satellites = 80 million to launch, 390 million to build
    if (!playerBase.launchPad) {
        swal("Unable to launch satellite: Please construct a Launch Pad.");
        return;
    }
    processUnitTraining(parseInt($("#satellites").val()), 470000000, day + 2, playerNation.surveillance, "satellites");
});

$("#hire-researchers").click(() => {

    if (!playerBase.researchCentre) {
        swal("Unable to hire researchers. Please construct a Research Centre.");
        return;
    }
    processUnitTraining(parseInt($("#researchers").val()), 52000, day + 2, playerNation, "researchers");
});

$("#build-nukes").click(() => {

    if (!playerBase.missileSilo) {
        swal("Unable to store any nuclear missiles. Please construct a Missile Silo.");
        return;
    }
    processUnitTraining(parseInt($("#warheads").val()), 28000000, day + 2, playerNation.specialWeapons, "nuclearWeapons");
});

checkFunds = (unitCost) => {

    const budget = playerNation.resources.defenceBudget;
    console.log(unitCost)

    if (budget < unitCost) {
        swal(`Insufficient funds. Funds available: ${budget}. \n Funds required: ${unitCost}.`);
        return true;
    }
}

processUnitTraining = (quantity, cost, timeUntilReady, playerUnits, unitType) => {

    console.log(playerUnits)
    console.log(playerNation.resources.defenceBudget)

    const numberOfUnits = quantity;
    const unitCost = numberOfUnits * cost;
    const unitCompletionTime = timeUntilReady;

    // Are units affordable? Run function that checks the current defence budget of the player
    if (checkFunds(unitCost)) return;

    const handleInterval = setInterval(() => {

        if (day === unitCompletionTime) {

            swal(numberOfUnits + " " + unitType + " have entered service, commander.");
            clearInterval(handleInterval);

            playerUnits[unitType] += numberOfUnits;
            if (unitType === "researchers") displayDOMResearcherInfo();
            playerNation.resources.defenceBudget -= unitCost;

            console.log(playerUnits)
            console.log(playerNation.resources.defenceBudget)
        }
    }, 0);
}


// ************************************************************************************
// ************************************************************************************
// UPKEEP & EXPENDITURE: MAINTENANCE COSTS FOR PLAYER ASSETS 


// DAILY EXPENDITURE

// Player oil supply is how much oil player actually has
generalResourceExpenditureDaily = () => {

    // Oil: production minus consumption, daily
    dailyOilProduction += originalDailyOilProduction - playerNation.resources.oilConsumption;
    playerNation.resources.oilProduction = dailyOilProduction;

    console.log("increasing daily production " + dailyOilProduction);
}

// Oil used by military units each day
militaryOilExpenditureDaily = () => {

    // Assets covered by the defence budget
    const militaryUnitsOilExpenditure = [
        playerNation.militaryUnits.air * 5000,
        playerNation.militaryUnits.naval * 3000,
        playerNation.militaryUnits.tanks * 2000
    ];

    // If units are deployed, they use 20% more oil
    if (options.unitsOnCampaign) {
        militaryUnitsOilExpenditure.forEach((unit) => {
            unit += (20 / 100) * unit;
        });
    }

    playerNation.resources.oilProduction -= Math.trunc(militaryUnitsOilExpenditure.reduce((total, value) => total + value, 0));
}

// MONTHLY EXPENDITURE

// Basic Russian upkeep is nearly $90 billion!
militaryUnitMaintenanceMonthly = () => {

    const unitsToMaintain = [
        playerNation.militaryUnits.air * 10000,
        playerNation.militaryUnits.infantry * 25000,
        playerNation.militaryUnits.naval * 1500000,
        playerNation.militaryUnits.tanks * 20000,
        playerNation.surveillance.fieldAgents * 30000,
        playerNation.surveillance.satellites * 125000,
        playerNation.specialWeapons.nuclearWeapons * 2916666666,
        playerNation.researchers * 40000,
        playerNation.specialWeapons.nuclearWeapons * 100000000
    ];

    nuclearProgrammeAnnualExpenditure(unitsToMaintain);

    const totalUnitMaintenance = unitsToMaintain.reduce((total, currentValue) => total + currentValue, 0);
    playerNation.resources.defenceBudget -= totalUnitMaintenance;
    console.log(playerNation.resources.defenceBudget)
}

const structureMaintenance = {
    intelOps: 2,
    airbase: 2,
    barracks: 2,
    warFactory: 2,
    navalYard: 2,
    launchPad: 2,
    researchCentre: 2,
    missileSilo: 5000000,
}

expenditure = () => {

    for (value in playerBase) {

        if (playerBase[value] !== undefined) {

            console.log(playerBase[value]);
            playerNation.resources.defenceBudget -= structureMaintenance[value];
            console.log(structureMaintenance[value]);
            console.log(playerNation.resources.defenceBudget);
        }
    }
}

// YEARLY EXPENDITURE

// WHEN NUCLEAR PROGRAMME ACTIVE, COST IS $65,000,000,000

nuclearProgrammeAnnualExpenditure = (unitsToMaintain) => {
    if (playerNation.specialWeapons.nuclearWeapons) unitsToMaintain.push(300);
}


// ************************************************************************************
// ************************************************************************************
// INCOME: SOURCES OF REVENUE FOR PLAYER'S NATION


// MONTHLY REVENUES

// Tally up the arrays holding player's resources from other nations & award monthly
resourceIncomeMonthly = () => {
    playerNation.resources.defenceBudget = Math.trunc(GDP.reduce((total, value) => total + value, 0));
    playerNation.resources.oilProduction = Math.trunc(oilProduction.reduce((total, value) => total + value, 0));
}

annualDefenceBudgetAndGDP = () => {
    console.log(playerNation.resources.defenceBudget)
    console.log(playerNation.gdp)
    playerNation.resources.defenceBudget += yearlyDefenceBudget;
    playerNation.gdp += yearlyGDP;
    console.log(playerNation.resources.defenceBudget)
    console.log(playerNation.gdp)
}

// INCREMENT DEFENCE SPENDING VIA A PERCENTAGE OF THE NATION'S GDP - USED ONLY ONCE ANNUALLY    

assignPercentageOfGDPToDefenceBudget = () => {

    const percentage = parseInt($("#percentage").val());
    const percentageValue = (percentage / 100) * playerNation.gdp;

    console.log(percentageValue);
    playerNation.resources.defenceBudget += percentageValue;

    publicApprovalOfDefenceSpending(percentage);
    $("#assign-GDP-btn").prop("disabled", true);
}

publicApprovalOfDefenceSpending = (percentage) => {

    if (percentage >= 1 && percentage <= 10) {
        playerNation.status.govtApprovalRating -= 10;
    } else if (percentage >= 10 && percentage <= 15) {
        playerNation.status.govtApprovalRating -= 15;
    } else if (percentage >= 15 && percentage <= 20) {
        playerNation.status.govtApprovalRating -= 25;
    } else if (percentage >= 20) {
        playerNation.status.govtApprovalRating -= 50;
    }
    monitorNationGovtApproval();
}

// TRADE

sellOil = () => {

    const numberOfBarrels = $("#oil").val();
    const oilSalePrice = numberOfBarrels * 75;

    if (playerNation.resources.oilProduction < numberOfBarrels || playerNation.resources.oilProduction <= 0) {
        swal(`Not enough oil. Oil remaining: ${playerNation.resources.oilProduction}.`);
        return;
    }

    const confirmOilSale = confirm(`Sell ${numberOfBarrels} oil for $${oilSalePrice}?`);

    if (confirmOilSale) {
        playerNation.resources.oilProduction -= numberOfBarrels;
        playerNation.resources.defenceBudget += oilSalePrice;
    }
}

sellWeapons = () => {

    const numberOfWeapons = $("#weapons-to-sell").val();
    const weaponSalePrice = numberOfWeapons * 1400;

    if (playerNation.resources.weaponStocks < numberOfWeapons || playerNation.resources.weaponStocks <= 0) {
        swal(`Not enough weapons. Weapons remaining: ${playerNation.resources.weaponStocks}.`);
        return;
    }

    const confirmWeaponSale = confirm(`Sell ${numberOfWeapons} weapons for $${weaponSalePrice}?`);

    if (confirmWeaponSale) {
        playerNation.resources.weaponStocks -= numberOfWeapons;
        playerNation.resources.defenceBudget += weaponSalePrice;
    }
}

manufactureWeapons = () => {

    const numberOfWeaponsToBuild = parseInt($("#weapons-to-build").val());
    const costOfManufacture = numberOfWeaponsToBuild * 700;

    const timeToManufacture = day + (numberOfWeaponsToBuild / 100) * 5;
    console.log(timeToManufacture);

    const confirmWeaponManufacture = confirm(`Manufacture ${numberOfWeaponsToBuild} weapons at a cost of ${costOfManufacture}?`);

    if (confirmWeaponManufacture) {

        const handle = setInterval(() => {

            if (day >= timeToManufacture) {
                clearInterval(handle);
                console.log(playerNation.resources.weaponStocks);
                playerNation.resources.weaponStocks += numberOfWeaponsToBuild;
                console.log(playerNation.resources.weaponStocks);
            }
        }, 500);
    }
}


// ************************************************************************************
// ************************************************************************************
// UPGRADES & RESEARCH: All research requires research personnel, and amount affects speed


// Upgrade military units: aircraft, infantry, navy and armour

upgrade = (costOfUpgrade, unitToUpgrade, ratingToIncrease, upgradeValue) => {

    if (!checkResearchCapacity()) return;
    console.log("upgrading")

    const cost = costOfUpgrade;
    const upgradeUnit = unitToUpgrade;
    const ratingIncrease = ratingToIncrease;
    console.log(playerNation.resources.defenceBudget)
    console.log(playerNation.unitTechAndSkillRating.navalTech)
    swal(`Upgrading ${unitToUpgrade} for ${costOfUpgrade}.`);

    playerNation.resources.defenceBudget -= costOfUpgrade;
    playerNation.unitTechAndSkillRating[ratingToIncrease] += upgradeValue;
    console.log(playerNation.resources.defenceBudget)
    console.log(playerNation.unitTechAndSkillRating.navalTech)
}

// Next 2 functions check that there are researchers hired, and whether any are available

checkResearchCapacity = (researcherAllocation) => {
    if (!playerNation.researchers || researcherAllocation > playerNation.researchers) {
        swal(`Not enough researchers. Available: ${playerNation.researchers}`)
        return false;
    }
    return true;
}

checkResearchersAvailable = (researcherAllocation, researchersAvailable) => {
    if (researcherAllocation > researchersAvailable) {
        swal(`You have ${researchersAvailable} researchers available for projects.`);
        return true;
    }
}

setResearchAndCostFactor = (costOfResearch, timeFactor) => {
    costOfResearch = costOfResearch;
    timeFactor = timeFactor;
    return [costOfResearch, timeFactor];
}

getResearchersAvailable = () => {
    researchersAvailable = playerNation.researchers - Math.trunc(researchersAssigned.reduce((total, value) => total + value, 0));
    $("#researchers-available").text(" " + researchersAvailable);
}

researchProjectStart = (researcherAllocation, researchProject, costOfResearch, timeToCompleteProject) => {

    const confirmResearchProject = confirm(`Assign ${researcherAllocation} researchers to the ${researchProject} for $${costOfResearch}?`);

    if (confirmResearchProject) {

        assigned[researchProject] = researcherAllocation;

        swal(`Researching ${researchProject}. \nCompletion: Day ${timeToCompleteProject}.`);
        playerNation.resources.defenceBudget -= costOfResearch;
        researchProjectCompletion(timeToCompleteProject, researchProject, researchProject, researcherAllocation);
    }
}

// effects of research, assigning researchers
researchProjectCompletion = (timeToCompleteProject, researchProject, projectToUnassign, researcherAllocation) => {

    const handle = setInterval(() => {

        if (day >= timeToCompleteProject) {
            clearInterval(handle);

            removeResearchersFromAssignedStatus(researcherAllocation);
            swal(`Project ${researchProject} is complete.`);

            researchersAvailable += assigned[projectToUnassign];
            $("#researchers-available").text(" " + researchersAvailable);

            delete assigned[projectToUnassign];
            console.log(assigned)
        }
    }, 0);
}

removeResearchersFromAssignedStatus = (researcherAllocation) => {

    // MUST BE REDECLARED TO CHECK CURRENT AMOUNT OF RESEARCHERS!!!
    getResearchersAvailable();

    for (let i = 0; i < researchersAssigned.length; i++) {
        if (researcherAllocation == researchersAssigned[i]) {
            console.log("removing " + researchersAssigned[i])
            researchersAssigned.splice(i, 1);
            break;
            console.log("array 2: " + researchersAssigned)
        }
    }
}

researchImpact = (researchProject) => {

    if (researchProject === "ASAT Missile") {
        playerNation.specialWeapons.nuclearWeapons = 10;
    } else if (researchProject === "Cyre Assault Rifle") {
        playerNation.unitTechAndSkillRating.infantrySkill = 100;
    }
}


// ************************************************************************************
// ************************************************************************************
// MONTHLY REPORT DISPLAY: Show useful info to player, such as unit info and budget etc.

displayMainStatus = () => {

    //$(".overlay").css("display", "block");
    // Remove title screen info so that monthly report looks cleaner and fits on overlay
    $(".title-screen").css("display", "none");

    // Print resources to DOM with jQuery chaining. Note break in last line for distinction
    $("#overview").append(`<li>GDP: ${playerNation.gdp}</li>`)
        .append(`<li>Researchers Employed: ${playerNation.researchers}</li>`)
        .append(`<li>Nations Conquered: ${territoriesConqueredByCode.length}</li>`)
        .append(`<li>Agents Imprisoned: ${nationsHoldingAgents.length}</li><br>`);

    const info = [
        playerNation.resources,
        playerNation.militaryUnits,
        playerNation.surveillance,
        playerNation.unitTechAndSkillRating,
        playerNation.specialWeapons,
        playerNation.status
    ];

    // Iterate through nation object to display info to user - skip 3 resources ones after swim
    info.forEach(item => {
        for (const value in item) {
            // No need to show these again
            if (value === "oilProduction" ||
                value === "oilConsumption" ||
                value === "defenceBudget") {
                continue;
            }
            $("#overview").append(`<li>${value}: ${item[value]}</li>`);
        }
    });
}
