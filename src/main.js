import kaboom from "kaboom"

kaboom({
  background: [4, 4, 14],
  width: 800,
  height: 600,
  letterbox: true,
})

// ─── GLOBAL STATE ─────────────────────────────────────────────────────────────
let score = 0
let lives = 3
let currentLevel = 1
let waveSpawning = false

// ─── LEVEL CONFIG ─────────────────────────────────────────────────────────────
// scoreThreshold: score needed to advance to next level
const LEVEL_CONFIG = {
  1: { scoreThreshold: 1000, enemyRows: 2, enemyCols: 6, enemySpeed: 60,  enemyFireRate: 2.5, label: "SECTOR 1" },
  2: { scoreThreshold: 3000, enemyRows: 3, enemyCols: 7, enemySpeed: 95,  enemyFireRate: 1.8, label: "SECTOR 2" },
  3: { scoreThreshold: 99999,enemyRows: 4, enemyCols: 8, enemySpeed: 130, enemyFireRate: 1.2, label: "SECTOR 3 - FINAL" },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function spawnStars() {
  for (let i = 0; i < 80; i++) {
    add([
      rect(rand(1, 2.5), rand(1, 2.5)),
      pos(rand(0, width()), rand(0, height())),
      color(200, 200, 255),
      opacity(rand(0.2, 0.8)),
      anchor("center"),
      z(-1),
      "star",
      { speed: rand(20, 60) },
    ])
  }
}

function moveStars() {
  get("star").forEach(s => {
    s.pos.y += s.speed * dt()
    if (s.pos.y > height()) {
      s.pos.y = 0
      s.pos.x = rand(0, width())
    }
  })
}

function refreshHUD() {
  get("hud").forEach(h => destroy(h))
  const cfg = LEVEL_CONFIG[currentLevel]
  const nextThreshold = cfg.scoreThreshold
  const progressLabel = currentLevel < 3
    ? `  [${score}/${nextThreshold}]`
    : ""

  add([
    text(`SCORE: ${score}${progressLabel}`, { size: 16 }),
    pos(10, 10),
    color(180, 255, 180),
    fixed(), z(100), "hud",
  ])
  add([
    text(`${"♥ ".repeat(lives)}`, { size: 16 }),
    pos(width() - 10, 10),
    anchor("topright"),
    color(255, 100, 120),
    fixed(), z(100), "hud",
  ])
  add([
    text(`LEVEL ${currentLevel}`, { size: 16 }),
    pos(center().x, 10),
    anchor("top"),
    color(160, 200, 255),
    fixed(), z(100), "hud",
  ])
}

function spawnWave(cfg) {
  if (waveSpawning) return
  waveSpawning = true

  // small delay before wave drops in so it feels intentional
  wait(0.8, () => {
    waveSpawning = false
    const cols = cfg.enemyCols
    const rows = cfg.enemyRows
    const spacingX = Math.min(70, (width() - 80) / cols)
    const startX = (width() - spacingX * (cols - 1)) / 2

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        add([
          polygon([vec2(0, 10), vec2(-13, -10), vec2(13, -10)]),
          pos(startX + col * spacingX, 55 + row * 48),
          anchor("center"),
          color(255, 80 + row * 20, 80),
          area({ shape: new Rect(vec2(-11, -10), 22, 20) }),
          "enemy",
          {
            shootTimer: rand(0.5, cfg.enemyFireRate),
            speed: cfg.enemySpeed,
            dir: 1,
          },
        ])
      }
    }
  })
}

// ─── TITLE SCENE ──────────────────────────────────────────────────────────────
scene("title", () => {
  score = 0
  lives = 3
  currentLevel = 1
  waveSpawning = false

  spawnStars()
  onUpdate(() => moveStars())

  add([
    text("STAR SIEGE", { size: 72 }),
    pos(center().x, center().y - 130),
    anchor("center"),
    color(180, 220, 255),
  ])
  add([
    text("2D SPACE SHOOTER", { size: 20 }),
    pos(center().x, center().y - 70),
    anchor("center"),
    color(100, 140, 200),
  ])

  const playBtn = add([
    rect(220, 58, { radius: 5 }),
    pos(center().x, center().y + 20),
    anchor("center"),
    color(30, 80, 180),
    area(), z(10),
  ])
  add([
    text("PLAY", { size: 30 }),
    pos(center().x, center().y + 20),
    anchor("center"),
    color(255, 255, 255), z(11),
  ])

  const quitBtn = add([
    rect(220, 58, { radius: 5 }),
    pos(center().x, center().y + 100),
    anchor("center"),
    color(100, 20, 20),
    area(), z(10),
  ])
  add([
    text("QUIT", { size: 30 }),
    pos(center().x, center().y + 100),
    anchor("center"),
    color(255, 255, 255), z(11),
  ])

  add([
    text("ARROWS / WASD to move   SPACE to shoot", { size: 14 }),
    pos(center().x, height() - 30),
    anchor("center"),
    color(80, 100, 140),
  ])

  playBtn.onClick(() => go("game", 1))
  quitBtn.onClick(() => { if (confirm("Quit?")) window.close() })
  onKeyPress("enter", () => go("game", 1))
})

