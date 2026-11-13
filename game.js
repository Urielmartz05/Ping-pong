const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dialog = document.getElementById('my-dialog');
const form = document.getElementById('data-form');

const startBtn = document.getElementById('start-game');
const userName = document.getElementById('username');
const level = document.querySelectorAll('.level-btn');
const scoreList = document.getElementById('score-list');

let selectedLevel = 0;
let bestScores = [];

// Mostrar ventana modal
dialog.showModal();

// Dificultad del juego (Velocidad)
level.forEach((btn) => {

    btn.addEventListener('click', (e) => {

        selectedLevel = Number(e.currentTarget.dataset.level);
        ball.speedX = 5 * selectedLevel;
        ball.speedY = 5 * selectedLevel;
        console.log(selectedLevel);

    })
});

// Iniciar juego
startBtn.addEventListener('click', () => {
    const nameValue = form.elements['user'].value;

    if (nameValue.trim() === "" || selectedLevel === 0) {
        alert('Ingresa el nombre del jugador y selecciona un nivel');
    }else{
        userName.textContent = 'Nombre: ' + nameValue;
        dialog.close();
        gameLoop();
    }

});

// Almacenar score y ordenarlo por puntaje
function scoreStore(score) {
    const date = new Date().toLocaleDateString();
   
    const exists = bestScores.some((item) => item.score === score && item.date === date);
    if (score > 0 && !exists) {
        bestScores.push({ score, date });
        bestScores.sort((a, b) => b.score - a.score);
        bestScores = bestScores.slice(0, 3);
    }

    scoreList.innerHTML = '';
    bestScores.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.score} puntos - ${item.date}`;
        scoreList.appendChild(li);
    });

    return bestScores;
}

// Estado del juego
const paddle = {
    x: 30,
    y: 175,
    width: 20,
    height: 100,
    speed: 10,
    dy: 0
};

const ball = {
    x: 400,
    y: 225,
    radius: 10,
    speedX: 5,
    speedY: 5
}

let score = 0;
// Captura de eventos del teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        paddle.dy = -paddle.speed;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S'){
        paddle.dy = paddle.speed;
    }
});

document.addEventListener('keyup', (e) => {
    if (
        e.key === 'ArrowUp' || e.key === "ArrowDown" || 
        e.key === 'w' || e.key === 's' || e.key === 'W' || e.key === 'S'
    ) {
        paddle.dy = 0;
    }
});

// Lógica de físicas y colisiones
function update() {
    // 1. Movimiento de la paleta
    paddle.y += paddle.dy;

    // Limitar la paleta para que no salga del Canvas
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + paddle.height > canvas.height) paddle.y = canvas.height - paddle.height;

    // 2. Movimiento de la pelota
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Rebote superior e inferior
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.speedY *= -1;
    }

    // Rebote en la pared derecha (simulando el modo práctica)
    if (ball.x + ball.radius > canvas.width) {
        ball.speedX *= -1;
    }

    // 3. Colisión de la pelota con la paleta
    if (
        ball.x - ball.radius < paddle.x + paddle.width && 
        ball.x + ball.radius > paddle.x && 
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height
    ) {
        ball.speedX *= -1;
        // Aumentar ligeramente la velocidad para dar progresión al juego
        ball.speedX += (ball.speedX > 0) ? 0.2 : -0.2;
        ball.x = paddle.x + paddle.width + ball.radius; // Evitar que la pelota se "atasque"
        score += 5;
    }

    // 4. Reinicio si la pelota sale por la izquierda
    if (ball.x < 0) {
        scoreStore(score);
        resetGame();
    }
}

// Función para reiniciar el estado
function resetGame() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = 5 * selectedLevel;
    ball.speedY = 5 * selectedLevel;
    score = 0;
}

// Dibujo de los elementos en el Canvas
function draw(){
    // Limpiar el fotograma anterior
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar pared derecha (visual)
    ctx.fillStyle = '#555';
    ctx.fillRect(canvas.width - 10, 0, 10, canvas.height);

    // Dibujar paleta
    ctx.fillStyle = '#00eaff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Dibujar pelota
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

    // Dibujar marcador
    ctx.font = '30px Arial';
    ctx.fillText('Puntos: ' + score, canvas.width / 2 - 60, 40);
}

// Bucle de animación principal
function gameLoop(){
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

