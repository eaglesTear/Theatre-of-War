/* 
                   
BONUS ***********
    
 countries taken over can have bases built on - more bases have perks, faster unit travel etc
 
 certain nations have different units, costs or stats
 
POST PRODUCTION **********
 
for readme: still unknown occasional bug on congo when selecting commands like nuke or diplomacy
put link to github readme in html when finished
check all numbers in objects etc and see if they need rounding
change p cannon orbiting time when final time object completed
make sure all comments are in right place and make sense
mark all events that cause increase and decrease in approval rating etc
satellites to report missile shield or special weapons at all???
satellites are safe but need high cost to balance???

REFACTOR ***********

does targetnation need to be a param in every function it is used in?
functions & alerts - do they portray right information to the player and what's happening?
may be necessary to only use swal for buttons etc - danger they will override each other

DEBUG ***********

check awarded bonuses in trade deals - i or j?

disallowNegotitationDeals = (region) => {

    if (diplomacyAttempted.includes(region)) {
        swal({
            title: "Diplomacy Disallowed",
            text: `${region} is not open to negotiation.`,
            icon: "warning",
        });
        return true;
    }
    return false;
}

disallowNegotitationStance = (region, targetNation) => {

    if (targetNation.status.stance === "hostile") {
        swal({
            title: "Hostile Nation",
            text: `Commander, ${region} is hostile and will not negotiate.`,
            icon: "warning",
        });
        return true;
    }
    return false;
}

//// Clear the dropdown from sidebar if no living agents are captive 
//
//clearEmptyDropdown = () => {
//    if (nationsHoldingAgents.length === 0) {
//        $(".agents-imprisoned").addClass("hidden");
//    }
//}


 
ADDITIONAL FUNCTIONALITY ***********
>> add real world stats and build times to the game

/*

*************************************************************************************************
    
    NUCLEAR WARFARE
 
    If a nation suffers nuclear annihilation, colour is same as bg and is wiped and unable to be acquired for resources. If the target has nuclear defense, and they defend, they may launch against you if hostility or stance says so. Add new strategic element to object. Remember, nukes needed to validate function.

*************************************************************************************************

*/