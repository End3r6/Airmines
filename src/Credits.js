//Various Json Files
// import credits from './json-files/Credits.json' assert {type: 'json'};


// import { game } from './main.js';
import { setCurrentLevel } from './main.js';
import { setCurrentChapter } from './main.js';
import { mainMusic, setMainMusic } from './main.js';

import { loadData } from './Common.js';

let credits;
loadData('./src/json-files/Credits.json').then(data => credits = data);

class Credits extends Phaser.Scene
{
    constructor()
    {
        super('credits');
    }

    init()
    {

    }

    preload()
    {
        //load assets

        //UI
        // this.load.scenePlugin
        // ({
        //     key: 'rexuiplugin',
        //     url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
        //     sceneKey: 'rexUI'
        // });
        //#endregion

        this.load.bitmapFont('maytraWhite', './assets/fonts/khurasan/MaytraWhite.png', 'assets/fonts/khurasan/Maytra.xml');

        this.load.audio('creditsMusic', './assets/sound/music/LesFM/creditsMusic.mp3');
    }

    create()
    {
        //play end credits music
        setMainMusic(this.sound.add('creditsMusic', {loop:false}));
        mainMusic.play();

        let creditsCount = 0;

        let creditsText = this.add.dynamicBitmapText(400, 300, 'maytraWhite', credits[creditsCount], 60, 1).setOrigin(0.5).setAlpha(0);
        this.tweens.add
        ({
            targets: creditsText,
            alpha: 1,
            ease: 'Power1',
            duration: 1000
        });
        this.tweens.add
        ({
            targets: creditsText,
            alpha: 0,
            ease: 'Power1',
            duration: 1000,
            delay: 3000
        });

        //the end credits loop
        //It get's and displays data from the Credits.json file like a slidshow.
        this.creditsDisplayDelay = this.time.addEvent
        ({
            delay: 5000,
            callback: () =>
            {
                if(creditsCount >= credits.length)
                    return;


                creditsCount ++;
                creditsText.text = credits[creditsCount];

                this.tweens.add
                ({
                    targets: creditsText,
                    alpha: 1,
                    ease: 'Power1',
                    duration: 1500
                });
                this.tweens.add
                ({
                    targets: creditsText,
                    alpha: 0,
                    ease: 'Power1',
                    duration: 1500,
                    delay: 3000
                });
            },
            loop: true,
            timeScale: 1
        });

        //reset the entire game after the credits are done.
        this.endGameDelay = this.time.addEvent
        ({
            delay: 99000,
            callback: () =>
            {
                this.resetGame();
            },
            loop: true,
            timeScale: 1
        });
    }

    resetGame()
    {
        if(mainMusic.isPlaying == false)
        {
            mainMusic.play();
        }

        setCurrentChapter(0);
        setCurrentLevel(-1);
        
        this.scene.start('cutScene');
    }
}

export default Credits;