import Phaser from "phaser";

/**
 * @class Player
 * @description プレイヤーキャラクターを管理するクラス。物理演算、操作、インベントリ機能を持つ。
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene - このスプライトが属するシーン。
   * @param {number} x - X座標。
   * @param {number} y - Y座標。
   * @param {string} texture - 使用するテクスチャのキー。
   */
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    // プレイヤーをシーンの表示リストと物理エンジンに追加
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.3); // スプライトのサイズを調整
    this.setCollideWorldBounds(true); // 画面の境界線と衝突するように設定
    this.setDepth(10); // 描画の優先順位を設定（値が大きいほど手前に表示）

    // 物理ボディのサイズを設定（表示サイズとは別に当たり判定のサイズを指定）
    this.body.setSize(300, 500);

    this.body.setGravityY(300); // Y軸方向の重力を設定

    // カーソルキー（矢印キー）の入力を受け付ける
    this.cursors = scene.input.keyboard.createCursorKeys();
    // WASDキーの入力を受け付ける
    this.keys = scene.input.keyboard.addKeys("W,A,S,D");
  }

  /**
   * 毎フレーム呼ばれる更新処理。
   * プレイヤーの移動を処理する。
   */
  update() {
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.setVelocityX(-200); // 左に移動
      if (this.texture.key !== "player_left") {
        this.setTexture("player_left")
          .setDisplaySize(150, 150) // 表示サイズを固定
          .body.setSize(300, 700) // 左向き(1024x1024)用の当たり判定サイズ
          .setOffset(362, 324); // 左向き(1024x1024)用の当たり判定オフセット
      }
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.setVelocityX(200); // 右に移動
      if (this.texture.key !== "player_right") {
        this.setTexture("player_right")
          .setDisplaySize(150, 150) // 表示サイズを固定
          .body.setSize(300, 700) // 右向き(1024x1024)用の当たり判定サイズ
          .setOffset(362, 324); // 右向き(1024x1024)用の当たり判定オフセット
      }
    } else {
      this.setVelocityX(0); // 水平方向の速度を0に
      if (this.texture.key !== "player") {
        this.setTexture("player")
          .setDisplaySize(150, 150) // 表示サイズを固定
          .body.setSize(150, 350) // 正面向き(500x500)用の当たり判定サイズ
          .setOffset(175, 150); // 正面向き(500x500)用の当たり判定オフセット
      }
    }

    // 地面に接している時に上キーまたはWキーが押されたらジャンプ
    if (
      (this.cursors.up.isDown || this.keys.W.isDown) &&
      this.body.touching.down
    ) {
      this.setVelocityY(-500);
    }
  }
}
