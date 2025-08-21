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
    }

    init(data) {
        this.storyContent = data.content || [];
        this.nextScene = data.nextScene || 'TitleScene';
        this.currentIndex = 0;
        this.isTransitioning = false;
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

        const textStyle = {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 20, y: 10 },
            wordWrap: { width: 650, useAdvanced: true },
            align: 'center'
        };
        this.storyText = this.add.text(480, 450, '', textStyle).setOrigin(0.5);

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
        const skipButtonStyle = {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: { x: 12, y: 8 },
            borderRadius: 8,
            stroke: '#ffffff',
            strokeThickness: 1
        };

        const skipButton = this.add.text(940, 20, 'スキップ >>', skipButtonStyle)
            .setOrigin(1, 0)
            .setInteractive()
            .setDepth(102);

        skipButton.on('pointerover', () => {
            skipButton.setBackgroundColor('rgba(0, 0, 0, 0.7)');
            this.game.canvas.style.cursor = 'pointer';
        });

        skipButton.on('pointerout', () => {
            skipButton.setBackgroundColor('rgba(0, 0, 0, 0.5)');
            this.game.canvas.style.cursor = 'default';
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
            this.scene.start(this.nextScene);
        });
    }

    displayNextContent() {
        // 安全チェック#1: 既に遷移処理中なら、絶対に何もしない
        if (this.isTransitioning) {
            return;
        }

        // 安全チェック#2: インデックスが配列の範囲を超えていたら、フェードアウトしてシーン遷移
        if (this.currentIndex >= this.storyContent.length) {
            this.isTransitioning = true;
            this.input.keyboard.off('keyup-E');
            this.input.off('pointerdown');
            if (this.nextIndicator) {
                this.nextIndicator.destroy();
            }
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(this.nextScene);
            });
            return;
        }

        const content = this.storyContent[this.currentIndex];

        // 安全チェック#3: 配列から取得したコンテンツが不正な場合も、強制的にシーン遷移
        if (!content) {
            console.error(`[StoryScene] Critical Error: Content is undefined at index ${this.currentIndex}. Forcing transition.`);
            this.isTransitioning = true;
            this.input.keyboard.off('keyup-E');
            this.input.off('pointerdown');
            if (this.nextIndicator) {
                this.nextIndicator.destroy();
            }
            this.scene.start(this.nextScene);
            return;
        }

        // 全ての安全チェックを通過した場合のみ、通常の処理を実行
        if (content.image) {
            this.background.setTexture(content.image);
        }
        this.storyText.setText(content.text);
        this.currentIndex++;
    }
}

export default StoryScene;