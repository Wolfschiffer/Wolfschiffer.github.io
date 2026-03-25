// ============================================
// 1. CONFIGURAÇÕES GLOBAIS
// ============================================

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const MOBILE_CONFIG = {
    eagleAnimationDelay: isMobile ? 45 : 50,    // Aumentei para 45ms para o flap ser visível
    jumpSpeed: isMobile ? 0.018 : 0.015,
    horizontalEasing: isMobile ? 0.15 : 0.15,
    timerInterval: isMobile ? 300 : 200,
    timeBonusMax: isMobile ? 2.3 : 2.5,
    perfectTime: isMobile ? 3.0 : 2.5,
    reduceAnimations: false,
    disableParticles: isMobile,
    canvasScale: isMobile ? 0.9 : 1.0,
    tapDelay: isMobile ? 80 : 80,
    platformFontSize: isMobile ? '24px' : '32px',
    wordFontSize: isMobile ? '24px' : '32px'
};

const JUMP_SPEED = MOBILE_CONFIG.jumpSpeed;
const HORIZONTAL_EASING = MOBILE_CONFIG.horizontalEasing;
let lastAnimationFrame = 0;
const EAGLE_ANIMATION_DELAY = MOBILE_CONFIG.eagleAnimationDelay;

// ============================================
// SISTEMA DE PONTUAÇÃO
// ============================================

const SCORE_CONFIG = {
    BASE_POINTS: 100,           
    STREAK_MULTIPLIER: 0.35,
    MAX_STREAK: 5,              
    TIME_BONUS_MIN: 1.0,
    MAX_TIME: 12
};

const SOUND_EFFECTS = {
    correct: 'sfx/CorrectAnswer.mp3',
    wrong: 'sfx/IncorrectAnswer.mp3',
    win: 'sfx/Win.mp3',
    gameOver: 'sfx/GameOver.mp3'
};

const PLATFORM_POSITIONS = [100, 250, 400];

// ============================================
// 2. GAME DATA (PARTE 1 - DADOS BÁSICOS)
// ============================================

const gameData = {
    numbers: [
        { value: 1, word: 'one' }, { value: 2, word: 'two' }, { value: 3, word: 'three' },
        { value: 4, word: 'four' }, { value: 5, word: 'five' }, { value: 6, word: 'six' },
        { value: 7, word: 'seven' }, { value: 8, word: 'eight' }, { value: 9, word: 'nine' },
        { value: 10, word: 'ten' }
    ],
    numbers11_20: [
        { value: 11, word: 'eleven' }, { value: 12, word: 'twelve' }, { value: 13, word: 'thirteen' },
        { value: 14, word: 'fourteen' }, { value: 15, word: 'fifteen' }, { value: 16, word: 'sixteen' },
        { value: 17, word: 'seventeen' }, { value: 18, word: 'eighteen' }, { value: 19, word: 'nineteen' },
        { value: 20, word: 'twenty' }
    ],
    tens: [
        { value: 20, word: 'twenty' }, { value: 30, word: 'thirty' }, { value: 40, word: 'forty' },
        { value: 50, word: 'fifty' }, { value: 60, word: 'sixty' }, { value: 70, word: 'seventy' },
        { value: 80, word: 'eighty' }, { value: 90, word: 'ninety' }
    ],
    hundreds: [
        { value: 100, word: 'one hundred' }, { value: 200, word: 'two hundred' },
        { value: 300, word: 'three hundred' }, { value: 400, word: 'four hundred' },
        { value: 500, word: 'five hundred' }, { value: 600, word: 'six hundred' },
        { value: 700, word: 'seven hundred' }, { value: 800, word: 'eight hundred' },
        { value: 900, word: 'nine hundred' }
    ],
    thousands: [
        { value: 1000, word: 'one thousand' }, { value: 2000, word: 'two thousand' },
        { value: 3000, word: 'three thousand' }, { value: 4000, word: 'four thousand' },
        { value: 5000, word: 'five thousand' }, { value: 6000, word: 'six thousand' },
        { value: 7000, word: 'seven thousand' }, { value: 8000, word: 'eight thousand' },
        { value: 9000, word: 'nine thousand' }
    ],
    random21_99: [],
    random101_999: [],
    random1001_9999: [],
    mixedAdvanced: []
};

