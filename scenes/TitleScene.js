import Phaser from 'phaser';
import { imagePaths, introScenario } from '../data/game-data.js';

/**
 * @class TitleScene
 * @description ゲームのタイトル画面とアセットの読み込みを担当するシーン。
 * @extends Phaser.Scene
 */
export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    /**
     * アセットのプリロード（事前読み込み）を行うPhaserの標準メソッド。
     * このシーンでゲーム全体のアセットを読み込む。
     */
    preload() {
        // game-data.jsで定義された画像パスのリストをループして、すべてのアセットを読み込む
        imagePaths.forEach(image => {
            this.load.image(image.name, image.src);
        });
    }

    /**
     * シーンが作成されるときに呼び出されるPhaserの標準メソッド。
     * タイトル画面のUI要素（背景、テキスト、ボタン）を作成する。
     */
    create() {
        // 背景画像を表示
        this.add.image(480, 300, 'title_background').setScale(0.7);

        // タイトルテキスト
        this.add.text(480, 200, '生成AIクエスト', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '50px',
            fill: '#ffffff',
            stroke: '#979797ff',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, stroke: true, fill: true }
        }).setOrigin(0.5);

        // --- ゲームスタートボタンの作成 ---
        const buttonX = 480;
        const buttonY = 450;

        const startButton = this.add.text(buttonX, buttonY, 'スタート', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#3498db',
            padding: { x: 40, y: 20 },
            borderRadius: 8,
            shadow: { offsetX: 0, offsetY: 5, color: '#2570a1', fill: true, blur: 5 }
        }).setOrigin(0.5);

        // ボタンをインタラクティブ（クリック可能）にする
        startButton.setInteractive();

        // マウスカーソルがボタンに乗った時のホバーエフェクト
        startButton.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
            startButton.setBackgroundColor('#5dade2');
            this.tweens.add({ targets: startButton, y: buttonY - 2, duration: 100, ease: 'Power1' });
        });

        // マウスカーソルがボタンから外れた時のエフェクト
        startButton.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
            startButton.setBackgroundColor('#3498db');
            this.tweens.add({ targets: startButton, y: buttonY, duration: 100, ease: 'Power1' });
        });

        // ボタンがクリックされた時の処理
        startButton.on('pointerdown', () => {
            // 画面をフェードアウトさせる演出
            this.cameras.main.fadeOut(500, 0, 0, 0);
            // フェードアウト完了後、StorySceneに遷移する
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('StoryScene', {
                    scenario: introScenario,
                    nextScene: 'ChapterSelectionScene'
                });
            });
        });
    }
}