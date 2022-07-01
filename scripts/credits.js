/*
*************************************************************************************************
    CREDITS: PEOPLE WHO GO UNSEEN FAR TOO OFTEN
*************************************************************************************************

    The game's ending victory credits remain the same, despite what nation the player wins with. I made the decision to enclose them inside a JS function as an alternative to many lines of duplicate HTML markup, adhering to the DRY concept of programming.
    
    The authours of the game's music can be found in the links below, and they are named explicitly in the ending victory credits via the 'credits' function that runs inside the HTML. For this reason, this script requires listing in the head tag so that the function is pre-defined before the credits roll.
    
    https://soundcloud.com/gundatsch
    https://soundcloud.com/alexandr-zhelanov
    https://ilkeryalciner.bandcamp.com/
    www.youtube.com/c/Tadon
    https://airyluvs.com/
    http://creativecommons.org/licenses/by/3.0/
    https://arterfakproject.com/
    https://opengameart.org/
*/

credits = () => {
    $(".credits").append(
        '<h2>Music</h2><p><i>Electronic War,</i><i> Act Of War,</i><i> Enemy Spotted,</i> and<i>Conflict</i> byAlexandr Zhelanov</p><p><i>Dark</i> by Pheonton</p><p><i>Laments Of The War</i> by Cethiel</p><p><i>Snow-Covered-Banner</i> by İlker Yalçıner 2018</p><p><i>Forward Operating Base</i> and <i>Ceasefire</i> by TAD 2021</p><p><i>Tensions</i> and <i>War Song</i> by Johan Brodd 2013 (jobromedia)</p><p><i>Secret Devastates</i> and <i>Digital Rock Theme</i> by SOUND AIRYLUVS by ISAo 2020</p><p>Licensed under CC BY 3.0 Creative Commons</p><h2>Fonts</h2><p><i>Wargate</i> by Arterfak Project</p><p>Hosted on Open Game Art</p><p>full credits also found on the readme here: link</p>'
    );
}