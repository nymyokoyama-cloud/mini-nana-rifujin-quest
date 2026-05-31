/**
 * GameScene.ts
 * ゲーム本体。ステージデータを読んで世界を組み立て、
 * 物理・死亡/復活・HUD・クリア判定を管理する。
 */
import Phaser from "phaser";
import { SCENES, TEX, CSS, COLORS, GAME_WIDTH, GAME_HEIGHT } from "../config";
import { STAGE_FIRST, StageObject, StageData } from "../data/stages";
import { getDeathMessage } from "../data/deathMessages";
import { GAME_TITLE } from "../data/texts";
import { createKeys, GameKeys, justDown } from "../utils/input";
import { Stopwatch, formatTime } from "../utils/timer";

import { Player } from "../objects/Player";
import { Platform } from "../objects/Platform";
import { Trap } from "../objects/Trap";
import { Checkpoint } from "../objects/Checkpoint";
import { Goal } from "../objects/Goal";
import { MessageBoard } from "../objects/MessageBoard";
import { MessageBox } from "../objects/MessageBox";
import type {
  StageBuildContext,
  Updatable,
  Resettable,
  ZoneData,
} from "../objects/types";

import { HallucinationFloor } from "../objects/gimmicks/HallucinationFloor";
import { GeneratingPlatform } from "../objects/gimmicks/GeneratingPlatform";
import { InfoGate, GateKey } from "../objects/gimmicks/InfoGate";
import { AlgorithmWind } from "../objects/gimmicks/AlgorithmWind";
import { FlameComment } from "../objects/gimmicks/FlameComment";
import { DeadlineDashFloor } from "../objects/gimmicks/DeadlineDashFloor";
import { PromptSwamp } from "../objects/gimmicks/PromptSwamp";
import { EasyPath } from "../objects/gimmicks/EasyPath";

export class GameScene extends Phaser.Scene {
  private stage!: StageData;
  private player!: Player;
  private keys!: GameKeys;

  // 物理グループ・ゾーン
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private traps!: Phaser.Physics.Arcade.Group;
  private swampZones: ZoneData[] = [];
  private windZones: ZoneData[] = [];
  private dashZones: ZoneData[] = [];

  // 各種オブジェクト
  private checkpoints: Checkpoint[] = [];
  private updatables: Updatable[] = [];
  private resettables: Resettable[] = [];
  private gatesById = new Map<string, InfoGate[]>();

  // 状態
  private spawn = { x: 0, y: 0 };
  private deaths = 0;
  private isDead = false;
  private isCleared = false;
  private isPaused = false;
  private deathAt = 0;
  private watch = new Stopwatch();

  // UI
  private messageBox!: MessageBox;
  private hudDeaths!: Phaser.GameObjects.Text;
  private hudTime!: Phaser.GameObjects.Text;
  private pauseOverlay!: Phaser.GameObjects.Container;

  constructor() {
    super(SCENES.game);
  }

  create(): void {
    // 状態を初期化（リスタートに備える）
    this.swampZones = [];
    this.windZones = [];
    this.dashZones = [];
    this.checkpoints = [];
    this.updatables = [];
    this.resettables = [];
    this.gatesById = new Map();
    this.deaths = 0;
    this.isDead = false;
    this.isCleared = false;
    this.isPaused = false;

    this.stage = STAGE_FIRST;
    this.spawn = { ...this.stage.spawn };

    // 物理ワールドとカメラの範囲をステージ幅に合わせる
    this.physics.world.setBounds(0, 0, this.stage.worldWidth, this.stage.worldHeight + 300);
    this.cameras.main.setBounds(0, 0, this.stage.worldWidth, this.stage.worldHeight);
    this.cameras.main.setBackgroundColor(CSS.sky);

    // 背景の飾り（雲っぽい円）をうっすら
    this.makeBackdrop();

    // グループ生成
    this.solids = this.physics.add.staticGroup();
    this.traps = this.physics.add.group({ allowGravity: false, immovable: true });

    // プレイヤー生成
    this.player = new Player(this, this.spawn.x, this.spawn.y);

    // ステージ構築用の文脈
    const ctx: StageBuildContext = {
      scene: this,
      solids: this.solids,
      traps: this.traps,
      swampZones: this.swampZones,
      windZones: this.windZones,
      dashZones: this.dashZones,
      registerUpdatable: (u) => this.updatables.push(u),
      registerResettable: (r) => this.resettables.push(r),
      registerGate: (id, gate) => {
        const arr = this.gatesById.get(id) ?? [];
        arr.push(gate as InfoGate);
        this.gatesById.set(id, arr);
      },
      collectKey: (id) => this.openGatesById(id),
      getPlayer: () => this.player,
    };

    // ステージのオブジェクトを順番に生成
    for (const obj of this.stage.objects) {
      this.buildObject(ctx, obj);
    }

    // 衝突・重なりの登録
    this.physics.add.collider(this.player, this.solids);
    this.physics.add.overlap(this.player, this.traps, (_p, trap) => {
      const reason = (trap as Phaser.GameObjects.GameObject).getData("reason") as string;
      this.die(reason);
    });

    // カメラ追従
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(120, 80);

    // 入力・UI
    this.keys = createKeys(this);
    this.messageBox = new MessageBox(this);
    this.buildHud();
    this.buildPauseOverlay();

    // 計測開始
    this.watch.start(this.time.now);

    // 最初のひとこと
    this.messageBox.showNotice("この先、ちょっと理不尽かも。\nでも覚えればいけるよ！", 2200);
  }

