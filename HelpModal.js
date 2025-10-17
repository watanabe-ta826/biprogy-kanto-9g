import Phaser from 'phaser';

export default class HelpModal {
    constructor(scene, content) {
        this.scene = scene;
        this.content = content; // Array of {text, image} objects
        this.modal = null;
        this.contentText = null;
        this.contentImage = null;
        this.paginationText = null;
        this.currentPage = 0;

        this.modalWidth = 800;
        this.modalHeight = 500;

        this.createModal();
    }

    createModal() {
        const modalX = (this.scene.sys.game.config.width - this.modalWidth) / 2;
        const modalY = (this.scene.sys.game.config.height - this.modalHeight) / 2;

        this.modal = this.scene.add.container(modalX, modalY).setScrollFactor(0).setDepth(200).setVisible(false);

        const background = this.scene.add.graphics();
        background.fillStyle(0x2c3e50, 0.95);
        background.lineStyle(3, 0xf1c40f, 1);
        background.fillRoundedRect(0, 0, this.modalWidth, this.modalHeight, 15);
        background.strokeRoundedRect(0, 0, this.modalWidth, this.modalHeight, 15);

        this.contentText = this.scene.add.text(50, 50, '', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '20px',
            fill: '#ecf0f1',
            align: 'left',
            wordWrap: { width: this.modalWidth - 100 } // Increased padding
        }).setOrigin(0, 0);

        this.contentImage = this.scene.add.image(this.modalWidth / 2, 350, '').setVisible(false).setScale(0.5);

        this.paginationText = this.scene.add.text(this.modalWidth / 2, this.modalHeight - 30, '', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '18px',
            fill: '#bdc3c7'
        }).setOrigin(0.5);

        const closeButton = this.scene.add.text(this.modalWidth - 40, 25, '×', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            fill: '#ecf0f1'
        }).setOrigin(0.5).setInteractive();

        closeButton.on('pointerdown', () => this.close());
        closeButton.on('pointerover', () => closeButton.setStyle({ fill: '#f1c40f' }));
        closeButton.on('pointerout', () => closeButton.setStyle({ fill: '#ecf0f1' }));

        const prevButton = this.createNavButton(30, this.modalHeight / 2, '◀', () => this.changePage(-1));
        const nextButton = this.createNavButton(this.modalWidth - 30, this.modalHeight / 2, '▶', () => this.changePage(1));

        const controlsText = this.scene.add.text(this.modalWidth / 2, this.modalHeight - 55, 'A/D or ←/→ : 前後ページへ', {
            fontFamily: 'Meiryo, sans-serif',
            fontSize: '16px',
            fill: '#bdc3c7'
        }).setOrigin(0.5);

        this.modal.add([background, this.contentText, this.contentImage, this.paginationText, closeButton, prevButton, nextButton, controlsText]);
    }

    createNavButton(x, y, text, callback) {
        const button = this.scene.add.text(x, y, text, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            fill: '#ecf0f1'
        }).setOrigin(0.5).setInteractive();

        button.on('pointerdown', callback);
        button.on('pointerover', () => button.setStyle({ fill: '#f1c40f' }));
        button.on('pointerout', () => button.setStyle({ fill: '#ecf0f1' }));

        return button;
    }

    show() {
        this.currentPage = 0;
        this.updateContent();
        this.modal.setVisible(true);
        this.scene.children.bringToTop(this.modal);
        this.scene.isModalOpen = true; // To prevent other inputs

        this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyLeft = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.keyEsc = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    close() {
        this.modal.setVisible(false);
        this.scene.isModalOpen = false;

        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    changePage(delta) {
        const newPage = this.currentPage + delta;
        if (newPage >= 0 && newPage < this.content.length) {
            this.currentPage = newPage;
            this.updateContent();
        }
    }

    updateContent() {
        const pageData = this.content[this.currentPage];
        this.contentText.setText(pageData.text || '');

        if (pageData.image && this.scene.textures.exists(pageData.image)) {
            this.contentImage.setTexture(pageData.image).setVisible(true);
        } else {
            this.contentImage.setVisible(false);
        }

        this.paginationText.setText(`${this.currentPage + 1} / ${this.content.length}`);
    }

    update() {
        if (!this.modal.visible) return;

        if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.keyLeft)) {
            this.changePage(-1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.keyRight)) {
            this.changePage(1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.close();
        }
    }
}