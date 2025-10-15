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
  { name: "player", src: "img/player.png" }, // 正面向き
  { name: "player_left", src: "img/player_left.png" }, // 左向き
  { name: "player_right", src: "img/player_right.png" }, // 右向き
  { name: "otomo", src: "img/otomo.png" },
  { name: "otomo_run", src: "img/otomo_run.png" },
  { name: "hub_background", src: "img/hub_background.jpg" },
  { name: "title_background", src: "img/title_background.png" },
  { name: "forest", src: "img/forest.jpg" },
  { name: "castleTown_lower", src: "img/castleTown_lower.jpg" },
  { name: "castleTown_upper", src: "img/castleTown_upper.jpg" },
  { name: "intro_1", src: "img/intro_1.jpg" },
  { name: "intro_2", src: "img/intro_2.jpg" },
  { name: "npc1", src: "img/npc1.png" },
  { name: "npc2", src: "img/npc2.png" },
  { name: "npc3", src: "img/npc3.png" },
  { name: "npc4", src: "img/npc4.png" },
  { name: "npc5", src: "img/npc5.png" },
  { name: "npc6", src: "img/npc6.png" },
  { name: "diagram_q3", src: "img/diagram_q3.png" },
  { name: "arrival", src: "img/arrival.png" },
];

/**
 * @type {Array<object>} - イントロシーンのシナリオデータ
 */
export const introScenario = [
  {
    text: "賢者（あなた）は自分の生まれた村が滅びてしまいそうだという知らせを聞いた。",
    image: "intro_1",
  },
  {
    text: "他の村が生成AIを活用して村を豊かにしている中、\n賢者の生まれた村、九関村は生成AIの導入が遅れていて\n他村との競争に負け、衰退の一途をたどっているというのだ。",
    image: "intro_1",
  },
  {
    text: "賢者：早く…救わなければ",
    image: "intro_2",
    style: { fill: "#ffd700" },
  },
  {
    text: "賢者（あなた）は村を救うために立ち上がることを決意し、\n足早に九関村に向かうことにした。",
    image: "intro_2",
  },
  {
    text: "生成AIを使ってあなたは村を救うことができるだろうか？",
    image: "intro_2",
  },
  {
    text: "当アプリの目的は「AIリテラシー」を身につけることです。\n\nAIリテラシーとはAIの仕組みや限界を理解し、\n適切に活用できる能力のことを指します。\n\n近年AI技術が急速に発展した今、\nAIリテラシーはすべての人にとって不可欠な力となっています。",
    image: "title_background",
  },
  {
    text: "これを身につけることで、\n誤情報や偏見に惑わされず、AIの出力を批判的に読み解く力が養われます。\n\nまた、AIに依存しすぎず、\n人間としての意思決定や倫理的な配慮を保つことができるようになります。",
    image: "title_background",
  },
  {
    text: "さらに、仕事や日常生活の中でAIを効果的に活用し、\n自分の可能性を広げることにもつながります。\n\nさあ、AIリテラシーを身につける冒険へ旅立ちましょう！",
    image: "title_background",
  },
];

/**
 * @type {Array<object>} - 第1章開始前のシナリオデータ
 */
export const chapter1IntroScenario = [
  { text: "賢者は村近くに到着した", image: "arrival" },
  {
    text: "村人： 賢者さま…！おかえりなさい！\n遠くの国で、人助けをしていたのですよね？\nなぜ急に帰ってこられたのですか？",
    style: { fill: "#add8e6" },
  },
  {
    text: "賢者： この村が衰退の一途をたどっていると風のうわさで聞いたのです。\nだから、生成AIを使って村を救いに来たのです。",
    style: { fill: "#ffd700" },
  },
  {
    text: "村人： （不安そうな様子で）生成AIって最近よく聞きますけど\nよくわかんなくて…なんか怖そうですよね？",
    style: { fill: "#add8e6" },
  },
  {
    text: "賢者： まず生成AIとは何かを説明したほうがよさそうですね。",
    style: { fill: "#ffd700" },
  },
  { text: "これから生成AIに関するクイズを６問出題します。" },
  {
    text: "はじめは正誤をそれほど気にしなくてかまいません。\n解説に重要なポイントが書いてありますので、\nよく確認してください。",
  },
];

/**
 * @type {Array<object>} - 第3章開始前のシナリオデータ
 */
