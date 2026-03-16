
export default class niveau1 extends Phaser.Scene {
  // constructeur de la classe
  constructor() {
    super({
      key: "niveau1" //  ici on précise le nom de la classe en tant qu'identifiant
    });
  }
  preload() {
  }

  create() {
    
    
    this.add.image(400, 300, "img_ciel");
    this.groupe_plateformes = this.physics.add.staticGroup();
    this.groupe_plateformes.create(200, 584, "img_plateforme");
    this.groupe_plateformes.create(600, 584, "img_plateforme");
    // ajout d'un texte distintcif  du niveau
    this.add.text(400, 100, "Vous êtes dans le niveau 1", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "22pt"
    });

    this.porte_retour = this.physics.add.staticSprite(100, 550, "img_porte1");
    // Ajout d'une porte à droite pour passer directement au niveau 2
    this.porte_suivante = this.physics.add.staticSprite(700, 550, "img_porte2");

    this.player = this.physics.add.sprite(100, 450, "img_perso");
    this.player.refreshBody();
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.clavier = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(this.player, this.groupe_plateformes);

    this.groupe_cibles = this.physics.add.group();
this.physics.add.collider(this.player, this.groupe_cibles, this.hitBomb, null, this);

    this.groupe_balles = this.physics.add.group();

this.boutonFeu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);


this.physics.add.collider(this.groupe_cibles, this.groupe_plateformes);
this.groupe_cibles.create(600, 100, "img_bombe"); 

// Destruction lors du contact
this.physics.add.overlap(this.groupe_balles, this.groupe_cibles, function(la_balle, la_cible) {
    la_balle.destroy(); 
    la_cible.destroy(); 
    this.faireTomberUneBombe();
}, null, this);


  }

  hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('anim_face');
    this.scene.start("GameOver");
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
      if (this.physics.overlap(this.player, this.porte_retour)) {
        this.scene.start("selection");
      }
      // Si le joueur est devant la porte suivante, on passe au niveau 2
      if (this.physics.overlap(this.player, this.porte_suivante)) {
        this.scene.start("niveau2");
      }
    }
    if (Phaser.Input.Keyboard.JustDown(this.boutonFeu)) {
    this.tirer();
    }
  }
  tirer() {
    // On crée la balle à la position du joueur (x, y)
    var une_balle = this.groupe_balles.create(this.player.x, this.player.y, "img_balle");

    // On lui donne une vitesse horizontale
    // Si le joueur regarde à droite (velocity > 0) ou à gauche, on adapte
    if (this.player.body.velocity.x >= 0) {
        une_balle.setVelocityX(400); // Tir vers la droite
    } else {
        une_balle.setVelocityX(-400); // Tir vers la gauche
    }

    // Physique de la balle
    une_balle.setGravityY(-300); // On annule la gravité pour qu'elle tire droit
    
    // On détruit la balle si elle sort de l'écran
    une_balle.setCollideWorldBounds(true);
    une_balle.body.onWorldBounds = true;
    une_balle.body.world.on('worldbounds', (body) => {
        if (body.gameObject === une_balle) {
            une_balle.destroy();
        }
    });
    
}
// Dans niveau1.js, ajoute cette nouvelle méthode :

faireTomberUneBombe() {
    // On prend une marge (ex: entre 50 et 750) pour ne pas qu'elle apparaisse à moitié dehors
    var x = Phaser.Math.Between(50, 750);
    var y = 0; // Tout en haut de l'écran

    // les collisions avec le sol et avec les futures balles !
    var nouvelle_bombe = this.groupe_cibles.create(x, y, "img_bombe");

    // 3. On lui donne des propriétés physiques
    nouvelle_bombe.setBounce(0.8); // Elle rebondit bien
    nouvelle_bombe.setCollideWorldBounds(true); // Elle ne traverse pas le sol

    // pour qu'elle ne tombe pas tout droit comme une pierre.
    nouvelle_bombe.setVelocityX(Phaser.Math.Between(-150, 150));
    
    // Note : Pas besoin de définir la gravité, elle l'hérite de la config globale du jeu.
}
}
