import BaseScene from './BaseScene.js';

export default class BaseChapterScene extends BaseScene {
    constructor(sceneKey) {
        super(sceneKey);
    }

    create(sceneData) {
        super.create(sceneData);

        // 戻るボタン
        const backButton = this.add.text(940, 20, '章選択に戻る', {
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: '#333',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('ChapterSelectionScene');
        });
    }
}