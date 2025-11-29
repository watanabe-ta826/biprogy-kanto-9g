import Phaser from 'phaser';
import { gameData, helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';
import { createCopyButton } from '../CopyButton.js';

export default class Chapter2_Case3Scene extends Phaser.Scene {
    constructor() {
        super('Chapter2-Case3Scene');
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
                nextScene: 'Chapter2-Case3Scene',
                nextSceneData: { partIndex: this.currentPartIndex + 1 }
            });
        } else if (part.type === 'exercise') {
            this.displayExercise(part);
        } else if (part.type === 'review') {
            this.displayReview(part);
        }
    }

    displayExercise(exercise) {
        this.add.image(480, 300, 'chapter2_case3_work').setScale(1.2);

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

        const description = this.add.text(formX + formWidth / 2, formY + 30, exercise.description, { fontSize: '20px', fill: '#fff', align: 'center', wordWrap: { width: formWidth - 40 } }).setOrigin(0.5, 0);
        this.uiElements.push(description);

        // Help button
        const helpIcon = this.add.text(810, 20, 'プロンプト作成のコツ', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '22px',
            fill: '#fff',
            backgroundColor: '#8e44ad', // 紫系の目立つ色
            padding: { x: 20, y: 10 },
            borderRadius: 8,
            shadow: { offsetX: 0, offsetY: 5, color: '#732d91', fill: true, blur: 5 }
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(100);
        this.uiElements.push(helpIcon);

        helpIcon.on('pointerdown', () => {
            if (this.isModalOpen) return;
            const helpModal = new HelpModal(this, helpModalContent);
            helpModal.show();
        });

        if (exercise.copyButton) {
            const { textToCopy, buttonText, x, y } = exercise.copyButton;
            const copyButton = createCopyButton(this, formX + x, formY + y, textToCopy, buttonText);
            this.uiElements.push(copyButton);
        }

        if (exercise.referenceText) {
            const refText = this.add.text(formX + 40, formY + 80, exercise.referenceText, { fontSize: '16px', fill: '#ddd', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 6 }).setOrigin(0, 0);
            this.uiElements.push(refText);
        }

        let y = formY + (exercise.referenceText ? 220 : 120);

        exercise.questions.forEach(q => {
            const qText = this.add.text(formX + 40, y, q.text, { fontSize: '18px', fill: '#fff' });
            const inputHeight = exercise.id === 'exercise1' ? 30 : 50;
            const input = this.add.dom(formX + 40, y + qText.height + 15).createFromHTML(`<textarea id="${q.id}" style="width: ${formWidth - 80}px; height: ${inputHeight}px; font-size: 16px; padding: 5px; border-radius: 5px;"></textarea>`).setOrigin(0, 0);
            this.uiElements.push(qText, input);
            y += qText.height + inputHeight + 40;
        });

        const submitButton = this.add.text(formX + formWidth / 2, formY + formHeight - 40, '完了', { fontSize: '24px', fill: '#fff', backgroundColor: '#27ae60', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
        this.uiElements.push(submitButton);

        submitButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            if (exercise.id === 'exercise1') {
                const answer = document.getElementById('q1').value;
                if (answer.trim() === exercise.correctAnswer.q1) {
                    this.scene.start('Chapter2-Case3Scene', { partIndex: this.currentPartIndex + 1 });
                } else {
                    alert(exercise.feedback.incorrect);
                }
            } else {
                this.scene.start('Chapter2-Case3Scene', { partIndex: this.currentPartIndex + 1 });
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
        const formHeight = 540; // 元の高さに戻す
        const formX = (this.sys.game.config.width - formWidth) / 2;
        const formY = (this.sys.game.config.height - formHeight) / 2;

        const formBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(formX, formY, formWidth, formHeight, 10);
        this.uiElements.push(formBg);

        const title = this.add.text(formX + formWidth / 2, formY + 20, review.title, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5, 0);
        const description = this.add.text(formX + 40, formY + 60, review.description, { fontSize: '18px', fill: '#fff', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 10 }).setOrigin(0, 0);
        this.uiElements.push(title, description);

        const contentY = formY + 120; // 調整
        review.prompts.forEach((promptData, index) => {
            const pageContainer = this.add.container();

            const promptTitle = this.add.text(formX + 40, contentY, promptData.title, { fontSize: '20px', fill: '#f1c40f' });
            const promptAreaHeight = 150; // 縦幅は維持
            const promptArea = this.add.dom(formX + 40, contentY + 40).createFromHTML(
                `<textarea readonly style="width: ${formWidth - 80}px; height: ${promptAreaHeight}px; font-size: 14px; padding: 10px; border-radius: 5px; background-color: #333; color: #fff; border: 1px solid #555; resize: none;">${promptData.displayText}</textarea>`
            ).setOrigin(0, 0);
            
            const copyButton = createCopyButton(this, formX + formWidth - 40, contentY + 40 + promptAreaHeight + 25, promptData.copyText, 'プロンプト例をコピー'); // Y座標調整
            copyButton.setOrigin(1, 0);

            pageContainer.add([promptTitle, promptArea, copyButton]);
            this.reviewPromptPages.push(pageContainer);
            this.uiElements.push(pageContainer);

            if (index > 0) {
                pageContainer.setVisible(false);
            }
        });

        // Paging UI
        const pageText = this.add.text(formX + formWidth / 2, formY + formHeight - 40, '', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5); // Y座標調整
        const prevButton = this.add.text(formX + formWidth / 2 - 80, formY + formHeight - 40, '< 前へ', { fontSize: '18px', fill: '#fff' }).setOrigin(1, 0.5).setInteractive(); // Y座標調整
        const nextButton = this.add.text(formX + formWidth / 2 + 80, formY + formHeight - 40, '次へ >', { fontSize: '18px', fill: '#fff' }).setOrigin(0, 0.5).setInteractive(); // Y座標調整
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

        const endButton = this.add.text(formX + formWidth / 2, formY + formHeight - 15, '演習を終わる', { fontSize: '22px', fill: '#fff', backgroundColor: '#6c757d', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive(); // Y座標調整
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