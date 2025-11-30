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
        const modalHeight = 420;
        const modalX = (this.sys.game.config.width - modalWidth) / 2;
        const modalY = (this.sys.game.config.height - modalHeight) / 2;

        const background = this.add.graphics();
        background.fillStyle(0x2c3e50, 0.95);
        background.lineStyle(3, 0xf1c40f, 1);
        background.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 15);
        background.strokeRoundedRect(modalX, modalY, modalWidth, modalHeight, 15);

        // タイトル
        this.add.text(modalX + modalWidth / 2, modalY + 40, `第${this.resultData.chapterKey.slice(-1)}章 結果`, {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '32px',
            fill: '#f1c40f'
        }).setOrigin(0.5);

        // chapter1またはchapter3の場合のみアニメーション演出
        if (this.resultData.chapterKey === 'chapter1' || this.resultData.chapterKey === 'chapter3') {
            this.createAnimatedResult(modalX, modalY, modalWidth, modalHeight);
        } else {
            this.createStaticResult(modalX, modalY, modalWidth, modalHeight);
        }
    }

    // アニメーション付きの結果表示
    createAnimatedResult(modalX, modalY, modalWidth, modalHeight) {
        // 3. エンディングテキストの準備
        let endingText;
        if (this.resultData.endingText) {
            endingText = this.add.text(modalX + modalWidth / 2, modalY + 100, this.resultData.endingText, { // Y座標をmodalY + 100に調整
                fontFamily: 'Meiryo, sans-serif', fontSize: '36px', fill: '#ffd700', align: 'center', stroke: '#000000', strokeThickness: 5,
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
            }).setOrigin(0.5).setAlpha(0).setScale(0.3);
        }

        // 1. カウントアップの準備
        const targetAccuracy = this.resultData.accuracy;
        const targetCorrect = this.resultData.correctAnswers;
        const counter = { correct: 0, accuracy: 0 };

        const resultText = this.add.text(modalX + modalWidth / 2, modalY + 180, '正解数: 0 / 0\n正答率: 0.0%', { // Y座標は据え置き
            fontFamily: 'Meiryo, sans-serif', fontSize: '24px', fill: '#ecf0f1', align: 'center'
        }).setOrigin(0.5);

        // 2. プログレスバーの準備
        const progressBarWidth = modalWidth - 100;
        const progressBarY = modalY + 230; // Y座標は据え置き
        this.add.graphics().fillStyle(0x1a252f).fillRect(modalX + 50, progressBarY, progressBarWidth, 25);
        const progressBar = this.add.graphics();
        
        // --- アニメーションの実行 ---

        // フェーズ1: カウントアップとプログレスバー
        this.tweens.add({
            targets: counter,
            correct: targetCorrect,
            accuracy: targetAccuracy * 100,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onUpdate: () => {
                const currentCorrect = Math.ceil(counter.correct);
                const currentAccuracy = counter.accuracy.toFixed(1);
                resultText.setText(`正解数: ${currentCorrect} / ${this.resultData.totalQuizzes}\n正答率: ${currentAccuracy}%`);
                
                progressBar.clear().fillStyle(0x27ae60).fillRect(modalX + 50, progressBarY, progressBarWidth * (counter.accuracy / 100), 25);
            }
        });

        //フェーズ2: エンディングテキストの表示
        if (endingText) {
            this.tweens.add({
                targets: endingText,
                alpha: 1,
                scale: 1,
                duration: 800,
                ease: 'Bounce.easeOut',
                delay: 800 // カウントアップ開始から0.8秒後に開始
            });
        }
        
        // ボタンはアニメーション完了後 or 少し遅れて表示
        this.time.delayedCall(1800, () => {
            this.createButtons(modalX, modalY, modalWidth, modalHeight, modalY + 280); // Y座標は据え置き
            if (this.resultData.endingText === 'ハッピーエンド') {
                this.createConfettiEffect();
            }
        });
    }

    // 静的な結果表示 (従来通り)
    createStaticResult(modalX, modalY, modalWidth, modalHeight) {
        let currentY = modalY + 100;

        if (this.resultData.endingText) {
            this.add.text(modalX + modalWidth / 2, currentY, this.resultData.endingText, {
                fontFamily: 'Meiryo, sans-serif', fontSize: '36px', fill: '#ffd700', align: 'center', stroke: '#000000', strokeThickness: 5,
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
            }).setOrigin(0.5);
            currentY += 65;
        }
        
        const accuracyPercentage = (this.resultData.accuracy * 100).toFixed(1);
        const resultText = `正解数: ${this.resultData.correctAnswers} / ${this.resultData.totalQuizzes}\n正答率: ${accuracyPercentage}%`;
        this.add.text(modalX + modalWidth / 2, currentY + 15, resultText, {
            fontFamily: 'Meiryo, sans-serif', fontSize: '24px', fill: '#ecf0f1', align: 'center'
        }).setOrigin(0.5);
        currentY += 75;

        this.createButtons(modalX, modalY, modalWidth, modalHeight, currentY);
    }

    // ボタン作成 (共通化)
    createButtons(modalX, modalY, modalWidth, modalHeight, startY) {
        const buttonStyle = {
            fontFamily: 'Arial, sans-serif', fontSize: '22px', fill: '#ffffff', padding: { x: 20, y: 10 }, borderRadius: 8,
        };
        const retryButton = this.add.text(modalX + modalWidth / 2, startY + 25, 'もう一度挑戦', {
            ...buttonStyle, backgroundColor: '#3498db', shadow: { offsetX: 0, offsetY: 4, color: '#2980b9', fill: true, blur: 4 }
        }).setOrigin(0.5).setInteractive();
        const backButton = this.add.text(modalX + modalWidth / 2, startY + 85, '章選択へ', {
            ...buttonStyle, backgroundColor: '#95a5a6', shadow: { offsetX: 0, offsetY: 4, color: '#7f8c8d', fill: true, blur: 4 }
        }).setOrigin(0.5).setInteractive();

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
