import BaseCaseScene from './BaseCaseScene.js';
import { helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';

export default class Chapter2_Case1Scene extends BaseCaseScene {
    constructor() {
        super('Chapter2-Case1Scene');
    }

    displayExercise(exercise) {
        if (exercise.image) {
            this.add.image(480, 300, exercise.image).setScale(1.0).setDepth(-1);
        }

        const { formX, formY, formWidth, formHeight } = this.createFormBase({
            description: exercise.description,
        });
        
        this.createCommonUI();

        // Download button
        if (exercise.downloadFile) {
            // Viteのbase URLを考慮して、絶対パスを動的に構築
            const baseUrl = import.meta.env.BASE_URL;
            const safeBaseUrl = (baseUrl === '/' || baseUrl === './') ? '' : baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            const fileUrl = `${safeBaseUrl}/${exercise.downloadFile.url}`;

            const buttonHtml = `
                <a href="${fileUrl}" 
                   download 
                   style="
                        display: inline-block;
                        background-color: #007bff; 
                        color: white; 
                        padding: 10px 20px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 18px;
                        transform: translateX(-50%);
                        left: 50%;
                        position: relative;
                   ">
                   ${exercise.downloadFile.buttonText}
                </a>
            `;
            const downloadButton = this.add.dom(formX + formWidth / 2, formY + 250).createFromHTML(buttonHtml);
            this.uiElements.push(downloadButton);
        }

        // Submit button
        const submitButton = this.add.text(formX + formWidth / 2, formY + formHeight - 60, '議事録を役人に提出', { fontSize: '24px', fill: '#fff', backgroundColor: '#27ae60', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(0.5).setInteractive();
        this.uiElements.push(submitButton);

        submitButton.on('pointerdown', () => {
            if (this.isModalOpen) return;
            if (confirm('内容は確認しましたか？')) {
                this.scene.start(this.sys.settings.key, { partIndex: this.currentPartIndex + 1 });
            }
        });
    }
}