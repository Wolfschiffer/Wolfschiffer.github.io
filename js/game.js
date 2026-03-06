// Game data collections
const gameData = {
    numbers: [
        { value: 1, word: 'one' },
        { value: 2, word: 'two' },
        { value: 3, word: 'three' },
        { value: 4, word: 'four' },
        { value: 5, word: 'five' },
        { value: 6, word: 'six' },
        { value: 7, word: 'seven' },
        { value: 8, word: 'eight' },
        { value: 9, word: 'nine' },
        { value: 10, word: 'ten' }
    ],
    
    numbers11_20: [
        { value: 11, word: 'eleven' },
        { value: 12, word: 'twelve' },
        { value: 13, word: 'thirteen' },
        { value: 14, word: 'fourteen' },
        { value: 15, word: 'fifteen' },
        { value: 16, word: 'sixteen' },
        { value: 17, word: 'seventeen' },
        { value: 18, word: 'eighteen' },
        { value: 19, word: 'nineteen' },
        { value: 20, word: 'twenty' }
    ],
    
    tens: [
        { value: 10, word: 'ten' },
        { value: 20, word: 'twenty' },
        { value: 30, word: 'thirty' },
        { value: 40, word: 'forty' },
        { value: 50, word: 'fifty' },
        { value: 60, word: 'sixty' },
        { value: 70, word: 'seventy' },
        { value: 80, word: 'eighty' },
        { value: 90, word: 'ninety' },
        { value: 100, word: 'one hundred' }
    ],
    
    hundreds: [
        { value: 100, word: 'one hundred' },
        { value: 200, word: 'two hundred' },
        { value: 300, word: 'three hundred' },
        { value: 400, word: 'four hundred' },
        { value: 500, word: 'five hundred' },
        { value: 600, word: 'six hundred' },
        { value: 700, word: 'seven hundred' },
        { value: 800, word: 'eight hundred' },
        { value: 900, word: 'nine hundred' },
        { value: 1000, word: 'one thousand' }
    ]
};

// Sound effects
const soundEffects = {
    correct: 'sfx/CorrectAnswer.mp3',
    wrong: 'sfx/IncorrectAnswer.mp3',
    win: 'sfx/Win.mp3',
    gameOver: 'sfx/GameOver.mp3'
};

// Game state
let currentGame = 'numbers';
let currentNumbers = [];
let currentNumber = null;
let score = 0;
let highScores = {
    numbers: localStorage.getItem('highScore_numbers') ? parseInt(localStorage.getItem('highScore_numbers')) : 0,
    numbers11_20: localStorage.getItem('highScore_numbers11_20') ? parseInt(localStorage.getItem('highScore_numbers11_20')) : 0,
    tens: localStorage.getItem('highScore_tens') ? parseInt(localStorage.getItem('highScore_tens')) : 0,
    hundreds: localStorage.getItem('highScore_hundreds') ? parseInt(localStorage.getItem('highScore_hundreds')) : 0
};
let lives = 3;
let streak = 0;
let multiplier = 1;
let answered = false;
let availableNumbers = [];
let audioPlayer = null;
let isAudioMuted = false;
let gameActive = false;
let gameEnded = false;

// Eagle position and jump physics
let eagleX = 250;
let eagleY = 200;
let eagleTargetX = 250;
let isJumping = false;
let jumpProgress = 0;
let eagleDirection = -1;

// Animation state
let currentAnimation = 'idle';
let animationFrame = 0;
let frameCounter = 0;
let isAnimating = false;

// Animation speeds
const FRAME_DELAY = 8;
const JUMP_SPEED = 0.008;

// Timer
let startTime = null;
let endTime = null;
let timerInterval = null;
let currentTime = 0;

// DOM Elements
const menuContainer = document.getElementById('menu-container');
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('stickman-canvas');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('wordDisplay');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const multiplierDisplay = document.getElementById('multiplier');
const timerDisplay = document.getElementById('timer');
const livesDisplay = document.getElementById('lives');
const platforms = document.querySelectorAll('#game-platforms .platform');
const speakerToggle = document.getElementById('speaker-toggle');
const menuButton = document.getElementById('menu-button');
const gameSubtitle = document.getElementById('game-subtitle');
const startButton = document.getElementById('start-game-btn');
const instructions = document.getElementById('main-instructions');
const gameStats = document.getElementById('game-stats');

// Platform positions
const platformPositions = [100, 250, 400];

