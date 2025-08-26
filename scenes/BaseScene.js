import Phaser from 'phaser';
import Player from '../Player.js';
import Otomo from '../Otomo.js';
import { createInventory } from '../ui.js';
import { gameData } from '../data/game-data.js';

export default class BaseScene extends Phaser.Scene {
    constructor(key) {
        super(key);
        this.player = null;
        this.otomo = null;
        this.entities = null;
        this.interactionText = null;
        this.interactionTarget = null;
        this.isModalOpen = false;
        this.portalModal = null;
        this.isAwaitingClose = false;
        this.inventoryManager = null;
        this.currentNPC = null;
        this.dialogBox = null;
        this.dialogText = null;
        this.dialogNameText = null;
        this.quizOptionsText = [];
        this.currentQuiz = null;
        this.quizActive = false;
        this.selectedOptionIndex = -1;
        this.typingEvent = null;
        this.isTyping = false;
        this.fullTextToType = '';
        this.dialogNextIndicator = null;
        this.dialogNextIndicatorTween = null;
        this.itemGetIndicator = null;
        this.wisdomBar = null;
        this.wisdomBarBg = null;
        this.wisdomText = null;
        this.entryData = null;
    }

    init(data) {
        this.entryData = data;
    }

    create(sceneData) {
        this.physics.world.setBounds(0, 0, sceneData.worldWidth || this.sys.game.config.width, this.sys.game.config.height);
        this.cameras.main.setBounds(0, 0, sceneData.worldWidth || this.sys.game.config.width, this.sys.game.config.height);
        
        const bgSettings = sceneData.backgroundSettings || {};
        const userScale = bgSettings.scale || 1;
        const scrollFactor = bgSettings.scrollFactor !== undefined ? bgSettings.scrollFactor : 0.5;
        const yOffset = bgSettings.yOffset || 0;
        const worldWidth = sceneData.worldWidth || this.sys.game.config.width;

        const bg = this.add.image(0, this.sys.game.config.height / 2 + yOffset, sceneData.background);
        
        const minScale = worldWidth / bg.width;
        const finalScale = Math.max(minScale, userScale);

        bg.setOrigin(0, 0.5).setScrollFactor(scrollFactor).setScale(finalScale);

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(this.physics.world.bounds.centerX, this.sys.game.config.height - 10).setSize(this.physics.world.bounds.width, 20).setVisible(false);

        const startX = this.entryData && this.entryData.entryX ? this.entryData.entryX : 100;
        this.player = new Player(this, startX, 450, 'player');
        this.physics.add.collider(this.player, this.platforms);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        this.otomo = new Otomo(this, this.player.x - 50, 450, 'otomo');
        this.physics.add.collider(this.otomo, this.platforms);

        this.inventoryManager = createInventory(this, this.registry.get('inventory'));
        this.interactionText = this.add.text(0, 0, 'Eキーで操作', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setVisible(false).setDepth(20);

        this.entities = this.add.group();
        this.createPortalModal();
        this.createDialogBox();
        this.createWisdomBar();
        this.createItemGetNotification();

        this.initializeInputHandlers();
    }

    createItemGetNotification() {
        const bg = this.add.graphics().setScrollFactor(0).setDepth(299).setAlpha(0);
        const txt = this.add.text(0, 0, '', {
            fontSize: '18px',
            fill: '#f1c40f',
            stroke: '#a67c00',
            strokeThickness: 2,
            fontFamily: 'Meiryo, sans-serif'
        }).setDepth(300).setAlpha(0);
        this.itemGetIndicator = { bg, txt };
    }

    collectItem(itemObject) {
        const inventory = this.registry.get('inventory');
        inventory.push(itemObject.itemName);
        this.registry.set('inventory', inventory);

        const collectedItems = this.registry.get('collectedItems');
        collectedItems[itemObject.itemIdentifier] = true;
        this.registry.set('collectedItems', collectedItems);

        this.inventoryManager.addItem(itemObject.itemName);
        this.showItemGetNotification(itemObject.itemName);

        itemObject.destroy();
    }

    showItemGetNotification(itemName) {
        if (this.itemGetTween) {
            this.itemGetTween.forEach(t => t.stop());
        }

        const { bg, txt } = this.itemGetIndicator;
        
        txt.setText(`◆ ${itemName} を手に入れた`);
        const textBounds = txt.getBounds();
        const padding = { x: 20, y: 10 };
        bg.clear();
        bg.fillStyle(0x2c3e50, 0.9);
        bg.lineStyle(2, 0xf1c40f, 1);
        bg.fillRoundedRect(20, 20, textBounds.width + padding.x * 2, textBounds.height + padding.y * 2, 8);
        bg.strokeRoundedRect(20, 20, textBounds.width + padding.x * 2, textBounds.height + padding.y * 2, 8);
        txt.setPosition(20 + padding.x, 20 + padding.y);

        bg.setAlpha(1);
        txt.setAlpha(1);

        const t1 = this.tweens.add({
            targets: [bg, txt],
            alpha: 0,
            duration: 500,
            ease: 'Power1',
            delay: 1500,
            paused: true
        });

        this.itemGetTween = [t1];
        t1.play();
    }

    update() {
        if (this.isModalOpen) {
            this.player.setVelocity(0);
            this.otomo.setVelocity(0);
            return;
        }

        if (this.player) this.player.update();
        if (this.otomo) this.otomo.update(this.player);

        this.findInteractionTarget();
    }

    initializeInputHandlers() {
        this.input.keyboard.on('keyup-I', () => {
            this.inventoryManager.toggleInventory();
        });

        this.input.keyboard.on('keyup-E', () => {
            if (this.isTyping) {
                this.skipTyping();
                return;
            }

            if (this.isAwaitingClose) {
                this.closeModal();
                return;
            }

            if (this.dialogNextIndicator) this.dialogNextIndicator.setVisible(false);
            if (this.dialogNextIndicatorTween) this.dialogNextIndicatorTween.pause();

            if (this.isModalOpen) {
                if (this.portalModal.visible) {
                    this.hidePortalModal(true);
                } else if (this.currentNPC) {
                    if (this.quizActive) {
                        if (this.selectedOptionIndex !== -1) {
                            const selectedOptionChar = String.fromCharCode(65 + this.selectedOptionIndex);
                            this.checkAnswer(selectedOptionChar);
                        }
                        return;
                    }
                    const nextDialog = this.currentNPC.getNextDialog();
                    if (nextDialog.text) {
                        this.openDialog(this.currentNPC.name, nextDialog.text);
                    } else if (this.currentNPC.quiz && !this.currentNPC.isQuizCompleted()) {
                        this.startQuiz(this.currentNPC.quiz);
                    } else {
                        this.closeModal();
                    }
                }
            } else if (this.interactionTarget) {
                this.interactWith(this.interactionTarget);
            }
        });

        this.input.keyboard.on('keyup-UP', () => {
            if (this.quizActive) {
                this.selectedOptionIndex = (this.selectedOptionIndex - 1 + this.currentQuiz.options.length) % this.currentQuiz.options.length;
                this.highlightSelectedOption();
            }
        });

        this.input.keyboard.on('keyup-DOWN', () => {
            if (this.quizActive) {
                this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.currentQuiz.options.length;
                this.highlightSelectedOption();
            }
        });
    }

    findInteractionTarget() {
        this.interactionTarget = null;
        let closestDistance = 100;
        this.entities.getChildren().forEach(entity => {
            if (entity.active) {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, entity.x, entity.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    this.interactionTarget = entity;
                }
            }
        });

        if (this.interactionTarget) {
            let interactionMessage = 'Eキーで操作'; // Default text
            switch (this.interactionTarget.type) {
                case 'NPC':
                    interactionMessage = 'Eキーで会話';
                    break;
                case 'Portal':
                    interactionMessage = 'Eキーで移動';
                    break;
                case 'Collectible':
                    interactionMessage = 'Eキーで拾う';
                    break;
            }
            this.interactionText.setText(interactionMessage);
            this.interactionText.x = this.interactionTarget.x;
            this.interactionText.y = this.interactionTarget.y - 50;
            this.interactionText.setVisible(true);
        } else {
            this.interactionText.setVisible(false);
        }
    }

