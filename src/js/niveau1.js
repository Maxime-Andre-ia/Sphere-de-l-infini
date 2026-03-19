import * as fct from "/src/js/fonctions.js";

export default class niveau1 extends Phaser.Scene {
    constructor() {
        super({ key: "niveau1" });
    }

    preload() {

        // MAP de votre ami
        this.load.tilemapTiledJSON("map_mathis", "src/assets/MAP_FINALE_1.tmj");
        this.load.image("img_decor_gris", "src/assets/tileset_1.png");
        this.load.image("img_spike", "src/assets/laser_spikes_idle.png");
        this.load.image("img_decor_vert", "src/assets/preview-export-x9.png");
        this.load.image("img_laser_bleu", "src/assets/texture_laser.png");
        this.load.image("img_laser_multi", "src/assets/beams.png");
        this.load.image("img_nucleaire", "src/assets/full decor tiles.png");
        this.load.image("img_tuyau_rouge", "src/assets/1.png");
        this.load.image("img_tuyau_fer", "src/assets/3.png");
        this.load.image("img_pylone", "src/assets/4.png");
        this.load.image("img_coffre", "src/assets/Chest.png");
        this.load.image("img_laser_violet", "src/assets/13.png");
        this.load.image("img_flamme_orange", "src/assets/37.png");
        this.load.image("img_mrincredible", "src/assets/MrIncredibleBecomingCanny.png");
        this.load.image("img_mrincredible_10", "src/assets/Phase_10.png");
        this.load.image("img_cat", "src/assets/yippie-first-time-clearing-v0-bj1ju9p65mub1-2.png");

        this.load.tilemapTiledJSON("map_hassoul", "src/assets/lab2._hassoultmj.tmj");
        this.load.image("img_dungeon", "src/assets/Dungeon Tile Set2.png");

        this.load.spritesheet("img_perso", "src/assets/dudebase2.png", {
            frameWidth: 423 / 9,
            frameHeight: 102
        });
        this.load.image("img_piqueM", "src/assets/piqueM.png");
        this.load.image("img_item", "src/assets/image_inversionD.png");
        this.load.image("img_piece", "src/assets/coinD.png");
        this.load.spritesheet("img_missile", "src/assets/image_missile.png", {
            frameWidth: 320 / 5,
            frameHeight: 320 / 4
        });
        this.load.image("img_star", "src/assets/star.png");
        this.load.image("img_bout_laser", "src/assets/bout_laserm.png");
        this.load.image("img_level_tileset", "src/assets/level_tileset.png");
        this.load.image("img_laser4", "src/assets/laser4.png");

        this.load.tilemapTiledJSON("map_quentin", "src/assets/lab.tmj");

        this.load.audio("sin_missile", "src/assets/bruitmissile.wav");
        this.load.audio("sin_piece", "src/assets/bruitpiece.wav");
    }

