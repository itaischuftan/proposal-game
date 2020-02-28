let game;
let music;

// global game options
let gameOptions = {

    // platform speed range, in pixels per second
    platformSpeedRange: [300, 300],

    // mountain speed, in pixels per second
    mountainSpeed: 80,

    // cloud speed, in pixels per second
    cloudSpeed: 40,

    photoSpeed: 100,

    // spawn range, how far should be the rightmost platform from the right edge
    // before next platform spawns, in pixels
    spawnRange: [80, 300],

    // platform width range, in pixels
    platformSizeRange: [150, 300],

    // a height range between rightmost platform and next platform to be spawned
    platformHeightRange: [-5, 5],

    // a scale to be multiplied by platformHeightRange
    platformHeighScale: 20,

    // platform max and min height, as screen height ratio
    platformVerticalLimit: [0.4, 0.8],

    // player gravity
    playerGravity: 1200,

    // player jump force
    jumpForce: 400,

    // player starting X position
    playerStartPosition: 200,

    // consecutive jumps allowed
    jumps: 3,

    // % of probability a coin appears on the platform
    coinPercent: 100,

    // % of probability a fire appears on the platform
    firePercent: 25,
}

window.onload = function() {

    // object containing configuration options
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 1334,
            height: 700
        },
        scene: [preloadGame, playGame],
        backgroundColor: 0xffedfa,

        // physics settings
        physics: {
            default: "arcade"
        }
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}