// ============================================
// FUNÇÕES GERADORAS DE NÚMEROS
// ============================================

function generateNumbers_21_99() {
    const numbers = [];
    const units = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    for (let t = 0; t < tens.length; t++) {
        for (let u = 0; u < units.length; u++) {
            numbers.push({
                value: (t + 2) * 10 + (u + 1),
                word: `${tens[t]}-${units[u]}`
            });
        }
    }
    return numbers;
}

function generateNumbers_101_999() {
    const numbers = [];
    const hundreds = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const units = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tensList = ['ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 
                   'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    
    for (let h = 0; h < hundreds.length; h++) {
        const hundredWord = `${hundreds[h]} hundred`;
        numbers.push({ value: (h + 1) * 100, word: hundredWord });
        
        for (let u = 0; u < units.length; u++) {
            numbers.push({ value: (h + 1) * 100 + (u + 1), word: `${hundredWord} ${units[u]}` });
        }
        
        for (let s = 0; s < teens.length; s++) {
            numbers.push({ value: (h + 1) * 100 + 10 + s, word: `${hundredWord} ${teens[s]}` });
        }
        
        for (let t = 0; t < tensList.length; t++) {
            const tenWord = tensList[t];
            const tenValue = (t + 1) * 10;
            if (tenValue >= 20) {
                numbers.push({ value: (h + 1) * 100 + tenValue, word: `${hundredWord} ${tenWord}` });
            }
            for (let u = 0; u < units.length; u++) {
                numbers.push({ value: (h + 1) * 100 + tenValue + (u + 1), word: `${hundredWord} ${tenWord}-${units[u]}` });
            }
        }
    }
    
    const unique = [];
    const seen = new Set();
    for (const num of numbers) {
        if (!seen.has(num.value)) {
            seen.add(num.value);
            unique.push(num);
        }
    }
    return unique;
}

function generateNumbers_1001_9999() {
    const numbers = [];
    const thousands = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const hundreds = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tensList = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const units = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 
                   'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    
    for (let th = 0; th < thousands.length; th++) {
        const thousandWord = `${thousands[th]} thousand`;
        const thousandValue = (th + 1) * 1000;
        
        numbers.push({ value: thousandValue, word: thousandWord });
        
        for (let u = 0; u < units.length; u++) {
            numbers.push({ value: thousandValue + (u + 1), word: `${thousandWord} ${units[u]}` });
        }
        
        for (let s = 0; s < teens.length; s++) {
            numbers.push({ value: thousandValue + 10 + s, word: `${thousandWord} ${teens[s]}` });
        }
        
        for (let t = 0; t < tensList.length; t++) {
            const tenWord = tensList[t];
            const tenValue = (t + 2) * 10;
            numbers.push({ value: thousandValue + tenValue, word: `${thousandWord} ${tenWord}` });
            for (let u = 0; u < units.length; u++) {
                numbers.push({ value: thousandValue + tenValue + (u + 1), word: `${thousandWord} ${tenWord}-${units[u]}` });
            }
        }
        
        for (let h = 0; h < hundreds.length; h++) {
            const hundredWord = `${hundreds[h]} hundred`;
            const hundredValue = (h + 1) * 100;
            numbers.push({ value: thousandValue + hundredValue, word: `${thousandWord} ${hundredWord}` });
            
            for (let u = 0; u < units.length; u++) {
                numbers.push({ value: thousandValue + hundredValue + (u + 1), word: `${thousandWord} ${hundredWord} ${units[u]}` });
            }
            
            for (let s = 0; s < teens.length; s++) {
                numbers.push({ value: thousandValue + hundredValue + 10 + s, word: `${thousandWord} ${hundredWord} ${teens[s]}` });
            }
            
            for (let t = 0; t < tensList.length; t++) {
                const tenWord = tensList[t];
                const tenValue = (t + 2) * 10;
                numbers.push({ value: thousandValue + hundredValue + tenValue, word: `${thousandWord} ${hundredWord} ${tenWord}` });
                for (let u = 0; u < units.length; u++) {
                    numbers.push({ value: thousandValue + hundredValue + tenValue + (u + 1), word: `${thousandWord} ${hundredWord} ${tenWord}-${units[u]}` });
                }
            }
        }
    }
    
    const unique = [];
    const seen = new Set();
    for (const num of numbers) {
        if (!seen.has(num.value)) {
            seen.add(num.value);
            unique.push(num);
        }
    }
    return unique;
}

function generateMixedAdvanced() {
    // Pega todos os números de todas as categorias
    const allNumbers = [
        ...gameData.numbers,
        ...gameData.numbers11_20,
        ...gameData.tens,
        ...gameData.hundreds,
        ...gameData.thousands,
        ...gameData.random21_99,
        ...gameData.random101_999,
        ...gameData.random1001_9999
    ];
    
    // Embaralhar
    for (let i = allNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
    }
    
    return allNumbers.slice(0, 50);
}

// ============================================
// PREENCHER OS DADOS GERADOS
// ============================================

gameData.random21_99 = generateNumbers_21_99();
gameData.random101_999 = generateNumbers_101_999();
gameData.random1001_9999 = generateNumbers_1001_9999();
gameData.mixedAdvanced = generateMixedAdvanced();

console.log('Game data loaded:');
console.log('21-99:', gameData.random21_99.length, 'numbers');
console.log('101-999:', gameData.random101_999.length, 'numbers');
console.log('1001-9999:', gameData.random1001_9999.length, 'numbers');
console.log('Mixed Advanced:', gameData.mixedAdvanced.length, 'numbers');



// ============================================
// 3. VARIÁVEIS DE ESTADO
// ============================================

let currentGame = 'numbers';
let currentNumbers = [];
let currentNumber = null;
let score = 0;
let highScores = {
    numbers: 0,
    numbers11_20: 0,
    tens: 0, 
    hundreds: 0,
    thousands: 0,
    random21_99: 0, 
    random101_999: 0,
    random1001_9999: 0,
    mixedAdvanced: 0
};

let lives = 3, streak = 0, multiplier = 1, answered = false, availableNumbers = [];
let audioPlayer = null, isAudioMuted = false, gameActive = false, gameEnded = false;
let isWaiting = false;  // DECLARADO APENAS UMA VEZ AQUI

// ============================================
// 4. EAGLE ANIMAÇÃO
// ============================================

let eagleX = 250, eagleY = 200, eagleTargetX = 250, isJumping = false, jumpProgress = 0, eagleDirection = -1;
let currentAnimation = 'idle', animationFrame = 0, isAnimating = false;

// ============================================
// 5. TIMER
// ============================================

let startTime = null, endTime = null, timerInterval = null, currentTime = 0;
let roundStartTime = 0;

// ============================================
// 6. DOM ELEMENTS
// ============================================

const DOM = {
    menu: document.getElementById('menu-container'),
    game: document.getElementById('game-container'),
    canvas: document.getElementById('stickman-canvas'),
    ctx: document.getElementById('stickman-canvas')?.getContext('2d'),
    wordDisplay: document.getElementById('wordDisplay'),
    score: document.getElementById('score'),
    highScore: document.getElementById('highScore'),
    multiplier: document.getElementById('multiplier'),
    timer: document.getElementById('timer'),
    lives: document.getElementById('lives'),
    platforms: document.querySelectorAll('#game-platforms .platform'),
    speakerToggle: document.getElementById('speaker-toggle'),
    menuButton: document.getElementById('menu-button'),
    gameSubtitle: document.getElementById('game-subtitle'),
    startButton: document.getElementById('start-game-btn'),
    instructions: document.getElementById('main-instructions'),
    gameStats: document.getElementById('game-stats')
};

// ============================================
// 7. IMAGENS
// ============================================

let eagleImages = { idle: null, flap: [], celebrate: [], wrong: [] };
let menuEagleImage = null;

function loadImages() {
    console.log('Loading images...');
    
    eagleImages.idle = new Image();
    eagleImages.idle.src = 'images/flap_01.png';
    eagleImages.idle.onload = () => console.log('✅ Idle image loaded');
    eagleImages.idle.onerror = () => console.error('❌ Failed: images/flap_01.png');
    
    menuEagleImage = new Image();
    menuEagleImage.src = 'images/flap_01.png';
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
        console.log('✅ Menu eagle image loaded');
    };
    menuEagleImage.onerror = () => console.error('❌ Failed to load menu eagle');
    
    for (let i = 1; i <= 18; i++) {
        const img = new Image();
        const num = i.toString().padStart(2, '0');
        img.src = `images/flap_${num}.png`;
        img.onerror = () => console.error(`❌ Failed: images/flap_${num}.png`);
        eagleImages.flap.push(img);
    }
    
    for (let i = 1; i <= 11; i++) {
        const img = new Image();
        const num = i.toString().padStart(2, '0');
        img.src = `images/eagle_center_${num}.png`;
        img.onerror = () => console.error(`❌ Failed: images/eagle_center_${num}.png`);
        eagleImages.celebrate.push(img);
    }
    
    for (let i = 1; i <= 19; i++) {
        const img = new Image();
        const num = i.toString().padStart(2, '0');
        img.src = `images/eagle_wrong_${num}.png`;
        img.onerror = () => console.error(`❌ Failed: images/eagle_wrong_${num}.png`);
        eagleImages.wrong.push(img);
    }
    
    console.log('All images loading started...');
}