// ─── GAME SCENE ───────────────────────────────────────────────────────────────
scene("game", (levelNum) => {
  currentLevel = levelNum
  waveSpawning = false
  const cfg = LEVEL_CONFIG[levelNum]

  spawnStars()
  onUpdate(() => moveStars())
  refreshHUD()

  // ── Player ──
  const player = add([
    polygon([vec2(0, -22), vec2(-14, 14), vec2(14, 14)]),
    pos(center().x, height() - 60),
    anchor("center"),
    color(100, 200, 255),
    area({ shape: new Rect(vec2(-12, -20), 24, 34) }),
    "player",
    { speed: 280, shootCooldown: 0, invincible: 0 },
  ])

  const thruster = add([
    rect(6, 10, { radius: 3 }),
    pos(player.pos.x, player.pos.y + 16),
    anchor("center"),
    color(255, 160, 50),
    z(-1),
  ])

  // spawn first wave immediately
  spawnWave(cfg)

  // ── Enemy shared movement direction ──
  let enemyDir = 1

  onUpdate("enemy", (e) => {
    e.pos.x += e.speed * enemyDir * dt()

    e.shootTimer -= dt()
    if (e.shootTimer <= 0) {
      e.shootTimer = cfg.enemyFireRate + rand(-0.3, 0.3)
      add([
        rect(4, 12),
        pos(e.pos.x, e.pos.y + 12),
        anchor("center"),
        color(255, 80, 80),
        move(DOWN, 260),
        area(),
        offscreen({ destroy: true }),
        "enemyBullet",
      ])
    }
  })

  // Edge detection: reverse all enemies when any hits wall
  onUpdate(() => {
    const enemies = get("enemy")

    // No enemies on screen and none spawning → spawn next wave
    if (enemies.length === 0 && !waveSpawning) {
      spawnWave(cfg)
      return
    }

    let hitEdge = false
    for (const e of enemies) {
      if (e.pos.x > width() - 18 || e.pos.x < 18) {
        hitEdge = true
        break
      }
    }
    if (hitEdge) {
      enemyDir *= -1
      enemies.forEach(e => {
        e.pos.y += 16
        e.speed = Math.min(e.speed + 4, 320)
      })
    }

    // Score threshold reached → level up
    if (score >= cfg.scoreThreshold && currentLevel < 3) {
      go("levelTransition", currentLevel + 1)
    }
    // Level 3 win condition: score threshold (set very high, effectively survive & grind)
    // Instead let's give level 3 a reachable win score
    if (currentLevel === 3 && score >= 6000) {
      go("win")
    }
  })

  // ── Player update ──
  onUpdate("player", (p) => {
    p.shootCooldown -= dt()
    p.invincible = Math.max(0, p.invincible - dt())

    if (isKeyDown("left")  || isKeyDown("a")) p.pos.x = Math.max(20, p.pos.x - p.speed * dt())
    if (isKeyDown("right") || isKeyDown("d")) p.pos.x = Math.min(width() - 20, p.pos.x + p.speed * dt())
    if (isKeyDown("up")    || isKeyDown("w")) p.pos.y = Math.max(80, p.pos.y - p.speed * dt())
    if (isKeyDown("down")  || isKeyDown("s")) p.pos.y = Math.min(height() - 20, p.pos.y + p.speed * dt())

    if (isKeyDown("space") && p.shootCooldown <= 0) {
      p.shootCooldown = 0.22
      add([
        rect(4, 16),
        pos(p.pos.x, p.pos.y - 22),
        anchor("center"),
        color(100, 255, 220),
        move(UP, 520),
        area(),
        offscreen({ destroy: true }),
        "playerBullet",
      ])
    }

    p.opacity = p.invincible > 0 ? wave(0.2, 1, time() * 12) : 1
    thruster.pos = vec2(p.pos.x, p.pos.y + 16)
  })

  // ── Collisions ──
  onCollide("playerBullet", "enemy", (bullet, enemy) => {
    destroy(bullet)
    destroy(enemy)
    score += 100 * currentLevel

    const flash = add([
      rect(22, 22),
      pos(enemy.pos),
      anchor("center"),
      color(255, 200, 50),
      opacity(1), z(50),
    ])
    wait(0.08, () => destroy(flash))

    refreshHUD()
  })

  onCollide("enemyBullet", "player", (bullet, p) => {
    if (p.invincible > 0) return
    destroy(bullet)
    p.invincible = 2.0
    lives--
    refreshHUD()
    if (lives <= 0) go("gameover")
  })

  onCollide("enemy", "player", (enemy, p) => {
    if (p.invincible > 0) return
    p.invincible = 2.0
    lives--
    refreshHUD()
    if (lives <= 0) go("gameover")
  })

  // Flash level label on enter
  const lvlLabel = add([
    text(cfg.label, { size: 36 }),
    pos(center()),
    anchor("center"),
    color(255, 220, 100),
    z(90),
  ])
  wait(1.5, () => destroy(lvlLabel))
})

