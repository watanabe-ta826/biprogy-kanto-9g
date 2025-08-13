import Phaser from 'phaser';

/**
 * @class Otomo
 * @description プレイヤーに追従する「お供」キャラクターを管理するクラス。
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class Otomo extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene - このスプライトが属するシーン。
     * @param {number} x - X座標。
     * @param {number} y - Y座標。
     * @param {string} texture - 使用するテクスチャのキー。
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        // お供をシーンの表示リストと物理エンジンに追加
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.1); // サイズを調整
        this.setDepth(9); // 描画深度を設定（プレイヤーより少し後ろ）
        this.setCollideWorldBounds(true); // 画面境界との衝突を有効化
        this.body.setAllowGravity(false); // 重力の影響を受けないようにする

        /**
         * @type {number} - 上下に揺れるアニメーション（ふわふわ）のためのタイマー変数
         */
        this.floatTimer = 0;
    }

    /**
     * 毎フレーム呼ばれる更新処理。
     * プレイヤーに追従し、ふわふわと揺れる動きを表現する。
     * @param {Player} player - 追従対象のプレイヤーオブジェクト。
     */
    update(player) {
        // 1. プレイヤーの少し斜め上を基本的な目標位置とする
        const targetX = player.x - 40;
        const targetY = player.y - 40;

        // 2. サイン波を利用して、目標Y座標を上下に揺らす
        this.floatTimer += 0.05; // 揺れる速さ
        const floatOffset = Math.sin(this.floatTimer) * 10; // 揺れ幅
        const finalTargetY = targetY + floatOffset;

        // 3. 物理エンジンを使って、最終的な目標位置へ滑らかに移動
        const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, finalTargetY);
        const speed = 200; // 移動速度

        // プレイヤーから一定距離以上離れている場合のみ、追従する
        if (distance > 30) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, finalTargetY);
            this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        } else {
            // プレイヤーに近い場合は、その場で停止する
            this.setVelocity(0, 0);
        }
    }
}