// ============================================
// 7.5. SISTEMA DE PONTUAÇÃO
// ============================================

function calculateRoundScore() {
    let points = SCORE_CONFIG.BASE_POINTS;
    
    const streakBonus = Math.min(streak, SCORE_CONFIG.MAX_STREAK) * SCORE_CONFIG.STREAK_MULTIPLIER;
    points = Math.floor(points * (1 + streakBonus));
    
    const roundTime = (Date.now() - roundStartTime) / 1000;
    let timeBonus = 1.0;
    
    const timeBonusMax = MOBILE_CONFIG.timeBonusMax;
    const perfectTime = MOBILE_CONFIG.perfectTime;
    
    if (roundTime <= perfectTime) {
        timeBonus = timeBonusMax;
    } else if (roundTime <= SCORE_CONFIG.MAX_TIME) {
        const timeFactor = (SCORE_CONFIG.MAX_TIME - roundTime) / (SCORE_CONFIG.MAX_TIME - perfectTime);
        timeBonus = 1.0 + (timeFactor * (timeBonusMax - 1.0));
        timeBonus = Math.min(timeBonusMax, Math.max(SCORE_CONFIG.TIME_BONUS_MIN, timeBonus));
    }
    
    points = Math.floor(points * timeBonus);
    
    return {
        base: SCORE_CONFIG.BASE_POINTS,
        streakBonus: streakBonus,
        streakMultiplier: (1 + streakBonus),
        timeBonus: timeBonus,
        total: points,
        time: roundTime
    };
}

