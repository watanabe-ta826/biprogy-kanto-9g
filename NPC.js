import Phaser from 'phaser';

export default class NPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, dialog, isStatic = false, quiz = null, completedDialog = null) {
        const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
        graphics.fillStyle(0x0000ff, 1);
        graphics.fillRect(0, 0, 32, 64);
        const textureName = `npc_texture_${name}_${x}_${y}`;
        graphics.generateTexture(textureName, 32, 64);
        graphics.destroy();

        super(scene, x, y, textureName);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.name = name;
        this.dialog = dialog;
        this.dialogIndex = 0;
        this.isStatic = isStatic;
        this.quiz = quiz;
        this.completedDialog = completedDialog || ['もうクイズは解いたよ。'];
        this.type = 'NPC';
        this.quizId = scene.scene.key + '_' + this.name;

        this.setSize(32, 64);
        this.setOffset(0, 0);

        if (isStatic) {
            this.setImmovable(true);
            this.body.allowGravity = false;
        }

        this.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1);
        this.setDepth(5);
    }

    isQuizCompleted() {
        const completedQuizzes = this.scene.registry.get('completedQuizzes');
        const result = completedQuizzes.includes(this.quizId);
        return result;
    }

    getNextDialog() {
        // Original dialog logic
        const isLast = (this.dialogIndex === this.dialog.length - 1);
        if (this.dialogIndex >= this.dialog.length) {
            return { text: null, isLast: true };
        }
        const dialog = this.dialog[this.dialogIndex];
        this.dialogIndex++;
        return { text: dialog, isLast: isLast };
    }

    resetDialog() {
        this.dialogIndex = 0;
    }
}