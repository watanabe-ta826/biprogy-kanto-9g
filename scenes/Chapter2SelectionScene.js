import Phaser from 'phaser';
import { chapter2SelectionInfo, helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';

export default class Chapter2SelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Chapter2SelectionScene' });
        this.buttons = [];
        this.selectedButtonIndex = 0;
        this.isModalOpen = false;
        this.ignoreEnterUntilKeyUp = false; // Enter/Eが離されるまで入力を無視するフラグ
        this.keys = null;
        this.buttonColors = {
            default: '#007bff',
            hover: '#0056b3',
            selected: '#f1c40f',
            disabled: '#808080',
            backDefault: '#6c757d',
            backHover: '#5a6268',
            backSelected: '#f1c40f',
            helpDefault: '#28a745',
            helpHover: '#218838',
            helpSelected: '#f1c40f'
        };
    }

    create() {
        this.isModalOpen = false;
        this.ignoreEnterUntilKeyUp = false;
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.add.image(480, 300, 'chapter2_case_select').setScale(0.7);

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
        const helpButton = this.createHelpIcon();
        this.buttons.push(helpButton);
        const buttonYStart = 250;
        const buttonYStep = 60;
        chapter2SelectionInfo.cases.forEach((caseInfo) => {
            const action = () => {
                if (this.isModalOpen) return;
                if (caseInfo.scene === 'Chapter2-Case3Scene' || caseInfo.scene === 'Chapter2-Case4Scene') {
                    this.scene.start(caseInfo.scene, { partIndex: 0 });
                } else {
                    this.scene.start(caseInfo.scene);
                }
            };
            const button = this.createButton(480, buttonYStart + ((this.buttons.length - 1) * buttonYStep), caseInfo.title, false, action, caseInfo.enabled);
            this.buttons.push(button);
        });
        const backButton = this.createButton(480, buttonYStart + ((this.buttons.length - 2) * buttonYStep) + 80, '章選択に戻る', true, () => {
            if (this.isModalOpen) return;
            this.scene.start('ChapterSelectionScene');
        });
        this.buttons.push(backButton);

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
            up: 'W',
            down: 'S',
            arrowUp: 'UP',
            arrowDown: 'DOWN',
            enter: 'ENTER',
            e: 'E'
        });

        this.updateButtonStyles();
    }

    update() {
        if (this.isModalOpen) {
            return; // モーダル表示中はシーンの入力を一切受け付けない
        }

        let enterKeyHandledThisFrame = false; // このフレームでEnter/Eキーが処理されたか

        // モーダルを閉じた後、Enter/Eキーが離されるのを待つ
        if (this.ignoreEnterUntilKeyUp) {
            if (this.keys.enter.isUp && this.keys.e.isUp) {
                this.ignoreEnterUntilKeyUp = false;
                // キーが離された直後のフレームで、もしEnter/Eキーが押されているなら処理する
                if (this.keys.enter.isDown || this.keys.e.isDown) {
                    if (this.buttons[this.selectedButtonIndex] && this.buttons[this.selectedButtonIndex].getData('enabled')) {
                        this.buttons[this.selectedButtonIndex].emit('pointerdown');
                        enterKeyHandledThisFrame = true; // このフレームで処理済み
                    }
                }
            }
        }

        const findNextEnabled = (startIndex, direction) => {
            let nextIndex = (startIndex + direction + this.buttons.length) % this.buttons.length;
            while (nextIndex !== startIndex) {
                if (this.buttons[nextIndex] && this.buttons[nextIndex].getData('enabled')) {
                    return nextIndex;
                }
                nextIndex = (nextIndex + direction + this.buttons.length) % this.buttons.length;
            }
            return startIndex;
        };

        if (Phaser.Input.Keyboard.JustDown(this.keys.up) || Phaser.Input.Keyboard.JustDown(this.keys.arrowUp)) {
            this.selectedButtonIndex = findNextEnabled(this.selectedButtonIndex, -1);
            this.updateButtonStyles();
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.down) || Phaser.Input.Keyboard.JustDown(this.keys.arrowDown)) {
            this.selectedButtonIndex = findNextEnabled(this.selectedButtonIndex, 1);
            this.updateButtonStyles();
        }
        // ignoreEnterUntilKeyUpがfalseで、かつこのフレームでEnter/Eキーがまだ処理されていない場合
        else if (!this.ignoreEnterUntilKeyUp && !enterKeyHandledThisFrame && (Phaser.Input.Keyboard.JustDown(this.keys.enter) || Phaser.Input.Keyboard.JustDown(this.keys.e))) {
            if (this.buttons[this.selectedButtonIndex] && this.buttons[this.selectedButtonIndex].getData('enabled')) {
                this.buttons[this.selectedButtonIndex].emit('pointerdown');
            }
        }
    }

    createButton(x, y, text, isBackButton, action, enabled = true) {
        const defaultColor = isBackButton ? this.buttonColors.backDefault : this.buttonColors.default;
        let buttonText = text;
        if (!enabled) {
            buttonText += ' (作成中)';
        }
        const button = this.add.text(x, y, buttonText, {
            fontFamily: 'Arial, sans-serif',
            fontSize: isBackButton ? '20px' : '22px',
            fill: '#fff',
            backgroundColor: defaultColor,
            padding: { x: 20, y: 10 },
            borderRadius: 5
        }).setOrigin(0.5);
        button.setData('isBackButton', isBackButton);
        button.setData('enabled', enabled);
        if (enabled) {
            const buttonIndex = this.buttons.length;
            button.setInteractive();
            button.on('pointerover', () => {
                if (this.isModalOpen) return;
                this.game.canvas.style.cursor = 'pointer';
                this.selectedButtonIndex = buttonIndex;
                this.updateButtonStyles();
            });
            button.on('pointerout', () => {
                if (this.isModalOpen) return;
                this.game.canvas.style.cursor = 'default';
            });
            button.on('pointerdown', () => {
                if (this.isModalOpen) return;
                if (!button.getData('isHelpButton')) {
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, action);
                } else {
                    action();
                }
            });
        } else {
            button.setBackgroundColor(this.buttonColors.disabled);
            button.setAlpha(0.7);
        }
        return button;
    }

    createHelpIcon() {
        const helpButton = this.add.text(480, 200, 'プロンプト作成のコツ', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '22px',
            fill: '#fff',
            backgroundColor: this.buttonColors.helpDefault,
            padding: { x: 20, y: 10 },
            borderRadius: 5,
            shadow: { offsetX: 0, offsetY: 5, color: '#1e7e34', fill: true, blur: 5 }
        }).setOrigin(0.5).setInteractive();
        helpButton.setData('enabled', true);
        helpButton.setData('isHelpButton', true);
        const buttonIndex = this.buttons.length;
        helpButton.on('pointerover', () => {
            if (this.isModalOpen) return;
            this.game.canvas.style.cursor = 'pointer';
            this.selectedButtonIndex = buttonIndex;
            this.updateButtonStyles();
        });
        helpButton.on('pointerout', () => {
            if (this.isModalOpen) return;
            this.game.canvas.style.cursor = 'default';
        });
        helpButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            new HelpModal(this, helpModalContent).show();
        });
        return helpButton;
    }

    updateButtonStyles() {
        this.buttons.forEach((button, index) => {
            if (!button || !button.active) return;
            if (!button.getData('enabled')) {
                button.setBackgroundColor(this.buttonColors.disabled);
                button.setAlpha(0.7);
                return;
            }
            const isSelected = index === this.selectedButtonIndex;
            const isHelpButton = button.getData('isHelpButton');
            const isBackButton = button.getData('isBackButton');
            let color;
            if (isSelected) {
                color = this.buttonColors.selected;
            } else if (isHelpButton) {
                color = this.buttonColors.helpDefault;
            } else if (isBackButton) {
                color = this.buttonColors.backDefault;
            } else {
                color = this.buttonColors.default;
            }
            button.setBackgroundColor(color);
            button.setAlpha(1);
            button.off('pointerover');
            button.on('pointerover', () => {
                if (this.isModalOpen) return;
                this.game.canvas.style.cursor = 'pointer';
                this.selectedButtonIndex = index;
                this.updateButtonStyles();
            });
        });
    }
}