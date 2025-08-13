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
        // アイテム用のテクスチャを動的に生成（現在は金色の円）
        const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
        graphics.fillStyle(0xffd700, 1); // 金色
        graphics.fillCircle(10, 10, 10); // 半径10の円を描画
        const textureName = `collectible_texture_${x}_${y}`;
        graphics.generateTexture(textureName, 20, 20);
        graphics.destroy();

        super(scene, x, y, textureName);

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

    /**
     * アイテムが収集されたときの処理。
     * このアイテムをシーンから削除する。
     */
    collect() {
        this.destroy();
        // プレイヤーのインベントリへの追加処理は、
        // 衝突を検知するシーン側（例: ForestScene）で行われる。
    }
}