// Images
let eagleImages = {
    idle: null,
    flap: [],
    celebrate: [],
    wrong: []
};

// Menu eagle
let menuEagleImage = null;

// Track loaded frames
let loadedFrames = 0;
let totalWrongFrames = 19;
let totalFlapFrames = 18;
let totalCelebrateFrames = 11;

// Load all images
function loadImages() {
    console.log('Loading images...');
    
    // Idle
    eagleImages.idle = new Image();
    eagleImages.idle.src = 'images/eagle_idle_01.png';
    
    // Menu eagle
    menuEagleImage = new Image();
    menuEagleImage.src = 'images/eagle_idle_01.png';
    menuEagleImage.onload = () => {
        const menuEagle = document.querySelector('.eagle-menu-icon');
        if (menuEagle) {
            menuEagle.innerHTML = '';
            const img = document.createElement('img');
            img.src = menuEagleImage.src;
            img.style.width = '144px';
            img.style.height = '120px';
            img.style.objectFit = 'contain';
            menuEagle.appendChild(img);
        }
    };
    
    // Flap frames (18)
    for (let i = 1; i <= 18; i++) {
        const img = new Image();
        const num = i.toString().padStart(2, '0');
        img.src = `images/flap_${num}.png`;
        
        img.onload = () => {
            loadedFrames++;
            console.log(`✅ Loaded flap frame ${num} (${loadedFrames}/18)`);
        };
        
        img.onerror = () => {
            console.log(`❌ Missing flap frame ${num}`);
        };
        
        eagleImages.flap.push(img);
    }
    
    // Celebrate frames (11)
    for (let i = 1; i <= 11; i++) {
        const img = new Image();
        const num = i.toString().padStart(2, '0');
        img.src = `images/eagle_center_${num}.png`;
        
        img.onload = () => {
            console.log(`✅ Loaded center frame ${num}`);
        };
        
        img.onerror = () => {
            console.log(`❌ Missing center frame ${num}`);
        };
        
        eagleImages.celebrate.push(img);
    }
    
    // Wrong frames (19)
    for (let i = 1; i <= 19; i++) {
        const img = new Image();
        const num = i.toString().padStart(2, '0');
        img.src = `images/eagle_wrong_${num}.png`;
        
        img.onload = () => {
            loadedFrames++;
            console.log(`✅ Loaded wrong frame ${num} (${loadedFrames}/${totalWrongFrames})`);
        };
        
        img.onerror = () => {
            console.log(`❌ Missing wrong frame ${num}`);
        };
        
        eagleImages.wrong.push(img);
    }
    
    eagleImages.idle.onload = () => console.log('✅ Loaded idle image');
}

// Initialize
function initGame() {
    console.log('Game starting...');
    
    canvas.width = 500;
    canvas.height = 250;
    
    loadImages();
    
    audioPlayer = new Audio();
    
    // Event listeners with mobile touch support
    if (menuButton) {
        menuButton.addEventListener('click', showMenu);
        menuButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            showMenu();
        });
    }
    
    if (speakerToggle) {
        speakerToggle.addEventListener('click', toggleAudio);
        speakerToggle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            toggleAudio();
        });
    }
    
    if (startButton) {
        startButton.addEventListener('click', startGame);
        startButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startGame();
        });
    }
    
    platforms.forEach(p => {
        p.addEventListener('click', handlePlatformClick);
        p.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handlePlatformClick(e);
        });
    });
    
    animate();
}

// Animation loop
function animate() {
    updateEagle();
    drawEagle();
    requestAnimationFrame(animate);
}

// Update eagle position and animation
function updateEagle() {
    if (isJumping) {
        jumpProgress += JUMP_SPEED;
        
        if (jumpProgress >= 1) {
            eagleX = eagleTargetX;
            eagleY = 200;
            isJumping = false;
            jumpProgress = 0;
            startAnimation('celebrate');
        } else {
            eagleX = eagleX + (eagleTargetX - eagleX) * 0.1;
            eagleY = 200 - 35 * Math.sin(jumpProgress * Math.PI);
            
            if (currentAnimation !== 'flap') {
                startAnimation('flap');
            }
        }
    }
    
    if (isAnimating) {
        frameCounter++;
        if (frameCounter >= FRAME_DELAY) {
            frameCounter = 0;
            animationFrame++;
            
            if (currentAnimation === 'flap') {
                if (animationFrame >= eagleImages.flap.length) {
                    animationFrame = 0;
                }
            } else if (currentAnimation === 'celebrate') {
                if (animationFrame >= eagleImages.celebrate.length) {
                    stopAnimation();
                    if (!isJumping && gameActive && answered) {
                        nextRound();
                    }
                }
            } else if (currentAnimation === 'wrong') {
                if (animationFrame >= eagleImages.wrong.length) {
                    stopAnimation();
                }
            }
        }
    }
}

