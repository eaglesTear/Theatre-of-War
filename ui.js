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


    // ************************************************************************************
    // ************************************************************************************
    // UPGRADES & RESEARCH: All research requires research personnel, and amount affects speed

    // Four upgrades are instant, provided money is no object and researchers are present

    $("#upgrade-aircraft").click(() => {
        if (checkFunds(10000000)) return;
        if (!checkResearchFacilityAvailable()) return;
        upgrade(10000000, "aircraft", "airTech", 5);
        $("#upgrade-aircraft").text("Purchased").attr("disabled", "true");
    });

    $("#upgrade-navy").click(() => {
        if (checkFunds(20000000)) return;
        if (!checkResearchFacilityAvailable()) return;
        upgrade(20000000, "navy", "navalTech", 5);
        $("#upgrade-navy").text("Purchased").attr("disabled", "true");
    });

    $("#upgrade-infantry").click(() => {
        if (checkFunds(playerNation.militaryUnits.infantry * 2000)) return;
        if (!checkResearchFacilityAvailable()) return;
        upgrade(playerNation.militaryUnits.infantry * 2000, "infantry", "infantrySkill", 5);
        $("#upgrade-infantry").text("Purchased").attr("disabled", "true");
    });

    $("#upgrade-armour").click(() => {
        if (checkFunds(40000000)) return;
        if (!checkResearchFacilityAvailable()) return;
        upgrade(40000000, "tanks", "armourTech", 5);
        $("#upgrade-armour").text("Purchased").attr("disabled", "true");
    });
    
});