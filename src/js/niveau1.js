import * as fct from "/src/js/fonctions.js";

export default class niveau1 extends Phaser.Scene {
    constructor() {
        super({ key: "niveau1" });
    }

    preload() {
        //map 2 mathis
        this.load.tilemapTiledJSON("map_ahhh", "src/assets/Map_finale_ahhh.tmj");
        this.load.image("img_background", "src/assets/tileset_background.webp");
        this.load.image("img_arbre", "src/assets/tileset_arbre.png");
        this.load.image("img_cat_ahhh", "src/assets/tileset_cat.png");
        this.load.image("img_67", "src/assets/tileset_67.png");
        this.load.image("img_rock", "src/assets/tileset_rock.png");
        this.load.image("img_monster", "src/assets/tileset_monster.png");
        this.load.image("img_malboro", "src/assets/tileset_clope_de_merde.png");
        this.load.image("img_good", "src/assets/tileset_good.png");
        this.load.image("img_fortnite", "src/assets/tileset_fortnite.png");
        this.load.image("img_decor_bleu", "src/assets/tileset_decor_bleu.png");
        this.load.image("img_mur", "src/assets/tileset_mur.png");
        this.load.image("img_rocket", "src/assets/tileset_rocket.png");
        this.load.image("img_djilsi", "src/assets/tileset_djilsi.png");
        this.load.image("img_barriere1", "src/assets/tileset_barriere1.png");
        this.load.image("img_barriere2", "src/assets/tileset_barriere2.png");
        this.load.image("img_barriere3", "src/assets/tileset_barriere3.png");
        this.load.image("img_mrincredible_stg", "src/assets/tileset_mrincrediblestages.png");
        this.load.image("img_gothgirl", "src/assets/tileset_gothgirl.png");
        this.load.image("img_panneau", "src/assets/tileset_panneau.png");
        this.load.image("img_ahhh", "src/assets/tileset_ahhh.png");
        this.load.image("img_butt", "src/assets/tileset_butt.png");
        this.load.image("img_monster2", "src/assets/tileset_monster.png");
        this.load.image("img_benoit_darties", "src/assets/tileset_benoit_darties.png");

        // map 1 Mathis
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

        // map 2 quentin
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

        //map 1 quentin
        this.load.tilemapTiledJSON("map_quentin", "src/assets/lab.tmj");

        this.load.audio("sin_missile", "src/assets/bruitmissile.wav");
        this.load.audio("sin_piece", "src/assets/bruitpiece.wav");
    }

     
  create() {
    //1.Creation de la map.
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 704); // Définit les limites physiques du monde :
    this.prochainX = 0;     // Position X où le prochain chunk de map sera généré
    this.listeMaps = ["map_quentin", "map_hassoul", "map_mathis", "map_ahhh"]; // on charge les maps
    this.chunksActifs = [];
    this.isGameOver = false;
    this.isGravityInverted = false;
    this.puissanceJetpack = -200;     // Force appliquée vers le haut quand le jetpack est activé
    this.scorePieces = 0;
    this.scoreDistance = 0;

    // 2.Création du ptit bonhomme.
    this.player = this.physics.add.sprite(100,250, "img_perso").setDepth(8); // Crée le sprite du joueur avec le moteur physique, positionné à (100, 250)
    this.player.setCollideWorldBounds(true); // Le joueur ne peut pas sortir de la map défini
    this.player.setGravityY(800); 
    this.player.body.setSize(15, 30);
    this.player.body.setOffset(15, 45);

