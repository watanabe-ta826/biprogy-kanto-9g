import BaseCaseScene from './BaseCaseScene.js';
import { helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';

export default class Chapter2_Case2Scene extends BaseCaseScene {
    constructor() {
        super('Chapter2-Case2Scene');
    }

    displayExercise(exercise) {
        if (exercise.image) {
            this.add.image(480, 300, exercise.image).setScale(1.0).setDepth(-1);
        }

        const { formX, formY, formWidth, formHeight } = this.createFormBase({
            description: exercise.description,
        });

        this.createCommonUI();

        if (exercise.downloadFiles && Array.isArray(exercise.downloadFiles)) {
            const baseUrl = import.meta.env.BASE_URL;
            const safeBaseUrl = (baseUrl === '/' || baseUrl === './') ? '' : baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            
            let downloadButtonY = formY + 200;
            exercise.downloadFiles.forEach(fileInfo => {
                const fileUrl = `${safeBaseUrl}/${fileInfo.url}`;
                const buttonHtml = `
                    <a href="${fileUrl}" download style="display: inline-block; background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-size: 16px; margin-bottom: 10px;">
                       ${fileInfo.buttonText}
                    </a>`;
                const downloadButton = this.add.dom(formX + formWidth / 2, downloadButtonY).createFromHTML(buttonHtml);
                downloadButton.setOrigin(0.5, 0.5);
                this.uiElements.push(downloadButton);
                downloadButtonY += 50;
            });
        }

        const submitButton = this.add.text(formX + formWidth / 2, formY + formHeight - 60, exercise.submitButtonText || '完了', { fontSize: '24px', fill: '#fff', backgroundColor: '#27ae60', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
        this.uiElements.push(submitButton);

        submitButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            if (confirm('内容は確認しましたか？')) {
                this.scene.start(this.sys.settings.key, { partIndex: this.currentPartIndex + 1 });
            }
        });
    }
}