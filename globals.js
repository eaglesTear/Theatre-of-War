// Globals

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


// Player's selection will decide the value of this variable - undefine when ready to deploy
let playerNation = Russia;

// Parsing as float allows the most accurate measurement of an average calendar month later on
let day = parseFloat(1);

// Define the newly created country (object) for use in the battle function 
let targetNation;

// Checks whether any agents of the player are being held captive
let agentsCaptured = false;

// This variable stores the location (nation) of any captured agents
let captureRegion;

// Store the location that spec-ops will be sent to raid
let nationChosenForRescueAttempt;

// Store how many army types have been defeated - if all 4, nation has lost war
let armiesDefeated = 0;

// Track where troops are deployed to
let deployedToRegion;

// Prepare to store the amount of researchers available to a player (dynamic)
let researchersAvailable;

// Globally-defined arrays

// Only have one shot at any deal with a nation
// Allowed to access options UNTIL any one negotiation fails - then menu won't open

const diplomacyAttempted = [];

// Track whether assistance from one country has already been provided

const assistanceProvided = [];

let previousNationStances = [];
let stanceHasChanged = false;

// track whether 'lowerApprovalOnAggresssion' has run once (as it should)

let hasRan = false;

/*
    1. Keep track of the number of daily conscripts so total can be relayed to commander (player)
    2. Array holding nations conquered by the player
    3. By region is to allow the player to see the actual country names rather than the codes
    4. Set array ready to receive all the generated nation objects
    5. Set array ready to receive all nation / country codes in the JQVMap object (182 total)
    6. The following array holds the name of any nations that have captured the player's agents
    7. Set array for tracking how many researchers have been assigned to projects (dynamic)
    8. Base maintenance totals for each structure for totals to be reduced (totalled)
*/

const dailyInfantryRecruits = [];
const territoriesConqueredByCode = [];
const territoriesConqueredByRegion = [];
const allNationsAsObjects = [];
const allNationsCodeArray = [];
const defeatedNationGDP = [];
const defeatedNationOil = [];
let nationsHoldingAgents = [];
let researchersAssigned = [];
let baseMaintenanceTotals = [];

// OBJECT LITERALS

// Main game object

const gameState = {
    gameStarted: false,
    time: runGameTime,
    unitsOnCampaign: false,
    targetNationSelected: false,
    conscriptionStarted: false,
    skipIntro: false,
    playerNuked: false
};

// Option / nation ability bools PREV: OPTIONS

const commands = {
    attack: false,
    deploy: false,
    recon: false,
    sabotage: false,
    incite: false,
    conscription: false,
    diplomacy: false,
    spying: false,
    launchNuclearMissile: false,
    fireParticleCannon: false,
    hacking: false,
    allianceReinforcement: false
};

const assigned = {
    asatMissile: "",
    cyreAssaultRifle: "",
    railguns: "",
    kineticArmour: "",
    particleCannon: "",
    missileDefenceShield: ""
};

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