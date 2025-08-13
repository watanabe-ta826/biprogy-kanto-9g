import BaseScene from './BaseScene.js';
import NPC from '../NPC.js';
import Portal from '../Portal.js';
import { gameData } from '../data/game-data.js';

/**
 * @class HubScene
 * @description 拠点となるシーン。NPCとの会話や、他のシーンへのポータルを持つ。
 * @extends BaseScene
 */
export default class HubScene extends BaseScene {
    constructor() {
        super('HubScene');
    }

    /**
     * シーンが作成されるときに呼び出される。
     * BaseSceneのcreateを呼び出した後、このシーン固有のエンティティを配置する。
     */
    create() {
        // game-dataからハブシーン用のデータを取得
        const sceneData = gameData.scenes.HubScene;
        // BaseSceneのcreateメソッドを呼び出して、共通の初期化処理を行う
        super.create(sceneData);

        // シーン固有のエンティティ（NPCやポータル）をデータに基づいて作成・配置
        sceneData.entities.forEach(entityData => {
            let entity;
            switch (entityData.type) {
                case 'NPC':
                    entity = new NPC(this, entityData.x, entityData.y, entityData.name, entityData.dialog, entityData.isStatic);
                    this.physics.add.collider(entity, this.platforms);
                    break;
                case 'Portal':
                    entity = new Portal(this, entityData.x, entityData.y, 50, 100, entityData.targetScene);
                    break;
            }
            if (entity) {
                this.entities.add(entity); // 作成したエンティティを管理グループに追加
            }
        });
    }

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
            case 'Portal':
                this.showPortalModal(entity.targetScene);
                break;
        }
    }

    
}