    // 3.Création des animations
    if (!this.anims.exists('courir')) { // On vérifie si elle existe déjà
        this.anims.create({
            key: 'courir',
            frames: this.anims.generateFrameNumbers('img_perso', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }
    this.player.play('courir'); //Lance l'animation de "course"

    // 4.Création des Groupes (Missiles, Pièces, etc.)
    this.groupePieces = this.physics.add.group({ allowGravity: false });
    this.groupeMissiles = this.physics.add.group({ allowGravity: false });
    this.motifsPieces = [[[1,1,1,1,1,1,1],[1,1,1,1,1,1,1]]];

    // 5.Création de l'interface
    this.textePieces   = this.add.text(16, 16, "Pièces : 0",    { fontSize: '24px', fill: '#FFD700' }).setScrollFactor(0).setDepth(10); //score des pièces
    this.texteDistance = this.add.text(16, 50, "Distance : 0 m", { fontSize: '24px', fill: '#FFFFFF' }).setScrollFactor(0).setDepth(10); //score du joueur 

    // 6. Création des chunks (6 dès le départ)
    this.ajouterChunk(); 
    this.ajouterChunk();
    this.ajouterChunk();
    this.ajouterChunk();
    this.ajouterChunk();
    this.ajouterChunk();

    // 7.Création des Collisions 
    this.physics.add.overlap(this.player, this.groupePieces, this.collecterPiece, null, this); //on appelle collecterPiece
    this.physics.add.overlap(this.player, this.groupeMissiles, this.toucherMissile, null, this); //on appelle toucherMissile

    // Item d'inversion
    this.itemInversion = this.physics.add.sprite(800, 300, "img_item").setDepth(15);
    this.itemInversion.body.allowGravity = false;
    this.physics.add.overlap(this.player, this.itemInversion, this.inverserGravite, null, this); //on appelle inverserGravite

    // 8. Création des touches et de la caméra
    this.clavier = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.player); // on suit dude

    // 9. Création des sons et des effets
    this.missileSound = this.sound.add("sin_missile", { volume: 0.5 });
    this.pieceSound   = this.sound.add("sin_piece",   { volume: 0.5 });
    
    //  animations des étoiles
    this.particlesJetpack = this.add.particles(0, 0, "img_star", {
        speed: { min: 50, max: 100 },
        angle: { min: 80, max: 100 },
        scale: { start: 0.8, end: 0 },
        lifespan: 5000,
        frequency: 50,
        emitting: false
    }).setDepth(15);

    // 10. On appelle les missiles toutes les 10 secondes
    this.time.addEvent({ delay: 10000, callback: this.preparerMissile, callbackScope: this, loop: true });
}


    update() {
        if (this.isGameOver === true) return;

        let vitesse = 200 + Math.floor(this.player.x / 500) * 2; //Gagne +2px/s tous les 500px parcourus
        this.player.setVelocityX(vitesse);

        if (this.clavier.up.isDown) {
            if (this.isGravityInverted === false) {
                this.player.setVelocityY(this.puissanceJetpack);
            } else {
                this.player.setVelocityY(-this.puissanceJetpack);
            }
            this.particlesJetpack.emitParticleAt(this.player.x, this.player.y + 20);// Émet une particule à 20px sous le joueur

        } else {
            this.particlesJetpack.stop();
        }
        
        if (this.prochainX < this.player.x + 6400) { //On génère un chunk à 6400 px de dude
            this.ajouterChunk();
        }

        //Suppression des vieux chunk
        if (this.chunksActifs.length > 0) {
            let plusVieuxChunk = this.chunksActifs[0];
            if (plusVieuxChunk.finX < this.player.x - 1600) {
                plusVieuxChunk.colliders.forEach(collider => { 
                    if (collider) this.physics.world.removeCollider(collider); // on supprime tous les colliders du vieux chunk

                });
                plusVieuxChunk.calquesVisuels.forEach(calque => {
                    if (calque) calque.destroy();
                });
                plusVieuxChunk.mapData.destroy(); // Détruit la donnée de la tilemap elle-même
                this.chunksActifs.shift();
            }
        }

        //Nettoyage des pièces et des missiles 
        this.groupePieces.getChildren().forEach(piece => {
            if (piece.x < this.player.x - 800) piece.destroy();
        });

        this.groupeMissiles.getChildren().forEach(missile => {
            if (missile.x < this.cameras.main.scrollX - 100) missile.destroy();
        });

        //MAJ du score en continu
        this.scoreDistance = Math.floor((this.player.x - 100) / 100);
        this.texteDistance.setText("Distance : " + this.scoreDistance + " m");
    }

    inverserGravite(player, item) {
        item.disableBody(true, true); 
    // - true (1er) : désactive le corps physique (plus de collision)
    // - true (2ème) : rend le sprite invisible
        this.isGravityInverted = true;
        this.player.setFlipY(true); 
        this.player.setGravityY(-1000);

        this.time.delayedCall(5000, () => {
            this.isGravityInverted = false;
            this.player.setFlipY(false);
            this.player.setGravityY(800);
        });
    }

    ajouterChunk() {
        let mapAleatoire = Phaser.Math.RND.pick(this.listeMaps); //On prend une des 4 maps random
        let map = this.make.tilemap({ key: mapAleatoire });

        let tousLesTilesets = [];
        let nomFond, nomSol, nomMortel;

        let configMortel = { laserWidth: 4, laserHeight: 4 }; // hitbox des lasers


        //on associe chaque tileset à son nom dans preload()
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
        } else if (mapAleatoire === "map_ahhh") {
            let ts_background = map.addTilesetImage("tileset_background", "img_background");
            let ts_arbre = map.addTilesetImage("tileset_arbre", "img_arbre");
            let ts_cat = map.addTilesetImage("tileset_cat", "img_cat_ahhh");
            let ts_67 = map.addTilesetImage("tileset_67", "img_67");
            let ts_rock = map.addTilesetImage("tileset_rock", "img_rock");
            let ts_monster = map.addTilesetImage("tileset_monster", "img_monster");
            let ts_malboro = map.addTilesetImage("tileset_malboro", "img_malboro");
            let ts_good = map.addTilesetImage("tileset_good", "img_good");
            let ts_fortnite = map.addTilesetImage("tileset_fortnite", "img_fortnite");
            let ts_decor_bleu = map.addTilesetImage("tileset_decor_bleu", "img_decor_bleu");
            let ts_mur = map.addTilesetImage("tileset_mur", "img_mur");
            let ts_rocket = map.addTilesetImage("tileset_rocket", "img_rocket");
            let ts_djilsi = map.addTilesetImage("tileset_djilsi", "img_djilsi");
            let ts_barriere1 = map.addTilesetImage("tileset_barriere1", "img_barriere1");
            let ts_barriere2 = map.addTilesetImage("tileset_barriere2", "img_barriere2");
            let ts_barriere3 = map.addTilesetImage("tileset_barrire3", "img_barriere3");
            let ts_mrstages = map.addTilesetImage("tileset_mrincrediblestages", "img_mrincredible_stg");
            let ts_gothgirl = map.addTilesetImage("tileset_gothgirl", "img_gothgirl");
            let ts_panneau = map.addTilesetImage("tileset_panneau", "img_panneau");
            let ts_ahhh = map.addTilesetImage("tileset_ahhh", "img_ahhh");
            let ts_butt = map.addTilesetImage("tileset_butt", "img_butt");
            let ts_monster2 = map.addTilesetImage("tileset_monster", "img_monster2");
            let ts_benoit = map.addTilesetImage("tileset_benoit_darties", "img_benoit_darties");

            tousLesTilesets = [
                ts_background, ts_arbre, ts_cat, ts_67, ts_rock,
                ts_monster, ts_malboro, ts_good, ts_fortnite, ts_decor_bleu,
                ts_mur, ts_rocket, ts_djilsi, ts_barriere1, ts_barriere2,
                ts_barriere3, ts_mrstages, ts_gothgirl, ts_panneau, ts_ahhh,
                ts_butt, ts_monster2, ts_benoit
            ];

            // Calques décoratifs (visuels uniquement, pas de collision)
            map.createLayer("Background front", tousLesTilesets, this.prochainX, 0)?.setDepth(2);
            map.createLayer("Background incredible", tousLesTilesets, this.prochainX, 0)?.setDepth(2);
            map.createLayer("background front 2", tousLesTilesets, this.prochainX, 0)?.setDepth(2);
            map.createLayer("67777", tousLesTilesets, this.prochainX, 0)?.setDepth(2);

            nomFond = "Background";
            nomSol = null; // seul calque avec des tiles (obstacles + sol)
            nomMortel = "Trucs qui tuent";              // "Armes qui tuent" est vide dans cette map  
        }

        // On choppe la largeur en pixels de la map pour savoir où placer le prochain chunk
        let largeurMap = map.widthInPixels;
        if (!largeurMap || largeurMap === 0) {
            console.warn("widthInPixels = 0, on force 2000px");
            largeurMap = 2000;
        }

        // Créations des calcques principaux
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
                
                // on détermine si l'overlap doit déclencher la mort
                (player, tile) => {
                    if (tile.index === -1 || tile.index === 0) return false;
                    if (!tile.tileset) return false;
                    //on détermine la hitboxe du laser au centre de la tuile
                    let laserWidth = 4;
                    let laserHeight = 4;

                    //on calcul les bords de la hitbox du joueur
                    let playerRight = player.x + player.body.width / 2;
                    let playerLeft = player.x - player.body.width / 2;
                    let playerBottom = player.y + player.body.height / 2;
                    let playerTop = player.y - player.body.height / 2;

                    //on calcul de la position de la tuile
                    let tileWorldX = tile.tilemapLayer.x + tile.pixelX;
                    let tileWorldY = tile.tilemapLayer.y + tile.pixelY;
                    let laserLeft = tileWorldX + (tile.width - laserWidth) / 2;
                    let laserRight = laserLeft + laserWidth;
                    let laserTop = tileWorldY + (tile.height - laserHeight) / 2;
                    let laserBottom = laserTop + laserHeight;

                    // on return true si les deux hitbox rentrent en contact
                    return playerRight > laserLeft && playerLeft < laserRight &&
                        playerBottom > laserTop && playerTop < laserBottom;
                },
                this
            );
            collidersChunk.push(overlapMortel);
        }

        //pour le calque du sol 
        if (calqueSol) {
            calqueSol.setCollisionByExclusion([-1], true);
            let colliderSol = this.physics.add.collider(this.player, calqueSol);
            collidersChunk.push(colliderSol);

            // map_app -> tout le sol est mortel
            if (mapAleatoire === "map_ahhh") {
                let overlapMortelAhhh = this.physics.add.overlap(
                    this.player,
                    calqueSol,
                    () => {
                        if (!this.isGameOver) {
                            this.isGameOver = true;
                            this.physics.pause();
                            this.player.setTint(0xff0000); // dude en rouge
                            this.player.anims.stop();
                            this.time.removeAllEvents();
                            this.afficherGameOver();
                        }
                    },
                    (player, tile) => tile.index !== -1 && tile.tileset !== null,
                    this
                );
                collidersChunk.push(overlapMortelAhhh);
            }
        }

        this.chunksActifs.push({ // on ajoute ce chunk au tableau de suivi avec toutes ses données pour le nettoyer

            mapData: map,
            calquesVisuels: [calqueFond, calqueSol, calqueMortel],
            colliders: collidersChunk,
            finX: this.prochainX + largeurMap
        });

        let hauteurAleatoire = Phaser.Math.Between(100, 400); //on génère des pièces à collecter à une hauteur random dans ce chunk
        this.genererMotifPieces(this.prochainX + 300, hauteurAleatoire);

        this.prochainX += largeurMap;
    }

    genererMotifPieces(xBase, yBase) {
        let motifChoisi = Phaser.Math.RND.pick(this.motifsPieces); //On choisit un motif de pièce random
        let espacement = 35;

        for (let ligne = 0; ligne < motifChoisi.length; ligne++) {
            for (let col = 0; col < motifChoisi[ligne].length; col++) {
                if (motifChoisi[ligne][col] === 1) {
                    let posX = xBase + (col * espacement);
                    let posY = yBase + (ligne * espacement);
                    this.groupePieces.create(posX, posY, "img_piece").setDepth(5).setScale(0.4); // on crée la pièce dans le groupe
                }
            }
        }
    }

    //quand on touche une pièce :
    collecterPiece(player, piece) {
        piece.disableBody(true, true); //elle disparait
        this.scorePieces += 1;
        this.textePieces.setText("Pièces : " + this.scorePieces);
    }

    //on balance le missile
    preparerMissile() {
    let cibleY = this.player.y;//à la position y du dude
    this.lancerMissile(cibleY);
}

    lancerMissile(yPosition) {
        let spawnX = this.cameras.main.scrollX + 850;
        let missile = this.groupeMissiles.create(spawnX, yPosition, "img_missile");
        missile.setVelocityX(-400); //vitesse négative pour aller vers la gauche
        missile.setDepth(15);
        missile.body.setSize(40, 20); //hitbox du missile
        missile.body.setOffset(10, 20);
    }

    //quand on touche le missile
    toucherMissile(player, obstacle) {
        this.isGameOver = true;
        this.physics.pause();
        this.player.setTint(0xff0000); // dude en rouge
        this.player.anims.stop();
        this.time.removeAllEvents(); //on supprime tous les timers actifs
        this.afficherGameOver();//on affiche GameOver
    }

    // on affiche le GameOver
    afficherGameOver() {
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setScrollFactor(0).setDepth(20); //centré en (400, 300) avec une taille de 800x600px

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

        //rappelle create(), recharge les chunk, etc...
        boutonRejouer.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    // sécurité quand le joueur touche un élément mortel
    toucherMortel(player, obstacle) {
        if (this.isGameOver === true) return;
        this.toucherMissile(player, obstacle);//sinon on utilise toucherMissile ( qui gère la mort de tout) 
    }
}