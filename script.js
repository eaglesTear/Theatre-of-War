$(() => {

    // Introduction function starts the game when called by overlaying title screen and playing audio

    //intro();

    // Show initial statuses

    displayMainStatus();

    displayNationNameOnStatus();
    
    setNationAttributes();

    // Store the initial nation stances and assign the nation it's actual name

    assignNationNames();

    // Set once on game start, then recalled daily to dynamically adapt nation behaviour

    defineNationStance();

    definePlayerStance();

    storeNationStance();

    initMap();
    
    displayDOMResearcherInfo();
    
    // DELETE WHEN TESTING IS OVER
    startGame();

});
