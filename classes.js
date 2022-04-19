

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

checkFunds = (unitCost) => {

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
    //console.log(Math.trunc(reduce(militaryUnitsOilExpenditure)));
}

// MONTHLY EXPENDITURE

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
        playerNation.specialWeapons.nuclearWeapons * 20000
    ];

    nuclearProgrammeMonthlyExpenditure(unitsToMaintain);
    playerNation.resources.defenceBudget -= reduce(unitsToMaintain);

    alert(`Military (including any Nuclear Programmes): $${reduce(unitsToMaintain)}`);
}

/*
    Iterate through the player's base and structure maintenance object, deducting costs for any buildings that exist (if base buidings are not undefined, take respective cost for that building for that month).
*/

monthlyBaseExpenditure = () => {

    baseMaintenanceTotals = [];

    for (const value in playerBase) {

        if (playerBase[value] !== undefined) {
            playerNation.resources.defenceBudget -= structureMaintenance[value];
            alert(`${value}: ${structureMaintenance[value]}`);
            baseMaintenanceTotals.push(structureMaintenance[value]);
        }
    }
    alert(`Monthly Base Maintenance Report: - $${reduce(baseMaintenanceTotals)}`);
}

monthlyExpenditureReport = () => {
    swal({
        title: "Monthly Expenditure Report",
        text: `Current GDP: $${playerNation.gdp},
        Current Defence Budget: $${playerNation.resources.defenceBudget}`,
        icon: "info"
    });
}

// Alert player to incoming monthly expenditures (embedded in 'runGameTime' fn)
alertMonthlyExpenditure = () => {
    swal({
        title: "Expenditures Due: 1 Week",
        icon: "warning"
    });
}

// WHEN NUCLEAR PROGRAMME ACTIVE, COST IS $65,000,000,000???

nuclearProgrammeMonthlyExpenditure = (unitsToMaintain) => {
    if (playerNation.specialWeapons.nuclearWeapons) unitsToMaintain.push(300);
}

// YEARLY EXPENDITURE


// ************************************************************************************
// ************************************************************************************
// INCOME: SOURCES OF REVENUE FOR PLAYER'S NATION


// MONTHLY REVENUES

// Tally up the arrays holding player's resources from other nations & award monthly

resourceIncomeMonthly = () => {
        playerNation.resources.defenceBudget += Math.trunc(reduce(defeatedNationGDP)); 
        playerNation.resources.oilProduction += Math.trunc(reduce(defeatedNationOil));
}

annualDefenceBudgetAndGDP = () => {

    playerNation.resources.defenceBudget += yearlyDefenceBudget;
    playerNation.gdp += yearlyGDP;

    swal("Yearly GDP and Defence Budget Allocated", 
    `GDP: $${playerNation.gdp} $${playerNation.resources.defenceBudget}`);
    console.log("yearly defence budget")
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
