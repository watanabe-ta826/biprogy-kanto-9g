import BaseChapterScene from "./BaseChapterScene.js";
import { gameData } from "../data/game-data.js";

/**
 * @class Chapter1_1Scene
 * @description ゲームの最初の章（クイズがあるシーン）を管理するクラス。
 * @extends BaseChapterScene
 */
export default class Chapter1_1Scene extends BaseChapterScene {
  constructor() {
    super("Chapter1-1Scene");
  }

  /**
   * シーンが作成されるときに呼び出される。
   * BaseChapterSceneのcreateを呼び出して、共通のセットアップを実行する。
   */
  create() {
    const sceneData = gameData.scenes["Chapter1-1Scene"];
    super.create(sceneData);
  }
}
