// Элементы страницы
const grid = document.getElementById('grid');
const player1ScoreDisplay = document.getElementById('player-1-score');
const player2ScoreDisplay = document.getElementById('player-2-score');
const player1DivisorDisplay = document.getElementById('player-1-divisor');
const player2DivisorDisplay = document.getElementById('player-2-divisor');
const timerDisplay = document.getElementById('timer');
const modeSelect = document.getElementById('mode-select');
const gameContainer = document.getElementById('game-container');
const rulesDiv = document.getElementById('rules');
const twoPlayerButton = document.getElementById('two-player-mode');
const aiButton = document.getElementById('ai-mode');
const settingsIcon = document.getElementById('settings-icon');
const rulesModal = document.getElementById('rulesModal');
const closeBtn = document.querySelector(".close");
const gameMessage = document.getElementById('game-message');
const backButton = document.getElementById('back-button');
const reloadIcon = document.getElementById('reload-icon');

// Параметры игры
let numbers = [];
let board = [];
let player1Score = 0;
let player2Score = 0;
let player1Divisor = 0;
let player2Divisor = 0;
let timeLeft = 30; // Время игры увеличено до 30 секунд
let gameActive = false;
let timerInterval;
let aiMode = false;
let currentPlayer = "player1";

// Допустимые делители
const allowedDivisors = [3, 4, 5, 7];

// Функция генерации случайного делителя
function getRandomDivisor() {
    return allowedDivisors[Math.floor(Math.random() * allowedDivisors.length)];
}

// Функция генерации случайного числа от 50 до 99
function getRandomNumber() {
    return Math.floor(Math.random() * 50) + 50;
}

// Функция создания игрового поля с балансировкой по сумме чисел
function createGrid() {
    let player1Sum, player2Sum;
    let attempts = 0; // Счетчик попыток для избежания бесконечного цикла

    do {
        grid.innerHTML = '';
        numbers = [];
        board = [];
        player1Sum = 0;
        player2Sum = 0;

        // Генерация чисел для поля
        for (let i = 0; i < 108; i++) { // 9x12 = 108 ячеек
            const randomNumber = getRandomNumber();
            numbers.push(randomNumber);
            board.push(0); // 0 = не занято, 1 = занято игроком 1, 2 = занято игроком 2

            // Обновляем суммы для контроля баланса
            if (randomNumber % player1Divisor === 0) {
                player1Sum += randomNumber;
            }
            if (randomNumber % player2Divisor === 0) {
                player2Sum += randomNumber;
            }

            // Создаем ячейку
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = randomNumber;
            cell.dataset.index = i;

            // Обработчик клика по ячейке
            cell.addEventListener('click', () => handleCellClick(i));

            grid.appendChild(cell);
        }

        attempts++;
        if (attempts > 300) {
            console.warn("Не удалось сбалансировать поле после 300 попыток. Разница:", Math.abs(player1Sum - player2Sum));
            break; // Прерываем цикл, чтобы избежать бесконечного зацикливания
        }

    } while (Math.abs(player1Sum - player2Sum) > 70); // Повторяем, пока разница не станет <= 70

    console.log(`Сумма для делителя ${player1Divisor}: ${player1Sum}`);
    console.log(`Сумма для делителя ${player2Divisor}: ${player2Sum}`);
}

// Функция обработки клика по ячейке
function handleCellClick(index) {
    if (!gameActive) return;
    const cellValue = numbers[index];
    let cell = document.querySelector(`[data-index="${index}"]`);

    // Two Player Mode
    if (!aiMode) {
        if (currentPlayer === "player1" && cellValue % player1Divisor === 0 && board[index] === 0) {
            board[index] = 1;
            cell.classList.add('taken-1');
            player1Score += cellValue;
            player1ScoreDisplay.textContent = player1Score;
            switchPlayerTurn();
        } else if (currentPlayer === "player2" && cellValue % player2Divisor === 0 && board[index] === 0) {
            board[index] = 2;
            cell.classList.add('taken-2');
            player2Score += cellValue;
            player2ScoreDisplay.textContent = player2Score;
            switchPlayerTurn();
        }
    } else if (aiMode) {
        if (cellValue % player1Divisor === 0 && board[index] === 0) {
            board[index] = 1;
            cell.classList.add('taken-1');
            player1Score += cellValue;
            player1ScoreDisplay.textContent = player1Score;
        }
    }
}

