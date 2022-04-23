/* 
                   
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
get cost of things in swal header
how do nations get missile shields??

REFACTOR ***********

does targetnation need to be a param in every function it is used in?
modulate functions further
envelop functions into gamestarted control to prevent functions carrying on
functions & alerts - do they portray right information to the player and what's happening?
nothing to increase hostility in random events -  alter??
may be necessary to only use swal for buttons etc - danger they will override each other

DEBUG ***********

 1:57am 19/4/22 All major bugs eliminated
 
ADDITIONAL FUNCTIONALITY ***********
 540
>> add real world stats and build times to the game

/*

*************************************************************************************************
    
    NUCLEAR WARFARE
 
    If a nation suffers nuclear annihilation, colour is same as bg and is wiped and unable to be acquired for resources. If the target has nuclear defense, and they defend, they may launch against you if hostility or stance says so. Add new strategic element to object. Remember, nukes needed to validate function.

*************************************************************************************************

*/