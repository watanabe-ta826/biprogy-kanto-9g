import Phaser from 'phaser';
import { gameData, helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';
import { createCopyButton } from '../CopyButton.js';

export default class Chapter2_Case1Scene extends Phaser.Scene {
    constructor() {
        super('Chapter2-Case1Scene');
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
                nextScene: 'Chapter2-Case1Scene',
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
            this.add.image(480, 300, exercise.image).setScale(1.0).setDepth(-1);
        }
        
        // 常にフォームの背景を描画
        const formBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(formX, formY, formWidth, formHeight, 10);
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

        const description = this.add.text(formX + 40, formY + 50, exercise.description, { fontSize: '20px', fill: '#fff', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 10 }).setOrigin(0, 0);
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

        // Download button
        if (exercise.downloadFile) {
            // Viteのbase URLを考慮して、絶対パスを動的に構築
            const baseUrl = import.meta.env.BASE_URL;
            const safeBaseUrl = (baseUrl === '/' || baseUrl === './') ? '' : baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            const fileUrl = `${safeBaseUrl}/${exercise.downloadFile.url}`;

            const buttonHtml = `
                <a href="${fileUrl}" 
                   download 
                   style="
                        display: inline-block;
                        background-color: #007bff; 
                        color: white; 
                        padding: 10px 20px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 18px;
                        transform: translateX(-50%);
                        left: 50%;
                        position: relative;
                   ">
                   ${exercise.downloadFile.buttonText}
                </a>
            `;
            const downloadButton = this.add.dom(formX + formWidth / 2, formY + 250).createFromHTML(buttonHtml);
            this.uiElements.push(downloadButton);
        }


        // Submit button
        const submitButton = this.add.text(formX + formWidth / 2, formY + formHeight - 60, '議事録を役人に提出', { fontSize: '24px', fill: '#fff', backgroundColor: '#27ae60', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
        this.uiElements.push(submitButton);

        submitButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            if (confirm('内容は確認しましたか？')) {
                this.scene.start('Chapter2-Case1Scene', { partIndex: this.currentPartIndex + 1 });
            }
        });
    }

    displayReview(review) {
        this.cameras.main.setBackgroundColor('#000000');

        // 背景画像を追加 (もしあれば)
        if (review.image) {
            this.add.image(480, 300, review.image).setScale(1.0).setDepth(-1); // 中央に配置、背景として
        }

        const formWidth = 800;
        const formHeight = 500;
        const formX = (this.sys.game.config.width - formWidth) / 2;
        const formY = (this.sys.game.config.height - formHeight) / 2;

        const formBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(formX, formY, formWidth, formHeight, 10);
        this.uiElements.push(formBg);
        
        const title = this.add.text(formX + formWidth / 2, formY + 30, review.title, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5, 0);
        const description = this.add.text(formX + 40, formY + 80, review.description, { fontSize: '18px', fill: '#fff', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 10 }).setOrigin(0, 0);
        this.uiElements.push(title, description);

        const promptText = review.prompt;
        const promptAreaHeight = 250;
        const promptArea = this.add.dom(formX + 40, formY + 150).createFromHTML(
            `<textarea readonly style="width: ${formWidth - 80}px; height: ${promptAreaHeight}px; font-size: 16px; padding: 10px; border-radius: 5px; background-color: #333; color: #fff; border: 1px solid #555; resize: none;">${promptText}</textarea>`
        ).setOrigin(0, 0);
        this.uiElements.push(promptArea);
        
        const copyButton = createCopyButton(this, formX + formWidth - 120, formY + 150 + promptAreaHeight + 50, promptText, 'プロンプト例をコピー');
        this.uiElements.push(copyButton);

        const endButton = this.add.text(formX + formWidth / 2, formY + formHeight - 40, '演習を終わる', { fontSize: '24px', fill: '#fff', backgroundColor: '#6c757d', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
        this.uiElements.push(endButton);

        endButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            this.endScene();
        });
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