// ─── LEVEL TRANSITION ─────────────────────────────────────────────────────────
scene("levelTransition", (nextLevel) => {
  // destroy leftover enemies/bullets from previous level
  get("enemy").forEach(e => destroy(e))
  get("enemyBullet").forEach(b => destroy(b))
  get("playerBullet").forEach(b => destroy(b))

  spawnStars()
  onUpdate(() => moveStars())

  add([
    text(`LEVEL ${nextLevel - 1} CLEAR!`, { size: 52 }),
    pos(center().x, center().y - 80),
    anchor("center"),
    color(100, 220, 255),
  ])
  add([
    text(`SCORE: ${score}`, { size: 28 }),
    pos(center().x, center().y - 10),
    anchor("center"),
    color(180, 255, 180),
  ])
  add([
    text(`LIVES: ${"♥ ".repeat(lives)}`, { size: 24 }),
    pos(center().x, center().y + 40),
    anchor("center"),
    color(255, 100, 120),
  ])
  add([
    text(`ENTERING: ${LEVEL_CONFIG[nextLevel].label}`, { size: 22 }),
    pos(center().x, center().y + 90),
    anchor("center"),
    color(200, 200, 100),
  ])

  const btn = add([
    rect(240, 58, { radius: 5 }),
    pos(center().x, center().y + 160),
    anchor("center"),
    color(30, 60, 140),
    area(),
  ])
  add([
    text("CONTINUE", { size: 26 }),
    pos(center().x, center().y + 160),
    anchor("center"),
    color(255, 255, 255),
  ])

  btn.onClick(() => go("game", nextLevel))
  onKeyPress("enter", () => go("game", nextLevel))
})

// ─── WIN SCENE ────────────────────────────────────────────────────────────────
scene("win", () => {
  spawnStars()
  onUpdate(() => moveStars())

  add([
    text("YOU WIN!", { size: 64 }),
    pos(center().x, center().y - 90),
    anchor("center"),
    color(100, 255, 150),
  ])
  add([
    text(`FINAL SCORE: ${score}`, { size: 32 }),
    pos(center().x, center().y - 10),
    anchor("center"),
    color(200, 255, 200),
  ])
  add([
    text(`LIVES REMAINING: ${"♥ ".repeat(lives)}`, { size: 22 }),
    pos(center().x, center().y + 45),
    anchor("center"),
    color(255, 120, 140),
  ])

  const btn = add([
    rect(240, 58, { radius: 5 }),
    pos(center().x, center().y + 120),
    anchor("center"),
    color(30, 100, 50),
    area(),
  ])
  add([
    text("PLAY AGAIN", { size: 26 }),
    pos(center().x, center().y + 120),
    anchor("center"),
    color(255, 255, 255),
  ])

  btn.onClick(() => go("title"))
  onKeyPress("enter", () => go("title"))
})

// ─── GAME OVER ────────────────────────────────────────────────────────────────
scene("gameover", () => {
  spawnStars()
  onUpdate(() => moveStars())

  add([
    text("GAME OVER", { size: 64 }),
    pos(center().x, center().y - 90),
    anchor("center"),
    color(255, 80, 80),
  ])
  add([
    text(`SCORE: ${score}`, { size: 32 }),
    pos(center().x, center().y - 10),
    anchor("center"),
    color(200, 200, 200),
  ])
  add([
    text(`REACHED LEVEL ${currentLevel}`, { size: 22 }),
    pos(center().x, center().y + 40),
    anchor("center"),
    color(160, 160, 200),
  ])

  const btn = add([
    rect(240, 58, { radius: 5 }),
    pos(center().x, center().y + 120),
    anchor("center"),
    color(120, 20, 20),
    area(),
  ])
  add([
    text("TRY AGAIN", { size: 26 }),
    pos(center().x, center().y + 120),
    anchor("center"),
    color(255, 255, 255),
  ])

  btn.onClick(() => go("title"))
  onKeyPress("enter", () => go("title"))
})

// ─── BOOT ─────────────────────────────────────────────────────────────────────
go("title")