function showScorePopup(points, timeBonus) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    
    let bonusText = '';
    if (timeBonus > 1.8) {
        bonusText = '✨ EXCELLENT! ✨';
    } else if (timeBonus > 1.5) {
        bonusText = '🎯 GREAT! 🎯';
    } else if (timeBonus > 1.2) {
        bonusText = '👍 GOOD! 👍';
    } else {
        bonusText = '💪 KEEP GOING! 💪';
    }
    
    const fontSize = isMobile ? '1.1rem' : '1.3rem';
    const padding = isMobile ? '8px 16px' : '12px 24px';
    
    popup.innerHTML = `
        <span class="points" style="font-size: ${fontSize}">+${points}</span>
        <span class="bonus-message" style="font-size: ${fontSize}">${bonusText}</span>
    `;
    
    popup.style.position = 'fixed';
    popup.style.top = '40%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = '#c9a13b';
    popup.style.color = '#1e3c5c';
    popup.style.padding = padding;
    popup.style.borderRadius = '50px';
    popup.style.fontWeight = 'bold';
    popup.style.zIndex = '1000';
    popup.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    popup.style.border = '2px solid white';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.alignItems = 'center';
    popup.style.gap = '3px';
    popup.style.animation = 'floatUp 0.8s ease-out forwards';
    
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

