//Various Json Files
import levelFile from './levels.json' assert {type: 'json'};

import { game, setGame } from './main.js';
import { currentLevel, setCurrentLevel } from './main.js';
// import { currentChapter } from './main.js';
// import { mainMusic } from './main.js';



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
        // this.load.scenePlugin
        // ({
        //     key: 'rexuiplugin',
        //     url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
        //     sceneKey: 'rexUI'
        // });
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
            delay: this.countDownTimer * 1000,
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

export default Game;