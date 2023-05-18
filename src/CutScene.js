//Imports
import cutScene from './json-files/CutScene.json' assert {type: 'json'};

// import { game } from './main.js';
import { currentLevel, setCurrentLevel } from './main.js';
import { currentChapter, setCurrentChapter } from './main.js';
import { mainMusic, setMainMusic } from './main.js';

import { getChapterImages } from './main.js';


class CutScene extends Phaser.Scene
{
    constructor()
    {
        super('cutScene');
    }

    init()
    {

    }

    preload()
    {
        //load assets

        this.load.image('black', 'assets/images/black.png');

        getChapterImages(this);

        this.load.bitmapFont('maytraWhite', './assets/fonts/khurasan/MaytraWhite.png', 'assets/fonts/khurasan/Maytra.xml');

        this.load.audio('tellAStory', './assets/sound/music/Ashot-Danielyan/tellAStory.mp3');
        this.load.audio('theBalloon', './assets/sound/music/Musictown/TheBalloon.mp3');
        this.load.audio('airMines', './assets/sound/music/SoulProdMusic/airMines.mp3');
        this.load.audio('lost', './assets/sound/music/LesFM/lost.mp3');
        this.load.audio('theTree', './assets/sound/music/JuliusH/theTree.mp3');
        this.load.audio('theReturn', './assets/sound/music/LesFM/theReturn.mp3');

        this.load.audio('beginChapter', './assets/sound/sfx/SamuelFrancisJohnson/beginChapter.mp3');

        document.body.style.backgroundColor = "black";
    }

    create()
    {
        //add the begin chapter SFX
        let beginChapter = this.sound.add('beginChapter', {loop:false});

        //fade out music
        this.tweens.add
        ({
            targets: mainMusic,
            volume: 0,
            ease: 'Power1',
            duration: 1000
        });

        //the skip cutscene button
        this.skipScene = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        //initialize dialogue variables
        let currentDialogueLine = -1;
        let currentSlide = 0;
        let numClicks = 0;

        //get the current chapater and slide data from the CutScene.json file
        let chapter = this.getChapterData(currentChapter);
        let slide = this.getSlideData(currentSlide, chapter);

        //set up the main music object
        setMainMusic(this.sound.add(chapter.song, {loop:true}));

        //various text
        let title = this.add.dynamicBitmapText(400, 300, 'maytraWhite', chapter.title, 60, 1).setOrigin(0.5).setAlpha(0);
        let click = this.add.dynamicBitmapText(400, 370, 'maytraWhite', '(click)', 35, 1).setOrigin(0.5).setAlpha(0);
        let skipText = this.add.dynamicBitmapText(700, 550, 'maytraWhite', 'Press Enter to skip', 30, 1).setOrigin(0.5).setAlpha(0);
        
        //image
        let image = this.add.image(400, 300, '').setAlpha(0).setScale(0.5);
        //dialogue text
        let dialogue = this.add.dynamicBitmapText(400, 450, 'maytraWhite', '', 45, 1).setOrigin(0.5).setAlpha(0);

        this.tweens.add
        ({
            targets: title,
            alpha: 1,
            ease: 'Power1',
            duration: 2000
        });
        this.tweens.add
        ({
            targets: click,
            alpha: 1,
            ease: 'Power1',
            duration: 2000
        });
        this.tweens.add
        ({
            targets: skipText,
            alpha: 1,
            ease: 'Power1',
            duration: 2000
        });

        //start the cutscene slide show on pointer down.
        this.input.on('pointerdown', () => 
        {
            //exit function if we have clicked more than once to prevent bugs
            if(numClicks > 0)
                return;

            //play the begin chpater SFX
            beginChapter.play
            (
                {
                    volume: 0.15
                }
            );
            
            //increase NumClicks
            numClicks ++;
                
            this.tweens.add
            ({
                targets: title,
                alpha: 0,
                ease: 'Power1',
                duration: 2000
            });

            this.tweens.add
            ({
                targets: click,
                alpha: 0,
                ease: 'Power1',
                duration: 2000
            });

            this.tweens.add
            ({
                targets: skipText,
                alpha: 0,
                ease: 'Power1',
                duration: 2000
            });

            //the duration of each dialogue's display time
            let duration = 5100;

            this.startMusicDelay = this.time.addEvent
            ({
                delay: duration,
                callback: () =>
                {
                    mainMusic.play({volume:0.6});
                },
                loop: false,
                timeScale: 1
            })

            //the cutscene slide show
            this.startGameCountDown = this.time.addEvent
            ({
                delay: duration,
                callback: () =>
                {
                    currentDialogueLine ++;

                    //check if we have more slides in the slide show, if not end the cut scene
                    if(currentSlide < chapter.data.length)
                    {
                        //set the current image and text
                        image.setTexture(slide.image, 0);
                        this.tweens.add
                        ({
                            targets: image,
                            alpha: 1,
                            ease: 'Power1',
                            duration: 1000
                        });

                        //check if we have more dialogue in the slide, if not end the slide
                        if(currentDialogueLine >= slide.dialogue.length)
                        {
                            //Next Slide
                            this.tweens.add
                            ({
                                targets: image,
                                alpha: 0,
                                ease: 'Power1',
                                duration: 1000,
                                delay: 3000
                            });

                            currentSlide ++;
                            currentDialogueLine = -1;

                            slide = this.getSlideData(currentSlide, chapter);
                        }
                        else
                        {
                            //Dialogue stuff
                            dialogue.text = slide.dialogue[currentDialogueLine];

                            this.tweens.add
                            ({
                                targets: dialogue,
                                alpha: 1,
                                ease: 'Power1',
                                duration: 1000
                            });
                            this.tweens.add
                            ({
                                targets: dialogue,
                                alpha: 0,
                                ease: 'Power1',
                                duration: 1000,
                                delay: 3000
                            });
                        }
                    }
                    else
                    {
                        this.endScene();
                    }
                },
                loop: true,
                timeScale: 1,
            });
        }, this, null);

        //open the level editor
        //#region Level Editor
        this.input.keyboard.createCombo('LE05');
        this.input.keyboard.on('keycombomatch', () => 
        {
            this.scene.start('editor');
        });
        //#endregion
    }

    update()
    {
        //skip scene button condition
        if(this.skipScene.isDown)
        {
            if(mainMusic.volume > 0)
            {
                this.game.sound.stopAll();
            }

            this.endScene();
        }
    }

    endScene()
    {
        //check if we have more chapters, if not, go to end credits
        if(currentChapter >= cutScene.length - 1)
        {
            let songFade = this.tweens.add
            ({
                targets: mainMusic,
                volume: 0,
                ease: 'Power1',
                duration: 2000
            });

            songFade.on('complete', () => 
            {
                this.scene.start('credits');
            });
        }
        else
        {
            if(mainMusic.isPlaying == false)
            {
                mainMusic.play();
            }

            setCurrentChapter( currentChapter + 1 );
            setCurrentLevel( currentLevel + 1 );

            this.scene.start('game');
        }
    }
    
    getChapterData(chapter)
    {
        return cutScene[chapter];
    }

    getSlideData(slide, chapter)
    {
        return chapter.data[slide];;
    }
}

export default CutScene;