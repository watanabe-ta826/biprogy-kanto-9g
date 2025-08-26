import BaseScene from './BaseScene.js';

export default class BaseChapterScene extends BaseScene {
    constructor(sceneKey) {
        super(sceneKey);
    }

    create(sceneData) {
        super.create(sceneData);

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            // Display area name
            if (sceneData.displayName) {
                const areaNameText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, sceneData.displayName, {
                    fontFamily: 'serif',
                    fontSize: '48px',
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4,
                    shadow: {
                        offsetX: 2,
                        offsetY: 2,
                        color: '#000',
                        blur: 4,
                        stroke: true,
                        fill: true
                    }
                }).setOrigin(0.5).setScrollFactor(0).setAlpha(0).setDepth(300);

                this.tweens.add({
                    targets: areaNameText,
                    alpha: 1,
                    duration: 1000,
                    ease: 'Power2',
                    yoyo: true,
                    delay: 500,
                    onComplete: () => {
                        areaNameText.destroy();
                    }
                });
            }
        });

        // 戻るボタン
        const backButton = this.add.text(940, 20, '章選択に戻る', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#95a5a6',
            padding: { x: 12, y: 8 },
            borderRadius: 8,
            shadow: { offsetX: 0, offsetY: 3, color: '#768687', fill: true, blur: 3 }
        }).setOrigin(1, 0).setInteractive().setScrollFactor(0);

        backButton.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            backButton.setBackgroundColor('#aab7b8');
        });

        backButton.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            backButton.setBackgroundColor('#95a5a6');
        });

        backButton.on('pointerdown', () => {
            this.scene.start('ChapterSelectionScene');
        });
    }
}