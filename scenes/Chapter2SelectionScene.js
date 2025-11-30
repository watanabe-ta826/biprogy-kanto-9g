import Phaser from 'phaser';
import { chapter2SelectionInfo, helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';
import { createButton } from '../ui.js';

export default class Chapter2SelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Chapter2SelectionScene' });
        this.buttons = [];
        this.selectedButtonIndex = 0;
        this.keys = null;
        this.buttonColors = {
            default: '#007bff',
            selected: '#f1c40f',
            disabled: '#808080',
            backDefault: '#6c757d',
            backSelected: '#f1c40f',
            helpDefault: '#28a745',
            helpSelected: '#f1c40f'
        };
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.add.image(480, 300, 'chapter2_case_select').setScale(0.7);

        this.events.on('modalClosed', () => {
            this.registry.set('isModalOpen', false);
        });

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

        this.buttons = [];
        const buttonYStart = 250;
        const buttonYStep = 60;
        
        // Help Button
        const helpButton = createButton(this, 480, 200, 'プロンプト作成のコツ', null, { 
            handleInteraction: false,
            color: this.buttonColors.helpDefault,
            style: { shadow: { offsetX: 0, offsetY: 5, color: '#1e7e34', fill: true, blur: 5 } }
        });
        helpButton.setData('isHelpButton', true);
        helpButton.setData('enabled', true);
        helpButton.on('pointerdown', () => {
            if (this.registry.get('isModalOpen')) return;
            this.registry.set('isModalOpen', true);
            new HelpModal(this, helpModalContent).show();
        });
        this.buttons.push(helpButton);

        // Case Buttons
        chapter2SelectionInfo.cases.forEach((caseInfo) => {
            let buttonText = caseInfo.title;
            if (!caseInfo.enabled) {
                buttonText += ' (作成中)';
            }
            const button = createButton(this, 480, buttonYStart + ((this.buttons.length - 1) * buttonYStep), buttonText, null, {
                handleInteraction: false,
                color: caseInfo.enabled ? this.buttonColors.default : this.buttonColors.disabled
            });
            button.setData('enabled', caseInfo.enabled);
            button.setData('isCaseButton', true);

            if (caseInfo.enabled) {
                button.on('pointerdown', () => {
                    if (this.registry.get('isModalOpen')) return;
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                         this.scene.start(caseInfo.scene, { partIndex: 0 });
                    });
                });
            }
            this.buttons.push(button);
        });

        // Back Button
        const backButton = createButton(this, 480, buttonYStart + ((this.buttons.length - 2) * buttonYStep) + 80, '章選択に戻る', null, {
             handleInteraction: false,
             color: this.buttonColors.backDefault,
             style: { fontSize: '20px' }
        });
        backButton.setData('isBackButton', true);
        backButton.setData('enabled', true);
        backButton.on('pointerdown', () => {
            if (this.registry.get('isModalOpen')) return;
            this.scene.start('ChapterSelectionScene');
        });
        this.buttons.push(backButton);

        this.buttons.forEach((button, index) => {
            button.setInteractive();
            button.on('pointerover', () => {
                if (this.registry.get('isModalOpen')) return;
                this.selectedButtonIndex = index;
                this.updateButtonStyles();
            });
        });

        this.selectedButtonIndex = this.buttons.findIndex(b => b.getData('enabled'));
        if (this.selectedButtonIndex === -1) this.selectedButtonIndex = 0;

        this.add.text(940, 580, 'W/S or ↑/↓: 選択 | E/Enter: 決定', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 1);

        this.keys = this.input.keyboard.addKeys({
            up: 'W', down: 'S', arrowUp: 'UP', arrowDown: 'DOWN', enter: 'ENTER', e: 'E'
        });

        this.events.on('modalClosed', () => {
            this.isModalOpen = false;
        });

        this.updateButtonStyles();
    }

    update() {
        if (this.registry.get('isModalOpen')) { return; }

        if (Phaser.Input.Keyboard.JustDown(this.keys.up) || Phaser.Input.Keyboard.JustDown(this.keys.arrowUp)) {
            this.selectNextButton(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.down) || Phaser.Input.Keyboard.JustDown(this.keys.arrowDown)) {
            this.selectNextButton(1);
        }
        else if (Phaser.Input.Keyboard.JustDown(this.keys.enter) || Phaser.Input.Keyboard.JustDown(this.keys.e)) {
            const currentButton = this.buttons[this.selectedButtonIndex];
            if (currentButton && currentButton.getData('enabled')) {
                currentButton.emit('pointerdown');
            }
        }
    }
    
    selectNextButton(direction) {
        let nextIndex = this.selectedButtonIndex;
        do {
            nextIndex = (nextIndex + direction + this.buttons.length) % this.buttons.length;
        } while (!this.buttons[nextIndex].getData('enabled'));
        this.selectedButtonIndex = nextIndex;
        this.updateButtonStyles();
    }

    updateButtonStyles() {
        this.buttons.forEach((button, index) => {
            if (!button || !button.active) return;
            if (!button.getData('enabled')) {
                button.setBackgroundColor(this.buttonColors.disabled).setAlpha(0.7);
                return;
            }
            
            const isSelected = index === this.selectedButtonIndex;
            const isHelp = button.getData('isHelpButton');
            const isBack = button.getData('isBackButton');

            let color;
            if (isSelected) {
                color = isHelp ? this.buttonColors.helpSelected : (isBack ? this.buttonColors.backSelected : this.buttonColors.selected);
            } else {
                color = isHelp ? this.buttonColors.helpDefault : (isBack ? this.buttonColors.backDefault : this.buttonColors.default);
            }
            button.setBackgroundColor(color).setAlpha(1);
        });
    }
}
