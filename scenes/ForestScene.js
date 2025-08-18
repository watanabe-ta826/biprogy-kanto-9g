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

        
    }

    

    

    
}
