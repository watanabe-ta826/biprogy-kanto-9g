import Phaser from 'phaser';
import { gameData, helpModalContent } from '../data/game-data.js';
import HelpModal from '../HelpModal.js';
import { createCopyButton } from '../CopyButton.js';
import { createButton } from '../ui.js';

/**
 * @class BaseCaseScene
 * @description Chapter2の各CASEシーンに共通する機能を提供する基底クラス。
 * シーンのライフサイクル管理、シナリオ進行、基本的なUI（レビュー画面、共通ボタン）の描画を担当する。
 * @extends Phaser.Scene
 */
export default class BaseCaseScene extends Phaser.Scene {
    /**
     * @constructor
     * @param {string} sceneKey - シーンの一意なキー。
     */
    constructor(sceneKey) {
        super(sceneKey);
        /** @type {number} - 現在のシナリオパートのインデックス。 */
        this.currentPartIndex = 0;
        /** @type {object|null} - 現在のシーンのデータ。game-data.jsから取得。 */
        this.sceneData = null;
        /** @type {Array<Phaser.GameObjects.GameObject>} - このシーンで作成されたUI要素の配列。シーン終了時に一括で破棄される。 */
        this.uiElements = [];
    }

    /**
     * シーンの初期化処理。データを初期化し、シーンの進行を開始する。
     * @param {object} [data] - シーン遷移時に渡されるデータ。
     * @param {number} [data.partIndex=0] - 開始するパートのインデックス。
     */
    create(data) {
        this.currentPartIndex = (data && data.partIndex) ? data.partIndex : 0;

        this.sceneData = gameData.scenes[this.sys.settings.key];
        this.cameras.main.fadeIn(500, 0, 0, 0);

        this.events.on('modalClosed', () => {
            this.registry.set('isModalOpen', false);
        });

        const part = this.sceneData.parts[this.currentPartIndex];

        if (!part) {
            this.endScene();
            return;
        }

        if (part.type === 'scenario') {
            this.scene.start('StoryScene', {
                scenario: part.content,
                nextScene: this.sys.settings.key,
                nextSceneData: { partIndex: this.currentPartIndex + 1 }
            });
        } else if (part.type === 'exercise') {
            this.displayExercise(part);
        } else if (part.type === 'review') {
            this.displayReview(part);
        }
    }

    /**
     * 演習画面を表示する。このメソッドはサブクラスでオーバーライドされることを想定している。
     * @param {object} exercise - 表示する演習のデータ。
     */
    displayExercise(exercise) {
        // サブクラスで実装
    }

    /**
     * 振り返り画面を表示する。
     * @param {object} review - 表示するレビューのデータ。
     */
    displayReview(review) {
        this.cameras.main.setBackgroundColor('#000000');
        
        if (review.image) {
            this.add.image(480, 300, review.image).setScale(1.0).setDepth(-1);
        }

        const { formX, formY, formWidth, formHeight, descriptionText } = this.createFormBase({
            height: 540,
            title: review.title,
            description: review.description,
        });

        if (review.prompts && Array.isArray(review.prompts)) {
            this.reviewPromptPages = [];
            this.currentReviewPageIndex = 0;
            
            let contentY;
            if (descriptionText) {
                // 説明テキストの実際の高さに基づいてY座標を計算
                contentY = descriptionText.y + descriptionText.displayHeight + 20; // 20pxのマージン
            } else {
                // descriptionがなければ、タイトル有無に基づく固定オフセット
                contentY = formY + (review.title ? 80 : 50);
            }

            review.prompts.forEach((promptData) => {
                const pageContainer = this.add.container();
                
                const promptTitle = this.add.text(formX + 40, contentY, promptData.title, { fontSize: '20px', fill: '#f1c40f' });
                const promptAreaHeight = review.prompts.length > 1 ? 200 : 280; // プロンプトが1つの場合は高さを広げる
                const promptArea = this.add.dom(formX + 40, contentY + 40).createFromHTML(
                    `<textarea readonly style="width: ${formWidth - 80}px; height: ${promptAreaHeight}px; font-size: 14px; padding: 10px; border-radius: 5px; background-color: #333; color: #fff; border: 1px solid #555; resize: none;">${promptData.displayText}</textarea>`
                ).setOrigin(0, 0);
                const copyButton = createCopyButton(this, formX + formWidth - 40, contentY + 40 + promptAreaHeight + 25, promptData.copyText, 'プロンプト例をコピー');
                copyButton.setOrigin(1, 0);

                pageContainer.add([promptTitle, promptArea, copyButton]);
                this.reviewPromptPages.push(pageContainer);
                this.uiElements.push(pageContainer);

                if (this.reviewPromptPages.length > 1) {
                    pageContainer.setVisible(false);
                }
            });

            if (review.prompts.length > 1) {
                this.createPaginationUI(formX, formY, formWidth, formHeight);
            }
        }

        const endButton = createButton(this, formX + formWidth / 2, formY + formHeight - 30, '演習を終わる', () => {
            if (this.registry.get('isModalOpen')) return;
            this.endScene();
        }, { 
            style: { fontSize: '22px' },
            color: '#6c757d'
        });
        this.uiElements.push(endButton);
    }

