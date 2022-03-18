// ********** Globals governing game music, voice and sfx **********

// Initialise main game themes and sfx (.mp3)

const introTrack = new Audio("sound/music/devastates.mp3");
const mainTitleTrack = new Audio("sound/music/act-of-war.mp3");
const tutorialTrack = new Audio("sound/music/war-song.mp3");
const nationSelectTrack = new Audio("sound/music/snow-covered-banner.mp3");
const gameOverTrack = new Audio("sound/music/ceasefire.mp3");
const ruAnthem = new Audio("sound/music/anthem-ru.mp3");
const usAnthemInstrumental = new Audio("sound/music/anthem-us-instrumental.mp3");
const sale = new Audio("sound/sfx/sale.mp3");
const missileLaunch = new Audio("sound/sfx/launch.mp3");
const nuclearDetonation = new Audio("sound/sfx/atomic-bomb.mp3");
const particleCannon = new Audio("sound/sfx/particle-cannon.mp3");
const cannonImpact = new Audio("sound/sfx/cannon-impact.mp3");
const war = new Audio("sound/sfx/war.mp3");

// Menu / click events (.wav)

const explosion = new Audio("sound/sfx/explode.wav");
const menuSelect = new Audio("sound/sfx/country-select.wav");
const nationSelect = new Audio("sound/sfx/menu-select.wav");

// Female voice (.wav / .mp3)

const weaponDestroyed = new Audio("sound/voice/weaponDestroyed.wav");
const launchDetected = new Audio("sound/voice/launchDetected.mp3");

// Male AI voice (.flac)

const attemptingReboot = new Audio("sound/ai-voice/attempting-reboot.flac");
const systemsOnline = new Audio("sound/ai-voice/systems-online.flac");
const criticalDamage = new Audio("sound/ai-voice/critical-damage.flac");
const missionCompleted = new Audio("sound/ai-voice/mission-completed.flac");
const targetDestroyed = new Audio("sound/ai-voice/target-destroyed.flac");

// Female AI voice (.ogg)

const constructionComplete = new Audio("sound/ai-voice/ConstructionComplete.ogg");
const enemyEliminated = new Audio("sound/ai-voice/EnemyEliminated.ogg");
const unitReady = new Audio("sound/ai-voice/UnitReady.ogg");
const upgradeComplete = new Audio("sound/ai-voice/UpgradeComplete.ogg");

// Vars & code necessary for a self-repeating in-game tracklist

const inGameTrack = new Audio();
let currentTrack = 0;

const inGameTracklist = [
    "sound/music/army-strong.mp3",
    "sound/music/lament-of-the-war.mp3",
    "sound/music/electronic-war.mp3",
    "sound/music/digital-rock-theme.mp3",
    "sound/music/coffee-brewed-in-times-of-war.wav",
    "sound/music/enemy-spotted.mp3",
    "sound/music/conflict.ogg",
    "sound/music/dark.mp3",
    "sound/music/forward-operating-base.mp3",
    "sound/music/tensions.mp3"
];

// ES6 destructure for music - too loud by default

[gameOverTrack.volume,  inGameTrack.volume] = [0.5, 0.5];

const inGameTracklistLength = inGameTracklist.length;

playinGameTracks = (index) => {
    inGameTrack.src = inGameTracklist[index];
    inGameTrack.play();
}

/* 
    If current track being played is the last one, the track number is reset to 0 and the tracklist will loop in it's entirety from the beginning of the tracklist array.
*/

inGameTrack.addEventListener("ended", () => {
    
    currentTrack++;
    
    if (currentTrack === inGameTracklistLength) {
        currentTrack = 0;
        playinGameTracks(currentTrack);
    } else {
        playinGameTracks(currentTrack);
    }
});