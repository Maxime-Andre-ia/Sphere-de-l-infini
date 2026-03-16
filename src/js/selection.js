// On ne met plus de "var" ici ! Tout est géré dans la classe.

export default class selection extends Phaser.Scene {
  constructor() {
    super({ key: "selection" }); 
  }

  preload() {
    // CORRECTION : J'ai enlevé les "src/" pour les chemins d'accès !
    this.load.image("img_ciel", "assets/sky.png");
    this.load.image("img_plateforme", "assets/platform.png");
    this.load.spritesheet("img_perso", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48
    });
    this.load.image("img_porte1", "assets/door1.png");
    this.load.image("img_porte2", "assets/door2.png");
    this.load.image("img_porte3", "assets/door3.png");
    this.load.image("img_balle", "assets/star.png");
    this.load.image("img_bombe", "assets/bomb.png");
    
  }

  create() {
    // Ajout du décor
    this.add.image(400, 300, "img_ciel");

    // CORRECTION : On met "this." devant groupe_plateformes
    this.groupe_plateformes = this.physics.add.staticGroup();
    this.groupe_plateformes.create(200, 584, "img_plateforme");
    this.groupe_plateformes.create(600, 584, "img_plateforme");
    this.groupe_plateformes.create(600, 450, "img_plateforme");
    this.groupe_plateformes.create(50, 300, "img_plateforme");
    this.groupe_plateformes.create(750, 270, "img_plateforme");

    // Ajout des portes (avec "this.")
    this.porte1 = this.physics.add.staticSprite(600, 414, "img_porte1");
    this.porte2 = this.physics.add.staticSprite(50, 264, "img_porte2");
    this.porte3 = this.physics.add.staticSprite(750, 234, "img_porte3");

    // CORRECTION : On met "this." devant player
    this.player = this.physics.add.sprite(100, 450, "img_perso");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Animations
    this.anims.create({
      key: "anim_tourne_gauche", 
      frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }), 
      frameRate: 10, 
      repeat: -1 
    });
    this.anims.create({
      key: "anim_face",
      frames: [{ key: "img_perso", frame: 4 }],
      frameRate: 20
    });
    this.anims.create({
      key: "anim_tourne_droite",
      frames: this.anims.generateFrameNumbers("img_perso", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    // CORRECTION : On met "this." devant clavier
    this.clavier = this.input.keyboard.createCursorKeys();

    // Collisions
    this.physics.add.collider(this.player, this.groupe_plateformes);
  }

  update() {
    // CORRECTION : Partout ici, il a fallu ajouter "this.clavier" et "this.player"
    if (this.clavier.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("anim_tourne_gauche", true);
    } else if (this.clavier.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("anim_tourne_droite", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("anim_face");
    }

    if (this.clavier.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }

    // Gestion de l'entrée dans les portes avec la touche Espace
    if (Phaser.Input.Keyboard.JustDown(this.clavier.space) == true) {
      if (this.physics.overlap(this.player, this.porte1)) {
        this.scene.start("niveau1");
      }
      if (this.physics.overlap(this.player, this.porte2)) {
        this.scene.start("niveau2");
      }
      if (this.physics.overlap(this.player, this.porte3)) {
        this.scene.start("niveau3");
      }
    }
  }
}