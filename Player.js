import Phaser from "phaser";

/**
 * @class Player
 * @description プレイヤーキャラクターを管理するクラス。物理演算、キーボード操作、アニメーション制御を行う。
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * Playerのインスタンスを作成する。
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

    // --- 初期設定 ---
    this.setScale(0.3); // スプライトシートが大きいので、表示サイズを30%に縮小
    this.setCollideWorldBounds(true); // 画面の境界線と衝突するように設定
    this.setDepth(10); // 描画の優先順位を設定（値が大きいほど手前に表示）
    this.body.setGravityY(300); // Y軸方向の重力を設定

    // --- 当たり判定の初期設定 ---
    // 物理ボディのサイズとオフセットを設定。スプライトの見た目と当たり判定を一致させる。
    // setSizeで当たり判定の大きさを決め、setOffsetでその位置を調整する。
    this.body.setSize(150, 350); 
    this.body.setOffset(175, 150);

    // --- 入力設定 ---
    // カーソルキー（矢印キー）とWASDキーの入力を受け付ける
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys("W,A,S,D");
  }

  /**
   * 毎フレーム呼ばれる更新処理。
   * プレイヤーのキー入力に応じた移動とアニメーション（テクスチャの切り替え）を処理する。
   */
  update() {
    const speed = 200; // 水平方向の移動速度
    const jumpPower = -500; // ジャンプ力

    // 左移動
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.setVelocityX(-speed); 
      // テクスチャが左向きでなければ切り替え
      if (this.texture.key !== "player_left") {
        this.setTexture("player_left")
          .setDisplaySize(150, 150) // 表示サイズは常に一定に保つ
          // 左向き画像(1024x1024)用の当たり判定サイズとオフセットに更新
          .body.setSize(300, 700) 
          .setOffset(362, 324);
      }
    // 右移動
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.setVelocityX(speed);
      // テクスチャが右向きでなければ切り替え
      if (this.texture.key !== "player_right") {
        this.setTexture("player_right")
          .setDisplaySize(150, 150) // 表示サイズは常に一定に保つ
          // 右向き画像(1024x1024)用の当たり判定サイズとオフセットに更新
          .body.setSize(300, 700)
          .setOffset(362, 324);
      }
    // 静止
    } else {
      this.setVelocityX(0); // 水平方向の速度を0に
      // テクスチャが正面向きでなければ切り替え
      if (this.texture.key !== "player") {
        this.setTexture("player")
          .setDisplaySize(150, 150) // 表示サイズは常に一定に保つ
          // 正面向き画像(500x500)用の当たり判定サイズとオフセットに更新
          .body.setSize(150, 350)
          .setOffset(175, 150);
      }
    }

    // ジャンプ
    // 地面に接している時に上キーまたはWキーが押されたらジャンプ
    if (
      (this.cursors.up.isDown || this.keys.W.isDown) &&
      this.body.touching.down
    ) {
      this.setVelocityY(jumpPower);
    }
  }
}