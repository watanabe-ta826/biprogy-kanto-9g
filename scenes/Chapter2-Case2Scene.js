import BaseChapterScene from './BaseChapterScene.js';
import HelpModal from '../HelpModal.js';
import { helpModalContent, gameData } from '../data/game-data.js';

export default class Chapter2_Case2Scene extends BaseChapterScene {
    constructor() {
        super('Chapter2-Case2Scene');
    }

    create() {
        const sceneData = gameData.scenes[this.scene.key];
        super.create(sceneData);

        this.createHelpIcon();
        this.helpModal = new HelpModal(this, helpModalContent);

        const backButton = this.add.text(100, 550, 'CASE選択に戻る', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: '#6c757d',
            padding: { x: 15, y: 10 },
            borderRadius: 5
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(101);

        backButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('Chapter2SelectionScene');
            });
        });
        backButton.on('pointerover', () => backButton.setBackgroundColor('#5a6268'));
        backButton.on('pointerout', () => backButton.setBackgroundColor('#6c757d'));
    }

    createHelpIcon() {
        const helpIcon = this.add.text(this.cameras.main.width - 40, 40, '？', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#17a2b8',
            padding: { x: 12, y: 4 },
            borderRadius: 100
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(101);

        const tooltip = this.add.text(0, 0, 'プロンプト作成のコツ', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '14px',
            fill: '#000',
            backgroundColor: '#f8f9fa',
            padding: { x: 8, y: 4 },
            borderRadius: 3
        }).setOrigin(1.1, 0.5).setVisible(false).setScrollFactor(0).setDepth(300);

        helpIcon.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            helpIcon.setBackgroundColor('#138496');
            tooltip.setPosition(helpIcon.x, helpIcon.y);
            tooltip.setVisible(true);
        });
        helpIcon.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            helpIcon.setBackgroundColor('#17a2b8');
            tooltip.setVisible(false);
        });
        helpIcon.on('pointerdown', () => {
            if (this.scene.isPaused()) return;
            tooltip.setVisible(false);
            this.helpModal.show();
        });
    }

    update(time, delta) {
        super.update(time, delta);
        if (this.helpModal && this.helpModal.modal.visible) {
            this.helpModal.update();
        }
    }
}
