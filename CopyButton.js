import { createButton } from './ui.js';

/**
 * コピーボタンを作成し、シーンに追加する関数
 * @param {Phaser.Scene} scene - ボタンを追加するシーン
 * @param {number} x - ボタンのX座標
 * @param {number} y - ボタンのY座標
 * @param {string} textToCopy - クリップボードにコピーするテキスト
 * @param {string} [buttonText='コピー'] - ボタンに表示するテキスト
 * @returns {Phaser.GameObjects.Text} 作成されたボタンオブジェクト
 */
export function createCopyButton(scene, x, y, textToCopy, buttonText = 'コピー') {
    const copyLogic = () => {
        if (scene.isModalOpen) return;

        if (!navigator.clipboard) {
            console.error('Clipboard API is not available in this browser.');
            const message = scene.add.text(copyButton.x, copyButton.y + 30, 'このブラウザは対応していません', {
                fontSize: '14px', fill: '#e74c3c'
            }).setOrigin(0.5);
            scene.time.delayedCall(2000, () => message.destroy());
            return;
        }

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                const message = scene.add.text(copyButton.x, copyButton.y + 30, 'コピーしました！', {
                    fontSize: '16px',
                    fill: '#2ecc71',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: { x: 5, y: 2 }
                }).setOrigin(0.5);
                scene.time.delayedCall(1500, () => message.destroy());
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                const message = scene.add.text(copyButton.x, copyButton.y + 30, 'コピーに失敗しました', {
                    fontSize: '16px',
                    fill: '#e74c3c',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: { x: 5, y: 2 }
                }).setOrigin(0.5);
                scene.time.delayedCall(1500, () => message.destroy());
            });
    };

    const copyButton = createButton(scene, x, y, buttonText, copyLogic, {
        style: {
            fontSize: '18px',
            padding: { x: 10, y: 5 },
        },
        color: '#3498db'
    });

    return copyButton;
}