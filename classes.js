/*

*************************************************************************************************
    
    BUILDING INTERFACE: SETUP ('NEW CONSTRUCTION OPTIONS!')
 
    Base facilities and construction are represented as a 'Base' class, which ultimately keeps track of what facilities are built and allows other functions of the game to act on that premise - for instance, if a player has structures, those must be maintained and a cost for their upkeep will be deducted at the end of each month.

*************************************************************************************************

*/


// Initialise nations as objects 

class Nation {

    constructor(name, gdp, diplomacy, tradeDeals, alliances, oilExportDeals, intelCollaborationDeals, researchers, oilProduction, oilConsumption, defenceBudget, weaponStocks, air, tanks, naval, infantry, fieldAgents, satellites, infiltratedNations, airTech, armourTech, infantrySkill, navalTech, infiltration, nuclearWeapons, missileShield, aggressionLevel, stance, resistance, govtApprovalRating) {

        this.name = name;
        this.gdp = gdp - defenceBudget;
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

// SELECTABLE NATIONS - RUSSIA & THE USA - OBJECT DEFINITIONS
// All data correct as of 25 July 2021. Various sources inc. Global Firepower.

const USA = new Nation(
    "United States of America", // name
    21000000000000, //gdp
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
    0, // Nuclear Weapons
    0, // Missile Shield
    10, // Aggression
    "", // Stance - defined by aggression level
    50, // Resistance
    20 // Approval rating
);

const Russia = new Nation(
    "Russian Federation", //name
    1700000000000, // gdp
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

setNationAttributes = () => {

    const worldNationsObjectLength = Object.keys(worldNations).length;

    for (let i = 0; i < worldNationsObjectLength; i++) {

        const allNations = new Nation(

            // Leave the country 'name' parameter as undefined - will be defined later
            this.name = "",
            // Define random nation GDP between $50 billion & $3 trillion
            RNG(3000000000000, 50000000000),
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
}


/*

*************************************************************************************************
    
    BUILDING INTERFACE: SETUP ('NEW CONSTRUCTION OPTIONS!')
 
    Base facilities and construction are represented as a 'Base' class, which ultimately keeps track of what facilities are built and allows other functions of the game to act on that premise - for instance, if a player has structures, those must be maintained and a cost for their upkeep will be deducted at the end of each month.

*************************************************************************************************

*/


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

// Create new instance of 'Base' class, which effectively becomes the player's base
const playerBase = new Base();