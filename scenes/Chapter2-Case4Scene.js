import BaseCaseScene from './BaseCaseScene.js';
import { helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';
import { createCopyButton } from '../CopyButton.js';

export default class Chapter2_Case4Scene extends BaseCaseScene {
    constructor() {
        super('Chapter2-Case4Scene');
        this.currentPage = 0;
        this.questionsPerPage = 3;
        this.questionElements = [];
    }

    displayExercise(exercise) {
        this.currentPage = 0; // 現在のページをリセット
        // 既存のUI要素をクリア
        this.uiElements.forEach(el => el.destroy());
        this.uiElements = [];
        this.questionElements = [];

        if (exercise.image) {
            this.add.image(480, 300, exercise.image).setScale(0.8).setDepth(-1);
        }

        const { formX, formY, formWidth, formHeight, descriptionText } = this.createFormBase({
            description: exercise.description
        });
        
        this.createCommonUI();

        const allQuestions = exercise.questions;
        const totalPages = Math.ceil(allQuestions.length / this.questionsPerPage);
        
        let startY;

        if (exercise.id === 'exercise1') {
            // --- 演習①のレイアウト処理 ---
            let lastY = descriptionText ? descriptionText.y + descriptionText.displayHeight : formY + 50;

            if (exercise.referenceText) {
                const refText = this.add.text(formX + 40, lastY + 15, exercise.referenceText, { fontSize: '14px', fill: '#ddd', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 6 }).setOrigin(0, 0);
                this.uiElements.push(refText);
                lastY = refText.y + refText.displayHeight;
            }
            
            if (exercise.copyButton) {
                const { buttonText, x, y, textToCopy } = exercise.copyButton;
                const copyButton = createCopyButton(this, formX + x, formY + y, textToCopy, buttonText);
                this.uiElements.push(copyButton);
            }

            startY = lastY + 15;

            const pageYPositions = new Array(totalPages).fill(startY);
            allQuestions.forEach((q, index) => {
                const pageIndex = Math.floor(index / this.questionsPerPage);
                const qText = this.add.text(formX + 40, pageYPositions[pageIndex], q.text, { fontSize: '12px', fill: '#fff', wordWrap: { width: formWidth - 80 }});
                const inputHeight = 25; // 高さを調整
                const input = this.add.dom(formX + 40, pageYPositions[pageIndex] + qText.height + 3).createFromHTML(`<textarea id="${q.id}" style="width: ${formWidth - 80}px; height: ${inputHeight}px; font-size: 11px; padding: 5px; border-radius: 5px;"></textarea>`).setOrigin(0, 0);
                this.uiElements.push(qText, input);
                this.questionElements.push({ qText, input, pageIndex });
                pageYPositions[pageIndex] += qText.height + inputHeight + 20; // マージン調整
            });

        } else { // exercise2 and others
            // --- 演習②のレイアウト処理 ---
            let lastY = descriptionText ? descriptionText.y + descriptionText.displayHeight : formY + 50;

            if (exercise.referenceText) {
                const refText = this.add.text(formX + 40, lastY + 20, exercise.referenceText, { fontSize: '16px', fill: '#ddd', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 6 }).setOrigin(0, 0);
                this.uiElements.push(refText);
                lastY = refText.y + refText.displayHeight;
            }

            if (exercise.copyButton) {
                let actualTextToCopy = exercise.copyButton.textToCopy;
                if (actualTextToCopy === '') {
                    let combinedText = '';
                    if (exercise.referenceText) { combinedText += exercise.referenceText; }
                    if (exercise.questions && exercise.questions.length > 0) {
                        if (combinedText !== '') { combinedText += '\n\n'; }
                        combinedText += exercise.questions.map(q => q.text).join('\n');
                    }
                    actualTextToCopy = combinedText;
                }
                const { buttonText, x } = exercise.copyButton;
                const copyButton = createCopyButton(this, formX + x, lastY + 15, actualTextToCopy, buttonText);
                this.uiElements.push(copyButton);
                lastY = copyButton.y + copyButton.displayHeight;
            }

            startY = lastY + 30;

            const pageYPositions = new Array(totalPages).fill(startY);
            allQuestions.forEach((q, index) => {
                const pageIndex = Math.floor(index / this.questionsPerPage);
                const qText = this.add.text(formX + 40, pageYPositions[pageIndex], q.text, { fontSize: '14px', fill: '#fff', wordWrap: { width: formWidth - 80 }});
                const inputHeight = 18;
                const input = this.add.dom(formX + 40, pageYPositions[pageIndex] + qText.height + 5).createFromHTML(`<textarea id="${q.id}" style="width: ${formWidth - 80}px; height: ${inputHeight}px; font-size: 12px; padding: 5px; border-radius: 5px;"></textarea>`).setOrigin(0, 0);
                this.uiElements.push(qText, input);
                this.questionElements.push({ qText, input, pageIndex });
                pageYPositions[pageIndex] += qText.height + inputHeight + 30;
            });
        }


        // --- ページネーションと完了ボタン (共通) ---
        let pageText, prevButton, nextButton;

        const updatePageVisibility = (newPage) => {
            this.currentPage = newPage;
            this.questionElements.forEach(elem => {
                const isVisible = elem.pageIndex === this.currentPage;
                elem.qText.setVisible(isVisible);
                elem.input.setVisible(isVisible);
            });
            if (pageText) pageText.setText(`${this.currentPage + 1} / ${totalPages}`);
            if (prevButton) prevButton.setVisible(this.currentPage > 0);
            if (nextButton) nextButton.setVisible(this.currentPage < totalPages - 1);
        };
        
        const bottomY = formY + formHeight - 40;

        if (totalPages > 1) {
            pageText = this.add.text(formX + formWidth / 2, bottomY, '', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
            prevButton = this.add.text(formX + formWidth / 2 - 80, bottomY, '前へ', { fontSize: '20px', fill: '#fff', backgroundColor: '#3498db', padding: {x:15, y:8}, borderRadius: 5 }).setOrigin(1, 0.5).setInteractive();
            nextButton = this.add.text(formX + formWidth / 2 + 80, bottomY, '次へ', { fontSize: '20px', fill: '#fff', backgroundColor: '#3498db', padding: {x:15, y:8}, borderRadius: 5 }).setOrigin(0, 0.5).setInteractive();
            
            this.uiElements.push(pageText, prevButton, nextButton);

            prevButton.on('pointerdown', () => updatePageVisibility(this.currentPage - 1));
            nextButton.on('pointerdown', () => updatePageVisibility(this.currentPage + 1));
        }

        updatePageVisibility(this.currentPage);

        const submitButton = this.add.text(formX + formWidth - 40, bottomY, '完了', { fontSize: '24px', fill: '#fff', backgroundColor: '#27ae60', padding: {x:20, y:10}, borderRadius: 5 }).setOrigin(1, 0.5).setInteractive();
        this.uiElements.push(submitButton);
        submitButton.on('pointerdown', () => {
            this.scene.start(this.sys.settings.key, { partIndex: this.currentPartIndex + 1 });
        });
    }

    shutdown() {
        super.shutdown();
        this.questionElements = [];
    }
}