// ИИ
function aiMove() {
    if (!gameActive) return;
    const available = board.reduce((acc, cell, index) => (cell === 0 ? [...acc, index] : acc), []);
    const aiChoices = available
        .map((index) => (numbers[index] % player2Divisor === 0 ? { cell: index, value: numbers[index] } : null))
        .filter((choice) => choice !== null)
        .sort((a, b) => b.value - a.value);

    if (aiChoices.length > 0) {
        const bestChoice = aiChoices[0].cell;
        board[bestChoice] = 2;
        const cellValue = numbers[bestChoice];
        player2Score += cellValue;
        player2ScoreDisplay.textContent = player2Score;
        const cell = document.querySelector(`[data-index="${bestChoice}"]`);
        cell.classList.add('taken-2');
    }
}

// Функция смены хода игрока
function switchPlayerTurn() {
    currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
}

// Функция начала игры
function startGame(mode) {
    aiMode = (mode === 'ai');

 // Генерируем делители для каждого игрока
player1Divisor = getRandomDivisor();
player2Divisor = getRandomDivisor();

if (aiMode) {
    while (true) {
        let newDiv = getRandomDivisor();
        // Проверяем, чтобы не было одновременно делителей 3 и 7
        if ((newDiv !== player1Divisor) && 
            !(newDiv === 3 && player1Divisor === 7) && 
            !(newDiv === 7 && player1Divisor === 3)) {
            player2Divisor = newDiv;
            break;
        }
    }
}

    player1DivisorDisplay.textContent = player1Divisor;
    player2DivisorDisplay.textContent = player2Divisor;

    rulesDiv.style.display = 'none';
    modeSelect.style.display = 'none';
    gameContainer.style.display = 'flex';
    settingsIcon.style.display = 'block';

    player1Score = 0;
    player2Score = 0;
    timeLeft = 30; // Время игры увеличено до 30 секунд
    gameActive = true;

    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;
    timerDisplay.textContent = timeLeft;

    createGrid();
    startTimer();
}

// Функция запуска таймера
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (gameActive && aiMode && timeLeft > 0) {
            aiMove();
        }

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Функция завершения игры
function endGame() {
    clearInterval(timerInterval);
    gameActive = false;

    let message = '';
    if (player1Score > player2Score) {
        message = 'Победил игрок 1!';
    } else if (player2Score > player1Score) {
        message = 'Победил игрок 2!';
    } else {
        message = 'Ничья!';
    }

    displayGameMessage(message);
    setTimeout(resetGame, 3000);
}

// Функция отображения сообщения о результате игры
function displayGameMessage(message) {
    gameMessage.textContent = message;
    gameMessage.style.display = 'block';
}

// Функция сброса игры
function resetGame() {
    gameContainer.style.display = 'none';
    settingsIcon.style.display = 'none';
    rulesDiv.style.display = 'block';
    modeSelect.style.display = 'flex';
    gameMessage.style.display = 'none';
    rulesModal.style.display = "none";

    numbers = [];
    board = [];
    player1Score = 0;
    player2Score = 0;
    player1Divisor = 0;
    player2Divisor = 0;
    timeLeft = 30;
    gameActive = false;
    aiMode = false;
    currentPlayer = "player1";
}

// Обработчики событий
twoPlayerButton.addEventListener('click', () => startGame('two-player'));
aiButton.addEventListener('click', () => startGame('ai'));

settingsIcon.addEventListener('click', () => {
    rulesModal.style.display = "block";
});

// Обработчик события для значка перезагрузки
reloadIcon.addEventListener('click', () => {
    resetGame(); // Сбрасываем игру
    modeSelect.style.display = 'flex'; // Показываем выбор режима
    gameContainer.style.display = 'none'; // Скрываем игровое поле
    rulesDiv.style.display = 'block'; // Показываем правила
    settingsIcon.style.display = 'none'; // Скрываем иконку настроек
});

closeBtn.addEventListener('click', () => {
    rulesModal.style.display = "none";
});

window.addEventListener('click', (event) => {
    if (event.target == rulesModal) {
        rulesModal.style.display = "none";
    }
});

backButton.addEventListener('click', () => {
    window.history.back();
});