// preloadGame scene
class preloadGame extends Phaser.Scene{
    constructor(){
        super("PreloadGame");
    }
    preload(){
        this.load.image("platform", "assets/images/platform.png");

        // player is a sprite sheet made by 24x48 pixels
        this.load.spritesheet("player", "assets/images/player.png", {
            frameWidth: 24,
            frameHeight: 48
        });

        // the coin is a sprite sheet made by 20x20 pixels
        this.load.spritesheet("coin", "assets/images/coin.png", {
            frameWidth: 20,
            frameHeight: 20
        });

        // the firecamp is a sprite sheet made by 32x58 pixels
        this.load.spritesheet("fire", "assets/images/fire.png", {
            frameWidth: 40,
            frameHeight: 70
        });

        // mountains are a sprite sheet made by 512x512 pixels
        this.load.spritesheet("mountain", "assets/images/mountain.png", {
            frameWidth: 512,
            frameHeight: 512
        });

        // mountains are a sprite sheet made by 512x512 pixels
        this.load.image("cloud1", "assets/images/cloud1.png", {
            frameWidth: 330,
            frameHeight: 240
        });

        this.load.image("cloud2", "assets/images/cloud2.png", {
            frameWidth: 147,
            frameHeight: 72
        });

        // mountains are a sprite sheet made by 512x512 pixels
        this.load.image("1", "assets/images/us/1.jpg", {
            frameWidth: 447,
            frameHeight: 512
        });

        this.load.image("2", "assets/images/us/2.jpg", {
            frameWidth: 447,
            frameHeight: 512
        });

        this.load.image("3", "assets/images/us/3.jpg", {
            frameWidth: 447,
            frameHeight: 512
        });

        this.load.image("4", "assets/images/us/4.jpg", {
            frameWidth: 447,
            frameHeight: 512
        });

        this.load.image("5", "assets/images/us/5.jpg", {
            frameWidth: 447,
            frameHeight: 512
        });

        this.load.image("6", "assets/images/us/6.jpg", {
            frameWidth: 447,
            frameHeight: 512
        });

        this.load.audio('aya', ['assets/audio/Aya.ogg']);
        this.load.audio('avalBikashti', ['assets/audio/AvalBikashti.ogg']);
        this.load.audio('hehe', ['assets/audio/hehe.ogg']);
        this.load.audio('tralala', ['assets/audio/tralala.ogg']);
        this.load.audio('nuLema', ['assets/audio/nuLema.ogg']);
        this.load.audio('yaaa', ['assets/audio/yaaa.ogg']);
        this.load.audio('music', ['assets/audio/music.mp3']);
    
    }
    create(){    
        // setting player animation
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 1
            }),
            frameRate: 8,
            repeat: -1
        });

        // setting coin animation
        this.anims.create({
            key: "rotate",
            frames: this.anims.generateFrameNumbers("coin", {
                start: 0,
                end: 5
            }),
            frameRate: 15,
            yoyo: true,
            repeat: -1
        });

        // setting fire animation
        this.anims.create({
            key: "burn",
            frames: this.anims.generateFrameNumbers("fire", {
                start: 0,
                end: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.scene.start("PlayGame");
    }
}

// playGame scene
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }

    refreshStats() {
        this.pointsText.text = this.points;
    }
      
    create(){
        music = this.sound.add('music');
        music.play();
        // group with all active mountains.
        this.mountainGroup = this.add.group();

        this.cloudGroup = this.add.group();

        this.photoGroup = this.add.group();

        // group with all active platforms.
        this.platformGroup = this.add.group({

            // once a platform is removed, it's added to the pool
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        });
        this.points = 0;
        var style1 = { font: "22px Arial", fill: "#000"};
        var t1 = this.add.text(10, 20, "Points:", style1);
        t1.fixedToCamera = true;
        var style2 = { font: "26px Arial", fill: "#000"};
        this.pointsText = this.add.text(80, 18, "", style2);
        this.refreshStats();
        this.pointsText.fixedToCamera = true;

        // platform pool
        this.platformPool = this.add.group({

            // once a platform is removed from the pool, it's added to the active platforms group
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });
        
        // group with all active coins.
        this.coinGroup = this.add.group({

            // once a coin is removed, it's added to the pool
            removeCallback: function(coin){
                coin.scene.coinPool.add(coin)
            }
        });

        // coin pool
        this.coinPool = this.add.group({

            // once a coin is removed from the pool, it's added to the active coins group
            removeCallback: function(coin){
                coin.scene.coinGroup.add(coin)
            }
        });

        // group with all active firecamps.
        this.fireGroup = this.add.group({

            // once a firecamp is removed, it's added to the pool
            removeCallback: function(fire){
                fire.scene.firePool.add(fire)
            }
        });

        // fire pool
        this.firePool = this.add.group({

            // once a fire is removed from the pool, it's added to the active fire group
            removeCallback: function(fire){
                fire.scene.fireGroup.add(fire)
            }
        });

        // adding a mountain
        this.addMountains()

        // adding a cloud
        this.addClouds()

        // adding a photo
        // this.addPhotos()

        // keeping track of added platforms
        this.addedPlatforms = 0;

        // number of consecutive jumps made by the player so far
        this.playerJumps = 0;

        // adding a platform to the game, the arguments are platform width, x position and y position
        this.addPlatform(game.config.width, game.config.width / 2, game.config.height * gameOptions.platformVerticalLimit[1]);

        // adding the player;
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height * 0.7, "player");
        this.player.setGravityY(gameOptions.playerGravity);
        this.player.setDepth(2);

        // the player is not dying
        this.dying = false;

        // setting collisions between the player and the platform group
        this.platformCollider = this.physics.add.collider(this.player, this.platformGroup, function(){

            // play "run" animation if the player is on a platform
            if(!this.player.anims.isPlaying){
                this.player.anims.play("run");
            }
        }, null, this);

        // setting collisions between the player and the coin group
        this.physics.add.overlap(this.player, this.coinGroup, function(player, coin){
            this.tweens.add({
                targets: coin,
                y: coin.y - 100,
                alpha: 0,
                duration: 800,
                ease: "Cubic.easeOut",
                callbackScope: this,
                onComplete: function(){
                    this.coinGroup.killAndHide(coin);
                    this.coinGroup.remove(coin);        
                }
            });
            this.points += 5;
            this.refreshStats();

        }, null, this);

        // setting collisions between the player and the fire group
        this.physics.add.overlap(this.player, this.fireGroup, function(player, fire){        
            this.dying = true;
            this.player.anims.stop();
            this.player.setFrame(2);
            this.player.body.setVelocityY(-200);
            this.physics.world.removeCollider(this.platformCollider);

        }, null, this);

        // checking for input
        this.input.on("pointerdown", this.jump, this);
    }

    // adding mountains
    addMountains(){
        let rightmostMountain = this.getRightmostMountain();
        if(rightmostMountain < game.config.width * 2){
            let mountain = this.physics.add.sprite(rightmostMountain + Phaser.Math.Between(100, 350), game.config.height + Phaser.Math.Between(0, 100), "mountain");
            mountain.setOrigin(0.5, 1);
            mountain.body.setVelocityX(gameOptions.mountainSpeed * -1);
            this.mountainGroup.add(mountain);
            if(Phaser.Math.Between(0, 1)){
                mountain.setDepth(1);
            }
            mountain.setFrame(Phaser.Math.Between(0, 3))
            this.addMountains()
        }
    }

    // getting rightmost mountain x position
    getRightmostMountain(){
        let rightmostMountain = -200;
        this.mountainGroup.getChildren().forEach(function(mountain){
            rightmostMountain = Math.max(rightmostMountain, mountain.x);
        })
        return rightmostMountain;
    }

    // getting rightmost photo x position
    getRightmostPhoto(){
        let rightmostPhoto = -200;
        this.photoGroup.getChildren().forEach(function(photo){
            rightmostPhoto = Math.max(rightmostPhoto, photo.x);
        })
        return rightmostPhoto;
    }

    // adding photos
    addPhotos(){
        let randomPhoto = Math.floor(Math.random() * Math.floor(7)).toString();
        console.log(randomPhoto);
        let rightmostPhoto = this.getRightmostPhoto();
        if(rightmostPhoto < game.config.width * 2){
            let photo = this.physics.add.sprite(rightmostPhoto + Phaser.Math.Between(100, 350), game.config.height + Phaser.Math.Between(0, 100), randomPhoto);
            photo.setOrigin(0.5, 1);
            photo.body.setVelocityX(gameOptions.photoSpeed * -1)
            this.photoGroup.add(photo);
            if(Phaser.Math.Between(0, 1)){
                photo.setDepth(1);
            }
            photo.setFrame(Phaser.Math.Between(0, 3))
            this.addPhotos()
        }
    }

    // getting rightmost cloud x position
    getRightmostCloud(){
        let rightmostCloud = -200;
        this.cloudGroup.getChildren().forEach(function(cloud){
            rightmostCloud = Math.max(rightmostCloud, cloud.x);
        })
        return rightmostCloud;
    }

    // adding clouds
    addClouds(){
        let cloudTypes = ["cloud1", "cloud2"];
        let randomCloud = Math.floor(Math.random() * Math.floor(2));
        let rightmostCloud = this.getRightmostCloud();
        if(rightmostCloud < game.config.width * 2){
            let cloud = this.physics.add.sprite(rightmostCloud + Phaser.Math.Between(100, 350), game.config.height + Phaser.Math.Between(0, 100), cloudTypes[randomCloud]);
            cloud.setOrigin(0.5, 8);
            cloud.body.setVelocityX(gameOptions.cloudSpeed * -1)
            this.cloudGroup.add(cloud);
            if(Phaser.Math.Between(0, 1)){
                cloud.setDepth(1);
            }
            cloud.setFrame(Phaser.Math.Between(0, 3))
            this.addClouds()
        }
    }
    
    // the core of the script: platform are added from the pool or created on the fly
    addPlatform(platformWidth, posX, posY){
        this.addedPlatforms ++;
        let platform;
        if(this.platformPool.getLength()){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.y = posY;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
            let newRatio =  platformWidth / platform.displayWidth;
            platform.displayWidth = platformWidth;
            platform.tileScaleX = 1 / platform.scaleX;
        }
        else{
            platform = this.add.tileSprite(posX, posY, platformWidth, 32, "platform");
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * -1);
            platform.setDepth(2);
            this.platformGroup.add(platform);
        }
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);

        // if this is not the starting platform...
        if(this.addedPlatforms > 1){

            // is there a coin over the platform?
            if(Phaser.Math.Between(1, 100) <= gameOptions.coinPercent){
                if(this.coinPool.getLength()){
                    let coin = this.coinPool.getFirst();
                    coin.x = posX;
                    coin.y = posY - 96;
                    coin.alpha = 1;
                    coin.active = true;
                    coin.visible = true;
                    this.coinPool.remove(coin);
                }
                else{
                    let coin = this.physics.add.sprite(posX, posY - 96, "coin");
                    coin.setImmovable(true);
                    coin.setVelocityX(platform.body.velocity.x);
                    coin.anims.play("rotate");
                    coin.setDepth(2);
                    this.coinGroup.add(coin);
                }
            }

            // is there a fire over the platform?
            if(Phaser.Math.Between(1, 100) <= gameOptions.firePercent){
                if(this.firePool.getLength()){
                    let fire = this.firePool.getFirst();
                    fire.x = posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth);
                    fire.y = posY - 46;
                    fire.alpha = 1;
                    fire.active = true;
                    fire.visible = true;
                    this.firePool.remove(fire);
                }
                else{
                    let fire = this.physics.add.sprite(posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth), posY - 46, "fire");
                    fire.setImmovable(true);
                    fire.setVelocityX(platform.body.velocity.x);
                    fire.setSize(8, 2, true)
                    fire.anims.play("burn");
                    fire.setDepth(2);
                    this.fireGroup.add(fire);
                }
            }
        }
    }

    // the player jumps when on the ground, or once in the air as long as there are jumps left and the first jump was on the ground
    // and obviously if the player is not dying
    jump(){
        if((!this.dying) && (this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps))){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;
            this.sound.play(['hehe', 'tralala', 'yaaa'][Math.floor(Math.random() * Math.floor(3))]);

            // stops animation
            this.player.anims.stop();
        }
    }

    update(){

        // game over
        if(this.player.y > game.config.height){
            this.scene.start("PlayGame");
            this.sound.play(['aya', 'nuLema', 'avalBikashti'][Math.floor(Math.random() * Math.floor(3))]);
            music.stop();
        }

        this.player.x = gameOptions.playerStartPosition;
        var style = { font: "22px Arial", fill: "#000"};
        if (this.points >= 300) {
            this.add.text(500, 100, 'סוד הקסם נמצא מאחורי הרמיוני', style);
            this.player.anims.stop();
        }
        // recycling platforms
        let minDistance = game.config.width;
        let rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if(platformDistance < minDistance){
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if(platform.x < - platform.displayWidth / 2){
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        // recycling coins
        this.coinGroup.getChildren().forEach(function(coin){
            if(coin.x < - coin.displayWidth / 2){
                this.coinGroup.killAndHide(coin);
                this.coinGroup.remove(coin);
            }
        }, this);

        // recycling fire
        this.fireGroup.getChildren().forEach(function(fire){
            if(fire.x < - fire.displayWidth / 2){
                this.fireGroup.killAndHide(fire);
                this.fireGroup.remove(fire);
            }
        }, this);

        // recycling mountains
        this.mountainGroup.getChildren().forEach(function(mountain){
            if(mountain.x < - mountain.displayWidth){
                let rightmostMountain = this.getRightmostMountain();
                mountain.x = rightmostMountain + Phaser.Math.Between(100, 350);
                mountain.y = game.config.height + Phaser.Math.Between(0, 100);
                mountain.setFrame(Phaser.Math.Between(0, 3))
                if(Phaser.Math.Between(0, 1)){
                    mountain.setDepth(1);
                }
            }
        }, this);

        // recycling clouds
        this.cloudGroup.getChildren().forEach(function(cloud){
            if(cloud.x < - cloud.displayWidth){
                let rightmostCloud = this.getRightmostCloud();
                cloud.x = rightmostCloud + Phaser.Math.Between(100, 350);
                cloud.y = game.config.height + Phaser.Math.Between(0, 100);
                cloud.setFrame(Phaser.Math.Between(0, 3))
                if(Phaser.Math.Between(0, 1)){
                    cloud.setDepth(1);
                }
            }
        }, this);

        // recycling photos
        this.photoGroup.getChildren().forEach(function(photo){
            if(photo.x < - photo.displayWidth){
                let rightmostPhoto = this.getRightmostPhoto();
                photo.x = rightmostPhoto + Phaser.Math.Between(100, 350);
                photo.y = game.config.height + Phaser.Math.Between(0, 100);
                photo.setFrame(Phaser.Math.Between(0, 3))
                if(Phaser.Math.Between(0, 1)){
                    photo.setDepth(1);
                }
            }
        }, this);

        // adding new platforms
        if(minDistance > this.nextPlatformDistance){
            let nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            let platformRandomHeight = gameOptions.platformHeighScale * Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
            let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
            let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
            let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
            let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2, nextPlatformHeight);
        }
    }
};
