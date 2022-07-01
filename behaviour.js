/* 
                   
 POST PRODUCTION **********
 
put link to github readme in html when finished
change p cannon orbiting time when final time object completed
determine swal styling
>> add real world stats and build times to the game
map colours!

REFACTOR ***********
does targetnation need to be a param in every function it is used in?
may be necessary to only use swal for buttons etc - danger they will override each other

DEBUG ***********
Intel: when it is obtained, does showing it on nation click prevent other functions running???
do we need noIntel alerts?

//// Clear the dropdown from sidebar if no living agents are captive 
//
//clearEmptyDropdown = () => {
//    if (nationsHoldingAgents.length === 0) {
//        $(".agents-imprisoned").addClass("hidden");
//    }
//}