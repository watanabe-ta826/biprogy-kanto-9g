import BaseChapterScene from './BaseChapterScene.js';
import Portal from '../Portal.js';
import NPC from '../NPC.js';
import { gameData } from '../data/game-data.js';

export default class Chapter1_3Scene extends BaseChapterScene {
    constructor() {
        super('Chapter1-3Scene');
    }

    create() {
        const sceneData = gameData.scenes['Chapter1-3Scene'];
        super.create(sceneData);

        if (sceneData.entities) {
            sceneData.entities.forEach(entityData => {
                let entity;
                switch (entityData.type) {
                    case 'Portal':
                        entity = new Portal(this, entityData.x, entityData.y, 50, 100, entityData.targetScene, entityData.entryX);
                        break;
                    case 'NPC':
                        entity = new NPC(this, entityData.x, entityData.y, entityData.name, entityData.dialog, entityData.isStatic, entityData.quiz, entityData.completedDialog);
                        this.physics.add.collider(entity, this.platforms);
                        break;
                }
                if (entity) {
                    this.entities.add(entity);
                }
            });
        }
    }
}