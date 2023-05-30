
import CutScene from './CutScene.js';
import Credits from './Credits.js';
import Game from './Game.js';
import LevelEditor from './LevelEditor.js';


//Global Variables
let game;
let currentLevel;
let currentChapter;
let mainMusic;

function setGame(g)
{
    game = g;
}
function setCurrentLevel(level)
{
    currentLevel = level;
}
function setCurrentChapter(chapter)
{
    currentChapter = chapter;
}
function setMainMusic(music)
{
    mainMusic = music;
}


export { game, setGame };
export { currentLevel, setCurrentLevel };
export { currentChapter, setCurrentChapter };
export { mainMusic, setMainMusic };

window.onload = function()
{
    //Reset Key variables to proper numbers
    currentLevel = -1;
    currentChapter = 0;

    //Init the phaser game screen
    var config = 
    {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'gameView',
        scale: 
        {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        dom: 
        {
            createContainer: false,
        },
        input: 
        {
            keyboard: 
            {
                target: window
            },
            mouse: 
            {
                target: null,
                capture: true
            },
            activePointers: 1,
            touch: 
            {
                target: null,
                capture: true
            },
            smoothFactor: 0,
            gamepad: false,
            windowEvents: true,
        },
        physics: 
        {
            default: 'arcade',
            // arcade: 
            // {
            //     debug: true
            // }
        },
        scene:
        [
            CutScene,
            Game,
            Credits,
            LevelEditor
        ]
    };
    
    //make a new phaser game
    game = new Phaser.Game(config);
}