function showWrongPopup() {
    const popup = document.createElement('div');
    popup.innerHTML = `❌ WRONG!`;
    popup.style.position = 'fixed';
    popup.style.top = '40%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = '#ef4444';
    popup.style.color = 'white';
    popup.style.padding = '12px 24px';
    popup.style.borderRadius = '50px';
    popup.style.fontWeight = 'bold';
    popup.style.fontSize = '1.3rem';
    popup.style.zIndex = '1000';
    popup.style.animation = 'floatUp 0.8s ease-out forwards';
    
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

// ============================================
// 8. ÁUDIO
// ============================================

function playSound(type) { 
    if (isAudioMuted) return;
    const audio = new Audio(SOUND_EFFECTS[type]);
    audio.play().catch(e => console.log('Sound error:', e));
}

function playAudio() {
    if (!currentNumber || isAudioMuted || !gameActive) return;
    
    if (audioPlayer) { 
        audioPlayer.pause(); 
        audioPlayer.currentTime = 0; 
    }
    
    let nomeArquivo = currentNumber.word.toLowerCase();
    
    // Substituir espaços por underline
    nomeArquivo = nomeArquivo.replace(/ /g, '_');
    // Substituir hífens por underline
    nomeArquivo = nomeArquivo.replace(/-/g, '_');
    
    console.log(`📁 Tentando: audio/${nomeArquivo}.mp3`);
    
    audioPlayer = new Audio(`audio/${nomeArquivo}.mp3`);
    
    audioPlayer.play().catch(err => {
        console.log(`❌ Erro: ${nomeArquivo}.mp3 -`, err.message);
        // Tentativa com espaço (fallback)
        const nomeComEspaco = currentNumber.word.toLowerCase();
        console.log(`📁 Tentando fallback: audio/${nomeComEspaco}.mp3`);
        const fallbackAudio = new Audio(`audio/${nomeComEspaco}.mp3`);
        fallbackAudio.play().catch(e => console.log(`❌ Fallback também falhou`));
    });
}
// ============================================
// 9. FUNÇÕES DO LEADERBOARD (RESUMIDAS)
// ============================================

async function showLeaderboardModal() {
    alert("🏆 GLOBAL LEADERBOARDS\n\nEm desenvolvimento!");
}

function showNameEntryModal(score, gameMode) {
    const name = prompt(`🎉 YOU WIN! 🎉\n\nYou scored ${score} points!\n\nEnter your name:`);
    if (name && name.trim()) {
        console.log(`💾 Saved: ${name} - ${score}`);
        alert(`✅ Thanks ${name}!`);
    }
}

// ============================================
// 10. ANIMAÇÃO DA ÁGUIA
// ============================================

function animate() {
    requestAnimationFrame(animate);
    updateEagleMovement();
    drawEagle();
}

function updateEagleMovement() {
    const now = Date.now();
    
    // ========== MOVIMENTO DO PULO ==========
    if (isJumping) {
        jumpProgress += JUMP_SPEED;
        
        if (jumpProgress >= 1) {
            // Pousou
            eagleX = eagleTargetX;
            eagleY = 200;
            isJumping = false;
            jumpProgress = 0;
            
            if (gameActive && answered) {
                isWaiting = true;
                DOM.platforms.forEach(p => p.disabled = true);
                startAnimation('celebrate');
                setTimeout(() => {
                    stopAnimation();
                    isWaiting = false;
                    nextRound();
                }, 300);
            }
        } else {
            // Movimento durante o pulo
            eagleX += (eagleTargetX - eagleX) * HORIZONTAL_EASING;
            eagleY = 200 - 35 * Math.sin(jumpProgress * Math.PI);
            
            // Inicia flap se não estiver animando
            if (!isAnimating || currentAnimation !== 'flap') {
                startAnimation('flap');
            }
        }
        
        // IMPORTANTE: continua para atualizar os frames da animação
        // NÃO retorna aqui!
    }
    
    // ========== ATUALIZAÇÃO DOS FRAMES DA ANIMAÇÃO ==========
    // Isso roda SEMPRE, independente de estar pulando ou não
    if (now - lastAnimationFrame >= EAGLE_ANIMATION_DELAY) {
        lastAnimationFrame = now;
        
        if (isAnimating) {
            animationFrame++;
            
            if (currentAnimation === 'flap') {
                if (animationFrame >= eagleImages.flap.length) {
                    animationFrame = 0;
                }
                console.log("🎬 Flap frame:", animationFrame);
            }
            else if (currentAnimation === 'celebrate') {
                if (animationFrame >= eagleImages.celebrate.length) {
                    // não faz nada, o setTimeout controla
                }
                console.log("🎬 Celebrate frame:", animationFrame);
            }
            else if (currentAnimation === 'wrong') {
                if (animationFrame >= eagleImages.wrong.length) {
                    stopAnimation();
                }
            }
        }
    }
}



function drawEagle() {
    if (!DOM.ctx) return;
    
    DOM.ctx.clearRect(0, 0, 500, 250);
    
    let img = eagleImages.idle;
    
    if (currentAnimation === 'flap' && eagleImages.flap[animationFrame]) {
        img = eagleImages.flap[animationFrame];
    }
    else if (currentAnimation === 'celebrate' && eagleImages.celebrate[animationFrame]) {
        img = eagleImages.celebrate[animationFrame];
    }
    else if (currentAnimation === 'wrong' && eagleImages.wrong[animationFrame]) {
        img = eagleImages.wrong[animationFrame];
    }
    
    if (img && img.complete && img.naturalHeight > 0) {
        DOM.ctx.save();
        DOM.ctx.translate(eagleX, eagleY);
        if (eagleDirection === 1) DOM.ctx.scale(-1, 1);
        DOM.ctx.scale(1.2, 1);
        
        let size = currentAnimation === 'flap' ? 165 : 150;
        DOM.ctx.drawImage(img, -size/2, -size, size, size);
        DOM.ctx.restore();
    }
}

function startAnimation(type) { 
    console.log('🎬 Starting animation:', type, 'frame:', animationFrame);
    currentAnimation = type; 
    animationFrame = 0; 
    isAnimating = true; 
    lastAnimationFrame = Date.now();
}

function stopAnimation() { 
    currentAnimation = 'idle'; 
    animationFrame = 0; 
    isAnimating = false; 
}

function jumpToPlatform(idx) { 
    eagleTargetX = PLATFORM_POSITIONS[idx]; 
    isJumping = true; 
    jumpProgress = 0; 
    eagleDirection = eagleTargetX > eagleX ? 1 : -1; 
    startAnimation('flap');
}

function resetEagle() { 
    eagleX = 250; 
    eagleY = 200; 
    isJumping = false; 
    jumpProgress = 0; 
    currentAnimation = 'idle'; 
    animationFrame = 0; 
    isAnimating = false; 
    eagleDirection = -1; 
    isWaiting = false;
}

// ============================================
// 11. GAME MECÂNICAS
// ============================================

function handlePlatformClick(e) {
    const btn = e.currentTarget, idx = parseInt(btn.dataset.index);
    if (!gameActive || answered || !currentNumber || isWaiting) return;
    
    if (parseInt(btn.dataset.value) === currentNumber.value) {
        const roundScore = calculateRoundScore();
        streak++;
        multiplier = Math.min(streak, SCORE_CONFIG.MAX_STREAK);
        score += roundScore.total;
        
        btn.classList.add('correct');
        updateScore();
        updateMultiplier();
        updateHighScore();
        playSound('correct');
        
        showScorePopup(roundScore.total, roundScore.timeBonus);
        
        answered = true;
        DOM.platforms.forEach(p => p.disabled = true);
        
        if (PLATFORM_POSITIONS[idx] === eagleX) {
            isWaiting = true;
            startAnimation('celebrate');
            setTimeout(() => {
                stopAnimation();
                isWaiting = false;
                nextRound();
            }, 300);
        } else {
            jumpToPlatform(idx);
        }
    } else {
        btn.classList.add('wrong');
        streak = 0;
        multiplier = 1;
        updateMultiplier();
        playSound('wrong');
        startAnimation('wrong');
        loseLife();
        setTimeout(() => btn.classList.remove('wrong'), 300);
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        if (gameActive) {
            currentTime = Math.floor((Date.now() - startTime) / 1000);
            if (DOM.timer) {
                let mins = Math.floor(currentTime / 60);
                let secs = currentTime % 60;
                DOM.timer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }
    }, MOBILE_CONFIG.timerInterval);
}

function stopTimer() { 
    if (timerInterval) { 
        clearInterval(timerInterval); 
        timerInterval = null; 
    } 
    endTime = currentTime; 
}

function updateMultiplier() { if (DOM.multiplier) DOM.multiplier.textContent = `${multiplier}x`; }
function updateScore() { if (DOM.score) DOM.score.textContent = score; }

function updateLives() {
    if (!DOM.lives) return;
    DOM.lives.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        let circle = document.createElement('span');
        circle.className = `life-circle ${i < lives ? 'full' : 'empty'}`;
        DOM.lives.appendChild(circle);
    }
}