    createPortalModal() {
        const modalWidth = 450;
        const modalHeight = 220;
        const modalX = (this.sys.game.config.width - modalWidth) / 2;
        const modalY = (this.sys.game.config.height - modalHeight) / 2;

        this.portalModal = this.add.container(modalX, modalY).setScrollFactor(0).setDepth(200).setVisible(false);

        const background = this.add.graphics();
        background.fillStyle(0x2c3e50, 0.95);
        background.lineStyle(3, 0xf1c40f, 1);
        background.fillRoundedRect(0, 0, modalWidth, modalHeight, 15);
        background.strokeRoundedRect(0, 0, modalWidth, modalHeight, 15);

        const text = this.add.text(modalWidth / 2, 60, '', { 
            fontFamily: 'Meiryo, sans-serif', 
            fontSize: '24px', 
            fill: '#ecf0f1',
            align: 'center',
            wordWrap: { width: modalWidth - 40 }
        }).setOrigin(0.5);

        // --- ボタンのスタイル定義 ---
        const buttonStyle = {
            fontFamily: 'Arial, sans-serif',
            fontSize: '22px',
            fill: '#ffffff',
            padding: { x: 25, y: 12 },
            borderRadius: 8,
        };

        // --- 「はい」ボタン ---
        const yesButton = this.add.text(modalWidth / 2 - 80, 155, 'はい', {
            ...buttonStyle,
            backgroundColor: '#2ecc71',
            shadow: { offsetX: 0, offsetY: 4, color: '#25a25a', fill: true, blur: 4 }
        }).setOrigin(0.5).setInteractive();

        // --- 「いいえ」ボタン ---
        const noButton = this.add.text(modalWidth / 2 + 80, 155, 'いいえ', {
            ...buttonStyle,
            backgroundColor: '#e74c3c',
            shadow: { offsetX: 0, offsetY: 4, color: '#c0392b', fill: true, blur: 4 }
        }).setOrigin(0.5).setInteractive();

        this.portalModal.add([background, text, yesButton, noButton]);

        // --- ボタンのインタラクション ---
        yesButton.on('pointerdown', () => this.hidePortalModal(true));
        noButton.on('pointerdown', () => this.hidePortalModal(false));

        [yesButton, noButton].forEach(button => {
            const originalColor = button.style.backgroundColor;
            const hoverColor = Phaser.Display.Color.HexStringToColor(originalColor).lighten(10).rgba;

            button.on('pointerover', () => {
                this.game.canvas.style.cursor = 'pointer';
                button.setBackgroundColor(hoverColor);
            });
            button.on('pointerout', () => {
                this.game.canvas.style.cursor = 'default';
                button.setBackgroundColor(originalColor);
            });
        });
    }

