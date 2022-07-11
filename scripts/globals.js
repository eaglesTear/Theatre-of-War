/*
*************************************************************************************************
    GLOBALS
*************************************************************************************************
*/ 

// Player's selection will decide the value of this variable - undefine when ready to deploy

let playerNation;

// Becomes whichever nation object is interacted with (clicked on)

let targetNation;

// Track the original value for player's oil production to increment it by itself later on

let dailyOilProduction;
let originalDailyOilProduction;

// Ensure the yearly defence budget / GDP allocation remains unchanged for awarding each year

let yearlyDefenceBudget;
let yearlyGDP;

// Parsing float allows the most accurate measurement of an average calendar month (later)

let day = parseFloat(1);

// Checks whether any agents of the player are being held captive

let agentCaptured = false;

// Stores the location (nation) of any captured agents

let captureRegion;

// Store the location that spec-ops will be sent to raid

let rescueAttemptNation;

// Store how many army types have been defeated - if all 4, nation has lost war

let armiesDefeated = 0;

// Track where troops are deployed to

let deployedToRegion;

// Prepare to store the amount of researchers available to a player (dynamic)

let researchersAvailable;

// 'lowerApprovalAggression' & 'lowerApprovalBankruptcy' should only run once. Bool tracks this

let LAAInvoked = false;
let LABInvoked = false;

// Stores any diplomatic approaches by the player to the CPU (can only negotiate once)

const diplomacyAttempted = [];

// Track whether assistance from one country has already been provided

const assistanceProvided = [];

// Store which nation has already randomly attacked the player (as not to use again)

const previousAttackers = [];

// Store all 182 nation stances to later monitor their changes (refreshed upon actual change)

let previousNationStances = [];

// Track whether ANY nation's stance has altered

let stanceHasChanged = false;

/*
*************************************************************************************************
    ARRAY STRUCTURES
*************************************************************************************************

    1. Keep track of the number of daily conscripts so total can be relayed to commander (player).
    2. Array holding nations conquered by the player.
    3. By region is to allow the player to see the actual country names rather than the codes.
    'nationsConqueredRegion' uses the 'let' declaration as it will be subject to ES6 filter.
    4. Set array ready to receive all the generated nation objects.
    6. Holds the name of any nations that have captured the player's agents.
    7. Set array for tracking how many researchers have been assigned to projects (dynamic).
    8. Base maintenance totals for each structure for totals to be reduced (totalled).
    9. Holds a percentage of a conquered nation's finances.
    10. Holds a percentage of a conquered nation's oil.
    11. Tracks which countries have been incited to turn on themselves.
*/

const infantryRecruits = [];
const nationsConqueredCode = [];
let nationsConqueredRegion = [];
const nations = [];
let nationsHoldingAgents = [];
let researchersAssigned = [];
let baseMaintenanceTotals = [];
const defeatedNationGDP = [];
const defeatedNationOil = [];
const rebellionAttempted = [];

/*
*************************************************************************************************
    OBJECT LITERALS
*************************************************************************************************

    1. Main game object tracking the states / events of the game. Holds the game time function.
    2. Option / nation ability bools, determines what function to apply to a nation.
    3. Research projects: values will be set to amount of researchers assigned to them.
    4. Contains the costs to be deducted monthly for structure upkeep (if built).
*/

const gameState = {
    gameStarted: false,
    time: runGameTime,
    unitsOnCampaign: false,
    targetNationSelected: false,
    conscriptionStarted: false,
    skipIntro: false,
    playerNuked: false
};

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
    missileSilo: 500000
};