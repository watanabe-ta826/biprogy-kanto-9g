import BaseCaseScene from './BaseCaseScene.js';
import { helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';
import { createCopyButton } from '../CopyButton.js';
import { SCENE_KEYS } from '../constants.js';

export default class Chapter2_Case3Scene extends BaseCaseScene {
    constructor() {
        super(SCENE_KEYS.Chapter2_Case3Scene);
    }

    displayExercise(exercise) {
        if (exercise.image) {
            this.add.image(480, 300, exercise.image).setScale(1.0).setDepth(-1);
        }

        const { formX, formY, formWidth, formHeight } = this.createFormBase({
            description: exercise.description,
        });

        this.createCommonUI();

        if (exercise.copyButton) {
            const { textToCopy, buttonText, x, y } = exercise.copyButton;
            const copyButton = createCopyButton(this, formX + x, formY + y, textToCopy, buttonText);
            this.uiElements.push(copyButton);
        }

        if (exercise.referenceText) {
            const refText = this.add.text(formX + 40, formY + 120, exercise.referenceText, { fontSize: '16px', fill: '#ddd', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 6 }).setOrigin(0, 0);
            this.uiElements.push(refText);
        }

        let y = formY + (exercise.referenceText ? 260 : 120);

        exercise.questions.forEach(q => {
            const qText = this.add.text(formX + 40, y, q.text, { fontSize: '18px', fill: '#fff' });
            const inputHeight = exercise.id === 'exercise1' ? 30 : 50;
            const input = this.add.dom(formX + 40, y + qText.height + 15).createFromHTML(`<textarea id="${q.id}" style="width: ${formWidth - 80}px; height: ${inputHeight}px; font-size: 16px; padding: 5px; border-radius: 5px;"></textarea>`).setOrigin(0, 0);
            this.uiElements.push(qText, input);
            y += qText.height + inputHeight + 40;
        });

        const submitButton = this.add.text(formX + formWidth / 2, formY + formHeight - 40, '完了', { fontSize: '24px', fill: '#fff', backgroundColor: '#27ae60', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
        this.uiElements.push(submitButton);

        submitButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            if (exercise.id === 'exercise1') {
                const answer = document.getElementById('q1').value;
                if (answer.trim() === exercise.correctAnswer.q1) {
                    this.scene.start(this.sys.settings.key, { partIndex: this.currentPartIndex + 1 });
                } else {
                    alert(exercise.feedback.incorrect);
                }
            } else {
                this.scene.start(this.sys.settings.key, { partIndex: this.currentPartIndex + 1 });
            }
        });
    }
}
