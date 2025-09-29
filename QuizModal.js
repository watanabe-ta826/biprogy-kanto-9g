import Phaser from 'phaser';

export default class QuizModal {
    constructor(scene) {
        this.scene = scene;
        this.modal = null;
        this.questionText = null;
        this.optionsText = [];
        this.resultText = null;
        this.explanationImage = null;
        this.submitButton = null;

        this.modalWidth = 0;
        this.modalHeight = 0;

        this.currentQuiz = null;
        this.selectedOptions = new Set();
        this.selectedOptionIndex = -1; // For keyboard navigation
        this.quizActive = false;
        this.resolvePromise = null;
        this.isOpen = false;
        this.isShowingCompleted = false;
        this.controlsText = null;

        this.createModal();
    }

    createModal() {
        this.modalWidth = 800;
        this.modalHeight = 500;
        const modalX = (this.scene.sys.game.config.width - this.modalWidth) / 2;
        const modalY = (this.scene.sys.game.config.height - this.modalHeight) / 2;

        this.modal = this.scene.add.container(modalX, modalY).setScrollFactor(0).setDepth(200).setVisible(false);

        const background = this.scene.add.graphics();
        background.fillStyle(0x2c3e50, 0.95);
        background.lineStyle(3, 0xf1c40f, 1);
        background.fillRoundedRect(0, 0, this.modalWidth, this.modalHeight, 15);
        background.strokeRoundedRect(0, 0, this.modalWidth, this.modalHeight, 15);

        this.questionText = this.scene.add.text(this.modalWidth / 2, 50, '', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '22px',
            fill: '#ecf0f1',
            align: 'center',
            wordWrap: { width: this.modalWidth - 40 }
        }).setOrigin(0.5);

