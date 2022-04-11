// ************************************************************************************
// ************************************************************************************
// NUCLEAR WARFARE


/* 
    If a nation suffers nuclear annihilation, colour is same as bg and is wiped and unable to be acquired for resources. If the target has nuclear defense, and they defend, they may launch against you if hostility or stance says so. Add new strategic element to object. Remember, nukes needed to validate function.
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

nuclearStrikeOutcomeEnemySide = (enemyIsNuked, playerIsNuked, code, region, targetNation) => {

    setTimeout(() => {
        if (playerNation.specialWeapons.missileShield) {
            playerNation.specialWeapons.missileShield -= 1;
            setTimeout(() => {
                weaponDestroyed.play();
                swal("Enemy Missile Intercept", "A nuclear missile has been shot down");
            }, 2000);
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

    console.log("retaliating: " + targetNation.name)
    console.log("aggression: " + targetNation.status.aggressionLevel)

    if (targetNation.status.stance === "hostile" && targetNation.specialWeapons.nuclearWeapons) {
        launchDetected.play();
        swal("Nuclear Missile Warning", `${targetNation.name} has launched a nuclear missile at you!`);
        targetNation.specialWeapons.nuclearWeapons -= 1;
        console.log("nukes: " + targetNation.specialWeapons.nuclearWeapons)
        console.log("shield: " + targetNation.specialWeapons.missileShield)
        nuclearStrikeOutcomeEnemySide(enemyIsNuked, playerIsNuked, code, region);
        console.log(targetNation.specialWeapons.nuclearWeapons)
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
        monitorNationGovtApproval();
    } else if (enemyIsNuked) {
        territoriesConqueredByCode.push(code);
        colourDefeatedNations(code, "#fff");
        // 'REGION' IS POSSIBLE - RETURN AFTER TESTING
        removeNationFromPlay(region);
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

/* 
    Need to only allow country targeted to be auto attacked as soon as amount of waiting days are over. save country region as global var to then run inside a new deployment attack fn. once this new fn runs, can consider switching attack disallowed bool back to false.
*/

