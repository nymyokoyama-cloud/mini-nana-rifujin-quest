/**
 * MessageBox.ts
 * 画面に固定表示するメッセージUI（死亡メッセージ・お知らせ）。
 * カメラに追従せず常に同じ位置に出す（setScrollFactor(0)）。
 */
import Phaser from "phaser";
import { COLORS, CSS, GAME_WIDTH, GAME_HEIGHT } from "../config";

export class MessageBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private title: Phaser.GameObjects.Text;
  private body: Phaser.GameObjects.Text;
  private noticeTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const cx = GAME_WIDTH / 2;

    this.bg = scene.add
      .rectangle(cx, GAME_HEIGHT / 2, 560, 150, COLORS.black, 0.72)
      .setStrokeStyle(3, COLORS.pink);
    this.title = scene.add
      .text(cx, GAME_HEIGHT / 2 - 38, "", {
        fontFamily: "sans-serif",
        fontSize: "26px",
        color: CSS.pink,
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.body = scene.add
      .text(cx, GAME_HEIGHT / 2 + 6, "", {
        fontFamily: "sans-serif",
        fontSize: "19px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 520 },
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    this.container = scene.add
      .container(0, 0, [this.bg, this.title, this.body])
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);
  }

  /** 死亡メッセージ表示（リトライ案内つき）。 */
  public showDeath(message: string, deaths: number): void {
    this.title.setText(`ミス！（${deaths}回目）`);
    this.body.setText(`${message}\n\n[ R ] または ジャンプ ですぐリトライ`);
    this.container.setVisible(true);
  }

  /** 一時的なお知らせ（数秒で自動的に消える）。 */
  public showNotice(message: string, durationMs = 1600): void {
    this.title.setText("");
    this.body.setText(message);
    this.container.setVisible(true);
    this.noticeTimer?.remove();
    this.noticeTimer = this.scene.time.delayedCall(durationMs, () => this.hide());
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.container.visible;
  }
}