    showPortalModal(displayName, targetSceneKey) {
        this.isModalOpen = true;
        const text = this.portalModal.getAt(1);
        text.setText(`${displayName} へ移動しますか？`);
        this.portalModal.setVisible(true);
        this.portalTarget = targetSceneKey;
    }

    hidePortalModal(confirmed) {
        this.isModalOpen = false;
        this.portalModal.setVisible(false);
        if (confirmed) {
            this.scene.start(this.portalTarget, { entryX: this.interactionTarget.entryX });
        }
    }

    interactWith(entity) {
        if (!entity) return;

        switch (entity.type) {
            case 'Collectible':
                this.collectItem(entity);
                break;
            case 'Portal':
                const targetSceneData = gameData.scenes[entity.targetScene];
                const displayName = (targetSceneData && targetSceneData.displayName) ? targetSceneData.displayName : entity.targetScene;
                this.showPortalModal(displayName, entity.targetScene);
                break;
            case 'NPC':
                this.currentNPC = entity;
                const nextDialog = entity.getNextDialog();
                if (nextDialog.text) {
                    this.openDialog(entity.name, nextDialog.text);
                } else if (entity.quiz && !entity.isQuizCompleted()) {
                    this.startQuiz(entity.quiz);
                } else {
                    this.closeModal();
                }
                break;
        }
    }

