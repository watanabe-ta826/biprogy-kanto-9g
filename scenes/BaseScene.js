import Phaser from 'phaser';
import Player from '../Player.js';
import Otomo from '../Otomo.js';
import { createInventory } from '../ui.js';

/**
 * @class BaseScene
 * @description すべてのゲームシーンの基盤となるクラス。
 * @extends Phaser.Scene
 */
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
        this.itemGetIndicator = null; // アイテム取得通知用のテキスト
    }

    create(sceneData) {
        this.physics.world.setBounds(0, 0, sceneData.worldWidth || this.sys.game.config.width, this.sys.game.config.height);
        this.cameras.main.setBounds(0, 0, sceneData.worldWidth || this.sys.game.config.width, this.sys.game.config.height);
        this.add.image(480, 300, sceneData.background).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(this.physics.world.bounds.centerX, this.sys.game.config.height - 10).setSize(this.physics.world.bounds.width, 20).setVisible(false);

        this.player = new Player(this, 100, 450, 'player');
        this.physics.add.collider(this.player, this.platforms);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        this.otomo = new Otomo(this, 50, 450, 'otomo');
        this.physics.add.collider(this.otomo, this.platforms);

        this.inventoryManager = createInventory(this);
        this.interactionText = this.add.text(0, 0, 'Eキーで操作', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setVisible(false).setDepth(20);

        this.entities = this.add.group();
        this.createPortalModal();
        this.createDialogBox();

        this.initializeInputHandlers();

        // アイテム取得通知用のUIを作成
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

    /**
     * アイテムを取得した際に通知を表示する。
     * @param {string} itemName - 取得したアイテムの名前。
     */
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

        // 最初に表示状態にする
        bg.setAlpha(1);
        txt.setAlpha(1);

        // 1.5秒待ってから0.5秒かけて消えるアニメーション
        const t1 = this.tweens.add({
            targets: [bg, txt],
            alpha: 0,
            duration: 500,
            ease: 'Power1',
            delay: 1500,
            paused: true // すぐには実行しない
        });

        this.itemGetTween = [t1];
        t1.play(); // アニメーションを開始
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
            if (this.isAwaitingClose) return;

            if (this.isTyping) {
                this.skipTyping();
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
                    } else if (this.currentNPC.quiz) {
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
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, entity.x, entity.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                this.interactionTarget = entity;
            }
        });

        if (this.interactionTarget) {
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

        // 背景の作成
        const background = this.add.graphics();
        background.fillStyle(0x2c3e50, 0.95); // 深い青色
        background.lineStyle(3, 0xf1c40f, 1); // 金色の枠線
        background.fillRoundedRect(0, 0, modalWidth, modalHeight, 15);
        background.strokeRoundedRect(0, 0, modalWidth, modalHeight, 15);

        // テキスト
        const text = this.add.text(modalWidth / 2, 60, '', { 
            fontFamily: 'Meiryo, sans-serif', 
            fontSize: '24px', 
            fill: '#ecf0f1',
            align: 'center',
            wordWrap: { width: modalWidth - 40 }
        }).setOrigin(0.5);

        // 「はい」ボタン
        const yesButtonBg = this.add.graphics({ x: modalWidth / 2 - 110, y: 130 });
        yesButtonBg.fillStyle(0x27ae60, 1); // 緑色
        yesButtonBg.fillRoundedRect(0, 0, 100, 50, 10);
        const yesButton = this.add.text(modalWidth / 2 - 60, 155, 'はい', { 
            fontSize: '22px', fill: '#fff' 
        }).setOrigin(0.5).setInteractive();

        // 「いいえ」ボタン
        const noButtonBg = this.add.graphics({ x: modalWidth / 2 + 10, y: 130 });
        noButtonBg.fillStyle(0xc0392b, 1); // 赤色
        noButtonBg.fillRoundedRect(0, 0, 100, 50, 10);
        const noButton = this.add.text(modalWidth / 2 + 60, 155, 'いいえ', { 
            fontSize: '22px', fill: '#fff' 
        }).setOrigin(0.5).setInteractive();

        this.portalModal.add([background, text, yesButtonBg, yesButton, noButtonBg, noButton]);

        // ボタンのインタラクション
        yesButton.on('pointerdown', () => this.hidePortalModal(true));
        noButton.on('pointerdown', () => this.hidePortalModal(false));

        [yesButton, noButton].forEach(btn => {
            btn.on('pointerover', () => { this.game.canvas.style.cursor = 'pointer'; btn.setAlpha(0.8); });
            btn.on('pointerout', () => { this.game.canvas.style.cursor = 'default'; btn.setAlpha(1); });
        });
    }

    showPortalModal(targetScene) {
        this.isModalOpen = true;
        const text = this.portalModal.getAt(1);
        text.setText(`${targetScene} へ移動しますか？`);
        this.portalModal.setVisible(true);
        this.portalTarget = targetScene;
    }

    hidePortalModal(confirmed) {
        this.isModalOpen = false;
        this.portalModal.setVisible(false);
        if (confirmed) {
            // portalTargetに格納されたシーンキーに直接遷移する
            this.scene.start(this.portalTarget, { to: this.portalTarget });
        }
    }

    interactWith(entity) {}

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
            optionText.on('pointerdown', () => { this.checkAnswer(optionText.text.charAt(0)); });
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
        const feedback = correct ? this.currentQuiz.feedback.correct : this.currentQuiz.feedback.incorrect;
        if (this.isTyping) {
            this.typingEvent.remove();
            this.isTyping = false;
        }
        this.dialogText.setWordWrapWidth(800, true);
        this.typewriteText(this.dialogText, feedback);
        this.hideQuizOptions();
        this.time.delayedCall(5000, () => { this.closeModal(); });
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
}
