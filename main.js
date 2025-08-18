/**
 * @file ゲームのエントリーポイントです。Phaserのゲームインスタンスを初期化し、全体設定を定義します。
 */

import Phaser from 'phaser';
import TitleScene from './scenes/TitleScene.js';
import HubScene from './scenes/HubScene.js';
import Chapter1Scene from './scenes/Chapter1Scene.js';
import ForestScene from './scenes/ForestScene.js';

/**
 * @type {Phaser.Types.Core.GameConfig} - Phaserゲームの全体設定
 */
const config = {
    // WebGLとCanvasのどちらをレンダリングに使用するかを自動で選択
    type: Phaser.AUTO,
    // ゲーム画面の幅（ピクセル）
    width: 960,
    // ゲーム画面の高さ（ピクセル）
    height: 600,
    // ゲームキャンバスを描画するHTML要素のID
    parent: 'game',
    // ゲームに物理演算を追加
    physics: {
        default: 'arcade', // デフォルトの物理エンジンとしてアーケード物理を選択
        arcade: {
            gravity: { y: 800 }, // y軸方向の重力
            debug: true // 物理ボディの境界線などをデバッグ表示
        }
    },
    // ゲームで使用するシーンのリスト
    scene: [TitleScene, Chapter1Scene, HubScene, ForestScene]
};

// 設定を元にPhaser.Gameのインスタンスを生成
const game = new Phaser.Game(config);

// ゲームのグローバル状態を初期化
game.events.on('ready', () => {
    game.registry.set('inventory', []);
    game.registry.set('collectedItems', {});
});