deployForces = (region) => {

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
    monitorNationGovtApproval();
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

    swal("Ongoing Hostage Crisis", `${nationsHoldingAgents.length} agents being held. 
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
                    $("#conquered-nations").append(`<li>${territoriesConqueredByRegion[territoriesConqueredByRegion.length - 1]}</li>`);
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

// Only have one shot at any deal with a nation
// Allowed to access options UNTIL any one negotiation fails - then menu won't open
const diplomacyAttempted = [];

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
}

// Chance of agreement is dependent on stances
determineChanceOfAgreement = () => {

    if (targetNation.status.stance === "neutral") {
        successfulTradeProbability = 0.95;
    } else if (targetNation.status.stance === "friendly") {
        successfulTradeProbability = 0.95;
    } else {
        successfulTradeProbability = 0.95;
    }
}

runAgreementChoicePartTwo = (value, region) => {

    if (value === "agriculture" && probability(successfulTradeProbability)) {
        agriculturalTariffSuspension(region);
    } else if (value === "oil" && probability(successfulTradeProbability)) {
        oilExportDeal(region);
    } else if (value === "intelligence" && probability(successfulTradeProbability)) {
        intelCollaborationDeal(region);
    } else {
        swal({
            title: "Negotiation Unsuccessful",
            text: `Attempt at negotiation with ${region} has been unsuccessful.`,
            icon: "info",
        });
    }
}

runAgreementChoicePartOne = (region, value, code) => {

    if (value === "alliance" && !disallowAllianceIfNationHostile(region)) {
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

            let successfulTradeProbability;
            determineChanceOfAgreement();
            runAgreementChoicePartTwo(value, region);
        });
    }
}

negotiation = (region, code) => {

    clearPrevious();

    if (disallowNegotitationIfDealSignedOrAttempted(region)) return;
    if (disallowNegotitationIfRegionHostile(region)) return;

    // Record that diplomacy has been attempted with this nation
    diplomacyAttempted.push(region);

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
        runAgreementChoicePartOne(region, value, code);
    });
}

// AGRICULTURE

agriculturalTariffSuspension = (region) => {

    // If no trade deal already, push the new one's region
    if (!playerNation.internationalRelations.tradeDeals.includes(region)) {
        playerNation.internationalRelations.tradeDeals.push(region);
        targetNation.internationalRelations.tradeDeals.push(playerNation.name);

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
}

// ALLIANCE ASSISTANCE

// Track whether assistance from one country has already been provided
const assistanceProvided = [];

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

oilExportDeal = (region) => {

    if (!playerNation.internationalRelations.oilExportDeals.includes(region)) {
        playerNation.internationalRelations.oilExportDeals.push(region);
        targetNation.internationalRelations.oilExportDeals.push(playerNation.name);
        console.log(targetNation.internationalRelations.oilExportDeals)
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

intelCollaborationDeal = (region) => {

    if (!playerNation.internationalRelations.intelCollaborationDeals.includes(region)) {
        playerNation.internationalRelations.intelCollaborationDeals.push(region);
        targetNation.internationalRelations.intelCollaborationDeals.push(playerNation.name);
    } else {
        swal({
            title: "Intel Pact Exists",
            text: `${playerNation.name} is currently exchanging intel with ${region}.`,
            icon: "info",
        });
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
            }
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

    constructor(name, gdp, govt, population, diplomacy, tradeDeals, alliances, oilExportDeals, intelCollaborationDeals, researchers, oilProduction, oilConsumption, defenceBudget, weaponStocks, air, tanks, naval, infantry, fieldAgents, satellites, infiltratedNations, airTech, armourTech, infantrySkill, navalTech, infiltration, nuclearWeapons, missileShield, aggressionLevel, stance, resistance, govtApprovalRating) {

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
            satellites: satellites,
            infiltratedNations: []
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
            missileShield: missileShield
        };
        this.status = {
            aggressionLevel: aggressionLevel,
            stance: stance,
            resistance: resistance,
            govtApprovalRating: govtApprovalRating
        };
        this.attackNation = attackNation,
            this.deployForces = deployForces,
            this.deployAgents = deployAgents,
            this.launchHostageRescue = launchHostageRescue,
            this.beginSpecOps = beginSpecOps,
            this.undertakeSabotage = undertakeSabotage,
            this.inciteRebellion = inciteRebellion,
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
    "United States of America", // name
    21000000000000, //gdp
    "Republic", // govt
    350000000, // Population
    68, // Diplomacy
    [], // Trade deals
    [], // Alliances
    [], // Oil export nations
    [], // Intel collaboration deals
    0, // Researchers
    11000000, // Oil production (bbl)
    20000000, // Oil consumption (bbl)
    740500000000, // Defence budget (USD)
    0, // Weapon stocks (from small arms manufacture)
    13247, // Air Power
    6612, // Tanks
    484, // Naval Units
    2245500, // Infantry
    0, // Field agents
    0, // Satellites
    [], // Infiltrated Nations
    80.2, // Air tech
    92.7, // Armour tech
    85, // Infantry skill
    95.8, // Naval tech
    87.8, // Infiltration
    5174, // Nuclear Weapons
    0, // Missile Shield
    10, // Aggression
    "", // Stance - defined by aggression level
    50, // Resistance
    20 // Approval rating
);

const Russia = new Nation(
    "Russian Federation", //name
    1700000000000, // gdp
    "Republic", // govt
    150000000, // Population
    50, // Diplomacy
    [], // Trade deals
    [], // Alliances
    [], // Oil export nations
    [], // Intel collaboration deals
    0, // Researchers
    10760000, // Oil production (oil left after production - consumption: bbl)
    3225000, // Oil consumption (bbl)
    42129000000, // Defence budget (USD)
    0, // Weapon stocks (from small arms manufacture)
    4173, // Air Power
    12420, // Tanks
    605, // Naval units
    1350000, // Infantry
    0, // Field agents
    0, // Satellites
    [], // Infiltrated Nations
    20, // Air tech
    30.5, // Armour tech
    15.2, // Infantry skill
    10.9, // Naval tech
    50.8, // Infiltration
    0, // Nuclear Weapons
    0, // Missile Shield
    10, // Aggression
    "", // Stance - defined by aggression level
    50, // Resistance
    20 // Approval rating
);


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
constructionManager = (structureKey, structureValue, daysToBuild, cost, value) => {

    const structureCost = cost;
    const buildTime = daysToBuild;

    swal(`Construct ${structureValue}?`,
        `ETA: ${buildTime} days 
        Cost: $${cost}`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {

        if (value) {

            purchased(structureValue);

            swal("Building");

            const handleInterval = setInterval(() => {

                if (day === buildTime) {
                    clearInterval(handleInterval);

                    swal({
                        title: `Construction Complete: ${structureValue}`,
                        icon: "success",
                    });

                    constructionComplete.play();

                    structureKey = structureValue;
                    playerBase[structureKey] = structureKey;
                    playerNation.resources.defenceBudget -= cost;
                }
            }, 0);
        }
    });
}

purchased = (structureValue) => {

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

$("#airbase").click(() => {
    if (playerBase.airbase) return;
    if (checkFunds(280000000)) return;
    constructionManager(playerBase.airbase, "airbase", day + 3, 280000000);
});

$("#intel-ops").click(() => {
    if (playerBase.intelOps) return;
    if (checkFunds(5470000000)) return;
    constructionManager(playerBase.intelOps, "intelOps", day + 2, 5470000000);
});

$("#barracks").click(() => {
    if (playerBase.barracks) return;
    if (checkFunds(2000000)) return;
    constructionManager(playerBase.barracks, "barracks", day + 2, 2000000);
});

$("#naval-yard").click(() => {
    if (playerBase.navalYard) return;
    if (checkFunds(2600000000)) return;
    constructionManager(playerBase.navalYard, "navalYard", day + 2, 2600000000);
});

$("#war-factory").click(() => {
    if (playerBase.warFactory) return;
    if (checkFunds(11300000000)) return;
    constructionManager(playerBase.warFactory, "warFactory", day + 2, 11300000000);
});

$("#launch-pad").click(() => {
    if (playerBase.launchPad) return;
    if (checkFunds(444000000)) return;
    constructionManager(playerBase.launchPad, "launchPad", day + 2, 444000000);
});

$("#research-centre").click(() => {
    if (playerBase.researchCentre) return;
    if (checkFunds(48859900)) return;
    constructionManager(playerBase.researchCentre, "researchCentre", day + 2, 48859900);
});

$("#missile-silo").click(() => {
    if (playerBase.missileSilo) return;
    if (checkFunds(120000000)) return;
    constructionManager(playerBase.missileSilo, "missileSilo", day + 2, 120000000);
});


// ************************************************************************************
// ************************************************************************************
// UNIT TRAINING INTERFACE: WHEN RELEVANT FACILITIES ARE CONSTRUCTED 


$("#train-agents").click(() => {

    // Ensure agents cannot be trained if the intel-ops facility has not been constructed
    // Alternatively, could use display none to keep element hidden until built
    if (!playerBase.intelOps) {
        swal({
            title: `Facility Required: Intel Ops Centre`,
            text: "Please construct an Intel-Ops Centre in order to train agents.",
            icon: "warning",
        });
        return;
    }
    processUnitTraining(parseInt($("#field-agents").val()), 100000, playerNation.surveillance, "fieldAgents");
});

$("#purchase-infantry").click(() => {

    if (!playerBase.barracks) {
        swal({
            title: `Facility Required: Barracks`,
            text: "Please construct a Barracks in order to train infantry.",
            icon: "warning",
        });
        return;
    }
    processUnitTraining(parseInt($("#infantry").val()), 80000, playerNation.militaryUnits, "infantry");
});

$("#purchase-aircraft").click(() => {

    if (!playerBase.airbase) {
        swal({
            title: `Facility Required: Airbase`,
            text: "Please construct an Airbase in order to purchase aircraft.",
            icon: "warning",
        });
        return;
    }
    processUnitTraining(parseInt($("#aircraft").val()), 64000000, playerNation.militaryUnits, "air");
});

$("#purchase-warships").click(() => {

    if (!playerBase.navalYard) {
        swal({
            title: `Facility Required: Naval Yard`,
            text: "Please construct a Naval Yard in order to purchase warships.",
            icon: "warning",
        });
        return;
    }
    processUnitTraining(parseInt($("#warships").val()), 100000000, playerNation.militaryUnits, "naval");
});

$("#purchase-tanks").click(() => {

    if (!playerBase.warFactory) {
        swal({
            title: `Facility Required: War Factory`,
            text: "Please construct a War Factory in order to purchase tanks.",
            icon: "warning",
        });
        return;
    }
    processUnitTraining(parseInt($("#tanks").val()), 5000000, playerNation.militaryUnits, "tanks");
});

$("#launch-satellite").click(() => {
    // satellites = 80 million to launch, 390 million to build
    if (!playerBase.launchPad) {
        swal({
            title: `Facility Required: Launch Pad`,
            text: "Please construct a Launch Pad in order to house satellite rockets.",
            icon: "warning",
        });
        return;
    }
    processUnitTraining(parseInt($("#satellites").val()), 470000000, playerNation.surveillance, "satellites");
});

$("#hire-researchers").click(() => {

    if (!playerBase.researchCentre) {
        swal({
            title: `Facility Required: Research Centre`,
            text: "Please construct a Research Centre in order to hire researchers.",
            icon: "warning",
        });
        return;
    }
    processUnitTraining(parseInt($("#researchers").val()), 52000, playerNation, "researchers");
});

$("#build-nukes").click(() => {

    if (!playerBase.missileSilo) {
        swal({
            title: `Facility Required: Missile Silo`,
            text: "Please construct a Missile Silo in order to develop nuclear weapons.",
            icon: "warning",
        });
        return;
    }
    processUnitTraining(
        parseInt($("#warheads").val()), 28000000, playerNation.specialWeapons, "nuclearWeapons");
});

checkFunds = (quantity, unitCost) => {

    const budget = playerNation.resources.defenceBudget;

    if (budget < unitCost) {
        swal({
            title: "Insufficient Funds",
            text: `Funds available: ${budget}. 
                    Funds required: ${unitCost}.`,
            icon: "error",
        });
        return true;
    }
}

disallowZeroUnits = (quantity) => {
    if (quantity <= 0) {
        swal({
            title: "Cannot Train or Build Zero Units",
            icon: "error",
        });
        return true;
    }
}

processUnitTraining = (quantity, cost, playerUnits, unitType) => {

    const numberOfUnits = quantity;
    const unitCost = numberOfUnits * cost;

    // Are units affordable? Is there more than zero selected for building / training?
    if (checkFunds(unitCost)) return;
    if (disallowZeroUnits(quantity)) return;

    const timeFactor = 0.10;
    const unitCompletionTime = Math.trunc(day + (timeFactor * quantity));

    swal(`${quantity} ${unitType}: $${unitCost}?`,
        `ETA: Day ${unitCompletionTime}`, {
            buttons: ["Cancel", "Confirm"]
        }).then((value) => {
        if (value) {

            if (unitType === "nuclearWeapons" || unitType === "satellites") {
                swal("Building");
            } else {
                swal("Training");
            }

            const handleInterval = setInterval(() => {

                if (day >= unitCompletionTime) {

                    if (unitType === "nuclearWeapons" || unitType === "satellites") {
                        constructionComplete.play();
                    } else {
                        unitReady.play();
                    }

                    swal({
                        title: "Units Ready",
                        text: `${numberOfUnits} ${unitType} have entered service, commander.`,
                        icon: "success",
                    });
                    clearInterval(handleInterval);

                    playerUnits[unitType] += numberOfUnits;
                    if (unitType === "researchers") displayDOMResearcherInfo();
                    playerNation.resources.defenceBudget -= unitCost;
                }
            }, 0);
        }
    });
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

    //console.log("Daily Oil Production: " + dailyOilProduction);
}

// Oil used by military units each day
militaryOilExpenditureDaily = () => {

    // Assets covered by the defence budget
    const militaryUnitsOilExpenditure = [
        playerNation.militaryUnits.air * 1000,
        playerNation.militaryUnits.naval * 1500,
        playerNation.militaryUnits.tanks * 2000
    ];

    // If units are deployed, they use 20% more oil
    if (gameState.unitsOnCampaign) {
        militaryUnitsOilExpenditure.forEach((unit) => {
            unit += (20 / 100) * unit;
        });
    }
    playerNation.resources.oilProduction -= Math.trunc(reduce(militaryUnitsOilExpenditure));
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
    playerNation.resources.defenceBudget -= reduce(unitsToMaintain);

    swal(`Military (including any Nuclear Programmes): ${reduce(unitsToMaintain)}`);
}

const structureMaintenance = {
    intelOps: 20000,
    airbase: 30000,
    barracks: 10000,
    warFactory: 25000,
    navalYard: 80000,
    launchPad: 92000,
    researchCentre: 35000,
    missileSilo: 500000,
}

/*
    Iterate through the player's base and structure maintenance object, deducting costs for any buildings that exist (if base buidings are not undefined, take respective cost for that building for that month).
*/

monthlyBaseExpenditure = () => {

    baseMaintenanceTotals = [];

    for (const value in playerBase) {

        if (playerBase[value] !== undefined) {
            playerNation.resources.defenceBudget -= structureMaintenance[value];
            swal(`${value}: ${structureMaintenance[value]}`);
            baseMaintenanceTotals.push(structureMaintenance[value]);
        }
    }
    swal("Monthly Base Maintenance Report", `Total for base: -$${reduce(baseMaintenanceTotals)}
    Current Defence Budget: $${playerNation.resources.defenceBudget}`);
}

monthlyExpenditureReport = () => {

    swal({
        title: "Monthly Expenditure Report",
        text: `Current GDP: ${playerNation.gdp},
        Current Defence Budget: ${playerNation.resources.defenceBudget}`,
        icon: "warning"
    });
}

// Alert player to incoming monthly expenditures (embedded in 'passageoftime' fn)
alertMonthlyExpenditure = () => {

    swal({
        title: "Expenditures Due: 1 Week",
        icon: "warning"
    });
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

    playerNation.resources.defenceBudget = Math.trunc(reduce(GDP));
    playerNation.resources.oilProduction = Math.trunc(reduce(oilProduction));
}

annualDefenceBudgetAndGDP = () => {

    playerNation.resources.defenceBudget += yearlyDefenceBudget;
    playerNation.gdp += yearlyGDP;

    swal("Yearly GDP and Defence Budget Allocated", `GDP: ${playerNation.gdp} <br> ${playerNation.resources.defenceBudget}`);
}

// TRADE

sellOil = () => {

    const numberOfBarrels = parseInt($("#oil").val());
    const oilSalePrice = numberOfBarrels * 75;

    if (playerNation.resources.oilProduction < numberOfBarrels || playerNation.resources.oilProduction <= 0) {
        swal({
            title: "Insufficient Oil",
            text: `Oil remaining: ${playerNation.resources.oilProduction} barrels.`,
            icon: "warning",
        });
        return;
    }

    swal("Sell Oil",
            `Sell ${numberOfBarrels} oil for $${oilSalePrice}?`, {
                buttons: ["Cancel", "Confirm"]
            })
        .then((value) => {
            if (value) {
                sale.play();
                playerNation.resources.oilProduction -= numberOfBarrels;
                playerNation.resources.defenceBudget += oilSalePrice;
                swal({
                    title: "Sale Successful",
                    text: `Oil remaining: ${playerNation.resources.oilProduction} barrels.`,
                    icon: "success",
                });
            }
        });
}

sellWeapons = () => {

    const numberOfWeapons = parseInt($("#weapons-to-sell").val());
    const weaponSalePrice = numberOfWeapons * 1400;

    if (playerNation.resources.weaponStocks < numberOfWeapons || playerNation.resources.weaponStocks <= 0) {
        swal({
            title: "Insufficient Weapons",
            text: `Not enough weapons. Weapons remaining: ${playerNation.resources.weaponStocks}.`,
            icon: "warning",
        });
        return;
    }

    swal("Sell Weapons",
            `Sell ${numberOfWeapons} weapons for $${weaponSalePrice}?`, {
                buttons: ["Cancel", "Confirm"]
            })
        .then((value) => {
            if (value) {
                sale.play();
                playerNation.resources.weaponStocks -= numberOfWeapons;
                playerNation.resources.defenceBudget += weaponSalePrice;
                swal({
                    title: "Sale Successful",
                    text: `Weapons remaining: ${playerNation.resources.weaponStocks}.`,
                    icon: "success",
                });
            }
        });
}

manufactureWeapons = () => {

    const numberOfWeaponsToBuild = parseInt($("#weapons-to-build").val());
    const costOfManufacture = numberOfWeaponsToBuild * 700;
    const timeToManufacture = Math.trunc(day + (numberOfWeaponsToBuild / 100) * 5);

    swal("Manufacture Weapons",
            `Manufacture ${numberOfWeaponsToBuild} weapons at a cost of $${costOfManufacture}?`, {
                buttons: ["Cancel", "Confirm"]
            })
        .then((value) => {
            if (value) {

                swal(`Completion Time: Day ${timeToManufacture}.`);

                const handle = setInterval(() => {

                    if (day >= timeToManufacture) {
                        clearInterval(handle);

                        playerNation.resources.weaponStocks += numberOfWeaponsToBuild;

                        constructionComplete.play();
                        swal({
                            title: "Manufacture Complete",
                            text: `Weapons in stock: ${playerNation.resources.weaponStocks}.`,
                            icon: "success"
                        });
                    }
                }, 500);
            }
        });
}


// ************************************************************************************
// ************************************************************************************
// UPGRADES & RESEARCH: All research requires research personnel, and amount affects speed


checkResearchFacilityAvailable = () => {

    if (!playerBase.researchCentre) {
        swal({
            title: "No Research Centre",
            text: "Research Facility Required for Upgrades",
            icon: "warning",
        });
        return false;
    }
    return true;
}

// Upgrade military units: aircraft, infantry, navy and armour

upgrade = (costOfUpgrade, unitToUpgrade, ratingToIncrease, upgradeValue) => {

    const cost = costOfUpgrade;
    const upgradeUnit = unitToUpgrade;
    const ratingIncrease = ratingToIncrease;

    upgradeComplete.play();

    swal({
        title: "Upgrade Successful",
        text: `Upgrading ${unitToUpgrade} for ${costOfUpgrade}`,
        icon: "success",
    });

    playerNation.resources.defenceBudget -= costOfUpgrade;
    playerNation.unitTechAndSkillRating[ratingToIncrease] += upgradeValue;
}

// Next 2 functions check that there are researchers hired, and whether any are available

checkResearchCapacity = (researcherAllocation) => {
    if (!playerNation.researchers || researcherAllocation > playerNation.researchers) {
        swal({
            title: "Not Enough Researchers",
            text: `Researchers available: ${playerNation.researchers}`,
            icon: "warning",
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
            icon: "warning",
        });
        return true;
    }
}

setResearchAndCostFactor = (costOfResearch, timeFactor) => {
    return [costOfResearch, timeFactor];
}

getResearchersAvailable = () => {
    researchersAvailable = playerNation.researchers - Math.trunc(researchersAssigned.reduce((total, value) => total + value, 0));
    $("#researchers-available").text(" " + researchersAvailable);
}

researchProjectStart = (researcherAllocation, researchProject, costOfResearch, timeToCompleteProject) => {

    swal("Begin Research",
            `Assign ${researcherAllocation} researchers to the ${researchProject} for $${costOfResearch}?`, {
                buttons: ["Cancel", "Confirm"]
            })
        .then((value) => {
            if (value) {

                researchersAssigned.push(researcherAllocation);
                getResearchersAvailable();
                // Remove respective option when research is initiated 
                $("select option[value='" + researchProject + "']").attr("disabled", true);

                assigned[researchProject] = researcherAllocation;

                swal(`Researching ${researchProject}`, `Completion: Day ${timeToCompleteProject}.`);
                playerNation.resources.defenceBudget -= costOfResearch;
                researchProjectCompletion(timeToCompleteProject, researchProject, researchProject, researcherAllocation);
            }
        });
}

// effects of research, assigning researchers
researchProjectCompletion = (timeToCompleteProject, researchProject, projectToUnassign, researcherAllocation) => {

    const handle = setInterval(() => {

        if (day >= timeToCompleteProject) {
            clearInterval(handle);

            removeResearchersFromAssignedStatus(researcherAllocation);

            swal({
                title: `Project ${researchProject} Complete.`,
                icon: "success",
            });

            if (researchProject === "particleCannon") {
                constructionComplete.play();
            } else {
                upgradeComplete.play();
            }

            researchersAvailable += assigned[projectToUnassign];
            $("#researchers-available").text(" " + researchersAvailable);

            delete assigned[projectToUnassign];
            researchImpact(researchProject);
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


// ************************************************************************************
// ************************************************************************************
// MONTHLY REPORT DISPLAY: Show useful info to player, such as unit info and budget etc.

// Main status: overview of all the main stats in the game

displayMainStatus = () => {

    $("li").remove();
    // Print resources to DOM with jQuery chaining
    $("#overview").append(`<li>GDP: $ ${playerNation.gdp}</li>`)
        .append(`<li>Defence Budget: $ ${playerNation.resources.defenceBudget}</li>`)
        .append(`<li>Researchers Employed: ${playerNation.researchers}</li>`)
        .append(`<li>Nations Conquered: ${territoriesConqueredByCode.length}</li>`)
        .append(`<li>Public Approval: ${playerNation.status.govtApprovalRating}</li>`)
        .append(`<li>Agents Imprisoned: ${nationsHoldingAgents.length}</li>`);

    const info = [
        playerNation.resources,
        playerNation.internationalRelations,
        playerNation.militaryUnits,
        playerNation.surveillance,
        playerNation.unitTechAndSkillRating,
        playerNation.specialWeapons
    ];

    // Iterate through nation object to display info to user - skip some shown above already
    info.forEach(item => {
        for (const value in item) {
            // No need to show these again
            if (value === "defenceBudget") {
                continue;
            }
            $("#overview").append(`<li>${value}: ${item[value]}</li>`);
        }
    });
}
