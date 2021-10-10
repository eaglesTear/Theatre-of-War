/* 
    
    Casualties:  (ATK - DEF) +/- 20% as it's done in World's End (an RPG strategy game). This will mean that attacks against an opponent with strong DEF could do no damage at all. For instace ATK = 10, ENEMY DEF = 12, (ATK - DEF) = -2 and it also means that high attack vs slightly lower def, could do little damage, potentially making battles longer. For instance with ATK = 1010, ENEMY DEF = 1005, the damage would be 5. The damage will also increase dramatically now if the ATK is increased by a small percentage. For instance ATK = 1055, will do 900% more damage with only a %5 increase in ATK value.
    To avoid this, you can do something like ATK / DEF * WEAPON_DAMAGE This will scale more gradually when ATK or DEF are increased and allow a weak attacker to damage a creature with strong DEF.

    graphics / fx / sfx / ui *************************************
    
    Modes / intro / video from OGA???
 animation for country select on text not map
    Purchases and tech trees on the sidebar
    battle overlay with country displayed and vs sign with images
 music & sfx stored as js objects
 start menu with options
 display nation flags on hover
 hud elements: military, resource and equipment count needs to be displayed to user
 sliding overlay when special atk used - eg carpet bombing
  countries under player control are listed in a separate section or sidebar
amount of territories captured displayed to user
scrolling text css - horizontal for game hints and tips, vertical for game intro story
fluctuating linear gradient backgrounds for night and day or over several minutes
 animate css classes for total WAR intro and ui effects
ending screen overlay or new page to display ending with scrolliing text
change btn color and disable when certain options or buildings are constructed - costs
when new units become available, show them via images to user
overlay slide in when event happens with images ie agent is captured
display how many units / types the player has in the hud or on overlay, and any caps: 12/15 etc
inventory / status screen overview - overlay
warnings to player 1 week before rent and expenditure due date
end of month or year report - funds, territories conquered etc
each time a user clicks a purchase, ie tank, a pic of it is added to their inventory % unit cap
basic ui status - nations beaten, successful sabotages and incites, armies, funds, oil etc
how many units of each type - ie warship pic with numbers next to them
disable btns or research options etc after use if needed
display options and disable or remove from dom and insert? eg, research teams and projects if no researchers hired
update ui after events such as defence budget increase / decrease - functions for these
links to the weapons in the game
Overlay on hover for the weapons and research projects - lot of work

store spied on country data in cards for player? append new card with jQ i DOM
 same for agents captured
 
 special weapon pics appear when researched or purchased
 
 can't click on nation if: defeated militarily, rebelled, nuked, or ally 
 
 print annual and monthly expenditures (salaries, weapon upkeep etc.)
 
 save nation intel into array, and allow user to select its name from dropdown. If name === object.name, show the data for that nation
 
 separate pages / menus for certain functions like research / gloabl overview or tactical screen
 
 nations who are hostile turn red, or have status hove text in red, green or white/yellow (latter for neutral) - status screen
 
 cool color change / fade animation and success swal when country allied / destroyed etc
 
 redo confirms / alerts with swal

    scripting / features **************************************
    
ESSENTIAL *************

victory conditions? player can choose how much of the world they wish to conquer out of 182 nations. Gvt approval 80 or more after 1 year 

functions to dynamically check changing nation status and aggression levels. Add to daily actions. Player can lose trade deals etc >>> Put inside 'informPlayerofChange' and run monthly
 
penalty for unsuccessful espionage? Killed? Pay ransom etc? Invade? If invaded successfully, agents are released, if not - dead. If agents are caught, hostility rating goes up - multiplier for ransom to pay. Agents being held stored in hostage class method. No sending agents if there are: the enemy will be on the lookout for you! select dropdown for agents captured, object method for agents held. Look at modifying function. Longer agent is held, more gvt approval decreases

random events change nation aggro levels and stance (eg a coup) include in random attack function

BONUS ***********

 special weapons such as airstrikes
 
 use es6 class import and export for classes and vars???
 
 turn based - basic ai needs hardcoding
 
 own xcom mod
 
 countries taken over can have bases built on - more bases have perks, faster unit travel etc
 
 certain nations have different units, costs or stats

 
 DEBUG / REFACTOR/ POLISH ***********
        
check anything to do with objects and addition / subtraction operators
check whether all player functions need both region and code in them
 refactor / cleanup: ensure all jquery is within document.ready function
 fix floating point numbers for battle / units after attack function
 function parameters for all button clicks? Switch?
 too much oil used by military daily - convert to monthly?
 how to keep clicking on same nation showing it's data properly?
 more snippets of code inserted into functions
 remember to complete usa object when done with definition and prototyping
 create a var / function for all confirms in the game: finish executive decision function
 ensure function names and variables cloasely match what they contain
 checkfunds function on everything that needs paying for
 unit caps - on all personnel and units, but especially researchers
 remember to disallow further clicks when alrady in process (esp research) function to return?
 if any jquery vals, parse them as integers if they are meant to be dealing with numbers
 research all needs completing - make sure to disable options / add 'researched' to new html
 upgrade should be down to engineers - just have new facilities? One for each upgrade rather than new staff?
check all numbers in objects etc and see if they need rounding
targetnation = null & colordefeatednations can go in same function if used in same way
mark all events that cause increase and decrease in approval rating etc
flesh out all functions to have desired effects and consequences
any other info for monthly report / status?

//    const arr = ["a", "b", "c"];
    //     
    //    informPlayerOfArrayValueChange = () => {
    //
    //        let savedOriginalArrayValues = [];
    //        
    //        for (let i = 0; i < arr.length; i++) {
    //
    //            // SAVE original array numbers in storage array for comparison
    //            savedOriginalArrayValues.push(arr[i]);
    //
    //            // Now, change the values of the array after saving originals separately
    //            arr[i] = "v";
    //
    //            // Loop through saved originals and the new, changed values of that array...
    //            // ...and if saved originals are not equal to the new values, show them!
    //
    //            // SWAL WILL ONLY RUN LAST ITERATION...VERY STRANGE. USE OTHER METHOD?
    //            if (savedOriginalArrayValues[i] !== arr[i]) {
    //                alert(`FROM: ${savedOriginalArrayValues[i]}\n TO: ${arr[i]}`);
    //            }
    //        }
    //        // Reset ready for next function run
    //        savedOriginalArrayValues = [];
    //    }
    //    informPlayerOfArrayValueChange();
*/
