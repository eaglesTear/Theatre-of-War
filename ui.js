$(document).ready(() => {

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

    displayDOMResearcherInfo = () => {
        // Set the max value of researchers available in html as player's total researcher number
        $("#researcher-allocation").attr("max", playerNation.researchers);
        $("#researchers-employed").text(" " + playerNation.researchers);
        $("#researchers-available").text(" " + playerNation.researchers);
    }
    displayDOMResearcherInfo();


    $("#submit").click(() => {

        const researcherAllocation = parseInt($("#researcher-allocation").val());

        // Time factor to be in increments of 1000s, ie 6000 for 60 days if 100 researchers
        let researchProject = $("#research-options").val();

        if (!checkResearchCapacity(researcherAllocation) ||
            preventNullValues(researchProject) ||
            checkResearchersAvailable(researcherAllocation, researchersAvailable)) {
            return;
        }

        let costOfResearch, timeFactor;

        //if (checkResearchersAvailable(researcherAllocation, researchersAvailable)) return; delete once testing complete

        //researchersAssigned.push(researcherAllocation); delete once testing complete
        //getResearchersAvailable(); delete once testing complete

        if (researchProject === "hypersonicMissiles") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(50, 400);
        } else if (researchProject === "cyreAssaultRifle") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(1000, 400);
        } else if (researchProject === "railguns") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(2000, 800);
        } else if (researchProject === "kineticArmour") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(2000, 400);
        } else if (researchProject === "particleCannon") {
            [costOfResearch, timeFactor] = setResearchAndCostFactor(2000, 10000);
        }

        // Divide timefactor by researchers, then add day - otherwise get strange results
        let timeToCompleteProject = Math.trunc(day + (timeFactor / researcherAllocation));

        researchProjectStart(researcherAllocation, researchProject, costOfResearch, timeToCompleteProject);
    });


