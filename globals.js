// Globals

// Parsing as float allows the most accurate measurement of an average calendar month later on
let day = parseFloat(1);

// Define the newly created country (object) for use in the battle function 
let targetNation;

let agentsCaptured = false;

// Define an array to hold all the nations that are defeated by the player
const territoriesConqueredByCode = [];
// By region is to allow the player to see the actual country names rather than the codes
const territoriesConqueredByRegion = [];
// Set array ready to receive all the generated nation objects
const allNationsAsObjects = [];
// Set array ready to receive all nation / country codes in the JQVMap object (182 total)
const allNationsCodeArray = [];

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

