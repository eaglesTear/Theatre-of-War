$(() => {

    // Introduction function starts the game when called by overlaying title screen and playing audio

    //intro();

    setNationAttributes();

    // Store the initial nation stances and assign the nation it's actual name

    setNationNames();

    // Set once on game start, then recalled daily to dynamically adapt nation behaviour

    defineNationStance();

    storeNationStance();

    initMap();
    
    completeSetup();
    
    // DAT
    startGame();

});