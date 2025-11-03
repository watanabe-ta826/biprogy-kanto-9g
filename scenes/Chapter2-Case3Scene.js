import Phaser from 'phaser';
import { gameData, helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';

export default class Chapter2_Case3Scene extends Phaser.Scene {
    constructor() {
        super('Chapter2-Case3Scene');
        this.currentPartIndex = 0;
        this.sceneData = null;
        this.uiElements = [];
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
                nextScene: 'Chapter2-Case3Scene',
                nextSceneData: { partIndex: this.currentPartIndex + 1 }
            });
        } else if (part.type === 'exercise') {
            this.displayExercise(part);
        }
    }

    displayExercise(exercise) {
        this.add.image(480, 300, this.sceneData.background).setScale(1.2);

        const formWidth = 800;
        const formHeight = 500;
        const formX = (this.sys.game.config.width - formWidth) / 2;
        const formY = (this.sys.game.config.height - formHeight) / 2;

        const formBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(formX, formY, formWidth, formHeight, 10);
        this.uiElements.push(formBg);

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