  // ===== ステージ構築のファクトリ =====
  private buildObject(ctx: StageBuildContext, obj: StageObject): void {
    switch (obj.type) {
      case "ground":
      case "platform":
        new Platform(ctx, obj);
        break;
      case "spike":
        new Trap(ctx, obj, "spike");
        break;
      case "easyPath":
        new EasyPath(ctx, obj);
        break;
      case "hallucination":
        new HallucinationFloor(ctx, obj);
        break;
      case "generating":
        new GeneratingPlatform(ctx, obj);
        break;
      case "gate":
        new InfoGate(ctx, obj);
        break;
      case "key": {
        const key = new GateKey(ctx, obj);
        this.physics.add.overlap(this.player, key.zone, () => {
          if (key.isCollected()) return;
          key.collect();
          this.openGatesById(key.gateId);
          this.messageBox.showNotice("カギを取った！ ゲートが開いたよ");
        });
        break;
      }
      case "swamp":
        new PromptSwamp(ctx, obj);
        break;
      case "dashFloor":
        new DeadlineDashFloor(ctx, obj);
        break;
      case "wind":
        new AlgorithmWind(ctx, obj);
        break;
      case "commentSpawner":
        new FlameComment(ctx, obj);
        break;
      case "checkpoint": {
        const cp = new Checkpoint(ctx, obj);
        this.checkpoints.push(cp);
        this.physics.add.overlap(this.player, cp.zone, () => this.activateCheckpoint(cp));
        break;
      }
      case "goal":
      case "fakeGoal": {
        const goal = new Goal(ctx, obj);
        this.physics.add.overlap(this.player, goal.zone, () => this.onGoal(goal));
        break;
      }
      case "board":
        new MessageBoard(ctx, obj);
        break;
    }
  }

  private openGatesById(id: string): void {
    const gates = this.gatesById.get(id);
    if (!gates) return;
    for (const g of gates) g.open();
  }

  // ===== 毎フレーム処理 =====
  update(time: number, delta: number): void {
    if (this.isCleared) return;

    // ポーズ切り替え
    if (justDown([this.keys.pause])) {
      this.togglePause();
    }
    if (this.isPaused) return;

    if (this.isDead) {
      // リトライ待ち（キー入力ですぐ / 一定時間で自動）
      if (justDown([this.keys.retry]) || justDown(this.keys.jump) || time - this.deathAt > 1500) {
        this.respawn();
      }
      return;
    }

    // --- 状態異常フラグを毎フレーム作り直す ---
    this.player.inSwamp = false;
    this.player.windDir = 0;
    this.player.windForce = 0;
    this.player.forcedDashDir = 0;

    if (this.swampZones.length) {
      this.physics.overlap(this.player, this.swampZones, () => {
        this.player.inSwamp = true;
      });
    }
    if (this.windZones.length) {
      this.physics.overlap(this.player, this.windZones, (_p, z) => {
        const zone = z as ZoneData;
        this.player.windDir = zone.dir ?? 0;
        this.player.windForce = zone.currentForce ?? 0;
      });
    }
    if (this.dashZones.length) {
      this.physics.overlap(this.player, this.dashZones, (_p, z) => {
        const zone = z as ZoneData;
        this.player.forcedDashDir = zone.dir ?? 0;
      });
    }

    // プレイヤー操作
    this.player.handleInput(this.keys);

    // ギミック更新
    for (const u of this.updatables) u.update(time, delta);

    // HUD（時間）更新
    this.hudTime.setText("⏱ " + formatTime(this.watch.elapsed(this.time.now)));

    // 落下死の判定
    if (this.player.y > this.stage.deathY) {
      this.die("fall");
    }
  }

