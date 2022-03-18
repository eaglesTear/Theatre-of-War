// Main game object NEW OBJECT LITERAL

const gameState = {
    time: passageOfTime(),
    gameStarted: false,
    unitsOnCampaign: false,
    targetNationSelected: false,
    conscriptionStarted: false,
    skipIntro: false,
    playerNuked: false
};

// Keep track of the number of daily conscripts so total can be relayed to commander (player)
// Base maintenance totals

const arrays = {
    baseMaintenanceTotals: [],
    dailyInfantryRecruits: []
}

// Option / nation ability bools PREV: OPTIONS

const commands = {
    attack: false,
    deploy: false,
    recon: false,
    sabotage: false,
    incite: false,
    conscription: false,
    diplomacy: false,
    spying: false,
    launchNuclearMissile: false,
    fireParticleCannon: false,
    hacking: false,
    allianceReinforcement: false
};

const assigned = {
    asatMissile: "",
    cyreAssaultRifle: "",
    railguns: "",
    kineticArmour: "",
    particleCannon: "",
    missileDefenceShield: ""
}