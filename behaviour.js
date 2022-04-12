/* 
    
    Casualties:  (ATK - DEF) +/- 20% as it's done in World's End (an RPG strategy game). This will mean that attacks against an opponent with strong DEF could do no damage at all. For instace ATK = 10, ENEMY DEF = 12, (ATK - DEF) = -2 and it also means that high attack vs slightly lower def, could do little damage, potentially making battles longer. For instance with ATK = 1010, ENEMY DEF = 1005, the damage would be 5. The damage will also increase dramatically now if the ATK is increased by a small percentage. For instance ATK = 1055, will do 900% more damage with only a %5 increase in ATK value.
    To avoid this, you can do something like ATK / DEF * WEAPON_DAMAGE This will scale more gradually when ATK or DEF are increased and allow a weak attacker to damage a creature with strong DEF.

    graphics / fx / sfx / ui *************************************
                   
BONUS ***********
    
 countries taken over can have bases built on - more bases have perks, faster unit travel etc
 
 certain nations have different units, costs or stats
 
POST PRODUCTION **********
 
change nuke game over image
for readme: still unknown occasional bug on congo when selecting commands like nuke or diplomacy
put link to github readme in html when finished
check anything to do with objects and addition / subtraction operators
check all numbers in objects etc and see if they need rounding
change p cannon orbiting time when final time object completed
make sure all comments are in right place and make sense
mark all events that cause increase and decrease in approval rating etc

REFACTOR ***********

shorten and make clear some function names & vars
modulate functions further
envelop functions into gamestarted control to prevent functions carrying on
Any code that affects nation objects must be defined after their creation!!!! - put in classes?
check what needs doc. ready in terms of jquery - most code is v js
end goal - have one file that sets up whole game in terms of a function list
functions & alerts - do they portray right information to the player and what's happening?

DEBUG ***********

check random event functions and run them
watch p-cannon behaviour closely - especially the button. Does it appear after researching?
check how / when to run nation withdrawal treaties: must come after stance change
defence budget not going into negative numbers after expenses - log what's going on
nation target attacking is always afghanistan - are they even hostile - check fn!
nation also not coloured when defeated if first to attack
nation not hostile and is attacking

ADDITIONAL FUNCTIONALITY ***********

add real world stats and build times to the game
function to go through and increase / decrease stats in nations to allow dynamic behaviour