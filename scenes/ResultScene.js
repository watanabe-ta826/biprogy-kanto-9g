import BaseScene from './BaseScene.js';
import { gameData } from '../data/game-data.js';

export default class ResultScene extends BaseScene {
    constructor() {
        super('ResultScene');
        this.resultData = null;
    }

    init(data) {
        this.resultData = data;
    }

    create() {
        // 背景を暗くする
        this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x000000, 0.7).setOrigin(0);

        const modalWidth = 500;
        const modalHeight = 350;
        const modalX = (this.sys.game.config.width - modalWidth) / 2;
        const modalY = (this.sys.game.config.height - modalHeight) / 2;

        const background = this.add.graphics();
        background.fillStyle(0x2c3e50, 0.95);
        background.lineStyle(3, 0xf1c40f, 1);
        background.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 15);
        background.strokeRoundedRect(modalX, modalY, modalWidth, modalHeight, 15);

        // タイトル
        this.add.text(modalX + modalWidth / 2, modalY + 50, `第${this.resultData.chapterKey.slice(-1)}章 結果`, {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '32px',
            fill: '#f1c40f'
        }).setOrigin(0.5);

        // 結果表示
        const accuracyPercentage = (this.resultData.accuracy * 100).toFixed(1);
        const resultText = `正解数: ${this.resultData.correctAnswers} / ${this.resultData.totalQuizzes}\n正答率: ${accuracyPercentage}%`;
        this.add.text(modalX + modalWidth / 2, modalY + 130, resultText, {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '24px',
            fill: '#ecf0f1',
            align: 'center'
        }).setOrigin(0.5);

        // --- ボタンのスタイル定義 ---
        const buttonStyle = {
            fontFamily: 'Arial, sans-serif',
            fontSize: '22px',
            fill: '#ffffff',
            padding: { x: 20, y: 10 },
            borderRadius: 8,
        };

        // --- 「もう一度挑戦」ボタン ---
        const retryButton = this.add.text(modalX + modalWidth / 2, modalY + 240, 'もう一度挑戦', {
            ...buttonStyle,
            backgroundColor: '#3498db',
            shadow: { offsetX: 0, offsetY: 4, color: '#2980b9', fill: true, blur: 4 }
        }).setOrigin(0.5).setInteractive();

        // --- 「章選択へ」ボタン ---
        const backButton = this.add.text(modalX + modalWidth / 2, modalY + 300, '章選択へ', {
            ...buttonStyle,
            backgroundColor: '#95a5a6',
            shadow: { offsetX: 0, offsetY: 4, color: '#7f8c8d', fill: true, blur: 4 }
        }).setOrigin(0.5).setInteractive();

        // --- ボタンのインタラクション ---
        retryButton.on('pointerdown', () => this.retryChapter());
        backButton.on('pointerdown', () => this.backToSelection());

        [retryButton, backButton].forEach(button => {
            const originalColor = button.style.backgroundColor;
            const hoverColor = Phaser.Display.Color.HexStringToColor(originalColor).lighten(10).rgba;
            button.on('pointerover', () => {
                this.game.canvas.style.cursor = 'pointer';
                button.setBackgroundColor(hoverColor);
            });
            button.on('pointerout', () => {
                this.game.canvas.style.cursor = 'default';
                button.setBackgroundColor(originalColor);
            });
        });
    }

    retryChapter() {
        const chapterInfo = gameData.chapters[this.resultData.chapterKey];
        const completedQuizzes = this.registry.get('completedQuizzes') || [];
        
        const quizzesInChapter = [];
        chapterInfo.scenes.forEach(sceneKey => {
            const sceneData = gameData.scenes[sceneKey];
            if (sceneData && sceneData.entities) {
                sceneData.entities.forEach(entity => {
                    if (entity.type === 'NPC' && entity.quiz) {
                        quizzesInChapter.push(`${sceneKey}_${entity.name}`);
                    }
                });
            }
        });

        this.registry.set('correctAnswers', 0);
        
        const newCompletedQuizzes = completedQuizzes.filter(id => !quizzesInChapter.includes(id));
        this.registry.set('completedQuizzes', newCompletedQuizzes);

        const firstScene = chapterInfo.scenes[0];
        this.scene.start(firstScene);
    }

    backToSelection() {
        this.scene.start('ChapterSelectionScene');
    }

    update() {
        // BaseSceneのupdateは不要
    }
}
