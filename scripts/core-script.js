/*
*************************************************************************************************
    MAIN SCRIPT
*************************************************************************************************
 
     A huge effort was made by myself to improve my programming organisation and architecture, and one of the ways I attempted to do this for TOW was to modularise the code and render the main script a completely functional one - in essence, having little to no code that does not exist outside of callbacks.
     
     As such, the main script consists of just several functions that once invoked will handle the running of the entire game.
     
     FUNCTION DESCRIPTION (see functions.js for more detail):
     
     'intro' starts the game by overlaying title screen and playing audio.
     'setNationAttributes' iterates through nation class instances and determines nation stats.
     'setNationNames' assigns a name to each nation previously rendered undefined.
     'defineNationStance' determines the stance of each nation at the start of the game.
     'storeNationStance' logs the initial stance of a nation, used to detect changes later.
     'initMap' renders the JQVMap object with options with my own implemented functions embedded.
     'completeSetup' checks a nation is selected by the player and renders the final game features.
*/

$(() => {

    intro();

    setNationAttributes();
    
    setNationNames();

    defineNationStance();

    storeNationStance();

    initMap();
    
    completeSetup();
    
    // DAT
    //startGame();

});