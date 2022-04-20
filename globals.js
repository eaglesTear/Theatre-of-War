// Globals

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

let stanceHasChanged = false;
let LAOAHasRan = false;
let LAOBHasRan = false;

/* Keep track of the original value for player's oil production as we need to increment it by itself later on */
let dailyOilProduction = playerNation.resources.oilProduction;
let originalDailyOilProduction = dailyOilProduction;

// Ensure the yearly defence budget / GDP allocation remains unchanged for awarding each year
const yearlyDefenceBudget = playerNation.resources.defenceBudget;
const yearlyGDP = playerNation.gdp;

// Globally-defined arrays

// Only have one shot at any deal with a nation
// Allowed to access options UNTIL any one negotiation fails - then menu won't open

const diplomacyAttempted = [];

// Track whether assistance from one country has already been provided

const assistanceProvided = [];

let previousNationStances = [];

/*
    1. Keep track of the number of daily conscripts so total can be relayed to commander (player)
    2. Array holding nations conquered by the player
    3. By region is to allow the player to see the actual country names rather than the codes
    4. Set array ready to receive all the generated nation objects
    6. The following array holds the name of any nations that have captured the player's agents
    7. Set array for tracking how many researchers have been assigned to projects (dynamic)
    8. Base maintenance totals for each structure for totals to be reduced (totalled)
*/

// 'territoriesConqueredByRegion' uses 'let' declaration as it will be subject to ES6 filter

const dailyInfantryRecruits = [];
const territoriesConqueredByCode = [];
let territoriesConqueredByRegion = [];
const allNationsAsObjects = [];
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