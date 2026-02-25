// Game data with local audio files
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
let lives = 3;
let answered = false;
let availableNumbers = [];
let audioPlayer = null;
let isAudioMuted = false;
let gameActive = true;
let gameEnded = false;

// DOM Elements
const stickman = document.getElementById('stickman');
const wordDisplay = document.getElementById('wordDisplay');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const platforms = document.querySelectorAll('.platform');
const speakerToggle = document.getElementById('speaker-toggle');
const gameContainer = document.querySelector('.game-container');

// Make functions global
window.checkAnswer = checkAnswer;
window.restartGame = restartGame;

// Initialize game
function initGame() {
    console.log('Game initializing...');
    
    // Create audio player for number pronunciation
    audioPlayer = new Audio();
    audioPlayer.preload = 'auto';
    
    // Show initial lives
    updateLives();
    
    // Set up speaker toggle
    if (speakerToggle) {
        speakerToggle.addEventListener('click', toggleAudio);
    }
    
    resetGame();
}

function resetGame() {
    console.log('Resetting game');
    availableNumbers = [...numbers];
    score = 0;
    lives = 3;
    gameActive = true;
    gameEnded = false;
    updateScore();
    updateLives();
    
    // Remove any existing restart button
    removeRestartButton();
    
    nextRound();
}

function removeRestartButton() {
    const existingButton = document.querySelector('.restart-btn');
    if (existingButton) {
        existingButton.remove();
    }
}

function addRestartButton() {
    // Remove any existing button first
    removeRestartButton();
    
    // Create restart button with same style as other buttons
    const restartBtn = document.createElement('button');
    restartBtn.className = 'restart-btn';
    restartBtn.textContent = 'Play Again';
    restartBtn.onclick = restartGame;
    
    // Add to game container
    gameContainer.appendChild(restartBtn);
}

function restartGame() {
    console.log('Restarting game...');
    resetGame();
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
    
    console.log('Playing sound:', soundType);
    
    // Create a new audio element for each sound to avoid conflicts
    const sound = new Audio(soundEffects[soundType]);
    sound.volume = 0.7;
    
    sound.play().catch(error => {
        console.log('Sound effect failed:', error);
    });
}

function playAudio() {
    if (!currentNumber || isAudioMuted || !gameActive) return;
    
    console.log('Playing audio for:', currentNumber.word);
    
    // Stop any currently playing audio
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
    
    // Set and play audio
    audioPlayer.src = currentNumber.audio;
    audioPlayer.play().catch(error => {
        console.log('Audio file not found:', error);
    });
    
    // Visual feedback on speaker
    if (speakerToggle) {
        speakerToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            speakerToggle.style.transform = 'scale(1)';
        }, 200);
    }
}

function gameOver() {
    if (gameEnded) return;
    
    console.log('Game Over!');
    gameActive = false;
    gameEnded = true;
    
    // Play game over sound
    playSound('gameOver');
    
    // Disable all platforms immediately
    platforms.forEach(platform => {
        platform.disabled = true;
    });
    
    // Sad stickman
    stickman.textContent = '😵';
    stickman.style.transform = 'translate(0, 10px) rotate(5deg)';
    
    // Wait 1 second before showing game over text and restart button
    setTimeout(() => {
        wordDisplay.textContent = 'GAME OVER';
        
        // Add restart button
        addRestartButton();
    }, 1000);
}

function winGame() {
    if (gameEnded) return;
    
    console.log('You Win!');
    gameActive = false;
    gameEnded = true;
    
    // Play win sound
    playSound('win');
    
    // Disable all platforms
    platforms.forEach(platform => {
        platform.disabled = true;
    });
    
    // Happy stickman
    stickman.textContent = '🎉';
    stickman.style.transform = 'translate(0, -10px)';
    
    // Show win text
    wordDisplay.textContent = 'YOU WIN!';
    
    // Add restart button
    addRestartButton();
}

function loseLife() {
    if (lives > 0) {
        lives--;
        updateLives();
        
        if (lives === 0) {
            gameOver();
        }
    }
}

function updateLives() {
    console.log('Updating lives, current lives:', lives);
    
    // Make sure livesDisplay exists
    if (!livesDisplay) {
        console.error('livesDisplay element not found!');
        return;
    }
    
    // Clear lives display
    livesDisplay.innerHTML = '';
    
    // Add circles for remaining lives
    for (let i = 0; i < 3; i++) {
        const circle = document.createElement('span');
        circle.className = 'life-circle';
        if (i < lives) {
            circle.classList.add('full');
        } else {
            circle.classList.add('empty');
        }
        livesDisplay.appendChild(circle);
    }
}

function nextRound() {
    console.log('Next round called');
    
    if (!gameActive) return;
    
    if (availableNumbers.length === 0) {
        winGame();
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    currentNumber = availableNumbers[randomIndex];
    console.log('Current number:', currentNumber);
    
    availableNumbers.splice(randomIndex, 1);
    
    // Show the word
    wordDisplay.textContent = currentNumber.word;
    
    setupPlatforms();
    
    answered = false;
    
    // Reset stickman
    stickman.textContent = '🧍';
    stickman.style.transform = 'translate(0, 0)';
    stickman.style.transition = 'all 0.3s ease';
    
    platforms.forEach(platform => {
        platform.classList.remove('correct', 'wrong');
        platform.disabled = false;
    });
    
    // Play audio
    setTimeout(() => {
        playAudio();
    }, 100);
}

function setupPlatforms() {
    const options = [currentNumber.value];
    
    while (options.length < 3) {
        const randomNum = Math.floor(Math.random() * 10) + 1;
        if (!options.includes(randomNum)) {
            options.push(randomNum);
        }
    }
    
    // Shuffle
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    platforms.forEach((platform, index) => {
        platform.textContent = options[index];
        platform.dataset.value = options[index];
    });
}

function checkAnswer(button) {
    if (answered || !gameActive) return;
    
    const selectedValue = parseInt(button.dataset.value);
    
    if (selectedValue === currentNumber.value) {
        // Correct answer
        console.log('Correct answer!');
        button.classList.add('correct');
        score += 10;
        updateScore();
        answered = true;
        
        // Play correct sound
        playSound('correct');
        
        // Jump animation
        stickman.style.transform = 'translate(0, -30px)';
        
        setTimeout(() => {
            stickman.style.transform = 'translate(0, 0)';
            stickman.textContent = '🎉';
        }, 150);
        
        platforms.forEach(platform => {
            platform.disabled = true;
        });
        
        setTimeout(() => {
            nextRound();
        }, 1000);
        
    } else {
        // Wrong answer
        console.log('Wrong answer!');
        button.classList.add('wrong');
        
        // Play wrong sound
        playSound('wrong');
        
        // Fall animation
        stickman.style.transform = 'translate(0, 50px) rotate(45deg)';
        stickman.textContent = '😵';
        
        // Lose a life
        loseLife();
        
        setTimeout(() => {
            button.classList.remove('wrong');
        }, 300);
        
        // If still alive, reset stickman
        if (lives > 0) {
            setTimeout(() => {
                stickman.style.transform = 'translate(0, 0) rotate(0deg)';
                stickman.textContent = '🧍';
            }, 800);
        }
    }
}

function updateScore() {
    scoreDisplay.textContent = score;
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key);
        const platform = Array.from(platforms).find(p => 
            parseInt(p.textContent) === num && !p.disabled
        );
        if (platform) {
            checkAnswer(platform);
        }
    }
    // 'M' key for mute
    if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleAudio();
    }
    // 'R' key for restart
    if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        restartGame();
    }
});

// Start game
window.addEventListener('load', initGame);