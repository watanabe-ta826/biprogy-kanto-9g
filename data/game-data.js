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
    { name: 'title_background', src: 'img/title_background.png' },
    { name: 'forest', src: 'img/forest.jpg' },
    { name: 'castleTown_lower', src: 'img/castleTown_lower.jpg' },
    { name: 'castleTown_upper', src: 'img/castleTown_upper.jpg' },
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
        'Chapter1-1Scene': {
            displayName: '外れの森',
            background: 'forest',
            backgroundSettings: { scale: 1.0, scrollFactor: 0.5, yOffset: -100 },
            worldWidth: 1600,
            entities: [
                { type: 'NPC', imageName: 'npc1', x: 400, y: 450, name: '村人A', dialog: ['...'], quiz: { question: 'これはクイズです。', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: '' } },
                { type: 'NPC', imageName: 'npc1', x: 800, y: 450, name: '村人B', dialog: ['...'], quiz: { question: 'これはクイズです。', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: '' } },
                { type: 'Portal', x: 1550, y: 540, targetScene: 'Chapter1-2Scene', entryX: 100 }
            ]
        },
        'Chapter1-2Scene': {
            displayName: '城下街 下層',
            background: 'castleTown_lower',
            backgroundSettings: { scale: 1.0, scrollFactor: 0.5, yOffset: 0 },
            worldWidth: 1600,
            entities: [
                { type: 'Portal', x: 50, y: 540, targetScene: 'Chapter1-1Scene', entryX: 1500 },
                { type: 'NPC', imageName: 'npc1', x: 400, y: 450, name: '村人C', dialog: ['...'], quiz: { question: 'これはクイズです。', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: '' } },
                { type: 'NPC', imageName: 'npc1', x: 800, y: 450, name: '村人D', dialog: ['...'], quiz: { question: 'これはクイズです。', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: '' } },
                { type: 'NPC', imageName: 'npc1', x: 1200, y: 450, name: '村人E', dialog: ['...'], quiz: { question: 'これはクイズです。', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: '' } },
                { type: 'Portal', x: 1550, y: 540, targetScene: 'Chapter1-3Scene', entryX: 100 }
            ]
        },
        'Chapter1-3Scene': {
            displayName: '城下街 上層',
            background: 'castleTown_upper',
            backgroundSettings: { scale: 1.0, scrollFactor: 0.5, yOffset: 0 },
            worldWidth: 1600,
            entities: [
                { type: 'Portal', x: 50, y: 540, targetScene: 'Chapter1-2Scene', entryX: 1500 },
                { type: 'NPC', imageName: 'npc1', x: 400, y: 450, name: '村人F', dialog: ['...'], quiz: { question: 'これはクイズです。', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: '' } },
                { type: 'NPC', imageName: 'npc1', x: 800, y: 450, name: '村人G', dialog: ['...'], quiz: { question: 'これはクイズです。', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: '' } }
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
