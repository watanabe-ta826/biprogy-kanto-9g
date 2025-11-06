import BaseScene from './BaseScene.js';
import { gameData } from '../data/game-data.js';

export default class BaseChapterScene extends BaseScene {
    constructor(sceneKey) {
        super(sceneKey);
        this.chapterData = null;
        this.chapterKey = null;
        this.isCleared = false; // クリア処理が重複しないようにするフラグ
        this.questUiBg = null;
        this.questUiText = null;
    }

    create(sceneData) {
        this.isCleared = false;
        super.create(sceneData);

        // 現在のシーンが属する章のデータを取得
        for (const key in gameData.chapters) {
            const chapter = gameData.chapters[key];
            if (chapter.scenes.includes(this.scene.key)) {
                this.chapterData = chapter;
                this.chapterKey = key;
                break;
            }
        }

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
        this.backButton = this.add.text(940, 20, '章選択に戻る', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#768687',
            padding: { x: 12, y: 8 },
            borderRadius: 8,
            shadow: { offsetX: 0, offsetY: 3, color: '#768687', fill: true, blur: 3 }
        }).setOrigin(1, 0).setInteractive().setScrollFactor(0);

        this.backButton.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            this.backButton.setBackgroundColor('#aab7b8');
        });

        this.backButton.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            this.backButton.setBackgroundColor('#95a5a6');
        });

        this.backButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('ChapterSelectionScene');
            });
        });

        this.createQuestTracker();
        this.events.on('quizCompleted', this.updateQuestTracker, this);
    }

    update() {
        super.update();

        if (this.backButton) {
            this.backButton.setVisible(!this.isModalOpen);
        }

        if (this.isCleared || !this.chapterData) {
            return;
        }

        this.updateQuestTracker();

        const completedQuizzes = this.registry.get('completedQuizzes') || [];
        let completedChapterQuizzesCount = 0;

        this.chapterData.scenes.forEach(sceneKey => {
            const sceneData = gameData.scenes[sceneKey];
            if (sceneData && sceneData.entities) {
                sceneData.entities.forEach(entity => {
                    if (entity.type === 'NPC' && entity.quiz) {
                        const quizId = `${sceneKey}_${entity.name}`;
                        if (completedQuizzes.includes(quizId)) {
                            completedChapterQuizzesCount++;
                        }
                    }
                });
            }
        });

        if (completedChapterQuizzesCount >= this.chapterData.totalQuizzes) {
            this.isCleared = true;
            this.startClearSequence();
        }
    }

    createQuestTracker() {
        // 既存のUIがあれば破棄する
        if (this.questUiBg) {
            this.questUiBg.destroy();
        }
        if (this.questUiText) {
            this.questUiText.destroy();
        }

        const x = 20;
        const y = 20;

        this.questUiBg = this.add.graphics().setScrollFactor(0).setDepth(100);
        this.questUiText = this.add.text(x + 15, y + 10, '', {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'Meiryo, sans-serif'
        }).setScrollFactor(0).setDepth(101);

        this.updateQuestTracker();
    }

    updateQuestTracker() {
        if (!this.chapterData) return;

        const completedQuizzes = this.registry.get('completedQuizzes') || [];
        let completedChapterQuizzesCount = 0;

        this.chapterData.scenes.forEach(sceneKey => {
            const sceneData = gameData.scenes[sceneKey];
            if (sceneData && sceneData.entities) {
                sceneData.entities.forEach(entity => {
                    if (entity.type === 'NPC' && entity.quiz) {
                        const quizId = `${sceneKey}_${entity.name}`;
                        if (completedQuizzes.includes(quizId)) {
                            completedChapterQuizzesCount++;
                        }
                    }
                });
            }
        });

        const totalQuizzes = this.chapterData.totalQuizzes;
        const questText = this.chapterData.questText || 'クイズを解いて回る';
        const text = `${questText} (${completedChapterQuizzesCount}/${totalQuizzes})`;
        this.questUiText.setText(text);

        const textBounds = this.questUiText.getBounds();
        const padding = { x: 15, y: 10 };
        this.questUiBg.clear();
        this.questUiBg.fillStyle(0x000000, 0.7);
        this.questUiBg.fillRoundedRect(
            textBounds.x - padding.x,
            textBounds.y - padding.y,
            textBounds.width + padding.x * 2,
            textBounds.height + padding.y * 2,
            8
        );
    }

    startClearSequence() {
        const correctAnswers = this.registry.get('correctAnswers') || 0;
        const totalQuizzes = this.chapterData.totalQuizzes;
        const accuracy = totalQuizzes > 0 ? (correctAnswers / totalQuizzes) : 0;

        const scenarioType = accuracy >= 0.7 ? 'high' : 'low';
        const scenario = this.chapterData.clearScenario[scenarioType];

        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('StoryScene', {
                scenario: scenario,
                nextScene: 'ChapterSelectionScene', // ここを後で結果表示モーダルに変える
                chapterKey: this.chapterKey,
                accuracy: accuracy,
                totalQuizzes: totalQuizzes,
                correctAnswers: correctAnswers
            });
        });
    }
}