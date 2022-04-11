// Globals

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
let nationsHoldingAgents = [];
let researchersAssigned = [];
let baseMaintenanceTotals = [];