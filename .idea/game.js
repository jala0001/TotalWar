const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Spilleren
let players = [
    { x: canvas.width / 2 - 20, y: canvas.height - 50, width: 40, height: 40, bullets: [] }
];
let playerSpeed = 5;
let shootCooldown = 1000;
let canShoot = true;

// Variabler for bevægelse
let movingLeft = false;
let movingRight = false;

// Pindmænd/monstre array
let enemies = [];
let enemySpawnInterval = 2000;
let lastSpawnTime = 0;

// Game over flag
let gameOver = false;

// Tal på venstre og højre side
let leftNumber = null;
let rightNumber = null;
let numberObjects = [];
let numberSpawnInterval = 15000; // 15 sekunder
let lastNumberSpawnTime = 0;

// Håndtering af skud
function shoot(mouseX, mouseY) {
    if (canShoot) {
        players.forEach(player => {
            let dx = mouseX - (player.x + player.width / 2);
            let dy = mouseY - (player.y + player.height / 2);
            let distance = Math.sqrt(dx * dx + dy * dy);
            let bulletSpeed = 5;

            player.bullets.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                width: 10,
                height: 10,
                velX: (dx / distance) * bulletSpeed,
                velY: (dy / distance) * bulletSpeed
            });
        });

        canShoot = false;
        setTimeout(() => {
            canShoot = true;
        }, shootCooldown);
    }
}

// Tegn spillerne
function drawPlayers() {
    players.forEach(player => {
        ctx.fillStyle = "blue";
        ctx.fillRect(player.x, player.y, player.width, player.height);
    });
}

// Tegn skuddene
function drawBullets() {
    players.forEach(player => {
        player.bullets.forEach(bullet => {
            ctx.fillStyle = "black";  // Sort farve til skuddet
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    });
}

// Tegn pindmænd/monstre
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Tegn tal på venstre og højre side og bevæg dem lodret
function drawNumbers() {
    numberObjects.forEach(numberObject => {
        ctx.fillStyle = "green";
        ctx.font = "30px Arial";
        ctx.fillText(numberObject.value, numberObject.x, numberObject.y);
    });
}

// Opdater tal på venstre og højre side og bevæg dem
function updateNumbers() {
    if (Date.now() - lastNumberSpawnTime > numberSpawnInterval) {
        let leftValue = Math.floor(Math.random() * 11) - 5;
        let rightValue = Math.floor(Math.random() * 11) - 5;

        // Opret nummer-objekter for venstre og højre side
        numberObjects.push({
            value: leftValue,
            x: 50,
            y: 0,  // Start øverst på skærmen
            side: 'left'
        });

        numberObjects.push({
            value: rightValue,
            x: canvas.width - 100,
            y: 0,  // Start øverst på skærmen
            side: 'right'
        });

        lastNumberSpawnTime = Date.now();
    }

    // Opdater bevægelse for tal-objekterne
    numberObjects.forEach((numberObject, index) => {
        numberObject.y += 2;  // Få tallene til at bevæge sig nedad

        // Fjern tal, hvis de går ud af skærmen
        if (numberObject.y > canvas.height) {
            numberObjects.splice(index, 1);
        }
    });
}

// Tjek kollision med tal
function checkNumberCollision() {
    players.forEach((player, index) => {
        numberObjects.forEach((numberObject, numberIndex) => {
            if (
                numberObject.side === 'left' &&
                player.x < 100 &&
                player.y < numberObject.y + 20 &&
                player.y + player.height > numberObject.y - 20
            ) {
                modifyPlayerCount(numberObject.value);
                numberObjects.splice(numberIndex, 1);  // Fjern tallet efter kollision
            }

            if (
                numberObject.side === 'right' &&
                player.x + player.width > canvas.width - 100 &&
                player.y < numberObject.y + 20 &&
                player.y + player.height > numberObject.y - 20
            ) {
                modifyPlayerCount(numberObject.value);
                numberObjects.splice(numberIndex, 1);  // Fjern tallet efter kollision
            }
        });
    });
}

// Ændr antallet af blå firkanter baseret på tallet
function modifyPlayerCount(change) {
    let newCount = players.length + change;

    if (newCount <= 0) {
        gameOver = true;  // Hvis der ikke er nogen firkanter tilbage, er spillet slut
    } else if (change > 0) {
        // Tilføj flere spillere
        let currentCount = players.length;
        for (let i = 0; i < change; i++) {
            players.push({
                x: players[0].x + (currentCount + i) * 50,  // Placér dem forskudt
                y: players[0].y,
                width: 40,
                height: 40,
                bullets: []
            });
        }
    } else if (change < 0) {
        // Fjern spillere
        players = players.slice(0, newCount);  // Behold det antal spillere, der svarer til newCount
    }
}


// Opdater spillerens bevægelse
function updatePlayerMovement() {
    if (movingLeft && players[0].x > 0) {
        players.forEach(player => {
            player.x -= playerSpeed;
        });
    } else if (movingRight && players[0].x + players[0].width < canvas.width) {
        players.forEach(player => {
            player.x += playerSpeed;
        });
    }
}

// Opdater skud og fjern pindmænd, hvis de bliver ramt
function updateBullets() {
    players.forEach(player => {
        player.bullets.forEach((bullet, bulletIndex) => {
            bullet.x += bullet.velX;
            bullet.y += bullet.velY;

            // Fjern skud, hvis det forlader skærmen
            if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
                player.bullets.splice(bulletIndex, 1);
            }

            // Tjek om skud rammer pindmænd
            enemies.forEach((enemy, enemyIndex) => {
                if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                    player.bullets.splice(bulletIndex, 1);
                    enemies.splice(enemyIndex, 1);
                }
            });
        });
    });
}

