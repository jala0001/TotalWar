const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Spilleren
let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    bullets: [],
    speed: 5,
    shootCooldown: 100,  // 1 skud i sekundet
    canShoot: true
};

// Pindmænd/monstre array
let enemies = [];
let enemySpawnInterval = 2000;
let lastSpawnTime = 0;

// Game over flag
let gameOver = false;

// Håndtering af skud
function shoot(mouseX, mouseY) {
    if (player.canShoot) {
        // Beregn retningen mod musens position
        let dx = mouseX - (player.x + player.width / 2);
        let dy = mouseY - (player.y + player.height / 2);
        let distance = Math.sqrt(dx * dx + dy * dy);
        let bulletSpeed = 5;  // Skuddets hastighed

        // Opret et nyt skud med hastighed i retning mod musen
        player.bullets.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            width: 10,
            height: 10,
            velX: (dx / distance) * bulletSpeed,
            velY: (dy / distance) * bulletSpeed
        });

        player.canShoot = false;
        setTimeout(() => {
            player.canShoot = true;
        }, player.shootCooldown);
    }
}

// Tegn spilleren
function drawPlayer() {
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Tegn pindmænd/monstre
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Tjek kollision mellem spiller og pindmænd
function checkCollision() {
    enemies.forEach((enemy) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            gameOver = true;  // Spillet stopper hvis der er kollision
        }
    });
}

// Opdater skud og fjern pindmænd, hvis de bliver ramt
function updateBullets() {
    player.bullets.forEach((bullet, bulletIndex) => {
        // Bevæg skuddet mod musens retning
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

    player.bullets.forEach(bullet => {
        ctx.fillStyle = "black";
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
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
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let speedFactor = enemy.speed / distance;

        enemy.x += dx * speedFactor;
        enemy.y += dy * speedFactor;

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
}

// Spilleren bevæger sig
function movePlayer(direction) {
    if (direction === "left" && player.x > 0) {
        player.x -= player.speed;
    } else if (direction === "right" && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
}

// Tegn alt og opdater spillet
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("Game Over", canvas.width / 4, canvas.height / 2);
        return; // Stop spillet
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    updateBullets();
    drawEnemies();
    updateEnemies();
    checkCollision();
    spawnEnemies();
    requestAnimationFrame(gameLoop);
}

// Event listener for musen til at skyde
canvas.addEventListener("click", function(event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    shoot(mouseX, mouseY);  // Skyd mod musens position
});

// Event listener for piletaster til at bevæge spilleren
document.addEventListener("keydown", function(event) {
    if (event.code === "ArrowLeft") {
        movePlayer("left");
    } else if (event.code === "ArrowRight") {
        movePlayer("right");
    }
});

// Start spillet
gameLoop();
