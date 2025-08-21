import Phaser from 'phaser';
import { introScenario } from '../data/game-data.js';

export default class ChapterSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChapterSelectionScene' });
    }

    preload() {
        // 背景画像を読み込む（もし読み込まれていなければ）
        if (!this.textures.exists('hub_background')) {
            this.load.image('hub_background', 'img/hub_background.jpg');
        }
    }

    create() {
        // 背景画像を表示
        this.add.image(480, 300, 'hub_background').setScale(1);

        // タイトルテキスト
        this.add.text(480, 100, '章選択', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '50px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5);

        // --- ボタンを作成 ---
        const buttonYStart = 200;
        const buttonYStep = 80;

        // 第1章ボタン
        this.createChapterButton(480, buttonYStart, '第1章: AIって怖いもの？', 'Chapter1-1Scene');

        // 第2章ボタン
        this.createChapterButton(480, buttonYStart + buttonYStep, '第2章: 村人のお悩みをAIで解決', 'Chapter2-1Scene');

        // 第3章ボタン
        this.createChapterButton(480, buttonYStart + buttonYStep * 2, '第3章: AIの落とし穴', 'Chapter3-1Scene');

        // イントロをもう一度ボタン
        this.createIntroButton(480, buttonYStart + buttonYStep * 3.5, 'イントロをもう一度');
    }

    createChapterButton(x, y, text, sceneKey) {
        const button = this.add.text(x, y, text, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#3498db',
            padding: { x: 20, y: 10 },
            borderRadius: 5
        }).setOrigin(0.5);

        button.setInteractive();
        button.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            button.setBackgroundColor('#2980b9');
        });
        button.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            button.setBackgroundColor('#3498db');
        });
        button.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(sceneKey);
            });
        });
    }

    createIntroButton(x, y, text) {
        const button = this.add.text(x, y, text, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#95a5a6',
            padding: { x: 20, y: 10 },
            borderRadius: 5
        }).setOrigin(0.5);

        button.setInteractive();
        button.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            button.setBackgroundColor('#7f8c8d');
        });
        button.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            button.setBackgroundColor('#95a5a6');
        });
        button.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('StoryScene', {
                    content: introScenario,
                    nextScene: 'ChapterSelectionScene'
                });
            });
        });
    }
}