import Phaser from 'phaser';

/**
 * @class Portal
 * @description 他のシーンへの遷移を管理するポータルクラス。
 *              当たり判定のみを持つゾーンとして実装し、視覚的な表現を別途追加している。
 * @extends Phaser.GameObjects.Zone
 */
export default class Portal extends Phaser.GameObjects.Zone {
    /**
     * @param {Phaser.Scene} scene - このゾーンが属するシーン。
     * @param {number} x - X座標。
     * @param {number} y - Y座標。
     * @param {number} width - ゾーンの幅。
     * @param {number} height - ゾーンの高さ。
     * @param {string} targetScene - 遷移先のシーンのキー。
     */
    constructor(scene, x, y, width, height, targetScene) {
        super(scene, x, y, width, height);

        // ゾーンをシーンの表示リストと物理エンジンに追加
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.body.setAllowGravity(false); // 重力の影響を受けない
        this.body.setImmovable(true); // 他のオブジェクトに押されても動かない

        /**
         * @type {string} - 遷移先のシーンのキー名。
         */
        this.targetScene = targetScene;
        /**
         * @type {string} - インタラクションの際に識別するためのタイプ。
         */
        this.type = 'Portal';

        // ポータルを視覚的に表現するためのグラフィックを追加
        const graphics = scene.add.graphics({ x: this.x, y: this.y });
        graphics.fillStyle(0x8a2be2, 0.5); // 半透明の紫色
        graphics.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        this.graphics = graphics;

        // ポータルを目立たせるためのパーティクルエフェクトを追加
        const particles = scene.add.particles(0, 0, '__DEFAULT', {
            x: this.x,
            y: this.y,
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            gravityY: -200,
            frequency: 50,
            quantity: 1
        });
        particles.setDepth(1); // 描画深度を設定
        this.particles = particles;
    }

    /**
     * このポータルオブジェクトが破棄される際の処理。
     * 追加したグラフィックとパーティクルも一緒に破棄する。
     * @param {boolean} [fromScene=false] - シーン遷移に伴う破棄かどうか。
     */
    destroy(fromScene) {
        this.graphics.destroy();
        this.particles.destroy();
        super.destroy(fromScene);
    }
}