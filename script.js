// Globals

/* Keep track of the original value for player's oil production as we need to increment it by itself later on */
let dailyOilProduction = playerNation.resources.oilProduction;
let originalDailyOilProduction = dailyOilProduction;

// Ensure the yearly defence budget / GDP allocation remains unchanged for awarding each year
const yearlyDefenceBudget = playerNation.resources.defenceBudget;
const yearlyGDP = playerNation.gdp;

/*
    This function handles the darkening of the screen via an overlay with diminishing opacity. The overlay is displayed and a css class handles the animation / effect. Following this, the story text will scroll and the intro track will play.
*/

//intro();

// Show initial status
displayMainStatus();

displayNationNameOnStatus();


// These commands MUST have a desired map target

playerActions = (region, code) => {
    console.log("TN Name: " + targetNation.name);
    // Prevent commands being used on player's own nation
    if (playerNation.name === region) return;

    switch (true) {

        case commands.attack:
            playerNation.attackNation(region, code, targetNation);
            break;

        case commands.deploy:
            playerNation.deployForces(region, code);
            break;

        case commands.recon:
            playerNation.deployAgents(region, code);
            break;

        case commands.sabotage:
            playerNation.undertakeSabotage(region, code);
            break;

        case commands.incite:
            playerNation.inciteRebellion(region, code);
            break;

        case commands.diplomacy:
            playerNation.negotiation(region, code, targetNation);
            break;

        case commands.spying:
            playerNation.spySatellite(region, code);
            break;

        case commands.launchNuclearMissile:
            playerNation.nuclearStrike(region, code);
            break;

        case commands.fireParticleCannon:
            playerNation.particleCannonStrike(region, code);
            break;

        case commands.allianceReinforcement:
            playerNation.requestAllianceReinforcement(region, code);
            break;

        case commands.hacking:
            playerNation.hackFunds(region, code);
            break;

        default:
            console.log("No player actions selected.");
    }
    console.log("TN Name: " + targetNation.name);
}

const worldNationsObjectLength = Object.keys(worldNations).length;

for (let i = 0; i < worldNationsObjectLength; i++) {

    const allNations = new Nation(

        // Leave the country 'name' parameter as undefined - will be defined later
        this.name = "",
        // Define random nation GDP between $50 billion & $3 trillion
        RNG(3000000000000, 50000000000),
        // Define a random govt type
        randomGovt(),
        // Define a random population between 3 million and 1.5 billion people
        RNG(1500000000, 3000000),
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

// Store the initial nation stances and assign the nation it's actual name

for (let i = 0; i < allNationsAsObjects.length; i++) {
    for (let j = 0; j < worldNations.length; j++) {
        allNationsAsObjects[i].name = worldNations[i];
    }
}

// Set once on game start, then recalled daily to dynamically adapt nation behaviour

defineNationStance();

definePlayerStance();

storeNationStance();


$(() => {

    $('#vmap').vectorMap({
        backgroundColor: '#151515',
        borderColor: '#12CEFC',
        borderOpacity: 0.25,
        borderWidth: 0.6,
        color: '#000',
        // #01826d, #12cefc, #5b565e #9575ad - lilac
        hoverColor: '#9575AD',
        scaleColors: ['#B6D6FF', '#005ACE'],
        // Undefine 'selectedColor' to prevent interference with color change onclick
        selectedColor: '',

        // Tap into 'onLabelShow' to show nation info on tooltip hover
        onLabelShow: (event, label, code) => {

            for (let i = 0; i < allNationsAsObjects.length; i++) {
                if (allNationsAsObjects[i].name === label[0].innerHTML) {
                    targetNation = allNationsAsObjects[i];
                }
            }

            label[0].innerHTML = label[0].innerHTML +
                `<br> Stance: <span id="stance">${targetNation.status.stance}</span> <br> 
                GDP: ${targetNation.gdp} <br> 
                Resistance: ${targetNation.status.resistance}`;
        },

        onRegionClick: (element, code, region) => {

            gameState.targetNationSelected = true;

            nationSelect.play();
            showStatusOnPlayerNationSelect(region);


            // First 'if' prevents code running on the player's selected nation

            if (region !== playerNation.name) {

                // If name in object matches region, show it's data in a swal

                for (let i = 0; i < allNationsAsObjects.length; i++) {

                    if (allNationsAsObjects[i].name === region) {
                        targetNation = allNationsAsObjects[i];
                        console.log(targetNation.name)

                        // Data for nation is displayed only if nation has been infiltrated

                        playerNation.surveillance.infiltratedNations.forEach(nation => {

                            const noIntelAlert = swal(`No Intel on ${region}`, "Send agents or use satellites to spy.");

                            if (!playerNation.surveillance.infiltratedNations.length) {
                                noIntelAlert;
                            } else if (targetNation.name === nation) {
                                const stringifiedNationInfo = JSON.stringify(targetNation, null, 4);
                                swal(stringifiedNationInfo);
                            } else {
                                noIntelAlert;
                            }
                        });

                        // User-enabled options
                        playerActions(region, code);
                        console.log(targetNation.name)
                    }
                }
            }

            // MAY NOT BE NECESSARY
            // Prevent attack upon nations that are already conquered
            for (let i = 0; i < territoriesConqueredByCode.length; i++) {
                if (territoriesConqueredByCode[i] === code) return;
            }
            gameState.targetNationSelected = false;
        }
    });
});
