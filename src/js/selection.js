
export default class selection extends Phaser.Scene {
  constructor() {
    super({ key: "selection" }); 
  }

  preload() {
    
this.load.image("img_perso", "src/assets/coffrec.png"); 

this.load.image("img_ciel", "src/assets/décors2d.png");

this.load.image("img_bombe", "src/assets/feu_mortelm.png"); 
this.load.image("img_item", "src/assets/image_inversiond.png");
this.load.image("img_porte1", "src/assets/bout_laserm.png");
this.load.image("img_porte2", "src/assets/bout_laserm.png");
this.load.image("img_porte3", "src/assets/bout_laserm.png");
    
  }

  create() {
    this.add.image(400, 300, "img_ciel");

    this.groupe_plateformes = this.physics.add.staticGroup();
    this.groupe_plateformes.create(200, 584, "img_plateforme");
    this.groupe_plateformes.create(600, 584, "img_plateforme");
    this.groupe_plateformes.create(600, 450, "img_plateforme");
    this.groupe_plateformes.create(50, 300, "img_plateforme");
    this.groupe_plateformes.create(750, 270, "img_plateforme");

    this.porte1 = this.physics.add.staticSprite(600, 414, "img_porte1");
    this.porte2 = this.physics.add.staticSprite(50, 264, "img_porte2");
    this.porte3 = this.physics.add.staticSprite(750, 234, "img_porte3");

    this.player = this.physics.add.sprite(100, 450, "img_perso");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

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

    this.clavier = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(this.player, this.groupe_plateformes);
  }

  update() {
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