import BaseChapterScene from './BaseChapterScene.js';
import NPC from '../NPC.js';
import Collectible from '../Collectible.js';
import Portal from '../Portal.js';
import { gameData } from '../data/game-data.js';

/**
 * @class Chapter1_1Scene
 * @description ゲームの最初の章（クイズがあるシーン）を管理するクラス。
 * @extends BaseChapterScene
 */
export default class Chapter1_1Scene extends BaseChapterScene {
    constructor() {
        super('Chapter1-1Scene');
    }

    /**
     * シーンが作成されるときに呼び出される。
     * BaseChapterSceneのcreateを呼び出した後、このシーン固有のエンティティを配置する。
     */
    create() {
        const sceneData = gameData.scenes['Chapter1-1Scene'];
        super.create(sceneData);

        // シーン固有のエンティティを作成・配置
        sceneData.entities.forEach(entityData => {
            let entity;
            switch (entityData.type) {
                case 'NPC':
                    entity = new NPC(this, entityData.x, entityData.y, entityData.name, entityData.dialog, entityData.isStatic, entityData.quiz);
                    this.physics.add.collider(entity, this.platforms);
                    break;
                case 'Collectible': // 'Collectible'タイプの作り方を追加
                    entity = new Collectible(this, entityData.x, entityData.y, entityData.itemName);
                    break;
                case 'Portal':
                    entity = new Portal(this, entityData.x, entityData.y, 50, 100, entityData.targetScene, entityData.entryX);
                    break;
            }
            if (entity) {
                this.entities.add(entity);
            }
        });
    }
}