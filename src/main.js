import kaboom from "kaboom"

kaboom({
  background: [8, 8, 18],
})

// ─── TITLE SCREEN ────────────────────────────────────────────────────────────
scene("title", () => {

  add([
    text("GAME TITLE", { size: 64 }),
    pos(center().x, center().y - 120),
    anchor("center"),
    color(200, 160, 255),
  ])

  // PLAY button
  const playBtn = add([
    rect(200, 60, { radius: 6 }),
    pos(center().x, center().y + 20),
    anchor("center"),
    color(80, 40, 180),
    area(),
  ])
  add([
    text("PLAY", { size: 28 }),
    pos(center().x, center().y + 20),
    anchor("center"),
    color(255, 255, 255),
  ])

  // QUIT button
  const quitBtn = add([
    rect(200, 60, { radius: 6 }),
    pos(center().x, center().y + 110),
    anchor("center"),
    color(80, 20, 20),
    area(),
  ])
  add([
    text("QUIT", { size: 28 }),
    pos(center().x, center().y + 110),
    anchor("center"),
    color(255, 255, 255),
  ])

  playBtn.onClick(() => go("level1"))
  quitBtn.onClick(() => {
    if (confirm("Quit game?")) window.close()
  })

  onKeyPress("enter", () => go("level1"))

  add([
    text("press ENTER to start", { size: 16 }),
    pos(center().x, height() - 40),
    anchor("center"),
    color(100, 90, 140),
  ])
})

// ─── LEVEL 1 PLACEHOLDER ─────────────────────────────────────────────────────
scene("level1", () => {

  add([
    text("LEVEL 1", { size: 64 }),
    pos(center().x, center().y - 40),
    anchor("center"),
    color(200, 160, 255),
  ])

  add([
    text("hello world", { size: 32 }),
    pos(center().x, center().y + 40),
    anchor("center"),
    color(160, 140, 200),
  ])

  add([
    text("ESC to return to menu", { size: 18 }),
    pos(center().x, height() - 40),
    anchor("center"),
    color(100, 90, 140),
  ])

  onKeyPress("escape", () => go("title"))
})

go("title")