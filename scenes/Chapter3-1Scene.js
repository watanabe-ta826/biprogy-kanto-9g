import BaseChapterScene from './BaseChapterScene.js';

export default class Chapter3_1Scene extends BaseChapterScene {
    constructor() {
        super('Chapter3-1Scene');
    }

    create() {
        super.create();
        this.add.text(480, 300, '第3章: AIの落とし穴', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    }
}