    createDialogBox() {
        this.dialogBox = this.add.graphics().setScrollFactor(0);
        this.dialogBox.fillStyle(0x1c1c1c, 0.9);
        this.dialogBox.fillRoundedRect(50, 350, 860, 240, 15);
        this.dialogBox.setDepth(100).setVisible(false);
        this.dialogNameText = this.add.text(80, 365, '', { fontFamily: 'Meiryo, sans-serif', fontSize: '24px', fill: '#e67e22', fontStyle: 'bold' }).setScrollFactor(0);
        this.dialogNameText.setDepth(101).setVisible(false);
        this.dialogText = this.add.text(80, 400, '', { fontFamily: 'Meiryo, sans-serif', fontSize: '22px', fill: '#f0f0f0', wordWrap: { width: 800, useAdvanced: true } }).setScrollFactor(0);
        this.dialogText.setDepth(101).setVisible(false);

        for (let i = 0; i < 4; i++) {
            const optionY = 445 + (i * 35);
            const optionText = this.add.text(80, optionY, '', { fontFamily: 'Meiryo, sans-serif', fontSize: '20px', fill: '#f0f0f0', wordWrap: { width: 800, useAdvanced: true } }).setScrollFactor(0).setDepth(101).setVisible(false).setInteractive();
            this.quizOptionsText.push(optionText);
            optionText.on('pointerdown', () => { 
                if(this.quizActive) this.checkAnswer(optionText.text.charAt(0)); 
            });
            optionText.on('pointerover', () => optionText.setStyle({ fill: '#ffd700' }));
            optionText.on('pointerout', () => optionText.setStyle({ fill: '#f0f0f0' }));
        }

        this.dialogNextIndicator = this.add.text(890, 570, 'Eキーで次へ▼', { fontSize: '16px', fill: '#fff' }).setOrigin(1, 1).setScrollFactor(0).setDepth(102).setVisible(false);
        this.dialogNextIndicatorTween = this.tweens.add({ targets: this.dialogNextIndicator, alpha: 0, ease: 'Power1', duration: 700, yoyo: true, repeat: -1 }).pause();
    }

    hideQuizOptions() {
        this.quizOptionsText.forEach(optionText => optionText.setVisible(false));
    }

    openDialog(name, text) {
        this.isModalOpen = true;
        this.dialogNameText.setText(name);
        this.dialogBox.setVisible(true);
        this.dialogNameText.setVisible(true);
        this.dialogText.setVisible(true);
        this.hideQuizOptions();
        this.typewriteText(this.dialogText, text);
    }

    startQuiz(quiz) {
        this.currentQuiz = quiz;
        this.quizActive = true;
        this.selectedOptionIndex = -1;
        this.dialogText.setVisible(true);
        this.dialogNameText.setVisible(false);
        this.typewriteText(this.dialogText, quiz.question);
        quiz.options.forEach((option, index) => {
            const optionChar = String.fromCharCode(65 + index);
            const optionText = this.quizOptionsText[index];
            optionText.setText(`${optionChar}. ${option}`);
            optionText.setVisible(true);
        });
        this.dialogBox.setVisible(true);
    }

    highlightSelectedOption() {
        this.quizOptionsText.forEach((optionText, index) => {
            if (index === this.selectedOptionIndex) {
                optionText.setStyle({ fill: '#ffd700' });
            } else {
                optionText.setStyle({ fill: '#f0f0f0' });
            }
        });
    }

