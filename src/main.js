import kaboom from "kaboom"

// 1. Setup
kaboom({
    background: [20, 20, 40], // Dark "vibe" background
})

// 2. Load built-in assets
loadBean()

// --- SCENE: TITLE SCREEN ---
scene("title", () => {
    add([
        text("HELLO WORLD GAME", { size: 48 }),
        pos(center()),
        anchor("center"),
    ])

    // Start Button
    const startBtn = add([
        rect(200, 50, { radius: 8 }),
        pos(center().x, center().y + 80),
        color(0, 255, 100),
        anchor("center"),
        area(),
    ])

    startBtn.add([
        text("START", { size: 24 }),
        anchor("center"),
        color(0, 0, 0),
    ])

    // Quit Button
    const quitBtn = add([
        rect(200, 50, { radius: 8 }),
        pos(center().x, center().y + 150),
        color(255, 50, 50),
        anchor("center"),
        area(),
    ])

    quitBtn.add([
        text("QUIT", { size: 24 }),
        anchor("center"),
        color(0, 0, 0),
    ])

    // Button Logic
    startBtn.onClick(() => go("game"))
    
    // In Web Games, "Quit" usually just refreshes or clears the screen
    quitBtn.onClick(() => {
        if(confirm("Close game?")) window.close();
    })
    
    // Visual "Vibe": Make the title bounce
    onUpdate(() => {
        startBtn.scale = wave(1, 1.1, time() * 5)
    })
})

// --- SCENE: GAME LEVEL ---
scene("game", () => {
    setGravity(1600)

    // A simple level map
    const map = addLevel([
        "                        ",
        "      ?                 ",
        "                        ",
        "           $$           ",
        "========================",
    ], {
        tileWidth: 64,
        tileHeight: 64,
        tiles: {
            "=": () => [
                rect(64, 64), 
                color(100, 100, 200), 
                area(), 
                body({ isStatic: true }),
                "ground"
            ],
            "$": () => [
                circle(12), 
                color(255, 255, 0), 
                area(), 
                "coin"
            ],
        }
    })

    // Player
    const player = add([
        sprite("bean"),
        pos(100, 0),
        area(),
        body(),
    ])

    // Controls
    onKeyDown("left", () => player.move(-400, 0))
    onKeyDown("right", () => player.move(400, 0))
    onKeyPress("space", () => {
        if (player.isGrounded()) player.jump()
    })

    // Gameplay Logic
    player.onCollide("coin", (coin) => {
        destroy(coin)
        shake(2) // Tiny screen shake for "juice"
    })

    // Fall off map = Reset
    player.onUpdate(() => {
        if (player.pos.y > height()) go("title")
    })
})

// Start the game at the title screen
go("title")