/* 
    Country selection animations with a conditional statement to check whether the player's selected country has been chosen. If the var 'playerSelectedNation' is defined, then the nation has already been selected; thus the player will no longer be able to select another nation and the rest of the code is not executed. 
*/

    // UI

    renderNationSelectScreen = () => {
        $("html, body").toggleClass("lock-display");
        $("#skip-intro-btn, #story-scroll-text, .main-titles").remove();
        $(".title-overlay").removeClass("displayBlock");
        renderNationSelectImages();
        $(".title-screen").append("<h1 class='nation-select-title wargate'>Select Your Nation</h1>");
    }

    renderNationSelectImages = () => {

        $(".title-overlay").addClass("displayBlock");
        $(".title-screen").append("<div id='nation-select'>");

        $("#nation-select")
            .append("<img id='usa' class='nation-img-usa' src='images/usa.png'/>")
            .append("<img id='russia' class='nation-img-russia' src='images/russia.png'/>");
    }
    
    // Clear overlay for subsequent content such as game over screen etc
    
    removeNationSelectElements = () => {
        $("#nation-select, .nation-select-title").remove();
    }

    skipTutorialStartGame = () => {
        if (gameState.skipIntro) {
            startGame();
        }
    }

    // Option to select the United States
    $(document).on("click", "img#usa", () => {

        preventImageClickAfterNationSelect();

        swal("United States of America", "Choose to play as this nation?", {
                buttons: {
                    cancel: "No",
                    confirm: {
                        value: "confirm",
                    },
                },
            })
            .then((value) => {
                if (value) {
                    nationSelectTrack.pause();
                    usaSelected();
                    skipTutorialStartGame();
                    highlightSelectedNation();
                }
            });
    });

    // Option to select the Russian Federation
    $(document).on("click", "img#russia", () => {

        preventImageClickAfterNationSelect();

        swal("The Russian Federation", "Choose to play as this nation?", {
                buttons: {
                    cancel: "No",
                    confirm: {
                        value: "confirm",
                    },
                },
            })
            .then((value) => {
                if (value) {
                    nationSelectTrack.pause();
                    russiaSelected();
                    skipTutorialStartGame();
                    highlightSelectedNation();
                }
            });
    });

    highlightSelectedNation = () => {

        if (playerNation === Russia) {
            $("#vmap").vectorMap("set", "colors", {
                ru: "#6B0000"
            });
        } else {
            $("#vmap").vectorMap("set", "colors", {
                us: "#1E90FF"
            });
        }
    }

    addRadarWithAlert = () => {
        $(".radar").addClass("slow-reveal");
        systemsOnline.play();
    }

    // timed with css transitions and animations
    usaSelected = () => {

        playerNation = USA;
        $("#us").addClass("country-select-animation");
        $("img#russia").addClass("img-fade-out");

        setTimeout(() => {
            $("img#russia").remove();
            $("img#russia").addClass("marginAuto");
            $(".nation-select-title").text(playerNation.name);
            removeTitleOverlay();
        }, 3000);
        displayNationLogo();
        if (!gameState.skipIntro) scrollToMap();
        addRadarWithAlert();
        displayNationNameOnStatus();
    }

    russiaSelected = () => {

        playerNation = Russia;
        $("#ru").addClass("country-select-animation");
        $("img#usa").addClass("img-fade-out");

        setTimeout(() => {
            $("img#usa").remove();
            $("img#usa").addClass("marginAuto");
            $(".nation-select-title").text(playerNation.name);
            removeTitleOverlay();
        }, 3000);
        displayNationLogo();
        if (!gameState.skipIntro) scrollToMap();
        addRadarWithAlert();
        displayNationNameOnStatus();
    }

    displayNationLogo = () => {

        if (playerNation === USA) {
            $("#logo-section").append("<img class='logo-usa' src='images/usa-logo.png'/>");
        } else {
            $("#logo-section").append("<img class='logo-russia' src='images/russia-logo.png'/>");
        }
    }

    preventImageClickAfterNationSelect = () => {
        if (playerNation !== undefined) return;
    }

    //Once all title and nation select stages have concluded, clear title overlay from DOM
    removeTitleOverlay = () => {
        setTimeout(() => {
            $(".title-overlay").removeClass("displayBlock");
        }, 3000);
    }

    // BELOW MAY NOT BE NECESSARY...
    // Remove story text block on overlay once animation has finished, allowing titles to show
    $("#story-scroll-text").on("animationend", () => {
        $("#story-scroll-text").remove();
        introTrack.pause();
        mainTitleTrack.play();
    });

    scrollToMap = () => {

        tutorialTrack.play();

        setTimeout(() => {
            $("html, body").animate({
                scrollTop: $(".scroll-target-map").offset().top
            }, 3000);
            setTimeout(() => {
                mapTutorial();
                scrollToPanel();
                // Re-enable scrolling after last animation & intro has ended
                $("html, body").toggleClass("lock-display");
            }, 3200);
        }, 4000);
    }

    scrollToPanel = () => {

        setTimeout(() => {
            $("html, body").animate({
                scrollTop: $("#scroll-target-cpanel").offset().top
            }, 3000);
            setTimeout(() => {
                controlPanelTutorial();
            }, 4000);
        }, 4000);
    }

    mapTutorial = () => {

        $(".options-container").addClass("displayBlock");
        swal("Welcome to the Theatre of War \n\nTactical Map", "This is your Theatre of War");
    }

    controlPanelTutorial = () => {

        swal("Control Panel", "Access facility construction, upgrades and manufacturing processes.");

        setTimeout(() => {
            statusOverlayTutorial();
        }, 5000);
    }

    statusOverlayTutorial = () => {

        $(".status-overlay").addClass("status-open");

        setTimeout(() => {
            swal("Status Screen", "Use the Status Screen button to view your nation's overall health. \n\n The Fast Forward button found at the top of the screen will jump forward a whole day each time it is pressed, allowing buildings and other events to finish quicker.");
            setTimeout(() => {
                buildQueueAndFFwdTutorial();
            }, 6000);
        }, 1000);
    }

    buildQueueAndFFwdTutorial = () => {

        $(".status-overlay").removeClass("status-open");

        setTimeout(() => {
            $(".sidebar").toggleClass("open");
            setTimeout(() => {
                swal("Command Menu", "This is where you will make decisions that will change the world. Forever. Use this 'commands' button (or the S key) to give orders. Click on the button, and then click on an area of the world map to execute them.");
                setTimeout(() => {
                    endTutorialAndStartGame();
                }, 10000);
            }, 1200);
        }, 1000);
    }

    endTutorialAndStartGame = () => {
        $(".sidebar").toggleClass("open");
        swal("Good Luck, Commander", "The world and it's events are now in motion.");
        tutorialTrack.pause();
        startGame();
    }

    // Ticks to monitor game state

    gameTickFunctions = () => {

        setInterval(() => {
            displayMainStatus();
            defineNationStance();
            checkForGameWin();
        }, 2000);
    }

    gameTickFunctions();

    // Reactivate sidebar and control panel buttons, start clock & in-game music
    startGame = () => {
        gameState.gameStarted = true;
        playinGameTracks(currentTrack);
        gameState.time;
        
        setTimeout(() => {
            removeNationSelectElements();
            $(".options-container").addClass("displayBlock");
        }, 8000);
    }

    // Load nation select screen when skip intro or start game button is pressed
    $("#skip-intro-btn, #start-game-btn").click(() => {
        $(".bg-intro-img").remove();
        introTrack.pause();
        mainTitleTrack.pause();
        explosion.play();
        nationSelectTrack.play();
        renderNationSelectScreen();
    });

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

    //    && gameState.gameStarted
    //&& gameState.gameStarted
    $(document).on("keypress", (e) => {
        if (e.keyCode === 115 ||
            e.keyCode === 83) {
            $(".sidebar").toggleClass("open");
            menuSelect.play();
        }
    });

    // Ending titles

    // Prepare end titles

    setEndTitles = () => {

        gameover();

        // main titles: remove after testing
        $("#story-scroll-text, #skip-intro-btn, .main-titles, .game-hud").remove(); 
        $("html, body").toggleClass("lock-display");
        $(".title-overlay").addClass("displayBlock");
        $(".options-container").removeClass("displayBlock");

        runEndTitles();
    }

    // Determine which nation's end titles should be inserted back into DOM and enacted
    runEndTitles = () => {

        missionCompleted.play();
        $(".title-overlay-text").addClass("new-top-setting");

        if (playerNation.name === "Russian Federation") {
            $(".end-titles-russia").addClass("displayBlock");
            playEndTheme(ruAnthem);
            insertVictoryImage();
        } else {
            $(".end-titles-usa").addClass("displayBlock");
            playEndTheme(usAnthemInstrumental);
            insertVictoryImage();
        }
    }

    playEndTheme = (endTheme) => {
        setTimeout(() => {
            endTheme.play();
        }, 4000);
    }

    $("#reload-btn").click(() => {
        ruAnthem.pause();
        usAnthemInstrumental.pause();
        reloadGame();
    });
    
    revealVictoryScreenElements = () => {
        $(".victory-heading, .authour-credit, #reload-btn, .victory-img").addClass("reveal");
        $(".end-text-1, .end-text-2, .end-text-3").addClass("reveal-flame");
    }

    insertVictoryImage = () => {

        // Display the victory img section first
        $(".victory-img-section").addClass("displayBlock");

        $(".end-titles-usa, .end-titles-russia").on("animationend", () => {

            if (playerNation.name === "Russian Federation") {
                $(".end-titles-russia").remove();
                $(".victory-img-section").append("<img class='victory-img' src='images/russia-victory.png'/>");
                revealVictoryScreenElements();
            } else {
                $(".end-titles-usa").remove();
                $(".victory-img-section").append("<img class='victory-img' src='images/usa-victory.png'/>");
                revealVictoryScreenElements();
            }
        });
    }

});
