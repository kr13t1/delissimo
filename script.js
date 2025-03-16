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
let timeLeft = 40; // Время игры увеличено до 40 секунд
let gameActive = false;
let timerInterval;
let aiMode = false;
let currentPlayer = "player1";

// Функция генерации случайного числа (делителя)
function getRandomDivisor() {
    return Math.floor(Math.random() * 8) + 2; // Числа от 2 до 10
}

// Функция генерации случайного числа от 1 до 100
function getRandomNumber() {
    return Math.floor(Math.random() * 99) + 1;
}

// Функция создания игрового поля
// Функция создания игрового поля
function createGrid() {
    grid.innerHTML = '';
    numbers = [];
    board = [];

    // Генерация делителей для игроков
    player1Divisor = getRandomDivisor();
    player2Divisor = getRandomDivisor();

    // Убедимся, что делители разные
    while (player1Divisor === player2Divisor) {
        player2Divisor = getRandomDivisor();
    }

    console.log(`Player 1 Divisor: ${player1Divisor}, Player 2 Divisor: ${player2Divisor}`);

    // Функция для вычисления суммы чисел, делящихся на определенный делитель
    function getSumDivisibleBy(divisor) {
        return numbers.reduce((sum, num) => num % divisor === 0 ? sum + num : sum, 0);
    }

    // Генерация чисел с проверкой на равенство сумм
    let attempts = 0;
    const maxAttempts = 1000; // Максимальное количество попыток

    while (attempts < maxAttempts) {
        numbers = [];
        for (let i = 0; i < 108; i++) {
            numbers.push(getRandomNumber());
        }

        // Вычисляем суммы для делителей игроков
        const sumPlayer1 = getSumDivisibleBy(player1Divisor);
        const sumPlayer2 = getSumDivisibleBy(player2Divisor);

        // Проверяем, что разница между суммами не превышает 20
        if (Math.abs(sumPlayer1 - sumPlayer2) <= 20) {
            break; // Условие выполнено, выходим из цикла
        }

        attempts++;
    }

    if (attempts >= maxAttempts) {
        console.warn("Не удалось достичь примерного равенства сумм за максимальное количество попыток.");
    }

    // Создание игрового поля
    for (let i = 0; i < 108; i++) {
        board.push(0); // 0 = не занято, 1 = занято игроком 1, 2 = занято игроком 2

        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = numbers[i];
        cell.dataset.index = i;

        // Обработчик клика по ячейке
        cell.addEventListener('click', () => handleCellClick(i));

        grid.appendChild(cell);
    }
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
            if (newDiv !== player1Divisor) {
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
    timeLeft = 40; // Время игры увеличено до 40 секунд
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
    timeLeft = 40;
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
