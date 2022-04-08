/*
    jQuery is essential to run the game. I decided to inform the user of this because occasionally jQuery can fail to load even with the correct scripts available. I inform them that they should try again to prevent them from thinking the game is broken and giving up. 
    
    SweetAlert.js should not be used here: in the event that the client's internet is not connected, that won't run and so neither will the sweet alert and therefore the function.
*/

window.onload = () => {
    if (!window.jQuery) {
        alert("jQuery Not Loaded \n\njQuery is essential for this app to run. Please refresh the page as it is likely that the server was down or internet was unavailable.");
    }
}

/* 
    Clear previous commands so that latest button clicked can run. Difference between use when clicking the button is that the game will not ask the user if it wants to run the function again, unless the corresponding button is again clicked.
    The 'conscription' command must be exempt - otherwise, clicking on an alternate command button whilst conscription is active will cancel the conscription function - which relies on the its command method being truthy in order to run.
*/

clearPrevious = () => {
    for (const command in commands) {
        if (command === "conscription") {
            continue;
        }
        commands[command] = false;
    }
}

// Introduction function starts the game when called by overlaying title screen and playing audio 

intro = () => {
    $(".title-overlay").addClass("displayBlock");
    introTrack.play();
}

// Function Probability - return a random number between a specified input range

probability = (n => Math.random() < n);

// Function that more easily deals with the adding of totals in the game

reduce = (array => array.reduce((total, currentValue) => total + currentValue, 0));

// Main time functionality - disabled if no jQuery, preventing repeated errors to console.

passageOfTime = () => {

    if (!window.jQuery) return;

    let monthlyInterval = day + 30.41;
    let yearlyInterval = day + 365;
    let currentYear = 2022;

    setInterval(() => {

        let week = Math.ceil(day / 7);
        let month = Math.ceil(week / 4);

        $("#day").text("DAY: " + parseInt(day++));
        $("#week").text("WEEK: " + week);
        $("#month").text("MONTH: " + month);

        if (day >= monthlyInterval) {
            //            monthlyActions();
            monthlyInterval = day + 30.41;
        }

        //        if (day >= monthlyInterval - 7 && day <= monthlyInterval - 7) {
        //            alertMonthlyExpenditure();
        //        }

        if (day >= yearlyInterval) {
            currentYear++;
            $("#year").text("YEAR: " + currentYear);
            //yearlyActions();
            yearlyInterval = day + 365;
        }

        checkIfConscription(monthlyInterval);
        //dailyActions();

    }, 2000);
}

checkIfConscription = (monthlyInterval) => {
    if (commands.conscription) conscriptTroops(monthlyInterval);
}

// Skip forward in time via ui click (1 day per click)
fastForward = (monthlyInterval) => {

    $("#day").text("DAY: " + parseInt(day++));
    $("#week").text("WEEK: " + Math.ceil(day / 7));

    checkIfConscription(monthlyInterval);
}

// ************************************************************************************
// ************************************************************************************
// ABILITY FUNCTIONS OF THE PLAYER'S CHOSEN NATION


// ************************************************************************************
// ************************************************************************************
// BATTLE FUNCTIONS & OBJECTS


/* 
    Military battles are uniquely calculated to account for drastic differences in a nation's military force. The formulas below scale well, returning reasonable results whether a country has an army in the millions or the dozens.
    
    Instead of a 'tech' rating, infantry possess a 'skill' attribute that helps them to sway the course of a battle. The formula ensures that both infantry skill and numbers contribute to the course of a battle, and all being equal, a difference in any of these factors will play a deciding factor in the outcome. If numbers are even, the skill of a nation's infantry will be decisive, and vice versa. If all factors are equal, control flow can decide a course of action for the player.
    
    Player infantry strength: (players infantry skill / 100) * player infantry numbers
    Enemy infantry strength: (enemy infantry skill / 100) * enemy infantry numbers
    
    After calculating the player infantry strength and the enemy infantry strength using the above, they are subtracted from each other for each opposing nation to determine remaining infantry numbers on both sides - and therefore the course of the battle:
    
    Troops remaing for player: player infantry strength - enemy infantry strength
    Troops remaining for the enemy: enemy infantry strength - player infantry strength
*/


/* 
    Attacking a region is undertaken via this function. Region is defined as a parameter because 'region' does not yet exist until user clicks on the map object. It also notifies the player as to what territory they are attacking. 
*/

attackNation = (region, code) => {

    clearPrevious();

    swal(`Attack ${region}?`, {
        buttons: ["Cancel", "Confirm"]
    }).then((value) => {
        if (value && deployedToRegion === region) {
            swal(`Commencing Attack: ${playerNation.name} is attacking the nation of ${region}`);
            trackDefeatedNations(region, code);
            colourDefeatedNations(code, "#AA0000");
        } else if (!value) {
            swal("Attack Aborted");
        } else {
            swal("Military Undeployed", `Units not positioned in ${region}. Please deploy forces.`);
        }
    });
}

// Initiate unit battles

nationsAtWar = () => {

    war.play();

    battle((playerNation.unitTechAndSkillRating.infantrySkill / 100) * playerNation.militaryUnits.infantry, (targetNation.unitTechAndSkillRating.infantrySkill / 100) * targetNation.militaryUnits.infantry, "infantry", "infantry");

    battle((playerNation.unitTechAndSkillRating.airTech / 100) * playerNation.militaryUnits.air, (targetNation.unitTechAndSkillRating.airTech / 100) * targetNation.militaryUnits.air, "air", "air");

    battle((playerNation.unitTechAndSkillRating.navalTech / 100) * playerNation.militaryUnits.naval, (targetNation.unitTechAndSkillRating.navalTech / 100) * targetNation.militaryUnits.naval, "naval", "naval");

    battle((playerNation.unitTechAndSkillRating.armourTech / 100) * playerNation.militaryUnits.tanks, (targetNation.unitTechAndSkillRating.armourTech / 100) * targetNation.militaryUnits.tanks, "tanks", "tanks");
}

// Function dealing with combat between nation's armed forces - air, naval, armour and infantry

battle = (playerStrength, enemyStrength, playerUnits, enemyUnits) => {

    playerUnitsRemaining = playerStrength - enemyStrength;
    enemyUnitsRemaining = enemyStrength - playerStrength;

    playerNation.militaryUnits[playerUnits] = Math.trunc(playerUnitsRemaining);
    targetNation.militaryUnits[enemyUnits] = Math.trunc(enemyUnitsRemaining);

    if (targetNation.militaryUnits[enemyUnits] <= 0) armiesDefeated++;
}

// Nations defeated (either militarily or by turning inward via rebellion or civil war) turn red

colourDefeatedNations = (code, colour) => {

    // Defeated nation is rendered in the colour of the successfully invading nation
    for (let i = 0; i < territoriesConqueredByCode.length; i++) {
        if (code === territoriesConqueredByCode[i]) {
            $("#vmap").vectorMap("set", "colors", {
                    [code]: colour
            });
        }
    }
}
