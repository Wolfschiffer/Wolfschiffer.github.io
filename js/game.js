// Game data with local audio files - use relative paths
const numbers = [
    { value: 1, word: 'one', audio: 'audio/one.mp3' },
    { value: 2, word: 'two', audio: 'audio/two.mp3' },
    { value: 3, word: 'three', audio: 'audio/three.mp3' },
    { value: 4, word: 'four', audio: 'audio/four.mp3' },
    { value: 5, word: 'five', audio: 'audio/five.mp3' },
    { value: 6, word: 'six', audio: 'audio/six.mp3' },
    { value: 7, word: 'seven', audio: 'audio/seven.mp3' },
    { value: 8, word: 'eight', audio: 'audio/eight.mp3' },
    { value: 9, word: 'nine', audio: 'audio/nine.mp3' },
    { value: 10, word: 'ten', audio: 'audio/ten.mp3' }
];

// Local sound effects
const soundEffects = {
    correct: 'sfx/CorrectAnswer.mp3',
    wrong: 'sfx/IncorrectAnswer.mp3',
    win: 'sfx/Win.mp3',
    gameOver: 'sfx/GameOver.mp3'
};

let currentNumber = null;
let score = 0;
let highScore = localStorage.getItem('englishNextLevelHighScore') ? parseInt(localStorage.getItem('englishNextLevelHighScore')) : 0;
let lives = 3;
let streak = 0;
let multiplier = 1;
let answered = false;
let availableNumbers = [];
let audioPlayer = null;
let isAudioMuted = false;
let gameActive = false;
let gameEnded = false;

// Eagle animation variables
let eagleX = 200;
let eagleY = 200;
let eagleTargetX = 200;
let isJumping = false;
let jumpProgress = 0;
let eagleDirection = 1;

// Animation states
let eagleState = 'idle';
let frameCount = 0;
let currentWrongFrame = 0;
let wrongAnimationSpeed = 6;

// Timer variables
let startTime = null;
let endTime = null;
let timerInterval = null;
let currentTime = 0;

// DOM Elements
const canvas = document.getElementById('stickman-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const wordDisplay = document.getElementById('wordDisplay');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const multiplierDisplay = document.getElementById('multiplier');
const timerDisplay = document.getElementById('timer');
const livesDisplay = document.getElementById('lives');
const platforms = document.querySelectorAll('.platform');
const speakerToggle = document.getElementById('speaker-toggle');
const gameContainer = document.querySelector('.game-container');
const startButton = document.getElementById('start-game-btn');
const instructions = document.getElementById('main-instructions');
const gameStats = document.getElementById('game-stats');

// Platform positions
const platformPositions = [80, 200, 320];

// Load images
let eagleImages = {
    idle: null,
    jump: null,
    celebrate: null,
    wrong: []
};
let imagesLoaded = 0;
let totalImagesToLoad = 1 + 1 + 1 + 12; // idle + jump + celebrate + 12 wrong

// Load eagle images with error handling for GitHub Pages
function loadEagleImages() {
    console.log('Loading eagle images for GitHub Pages...');
    console.log('Base URL:', window.location.origin);
    
    // Helper function to create image with error handling
    function createImage(src, name) {
        const img = new Image();
        img.src = src;
        
        img.onload = () => {
            imagesLoaded++;
            console.log(`✅ Loaded: ${name} (${imagesLoaded}/${totalImagesToLoad})`);
        };
        
        img.onerror = () => {
            imagesLoaded++;
            console.log(`❌ Failed to load: ${src} - ${name} will use fallback`);
            // Mark as loaded but keep img as is (will be checked in draw)
        };
        
        return img;
    }
    
    // Try different path variations for GitHub Pages
    const basePath = '';
    const altPath1 = '/stick-numbers';
    const altPath2 = '/English-Next-Level-Game';
    
    // You might need to adjust these paths based on your repository name
    eagleImages.idle = createImage('images/eagle_idle_01.png', 'idle');
    eagleImages.jump = createImage('images/eagle_jump_01.png', 'jump');
    eagleImages.celebrate = createImage('images/eagle_center (1).png', 'celebrate');
    
    // Load 12 wrong animation frames
    for (let i = 1; i <= 12; i++) {
        const frameNum = i.toString().padStart(2, '0');
        const img = createImage(`images/eagle_wrong_${frameNum}.png`, `wrong_${frameNum}`);
        eagleImages.wrong.push(img);
    }
}

// Initialize game
function initGame() {
    console.log('Game initializing...');
    console.log('Current URL:', window.location.href);
    console.log('Canvas element:', canvas);
    
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    
    canvas.width = 400;
    canvas.height = 200;
    
    loadEagleImages();
    
    audioPlayer = new Audio();
    audioPlayer.preload = 'auto';
    
    if (highScoreDisplay) {
        highScoreDisplay.textContent = highScore;
    }
    
    if (speakerToggle) {
        speakerToggle.addEventListener('click', toggleAudio);
    }
    
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error('Start button not found!');
    }
    
    if (platforms.length > 0) {
        platforms.forEach(platform => {
            platform.addEventListener('click', handlePlatformClick);
        });
    } else {
        console.error('No platforms found!');
    }
    
    animate();
    showStartScreen();
}