export const chapter3IntroScenario = [
  {
    text: "生成AIの便利さが評判となり、\n村人たちはあらゆる場面で生成AIに判断を委ねるようになった。\n最初は献立や天気予報だったが、\n次第に服装、会話、進路、恋愛相談までAIに頼るように。\nその結果、村人たちは「自分で判断する力」を失い、\n次第に村中が混乱するようになる。\n賢者は村人たちの様子を見に街へ出た。",
    image: "intro_1",
  },
  {
    text: "カイ（若者）：「AIが言ったから、\n今日は誰とも話さない方がいいって…\nそしたらさ、友達とけんかになっちゃったんだよ。\n無視したわけじゃないのに…AIが言ったから…」",
    image: "intro_2",
    style: { fill: "#add8e6" },
  },
  {
    text: "ハナ（おばあちゃん）：「昔はね、天気を見て畑に出てたのよ。\nでも今は、AIが『今日は休んで』って言うから\n今日の予定はトマトを収穫して市場に持っていく予定だったのに\nできなくなっちゃったわ…\n八百屋のミドリさんには今度謝らなきゃ」",
    image: "intro_2",
    style: { fill: "#add8e6" },
  },
  {
    text: "トマリ（子ども）：「今日の遊びも、AIが決めたんだ。\nぼく、ほんとはかくれんぼしたかったけど…\nAIの言うことを聞けば間違いないんでしょ？\nぼくなんだか楽しくないや…」",
    image: "intro_2",
    style: { fill: "#add8e6" },
  },
  {
    text: "賢者：「まずい…村人たちが生成AIに頼り切って\n自分で考えることができなくなっている…\nこのままでは繁栄するどころか\n村が生成AIに支配されてしまう…\nみんなにリスクを学んでもらう必要があるな」",
    image: "intro_2",
    style: { fill: "#ffd700" },
  },
  {
    text: "賢者は村人たちを集め、\nクイズ形式で生成AIのリスクを学んでもらうことにした。",
    image: "intro_1",
  },
];

/**
 * @type {object} - ゲームの全データ。
 */
