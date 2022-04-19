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
be careful of double loops - do I want i or j?
watch p-cannon behaviour closely - especially the button. Does it appear after researching?
oil consumption
defence budget not going into negatives: issues was with resourceIncome: truncing empty arrays

REFACTOR ***********

does targetnation need to be a param in every function it is used in?
shorten and make clear some function names & vars
modulate functions further
envelop functions into gamestarted control to prevent functions carrying on
Any code that affects nation objects must be defined after their creation!!!! - put in classes?
check what needs doc. ready in terms of jquery - most code is v js
end goal - have one file that sets up whole game in terms of a function list
functions & alerts - do they portray right information to the player and what's happening?
store values (eg unit exp points) in an object
nothing to increase hostility in random events -  alter??
check addition & comparison operators!!!!

DEBUG ***********
agents not showing after capturing
 1:57am 19/4/22 All major bugs eliminated
 
ADDITIONAL FUNCTIONALITY ***********
 
playernation aggression increase when attacking other nation - build in to treaty functions
if no money, approval drops or game over - tick function
>> add real world stats and build times to the game
>> Event log on new screen - stance changes etc

/*

*************************************************************************************************
    
    NUCLEAR WARFARE
 
    If a nation suffers nuclear annihilation, colour is same as bg and is wiped and unable to be acquired for resources. If the target has nuclear defense, and they defend, they may launch against you if hostility or stance says so. Add new strategic element to object. Remember, nukes needed to validate function.

*************************************************************************************************

*/