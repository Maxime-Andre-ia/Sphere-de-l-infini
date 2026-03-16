export default class GameOver extends Phaser.Scene {
    constructor() {
        super("GameOver");
    }

    preload() {
        // pas de préchargement nécessaire
    }

    create() {
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'GAME OVER', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);

        const restartButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'Recommencer', { fontSize: '32px', fill: '#ffffff', backgroundColor: '#888888', padding: { x: 10, y: 5 } })
            .setOrigin(0.5)
            .setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.start('selection');
        });
    }
}
