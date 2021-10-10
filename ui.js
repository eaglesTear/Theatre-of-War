$(document).ready(() => {

    // Button ui and bind events for fast-forwarding time and sending forces
    $("#fast-fwd-btn").click(fastForward);

    // Player's chosen nation attacks another nation upon mouse click
    $("#attack-btn").click(() => {
        options.attack = true;
    });

    $("#deploy-btn").click(() => {
        options.deploy = true;
    });

    $("#intel-btn").click(() => {
        options.recon = true;
    });

    $("#sabotage-btn").click(() => {
        options.sabotage = true;
    });

    $("#incite-btn").click(() => {
        options.incite = true;
    });

    $("#conscription-btn").click(() => {
        options.conscription = true;
    });

    $("#diplomacy-btn").click(() => {
        options.diplomacy = true;
    });

    $("#spying-btn").click(() => {
        options.spying = true;
    });
    
    $("#nuclear-btn").click(() => {
        options.launchNuclearMissile = true;
    });
    
    $("#p-cannon-btn").click(() => {
        options.fireParticleCannon = true;
    });
    
    $("#reinforcement-btn").click(() => {
        options.allianceReinforcement = true;
    });
    
    $("#hack-btn").click(() => {
        options.hacking = true;
    });
    
    $("#rescue").click(launchHostageRescue);

    $("#sell-oil").click(sellOil);
    $("#sell-weapons").click(sellWeapons);
    $("#make-small-arms").click(manufactureWeapons);
    
    $("#assign-GDP-btn").click(assignPercentageOfGDPToDefenceBudget);


    // ************************************************************************************
    // ************************************************************************************
    // UPGRADES & RESEARCH: All research requires research personnel, and amount affects speed


    $("#upgrade-aircraft").click(() => {
        upgrade(100000, "aircraft", "airTech", 5);
    });
    $("#upgrade-navy").click(() => {
        upgrade(2000000, "navy", "navalTech", 5);
    });
    $("#upgrade-infantry").click(() => {
        upgrade(playerNation.militaryUnits.infantry * 2000, "infantry", "infantrySkill", 5);
    });
    $("#upgrade-armour").click(() => {
        upgrade(2000000, "tanks", "armourTech", 5);
    });
    
    displayDOMResearcherInfo = () => {
        // Set the max value of researchers available in html as player's total researcher number
        $("#researcher-allocation").attr("max", playerNation.researchers);
        $("#researchers-employed").text(" " + playerNation.researchers);
        $("#researchers-available").text(" " + playerNation.researchers);
    }
    displayDOMResearcherInfo();

    //playerNation.researchers = 100;
    $("#submit").click(() => {

        const researcherAllocation = parseInt($("#researcher-allocation").val());
        
        if (!checkResearchCapacity(researcherAllocation)) return;
        // Time factor to be in increments of 1000s, ie 6000 for 60 days if 100 researchers
        let researchProject = $("#research-options").val();
        let costOfResearch, timeFactor;

        if (checkResearchersAvailable(researcherAllocation, researchersAvailable)) return;

        researchersAssigned.push(researcherAllocation);
        getResearchersAvailable();

        if (researchProject === "asatMissile") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(50, 400);
        } else if (researchProject === "cyreAssaultRifle") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(1000, 400);
        } else if (researchProject === "railguns") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(2000, 400);
        } else if (researchProject === "kineticArmour") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(2000, 400);
        } else if (researchProject === "particleCannon") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(2000, 400);
        } else if (researchProject === "missileDefenceShield") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(100000, 500);
        } 
        // Divide timefactor by researchers, then add day - otherwise get strange results
        let timeToCompleteProject = Math.trunc(day + (timeFactor / playerNation.researchers));

        researchProjectStart(researcherAllocation, researchProject, costOfResearch, timeToCompleteProject);
    });
    
    // Once nation is selected, reveal the world map
    expand = () => {
        $("#vmap").slideDown(1500);
    }

    /* Country selection animations with a conditional statement to check whether the player's selected country has been chosen. If the var 'playerSelectedNation' is defined, then the nation has already been selected; thus the player will no longer be able to select another nation and the rest of the code is not executed. */

    $("#ru").click(() => {
        if (playerNation != undefined) return;
        const confirmNationSelect = confirm("Choose Russia?");

        if (confirmNationSelect) {
            playerNation = Russia;
            //expand();
            $("#ru").addClass("test-country-animation");
            console.log(playerNation);
        }
    });

    $("#us").click(() => {
        if (playerNation != undefined) return;
        playerNation = USA;
        console.log(playerNation);
    });

    // UI

    // Starting map colours for the playable nations
    $('#vmap').vectorMap('set', 'colors', {
        us: 'dodgerblue',
        ru: '#aa0000'
    });

    // Game overlay
    $("#overlay-btn").click(() => {
        $(".overlay").css("display", "block");
    });
    $(".overlay").click(() => {
        $(".overlay").css("display", "none");
    });

    // Playable nation mouseover and mouseleave events
    $("#ru").mouseover(() => {
        ui_mouseover_mouseout("#ru", "#000", ["ru"]);
    });
    $("#ru").mouseleave(() => {
        ui_mouseover_mouseout("#ru", "#aa0000", ["ru"]);
    });

    $("#us").mouseover(() => {
        ui_mouseover_mouseout("#us", "#000", ["us"]);
    });
    $("#us").mouseleave(() => {
        ui_mouseover_mouseout("#us", "dodgerblue", ["us"]);
    });

    // Activate sidebar UI with click or 's' keyboard keypress, by toggling a css class on or off

    // Button click sidebar toggle activation
    $("#sidebar-btn, .sidebar-close-btn").click(() => {
        $(".sidebar").toggleClass("sidebar-toggle");
    });

    // WARNING! REMEMBER TO ADDRESS THE CAPITAL S! MUST ALSO BE INCLUDED IN THE CODE - code 83
    // Keypress sidebar toggle activation ('s' must be pressed on the keyboard)
    $(document).bind("keypress", (e) => {
        if (e.keyCode === 115) {
            $(".sidebar").toggleClass("sidebar-toggle");
        }
    });

    // Animate message here with colour also
    //    $("#start-game-btn").click(() => {
    //        $(".country-select-message").text("Select your nation");
    //        $("html, body").animate({
    //            scrollTop: $("#scroll-target-1").offset().top
    //        }, 3000);
    //    })

});