import BaseScene from './BaseScene.js';
import Portal from '../Portal.js';
import Collectible from '../Collectible.js';
import { gameData } from '../data/game-data.js';

/**
 * @class ForestScene
 * @description 森のシーン。アイテム収集やハブへのポータルを持つ。
 * @extends BaseScene
 */
export default class ForestScene extends BaseScene {
    constructor() {
        super('ForestScene');
    }

    /**
     * シーンが初期化されるときに呼び出されるPhaserの標準メソッド。
     * 他のシーンから渡されたデータを受け取る。
     * @param {object} data - 他のシーンから渡されたデータ。
     */
    init(data) {
        this.targetSceneKey = data.to || 'forest';
    }

    /**
     * シーンが作成されるときに呼び出される。
     */
    create() {
        const sceneData = gameData.scenes[this.targetSceneKey];
        if (!sceneData) {
            console.error(`Scene data for ${this.targetSceneKey} not found.`);
            this.scene.start('HubScene'); // データが見つからない場合はハブに戻る
            return;
        }
        super.create(sceneData);

        // シーン固有のエンティティ（ポータルや収集アイテム）を作成・配置
        sceneData.entities.forEach(entityData => {
            let entity;
            switch (entityData.type) {
                case 'Portal':
                    entity = new Portal(this, entityData.x, entityData.y, 50, 100, entityData.targetScene);
                    break;
                case 'Collectible':
                    entity = new Collectible(this, entityData.x, entityData.y, entityData.itemName);
                    break;
            }
            if (entity) {
                this.entities.add(entity);
            }
        });

        // プレイヤーとエンティティグループの衝突検知を設定
        this.physics.add.overlap(this.player, this.entities, this.handleOverlap, null, this);
    }

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

    /**
     * Eキーによるインタラクション処理。BaseSceneの同名メソッドをオーバーライド。
     * @param {Phaser.GameObjects.Sprite} entity - インタラクションの対象。
     */
    interactWith(entity) {
        // ポータルとのインタラクション
        if (entity.type === 'Portal') {
            this.showPortalModal(entity.targetScene);
        }
        // Note: アイテム収集はEキーではなく、重なるだけで自動的に行われるように変更済み。
    }

    
}
