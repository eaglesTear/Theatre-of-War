/*

*************************************************************************************************
    
    UI: BUTTONS. THEY - YOU KNOW, DO STUFF
 
    There are a plethora of buttons and commands in Theatre of War. Some access menus such as the status of a player's chosen nation; others allow interaction with the tactical map. As a rule, buttons in the 'commands' sidebar menu MUST have a map target following their clicking, with the sole exception of 'conscription' and 'rescue', which will automatically recruit a random number of troops to your military over the course of one month and allow you to attempt a rescue of any agents being held hostage, respectively.

*************************************************************************************************

*/


$(() => {

    // Play btn fx
    $("button").click(() => {
        menuSelect.play();
    });

    // Disallow tutorial and jump to nation selection immediately 
    $("#skip-intro-btn").click(() => {
        gameState.skipIntro = true;
    });

    // Button ui and bind events for fast-forwarding time and sending forces
    $("#fast-fwd-btn").click(fastForward);

    // Reset all previous commands clicked and allow latest button option to always be active

    $("#attack-btn, #deploy-btn, #intel-btn, #sabotage-btn, #incite-btn, #diplomacy-btn, #spying-btn, #nuclear-btn, #p-cannon-btn, #reinforcement-btn, #hack-btn").click(() => {
        clearPrevious();
    });

    // Player's chosen nation attacks another nation upon mouse click
    $("#attack-btn").click(() => {
        commands.attack = true;
    });

    $("#deploy-btn").click(() => {
        commands.deploy = true;
    });

    $("#intel-btn").click(() => {
        commands.recon = true;
    });

    $("#sabotage-btn").click(() => {
        commands.sabotage = true;
    });

    $("#incite-btn").click(() => {
        commands.incite = true;
    });

    // Conscription is a one-time call. The condition prevents 'true' ever happening again

    $("#conscription-btn").click(() => {
        if (!gameState.conscriptionStarted) {
            commands.conscription = true;
        }
    });

    $("#diplomacy-btn").click(() => {
        commands.diplomacy = true;
    });

    $("#spying-btn").click(() => {
        commands.spying = true;
    });

    $("#nuclear-btn").click(() => {
        commands.launchNuclearMissile = true;
    });

    $("#p-cannon-btn").click(() => {
        commands.fireParticleCannon = true;
    });

    $("#reinforcement-btn").click(() => {
        commands.allianceReinforcement = true;
    });

    $("#hack-btn").click(() => {
        commands.hacking = true;
    });

    // Rescue is a unique command - does NOT require selection of nation to activate
    // So, will not be found in commands object nor playeractions function etc

    $("#rescue-btn").click(launchHostageRescue);
    $("#ransom-btn").click(payRansom);
    $("#sell-oil").click(sellOil);
    $("#sell-weapons").click(sellWeapons);
    $("#make-small-arms").click(manufactureWeapons);
    $("#assign").click(beginResearch);

    // Game status overlay
    $("#status-overlay-btn").click(() => {
        $(".status-overlay").addClass("status-open");
    });
    $(".status-closebtn").click(() => {
        $(".status-overlay").removeClass("status-open");
    });

    // Activate sidebar UI with click or 's' keyboard keypress, by toggling a css class on or off

    // Button click sidebar toggle activation
    $("#sidebar-btn, .sidebar-close-btn").click(() => {
        $(".sidebar").toggleClass("open");
    });

    // Keypress sidebar toggle activation ('s' must be pressed on the keyboard; caps is OK!)
    // Deactivated during intro (or until game start function is ran, changing bool to true)

    $(document).on("keypress", (e) => {
        if (e.keyCode === 115 && gameState.gameStarted ||
            e.keyCode === 83 && gameState.gameStarted) {
            $(".sidebar").toggleClass("open");
            menuSelect.play();
        }
    });

    // Load nation select screen when skip intro or start game button is pressed
    $("#skip-intro-btn, #start-game-btn").click(() => {
        $(".bg-intro-img").remove();
        introTrack.pause();
        mainTitleTrack.pause();
        explosion.play();
        nationSelectTrack.play();
        renderNationSelectScreen();
    });

    $("#reload-btn").click(() => {
        ruAnthem.pause();
        usAnthemInstrumental.pause();
        reloadGame();
    });

    // UPGRADES & RESEARCH: All research requires research personnel, and amount affects speed

    // Four upgrades are instant, provided money is no object and researchers are present

    $("#upgrade-aircraft").click(() => {
        if (checkFunds(10000000)) return;
        if (!researchFacilityAvailability()) return;
        upgradeUnits(10000000, "aircraft", "airTech", 5);
        $("#upgrade-aircraft").text("Purchased").attr("disabled", "true");
    });

    $("#upgrade-navy").click(() => {
        if (checkFunds(20000000)) return;
        if (!researchFacilityAvailability()) return;
        upgradeUnits(20000000, "navy", "navalTech", 5);
        $("#upgrade-navy").text("Purchased").attr("disabled", "true");
    });

    $("#upgrade-infantry").click(() => {
        if (checkFunds(playerNation.militaryUnits.infantry * 2000)) return;
        if (!researchFacilityAvailability()) return;
        upgradeUnits(playerNation.militaryUnits.infantry * 2000, "infantry", "infantrySkill", 5);
        $("#upgrade-infantry").text("Purchased").attr("disabled", "true");
    });

    $("#upgrade-armour").click(() => {
        if (checkFunds(40000000)) return;
        if (!researchFacilityAvailability()) return;
        upgradeUnits(40000000, "tanks", "armourTech", 5);
        $("#upgrade-armour").text("Purchased").attr("disabled", "true");
    });
    
    $("#airbase").click(() => {
        if (playerBase.airbase) return;
        if (checkFunds(280000000)) return;
        constructionManager(playerBase.airbase, "airbase", day + 3, 280000000);
    });

    $("#intel-ops").click(() => {
        if (playerBase.intelOps) return;
        if (checkFunds(5470000000)) return;
        constructionManager(playerBase.intelOps, "intelOps", day + 2, 5470000000);
    });

    $("#barracks").click(() => {
        if (playerBase.barracks) return;
        if (checkFunds(2000000)) return;
        constructionManager(playerBase.barracks, "barracks", day + 2, 2000000);
    });

    $("#naval-yard").click(() => {
        if (playerBase.navalYard) return;
        if (checkFunds(2600000000)) return;
        constructionManager(playerBase.navalYard, "navalYard", day + 2, 2600000000);
    });

    $("#war-factory").click(() => {
        if (playerBase.warFactory) return;
        if (checkFunds(11300000000)) return;
        constructionManager(playerBase.warFactory, "warFactory", day + 2, 11300000000);
    });

    $("#launch-pad").click(() => {
        if (playerBase.launchPad) return;
        if (checkFunds(444000000)) return;
        constructionManager(playerBase.launchPad, "launchPad", day + 2, 444000000);
    });

    $("#research-centre").click(() => {
        if (playerBase.researchCentre) return;
        if (checkFunds(48859900)) return;
        constructionManager(playerBase.researchCentre, "researchCentre", day + 2, 48859900);
    });

    $("#missile-silo").click(() => {
        if (playerBase.missileSilo) return;
        if (checkFunds(120000000)) return;
        constructionManager(playerBase.missileSilo, "missileSilo", day + 2, 120000000);
    });


/*

*************************************************************************************************
    
    UNIT TRAINING INTERFACE: WHEN RELEVANT FACILITIES ARE CONSTRUCTED
     
  
*************************************************************************************************

*/
    

    $("#train-agents").click(() => {
        if (!playerHasBuilding("intelOps", "Intel Ops")) return;
        processUnitTraining(parseInt($("#field-agents").val()), 100000, playerNation.surveillance, "fieldAgents");
    });

    $("#purchase-infantry").click(() => {
        if (!playerHasBuilding("barracks", "Barracks")) return;
        processUnitTraining(parseInt($("#infantry").val()), 80000, playerNation.militaryUnits, "infantry");
    });

    $("#purchase-aircraft").click(() => {
        if (!playerHasBuilding("airbase", "Airbase")) return;
        processUnitTraining(parseInt($("#aircraft").val()), 64000000, playerNation.militaryUnits, "air");
    });

    $("#purchase-warships").click(() => {
        if (!playerHasBuilding("navalYard", "Naval Yard")) return;
        processUnitTraining(parseInt($("#warships").val()), 100000000, playerNation.militaryUnits, "naval");
    });

    $("#purchase-tanks").click(() => {
        if (!playerHasBuilding("warFactory", "War Factory")) return;
        processUnitTraining(parseInt($("#tanks").val()), 5000000, playerNation.militaryUnits, "tanks");
    });

    $("#launch-satellite").click(() => {
        if (!playerHasBuilding("launchPad", "Launch Pad")) return;
        processUnitTraining(parseInt($("#satellites").val()), 470000000, playerNation.surveillance, "satellites");
    });

    $("#hire-researchers").click(() => {
        if (!playerHasBuilding("researchCentre", "Research Centre")) return;
        processUnitTraining(parseInt($("#researchers").val()), 52000, playerNation, "researchers");
    });

    $("#build-nukes").click(() => {
        if (!playerHasBuilding("missileSilo", "Missile Silo")) return;
        processUnitTraining(parseInt($("#warheads").val()), 28000000, playerNation.specialWeapons, "nuclearWeapons");
    });

    $("#build-shield").click(() => {
        if (!playerHasBuilding("missileSilo", "Missile Silo")) return;
        processUnitTraining(parseInt($("#shield").val()), 38000000, playerNation.specialWeapons, "missileShield");
    });
        
});