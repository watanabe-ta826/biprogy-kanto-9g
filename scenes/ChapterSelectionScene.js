import Phaser from 'phaser';
import { introScenario, chapter1IntroScenario, chapter3IntroScenario } from '../data/game-data.js';

export default class ChapterSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChapterSelectionScene' });
        this.buttons = [];
        this.selectedButtonIndex = 0;
        this.buttonColors = {
            default: '#3498db',
            hover: '#2980b9',
            selected: '#f1c40f',
            introDefault: '#95a5a6',
            introHover: '#aab7b8',
            introSelected: '#f1c40f'
        };
    }

    preload() {
        if (!this.textures.exists('hub_background')) {
            this.load.image('hub_background', 'img/hub_background.jpg');
        }
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.registry.set('completedQuizzes', []);
        this.registry.set('correctAnswers', 0);

        this.add.image(480, 300, 'hub_background').setScale(1);

        this.add.text(480, 100, '章選択', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '50px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5);

        this.buttons = [];
        this.selectedButtonIndex = 0;

        const buttonYStart = 200;
        const buttonYStep = 80;

        // Button configurations
        const buttonConfigs = [
            {
                text: '第1章: AIって怖いもの？ ～AIとは​何かを​学ぶ～',
                y: buttonYStart,
                isIntro: false,
                action: () => this.scene.start('StoryScene', { scenario: chapter1IntroScenario, nextScene: 'Chapter1-1Scene' })
            },
            {
                text: '＜第２章＞村人の​お悩みを​AIで​解決　～AIの​使い方を​学ぶ～',
                y: buttonYStart + buttonYStep,
                isIntro: false,
                action: () => this.scene.start('Chapter2SelectionScene')
            },
            {
                text: '第3章: AIの落とし穴　～AIのリスクを学ぶ～',
                y: buttonYStart + buttonYStep * 2,
                isIntro: false,
                action: () => this.scene.start('StoryScene', { scenario: chapter3IntroScenario, nextScene: 'Chapter3-1Scene' })
            },
            {
                text: 'プロローグをもう一度',
                y: buttonYStart + buttonYStep * 3.5,
                isIntro: true,
                action: () => this.scene.start('StoryScene', { scenario: introScenario, nextScene: 'ChapterSelectionScene' })
            }
        ];

        buttonConfigs.forEach((config, index) => {
            const button = this.createButton(480, config.y, config.text, config.isIntro, config.action, index);
            this.buttons.push(button);
        });

        this.updateButtonStyles();
        this.addKeyListeners();

        // Add controls text
        this.add.text(940, 580, 'W/S or ↑/↓: 選択 | E: 決定', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 1);
    }

    createButton(x, y, text, isIntro, action, index) {
        const defaultColor = isIntro ? this.buttonColors.introDefault : this.buttonColors.default;
        
        const button = this.add.text(x, y, text, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: defaultColor,
            padding: { x: 20, y: 10 },
            borderRadius: 5
        }).setOrigin(0.5);

        button.setInteractive();

        button.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            this.selectedButtonIndex = index;
            this.updateButtonStyles();
        });

        button.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            // We don't reset index on pointerout to keep selection with keyboard
        });

        button.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, action);
        });

        return button;
    }

    addKeyListeners() {
        this.input.keyboard.on('keyup', (event) => {
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
            const isIntro = button.text.includes('プロローグ');
            const isSelected = index === this.selectedButtonIndex;

            let color = isIntro ? this.buttonColors.introDefault : this.buttonColors.default;
            if (isSelected) {
                color = isIntro ? this.buttonColors.introSelected : this.buttonColors.selected;
            }

            button.setBackgroundColor(color);
        });
    }
}