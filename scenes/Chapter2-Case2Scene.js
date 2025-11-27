import Phaser from 'phaser';
import { gameData, helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';

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
        }
    }

    displayExercise(exercise) {
        // 背景を真っ黒にする
        this.cameras.main.setBackgroundColor('#000000');

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

        const formWidth = 800;
        const formHeight = 500;
        const formX = (this.sys.game.config.width - formWidth) / 2;
        const formY = (this.sys.game.config.height - formHeight) / 2;

        const formBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(formX, formY, formWidth, formHeight, 10);
        this.uiElements.push(formBg);

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
                this.uiElements.push(downloadButton);
                downloadButtonY += 50; // 次のボタンの位置
            });
        }

        // Submit button
        const submitButton = this.add.text(formX + formWidth / 2, formY + formHeight - 60, exercise.submitButtonText || '完了', { fontSize: '24px', fill: '#fff', backgroundColor: '#27ae60', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
        this.uiElements.push(submitButton);

        submitButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            if (confirm('内容は確認しましたか？')) {
                this.scene.start('Chapter2-Case2Scene', { partIndex: this.currentPartIndex + 1 });
            }
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