// Tjek om spilleren bliver ramt af fjenden
function checkPlayerCollision() {
    players.forEach((player, playerIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                // Fjern den blå firkant, der bliver ramt
                players.splice(playerIndex, 1);
                enemies.splice(enemyIndex, 1);  // Fjern fjenden, der ramte spilleren

                // Tjek om der er flere blå firkanter tilbage
                if (players.length === 0) {
                    gameOver = true;  // Slut spillet, hvis der ikke er flere blå firkanter tilbage
                }
            }
        });
    });
}


// Spawn nye pindmænd/monstre
function spawnEnemies() {
    if (Date.now() - lastSpawnTime > enemySpawnInterval) {
        enemies.push({
            x: Math.random() * (canvas.width - 40),
            y: 0,
            width: 30,
            height: 30,
            speed: 1.5
        });
        lastSpawnTime = Date.now();
    }
}

// Opdater pindmænd for at jage spilleren
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        let dx = players[0].x - enemy.x;
        let dy = players[0].y - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let speedFactor = enemy.speed / distance;

        enemy.x += dx * speedFactor;
        enemy.y += dy * speedFactor;

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
}

// Tegn alt og opdater spillet
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("Game Over", canvas.width / 4, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayerMovement();
    drawPlayers();
    updateBullets();
    drawBullets();  // Tegn skuddene
    drawEnemies();
    updateEnemies();
    checkPlayerCollision();  // Tjek om spillerne bliver ramt
    updateNumbers();
    drawNumbers();
    checkNumberCollision();
    spawnEnemies();
    requestAnimationFrame(gameLoop);
}

// Event listener for bevægelse med "A" og "D"
document.addEventListener("keydown", function(event) {
    if (event.code === "KeyA") {
        movingLeft = true;
    } else if (event.code === "KeyD") {
        movingRight = true;
    }
});

document.addEventListener("keyup", function(event) {
    if (event.code === "KeyA") {
        movingLeft = false;
    } else if (event.code === "KeyD") {
        movingRight = false;
    }
});

// Event listener for musen til at skyde
canvas.addEventListener("click", function(event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    shoot(mouseX, mouseY);
});

// Start spillet
gameLoop();
