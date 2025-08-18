import Phaser from 'phaser';

/**
 * @class Collectible
 * @description プレイヤーが収集できるアイテムを管理するクラス。
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class Collectible extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene - このスプライトが属するシーン。
     * @param {number} x - X座標。
     * @param {number} y - Y座標。
     * @param {string} itemName - アイテムの名前。
     */
    constructor(scene, x, y, itemName) {
        super(scene, x, y, 'collectible_texture'); // Use a generic texture

        // アイテムの一意なIDを生成
        this.itemIdentifier = `${scene.scene.key}-${itemName}-${x}-${y}`;

        // グローバルな収集済みアイテムの状態をチェック
        const collectedItems = scene.registry.get('collectedItems');
        if (collectedItems[this.itemIdentifier]) {
            this.destroy();
            return;
        }

        // 動的なテクスチャ生成（初回のみ）
        if (!scene.textures.exists('collectible_texture')) {
            const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
            graphics.fillStyle(0xffd700, 1); // 金色
            graphics.fillCircle(10, 10, 10); // 半径10の円を描画
            graphics.generateTexture('collectible_texture', 20, 20);
            graphics.destroy();
        }

        this.setTexture('collectible_texture');

        // アイテムをシーンの表示リストと物理エンジンに追加
        scene.add.existing(this);
        scene.physics.add.existing(this);

        /**
         * @type {string} - アイテムの名前。
         */
        this.itemName = itemName;
        /**
         * @type {string} - インタラクションの際に識別するためのタイプ。
         */
        this.type = 'Collectible';
        
        this.setCollideWorldBounds(true); // 画面境界との衝突を有効化
        this.body.setAllowGravity(false); // 重力の影響を受けないようにする
    }

    
}