  // ===== 死亡・復活 =====
  private die(reason?: string): void {
    if (this.isDead || this.isCleared || !this.player.alive) return;
    this.isDead = true;
    this.deaths += 1;
    this.deathAt = this.time.now;
    this.hudDeaths.setText("☠ 死亡: " + this.deaths);

    // 死亡演出（その場でキラキラ弾ける）
    this.spawnDeathBurst(this.player.x, this.player.y - 20);

    this.player.kill();
    this.messageBox.showDeath(getDeathMessage(reason), this.deaths);
  }

  private respawn(): void {
    this.isDead = false;
    this.messageBox.hide();

    // ギミック・カギ・ゲートを初期状態へ
    for (const r of this.resettables) r.reset();

    this.player.respawn(this.spawn.x, this.spawn.y);
    this.cameras.main.centerOn(this.spawn.x, this.spawn.y - 100);
  }

  private activateCheckpoint(cp: Checkpoint): void {
    if (cp.activated) return;
    cp.activate();
    this.spawn = { x: cp.spawnX, y: cp.spawnY };
    this.messageBox.showNotice("チェックポイント！ ここから再開できるよ");
  }

  private onGoal(goal: Goal): void {
    if (this.isCleared || this.isDead) return;
    if (goal.isFake) {
      // 偽ゴール: クリアにはならない
      this.messageBox.showNotice("やさしいゴール…？\nほんとのゴールは別にあるみたい", 2000);
      return;
    }
    this.clearStage();
  }

  private clearStage(): void {
    this.isCleared = true;
    this.watch.pause(this.time.now);
    const timeMs = this.watch.elapsed(this.time.now);

    // 軽いお祝い演出のあとリザルトへ
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.cameras.main.flash(400, 255, 255, 255);
    this.messageBox.showNotice("クリア！ おつかれさま！", 1200);

    this.time.delayedCall(1200, () => {
      this.scene.start(SCENES.result, { deaths: this.deaths, timeMs });
    });
  }

  // ===== 演出・UI =====
  private spawnDeathBurst(x: number, y: number): void {
    const emitter = this.add.particles(x, y, TEX.particle, {
      speed: { min: 120, max: 280 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 16,
      tint: [COLORS.pink, COLORS.yellow, COLORS.red],
      emitting: false,
    });
    emitter.explode(16, x, y);
    this.time.delayedCall(600, () => emitter.destroy());
  }

  private makeBackdrop(): void {
    // ゆるい雲（スクロールに合わせて少しだけ動く視差）
    for (let i = 0; i < 14; i++) {
      const x = Phaser.Math.Between(0, this.stage.worldWidth);
      const y = Phaser.Math.Between(40, 220);
      const c = this.add.circle(x, y, Phaser.Math.Between(20, 44), COLORS.white, 0.5);
      c.setScrollFactor(0.5);
      c.setDepth(-10);
    }
  }

  private buildHud(): void {
    const style = {
      fontFamily: "sans-serif",
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: CSS.pinkDeep,
      strokeThickness: 5,
    };
    this.hudDeaths = this.add
      .text(16, 12, "☠ 死亡: 0", style)
      .setScrollFactor(0)
      .setDepth(900);
    this.hudTime = this.add
      .text(GAME_WIDTH - 16, 12, "⏱ 00:00.00", style)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(900);
    this.add
      .text(GAME_WIDTH / 2, 14, `「${this.stage.name}」`, {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: CSS.textDark,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(900);
    // 操作ヒント（下部）
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 8, "移動: ← →   ジャンプ: Space   リトライ: R   ポーズ: Esc", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: CSS.textDark,
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(900)
      .setAlpha(0.7);
  }

  private buildPauseOverlay(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const dim = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, COLORS.black, 0.6);
    const title = this.add
      .text(cx, cy - 30, "ポーズ中", {
        fontFamily: "sans-serif",
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const hint = this.add
      .text(cx, cy + 30, "Esc でさいかい  /  R でリトライ", {
        fontFamily: "sans-serif",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.pauseOverlay = this.add
      .container(0, 0, [dim, title, hint])
      .setScrollFactor(0)
      .setDepth(1100)
      .setVisible(false);
  }

  private togglePause(): void {
    if (this.isDead || this.isCleared) return;
    this.isPaused = !this.isPaused;
    this.pauseOverlay.setVisible(this.isPaused);
    if (this.isPaused) {
      this.physics.pause();
      this.watch.pause(this.time.now);
    } else {
      this.physics.resume();
      this.watch.resume(this.time.now);
    }
  }
}
