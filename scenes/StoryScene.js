import BaseScene from './BaseScene.js';
import { imagePaths } from '../data/game-data.js';

class StoryScene extends BaseScene {
    constructor() {
        super('StoryScene');
        this.storyContent = [];
        this.nextScene = '';
        this.nextSceneData = {};
        this.currentIndex = 0;
        this.nextIndicator = null;
        this.isTransitioning = false;
        this.resultData = null;
        this.defaultTextStyle = null;
        this.speakerNameText = null;
    }

    init(data) {
        this.storyContent = data.scenario || [];
        this.nextScene = data.nextScene || 'TitleScene';
        this.nextSceneData = data.nextSceneData || {};
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
            this.scene.start(this.nextScene, this.nextSceneData);
            return;
        }

        this.background = this.add.image(480, 300, this.storyContent[0].image).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        this.defaultTextStyle = {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 20, y: 10 },
            wordWrap: { width: 800, useAdvanced: true },
            align: 'left'
        };
        this.storyText = this.add.text(480, 480, '', this.defaultTextStyle).setOrigin(0.5);

        this.speakerNameText = this.add.text(240, 420, '', {
            fontSize: '26px',
            fill: '#f1c40f',
            fontStyle: 'bold',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 20, y: 8 },
            borderRadius: 5
        }).setOrigin(0.5, 0.5).setVisible(false);

        this.displayNextContent();

        this.input.keyboard.on('keyup-E', () => this.displayNextContent());
        this.input.on('pointerdown', () => this.displayNextContent());

        this.nextIndicator = this.add.text(940, 580, 'Eキー or クリックで次へ▼', { 
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

        const skipButton = this.add.text(940, 20, 'スキップ >>', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#8c8e8fff',
            padding: { x: 12, y: 8 },
            borderRadius: 8,
        }).setOrigin(1, 0).setInteractive().setDepth(102);

        skipButton.on('pointerover', () => { this.game.canvas.style.cursor = 'pointer'; skipButton.setBackgroundColor('#aab7b8'); });
        skipButton.on('pointerout', () => { this.game.canvas.style.cursor = 'default'; skipButton.setBackgroundColor('#95a5a6'); });
        skipButton.on('pointerdown', (pointer, localX, localY, event) => { 
            event.stopPropagation(); 
            this.skipScene(); 
        });
    }

    update() {
        // This scene does not need the BaseScene update logic (player, entities, etc.)
    }

    skipScene() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.input.keyboard.off('keyup-E');
        this.input.off('pointerdown');
        if (this.nextIndicator) {
            this.nextIndicator.destroy();
        }
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.handleScenarioEnd();
        });
    }

    displayNextContent() {
        if (this.isTransitioning) return;

        if (this.currentIndex >= this.storyContent.length) {
            this.skipScene();
            return;
        }

        const content = this.storyContent[this.currentIndex];

        if (!content) {
            console.error(`[StoryScene] Content is undefined at index ${this.currentIndex}.`);
            this.skipScene();
            return;
        }

        if (content.image) {
            this.background.setTexture(content.image);
        }
        
        const style = content.style ? { ...this.defaultTextStyle, ...content.style } : this.defaultTextStyle;
        this.storyText.setStyle(style);
        this.storyText.setText(content.text);

        if (content.speaker) {
            this.speakerNameText.setText(content.speaker).setVisible(true);
            this.storyText.setAlign('left');
        } else {
            this.speakerNameText.setVisible(false);
            this.storyText.setAlign('center');
        }

        this.currentIndex++;
    }

    handleScenarioEnd() {
        if (this.resultData && this.resultData.chapterKey) {
            this.scene.start('ResultScene', this.resultData);
        } else {
            this.scene.start(this.nextScene, this.nextSceneData);
        }
    }
}

export default StoryScene;