// Animation loop
function animate() {
    if (ctx) {
        updateEagle();
        drawEagle();
    }
    requestAnimationFrame(animate);
}

function updateEagle() {
    if (isJumping) {
        jumpProgress += 0.02;
        
        if (jumpProgress >= 1) {
            eagleX = eagleTargetX;
            eagleY = 200;
            isJumping = false;
            jumpProgress = 0;
            eagleState = 'celebrating';
            frameCount = 0;
        } else {
            eagleX = eagleX + (eagleTargetX - eagleX) * 0.1;
            eagleY = 200 - 40 * Math.sin(jumpProgress * Math.PI);
            eagleState = 'jumping';
        }
    } else {
        if (eagleState === 'celebrating') {
            frameCount++;
            if (frameCount > 40) {
                eagleState = 'idle';
            }
        } else if (eagleState === 'wrong') {
            frameCount++;
            if (frameCount >= wrongAnimationSpeed) {
                frameCount = 0;
                currentWrongFrame++;
                
                if (currentWrongFrame >= eagleImages.wrong.length) {
                    eagleState = 'idle';
                    currentWrongFrame = 0;
                }
            }
        }
    }
}

function drawEagle() {
    ctx.clearRect(0, 0, 400, 200);
    
    // Draw a simple stick figure as fallback if images aren't loaded
    if (imagesLoaded < totalImagesToLoad) {
        drawFallbackEagle();
        return;
    }
    
    // Determine which image to use
    let img = null;
    if (eagleState === 'idle') {
        img = eagleImages.idle;
    } else if (eagleState === 'jumping') {
        img = eagleImages.jump;
    } else if (eagleState === 'celebrating') {
        img = eagleImages.celebrate;
    } else if (eagleState === 'wrong') {
        if (currentWrongFrame < eagleImages.wrong.length && 
            eagleImages.wrong[currentWrongFrame] && 
            eagleImages.wrong[currentWrongFrame].complete && 
            eagleImages.wrong[currentWrongFrame].naturalHeight !== 0) {
            img = eagleImages.wrong[currentWrongFrame];
        } else {
            img = eagleImages.idle;
        }
    }
    
    // Draw if image is valid and loaded
    if (img && img.complete && img.naturalHeight !== 0) {
        ctx.save();
        ctx.translate(eagleX, eagleY);
        
        if (eagleDirection === -1) {
            ctx.scale(-1, 1);
        }
        
        ctx.drawImage(img, -60, -120, 120, 120);
        ctx.restore();
    } else {
        // Fallback drawing
        drawFallbackEagle();
    }
}

