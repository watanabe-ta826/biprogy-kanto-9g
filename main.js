/**
 * @file ゲームのエントリーポイントです。Phaserのゲームインスタンスを初期化し、全体設定を定義します。
 */

import { gameData } from "./data/game-data.js";
import BaseScene from "./scenes/BaseScene.js";
import StoryScene from "./scenes/StoryScene.js";
import TitleScene from "./scenes/TitleScene.js";
import Chapter1_1Scene from "./scenes/Chapter1-1Scene.js";
import ChapterSelectionScene from "./scenes/ChapterSelectionScene.js";
import Chapter2_1Scene from "./scenes/Chapter2-1Scene.js";
import Chapter3_1Scene from "./scenes/Chapter3-1Scene.js";
import Chapter1_2Scene from "./scenes/Chapter1-2Scene.js";
import Chapter1_3Scene from "./scenes/Chapter1-3Scene.js";
import ResultScene from "./scenes/ResultScene.js";

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
  parent: "game",
  // ゲームに物理演算を追加
  physics: {
    default: "arcade", // デフォルトの物理エンジンとしてアーケード物理を選択
    arcade: {
      gravity: { y: 800 }, // y軸方向の重力
      debug: true, // 物理ボディの境界線などをデバッグ表示
    },
  },
  // アセットのベースURLを設定
  loader: {
    // Viteの 'base' 設定をPhaserに教える
    baseURL: import.meta.env.BASE_URL,
  },
  // ゲームで使用するシーンのリスト
  scene: [
    TitleScene,
    StoryScene,
    ChapterSelectionScene,
    Chapter1_1Scene,
    Chapter1_2Scene,
    Chapter1_3Scene,
    Chapter2_1Scene,
    Chapter3_1Scene,
    ResultScene,
    BaseScene,
  ],
};

// 設定を元にPhaser.Gameのインスタンスを生成
const game = new Phaser.Game(config);

// ゲームのグローバル状態を初期化
game.events.on("ready", () => {
  // game.registry.set('inventory', []);
  game.registry.set("collectedItems", {});
  game.registry.set("completedQuizzes", []);
  game.registry.set("correctAnswers", 0);
  game.registry.set("totalQuizzes", gameData.totalQuizzesInGame);
});
