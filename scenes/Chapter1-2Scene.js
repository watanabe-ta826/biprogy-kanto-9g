import BaseChapterScene from "./BaseChapterScene.js";
import { gameData } from "../data/game-data.js";

/**
 * @class Chapter1_2Scene
 * @description ゲームの最初の章の2番目のシーンを管理するクラス。
 * @extends BaseChapterScene
 */
export default class Chapter1_2Scene extends BaseChapterScene {
  constructor() {
    super("Chapter1-2Scene");
  }

  /**
   * シーンが作成されるときに呼び出される。
   * BaseChapterSceneのcreateを呼び出して、共通のセットアップを実行する。
   */
  create() {
    const sceneData = gameData.scenes["Chapter1-2Scene"];
    super.create(sceneData);
  }
}
