/* 
                   
BONUS ***********
    
 countries taken over can have bases built on - more bases have perks, faster unit travel etc
 
 certain nations have different units, costs or stats
 
POST PRODUCTION **********
 
put link to github readme in html when finished
change p cannon orbiting time when final time object completed
make sure all comments are in right place and make sense
determin swal styling
>> add real world stats and build times to the game

REFACTOR ***********
just remove or disable btns to prevent further use and reenable if needed
does targetnation need to be a param in every function it is used in?
functions & alerts - do they portray right information to the player and what's happening?
may be necessary to only use swal for buttons etc - danger they will override each other

DEBUG ***********


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


/*

*************************************************************************************************
    
    NUCLEAR WARFARE
 
    If a nation suffers nuclear annihilation, colour is same as bg and is wiped and unable to be acquired for resources. If the target has nuclear defense, and they defend, they may launch against you if hostility or stance says so. Add new strategic element to object. Remember, nukes needed to validate function.

*************************************************************************************************

*/