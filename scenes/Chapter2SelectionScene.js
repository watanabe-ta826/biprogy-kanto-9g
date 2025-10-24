import Phaser from 'phaser';
import { chapter2SelectionInfo, helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';

export default class Chapter2SelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Chapter2SelectionScene' });
        this.buttons = [];
        this.selectedButtonIndex = 0;
        this.buttonColors = {
            default: '#007bff',
            hover: '#0056b3',
            selected: '#f1c40f', // Using the same yellow for selection
            backDefault: '#6c757d',
            backHover: '#5a6268',
            backSelected: '#f1c40f'
        };
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.add.image(480, 300, 'hub_background').setScale(1);

        // --- Title and Description ---
        this.add.text(480, 100, '第2章: 村人の​お悩みを​AIで​解決　～AIの​使い方を​学ぶ～', { 
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px', 
            fill: '#fff', 
            stroke: '#000', 
            strokeThickness: 6 
        }).setOrigin(0.5);
        this.add.text(480, 150, chapter2SelectionInfo.description, { 
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '18px', 
            fill: '#f0f0f0', 
            align: 'center', 
            wordWrap: { width: 800 } 
        }).setOrigin(0.5);

        // --- Initialize Buttons ---
        this.buttons = [];
        this.selectedButtonIndex = 0;

        const buttonYStart = 250;
        const buttonYStep = 60;

        // --- Create CASE Buttons ---
        chapter2SelectionInfo.cases.forEach((caseInfo, index) => {
            const action = () => {
                if (caseInfo.scene === 'Chapter2-Case3Scene' || caseInfo.scene === 'Chapter2-Case4Scene') {
                    this.scene.start(caseInfo.scene, { partIndex: 0 });
                } else {
                    this.scene.start(caseInfo.scene);
                }
            };

            const button = this.createButton(
                480, 
                buttonYStart + (index * buttonYStep), 
                caseInfo.title, 
                false, // isBackButton
                action, 
                index
            );
            this.buttons.push(button);
        });

        // --- Create Back Button ---
        const backButton = this.createButton(
            480, // Centered for consistency
            buttonYStart + (chapter2SelectionInfo.cases.length * buttonYStep) + 20, 
            '章選択に戻る', 
            true, // isBackButton
            () => this.scene.start('ChapterSelectionScene'), 
            this.buttons.length // index
        );
        this.buttons.push(backButton);

        // --- Help Icon and Modal ---
        this.createHelpIcon();
        this.helpModal = new HelpModal(this, helpModalContent);

        // --- Controls Text ---
        this.add.text(940, 580, 'W/S or ↑/↓: 選択 | E: 決定', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 1);

        this.updateButtonStyles();
        this.addKeyListeners();
    }

    createButton(x, y, text, isBackButton, action, index) {
        const defaultColor = isBackButton ? this.buttonColors.backDefault : this.buttonColors.default;
        const button = this.add.text(x, y, text, {
            fontFamily: 'Arial, sans-serif',
            fontSize: isBackButton ? '20px' : '22px',
            fill: '#fff',
            backgroundColor: defaultColor,
            padding: { x: 20, y: 10 },
            borderRadius: 5
        }).setOrigin(0.5).setInteractive();

        button.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            this.selectedButtonIndex = index;
            this.updateButtonStyles();
        });

        button.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
        });

        button.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, action);
        });

        return button;
    }

    addKeyListeners() {
        this.input.keyboard.on('keyup', (event) => {
            if (this.helpModal && this.helpModal.modal.visible) return; // Ignore while modal is open

            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.selectedButtonIndex = (this.selectedButtonIndex - 1 + this.buttons.length) % this.buttons.length;
                    this.updateButtonStyles();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.selectedButtonIndex = (this.selectedButtonIndex + 1) % this.buttons.length;
                    this.updateButtonStyles();
                    break;
                case 'KeyE':
                case 'Enter':
                    if (this.buttons[this.selectedButtonIndex]) {
                        this.buttons[this.selectedButtonIndex].emit('pointerdown');
                    }
                    break;
            }
        });
    }

    updateButtonStyles() {
        this.buttons.forEach((button, index) => {
            const isBackButton = button.text.includes('戻る');
            const isSelected = index === this.selectedButtonIndex;

            let color = isBackButton ? this.buttonColors.backDefault : this.buttonColors.default;
            if (isSelected) {
                color = isBackButton ? this.buttonColors.backSelected : this.buttonColors.selected;
            }

            button.setBackgroundColor(color);
        });
    }

    createHelpIcon() {
        const helpIcon = this.add.text(920, 40, '？', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#17a2b8',
            padding: { x: 12, y: 4 },
            borderRadius: 100
        }).setOrigin(0.5).setInteractive();

        const tooltip = this.add.text(0, 0, 'プロンプト作成のコツ', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '14px',
            fill: '#000',
            backgroundColor: '#f8f9fa',
            padding: { x: 8, y: 4 },
            borderRadius: 3
        }).setOrigin(1.1, 0.5).setVisible(false).setDepth(300);

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
            this.helpModal.show();
        });
    }

    update() {
        if (this.helpModal && this.helpModal.modal.visible) {
            this.helpModal.update();
        }
    }
}