        this.resultText = this.scene.add.text(30, 80, '', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '20px',
            fill: '#ecf0f1',
            align: 'left',
            wordWrap: { width: this.modalWidth - 60 }
        }).setOrigin(0, 0).setVisible(false);
        
        this.explanationImage = this.scene.add.image(this.modalWidth / 2, 380, '').setVisible(false).setScale(0.5);

        this.controlsText = this.scene.add.text(this.modalWidth - 30, this.modalHeight - 30, 'W/S or ↑/↓: 選択 | E: 決定', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '16px',
            fill: '#bdc3c7'
        }).setOrigin(1, 1).setVisible(false);

        this.modal.add([background, this.questionText, this.resultText, this.explanationImage, this.controlsText]);
    }

    startQuiz(quiz) {
        return new Promise((resolve) => {
            this.isOpen = true;
            this.resolvePromise = resolve;
            this.currentQuiz = quiz;
            this.quizActive = true;
            this.selectedOptions.clear();
            this.selectedOptionIndex = -1;

            this.questionText.setText(this.currentQuiz.question).setVisible(true);
            this.resultText.setVisible(false);
            this.explanationImage.setVisible(false);
            this.controlsText.setVisible(true);

            this.destroyOptions();

            const isMultiSelect = this.currentQuiz.multiSelect === true;

            this.optionsText = this.currentQuiz.options.map((option, index) => {
                const optionY = 120 + (index * 45);
                const optionChar = String.fromCharCode(65 + index);
                const text = this.scene.add.text(50, optionY, `${optionChar}. ${option}`, {
                    fontFamily: 'Meiryo, sans-serif',
                    fontSize: '20px',
                    fill: '#f0f0f0'
                }).setInteractive();

                if (isMultiSelect) {
                    text.on('pointerdown', () => this.toggleOptionSelect(optionChar, text));
                } else {
                    text.on('pointerdown', () => this.checkAnswer(new Set([optionChar])));
                }

                text.on('pointerover', () => {
                    this.selectedOptionIndex = index;
                    this.highlightSelectedOption();
                });
                text.on('pointerout', () => {
                    this.selectedOptionIndex = -1;
                    this.highlightSelectedOption();
                });
                
                this.modal.add(text);
                return text;
            });

            if (isMultiSelect) {
                this.createSubmitButton();
            }

            this.modal.setVisible(true);
            this.scene.children.bringToTop(this.modal);
            this.scene.isModalOpen = true;
            this.addKeyListeners();
        });
    }

    toggleOptionSelect(optionChar, textElement) {
        if (this.selectedOptions.has(optionChar)) {
            this.selectedOptions.delete(optionChar);
            textElement.setStyle({ fill: '#f0f0f0' });
        } else {
            this.selectedOptions.add(optionChar);
            textElement.setStyle({ fill: '#ffd700' });
        }
    }

    createSubmitButton() {
        this.submitButton = this.scene.add.text(this.modalWidth / 2, this.modalHeight - 50, '決定', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#27ae60',
            padding: { x: 30, y: 15 },
            borderRadius: 8
        }).setOrigin(0.5).setInteractive();

        this.submitButton.on('pointerdown', () => this.checkAnswer(this.selectedOptions));
        this.submitButton.on('pointerover', () => this.submitButton.setBackgroundColor('#2ecc71'));
        this.submitButton.on('pointerout', () => this.submitButton.setBackgroundColor('#27ae60'));
        
        this.modal.add(this.submitButton);
    }

    checkAnswer(selectedCharsSet) {
        if (!this.quizActive) return;
        this.quizActive = false;
        this.removeKeyListeners();

        const correctAnswers = new Set(Array.isArray(this.currentQuiz.correctAnswer) ? this.currentQuiz.correctAnswer : [this.currentQuiz.correctAnswer]);
        
        let correct = selectedCharsSet.size === correctAnswers.size &&
                      [...selectedCharsSet].every(char => correctAnswers.has(char));

        const feedback = correct ? "正解です！" : "残念！";
        this._displayExplanation(this.currentQuiz, feedback);
    }

    _displayExplanation(quiz, feedback) {
        let feedbackColor = '#ecf0f1'; // Default color
        if (feedback === "正解です！") {
            feedbackColor = '#2ecc71'; // Green for correct
        } else if (feedback === "残念！") {
            feedbackColor = '#e74c3c'; // Red for incorrect
        }
        this.resultText.setStyle({ fill: feedbackColor });

        const explanationHeader = feedback ? `${feedback}\n\n【解説】\n` : `【問題の解説】\n`;
        const explanation = `${explanationHeader}${quiz.explanation || 'ここに解説が入ります。'}\n\n\nEキーでとじる`;
        this.destroyOptions();
        this.questionText.setVisible(false);
        if (this.controlsText) this.controlsText.setVisible(false);
        this.resultText.setText(explanation).setVisible(true);
        this.modal.bringToTop(this.resultText);

        if (quiz.explanationImage) {
            if (this.scene.textures.exists(quiz.explanationImage)) {
                this.explanationImage.setTexture(quiz.explanationImage).setVisible(true);
                this.modal.bringToTop(this.explanationImage);
            } else {
                console.warn(`Explanation image texture not found: ${quiz.explanationImage}`);
            }
        }

        const closeListener = (event) => {
            if (event.key === 'e' || event.key === 'E') {
                this.scene.input.keyboard.off('keyup', closeListener);
                const result = feedback ? (feedback === "正解です！") : null;
                this.closeModal(result);
            }
        };
        this.scene.input.keyboard.on('keyup', closeListener);
    }

    showExplanation(quiz) {
        this.isOpen = true;
        this.currentQuiz = quiz;
        this.quizActive = false;
        this.scene.isModalOpen = true;

        this._displayExplanation(quiz, null);
        
        this.modal.setVisible(true);
        this.scene.children.bringToTop(this.modal);
    }

    showCompletedQuiz(quiz) {
        this.isOpen = true;
        this.isShowingCompleted = true;
        this.currentQuiz = quiz;
        this.quizActive = false;
        this.scene.isModalOpen = true;

        this.destroyOptions();
        this.questionText.setVisible(false);

        const completedText = `【問題】\n${quiz.question}\n\n【解説】\n${quiz.explanation || 'ここに解説が入ります。'}\n\n\nEキーでとじる`;
        this.resultText.setText(completedText).setVisible(true);
        this.modal.bringToTop(this.resultText);

        if (quiz.explanationImage) {
            if (this.scene.textures.exists(quiz.explanationImage)) {
                this.explanationImage.setTexture(quiz.explanationImage).setVisible(true);
                this.modal.bringToTop(this.explanationImage);
            } else {
                console.warn(`Explanation image texture not found: ${quiz.explanationImage}`);
            }
        }

        this.modal.setVisible(true);
        this.scene.children.bringToTop(this.modal);
    }

    closeModal(result) {
        this.isOpen = false;
        this.isShowingCompleted = false;
        this.modal.setVisible(false);
        this.resultText.setVisible(false).setStyle({ fill: '#ecf0f1' }); // Reset color
        this.explanationImage.setVisible(false);
        if (this.controlsText) this.controlsText.setVisible(false);
        this.scene.isModalOpen = false;
        if (this.resolvePromise) {
            this.resolvePromise(result);
            this.resolvePromise = null;
        }
    }

    destroyOptions() {
        this.optionsText.forEach(option => {
            option.removeInteractive();
            option.destroy();
        });
        this.optionsText = [];
        if (this.submitButton) {
            this.submitButton.removeInteractive();
            this.submitButton.destroy();
            this.submitButton = null;
        }
    }

    addKeyListeners() {
        this.upKeyListener = (event) => {
            if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
                this.selectedOptionIndex = (this.selectedOptionIndex - 1 + this.optionsText.length) % this.optionsText.length;
                this.highlightSelectedOption();
            }
        };
        this.downKeyListener = (event) => {
            if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
                this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.optionsText.length;
                this.highlightSelectedOption();
            }
        };
        this.enterKeyListener = (event) => {
            if ((event.key === 'e' || event.key === 'E') && this.selectedOptionIndex !== -1) {
                const optionChar = String.fromCharCode(65 + this.selectedOptionIndex);
                if (this.currentQuiz.multiSelect) {
                    const textElement = this.optionsText[this.selectedOptionIndex];
                    this.toggleOptionSelect(optionChar, textElement);
                } else {
                    this.checkAnswer(new Set([optionChar]));
                }
            }
        };

        this.scene.input.keyboard.on('keyup', this.upKeyListener);
        this.scene.input.keyboard.on('keyup', this.downKeyListener);
        this.scene.input.keyboard.on('keyup', this.enterKeyListener);
    }

    removeKeyListeners() {
        if (this.upKeyListener) this.scene.input.keyboard.off('keyup', this.upKeyListener);
        if (this.downKeyListener) this.scene.input.keyboard.off('keyup', this.downKeyListener);
        if (this.enterKeyListener) this.scene.input.keyboard.off('keyup', this.enterKeyListener);
    }

    highlightSelectedOption() {
        this.optionsText.forEach((optionText, index) => {
            // For multi-select, yellow indicates selected, not just highlighted
            if (this.currentQuiz.multiSelect && this.selectedOptions.has(String.fromCharCode(65 + index))) {
                optionText.setStyle({ fill: '#ffd700' });
            } else {
                optionText.setStyle({ fill: index === this.selectedOptionIndex ? '#fde047' : '#f0f0f0' }); // Slightly different yellow for highlight
            }
        });
    }
}