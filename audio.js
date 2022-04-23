// ********** Globals script governing game music, voice and sfx (directory: sound) **********

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

/* 
    Vars & code necessary for a self-repeating in-game tracklist.
    
    Here, I create a new audio object without a source, as this will be set by the function below. 'currenttrack' will act as an index for the 'inGameTracklist' array, so that each track can be played in succession. See below 'playinGameTracks' function.
    
    The 'inGameTracklist' array contains all the game's playing stage music. It can be added to anytime, or reduced, without needing to change any other code in this script.
*/

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

/* 
    Get the length of the tracklist above and store in a const.
    
    Afterwards, a function is defined that takes one index parameter which denotes the position of the current playing track. The 'inGameTrack' new Audio object then has its source set to the song array and index, initially at inGameTracklist[0] - or the first track. That (first) track is then played. 
*/

const inGameTracklistLength = inGameTracklist.length;

playinGameTracks = (index) => {
    inGameTrack.src = inGameTracklist[index];
    inGameTrack.play();
}

/* 
    To achieve a continuous tracklist, an event listener is added to the in-game tracks. When a track has ended, the index of that track is incremeted by one.
    
    A control flow then checks whether the current track (index) is equal to the length of the full tracklist. If so, that must be the last track in the list and thus the current track (index) requires resetting to 0, so that the starting track can now loop and play again.
    Otherwise, once one track has ended, the next one plays, following the incremented index.
    
    Generally, if the current track being played is the last one, the track number is reset to 0 and the tracklist will loop in it's entirety from the beginning of the tracklist array.
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

// ES6 destructure for music & sfx volume - too loud for myself by default. User can modify to suit

[gameOverTrack.volume,  inGameTrack.volume] = [0.5, 0.5];