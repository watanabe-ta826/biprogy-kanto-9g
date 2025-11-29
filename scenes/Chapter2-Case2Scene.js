import Phaser from 'phaser';
import { gameData, helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';
import { createCopyButton } from '../CopyButton.js';

export default class Chapter2_Case2Scene extends Phaser.Scene {
    constructor() {
        super('Chapter2-Case2Scene');
        this.currentPartIndex = 0;
        this.sceneData = null;
        this.uiElements = [];
        this.isModalOpen = false; // モーダルの状態を追跡
    }

    create(data) {
        this.isModalOpen = false; // シーン開始時にリセット
        this.currentPartIndex = (data && data.partIndex) ? data.partIndex : 0;

        this.sceneData = gameData.scenes[this.sys.settings.key];
        this.cameras.main.fadeIn(500, 0, 0, 0);

        const part = this.sceneData.parts[this.currentPartIndex];

        if (!part) {
            this.endScene();
            return;
        }

        if (part.type === 'scenario') {
            this.scene.start('StoryScene', {
                scenario: part.content,
                nextScene: 'Chapter2-Case2Scene',
                nextSceneData: { partIndex: this.currentPartIndex + 1 }
            });
        } else if (part.type === 'exercise') {
            this.displayExercise(part);
        } else if (part.type === 'review') {
            this.displayReview(part);
        }
    }

    displayExercise(exercise) {
        // 背景を真っ黒にする
        this.cameras.main.setBackgroundColor('#000000');

        const formWidth = 800;
        const formHeight = 500;
        const formX = (this.sys.game.config.width - formWidth) / 2;
        const formY = (this.sys.game.config.height - formHeight) / 2;

        // 背景画像を追加 (もしあれば)
        if (exercise.image) {
            this.add.image(480, 300, exercise.image).setScale(1.0).setDepth(-1); // 背景として一番奥に
        }
        
        // 常にフォームの背景を描画
        const formBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(formX, formY, formWidth, formHeight, 10).setDepth(0);
        this.uiElements.push(formBg);

        // Back to selection button
        const backButton = this.add.text(100, 575, 'CASE選択に戻る', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: '#6c757d',
            padding: { x: 15, y: 8 },
            borderRadius: 5
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(100);
        this.uiElements.push(backButton);

        backButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            this.scene.start('Chapter2SelectionScene');
        });

        const description = this.add.text(formX + 40, formY + 50, exercise.description, { fontSize: '20px', fill: '#fff', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 10 }).setOrigin(0, 0).setDepth(1);
        this.uiElements.push(description);

        // Help button
        const helpIcon = this.add.text(810, 20, 'プロンプト作成のコツ', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '22px',
            fill: '#fff',
            backgroundColor: '#8e44ad',
            padding: { x: 20, y: 10 },
            borderRadius: 8,
            shadow: { offsetX: 0, offsetY: 5, color: '#732d91', fill: true, blur: 5 }
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(100);
        this.uiElements.push(helpIcon);
        
        helpIcon.on('pointerdown', () => {
            if (this.isModalOpen) return;
            new HelpModal(this, helpModalContent).show();
        });

        // Download buttons
        if (exercise.downloadFiles && Array.isArray(exercise.downloadFiles)) {
            const baseUrl = import.meta.env.BASE_URL;
            const safeBaseUrl = (baseUrl === '/' || baseUrl === './') ? '' : baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            
            let downloadButtonY = formY + 200;
            exercise.downloadFiles.forEach(fileInfo => {
                const fileUrl = `${safeBaseUrl}/${fileInfo.url}`;
                const buttonHtml = `
                    <a href="${fileUrl}" download style="display: inline-block; background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-size: 16px; margin-bottom: 10px;">
                       ${fileInfo.buttonText}
                    </a>`;
                const downloadButton = this.add.dom(formX + formWidth / 2, downloadButtonY).createFromHTML(buttonHtml);
                downloadButton.setOrigin(0.5, 0.5); // DOM要素の原点を中央に設定
                downloadButton.setDepth(1); // formBgの上に表示
                this.uiElements.push(downloadButton);
                downloadButtonY += 50; // 次のボタンの位置
            });
        }

        // Submit button
        const submitButton = this.add.text(formX + formWidth / 2, formY + formHeight - 60, exercise.submitButtonText || '完了', { fontSize: '24px', fill: '#fff', backgroundColor: '#27ae60', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive().setDepth(1);
        this.uiElements.push(submitButton);

        submitButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            if (confirm('内容は確認しましたか？')) {
                this.scene.start('Chapter2-Case2Scene', { partIndex: this.currentPartIndex + 1 });
            }
        });
    }

    displayReview(review) {
        this.cameras.main.setBackgroundColor('#000000');
        
        // 背景画像を追加 (もしあれば)
        if (review.image) {
            this.add.image(480, 300, review.image).setScale(1.0).setDepth(-1); // 中央に配置、背景として
        }

        this.reviewPromptPages = [];
        this.currentReviewPageIndex = 0;

        const formWidth = 800;
        const formHeight = 540;
        const formX = (this.sys.game.config.width - formWidth) / 2;
        const formY = (this.sys.game.config.height - formHeight) / 2;

        // 常にフォームの背景を描画
        const formBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(formX, formY, formWidth, formHeight, 10).setDepth(0);
        this.uiElements.push(formBg);

        const title = this.add.text(formX + formWidth / 2, formY + 20, review.title, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5, 0).setDepth(1);
        const description = this.add.text(formX + 40, formY + 60, review.description, { fontSize: '18px', fill: '#fff', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 10 }).setOrigin(0, 0).setDepth(1);
        this.uiElements.push(title, description);

        const contentY = formY + 120;
        review.prompts.forEach((promptData, index) => {
            const pageContainer = this.add.container();

            const promptTitle = this.add.text(formX + 40, contentY, promptData.title, { fontSize: '20px', fill: '#f1c40f' });
            const promptAreaHeight = 150; // 縦幅を短縮
            const promptArea = this.add.dom(formX + 40, contentY + 40).createFromHTML(
                `<textarea readonly style="width: ${formWidth - 80}px; height: ${promptAreaHeight}px; font-size: 14px; padding: 10px; border-radius: 5px; background-color: #333; color: #fff; border: 1px solid #555; resize: none;">${promptData.displayText}</textarea>`
            ).setOrigin(0, 0);
            
            const copyButton = createCopyButton(this, formX + formWidth - 40, contentY + 40 + promptAreaHeight + 25, promptData.copyText, 'コピー');
            copyButton.setOrigin(1, 0); // 右寄せにする

            pageContainer.add([promptTitle, promptArea, copyButton]);
            this.reviewPromptPages.push(pageContainer);
            this.uiElements.push(pageContainer);

            if (index > 0) {
                pageContainer.setVisible(false);
            }
        });

        // Paging UI
        const pageText = this.add.text(formX + formWidth / 2, formY + formHeight - 70, '', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        const prevButton = this.add.text(formX + formWidth / 2 - 80, formY + formHeight - 70, '< 前へ', { fontSize: '18px', fill: '#fff' }).setOrigin(1, 0.5).setInteractive();
        const nextButton = this.add.text(formX + formWidth / 2 + 80, formY + formHeight - 70, '次へ >', { fontSize: '18px', fill: '#fff' }).setOrigin(0, 0.5).setInteractive();
        this.uiElements.push(pageText, prevButton, nextButton);
        
        const updatePaging = () => {
            pageText.setText(`${this.currentReviewPageIndex + 1} / ${this.reviewPromptPages.length}`);
            prevButton.setAlpha(this.currentReviewPageIndex > 0 ? 1 : 0.3);
            nextButton.setAlpha(this.currentReviewPageIndex < this.reviewPromptPages.length - 1 ? 1 : 0.3);
        };

        prevButton.on('pointerdown', () => {
            if (this.currentReviewPageIndex > 0) {
                this.reviewPromptPages[this.currentReviewPageIndex].setVisible(false);
                this.currentReviewPageIndex--;
                this.reviewPromptPages[this.currentReviewPageIndex].setVisible(true);
                updatePaging();
            }
        });

        nextButton.on('pointerdown', () => {
            if (this.currentReviewPageIndex < this.reviewPromptPages.length - 1) {
                this.reviewPromptPages[this.currentReviewPageIndex].setVisible(false);
                this.currentReviewPageIndex++;
                this.reviewPromptPages[this.currentReviewPageIndex].setVisible(true);
                updatePaging();
            }
        });

        const endButton = this.add.text(formX + formWidth / 2, formY + formHeight - 30, '演習を終わる', { fontSize: '22px', fill: '#fff', backgroundColor: '#6c757d', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
        this.uiElements.push(endButton);
    
        endButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            this.endScene();
        });

        updatePaging();
    }

    shutdown() {
        this.uiElements.forEach(el => {
            if (el && el.scene) {
                el.destroy();
            }
        });
        this.uiElements = [];
    }

    endScene() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('Chapter2SelectionScene');
        });
    }
}