// Start an animation
function startAnimation(type) {
    currentAnimation = type;
    animationFrame = 0;
    frameCounter = 0;
    isAnimating = true;
}

// Stop animation and return to idle
function stopAnimation() {
    currentAnimation = 'idle';
    animationFrame = 0;
    isAnimating = false;
}

// Draw eagle - MAIS LARGA EM TODAS AS ANIMAÇÕES
function drawEagle() {
    ctx.clearRect(0, 0, 500, 200);
    
    let img = eagleImages.idle;
    
    if (currentAnimation === 'flap' && animationFrame < eagleImages.flap.length) {
        let flapImg = eagleImages.flap[animationFrame];
        if (flapImg && flapImg.complete && flapImg.naturalHeight > 0) {
            img = flapImg;
        }
    } else if (currentAnimation === 'celebrate' && animationFrame < eagleImages.celebrate.length) {
        let celebrateImg = eagleImages.celebrate[animationFrame];
        if (celebrateImg && celebrateImg.complete && celebrateImg.naturalHeight > 0) {
            img = celebrateImg;
        }
    } else if (currentAnimation === 'wrong' && animationFrame < eagleImages.wrong.length) {
        let wrongImg = eagleImages.wrong[animationFrame];
        if (wrongImg && wrongImg.complete && wrongImg.naturalHeight > 0) {
            img = wrongImg;
        }
    }
    
    if (img && img.complete && img.naturalHeight > 0) {
        ctx.save();
        ctx.translate(eagleX, eagleY);
        
        // Flip se necessário (para direção)
        if (eagleDirection === 1) {
            ctx.scale(-1, 1);
        }
        
        // 🟢 AUMENTA TODAS AS ANIMAÇÕES NO EIXO X (20% mais larga)
        ctx.scale(1.2, 1);
        
        // Tamanhos base
        let width = 150;
        let height = 150;
        
        // Flap continua 10% maior no total (além dos 20% de largura)
        if (currentAnimation === 'flap') {
            width = 165;
            height = 165;
        }
        
        ctx.drawImage(img, -width/2, -height, width, height);
        ctx.restore();
    }
}

function jumpToPlatform(index) {
    eagleTargetX = platformPositions[index];
    isJumping = true;
    jumpProgress = 0;
    
    if (eagleTargetX > eagleX) {
        eagleDirection = 1;
    } else if (eagleTargetX < eagleX) {
        eagleDirection = -1;
    }
}

function resetEagle() {
    eagleX = 250;
    eagleY = 200;
    isJumping = false;
    jumpProgress = 0;
    currentAnimation = 'idle';
    animationFrame = 0;
    frameCounter = 0;
    isAnimating = false;
    eagleDirection = -1;
}

function handlePlatformClick(event) {
    const button = event.currentTarget;
    const index = parseInt(button.dataset.index);
    
    if (!gameActive || answered || !currentNumber) return;
    
    const selected = parseInt(button.dataset.value);
    
    if (selected === currentNumber.value) {
        button.classList.add('correct');
        
        streak++;
        multiplier = Math.min(streak, 5);
        
        let points = 50 * multiplier;
        score += points;
        
        updateScore();
        updateMultiplier();
        updateHighScore();
        playSound('correct');
        
        answered = true;
        platforms.forEach(p => p.disabled = true);
        
        if (platformPositions[index] === eagleX) {
            startAnimation('celebrate');
        } else {
            jumpToPlatform(index);
        }
        
    } else {
        button.classList.add('wrong');
        
        streak = 0;
        multiplier = 1;
        updateMultiplier();
        
        playSound('wrong');
        
        startAnimation('wrong');
        
        loseLife();
        
        setTimeout(() => button.classList.remove('wrong'), 300);
    }
}

// Timer functions
function startTimer() {
    startTime = Date.now();
    currentTime = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        if (gameActive) {
            currentTime = Math.floor((Date.now() - startTime) / 1000);
            updateTimerDisplay();
        }
    }, 100);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    endTime = currentTime;
}

