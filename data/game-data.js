/**
 * @file ゲームの静的なデータ（シーン、エンティティ、画像パスなど）を定義します。
 *       このファイルを修正することで、ゲームのコンテンツ（NPCの台詞、クイズ、アイテムなど）を容易に変更できます。
 */

/**
 * @type {Array<object>} - ゲーム全体でプリロードする画像アセットのリスト。
 * @property {string} name - 画像を識別するための一意のキー。
 * @property {string} src - 画像ファイルへのパス。
 */
export const imagePaths = [
    { name: 'player', src: 'img/player.png' },
    { name: 'otomo', src: 'img/otomo.png' },
    { name: 'otomo_run', src: 'img/otomo_run.png' },
    { name: 'hub_background', src: 'img/hub_background.jpg' },
    { name: 'mission_board', src: 'img/mission_board.jpg' },
    { name: 'title_background', src: 'img/title_background.png' },
    { name: 'kingdom_background', src: 'img/kingdom_background.jpg' },
    { name: 'intro_1', src: 'img/intro_1.jpg' },
    { name: 'intro_2', src: 'img/intro_2.jpg' },
    // NPCの画像。現在はプレイヤー画像を仮で使用。
    { name: 'npc1', src: 'img/player.png' },
];

/**
 * @type {Array<object>} - イントロシーンのシナリオデータ
 */
export const introScenario = [
    { text: "賢者（私）は、故郷の村が滅びそうだとの知らせを聞いた。", image: 'intro_1' },
    { text: "他の村がAIを活用して豊かになる中、\n私の村はAIの導入が遅れ、衰退の一途をたどっているという。", image: 'intro_1' },
    { text: "私は村を救うために立ち上がることを決意した。", image: 'intro_2' },
    { text: "遠く離れた地から、故郷の村へと向かうのだった……", image: 'intro_2' }
];

/**
 * @type {object} - ゲームの全データ。
 */
export const gameData = {
    /**
     * @type {object} - 各シーンの設定。
     */
    scenes: {
        /**
         * Chapter1シーンの設定
         */
        'Chapter1-1Scene': {
            background: 'kingdom_background', // 背景画像のキー
            entities: [ // シーンに登場するエンティティ（NPC、アイテムなど）のリスト
                {
                    type: 'NPC', // エンティティの種類
                    imageName: 'npc1', // 使用する画像のキー
                    x: 400, // X座標
                    y: 450, // Y座標
                    name: '王国民', // NPCの名前
                    dialog: [ // NPCの会話テキスト
                        '旅の方、お尋ねしてもよろしいでしょうか？',
                        '最近、この国では「AI」というものが話題になっています。',
                        'しかし、それが一体何なのか、恐ろしいものなのか、よく分からず不安に思っています。',
                        '旅の方は、その「AI」について何かご存知ですか？'
                    ],
                    quiz: { // NPCが出題するクイズ
                        question: '生成AIとは、どのようなAIのことでしょうか？',
                        options: [
                            '既存のデータを分析し、パターンを認識するAI',
                            '新しいデータやコンテンツを自ら生成するAI',
                            '特定のタスクを自動化するAI',
                            '人間の感情を理解し、共感するAI'
                        ],
                        correctAnswer: 'B', // 正解の選択肢 (A, B, C, D)
                        feedback: { // 解答後のフィードバック
                            correct: '正解です！生成AIは、テキスト、画像、音声など、様々な新しいコンテンツを創造する能力を持っています。',
                            incorrect: '残念、違うみたいです。生成AIは、既存のデータから学習し、それを基に新しいものを生み出すAIのことです。'
                        }
                    }
                },
                {
                    type: 'Collectible',
                    x: 550,
                    y: 450,
                    itemName: '光る石'
                },
                {
                    type: 'Portal',
                    x: 800,
                    y: 450,
                    targetScene: 'Chapter1-2.Scene'
                }
            ]
        },
        'Chapter1-2.Scene': {
            background: 'kingdom_background',
            entities: [
                {
                    type: 'Portal',
                    x: 100,
                    y: 450,
                    targetScene: 'Chapter1-1Scene'
                }
            ]
        }
    },
    /**
     * @type {object} - ミッションの定義（現在は未使用）
     */
    missions: {
        // 今後ミッション機能を追加する際に使用
    }
};
