import BaseScene from './BaseScene.js';
import { imagePaths } from '../data/game-data.js';

class StoryScene extends BaseScene {
    constructor() {
        super('StoryScene');
        this.storyContent = [];
        this.nextScene = '';
        this.currentIndex = 0;
        this.nextIndicator = null;
        this.isTransitioning = false;
        this.resultData = null;
        this.defaultTextStyle = null;
    }

    init(data) {
        this.storyContent = data.scenario || [];
        this.nextScene = data.nextScene || 'TitleScene';
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.resultData = {
            chapterKey: data.chapterKey,
            accuracy: data.accuracy,
            totalQuizzes: data.totalQuizzes,
            correctAnswers: data.correctAnswers
        };
    }

    preload() {
        const imagesToLoad = new Set(this.storyContent.map(content => content.image));
        imagesToLoad.forEach(imageKey => {
            if (imageKey && !this.textures.exists(imageKey)) {
                const imageData = imagePaths.find(p => p.name === imageKey);
                if (imageData) {
                    this.load.image(imageKey, imageData.src);
                } else {
                    console.warn(`Image key "${imageKey}" not found in imagePaths.`);
                }
            }
        });
    }

    create() {
        if (this.storyContent.length === 0) {
            this.scene.start(this.nextScene);
            return;
        }

        this.background = this.add.image(480, 300, this.storyContent[0].image).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        this.defaultTextStyle = {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 20, y: 10 },
            wordWrap: { width: 650, useAdvanced: true },
            align: 'center'
        };
        this.storyText = this.add.text(480, 450, '', this.defaultTextStyle).setOrigin(0.5);

        this.displayNextContent();

        // Eキーで次のコンテンツへ
        this.input.keyboard.on('keyup-E', () => {
            this.displayNextContent();
        });

        // クリックで次のコンテンツへ
        this.input.on('pointerdown', () => {
            this.displayNextContent();
        });

        // 右下の「次へ」インジケーターを作成
        this.nextIndicator = this.add.text(780, 580, 'Eキー or クリックで次へ▼', { 
            fontSize: '18px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(1, 1).setScrollFactor(0).setDepth(102);

        this.tweens.add({ 
            targets: this.nextIndicator, 
            alpha: 0.2, 
            ease: 'Power1', 
            duration: 700, 
            yoyo: true, 
            repeat: -1 
        });

        // スキップボタンを作成
        const skipButton = this.add.text(940, 20, 'スキップ >>', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#8c8e8fff',
            padding: { x: 12, y: 8 },
            borderRadius: 8,
            shadow: { offsetX: 0, offsetY: 3, color: '#768687', fill: true, blur: 3 }
        }).setOrigin(1, 0).setInteractive().setDepth(102);

        skipButton.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            skipButton.setBackgroundColor('#aab7b8');
        });

        skipButton.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            skipButton.setBackgroundColor('#95a5a6');
        });

        skipButton.on('pointerdown', () => {
            this.skipScene();
        });
    }

    update() {
        // BaseSceneのupdateロジックをこのシーンでは実行しない
    }

    skipScene() {
        if (this.isTransitioning) {
            return;
        }
        this.isTransitioning = true;
        this.input.keyboard.off('keyup-E');
        this.input.off('pointerdown');
        if (this.nextIndicator) {
            this.nextIndicator.destroy();
        }
        this.cameras.main.fadeOut(500, 0, 0, 0); // Faster fade for skip
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.handleScenarioEnd();
        });
    }

    displayNextContent() {
        if (this.isTransitioning) {
            return;
        }

        if (this.currentIndex >= this.storyContent.length) {
            this.isTransitioning = true;
            this.input.keyboard.off('keyup-E');
            this.input.off('pointerdown');
            if (this.nextIndicator) {
                this.nextIndicator.destroy();
            }
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.handleScenarioEnd();
            });
            return;
        }

        const content = this.storyContent[this.currentIndex];

        if (!content) {
            console.error(`[StoryScene] Critical Error: Content is undefined at index ${this.currentIndex}. Forcing transition.`);
            this.isTransitioning = true;
            this.input.keyboard.off('keyup-E');
            this.input.off('pointerdown');
            if (this.nextIndicator) {
                this.nextIndicator.destroy();
            }
            this.handleScenarioEnd();
            return;
        }

        if (content.image) {
            this.background.setTexture(content.image);
        }
        
        // Apply custom style if it exists, otherwise revert to default
        const style = content.style
            ? { ...this.defaultTextStyle, ...content.style }
            : this.defaultTextStyle;
        this.storyText.setStyle(style);

        this.storyText.setText(content.text);
        this.currentIndex++;
    }

    handleScenarioEnd() {
        if (this.resultData && this.resultData.chapterKey) {
            // TODO: ここでResultModalを呼び出す
            this.scene.start('ResultScene', this.resultData); // 新しいResultSceneにデータを渡す
        } else {
            this.scene.start(this.nextScene);
        }
    }
}

export default StoryScene;