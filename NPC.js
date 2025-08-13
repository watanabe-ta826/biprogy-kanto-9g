import Phaser from 'phaser';

/**
 * @class NPC
 * @description NPC（ノンプレイヤーキャラクター）を管理するクラス。会話やクイズの機能を持つ。
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class NPC extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene - このスプライトが属するシーン。
     * @param {number} x - X座標。
     * @param {number} y - Y座標。
     * @param {string} name - NPCの名前。
     * @param {Array<string>} dialog - NPCの会話内容の配列。
     * @param {boolean} [isStatic=false] - 静的なオブジェクト（ミッションボードなど）かどうか。
     * @param {object} [quiz=null] - NPCが持つクイズのデータ。
     */
    constructor(scene, x, y, name, dialog, isStatic = false, quiz = null) {
        // NPC用のテクスチャを動的に生成（現在は青い四角形）
        const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
        graphics.fillStyle(0x0000ff, 1); // 青色
        graphics.fillRect(0, 0, 32, 64); // 32x64の四角形を描画
        const textureName = `npc_texture_${x}_${y}`;
        graphics.generateTexture(textureName, 32, 64);
        graphics.destroy();

        super(scene, x, y, textureName);

        // NPCをシーンの表示リストと物理エンジンに追加
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.name = name;
        this.dialog = dialog;
        this.dialogIndex = 0; // 現在の会話の進行度
        this.isStatic = isStatic;
        this.quiz = quiz;
        this.type = 'NPC'; // インタラクションの際に識別するためのタイプ

        // 当たり判定のサイズとオフセットを設定
        this.setSize(32, 64);
        this.setOffset(0, 0);

        // isStaticがtrueの場合、他のオブジェクトに押されても動かなくする
        if (isStatic) {
            this.setImmovable(true);
            this.body.allowGravity = false;
        }

        this.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1); // スプライトの基準点を底辺の中央に設定
        this.setDepth(5); // 描画深度を設定
    }

    /**
     * 次の会話テキストを取得し、会話の進行度を1つ進める。
     * @returns {{text: string|null, isLast: boolean}} 次の会話テキストと、それが最後の会話かどうかのフラグ。
     */
    getNextDialog() {
        const isLast = (this.dialogIndex === this.dialog.length - 1);
        if (this.dialogIndex >= this.dialog.length) {
            return { text: null, isLast: true }; // すべての会話が終了した場合
        }
        const dialog = this.dialog[this.dialogIndex];
        this.dialogIndex++;
        return { text: dialog, isLast: isLast };
    }

    /**
     * 会話の進行度をリセットする。
     * これにより、再度話しかけた時に最初の会話から始まる。
     */
    resetDialog() {
        this.dialogIndex = 0;
    }
}