    checkAnswer(selectedChar) {
        this.quizActive = false;
        this.isAwaitingClose = true;
        const correct = this.currentQuiz.correctAnswer === selectedChar;

        if (correct) {
            const currentCorrect = this.registry.get('correctAnswers');
            this.registry.set('correctAnswers', currentCorrect + 1);
        }
        
        const completedQuizzes = this.registry.get('completedQuizzes');
        if (!completedQuizzes.includes(this.currentNPC.quizId)) {
            completedQuizzes.push(this.currentNPC.quizId);
            this.registry.set('completedQuizzes', completedQuizzes);
        }

        this.updateWisdomBar();

        const feedback = correct ? "正解！" : "残念！";
        const explanation = `${feedback}\n\n【解説】\n${this.currentQuiz.explanation || 'ここに解説が入ります。'}`;

        if (this.isTyping) {
            this.typingEvent.remove();
            this.isTyping = false;
        }
        this.dialogText.setWordWrapWidth(800, true);
        this.typewriteText(this.dialogText, explanation);
        this.hideQuizOptions();
    }

    closeModal() {
        this.isModalOpen = false;
        this.isAwaitingClose = false;
        this.quizActive = false;
        if (this.currentNPC) {
            this.currentNPC.resetDialog();
        }
        this.currentNPC = null;
        this.currentQuiz = null;
        this.dialogBox.setVisible(false);
        this.dialogNameText.setVisible(false);
        this.dialogText.setVisible(false);
        this.hideQuizOptions();
        if (this.dialogNextIndicator) this.dialogNextIndicator.setVisible(false);
        if (this.dialogNextIndicatorTween) this.dialogNextIndicatorTween.pause();
    }

    typewriteText(textObject, text) {
        this.fullTextToType = text;
        this.isTyping = true;
        textObject.setText('');
        if (this.dialogNextIndicator) this.dialogNextIndicator.setVisible(false);
        if (this.dialogNextIndicatorTween) this.dialogNextIndicatorTween.pause();

        let i = 0;
        this.typingEvent = this.time.addEvent({
            delay: 50,
            callback: () => {
                i++;
                textObject.setText(text.substring(0, i));
                if (i === text.length) {
                    this.isTyping = false;
                    this.typingEvent.remove();
                    if (this.dialogNextIndicator) this.dialogNextIndicator.setVisible(true);
                    if (this.dialogNextIndicatorTween) this.dialogNextIndicatorTween.resume();
                }
            },
            repeat: text.length - 1
        });
    }

    skipTyping() {
        if (this.isTyping) {
            this.typingEvent.remove();
            this.isTyping = false;
            this.dialogText.setText(this.fullTextToType);
            if (this.dialogNextIndicator) this.dialogNextIndicator.setVisible(true);
            if (this.dialogNextIndicatorTween) this.dialogNextIndicatorTween.resume();
        }
    }

    createWisdomBar() {
        const barWidth = 300;
        const barHeight = 25;
        const x = this.sys.game.config.width / 2;
        const y = 70; // Changed from 50 to 70

        this.wisdomText = this.add.text(x, y - 5, '賢者の知恵', {
            fontSize: '18px',
            fill: '#fff',
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(101);

        this.wisdomBarBg = this.add.graphics().setScrollFactor(0).setDepth(100);
        this.wisdomBarBg.fillStyle(0x000000, 0.5);
        this.wisdomBarBg.fillRoundedRect(x - barWidth / 2, y, barWidth, barHeight, 8);

        this.wisdomBar = this.add.graphics().setScrollFactor(0).setDepth(101);
        
        this.updateWisdomBar();
    }

    updateWisdomBar() {
        const correctAnswers = this.registry.get('correctAnswers');
        const totalQuizzes = this.registry.get('totalQuizzes');
        const percentage = totalQuizzes > 0 ? (correctAnswers / totalQuizzes) : 0;

        const barWidth = 300;
        const barHeight = 25;
        const x = this.sys.game.config.width / 2;
        const y = 70; // Changed from 50 to 70
        const innerPadding = 4;

        this.wisdomBar.clear();
        this.wisdomBar.fillStyle(0xf1c40f, 1); // Gold color for wisdom
        if (percentage > 0) {
            this.wisdomBar.fillRoundedRect(
                x - barWidth / 2 + innerPadding, 
                y + innerPadding,
                (barWidth - innerPadding * 2) * percentage,
                barHeight - innerPadding * 2,
                6
            );
        }
    }
}