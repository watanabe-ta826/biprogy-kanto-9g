import Phaser from "phaser";
import Player from "../Player.js";
// import { createInventory } from '../ui.js';
import { gameData } from "../data/game-data.js";
import QuizModal from "../QuizModal.js";

export default class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.player = null;
    this.entities = null;
    this.interactionText = null;
    this.interactionTarget = null;
    this.isModalOpen = false;
    this.isAwaitingClose = false;
    // this.inventoryManager = null;
    this.currentNPC = null;
    this.dialogBox = null;
    this.dialogText = null;
    this.dialogNameText = null;
    this.typingEvent = null;
    this.isTyping = false;
    this.fullTextToType = "";
    this.dialogNextIndicator = null;
    this.dialogNextIndicatorTween = null;
    this.questUiBg = null;
    this.questUiText = null;
    this.entryData = null;
    this.quizModal = null;
    this.isTransitioning = false; // シーン遷移中のフラグ
  }

  init(data) {
    this.entryData = data;
    this.isTransitioning = false;
  }

  create(sceneData) {
    this.physics.world.setBounds(
      0,
      0,
      sceneData.worldWidth || this.sys.game.config.width,
      this.sys.game.config.height
    );
    this.cameras.main.setBounds(
      0,
      0,
      sceneData.worldWidth || this.sys.game.config.width,
      this.sys.game.config.height
    );

    const bgSettings = sceneData.backgroundSettings || {};
    const userScale = bgSettings.scale || 1;
    const scrollFactor =
      bgSettings.scrollFactor !== undefined ? bgSettings.scrollFactor : 0.5;
    const yOffset = bgSettings.yOffset || 0;
    const worldWidth = sceneData.worldWidth || this.sys.game.config.width;

    const bg = this.add.image(
      0,
      this.sys.game.config.height / 2 + yOffset,
      sceneData.background
    );

    const minScale = worldWidth / bg.width;
    const finalScale = Math.max(minScale, userScale);

    bg.setOrigin(0, 0.5).setScrollFactor(scrollFactor).setScale(finalScale);

    this.platforms = this.physics.add.staticGroup();
    this.platforms
      .create(
        this.physics.world.bounds.centerX,
        this.sys.game.config.height - 10
      )
      .setSize(this.physics.world.bounds.width, 20)
      .setVisible(false);

    // 床の当たり判定のみを描画
    const debugGraphics = this.add.graphics();
    debugGraphics.lineStyle(1, 0x00ff00, 0.5); // 太さ1、緑色で半透明の線
    this.platforms.children.each(platform => {
        const body = platform.body;
        debugGraphics.strokeRect(body.x, body.y, body.width, body.height);
    });

    const startX =
      this.entryData && this.entryData.entryX ? this.entryData.entryX : 100;
    this.player = new Player(this, startX, 450, "player");
    this.physics.add.collider(this.player, this.platforms);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // this.inventoryManager = createInventory(this, this.registry.get('inventory'));
    this.interactionText = this.add
      .text(0, 0, "Eキーで操作", {
        fontSize: "24px",
        fill: "#fff",
        padding: { top: 5, bottom: 5 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(20);

    this.entities = this.add.group();
    this.createDialogBox();
    this.quizModal = new QuizModal(this);
    this.createQuestTracker();

    this.initializeInputHandlers();
  }

  update() {
    if (this.isModalOpen || this.isTransitioning) {
      if (this.player) this.player.setVelocity(0);
      return;
    }

    if (this.player) this.player.update();

    this.findInteractionTarget();
  }

  initializeInputHandlers() {
    // this.input.keyboard.on('keyup-I', () => {
    //     this.inventoryManager.toggleInventory();
    // });

    const handleInteraction = () => {
      if (this.quizModal && this.quizModal.isShowingCompleted) {
        this.quizModal.closeModal(null);
        return;
      }

      if (this.quizModal && this.quizModal.isOpen) {
        return;
      }

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
        if (this.currentNPC) {
          this.handleNpcInteraction();
        }
      } else if (this.interactionTarget) {
        this.interactWith(this.interactionTarget);
      }
    };

    this.input.keyboard.on("keyup-E", handleInteraction);
    this.input.keyboard.on("keyup-ENTER", handleInteraction);
  }

  findInteractionTarget() {
    if (this.isTransitioning) {
        this.interactionText.setVisible(false);
        this.interactionTarget = null;
        return;
    }
    this.interactionTarget = null;
    let closestDistance = 100;
    this.entities.getChildren().forEach((entity) => {
      if (entity.active) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          entity.x,
          entity.y
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          this.interactionTarget = entity;
        }
      }
    });

    if (this.interactionTarget) {
      let interactionMessage = "E/Enterキーで操作"; // Default text
      switch (this.interactionTarget.type) {
        case "NPC":
          interactionMessage = "E/Enterキーで会話";
          break;
        case "Portal":
          // ポータルの遷移先シーンがChapter1のシーンかどうかをチェック
          const targetSceneKey = this.interactionTarget.targetScene;
          const chapter1Scenes = gameData.chapters.chapter1.scenes;
          if (chapter1Scenes.includes(targetSceneKey)) {
            interactionMessage = "E/Enterキーで次へ";
          } else {
            interactionMessage = "E/Enterキーで移動";
          }
          break;
      }
      this.interactionText.setText(interactionMessage);
      this.interactionText.x = this.interactionTarget.x;
      this.interactionText.y = this.interactionTarget.y - 80;
      this.interactionText.setVisible(true);
    } else {
      this.interactionText.setVisible(false);
    }
  }

  interactWith(entity) {
    if (!entity || this.isTransitioning) return;

    switch (entity.type) {
      case "Portal":
        this.isTransitioning = true; // シーン遷移中のフラグ
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start(entity.targetScene, {
            entryX: entity.entryX,
          });
        });
        break;
      case "NPC":
        this.currentNPC = entity;
        this.handleNpcInteraction();
        break;
    }
  }

  handleNpcInteraction() {
    // console.log(
    //   `[DEBUG] handleNpcInteraction called for ${this.currentNPC.name}`
    // );
    if (!this.currentNPC) return;

    if (this.currentNPC.quiz && this.currentNPC.isQuizCompleted()) {
      // console.log("[DEBUG] Quiz is completed. Calling showCompletedQuiz.");
      const quizData = this.currentNPC.quiz;
      if (this.dialogBox.visible) {
        this.closeModal();
      }
      this.quizModal.showCompletedQuiz(quizData);
      return;
    }

    const nextDialog = this.currentNPC.getNextDialog();
    if (nextDialog.text) {
      // console.log("[DEBUG] Showing next dialog text.");
      this.openDialog(this.currentNPC.name, nextDialog.text);
    } else if (this.currentNPC.quiz && !this.currentNPC.isQuizCompleted()) {
      // console.log("[DEBUG] Dialogue finished. Calling handleQuiz.");
      this.handleQuiz();
    } else {
      // console.log("[DEBUG] No more dialogue or quiz. Closing modal.");
      this.closeModal();
    }
  }

  async handleQuiz() {
    // console.log("[DEBUG] handleQuiz called.");
    const quizData = this.currentNPC.quiz;
    const quizId = this.currentNPC.quizId;

    const correct = await this.quizModal.startQuiz(quizData);
    // console.log(`[DEBUG] Quiz finished. Result: ${correct}`);

    // クイズモーダルが閉じた後にNPCの対話状態を閉じる
    this.closeModal();

    if (correct) {
      // console.log("[DEBUG] Answer was correct. Updating score.");
      const currentCorrect = this.registry.get("correctAnswers");
      this.registry.set("correctAnswers", currentCorrect + 1);
    }

    const completedQuizzes = this.registry.get("completedQuizzes");
    if (!completedQuizzes.includes(quizId)) {
      // console.log(`[DEBUG] Adding ${quizId} to completedQuizzes.`);
      completedQuizzes.push(quizId);
      this.registry.set("completedQuizzes", completedQuizzes);
    }

    this.updateQuestTracker();
  }

  createDialogBox() {
    this.dialogBox = this.add.graphics().setScrollFactor(0);
    this.dialogBox.fillStyle(0x1c1c1c, 0.9);
    this.dialogBox.fillRoundedRect(50, 350, 860, 240, 15);
    this.dialogBox.setDepth(100).setVisible(false);
    this.dialogNameText = this.add
      .text(80, 365, "", {
        fontFamily: "Meiryo, sans-serif",
        fontSize: "24px",
        fill: "#e67e22",
        fontStyle: "bold",
      })
      .setScrollFactor(0);
    this.dialogNameText.setDepth(101).setVisible(false);
    this.dialogText = this.add
      .text(80, 400, "", {
        fontFamily: "Meiryo, sans-serif",
        fontSize: "22px",
        fill: "#f0f0f0",
        wordWrap: { width: 800, useAdvanced: true },
      })
      .setScrollFactor(0);
    this.dialogText.setDepth(101).setVisible(false);

    this.dialogNextIndicator = this.add
      .text(890, 570, "Eキーで次へ▼", { fontSize: "16px", fill: "#fff" })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(102)
      .setVisible(false);
    this.dialogNextIndicatorTween = this.tweens
      .add({
        targets: this.dialogNextIndicator,
        alpha: 0,
        ease: "Power1",
        duration: 700,
        yoyo: true,
        repeat: -1,
      })
      .pause();
  }

  openDialog(name, text) {
    this.isModalOpen = true;
    this.dialogNameText.setText(name);
    this.dialogBox.setVisible(true);
    this.dialogNameText.setVisible(true);
    this.dialogText.setVisible(true);
    this.typewriteText(this.dialogText, text);
  }

  closeModal() {
    this.isModalOpen = false;
    this.isAwaitingClose = false;
    if (this.currentNPC) {
      this.currentNPC.resetDialog();
    }
    this.currentNPC = null;
    this.dialogBox.setVisible(false);
    this.dialogNameText.setVisible(false);
    this.dialogText.setVisible(false);
    if (this.dialogNextIndicator) this.dialogNextIndicator.setVisible(false);
    if (this.dialogNextIndicatorTween) this.dialogNextIndicatorTween.pause();
  }

  typewriteText(textObject, text) {
    this.fullTextToType = text;
    this.isTyping = true;
    textObject.setText("");
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
          if (this.dialogNextIndicator)
            this.dialogNextIndicator.setVisible(true);
          if (this.dialogNextIndicatorTween)
            this.dialogNextIndicatorTween.resume();
        }
      },
      repeat: text.length - 1,
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

  createQuestTracker() {
    const x = 20;
    const y = 20;

    this.questUiBg = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.questUiText = this.add
      .text(x + 15, y + 10, "", {
        fontSize: "18px",
        fill: "#fff",
        fontFamily: "Meiryo, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(101);

    this.updateQuestTracker();
  }

  updateQuestTracker() {
    const completedQuizzes = this.registry.get("completedQuizzes") || [];
    const completedCount = completedQuizzes.length;
    const totalQuizzes = this.chapterData
      ? this.chapterData.totalQuizzes
      : this.registry.get("totalQuizzes") || 6;

    const text = `村人にAIについて教えて回る (${completedCount}/${totalQuizzes})`;
    this.questUiText.setText(text);

    const textBounds = this.questUiText.getBounds();
    const padding = { x: 15, y: 10 };
    this.questUiBg.clear();
    this.questUiBg.fillStyle(0x000000, 0.7);
    this.questUiBg.fillRoundedRect(
      textBounds.x - padding.x,
      textBounds.y - padding.y,
      textBounds.width + padding.x * 2,
      textBounds.height + padding.y * 2,
      8
    );
  }

  shutdown() {}
}
