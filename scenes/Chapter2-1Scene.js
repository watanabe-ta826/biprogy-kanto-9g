import BaseChapterScene from './BaseChapterScene.js';
import { gameData } from '../data/game-data.js';

export default class Chapter2_1Scene extends BaseChapterScene {
    constructor() {
        super('Chapter2-1Scene');
    }

    create() {
        const sceneData = gameData.scenes[this.scene.key];
        super.create(sceneData);
        this.add.text(480, 300, '第2章: 村人のお悩みをAIで解決', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    }
}