    create() {
        this.physics.world.createDebugGraphic();

        this.player = this.physics.add.sprite(300, 300, "img_perso").setDepth(8);
        this.player.setCollideWorldBounds(true);
        // Définit les limites du monde (largeur très grande, hauteur fixe)
        this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 704);
        this.anims.create({
            key: 'courir',
            frames: this.anims.generateFrameNumbers('img_perso', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.player.play('courir');
        this.player.body.setSize(15, 30);
        this.player.body.setOffset(15, 45);

        this.motifsPieces = [
            [
                [1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1]
            ]
        ];

        this.groupePieces = this.physics.add.group({ allowGravity: false });
        this.physics.add.overlap(this.player, this.groupePieces, this.collecterPiece, null, this);

        this.groupeMissiles = this.physics.add.group({ allowGravity: false });
        this.physics.add.overlap(this.player, this.groupeMissiles, this.toucherMissile, null, this);

        this.prochainX = 0;
        this.listeMaps = ["map_quentin", "map_hassoul", "map_mathis"];
        this.chunksActifs = [];

        this.ajouterChunk();
        this.ajouterChunk();
        this.ajouterChunk();
        this.ajouterChunk();
        this.ajouterChunk();
        this.ajouterChunk();

        this.clavier = this.input.keyboard.createCursorKeys();
        this.cameras.main.startFollow(this.player);

        this.isGravityInverted = false;
        this.puissanceJetpack = -200;
        this.player.setGravityY(800);

        this.itemInversion = this.physics.add.sprite(800, 300, "img_item");
        this.itemInversion.body.allowGravity = false;
        this.physics.add.overlap(this.player, this.itemInversion, this.inverserGravite, null, this);
        this.itemInversion.setDepth(15);

        this.scorePieces = 0;
        this.scoreDistance = 0;

        this.textePieces = this.add.text(16, 16, "Pièces : 0", { fontSize: '24px', fill: '#FFD700' }).setScrollFactor(0).setDepth(10);
        this.texteDistance = this.add.text(16, 50, "Distance : 0 m", { fontSize: '24px', fill: '#FFFFFF' }).setScrollFactor(0).setDepth(10);

        this.time.addEvent({
            delay: 10000,
            callback: this.preparerMissile,
            callbackScope: this,
            loop: true
        });

        this.missileSound = this.sound.add("sin_missile", { volume: 0.5 });
        this.pieceSound = this.sound.add("sin_piece", { volume: 0.5 });

        this.isGameOver = false;

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.particlesJetpack = this.add.particles(0, 0, "img_star", {
            speed: { min: 50, max: 100 },
            angle: { min: 80, max: 100 },
            scale: { start: 0.8, end: 0 },
            lifespan: 800,
            frequency: 50,
            emitting: false
        }).setDepth(15);
    }

    // ✅ update() restauré — il avait disparu de ton fichier !
    update() {
        if (this.isGameOver === true) return;

        let vitesse = 200 + Math.floor(this.player.x / 500) * 2;
        this.player.setVelocityX(vitesse);

        if (this.clavier.up.isDown) {
            if (this.isGravityInverted === false) {
                this.player.setVelocityY(this.puissanceJetpack);
            } else {
                this.player.setVelocityY(-this.puissanceJetpack);
            }
            this.particlesJetpack.emitParticleAt(this.player.x, this.player.y + 20);
        } else {
            this.particlesJetpack.stop();
        }

        if (this.prochainX < this.player.x + 6400) {
            this.ajouterChunk();
        }



        if (this.chunksActifs.length > 0) {
            let plusVieuxChunk = this.chunksActifs[0];
            if (plusVieuxChunk.finX < this.player.x - 1600) {
                plusVieuxChunk.colliders.forEach(collider => {
                    if (collider) this.physics.world.removeCollider(collider);
                });
                plusVieuxChunk.calquesVisuels.forEach(calque => {
                    if (calque) calque.destroy();
                });
                plusVieuxChunk.mapData.destroy();
                this.chunksActifs.shift();
            }
        }

        this.groupePieces.getChildren().forEach(piece => {
            if (piece.x < this.player.x - 800) piece.destroy();
        });

        this.groupeMissiles.getChildren().forEach(missile => {
            if (missile.x < this.cameras.main.scrollX - 100) missile.destroy();
        });

        this.scoreDistance = Math.floor((this.player.x - 100) / 100);
        this.texteDistance.setText("Distance : " + this.scoreDistance + " m");
    }

    inverserGravite(player, item) {
        item.disableBody(true, true);
        this.isGravityInverted = true;
        this.player.setFlipY(true);
        this.player.setGravityY(-1000);

        this.time.delayedCall(5000, () => {
            this.isGravityInverted = false;
            this.player.setFlipY(false);
            this.player.setGravityY(800);
        }, [], this);
    }

    // ✅ Une seule ajouterChunk() qui gère les deux maps
    ajouterChunk() {
        let mapAleatoire = Phaser.Math.RND.pick(this.listeMaps);
        let map = this.make.tilemap({ key: mapAleatoire });

        let tousLesTilesets = [];
        let nomFond, nomSol, nomMortel;

        let configMortel = { laserWidth: 4, laserHeight: 4 }; // défaut laser fin



        if (mapAleatoire === "map_quentin") {
            let ts_leveltileset = map.addTilesetImage("level_tileset", "img_level_tileset");
            let ts_boutlaser = map.addTilesetImage("bout laser", "img_bout_laser");
            let ts_laser4 = map.addTilesetImage("laser4", "img_laser4");
            tousLesTilesets = [ts_leveltileset, ts_boutlaser, ts_laser4];
            nomFond = "Background";
            nomSol = "Obstacle_pas_mortel";
            nomMortel = "Background_mortel";

        } else if (mapAleatoire === "map_hassoul") {
            let ts_dungeon = map.addTilesetImage("Dungeon Tile Set2", "img_dungeon");
            tousLesTilesets = [ts_dungeon];

            // lab2_background_2 affiché sans collision
            map.createLayer("lab2_background_2", tousLesTilesets, this.prochainX, 0)?.setDepth(4);

            nomFond = "lab2_background";
            nomSol = "lab2_sol";
            nomMortel = "lab2_mort";
        } else if (mapAleatoire === "map_mathis") {
            let ts_decor_gris = map.addTilesetImage("tileset_decor_gris", "img_decor_gris");
            let ts_spike = map.addTilesetImage("tileset_spike", "img_spike");
            let ts_decor_vert = map.addTilesetImage("tileset_decor_vert", "img_decor_vert");
            let ts_laser_bleu = map.addTilesetImage("tileset_laser_bleu", "img_laser_bleu");
            let ts_laser_multi = map.addTilesetImage("tileset_laser_multi", "img_laser_multi");
            let ts_nucleaire = map.addTilesetImage("tileset_nucleaire", "img_nucleaire");
            let ts_tuyau_rouge = map.addTilesetImage("tileset_tuyau_rouge", "img_tuyau_rouge");
            let ts_tuyau_fer = map.addTilesetImage("tilset_tuyau_fer", "img_tuyau_fer");
            let ts_pylone = map.addTilesetImage("tilseset_pylone", "img_pylone");
            let ts_coffre = map.addTilesetImage("tileset_coffre", "img_coffre");
            let ts_laser_violet = map.addTilesetImage("tilset_laser_violet", "img_laser_violet");
            let ts_flamme = map.addTilesetImage("tilset_flamme_orange", "img_flamme_orange");
            let ts_mrincredible = map.addTilesetImage("tileset_mrIncredible_summer", "img_mrincredible");
            let ts_mrincredible10 = map.addTilesetImage("tileset_mrincredible_phase_10", "img_mrincredible_10");
            let ts_cat = map.addTilesetImage("tileset_cat", "img_cat");

            tousLesTilesets = [
                ts_decor_gris, ts_spike, ts_decor_vert, ts_laser_bleu, ts_laser_multi,
                ts_nucleaire, ts_tuyau_rouge, ts_tuyau_fer, ts_pylone, ts_coffre,
                ts_laser_violet, ts_flamme, ts_mrincredible, ts_mrincredible10, ts_cat
            ];

            nomFond = "Background";
            nomSol = "Obstacle_pas_mortel";
            nomMortel = "Background_mortel";
        }

        let largeurMap = map.widthInPixels;
        if (!largeurMap || largeurMap === 0) {
            console.warn("widthInPixels = 0, on force 2000px");
            largeurMap = 2000;
        }

        let calqueFond = map.createLayer(nomFond, tousLesTilesets, this.prochainX, 0)?.setDepth(1);
        let calqueSol = map.createLayer(nomSol, tousLesTilesets, this.prochainX, 0)?.setDepth(2);
        let calqueMortel = nomMortel ? map.createLayer(nomMortel, tousLesTilesets, this.prochainX, 0)?.setDepth(3) : null;

        let collidersChunk = [];

        if (calqueMortel) {
            calqueMortel.setCollisionByExclusion([-1]);
            calqueMortel.forEachTile(tile => {
                if (tile.index !== -1) {
                    tile.setCollisionCallback(null, null);
                    tile.physics.matterBody = null;
                    tile.faceTop = true;
                    tile.faceBottom = true;
                    tile.faceLeft = true;
                    tile.faceRight = true;
                }
            });

            let overlapMortel = this.physics.add.overlap(
                this.player,
                calqueMortel,
                () => {
                    console.log("mort | map=", mapAleatoire,
                        "| x=", Math.floor(this.player.x),
                        "| y=", Math.floor(this.player.y));
                    if (!this.isGameOver) {
                        this.isGameOver = true;
                        this.physics.pause();
                        this.player.setTint(0xff0000);
                        this.player.anims.stop();
                        this.time.removeAllEvents();
                        this.afficherGameOver();
                    }
                },
                (player, tile) => {
                    // Double vérification : index -1 ET pas de texture
                    if (tile.index === -1 || tile.index === 0) return false;
                    if (!tile.tileset) return false;
                    let laserWidth = 4;
                    let laserHeight = 4;
                    let playerRight = player.x + player.body.width / 2;
                    let playerLeft = player.x - player.body.width / 2;
                    let playerBottom = player.y + player.body.height / 2;
                    let playerTop = player.y - player.body.height / 2;
                    let tileWorldX = tile.tilemapLayer.x + tile.pixelX;
                    let tileWorldY = tile.tilemapLayer.y + tile.pixelY;
                    let laserLeft = tileWorldX + (tile.width - laserWidth) / 2;
                    let laserRight = laserLeft + laserWidth;
                    let laserTop = tileWorldY + (tile.height - laserHeight) / 2;
                    let laserBottom = laserTop + laserHeight;
                    return playerRight > laserLeft && playerLeft < laserRight &&
                        playerBottom > laserTop && playerTop < laserBottom;
                },
                this
            );
            collidersChunk.push(overlapMortel);
        }

        if (calqueSol) {
            calqueSol.setCollisionByExclusion([-1], true);
            let colliderSol = this.physics.add.collider(this.player, calqueSol);
            collidersChunk.push(colliderSol);
        }

        this.chunksActifs.push({
            mapData: map,
            calquesVisuels: [calqueFond, calqueSol, calqueMortel],
            colliders: collidersChunk,
            finX: this.prochainX + largeurMap
        });

        let hauteurAleatoire = Phaser.Math.Between(100, 400);
        this.genererMotifPieces(this.prochainX + 300, hauteurAleatoire);

        this.prochainX += largeurMap;
    }

    genererMotifPieces(xBase, yBase) {
        let motifChoisi = Phaser.Math.RND.pick(this.motifsPieces);
        let espacement = 35;

        for (let ligne = 0; ligne < motifChoisi.length; ligne++) {
            for (let col = 0; col < motifChoisi[ligne].length; col++) {
                if (motifChoisi[ligne][col] === 1) {
                    let posX = xBase + (col * espacement);
                    let posY = yBase + (ligne * espacement);
                    this.groupePieces.create(posX, posY, "img_piece").setDepth(5).setScale(0.4);
                }
            }
        }
    }

    collecterPiece(player, piece) {
        piece.disableBody(true, true);
        this.scorePieces += 1;
        this.textePieces.setText("Pièces : " + this.scorePieces);
    }

    preparerMissile() {
        let cibleY = this.player.y;

        let alerte = this.add.image(750, cibleY, "img_alerte").setScrollFactor(0);

        this.tweens.add({
            targets: alerte,
            alpha: 0,
            duration: 200,
            ease: 'Linear',
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                alerte.destroy();
                this.lancerMissile(cibleY);
            }
        });
    }

    lancerMissile(yPosition) {
        let spawnX = this.cameras.main.scrollX + 850;
        let missile = this.groupeMissiles.create(spawnX, yPosition, "img_missile");
        missile.setVelocityX(-400);
        missile.setDepth(15);
        missile.body.setSize(40, 20);
        missile.body.setOffset(10, 20);
    }

    toucherMissile(player, obstacle) {
        this.isGameOver = true;
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.stop();
        this.time.removeAllEvents();
        this.afficherGameOver();
    }

    afficherGameOver() {
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setScrollFactor(0).setDepth(20);

        this.add.text(400, 150, "GAME OVER", {
            fontSize: '64px', fill: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

        this.add.text(400, 250, "Distance : " + this.scoreDistance + " m", {
            fontSize: '32px', fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

        this.add.text(400, 320, "Pièces : " + this.scorePieces, {
            fontSize: '32px', fill: '#FFD700'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

        let boutonRejouer = this.add.text(400, 450, " REJOUER ", {
            fontSize: '40px', fill: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5).setScrollFactor(0).setDepth(20)
            .setInteractive({ useHandCursor: true });

        boutonRejouer.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    toucherMortel(player, obstacle) {
        if (this.isGameOver === true) return;
        this.toucherMissile(player, obstacle);
    }
}