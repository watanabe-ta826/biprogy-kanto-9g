/**
 * @file UI関連の機能を提供します。
 */

/**
 * スタイル付きのインタラクティブなボタンを作成します。
 * @param {Phaser.Scene} scene - ボタンを追加するシーン。
 * @param {number} x - ボタンのX座標。
 * @param {number} y - ボタンのY座標。
 * @param {string} text - ボタンに表示するテキスト。
 * @param {function} onClick - ボタンがクリックされたときに呼び出されるコールバック関数。
 * @param {object} [options={}] - ボタンのスタイルと動作をカスタマイズするためのオプション。
 * @param {object} [options.style] - Phaserのテキストスタイルオブジェクト。デフォルトのスタイルを上書きします。
 * @param {number[]} [options.origin=[0.5, 0.5]] - ボタンの原点。 [x, y] の形式。
 * @param {boolean} [options.handleInteraction=true] - マウスオーバー/アウト/ダウンの効果を自動で処理するかどうか。
 * @param {number} [options.depth] - ボタンの深度。
 * @param {string} [options.color] - ボタンの背景色（例: '#007bff'）。
 * @returns {Phaser.GameObjects.Text} 作成されたボタンオブジェクト。
 */
export function createButton(scene, x, y, text, onClick, options = {}) {
    const defaultStyle = {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        fill: '#fff',
        backgroundColor: options.color || '#007bff', // デフォルトは青
        padding: { x: 20, y: 10 },
        borderRadius: 5
    };

    const buttonStyle = { ...defaultStyle, ...options.style };
    const button = scene.add.text(x, y, text, buttonStyle);

    const origin = options.origin || [0.5, 0.5];
    button.setOrigin(...origin);

    if (options.depth !== undefined) {
        button.setDepth(options.depth);
    }

    if (options.handleInteraction !== false) {
        button.setInteractive();

        button.on('pointerover', () => {
            scene.game.canvas.style.cursor = 'pointer';
            // 色を少し暗くするなどのホバー効果
            // button.setBackgroundColor(...)
        });

        button.on('pointerout', () => {
            scene.game.canvas.style.cursor = 'default';
            // 元の色に戻す
            // button.setBackgroundColor(buttonStyle.backgroundColor);
        });

        button.on('pointerdown', () => {
            // クリック時のアニメーション
            scene.tweens.add({
                targets: button,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    if (onClick) {
                        onClick();
                    }
                }
            });
        });
    }

    return button;
}


/**
 * @file UI関連の機能を提供します。現在はインベントリUIの作成と管理を担当しています。
 */

/**
 * インベントリUIを作成し、その表示を切り替える機能を提供します。
 * @param {Phaser.Scene} scene - このUIが所属するシーン。
 * @returns {{inventoryUI: Phaser.GameObjects.Container, toggleInventory: function}} インベントリUIコンテナと、その表示/非表示を切り替える関数を持つオブジェクト。
 */
/*
export function createInventory(scene, initialInventory = []) {
    const inventory = [...initialInventory]; // 初期インベントリをコピー
    const inventoryUI = scene.add.container(20, 20).setScrollFactor(0).setDepth(100);

    // UIの背景を作成 (少し豪華なデザインに変更)
    const background = scene.add.graphics();
    background.fillStyle(0x2c3e50, 0.9); // 深い青色
    background.lineStyle(3, 0xf1c40f, 1); // 金色の枠線
    background.fillRoundedRect(0, 0, 220, 280, 15);
    background.strokeRoundedRect(0, 0, 220, 280, 15);

    // タイトルテキスト
    const inventoryTitle = scene.add.text(110, 30, '所持品', { 
        fontFamily: 'Meiryo, sans-serif',
        fontSize: '22px', 
        fill: '#f1c40f',
        stroke: '#a67c00',
        strokeThickness: 2
    }).setOrigin(0.5);
    
    // アイテムリストを表示するテキストエリア
    const itemListText = scene.add.text(25, 70, '', { 
        fontFamily: 'Meiryo, sans-serif',
        fontSize: '18px', 
        fill: '#ecf0f1', // 明るい灰色
        wordWrap: { width: 180 },
        lineSpacing: 8
    });

    inventoryUI.add([background, inventoryTitle, itemListText]);
    inventoryUI.setVisible(false);

    const updateItemList = () => {
        const itemList = inventory.length > 0 
            ? inventory.map(item => `◆ ${item}`).join('\n') // アイコンを◆に変更
            : '（なし）';
        itemListText.setText(itemList);
    };

    const addItem = (itemName) => {
        inventory.push(itemName);
        updateItemList();
    };

    const toggleInventory = () => {
        inventoryUI.setVisible(!inventoryUI.visible);
    };

    updateItemList(); // 初期表示を更新

    return { inventoryUI, toggleInventory, addItem };
}
*/
