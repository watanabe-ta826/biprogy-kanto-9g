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
        const modalHeight = 420; // 高さを420に増やす
        const modalX = (this.sys.game.config.width - modalWidth) / 2;
        const modalY = (this.sys.game.config.height - modalHeight) / 2;

        const background = this.add.graphics();
        background.fillStyle(0x2c3e50, 0.95);
        background.lineStyle(3, 0xf1c40f, 1);
        background.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 15);
        background.strokeRoundedRect(modalX, modalY, modalWidth, modalHeight, 15);

        // タイトル
        this.add.text(modalX + modalWidth / 2, modalY + 40, `第${this.resultData.chapterKey.slice(-1)}章 結果`, { // Y座標を少し上に
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '32px',
            fill: '#f1c40f'
        }).setOrigin(0.5);

        let currentY = modalY + 100; // エンディングテキストまたは結果表示の開始Y座標

        // エンディングテキスト表示 (あれば)
        if (this.resultData.endingText) {
            this.add.text(modalX + modalWidth / 2, currentY, this.resultData.endingText, {
                fontFamily: 'Meiryo, sans-serif',
                fontSize: '36px',
                fill: '#ffd700', // Gold color
                align: 'center',
                stroke: '#000000',
                strokeThickness: 5,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000',
                    blur: 5,
                    stroke: true,
                    fill: true
                }
            }).setOrigin(0.5);
            currentY += 65; // エンディングテキストの高さ分を考慮してY座標をずらす

            if (this.resultData.endingText === 'ハッピーエンド') {
                this.createConfettiEffect();
            }
        }

        // 結果表示
        const accuracyPercentage = (this.resultData.accuracy * 100).toFixed(1);
        const resultText = `正解数: ${this.resultData.correctAnswers} / ${this.resultData.totalQuizzes}\n正答率: ${accuracyPercentage}%`;
        this.add.text(modalX + modalWidth / 2, currentY + 15, resultText, { // currentY + 15 で少しスペースを空ける
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '24px',
            fill: '#ecf0f1',
            align: 'center'
        }).setOrigin(0.5);
        currentY += 75; // 結果表示の高さ分を考慮してY座標をずらす

        // --- ボタンのスタイル定義 ---
        const buttonStyle = {
            fontFamily: 'Arial, sans-serif',
            fontSize: '22px',
            fill: '#ffffff',
            padding: { x: 20, y: 10 },
            borderRadius: 8,
        };

        // --- 「もう一度挑戦」ボタン ---
        const retryButton = this.add.text(modalX + modalWidth / 2, currentY + 25, 'もう一度挑戦', { // currentY + 25 で少しスペースを空ける
            ...buttonStyle,
            backgroundColor: '#3498db',
            shadow: { offsetX: 0, offsetY: 4, color: '#2980b9', fill: true, blur: 4 }
        }).setOrigin(0.5).setInteractive();

        // --- 「章選択へ」ボタン ---
        const backButton = this.add.text(modalX + modalWidth / 2, currentY + 85, '章選択へ', { // currentY + 85 で少しスペースを空ける
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

    createConfettiEffect() {
        const colors = [0xffd700, 0xff69b4, 0x00bfff, 0x32cd32, 0xff4500, 0x9400d3];
        const textureKey = 'confetti_particle';

        // 8x16の白い長方形のテクスチャを動的に生成
        if (!this.textures.exists(textureKey)) {
            const graphics = this.make.graphics();
            graphics.fillStyle(0xffffff);
            graphics.fillRect(0, 0, 8, 16);
            graphics.generateTexture(textureKey, 8, 16);
            graphics.destroy();
        }

        const emitter = this.add.particles(0, 0, textureKey, {
            lifespan: 4000,
            speedY: { min: 100, max: 300 },
            speedX: { min: -150, max: 150 },
            gravityY: 200,
            quantity: 2,
            scale: { start: 1, end: 0.5 },
            rotate: { start: 0, end: 360 },
            tint: colors,
            frequency: 50,
            emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(0, -20, this.sys.game.config.width, 20) }
        });

        // 5秒後にエミッターの放出を停止
        this.time.delayedCall(5000, () => {
            // stop()を呼ぶと新しいパーティクルは生成されなくなる
            emitter.stop();
            // 既存のパーティクルがすべて消えるであろう時間(lifespan)が経過した後に
            // エミッター自体をシーンから破棄する
            this.time.delayedCall(4000, () => {
                emitter.destroy();
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
