import Phaser from 'phaser';
import { imagePaths } from '../data/game-data.js';

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
        this.add.text(480, 200, 'AIクエスト', {
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
            fontSize: '30px',
            fill: '#fff',
            backgroundColor: '#e67e22',
            padding: { x: 30, y: 15 },
            borderRadius: 10
        }).setOrigin(0.5);

        // ボタンをインタラクティブ（クリック可能）にする
        startButton.setInteractive();

        // マウスカーソルがボタンに乗った時のホバーエフェクト
        startButton.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer'; // カーソルをポインターに変更
            startButton.setBackgroundColor('#d35400'); // 背景色を濃くする
            this.tweens.add({ targets: startButton, scale: 1.1, duration: 100, ease: 'Power1' }); // 少し拡大する
        });

        // マウスカーソルがボタンから外れた時のエフェクト
        startButton.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default'; // カーソルを元に戻す
            startButton.setBackgroundColor('#e67e22'); // 背景色を元に戻す
            this.tweens.add({ targets: startButton, scale: 1, duration: 100, ease: 'Power1' }); // サイズを元に戻す
        });

        // ボタンがクリックされた時の処理
        startButton.on('pointerdown', () => {
            // 画面をフェードアウトさせる演出
            this.cameras.main.fadeOut(500, 0, 0, 0);
            // フェードアウト完了後、Chapter1Sceneに遷移する
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('Chapter1Scene');
            });
        });
    }
}