function updateTimerDisplay() {
    if (timerDisplay) {
        const mins = Math.floor(currentTime / 60);
        const secs = currentTime % 60;
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

function calculateSpeedBonus() {
    if (endTime <= 0) return 1;
    let bonus = 5 * (15 / endTime);
    return Math.min(5, Math.max(1, Math.round(bonus * 100) / 100));
}

function getTimeBonusTitle(bonus) {
    if (bonus >= 4.5) return "🏆 WORLD RECORD!";
    if (bonus >= 3.5) return "⚡ AMAZING!";
    if (bonus >= 2.5) return "🔥 GREAT!";
    if (bonus >= 1.8) return "✨ GOOD!";
    if (bonus >= 1.3) return "👍 DECENT!";
    return "👌 OKAY!";
}

function showWinWithBonus() {
    const bonus = calculateSpeedBonus();
    const bonusPoints = Math.round(score * (bonus - 1));
    const total = score + bonusPoints;
    const title = getTimeBonusTitle(bonus);
    
    const winScreen = document.createElement('div');
    winScreen.className = 'win-screen';
    winScreen.innerHTML = `
        <h2>🎉 YOU WIN! 🎉</h2>
        <div class="win-stats">
            <p class="time-title">${title}</p>
            <p>⏱️ Time: ${timerDisplay.textContent}</p>
            <p>💰 Base: ${score}</p>
            <p>⚡ Bonus: ${bonus}x</p>
            <p class="bonus-points">✨ +${bonusPoints}</p>
            <p class="total-score">🏆 TOTAL: ${total}</p>
        </div>
        <button class="restart-btn">PLAY AGAIN</button>
    `;
    
    if (total > highScores[currentGame]) {
        highScores[currentGame] = total;
        localStorage.setItem(`highScore_${currentGame}`, total);
        highScoreDisplay.textContent = total;
    }
    
    gameContainer.appendChild(winScreen);
    winScreen.querySelector('.restart-btn').addEventListener('click', () => {
        winScreen.remove();
        removeRestartButton();
        showMenu();
    });
}

function showMenu() {
    gameActive = false;
    stopTimer();
    removeWinScreen();
    removeRestartButton();
    resetEagle();
    
    platforms.forEach(p => {
        p.textContent = '?';
        p.disabled = true;
        p.classList.remove('correct', 'wrong');
    });
    
    if (wordDisplay) wordDisplay.textContent = 'Ready?';
    if (instructions) instructions.textContent = '👆 Click START to begin';
    if (gameStats) gameStats.style.display = 'none';
    if (startButton) {
        startButton.style.display = 'block';
        startButton.disabled = false;
    }
    
    gameContainer.classList.remove('game-active');
    menuContainer.style.display = 'block';
    gameContainer.style.display = 'none';
}

window.selectGame = function(gameType) {
    currentGame = gameType;
    
    const names = {
        'numbers': 'numbers 1-10',
        'numbers11-20': 'numbers 11-20',
        'tens': 'tens',
        'hundreds': 'hundreds'
    };
    gameSubtitle.textContent = names[gameType] || 'numbers';
    
    // CORREÇÃO: Mapeamento correto entre gameType e gameData
    if (gameType === 'numbers') {
        currentNumbers = gameData.numbers;
    } else if (gameType === 'numbers11-20') {
        currentNumbers = gameData.numbers11_20;  // ← Hífen no onclick, underscore no objeto
    } else if (gameType === 'tens') {
        currentNumbers = gameData.tens;
    } else if (gameType === 'hundreds') {
        currentNumbers = gameData.hundreds;
    }
    
    highScoreDisplay.textContent = highScores[gameType] || 0;
    
    gameActive = false;
    stopTimer();
    removeWinScreen();
    removeRestartButton();
    resetEagle();
    
    platforms.forEach(p => {
        p.textContent = '?';
        p.disabled = true;
        p.classList.remove('correct', 'wrong');
    });
    
    wordDisplay.textContent = 'Ready?';
    instructions.textContent = '👆 Click START to begin';
    gameStats.style.display = 'none';
    startButton.style.display = 'block';
    startButton.disabled = false;
    gameContainer.classList.remove('game-active');
    
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'block';
};


function startGame() {
    gameActive = true;
    gameContainer.classList.add('game-active');
    
    startButton.style.display = 'none';
    gameStats.style.display = 'flex';
    instructions.textContent = '👆 Click the number';
    
    resetGame();
    startTimer();
}

function resetGame() {
    availableNumbers = [...currentNumbers];
    score = 0;
    lives = 3;
    streak = 0;
    multiplier = 1;
    gameEnded = false;
    answered = false;
    
    updateScore();
    updateMultiplier();
    updateLives();
    
    removeRestartButton();
    removeWinScreen();
    resetEagle();
    
    nextRound();
}

function removeRestartButton() {
    const btn = document.querySelector('.restart-btn');
    if (btn) btn.remove();
}

function removeWinScreen() {
    const screen = document.querySelector('.win-screen');
    if (screen) screen.remove();
}

function addRestartButton() {
    removeRestartButton();
    removeWinScreen();
    
    const btn = document.createElement('button');
    btn.className = 'restart-btn';
    btn.textContent = 'PLAY AGAIN';
    btn.addEventListener('click', () => {
        btn.remove();
        showMenu();
    });
    
    gameContainer.appendChild(btn);
}

function toggleAudio() {
    isAudioMuted = !isAudioMuted;
    if (speakerToggle) {
        speakerToggle.textContent = isAudioMuted ? '🔇' : '🔊';
        speakerToggle.classList.toggle('muted', isAudioMuted);
    }
}

function playSound(type) {
    if (isAudioMuted) return;
    new Audio(soundEffects[type]).play().catch(() => {});
}

function playAudio() {
    if (!currentNumber || isAudioMuted || !gameActive) return;
    
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
    
    audioPlayer.src = `audio/${currentNumber.word}.mp3`;
    audioPlayer.play().catch(() => {
        if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(currentNumber.word);
            utter.lang = 'en-US';
            window.speechSynthesis.speak(utter);
        }
    });
}

function updateMultiplier() {
    if (multiplierDisplay) {
        multiplierDisplay.textContent = `${multiplier}x`;
        multiplierDisplay.style.color = multiplier > 1 ? '#c9a13b' : '#5a6d7e';
    }
}

function updateHighScore() {
    if (score > highScores[currentGame]) {
        highScores[currentGame] = score;
        localStorage.setItem(`highScore_${currentGame}`, score);
        highScoreDisplay.textContent = score;
    }
}

function gameOver() {
    if (gameEnded) return;
    
    gameActive = false;
    gameEnded = true;
    stopTimer();
    playSound('gameOver');
    
    platforms.forEach(p => p.disabled = true);
    
    setTimeout(() => {
        wordDisplay.textContent = 'GAME OVER';
        addRestartButton();
    }, 1000);
}

function winGame() {
    if (gameEnded) return;
    
    gameActive = false;
    gameEnded = true;
    stopTimer();
    playSound('win');
    
    platforms.forEach(p => p.disabled = true);
    showWinWithBonus();
}

function loseLife() {
    if (lives > 0) {
        lives--;
        updateLives();
        if (lives === 0) gameOver();
    }
}

function updateLives() {
    if (!livesDisplay) return;
    
    livesDisplay.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const circle = document.createElement('span');
        circle.className = `life-circle ${i < lives ? 'full' : 'empty'}`;
        livesDisplay.appendChild(circle);
    }
}

function nextRound() {
    if (!gameActive) return;
    
    if (availableNumbers.length === 0) {
        winGame();
        return;
    }
    
    const rand = Math.floor(Math.random() * availableNumbers.length);
    currentNumber = availableNumbers[rand];
    availableNumbers.splice(rand, 1);
    
    wordDisplay.textContent = currentNumber.word;
    setupPlatforms();
    
    answered = false;
    
    currentAnimation = 'idle';
    animationFrame = 0;
    isAnimating = false;
    
    platforms.forEach(p => {
        p.classList.remove('correct', 'wrong');
        p.disabled = false;
    });
    
    setTimeout(playAudio, 100);
}

function setupPlatforms() {
    const options = [currentNumber.value];
    const values = currentNumbers.map(n => n.value);
    
    while (options.length < 3) {
        const val = values[Math.floor(Math.random() * values.length)];
        if (!options.includes(val)) options.push(val);
    }
    
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    platforms.forEach((p, i) => {
        p.textContent = options[i];
        p.dataset.value = options[i];
    });
}

function updateScore() {
    if (scoreDisplay) scoreDisplay.textContent = score;
}

// Start
window.addEventListener('load', initGame);