export const gameData = {
  totalQuizzesInGame: 6, // クイズの総数を6に更新
  chapters: {
    chapter1: {
      scenes: ["Chapter1-1Scene", "Chapter1-2Scene", "Chapter1-3Scene"],
      totalQuizzes: 6,
      clearScenario: {
        high: [
          {
            text: "村人たちとの対話を通して、私は村が抱える問題の根深さを改めて知った。\nAIへの無知と、それ故の恐怖心が、村の発展を妨げているのだ。",
            image: "intro_2",
          },
          {
            text: "しかし、彼らの知恵と経験もまた、村の大きな財産だ。\nAIと人の知恵を融合させれば、きっと道は開けるはずだ。",
            image: "intro_1",
          },
        ],
        low: [
          {
            text: "村人たちとの対話は、私の心を重くした。\nAIに対する誤解は根深く、一筋縄ではいかないだろう。",
            image: "intro_2",
          },
          {
            text: "だが、ここで諦めるわけにはいかない。\n粘り強く対話を続け、村の未来を切り開かなければ。",
            image: "intro_1",
          },
        ],
      },
    },
  },
  scenes: {
    "Chapter1-1Scene": {
      displayName: "村外れの森",
      background: "forest",
      backgroundSettings: { scale: 1.0, scrollFactor: 0.5, yOffset: -100 },
      worldWidth: 1600,
      entities: [
        {
          type: "NPC",
          imageName: "npc1",
          x: 400,
          y: 450,
          name: "村人A",
          dialog: [
            "賢者様、AI、AIって最近よく聞きますが、一体何なんですかい？",
          ],
          quiz: {
            question: "Q1. 生成AIとは何をする技術？",
            options: [
              "人間の脳を模倣する技術",
              "新しいコンテンツ（文章、画像など）を作り出す技術",
              "インターネットの情報を検索する技術",
              "データの分析や分類を行う技術",
            ],
            correctAnswer: "B",
            explanation:
              "生成AIは、既存のデータをもとにして\n新しい文章、画像、音声、動画などを自動で作り出す技術です。\nChatGPTのようなツールは、自然な文章を生成する代表例です。\n\nDの「データの分析や分類」は、「識別AI（判別AI）」の領域のため、\n生成AIの目的とは異なります。",
          },
        },
        {
          type: "NPC",
          imageName: "npc2",
          x: 800,
          y: 450,
          name: "村人B",
          dialog: [
            "AIはどうやって物事を覚えるんでしょうかね？\n人間みたいに学校にでも行くのかしら？",
          ],
          quiz: {
            question: "Q2. 生成AIが「学習」するために必要なものは何？",
            options: [
              "電源とインターネット",
              "大量のデータ",
              "人間の指示",
              "検索履歴",
            ],
            correctAnswer: "B",
            explanation:
              "生成AIは、膨大なテキストや画像などのデータを使って学習します。\nGPT-3（2020年）の時点で、書籍にすれば\n約500万冊に相当する量の文章を学習しています。\n最新のAI（GPT-4オムニ）の学習量は公開されていませんが、\nこれ以上のデータが学習されていることは間違いないでしょう。\nこれにより、文脈を理解したり、自然な文章を作ったりできるようになります。",
          },
        },
        {
          type: "Portal",
          x: 1550,
          y: 540,
          targetScene: "Chapter1-2Scene",
          entryX: 100,
        },
      ],
    },
    "Chapter1-2Scene": {
      displayName: "城下街 下層",
      background: "castleTown_lower",
      backgroundSettings: { scale: 1.0, scrollFactor: 0.5, yOffset: 0 },
      worldWidth: 1600,
      entities: [
        {
          type: "Portal",
          x: 50,
          y: 540,
          targetScene: "Chapter1-1Scene",
          entryX: 1500,
        },
        {
          type: "NPC",
          imageName: "npc3",
          x: 400,
          y: 450,
          name: "村人C",
          dialog: [
            "最近噂のChatGPTとかいうのは、どんな仕組みで動いてるんでしょう？\n魔法か何かですか？",
          ],
          quiz: {
            question:
              "Q3. ChatGPTのような生成AIは、主にどの技術を使って動いている？",
            options: [
              "ブロックチェーン",
              "データベース管理",
              "機械学習（特に深層学習）",
              "仮想現実",
            ],
            correctAnswer: "C",
            explanation:
              "生成AIは、大量のデータを学習してパターンを理解し、\nそこから新しい情報を生成する機械学習の一種です。\n技術的には主に深層学習（ディープラーニング）の\n一分野として位置づけられています。",
            explanationImage: "diagram_q3",
          },
        },
        {
          type: "NPC",
          imageName: "npc4",
          x: 800,
          y: 450,
          name: "村人D",
          dialog: [
            "AIってのは何でもできる万能の道具なんでしょうか？\nできないこともあるんですか？",
          ],
          quiz: {
            question:
              "Q4. 次のうち、生成AIの代表的な活用例ではないものはどれ？",
            options: [
              "小説や詩の作成",
              "犯罪目的での助言",
              "プログラムコードの自動生成",
              "画像から絵を描く",
            ],
            correctAnswer: "B",
            explanation:
              "生成AIは新たなアイデアやコンテンツ（文章・画像・音声等）を\n作り出す能力があります。\nAIは悪用されないように学習されているため、\n犯罪行為に関わる質問には答えられません。",
          },
        },
        {
          type: "Portal",
          x: 1550,
          y: 540,
          targetScene: "Chapter1-3Scene",
          entryX: 100,
        },
      ],
    },
    "Chapter1-3Scene": {
      displayName: "城下街 上層",
      background: "castleTown_upper",
      backgroundSettings: { scale: 1.0, scrollFactor: 0.5, yOffset: 0 },
      worldWidth: 1600,
      entities: [
        {
          type: "Portal",
          x: 50,
          y: 540,
          targetScene: "Chapter1-2Scene",
          entryX: 1500,
        },
        {
          type: "NPC",
          imageName: "npc5",
          x: 400,
          y: 450,
          name: "村人E",
          dialog: [
            "AIに答えられない質問なんて、本当にあるのかね？いくつか試してみたいもんだ。",
          ],
          quiz: {
            question: "Q5. 生成AIが回答しづらい質問を（すべて）選べ",
            options: [
              "地球の大きさを教えて",
              "私の人生を良いものにするにはどうすればよいか教えて",
              "東京スカイツリーの高さを教えて",
              "全く新しいスポーツを考えて",
              "京都で人気の抹茶スイーツのお店を教えて",
            ],
            correctAnswer: ["B", "D", "E"],
            multiSelect: true,
            explanation:
              "A, C：回答しやすい質問です。\n明確な事実に基づくため、学習データから正確な情報を提供できます。\n\nB：回答しづらい質問です。\n価値観や個人の状況に依存するため、正解を出すことは困難です。\n\nD：やや回答しづらい質問です。\n既存の情報を組み合わせるため、「全く新しい」創造は苦手です。\n\nE：回答しづらい質問です。\nリアルタイムの人気情報や最新の店舗情報には弱いです。\n\nこのように、生成AIは事実ベースの質問には強い一方、\n価値観・創造性・最新情報が絡む問いには弱い傾向があります。",
          },
        },
        {
          type: "NPC",
          imageName: "npc6",
          x: 800,
          y: 450,
          name: "村人F",
          dialog: [
            "この前、AIは「ハルシネーション」？とかいうのを起こすって聞いたんですが、\n一体どういう意味なんでしょう？",
          ],
          quiz: {
            question:
              "Q6. 生成AIが「ハルシネーション」を起こすとはどういう意味？",
            options: [
              "AIが画像を生成する際に色彩が不自然になること",
              "AIが存在しない情報や事実をもっともらしく生成すること",
              "AIが処理中にクラッシュすること",
              "AIが人間の感情を模倣すること",
            ],
            correctAnswer: "B",
            explanation:
              "生成AIは、学習した情報をもとに推論して出力しますが、\n時には事実と異なる内容を自信満々に生成することがあります。\nこれを「ハルシネーション」と呼び、\n特に業務利用時には注意が必要です。",
          },
        },
      ],
    },
  },
  /**
   * @type {object} - ミッションの定義（現在は未使用）
   */
  missions: {
    // 今後ミッション機能を追加する際に使用
  },
};
