import BaseScene from './BaseScene.js';
import NPC from '../NPC.js';
// 新しく追加するエンティティのクラスをインポートします
import Portal from '../Portal.js';
import Collectible from '../Collectible.js';
import { gameData } from '../data/game-data.js';

/**
 * @class Chapter1Scene
 * @description ゲームの最初の章（クイズがあるシーン）を管理するクラス。
 * @extends BaseScene
 */
export default class Chapter1Scene extends BaseScene {
    constructor() {
        super('Chapter1Scene');
    }

    /**
     * シーンが作成されるときに呼び出される。
     * BaseSceneのcreateを呼び出した後、このシーン固有のエンティティを配置する。
     */
    create() {
        const sceneData = gameData.scenes.Chapter1Scene;
        super.create(sceneData);

        // シーン固有のエンティティを作成・配置
        sceneData.entities.forEach(entityData => {
            let entity;
            switch (entityData.type) {
                case 'NPC':
                    entity = new NPC(this, entityData.x, entityData.y, entityData.name, entityData.dialog, entityData.isStatic, entityData.quiz);
                    this.physics.add.collider(entity, this.platforms);
                    break;
                // --- ▼ここから追加 --- 
                case 'Collectible': // 'Collectible'タイプの作り方を追加
                    entity = new Collectible(this, entityData.x, entityData.y, entityData.itemName);
                    break;
                case 'Portal': // 'Portal'タイプの作り方を追加
                    entity = new Portal(this, entityData.x, entityData.y, 50, 100, entityData.targetScene);
                    break;
                // --- ▲ここまで追加 --- 
            }
            if (entity) {
                this.entities.add(entity);
            }
        });

        // --- ▼ここから追加 --- 
        // プレイヤーがエンティティグループと重なったときの処理を設定
        this.physics.add.overlap(this.player, this.entities, this.handleOverlap, null, this);
        // --- ▲ここまで追加 --- 
    }

    // --- ▼ここから追加 --- 
    /**
     * プレイヤーがエンティティと重なった時に呼び出されるコールバック関数。
     * @param {Player} player - プレイヤーオブジェクト。
     * @param {Phaser.GameObjects.Sprite} entity - 重なったエンティティ。
     */
    handleOverlap(player, entity) {
        if (entity.type === 'Collectible') {
            this.showItemGetNotification(entity.itemName); // 通知を表示
            player.addItem(entity.itemName);
            entity.collect();
        }
    }
    // --- ▲ここまで追加 --- 

    /**
     * エンティティとのインタラクション処理。BaseSceneの同名メソッドをオーバーライド。
     * @param {Phaser.GameObjects.Sprite} entity - インタラクションの対象。
     */
    interactWith(entity) {
        switch (entity.type) {
            case 'NPC':
                this.currentNPC = entity;
                const dialog = entity.getNextDialog();
                if (dialog.text) {
                    this.openDialog(entity.name, dialog.text);
                }
                break;
            // --- ▼ここから追加 --- 
            case 'Portal': // ポータルとのインタラクション処理を追加
                this.showPortalModal(entity.targetScene);
                break;
            // --- ▲ここまで追加 --- 
        }
    }
}