function updateHighScore() {
    if (score > highScores[currentGame]) {
        highScores[currentGame] = score;
        if (DOM.highScore) DOM.highScore.textContent = score;
    }
}

function gameOver() {
    if (gameEnded) return;
    gameActive = false; 
    gameEnded = true; 
    stopTimer();
    playSound('gameOver');
    DOM.platforms.forEach(p => p.disabled = true);
    setTimeout(() => { 
        if (DOM.wordDisplay) DOM.wordDisplay.textContent = 'GAME OVER'; 
        addRestartButton(); 
    }, 1000);
}

function winGame() {
    if (gameEnded) return;
    
    const totalGameTime = endTime || currentTime;
    let speedBonus = 1.0;
    
    if (totalGameTime <= 22) speedBonus = 2.4;
    else if (totalGameTime <= 30) speedBonus = 2.2;
    else if (totalGameTime <= 45) speedBonus = 1.8;
    else if (totalGameTime <= 65) speedBonus = 1.5;
    else if (totalGameTime <= 90) speedBonus = 1.2;
    else speedBonus = 1.0;
    
    const lifeBonus = 1 + (lives * 0.2);
    const finalScore = Math.floor(score * speedBonus * lifeBonus);
    
    gameActive = false;
    gameEnded = true;
    stopTimer();
    playSound('win');
    DOM.platforms.forEach(p => p.disabled = true);
    
    setTimeout(() => {
        showNameEntryModal(finalScore, currentGame);
    }, 500);
    
    showWinWithBonus();
}

