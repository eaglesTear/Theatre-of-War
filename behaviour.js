/* 
    
    Casualties:  (ATK - DEF) +/- 20% as it's done in World's End (an RPG strategy game). This will mean that attacks against an opponent with strong DEF could do no damage at all. For instace ATK = 10, ENEMY DEF = 12, (ATK - DEF) = -2 and it also means that high attack vs slightly lower def, could do little damage, potentially making battles longer. For instance with ATK = 1010, ENEMY DEF = 1005, the damage would be 5. The damage will also increase dramatically now if the ATK is increased by a small percentage. For instance ATK = 1055, will do 900% more damage with only a %5 increase in ATK value.
    To avoid this, you can do something like ATK / DEF * WEAPON_DAMAGE This will scale more gradually when ATK or DEF are increased and allow a weak attacker to damage a creature with strong DEF.

    graphics / fx / sfx / ui *************************************
    
    https://soundcloud.com/gundatsch
    https://soundcloud.com/alexandr-zhelanov
    https://ilkeryalciner.bandcamp.com/
    www.youtube.com/c/Tadon
    https://airyluvs.com/
    http://creativecommons.org/licenses/by/3.0/
    https://arterfakproject.com/
    https://opengameart.org/
        
                
BONUS ***********
    
 countries taken over can have bases built on - more bases have perks, faster unit travel etc
 
 certain nations have different units, costs or stats
 
 ******** Notes post completion **********
 
 for readme: still unknown occasional bug on congo when selecting commands like nuke or diplomacy
 put link to github readme in html when finished
 check anything to do with objects and addition / subtraction operators
check all numbers in objects etc and see if they need rounding
change p cannon orbiting time when final time object completed
make sure all comments are in right place and make sense
add real world stats and build times to the game
sort styling of victory screens
end titles credits a little too big
remove c panel on victory screen or lock to prevent?
 
DEBUG / REFACTOR ***********
mark all events that cause increase and decrease in approval rating etc
modulate functions further
displayblock class not working due to css inheritance - refactor css

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
    
    <div class="nation-info-tooltip">Hover
                <span class="nation-info-tooltip-text">hello</span>
            </div>