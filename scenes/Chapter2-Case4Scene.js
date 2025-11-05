import Phaser from 'phaser';
import { gameData, helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';

export default class Chapter2_Case4Scene extends Phaser.Scene {
    constructor() {
        super('Chapter2-Case4Scene');
        this.currentPartIndex = 0;
        this.uiElements = [];
        this.currentPage = 0;
        this.questionsPerPage = 3; // 1ページあたりの質問数
        this.helpModal = null;
    }

    create(data) {
        // Reset state at the beginning of create, using data passed from scene.start()
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
                nextScene: 'Chapter2-Case4Scene',
                nextSceneData: { partIndex: this.currentPartIndex + 1 }
            });
        } else if (part.type === 'exercise') {
            this.displayExercise(part);
        }
    }

    displayExercise(exercise) {
        // 既存のUI要素をクリア
        this.uiElements.forEach(el => {
            if (el.scene) { // Phaser Game Objectの場合のみdestroy
                el.destroy();
            } else if (el.node) { // DOM Elementの場合
                el.node.remove();
            }
        });
        this.uiElements = [];

        this.add.image(480, 300, 'chapter2_case4_work').setScale(0.8);

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

        backButton.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            backButton.setBackgroundColor('#5a6268');
        });
        backButton.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            backButton.setBackgroundColor('#6c757d');
        });
        backButton.on('pointerdown', () => {
            this.scene.start('Chapter2SelectionScene');
        });

        const formWidth = 800;
        const formHeight = 500;
        const formX = (this.sys.game.config.width - formWidth) / 2;
        const formY = (this.sys.game.config.height - formHeight) / 2;

        const formBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(formX, formY, formWidth, formHeight, 10);
        this.uiElements.push(formBg);

        // スクロール可能なコンテナDOM要素を作成
        let scrollContainerTopOffset = 0; // フォームの上端からのオフセット
        let scrollContainerHeight = 0;

        const description = this.add.text(formX + formWidth / 2, formY + 30, exercise.description, { fontSize: '20px', fill: '#fff', align: 'center', wordWrap: { width: formWidth - 40 } }).setOrigin(0.5, 0);
        this.uiElements.push(description);

        // Help button (matching Chapter2SelectionScene.js design)
        const helpIcon = this.add.text(920, 40, '？', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#17a2b8',
            padding: { x: 12, y: 4 },
            borderRadius: 100
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(100);
        this.uiElements.push(helpIcon);

        const tooltip = this.add.text(0, 0, 'プロンプト作成のコツ', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '14px',
            fill: '#000',
            backgroundColor: '#f8f9fa',
            padding: { x: 8, y: 4 },
            borderRadius: 3
        }).setOrigin(1.1, 0.5).setVisible(false).setDepth(300);
        this.uiElements.push(tooltip);

        helpIcon.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            helpIcon.setBackgroundColor('#138496');
            tooltip.setPosition(helpIcon.x, helpIcon.y);
            tooltip.setVisible(true);
        });
        helpIcon.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            helpIcon.setBackgroundColor('#17a2b8');
            tooltip.setVisible(false);
        });
        helpIcon.on('pointerdown', () => {
            tooltip.setVisible(false);
            if (!this.helpModal) {
                this.helpModal = new HelpModal(this, helpModalContent);
            }
            this.helpModal.show();
        });

        if (exercise.referenceText) {
            const refText = this.add.text(formX + 40, formY + 80, exercise.referenceText, { fontSize: '16px', fill: '#ddd', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 6 }).setOrigin(0, 0);
            this.uiElements.push(refText);
        }

        // 質問の開始Y座標をexercise.idに応じて設定
        let y;
        if (exercise.id === 'exercise1') {
            y = formY + (exercise.referenceText ? 220 : 120);
        } else { // exercise2 の場合
            y = formY + (exercise.referenceText ? 180 : 60);
        }

        // ページネーションのロジック
        let questionsToDisplay;
        let totalPages = 1; // exercise2の場合は1ページにまとめる

        if (exercise.id === 'exercise2') {
            questionsToDisplay = exercise.questions;
        } else {
            const startIndex = this.currentPage * this.questionsPerPage;
            const endIndex = startIndex + this.questionsPerPage;
            questionsToDisplay = exercise.questions.slice(startIndex, endIndex);
            totalPages = Math.ceil(exercise.questions.length / this.questionsPerPage);
        }

        if (exercise.id === 'exercise1') {
            questionsToDisplay.forEach(q => {
                const qText = this.add.text(formX + 40, y, q.text, { fontSize: '14px', fill: '#fff' });
                const inputHeight = 18;
                const input = this.add.dom(formX + 40, y + qText.height + 5).createFromHTML(`<textarea id="${q.id}" style="width: ${formWidth - 80}px; height: 18px; font-size: 12px; padding: 5px; border-radius: 5px;"></textarea>`).setOrigin(0, 0);
                this.uiElements.push(qText, input);
                y += qText.height + inputHeight + 25;
            });
        } else { // exercise2 の場合
            y = formY + (exercise.referenceText ? 180 : 40);

            questionsToDisplay.forEach(q => {
                const qText = this.add.text(formX + 40, y, q.text, { fontSize: '16px', fill: '#fff' });
                const inputHeight = 20;
                const input = this.add.dom(formX + 40, y - 3 + qText.height + 10).createFromHTML(`<textarea id="${q.id}" style="width: ${formWidth - 80}px; height: 20px; font-size: 14px; padding: 5px; border-radius: 5px;"></textarea>`).setOrigin(0, 0);
                this.uiElements.push(qText, input);
                y += qText.height + inputHeight + 25;
            });
        }

        // ページネーションボタン
        if (totalPages > 1 && exercise.id !== 'exercise2') {
            const prevButton = this.add.text(formX + formWidth / 2 - 100, formY + formHeight - 80, '前へ', { fontSize: '20px', fill: '#fff', backgroundColor: '#3498db', padding: {x:15, y:8}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
            this.uiElements.push(prevButton);
            prevButton.setVisible(this.currentPage > 0);
            prevButton.on('pointerdown', () => {
                this.currentPage--;
                this.displayExercise(exercise);
            });

            const pageText = this.add.text(formX + formWidth / 2, formY + formHeight - 80, `${this.currentPage + 1} / ${totalPages}`, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
            this.uiElements.push(pageText);

            const nextButton = this.add.text(formX + formWidth / 2 + 100, formY + formHeight - 80, '次へ', { fontSize: '20px', fill: '#fff', backgroundColor: '#3498db', padding: {x:15, y:8}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
            this.uiElements.push(nextButton);
            nextButton.setVisible(this.currentPage < totalPages - 1);
            nextButton.on('pointerdown', () => {
                this.currentPage++;
                this.displayExercise(exercise);
            });
        }

        const submitButton = this.add.text(formX + formWidth - 80, formY + formHeight - 40, '完了', { fontSize: '24px', fill: '#fff', backgroundColor: '#27ae60', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
        this.uiElements.push(submitButton);

        submitButton.on('pointerdown', () => {
            this.scene.start('Chapter2-Case4Scene', { partIndex: this.currentPartIndex + 1 });
        });
    }

    update() {
        if (this.helpModal) {
            this.helpModal.update();
        }
    }

    shutdown() {
        this.uiElements.forEach(el => {
            if (el.scene) { // Check if it's a Phaser Game Object
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