    /**
     * ページネーションUI（「< 前へ」「次へ >」ボタン、ページ番号）を作成する。
     * @param {number} formX - フォームのX座標。
     * @param {number} formY - フォームのY座標。
     * @param {number} formWidth - フォームの幅。
     * @param {number} formHeight - フォームの高さ。
     */
    createPaginationUI(formX, formY, formWidth, formHeight) {
        const pageText = this.add.text(formX + formWidth / 2, formY + formHeight - 70, '', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        const prevButton = createButton(this, formX + formWidth / 2 - 80, formY + formHeight - 70, '< 前へ', () => {
            if (this.currentReviewPageIndex > 0) {
                this.reviewPromptPages[this.currentReviewPageIndex].setVisible(false);
                this.currentReviewPageIndex--;
                this.reviewPromptPages[this.currentReviewPageIndex].setVisible(true);
                updatePaging();
            }
        }, { style: { fontSize: '18px', padding: { x: 10, y: 5 } }, origin: [1, 0.5]});
        
        const nextButton = createButton(this, formX + formWidth / 2 + 80, formY + formHeight - 70, '次へ >', () => {
            if (this.currentReviewPageIndex < this.reviewPromptPages.length - 1) {
                this.reviewPromptPages[this.currentReviewPageIndex].setVisible(false);
                this.currentReviewPageIndex++;
                this.reviewPromptPages[this.currentReviewPageIndex].setVisible(true);
                updatePaging();
            }
        }, { style: { fontSize: '18px', padding: { x: 10, y: 5 } }, origin: [0, 0.5]});

        this.uiElements.push(pageText, prevButton, nextButton);
        
        const updatePaging = () => {
            pageText.setText(`${this.currentReviewPageIndex + 1} / ${this.reviewPromptPages.length}`);
            prevButton.setAlpha(this.currentReviewPageIndex > 0 ? 1 : 0.3);
            nextButton.setAlpha(this.currentReviewPageIndex < this.reviewPromptPages.length - 1 ? 1 : 0.3);
        };
        
        updatePaging();
    }

    /**
     * 演習画面で共通して使用されるUI（戻るボタン、ヘルプアイコン）を作成する。
     */
    createCommonUI() {
        const backButton = createButton(this, 100, 575, 'CASE選択に戻る', () => {
            this.scene.start('Chapter2SelectionScene');
        }, {
            style: { fontSize: '20px', padding: { x: 15, y: 8 } },
            color: '#6c757d',
            depth: 100,
        });
        backButton.setScrollFactor(0);
        this.uiElements.push(backButton);

        const helpIcon = createButton(this, 810, 20, 'プロンプト作成のコツ', () => {
            if (this.registry.get('isModalOpen')) return;
            this.registry.set('isModalOpen', true);
            new HelpModal(this, helpModalContent).show();
        }, {
            style: {
                fontSize: '22px',
                padding: { x: 20, y: 10 },
                borderRadius: 8,
                shadow: { offsetX: 0, offsetY: 5, color: '#732d91', fill: true, blur: 5 }
            },
            color: '#8e44ad',
            depth: 100,
        });
        helpIcon.setScrollFactor(0);
        this.uiElements.push(helpIcon);
    }

    /**
     * 演習画面やレビュー画面の基本的なフォームコンテナ（背景、タイトル、説明文）を作成する。
     * @param {object} config - フォームの設定。
     * @param {number} [config.width=800] - フォームの幅。
     * @param {number} [config.height=500] - フォームの高さ。
     * @param {string} [config.title] - フォームのタイトル。
     * @param {string} [config.description] - フォームの説明文。
     * @returns {{formBg: Phaser.GameObjects.Graphics, formX: number, formY: number, formWidth: number, formHeight: number}} 作成したフォームの情報。
     */
    createFormBase(config) {
        const formWidth = config.width || 800;
        const formHeight = config.height || 500;
        const formX = (this.sys.game.config.width - formWidth) / 2;
        const formY = (this.sys.game.config.height - formHeight) / 2;

        const formBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(formX, formY, formWidth, formHeight, 10);
        this.uiElements.push(formBg);

        let descriptionText = null;

        if (config.title) {
            const title = this.add.text(formX + formWidth / 2, formY + 30, config.title, { fontSize: '24px', fill: '#fff', align: 'center' }).setOrigin(0.5, 0);
            this.uiElements.push(title);
        }
        
        if (config.description) {
            descriptionText = this.add.text(formX + 40, formY + (config.title ? 80 : 50), config.description, { fontSize: '18px', fill: '#fff', align: 'left', wordWrap: { width: formWidth - 80 }, lineSpacing: 10 }).setOrigin(0, 0);
            this.uiElements.push(descriptionText);
        }

        return { formBg, formX, formY, formWidth, formHeight, descriptionText };
    }

    /**
     * シーン終了時にUI要素をすべて破棄する。
     */
    shutdown() {
        this.uiElements.forEach(el => {
            if (el && el.destroy) {
                el.destroy();
            }
        });
        this.uiElements = [];
        if (this.reviewPromptPages) {
            this.reviewPromptPages = [];
        }
    }

    /**
     * 現在のシーンをフェードアウトし、章選択画面に戻る。
     */
    endScene() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('Chapter2SelectionScene');
        });
    }
}