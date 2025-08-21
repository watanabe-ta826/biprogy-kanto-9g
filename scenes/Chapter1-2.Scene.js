import BaseChapterScene from './BaseChapterScene.js';
import Portal from '../Portal.js';
import { gameData } from '../data/game-data.js';

export default class Chapter1_2_Scene extends BaseChapterScene {
    constructor() {
        super('Chapter1-2.Scene');
    }

    create() {
        const sceneData = gameData.scenes['Chapter1-2.Scene'];
        super.create(sceneData);

        // This scene can have its own entities defined in game-data.js
        if (sceneData.entities) {
            sceneData.entities.forEach(entityData => {
                let entity;
                switch (entityData.type) {
                    case 'Portal':
                        entity = new Portal(this, entityData.x, entityData.y, 50, 100, entityData.targetScene);
                        break;
                    // Add other entity types if needed
                }
                if (entity) {
                    this.entities.add(entity);
                }
            });
        }
    }
}