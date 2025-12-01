/**
 * @file このプロジェクトで使用される定数を一元管理します。
 * 各キーセットは、特定の目的のために使用される文字列キーをまとめています。
 * これにより、タイプミスを防ぎ、コード全体での一貫性を保証します。
 */

/**
 * @const {object} SCENE_KEYS
 * @description シーン遷移時に使用するキーのコレクション。
 * Phaserのシーンマネージャーがシーンを識別するために使用します。
 */
export const SCENE_KEYS = {
  TitleScene: 'TitleScene',
  StoryScene: 'StoryScene',
  ResultScene: 'ResultScene',
  ChapterSelectionScene: 'ChapterSelectionScene',
  Chapter2SelectionScene: 'Chapter2SelectionScene',
  
  Chapter1_1Scene: 'Chapter1-1Scene',
  Chapter1_2Scene: 'Chapter1-2Scene',
  Chapter1_3Scene: 'Chapter1-3Scene',
  
  Chapter2_1Scene: 'Chapter2-1Scene',
  Chapter2_Case1Scene: 'Chapter2-Case1Scene',
  Chapter2_Case2Scene: 'Chapter2-Case2Scene',
  Chapter2_Case3Scene: 'Chapter2-Case3Scene',
  Chapter2_Case4Scene: 'Chapter2-Case4Scene',

  Chapter3_1Scene: 'Chapter3-1Scene',
};

/**
 * @const {object} IMAGE_KEYS
 * @description 画像アセットの読み込みおよび参照時に使用するキーのコレクション。
 */
export const IMAGE_KEYS = {
  // 背景
  TitleBackground: 'title_background',
  HubBackground: 'hub_background',
  Forest: 'forest',
  CastleTownLower: 'castleTown_lower',
  CastleTownUpper: 'castleTown_upper',
  MissionBoard: 'mission_board',
  ChapterSelect: 'chapter_select',
  Chapter2CaseSelect: 'chapter2_case_select',

  // プレイヤーとオトモ
  Player: 'player',
  PlayerLeft: 'player_left',
  PlayerRight: 'player_right',
  Otomo: 'otomo',
  OtomoRun: 'otomo_run',
  
  // NPC
  NPC1: 'npc1',
  NPC2: 'npc2',
  NPC3: 'npc3',
  NPC4: 'npc4',
  NPC5: 'npc5',
  NPC6: 'npc6',
  NPC7: 'npc7',
  NPC8: 'npc8',
  NPC9: 'npc9',

  // シーン画像
  Arrival: 'arrival',
  Intro1: 'intro_1',
  Intro2: 'intro_2',
  Intro3: 'intro_3',
  Intro4: 'intro_4',
  Intro5: 'intro_5',
  Intro6: 'intro_6',
  Intro7: 'intro_7',
  Chapter1Ending: 'Chpter1_ending', // Typo in original file name
  
  Chapter2_Case1_Scene1: 'chapter2_case1_scene1',
  Chapter2_Case1_Scene2: 'chapter2_case1_scene2',
  Chapter2_Case1_Work: 'chapter2_case1_work',
  
  Chapter2_Case2_Scene1: 'chapter2_case2_scene1',
  Chapter2_Case2_Scene2: 'chapter2_case2_scene2',
  Chapter2_Case2_Scene3: 'chapter2_case2_scene3',
  Chapter2_Case2_Work: 'chapter2_case2_work',

  Chapter2_Case3_Scene1: 'chapter2_case3_scene1',
  Chapter2_Case3_Scene2: 'chapter2_case3_scene2',
  Chapter2_Case3_Scene3: 'chapter2_case3_scene3',
  Chapter2_Case3_Work: 'chapter2_case3_work',
  Chapter2_Case3_Review: 'chapter2_case3_review',

  Chapter2_Case4_Scene1: 'chapter2_case4_scene1',
  Chapter2_Case4_Scene2: 'chapter2_case4_scene2',
  Chapter2_Case4_Scene3: 'chapter2_case4_scene3',
  Chapter2_Case4_Work: 'chapter2_case4_work',
  Chapter2_Case4_Review: 'chapter2_case4_review',

  // その他
  DiagramQ3: 'diagram_q3',
};

/**
 * @const {object} REGISTRY_KEYS
 * @description Phaserのレジストリ（グローバルなデータストア）で使用するキーのコレクション。
 */
export const REGISTRY_KEYS = {
    CorrectAnswers: 'correctAnswers',
    CompletedQuizzes: 'completedQuizzes',
    TotalQuizzes: 'totalQuizzes',
    Inventory: 'inventory',
    CollectedItems: 'collectedItems',
    UserAnswers: 'userAnswers',
};
