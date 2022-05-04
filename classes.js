/*

*************************************************************************************************
    
    HOW 'THEATRE OF WAR' IS BUILT
 
    TOW uses JQVMaps - a JS library that generates a world map with several built-in methods, such as allowing click / hover events on the map nations. However, it does not return any data other than the name of a nation and some other basic object material.
    
    This game would not work without a world map, but finding a world map that I could interact with properly in JS for my needs was difficult. Very little documentation covers JQVMaps itself and I almost gave up on its use. TOW required all of the map's nations (182 in total) to somehow come 'alive', having not just a name, but data and stats: military, diplomatic, resources, behaviour - basic facets of real-world nations.
    
    The biggest issue is that JQVMaps only identifies a nation by country code, outside of click events. In short, if you click on a nation you can find its common name, but in map object itself, it only stores the country codes.
    
    To achieve this, I effectively built my own objects to randomly generate characteristics of all nations in TOW.
    
    To start, I created my own array of all 182 nation names identified from regions in JQVMaps. I then initialised a nation class with the various attributes of all nations in the game, including the player's own selected nation. This forms the basis of every country in TOW.
    
    Next, iterating through my array of 182 named nations ('worldNations') I create a new instance of my 'Nation' class for each of them, the characteristics and statistics of which are defined by a separate 'RNG' function which essentially randomises each attribute. Only the US and Russia are manually defined in terms of object characteristics. These nation instances are in turn pushed into the 'nations' array: the central array that stores all of the game's nations and data for use in TOW. At this stage, nation names are deliberately undefined.
    
    As JQVMaps cannot name nations explicitly outside of click and hover events, a 'setNationNames' function iterates through all the nations, setting the name of every individual nation as the name of each successive name in the 'worldNations' array. Originally using a double for loop to achieve this, refactoring gave me the idea of simply passing the index into the forEach method, applying that to the 'worldNations' array and incrementing the index (and therefore changing the name) on the next iteration. Essentially, each nation object has its name slotted into place using the 'worldNations' array, one at a time. 
    
    The nations (as objects) are now complete and ready for war.

*************************************************************************************************

*/


// Initialise nation class 

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

// Selectable nations Russia & USA: manually defined according to globalfirepower.com

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

    // DAT
    //const worldNationsObjectLength = Object.keys(worldNations).length;

    worldNations.forEach(nation => {

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
        nations.push(allNations);
    });
}

setNationNames = () => {
    nations.forEach((nation, index) => {
        nation.name = worldNations[index];
        index++;
    });
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