function loseLife() { 
    if (lives > 0) { 
        lives--; 
        updateLives(); 
        if (lives === 0) gameOver(); 
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
    if (DOM.wordDisplay) DOM.wordDisplay.textContent = currentNumber.word;
    setupPlatforms();
    answered = false;
    isWaiting = false;
    currentAnimation = 'idle'; 
    animationFrame = 0; 
    isAnimating = false;
    DOM.platforms.forEach(p => { 
        p.classList.remove('correct', 'wrong'); 
        p.disabled = false; 
    });
    
    roundStartTime = Date.now();
    setTimeout(playAudio, MOBILE_CONFIG.tapDelay);
}

function setupPlatforms() {
    const correctValue = currentNumber.value;
    let options = [correctValue];
    let possibleValues = currentNumbers.map(n => n.value);
    
    while (options.length < 3) {
        const randomIndex = Math.floor(Math.random() * possibleValues.length);
        const randomValue = possibleValues[randomIndex];
        if (!options.includes(randomValue) && randomValue !== correctValue) {
            options.push(randomValue);
        }
    }
    
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    DOM.platforms.forEach((p, i) => {
        p.textContent = options[i];
        p.dataset.value = options[i];
    });
}

function showWinWithBonus() {
    let winScreen = document.createElement('div');
    winScreen.className = 'win-screen';
    winScreen.innerHTML = `
        <h2>🎉 YOU WIN! 🎉</h2>
        <div class="win-stats">
            <p>⏱️ Time: ${DOM.timer.textContent}</p>
            <p>💰 Score: ${score}</p>
            <button class="restart-btn">PLAY AGAIN</button>
        </div>
    `;
    
    DOM.game.appendChild(winScreen);
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
    DOM.platforms.forEach(p => { 
        p.textContent = '?'; 
        p.disabled = true; 
        p.classList.remove('correct', 'wrong'); 
    });
    if (DOM.wordDisplay) DOM.wordDisplay.textContent = 'Ready?';
    if (DOM.instructions) DOM.instructions.textContent = '👆 Click START to begin';
    if (DOM.gameStats) DOM.gameStats.style.display = 'none';
    if (DOM.startButton) { 
        DOM.startButton.style.display = 'block'; 
        DOM.startButton.disabled = false; 
    }
    DOM.game.classList.remove('game-active');
    DOM.menu.style.display = 'block';
    DOM.game.style.display = 'none';
}

function removeRestartButton() { document.querySelector('.restart-btn')?.remove(); }
function removeWinScreen() { document.querySelector('.win-screen')?.remove(); }

function addRestartButton() {
    removeRestartButton(); 
    removeWinScreen();
    let btn = document.createElement('button');
    btn.className = 'restart-btn';
    btn.textContent = 'PLAY AGAIN';
    btn.addEventListener('click', () => { 
        btn.remove(); 
        showMenu(); 
    });
    DOM.game.appendChild(btn);
}

function resetGame() {
    // Embaralha todos os números do modo atual
    const shuffled = [...currentNumbers];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Sempre 10 perguntas, mas se tiver menos números, usa todos
    const questionsCount = Math.min(10, shuffled.length);
    availableNumbers = shuffled.slice(0, questionsCount);
    
    console.log(`🔄 Reset game: ${currentGame}`);
    console.log(`   Total numbers available: ${currentNumbers.length}`);
    console.log(`   Questions in this game: ${availableNumbers.length}`);
    if (availableNumbers.length > 0) {
        console.log(`   First question: ${availableNumbers[0].value} - ${availableNumbers[0].word}`);
    }
    
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

function startGame() {
    gameActive = true;
    DOM.game.classList.add('game-active');
    if (DOM.startButton) DOM.startButton.style.display = 'none';
    if (DOM.gameStats) DOM.gameStats.style.display = 'flex';
    if (DOM.instructions) DOM.instructions.textContent = '👆 Click the number';
    resetGame();
    startTimer();
}

function toggleAudio() {
    isAudioMuted = !isAudioMuted;
    if (DOM.speakerToggle) DOM.speakerToggle.textContent = isAudioMuted ? '🔇' : '🔊';
}

// ============================================
// 12. SELEÇÃO DE JOGO
// ============================================

window.selectGame = function(gameType) {
    currentGame = gameType;
    
    const modeMap = {
        'numbers': gameData.numbers,
        'numbers11-20': gameData.numbers11_20,
        'tens': gameData.tens,
        'hundreds': gameData.hundreds,
        'thousands': gameData.thousands,           // NOVO
        'random21_99': gameData.random21_99,
        'random101_999': gameData.random101_999,
        'random1001_9999': gameData.random1001_9999,
        'mixedAdvanced': gameData.mixedAdvanced
    };
    
    currentNumbers = modeMap[gameType] || gameData.numbers;
    
    console.log(`📊 Game mode: ${gameType} - ${currentNumbers.length} numbers available`);
    
    const currentHighScore = highScores[gameType] || 0;
    if (DOM.highScore) DOM.highScore.textContent = currentHighScore;
    
    gameActive = false;
    stopTimer();
    removeWinScreen();
    removeRestartButton();
    resetEagle();
    
    DOM.platforms.forEach(p => { 
        p.textContent = '?'; 
        p.disabled = true; 
        p.classList.remove('correct', 'wrong'); 
    });
    if (DOM.wordDisplay) DOM.wordDisplay.textContent = 'Ready?';
    if (DOM.instructions) DOM.instructions.textContent = '👆 Click START to begin';
    if (DOM.gameStats) DOM.gameStats.style.display = 'none';
    if (DOM.startButton) { 
        DOM.startButton.style.display = 'block'; 
        DOM.startButton.disabled = false; 
    }
    DOM.game.classList.remove('game-active');
    
    DOM.menu.style.display = 'none';
    DOM.game.style.display = 'block';
};

// ============================================
// 13. INICIAR O JOGO
// ============================================

function initGame() {
    console.log('Game starting...');
    
    if (DOM.canvas) {
        DOM.canvas.width = 500;
        DOM.canvas.height = 250;
    }
    
    loadImages();
    audioPlayer = new Audio();
    
    DOM.menuButton?.addEventListener('click', showMenu);
    DOM.speakerToggle?.addEventListener('click', toggleAudio);
    DOM.startButton?.addEventListener('click', startGame);
    DOM.platforms.forEach(p => p.addEventListener('click', handlePlatformClick));
    
    const leaderboardBtn = document.getElementById('global-rankings-btn');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            console.log("Botão Rankings clicado!");
            showLeaderboardModal();
        });
    }
    
    animate();
}

window.addEventListener('load', () => {
    setTimeout(() => {
        initGame();
    }, 100);
});