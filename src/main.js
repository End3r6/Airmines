//Various Json Files
import levelFile from './levels.json' assert {type: 'json'};
import cutScene from './CutScene.json' assert {type: 'json'};
import credits from './Credits.json' assert {type: 'json'};


//Global Variables
let game;
let currentLevel;
let currentChapter;
let mainMusic;

window.onload = function()
{
    //Hide Level Editor UI
    document.getElementById('levelName').hidden = true;
    document.getElementById('levelExtention').hidden = true;
    document.getElementById('levelID').hidden = true;
    
    //Reset Key variables to proper numbers
    currentLevel = -1;
    currentChapter = 0;

    //Init the haser game screen
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

//The game scene
class Game extends Phaser.Scene
{
    constructor()
    {
        //the id of which to load the scene.
        super('game');
    }

    init()
    {

    }

    preload()
    {
        //#region Plugins

        //UI
        this.load.scenePlugin
        ({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        //#endregion

        //load all of the assets so I can use them throughout the game.
        this.load.image('balloon', 'assets/sprites/balloon.png', { frameWidth: 32, frameHeight: 48 });
        
        this.load.image('default', './assets/sprites/default-airmine.png');
        this.load.image('small', './assets/sprites/small-airmine.png');
        this.load.image('static', './assets/sprites/static-airmine.png');
        this.load.image('backgroundCloud', './assets/sprites/background-cloud.png');
        this.load.image('fadeScreen', './assets/images/black.png');
        
        this.load.bitmapFont('maytra', './assets/fonts/khurasan/Maytra.png', 'assets/fonts/khurasan/Maytra.xml');
        
        this.load.audio('balloonPop', './assets/sound/sfx/zapsplat_foley_balloon-pop.mp3');
        this.load.audio('metalHit', './assets/sound/sfx/metal-hit.mp3');
    }

    create()
    {
        //make sure that the level editor UI is hidden
        document.getElementById('levelName').hidden = true;
        document.getElementById('levelID').hidden = true;

        //Set the game variables
        this.gameTimer = 20;
        this.countDownTimer = 3;
        this.canPlay = false;

        //make a pop sound effect object
        this.popSFX = this.sound.add('balloonPop');

        //add the background mage
        this.add.image(400, 300, 'backgroundCloud').setOrigin(0.5);

        //load the current level data from the levels.json file
        this.loadLevel(currentLevel);
        
        //create the player group
        this.player = this.add.group();

        //Player sprite
        this.playerSprite = this.physics.add.sprite(400, 300, 'balloon');
        this.playerSprite.setScale(0.15);
        this.playerSprite.body.setCircle(200, 100, 50);
        this.playerSprite.refreshBody();

        //Fade Screen
        this.fadeScreen = this.add.image(400, 300, 'fadeScreen').setOrigin(0.5).setScale(1000);
        this.tweens.add
        ({
            targets: this.fadeScreen,
            alpha: 0,
            ease: 'Power1',
            duration: 2000
        });

        //player bounds variable for containing the player sprite within the screen
        this.playerBounds = 
        {
           x: ((this.playerSprite.width * this.playerSprite.scale) / 2),
           y: ((this.playerSprite.height * this.playerSprite.scale) / 2),
        }

        //the text for the time left
        this.playerTimeText = this.add.bitmapText(400, 300, 'maytra', `${this.gameTimer}`, 40, 1).setOrigin(0.5);

        //populate the player group
        this.player.add(this.playerSprite, this.playerTimeText);

        //the start count down timer text
        this.countDownText = this.add.bitmapText(400, 300, 'maytra', '3', 208, 1).setOrigin(0.5);

        //add colliders so the enemies can hit themselves
        this.physics.world.addCollider(this.enemies, null, () => 
        {
            this.sound.play
            ('metalHit', 
            {
                volume: Phaser.Math.Between(2, 5) * 0.01,
                detune: Phaser.Math.Between(400, 600)
            });
        });

        //add player and enemy collision
        this.physics.world.addCollider(this.enemies, this.player, () => 
        {
            //clear the player group
            this.player.clear();

            //reset player elements
            this.playerSprite.destroy();
            this.playerTimeText.setText('');

            //play the pop sound effect
            this.popSFX.play
            ({
                volume: 0.25
            });
            
            this.canPlay = false;
            
            //reset the game after 1 second
            this.deathResetDelay = this.time.addEvent
            ({
                delay: 1000,
                callback: () =>
                {
                    this.enemies.clear();
                    this.scene.restart();
                },
                loop: false,
                timeScale: 1,
            });
        });

        //pasue the physics so the enemies won't move until the coutdown is done.
        this.physics.pause();

        //the countdonw timer
        this.startGameCountDown = this.time.addEvent
        ({
            delay: 1000,
            callback: () =>
            {
                this.countDownTimer --;
                this.countDownText.setText(`${this.countDownTimer}`);

                if(this.countDownTimer <= 0)
                {
                    this.startGameCountDown.remove(false);
                    this.countDownText.destroy();
                }
            },
            loop: true,
            timeScale: 1,
        });

        //start delay timer
        this.startDelayTimer = this.time.addEvent
        ({
            delay: 3000,
            callback: () =>
            {
                //The game loop
                this.physics.resume();
                this.canPlay = true;

                game.canvas.style.cursor = 'none';

                //updates the countdown text
                this.countDownTimer = this.time.addEvent
                ({
                    delay: 1000,
                    callback: () =>
                    {
                        if(this.canPlay && this.gameTimer > 0)
                        {
                            this.gameTimer --;
                            this.playerTimeText.setText(`${this.gameTimer}`);
                        }
                    },
                    loop: true,
                    timeScale: 1
                })

                //the timer that delays the win.
                this.winGameTimer = this.time.addEvent
                ({
                    delay: this.gameTimer * 1000,
                    callback: () =>
                    {
                        this.currentChapter ++;
                        this.enemies.clear();
                        let fadeOn = this.tweens.add
                        ({
                            targets: this.fadeScreen,
                            alpha: 1,
                            ease: 'Power1',
                            duration: 2000
                        });

                        fadeOn.on('complete', () =>
                        {
                            this.scene.start('cutScene');
                        })
                    },
                    loop: false,
                    timeScale: 1,
                });
            },
            loop: false,
            timeScale: 1,
        });

        //the code to open the level editor
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
        //retuen if we can't play the game
        if(!this.canPlay)
            return;

        
        //Move player

        this.playerSprite.x = Phaser.Math.Clamp(game.input.mousePointer.x, 0 + this.playerBounds.x, game.canvas.width - this.playerBounds.x);
        this.playerSprite.y = Phaser.Math.Clamp(game.input.mousePointer.y, 0 + this.playerBounds.y, game.canvas.height - this.playerBounds.y);

        this.playerTimeText.x = Phaser.Math.Clamp(game.input.mousePointer.x, 0 + this.playerBounds.x, game.canvas.width - this.playerBounds.x);
        this.playerTimeText.y = Phaser.Math.Clamp(game.input.mousePointer.y, 0 + this.playerBounds.y, game.canvas.height - this.playerBounds.y);
    }

    loadLevel(level)
    {
        //get the data form the levels.json file
        let data = levelFile;

        //spawn the enemies contained in that  file
        this.spawnEnemies(data, level);
    }

    spawnEnemies(data, index)
    {
        //the enemies group
        this.enemies = this.add.group();

        //get the current level
        let levelArray = data[index];

        //the speeds for the enemies
        let smallSpeed = 250;
        let defaultSpeed = 150;

        //loop through the current level array
        for (let i = 0; i < levelArray.length; i++)
        {
            //get the current enemy object
            const token = levelArray[i];

            //new empty enemy variable
            let newEnemy;

            //spawn the enemy of its typ found in the json file
            if(token.type == "default")
            {
                newEnemy = this.physics.add.sprite( token.x, token.y, 'default');
                newEnemy.setScale(0.23);
                newEnemy.setBounce(1);
                newEnemy.setVelocity(Phaser.Math.Between(-1, 1) > 0 ? 1 : -1  * defaultSpeed, Phaser.Math.Between(-1, 1) > 0 ? 1 : -1  * defaultSpeed);
                newEnemy.setCollideWorldBounds(true);

                newEnemy.body.setCircle(160, newEnemy.width / 4, newEnemy.height / 4);
                newEnemy.refreshBody();
            }
            else if(token.type == "small")
            {
                newEnemy = this.physics.add.sprite(token.x, token.y, 'small');
                newEnemy.setScale(0.13);
                newEnemy.setBounce(1);
                newEnemy.setVelocity(Phaser.Math.Between(-1, 1) > 0 ? 1 : -1  * smallSpeed, Phaser.Math.Between(-1, 1) > 0 ? 1 : -1  * smallSpeed);
                newEnemy.setCollideWorldBounds(true);

                newEnemy.body.setCircle(160, newEnemy.width / 4, newEnemy.height / 4);
                newEnemy.refreshBody();
            }
            else if(token.type == "static")
            {
                newEnemy = this.physics.add.sprite(token.x, token.y, 'static');

                newEnemy.setScale(0.3);

                newEnemy.body.setCircle(190, 110, 110);
                newEnemy.body.immovable = true;
                newEnemy.refreshBody();
            }


            //add new enemy
            this.enemies.add(newEnemy);
        }
    }
}

class LevelEditor extends Phaser.Scene
{
    constructor()
    {
        super('editor');
    }

    init()
    {

    }

    preload()
    {
        //load images
        this.load.image('default', './assets/sprites/default-airmine.png');
        this.load.image('small', './assets/sprites/small-airmine.png');
        this.load.image('static', './assets/sprites/static-airmine.png');
        this.load.image('download', './src/level-editor/assets/sprites/download-icon.png');
        this.load.image('backgroundCloud', './assets/sprites/background-cloud.png');
    }

    create()
    {
        //add background image
        this.add.image(400, 300, 'backgroundCloud').setOrigin(0.5);

        //#region keyBinds
            this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        //#endregion

        //the level data
        this.levelData = this.add.group();

        //the level editor UI
        let nameInput = document.getElementById('levelName');
        let extensionInput = document.getElementById('levelExtention');
        let levelIDInput = document.getElementById('levelID');

        //show the level editor UI
        nameInput.hidden = false;
        extensionInput.hidden = false;
        levelIDInput.hidden = false;

        //#region UI
            //#region Download Button
                this.downloadButton = this.add.image(40, 550, 'download');
                this.downloadButton.setScale(0.4);
                this.downloadButton.setInteractive();
                this.downloadButton.on('pointerover', () => 
                { 
                    this.downloadButton.setScale(0.35);
                });
                this.downloadButton.on('pointerout', () => 
                { 
                    this.downloadButton.setScale(0.4);
                });
                this.downloadButton.on('pointerdown', () =>
                {
                    this.downloadButton.setScale(0.3);
                });
                this.downloadButton.on('pointerup', () =>
                {
                    //Data validation
                    if(!isNaN(nameInput.value) || nameInput.value == null || nameInput.value == '')
                    {
                        return;
                    }
                    if(!isNaN(extensionInput.value) || extensionInput.value == null || extensionInput.value == '')
                    {
                        return;
                    }
                    if(isNaN(levelIDInput.value) || levelIDInput.value == null)
                    {
                        return;
                    }

                    this.downloadButton.setScale(0.35);
                    this.saveEditorData(nameInput.value, extensionInput.value, levelIDInput.value);
                });
            //#endregion
                
            //#region Default Enemy Button
                this.default = this.add.image(120, 550, 'default');
                this.default.setScale(0.175);
                let  defaultBSize = 0.175;
                this.default.setInteractive();
                this.default.on('pointerover', () => 
                { 
                    this.default.setScale(defaultBSize - 0.03);
                });
                this.default.on('pointerout', () => 
                { 
                    this.default.setScale(defaultBSize);
                });
                this.default.on('pointerdown', () =>
                {
                    this.default.setScale(defaultBSize - 0.05);

                    let newEnemy = this.levelData.create(260, 260, 'default');

                    newEnemy.name = 'default';

                    newEnemy.setInteractive({ useHandCursor: true });
                    newEnemy.setScale(0.23);
                    this.input.setDraggable(newEnemy);

                    this.input.on('drag', function(pointer, gameObject, dragX, dragY) 
                    {
                        gameObject.x = dragX;
                        gameObject.y = dragY;
                    });
                });
                this.default.on('pointerup', () =>
                {
                    this.default.setScale(defaultBSize - 0.03);
                });
            //#endregion
                
            //#region Small Enemy Button
                let smallBSize = 0.175;
                this.small = this.add.image(200, 550, 'small');
                this.small.setScale(smallBSize);
                this.small.setInteractive();
                this.small.on('pointerover', () => 
                { 
                    this.small.setScale(smallBSize - 0.03);
                });
                this.small.on('pointerout', () => 
                { 
                    this.small.setScale(smallBSize);
                });
                this.small.on('pointerdown', () =>
                {
                    this.small.setScale(smallBSize - 0.05);

                    let newEnemy = this.levelData.create(260, 260, 'small');

                    newEnemy.name = 'small';

                    newEnemy.setInteractive({ useHandCursor: true });
                    newEnemy.setScale(0.13);
                    this.input.setDraggable(newEnemy);

                    this.input.on('drag', function(pointer, gameObject, dragX, dragY) 
                    {
                        gameObject.x = dragX;
                        gameObject.y = dragY;
                    });
                });
                this.small.on('pointerup', () =>
                {
                    this.small.setScale(smallBSize - 0.03);
                });
            //#endregion
            
            //#region Static Enemy Button
                let staticBSize = 0.15;
                this.static = this.add.image(280, 553, 'static');
                this.static.setScale(staticBSize);
                this.static.setInteractive();

                this.static.on('pointerover', () => 
                { 
                    this.static.setScale(staticBSize - 0.03);
                });
                this.static.on('pointerout', () => 
                { 
                    this.static.setScale(staticBSize);
                });
                this.static.on('pointerdown', () =>
                {
                    this.static.setScale(staticBSize - 0.05);

                    let newEnemy = this.levelData.create(260, 260, 'static');

                    newEnemy.name = 'static';

                    newEnemy.setInteractive({ useHandCursor: true });
                    newEnemy.setScale(0.3);
                    this.input.setDraggable(newEnemy);

                    this.input.on('drag', function(pointer, gameObject, dragX, dragY) 
                    {
                        gameObject.x = dragX;
                        gameObject.y = dragY;
                    });
                });
                this.static.on('pointerup', () =>
                {
                    this.static.setScale(staticBSize - 0.03);
                });
            //#endregion
        //#endregion
    }

    update()
    {
        //exit the level editor
        if(this.keyESC.isDown)
        {
            document.getElementById('levelName').hidden = true;
            document.getElementById('levelID').hidden = true;
            document.getElementById('levelExtention').hidden = true;
            
            this.scene.start('cutScene');
        }
    }

    //save the data to a json file
    saveEditorData(fileName, extension, id)
    {
        //new json array
        let jsonData = [];
        //loop thourgh all of the tokens in the leveldata array.
        for (let i = 0; i < this.levelData.getChildren().length; i++) 
        {
            //a variable for the current token
            const token = this.levelData.getChildren()[i];
            
            // the token object for the json file.
            let jsonToken = 
            {
                type: token.name,
                x: token.x,
                y: token.y
            }

            //push the current json token to the json array
            jsonData.push(JSON.stringify(jsonToken, null, '\t'));
        }

        //save the level log
        console.log(`Saving level ${id} to ${extension} file.`);

        //download the file that the data is written to
        this.download(`${fileName}. ${extension}`, jsonData);
    }

    download(fileName, data) 
    {
        var element = document.getElementById('fileDownload');

        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
        element.setAttribute('download', fileName);

        element.click();
    }
}

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

        //UI
        this.load.scenePlugin
        ({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        //#endregion

        this.load.image('black', 'assets/images/black.png');

        //Chapter 1
        this.load.image('C1-S2', './assets/images/Chapter-1/AM_C1_S2.png');
        this.load.image('C1-S3', './assets/images/Chapter-1/Am_C1_S3.png');
        this.load.image('C1-S4', './assets/images/Chapter-1/Am_C1_S4.png');
        this.load.image('C1-S5', './assets/images/Chapter-1/Am_C1_S5.png');
        this.load.image('C1-S6', './assets/images/Chapter-1/Am_C1_S6.png');

        //Chapter 2
        this.load.image('C2-S1', './assets/images/Chapter-2/Am_C2_S1.png');
        this.load.image('C2-S2', './assets/images/Chapter-2/Am_C2_S2.png');
        this.load.image('C2-S3', './assets/images/Chapter-2/Am_C2_S3.png');

        //Chapter 3
        this.load.image('C3-S2', './assets/images/Chapter-3/Am_C3_S2.png');
        this.load.image('C3-S3', './assets/images/Chapter-3/Am_C3_S3.png');

        //Chapter 5
        this.load.image('C5-S1', './assets/images/Chapter-5/Am_C5_S1.png');
        this.load.image('C5-S2', './assets/images/Chapter-5/Am_C5_S2.png');

        //Chapter 6
        this.load.image('C6-S1', './assets/images/Chapter-6/Am_C6_S1.png');
        this.load.image('C6-S2', './assets/images/Chapter-6/Am_C6_S2.png');

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
        mainMusic = this.sound.add(chapter.song, {loop:true});

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
        //check if we hae more chapters, if not, go to end credits
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

            currentLevel ++;
            currentChapter ++;
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
        this.load.scenePlugin
        ({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        //#endregion

        this.load.bitmapFont('maytraWhite', './assets/fonts/khurasan/MaytraWhite.png', 'assets/fonts/khurasan/Maytra.xml');

        this.load.audio('creditsMusic', './assets/sound/music/LesFM/creditsMusic.mp3');
    }

    create()
    {
        //play end credits music
        mainMusic = this.sound.add('creditsMusic', {loop:false});
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
                location.reload();
            },
            loop: true,
            timeScale: 1
        });
    }
}