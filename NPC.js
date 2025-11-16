import Phaser from "phaser";

export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene,
    x,
    y,
    name,
    dialog,
    isStatic = false,
    quiz = null,
    completedDialog = null,
    imageName = null
  ) {
    let textureName = imageName;
    // imageNameが指定されていない場合、以前のバージョンとの互換性のために動的にテクスチャを生成
    if (!textureName || !scene.textures.exists(textureName)) {
      console.warn(
        `NPC "${name}" の画像名(imageName)が指定されていないか、テクスチャが存在しません。デフォルトのテクスチャを生成します。`
      );
      const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(0x0000ff, 1);
      graphics.fillRect(0, 0, 32, 64);
      textureName = `npc_texture_${name}_${x}_${y}`;
      graphics.generateTexture(textureName, 32, 64);
      graphics.destroy();
    }

    super(scene, x, y, textureName);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.name = name;
    this.dialog = dialog;
    this.dialogIndex = 0;
    this.isStatic = isStatic;
    this.quiz = quiz;
    this.completedDialog = completedDialog || ["もうクイズは解いたよ。"];
    this.type = "NPC";
    this.quizId = scene.scene.key + "_" + this.name;

    // 画像のサイズに合わせて当たり判定を調整
    // プレイヤーのサイズ感に合わせるためにスケールを調整
    if (imageName) {
      this.setScale(0.12); // この数値を変更して大きさを調整してください (例: 0.5 = 50%の大きさ)

    }

    this.body
      .setSize(this.width * 0.5, this.height * 0.2)
      .setOffset(this.width * 0.25, this.height * 0.8);

    if (isStatic) {
      this.setImmovable(true);
      this.body.allowGravity = false;
    }

    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 1);
    this.setDepth(5);
  }

  isQuizCompleted() {
    const completedQuizzes = this.scene.registry.get("completedQuizzes");
    const result = completedQuizzes.includes(this.quizId);
    // console.log(
    //   `[DEBUG] NPC.isQuizCompleted for ${this.quizId}: ${result}. Registry:`,
    //   completedQuizzes
    // );
    return result;
  }

  getNextDialog() {
    // Original dialog logic
    const isLast = this.dialogIndex === this.dialog.length - 1;
    if (this.dialogIndex >= this.dialog.length) {
      return { text: null, isLast: true };
    }
    const dialog = this.dialog[this.dialogIndex];
    this.dialogIndex++;
    return { text: dialog, isLast: isLast };
  }

  resetDialog() {
    this.dialogIndex = 0;
  }
}
