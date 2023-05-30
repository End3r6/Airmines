



function getSprites(scene)
{
    scene.load.image('default', './assets/sprites/default-airmine.png');
    scene.load.image('small', './assets/sprites/small-airmine.png');
    scene.load.image('static', './assets/sprites/static-airmine.png');
}

function getScreenImages(scene)
{
    scene.load.image('backgroundCloud', './assets/sprites/background-cloud.png');
    scene.load.image('fadeScreen', './assets/images/black.png');
}

function getChapterImages(scene)
{
    //Chapter 1
    scene.load.image('C1-S2', './assets/images/Chapter-1/AM_C1_S2.png');
    scene.load.image('C1-S3', './assets/images/Chapter-1/Am_C1_S3.png');
    scene.load.image('C1-S4', './assets/images/Chapter-1/Am_C1_S4.png');
    scene.load.image('C1-S5', './assets/images/Chapter-1/Am_C1_S5.png');
    scene.load.image('C1-S6', './assets/images/Chapter-1/Am_C1_S6.png');

    scene.load.image('C2-S1', './assets/images/Chapter-2/Am_C2_S1.png');
    scene.load.image('C2-S2', './assets/images/Chapter-2/Am_C2_S2.png');
    scene.load.image('C2-S3', './assets/images/Chapter-2/Am_C2_S3.png');

    scene.load.image('C3-S2', './assets/images/Chapter-3/Am_C3_S2.png');
    scene.load.image('C3-S3', './assets/images/Chapter-3/Am_C3_S3.png');

    scene.load.image('C5-S1', './assets/images/Chapter-5/Am_C5_S1.png');
    scene.load.image('C5-S2', './assets/images/Chapter-5/Am_C5_S2.png');

    scene.load.image('C6-S1', './assets/images/Chapter-6/Am_C6_S1.png');
    scene.load.image('C6-S2', './assets/images/Chapter-6/Am_C6_S2.png');
}

function getMusic(scene)
{
    scene.load.audio('tellAStory', './assets/sound/music/Ashot-Danielyan/tellAStory.mp3');
    scene.load.audio('theBalloon', './assets/sound/music/Musictown/TheBalloon.mp3');
    scene.load.audio('airMines', './assets/sound/music/SoulProdMusic/airMines.mp3');
    scene.load.audio('lost', './assets/sound/music/LesFM/lost.mp3');
    scene.load.audio('theTree', './assets/sound/music/JuliusH/theTree.mp3');
    scene.load.audio('theReturn', './assets/sound/music/LesFM/theReturn.mp3');
}

export {getSprites, getScreenImages, getChapterImages, getMusic};