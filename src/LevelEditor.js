//Imports
// import { game } from './main.js';
// import { currentLevel } from './main.js';
// import { currentChapter } from './main.js';
// import { mainMusic } from './main.js';

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

        // //the level editor UI
        // let nameInput = document.getElementById('levelName');
        // let extensionInput = document.getElementById('levelExtention');
        // let levelIDInput = document.getElementById('levelID');

        // //show the level editor UI
        // nameInput.hidden = false;
        // extensionInput.hidden = false;
        // levelIDInput.hidden = false;

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
                    // if(!isNaN(nameInput.value) || nameInput.value == null || nameInput.value == '')
                    // {
                    //     return;
                    // }
                    // if(!isNaN(extensionInput.value) || extensionInput.value == null || extensionInput.value == '')
                    // {
                    //     return;
                    // }
                    // if(isNaN(levelIDInput.value) || levelIDInput.value == null)
                    // {
                    //     return;
                    // }

                    this.downloadButton.setScale(0.35);
                    this.saveEditorData("new-level", "json", "");
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
            // document.getElementById('levelName').hidden = true;
            // document.getElementById('levelID').hidden = true;
            // document.getElementById('levelExtention').hidden = true;
            
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
        this.download(`${fileName}.${extension}`, jsonData);
    }

    download(fileName, data) 
    {
        var element = document.getElementById('fileDownload');

        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
        element.setAttribute('download', fileName);

        element.click();
    }
}

export default LevelEditor;