// Fallback drawing function
function drawFallbackEagle() {
    ctx.save();
    ctx.translate(eagleX, eagleY);
    
    // Draw a simple eagle shape
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(0, -60, 30, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(20, -70);
    ctx.lineTo(40, -65);
    ctx.lineTo(20, -60);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-15, -75, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, -75, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1e3c5c';
    ctx.beginPath();
    ctx.arc(-15, -75, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, -75, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function jumpToPlatform(platformIndex) {
    eagleTargetX = platformPositions[platformIndex];
    isJumping = true;
    jumpProgress = 0;
    
    if (eagleTargetX > eagleX) {
        eagleDirection = 1;
    } else if (eagleTargetX < eagleX) {
        eagleDirection = -1;
    }
}

function resetEagle() {
    eagleX = 200;
    eagleY = 200;
    isJumping = false;
    jumpProgress = 0;
    eagleState = 'idle';
    eagleDirection = 1;
    frameCount = 0;
    currentWrongFrame = 0;
}

function handlePlatformClick(event) {
    const button = event.currentTarget;
    const platformIndex = parseInt(button.dataset.index);
    
    if (!gameActive || answered || !currentNumber) return;
    
    const selectedValue = parseInt(button.dataset.value);
    
    if (selectedValue === currentNumber.value) {
        button.classList.add('correct');
        
        streak++;
        multiplier = Math.min(streak, 5);
        
        let basePoints = 50;
        let pointsEarned = basePoints * multiplier;
        score += pointsEarned;
        
        updateScore();
        updateMultiplier();
        updateHighScore();
        playSound('correct');
        
        if (platformPositions[platformIndex] === eagleX) {
            eagleState = 'celebrating';
            frameCount = 0;
        } else {
            jumpToPlatform(platformIndex);
        }
        
        answered = true;
        
        platforms.forEach(platform => {
            platform.disabled = true;
        });
        
        setTimeout(() => {
            nextRound();
        }, 1200);
        
    } else {
        button.classList.add('wrong');
        
        streak = 0;
        multiplier = 1;
        updateMultiplier();
        
        playSound('wrong');
        
        eagleState = 'wrong';
        frameCount = 0;
        currentWrongFrame = 0;
        
        loseLife();
        
        setTimeout(() => {
            button.classList.remove('wrong');
        }, 300);
    }
}

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
        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function calculateSpeedBonus() {
    if (endTime <= 0) return 1;
    let bonus = 5 * (15 / endTime);
    bonus = Math.min(5, Math.max(1, bonus));
    return Math.round(bonus * 100) / 100;
}

function getTimeBonusTitle(seconds, bonus) {
    if (bonus >= 4.5) return "🏆 WORLD RECORD!";
    if (bonus >= 3.5) return "⚡ AMAZING!";
    if (bonus >= 2.5) return "🔥 GREAT!";
    if (bonus >= 1.8) return "✨ GOOD!";
    if (bonus >= 1.3) return "👍 DECENT!";
    return "👌 OKAY!";
}

function showWinWithBonus() {
    const speedBonus = calculateSpeedBonus();
    const bonusPoints = Math.round(score * (speedBonus - 1));
    const totalScore = score + bonusPoints;
    const timeTitle = getTimeBonusTitle(endTime, speedBonus);
    
    const winScreen = document.createElement('div');
    winScreen.className = 'win-screen';
    winScreen.innerHTML = `
        <h2>🎉 YOU WIN! 🎉</h2>
        <div class="win-stats">
            <p class="time-title">${timeTitle}</p>
            <p>⏱️ Time: ${timerDisplay.textContent}</p>
            <p>💰 Base Score: ${score}</p>
            <p>⚡ Time Bonus: ${speedBonus}x</p>
            <p class="bonus-points">✨ +${bonusPoints} points</p>
            <p class="total-score">🏆 TOTAL: ${totalScore}</p>
        </div>
        <button class="restart-btn">PLAY AGAIN</button>
    `;
    
    if (totalScore > highScore) {
        highScore = totalScore;
        localStorage.setItem('englishNextLevelHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
    
    gameContainer.appendChild(winScreen);
    
    const restartBtn = winScreen.querySelector('.restart-btn');
    restartBtn.addEventListener('click', () => {
        winScreen.remove();
        removeRestartButton();
        showStartScreen();
    });
}

function showStartScreen() {
    gameActive = false;
    gameContainer.classList.remove('game-active');
    
    stopTimer();
    
    if (startButton) {
        startButton.style.display = 'block';
        startButton.disabled = false;
    }
    
    if (gameStats) {
        gameStats.style.display = 'none';
    }
    
    if (instructions) {
        instructions.textContent = '👆 Click START to begin';
    }
    
    platforms.forEach(platform => {
        platform.textContent = '?';
        platform.disabled = true;
        platform.classList.remove('correct', 'wrong');
    });
    
    if (wordDisplay) {
        wordDisplay.textContent = 'Ready?';
    }
    
    resetEagle();
}

function startGame() {
    gameActive = true;
    gameContainer.classList.add('game-active');
    
    if (startButton) {
        startButton.style.display = 'none';
    }
    
    if (gameStats) {
        gameStats.style.display = 'flex';
    }
    
    if (instructions) {
        instructions.textContent = '👆 Click the number that matches the word';
    }
    
    resetGame();
    startTimer();
}

function resetGame() {
    availableNumbers = [...numbers];
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
    const existingButton = document.querySelector('.restart-btn');
    if (existingButton) existingButton.remove();
}

function removeWinScreen() {
    const existingWinScreen = document.querySelector('.win-screen');
    if (existingWinScreen) existingWinScreen.remove();
}

function addRestartButton() {
    removeRestartButton();
    removeWinScreen();
    
    const restartBtn = document.createElement('button');
    restartBtn.className = 'restart-btn';
    restartBtn.textContent = 'PLAY AGAIN';
    restartBtn.addEventListener('click', () => {
        removeRestartButton();
        showStartScreen();
    });
    
    gameContainer.appendChild(restartBtn);
}

function toggleAudio() {
    isAudioMuted = !isAudioMuted;
    if (speakerToggle) {
        speakerToggle.textContent = isAudioMuted ? '🔇' : '🔊';
        speakerToggle.classList.toggle('muted', isAudioMuted);
    }
}

function playSound(soundType) {
    if (isAudioMuted) return;
    const sound = new Audio(soundEffects[soundType]);
    sound.volume = 0.7;
    sound.play().catch(error => {
        console.log('Sound effect failed:', soundType, error);
    });
}

function playAudio() {
    if (!currentNumber || isAudioMuted || !gameActive) return;
    
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
    
    audioPlayer.src = currentNumber.audio;
    audioPlayer.volume = 0.8;
    
    const playPromise = audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log('Audio file not found:', error);
            
            if ('speechSynthesis' in window && !isAudioMuted) {
                const utterance = new SpeechSynthesisUtterance(currentNumber.word);
                utterance.lang = 'en-US';
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        });
    }
    
    if (speakerToggle) {
        speakerToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            speakerToggle.style.transform = 'scale(1)';
        }, 200);
    }
}

function updateMultiplier() {
    if (multiplierDisplay) {
        multiplierDisplay.textContent = `${multiplier}x`;
        multiplierDisplay.style.color = multiplier > 1 ? '#c9a13b' : '#5a6d7e';
        multiplierDisplay.style.fontWeight = multiplier > 1 ? 'bold' : 'normal';
    }
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('englishNextLevelHighScore', highScore);
        highScoreDisplay.textContent = highScore;
        
        const msg = document.createElement('div');
        msg.textContent = '🏆 NEW HIGH SCORE!';
        msg.style.position = 'fixed';
        msg.style.top = '50%';
        msg.style.left = '50%';
        msg.style.transform = 'translate(-50%, -50%)';
        msg.style.background = '#c9a13b';
        msg.style.color = '#1e3c5c';
        msg.style.padding = '1rem 2rem';
        msg.style.borderRadius = '50px';
        msg.style.fontWeight = 'bold';
        msg.style.zIndex = '1000';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    }
}

function gameOver() {
    if (gameEnded) return;
    
    gameActive = false;
    gameEnded = true;
    stopTimer();
    playSound('gameOver');
    
    platforms.forEach(platform => platform.disabled = true);
    
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
    
    platforms.forEach(platform => platform.disabled = true);
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
    
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    currentNumber = availableNumbers[randomIndex];
    availableNumbers.splice(randomIndex, 1);
    
    wordDisplay.textContent = currentNumber.word;
    setupPlatforms();
    
    answered = false;
    
    platforms.forEach(platform => {
        platform.classList.remove('correct', 'wrong');
        platform.disabled = false;
    });
    
    setTimeout(playAudio, 100);
}

function setupPlatforms() {
    const options = [currentNumber.value];
    
    while (options.length < 3) {
        const randomNum = Math.floor(Math.random() * 10) + 1;
        if (!options.includes(randomNum)) options.push(randomNum);
    }
    
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    platforms.forEach((platform, index) => {
        platform.textContent = options[index];
        platform.dataset.value = options[index];
    });
}

function updateScore() {
    if (scoreDisplay) scoreDisplay.textContent = score;
}

// Start the game
window.addEventListener('load', initGame);