// Game data
const numbers = [
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
];

let currentNumber = null;
let score = 0;
let answered = false;
let availableNumbers = [];

// DOM Elements
const stickman = document.getElementById('stickman');
const wordDisplay = document.getElementById('wordDisplay');
const scoreDisplay = document.getElementById('score');
const platforms = document.querySelectorAll('.platform');
const audioButton = document.querySelector('button[onclick="playAudio()"]');

// Make functions global
window.checkAnswer = checkAnswer;
window.playAudio = playAudio;

// Initialize game
function initGame() {
    availableNumbers = [...numbers];
    nextRound();
}

function nextRound() {
    if (availableNumbers.length === 0) {
        wordDisplay.textContent = '🎉 GREAT JOB! 🎉';
        setTimeout(() => {
            availableNumbers = [...numbers];
            score = 0;
            updateScore();
            nextRound();
        }, 2000);
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    currentNumber = availableNumbers[randomIndex];
    
    availableNumbers.splice(randomIndex, 1);
    wordDisplay.textContent = currentNumber.word;
    
    setupPlatforms();
    
    answered = false;
    
    // Reset stickman to standing position
    stickman.textContent = '🧍';
    stickman.style.transform = 'translate(0, 0)';
    stickman.style.transition = 'all 0.3s ease';
    
    platforms.forEach(platform => {
        platform.classList.remove('correct', 'wrong');
        platform.disabled = false;
    });
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
    if (answered) return;
    
    const selectedValue = parseInt(button.dataset.value);
    const buttonRect = button.getBoundingClientRect();
    const stickmanRect = stickman.getBoundingClientRect();
    
    const horizontalDistance = buttonRect.left - stickmanRect.left;
    
    if (selectedValue === currentNumber.value) {
        // Correct answer - jump to platform
        button.classList.add('correct');
        score += 10;
        updateScore();
        answered = true;
        
        // Quick jump animation
        stickman.style.transform = `translate(${horizontalDistance}px, -30px)`;
        
        setTimeout(() => {
            stickman.style.transform = `translate(${horizontalDistance}px, 0)`;
            stickman.textContent = '🎉';
        }, 150);
        
        // Disable platforms
        platforms.forEach(platform => {
            platform.disabled = true;
        });
        
        // Next round
        setTimeout(() => {
            nextRound();
        }, 1000);
        
    } else {
        // Wrong answer - fall down
        button.classList.add('wrong');
        
        // Fall animation
        stickman.style.transform = `translate(${horizontalDistance * 0.3}px, 50px) rotate(45deg)`;
        stickman.textContent = '😵';
        
        // Penalty
        if (score > 0) {
            score -= 5;
            updateScore();
        }
        
        // Remove wrong class after animation
        setTimeout(() => {
            button.classList.remove('wrong');
        }, 300);
        
        // Reset stickman
        setTimeout(() => {
            stickman.style.transform = 'translate(0, 0) rotate(0deg)';
            stickman.textContent = '🧍';
        }, 800);
    }
}

function updateScore() {
    scoreDisplay.textContent = score;
}

function playAudio() {
    if (!currentNumber) return;
    
    // Use VoiceRSS API for native English voice
    const audio = new Audio();
    
    // Your VoiceRSS API key
    const apiKey = '00a17624f2fa4d7b81aaa57e952037a5';
    
    // Using Joanna - native American female voice (Amazon Polly)
    // Other options: 
    // hl=en-us&v=Joanna - American female
    // hl=en-us&v=Matthew - American male
    // hl=en-gb&v=Amy - British female
    // hl=en-gb&v=Brian - British male
    
    audio.src = `https://api.voicerss.org/?key=${apiKey}&hl=en-us&v=Joanna&src=${currentNumber.word}&c=MP3&f=44khz_16bit_stereo`;
    
    audio.play().catch(error => {
        console.log('VoiceRSS failed, trying fallback:', error);
        
        // Fallback to Google TTS
        const googleAudio = new Audio();
        googleAudio.src = `https://translate.google.com/translate_tts?ie=UTF-8&q=${currentNumber.word}&tl=en&client=tw-ob`;
        googleAudio.play().catch(() => {
            // Last resort - browser speech
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(currentNumber.word);
                utterance.lang = 'en-US';
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        });
    });
    
    // Button feedback
    audioButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        audioButton.style.transform = 'scale(1)';
    }, 200);
    
    // Highlight the word
    wordDisplay.style.backgroundColor = '#fef3c7';
    setTimeout(() => {
        wordDisplay.style.backgroundColor = '#edf2f7';
    }, 500);
}
// Start game
window.addEventListener('load', initGame);