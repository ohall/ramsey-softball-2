document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const startButton = document.getElementById('start-game');
    const ballElement = document.getElementById('ball');
    const batterElement = document.getElementById('batter');
    const scoreElement = document.getElementById('score-value');
    const inningElement = document.getElementById('inning-value');
    const outsElement = document.getElementById('outs-value');
    const feedbackMessage = document.getElementById('feedback-message');
    const chantBubble = document.getElementById('chant-bubble');
    const field = document.getElementById('field');
    const soundToggle = document.getElementById('sound-toggle');
    const crowdLayer = document.getElementById('crowd-layer');
    
    // Sound elements
    const soundHit = document.getElementById('sound-hit');
    const soundSwing = document.getElementById('sound-swing');
    const soundCheer = document.getElementById('sound-cheer');
    const soundHomerun = document.getElementById('sound-homerun');
    
    // Create and add field background
    const fieldBackground = document.createElement('div');
    fieldBackground.id = 'field-background';
    field.appendChild(fieldBackground);
    
    // Create and add base paths
    const basePaths = document.createElement('div');
    basePaths.id = 'base-paths';
    field.appendChild(basePaths);
    
    // Create bases
    for (let i = 1; i <= 3; i++) {
        const base = document.createElement('div');
        base.className = 'base';
        base.id = `base-${i}`;
        field.appendChild(base);
    }
    
    // Game state
    let gameActive = false;
    let score = 0;
    let inning = 1;
    let outs = 0;
    let pitchInProgress = false;
    let swingTiming = 0; // 0 = not swinging, 1-5 = timing quality (5 is perfect)
    let soundEnabled = true;
    
    // Chants from the dugout
    const dugoutChants = [
        "Hey batter, batter, SWING!",
        "We need a hit, we need a hit!",
        "Rally caps on!",
        "Eyes on the ball!",
        "You got this!",
        "Pitcher's got nothing!",
        "Hey now, hey now, hey now batter!",
        "Who's house? OUR HOUSE!",
        "Defense falling asleep!",
        "Let's go Ramsey!",
        "Hey number 12, the plate is over here!",
        "Pitcher's rattled!",
        "She's got nothing!",
        "Wait for your pitch!",
        "Make 'em pay!"
    ];
    
    // Initialize game
    startButton.addEventListener('click', startGame);
    
    // Mobile touch controls
    field.addEventListener('touchstart', handleTouchStart);
    field.addEventListener('touchend', handleTouchEnd);
    
    // Desktop keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            if (gameActive && pitchInProgress) {
                handleTouchStart(e);
            } else if (!gameActive) {
                startGame();
            }
        }
    });
    
    // Desktop mouse controls
    field.addEventListener('click', handleTouchStart);
    
    // Sound toggle control
    soundToggle.addEventListener('click', toggleSound);
    
    // Start the game
    function startGame() {
        if (gameActive) return;
        
        gameActive = true;
        startButton.textContent = 'At Bat';
        resetGame();
        showFeedback('Play ball!');
        
        // Start first pitch after a short delay
        setTimeout(() => {
            if (gameActive) throwPitch();
        }, 1500);
    }
    
    // Reset game state
    function resetGame() {
        score = 0;
        inning = 1;
        outs = 0;
        updateScoreboard();
    }
    
    // Update the scoreboard display
    function updateScoreboard() {
        scoreElement.textContent = score;
        inningElement.textContent = inning;
        outsElement.textContent = outs;
    }
    
    // Display feedback message
    function showFeedback(message, duration = 2000) {
        feedbackMessage.textContent = message;
        setTimeout(() => {
            if (feedbackMessage.textContent === message) {
                feedbackMessage.textContent = '';
            }
        }, duration);
    }
    
    // Toggle sound on/off
    function toggleSound() {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundToggle.textContent = '🔊';
            soundToggle.classList.remove('sound-off');
            soundToggle.classList.add('sound-on');
        } else {
            soundToggle.textContent = '🔇';
            soundToggle.classList.remove('sound-on');
            soundToggle.classList.add('sound-off');
        }
    }
    
    // Play a sound if enabled
    function playSound(sound, volume = 1.0) {
        if (!soundEnabled) return;
        
        sound.volume = volume;
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play error:', e));
    }
    
    // Show random dugout chant
    function showRandomChant() {
        // 30% chance to show a chant
        if (Math.random() > 0.3) return;
        
        const randomChant = dugoutChants[Math.floor(Math.random() * dugoutChants.length)];
        chantBubble.textContent = randomChant;
        chantBubble.classList.remove('hidden');
        
        // Position the chant bubble randomly on the left side
        const randomX = 10 + Math.random() * 30; // 10-40% from left
        const randomY = 40 + Math.random() * 30; // 40-70% from top
        
        chantBubble.style.left = `${randomX}%`;
        chantBubble.style.top = `${randomY}%`;
        
        // Remove the chant bubble after a delay
        setTimeout(() => {
            chantBubble.classList.add('hidden');
        }, 2000);
    }
    
    // Throw a pitch
    function throwPitch() {
        if (!gameActive || pitchInProgress) return;
        
        pitchInProgress = true;
        swingTiming = 0;
        ballElement.style.visibility = 'visible';
        
        // Random pitch speed (affects animation duration)
        const pitchSpeed = 1200 + Math.random() * 400; // 1200-1600ms (slower to give more reaction time)
        
        // Random pitch curve (left/right movement)
        const curveFactor = Math.random() * 30 - 15; // -15 to 15
        ballElement.style.animation = `pitch ${pitchSpeed/1000}s cubic-bezier(0.42, 0, 0.58, 1.0) forwards`; // Changed to ease-in-out
        
        // Add curve ball effect
        ballElement.style.transform = `translate(calc(-50% + ${curveFactor}px), -50%)`;
        
        // Show a random chant
        showRandomChant();
        
        // Check swing timing at the end of pitch
        setTimeout(() => {
            if (pitchInProgress) {
                // Missed the pitch
                pitchResult(0);
            }
        }, pitchSpeed);
    }
    
    // Handle touch start event (swing preparation)
    function handleTouchStart(e) {
        if (!gameActive || !pitchInProgress) return;
        e.preventDefault();
        
        // Play swing sound
        playSound(soundSwing, 0.7);
        
        // Start swing animation
        batterElement.style.animation = 'swing 0.3s forwards';
        
        // Calculate swing timing based on ball position
        const ballRect = ballElement.getBoundingClientRect();
        const homeRect = document.getElementById('home-plate').getBoundingClientRect();
        
        // Calculate vertical distance - how close the ball is to home plate
        // A positive value means the ball is above the plate, negative means it's past the plate
        const verticalDistance = homeRect.top - ballRect.bottom;
        
        // Calculate the optimal hit range (normalized to 0-1)
        // The closer to 0, the better the timing
        const normalizedDistance = Math.abs(verticalDistance) / 100;
        const timingScore = Math.max(0, 1 - normalizedDistance);
        
        // Convert timing score to swing timing quality (1-5)
        if (timingScore > 0.9) swingTiming = 5; // Perfect
        else if (timingScore > 0.7) swingTiming = 4; // Great
        else if (timingScore > 0.5) swingTiming = 3; // Good
        else if (timingScore > 0.3) swingTiming = 2; // Fair
        else swingTiming = 1; // Poor
        
        // Add debug info if needed
        // console.log(`Ball position: ${ballRect.top}, Plate position: ${homeRect.top}, Distance: ${verticalDistance}, Timing: ${swingTiming}`);
        
        // Process hit result
        pitchResult(swingTiming);
    }
    
    // Handle touch end event (reset swing animation)
    function handleTouchEnd(e) {
        if (!gameActive) return;
        e.preventDefault();
        
        // Reset swing animation after delay
        setTimeout(() => {
            batterElement.style.animation = 'none';
        }, 300);
    }
    
    // Process pitch result based on swing timing
    function pitchResult(timing) {
        if (!pitchInProgress) return;
        pitchInProgress = false;
        
        // Stop pitch animation
        ballElement.style.animation = 'none';
        
        if (timing === 0) {
            // Missed swing (didn't swing at all)
            showFeedback('Strike!');
            outs++;
            checkInningOver();
        } else {
            // Handle different hit qualities based on timing
            let hitResult;
            
            if (timing === 5) { // Perfect hit
                const homeRunChance = 0.4; // 40% chance of home run with perfect timing
                if (Math.random() < homeRunChance) {
                    hitResult = 'home run';
                    ballElement.style.animation = 'homeRun 1.5s forwards';
                    showFeedback('HOME RUN! 🎉');
                    playSound(soundHomerun);
                    crowdLayer.classList.add('crowd-cheer');
                    setTimeout(() => crowdLayer.classList.remove('crowd-cheer'), 3000);
                    score += Math.floor(Math.random() * 3) + 1; // 1-3 runs
                } else {
                    hitResult = 'triple';
                    ballElement.style.animation = 'hit 1s forwards';
                    showFeedback('Triple! 🔥');
                    playSound(soundHit, 0.9);
                    playSound(soundCheer, 0.5);
                    score += 1;
                }
            } else if (timing === 4) { // Great hit
                if (Math.random() < 0.6) {
                    hitResult = 'double';
                    ballElement.style.animation = 'hit 0.8s forwards';
                    showFeedback('Double! 👏');
                    playSound(soundHit, 0.8);
                    playSound(soundCheer, 0.3);
                    score += 1;
                } else {
                    hitResult = 'single';
                    ballElement.style.animation = 'hit 0.6s forwards';
                    showFeedback('Single! ✓');
                    playSound(soundHit, 0.7);
                    score += Math.random() < 0.3 ? 1 : 0; // 30% chance to score a run
                }
            } else if (timing === 3) { // Good hit
                if (Math.random() < 0.7) {
                    hitResult = 'single';
                    ballElement.style.animation = 'hit 0.6s forwards';
                    showFeedback('Single! ✓');
                    playSound(soundHit, 0.6);
                    score += Math.random() < 0.2 ? 1 : 0; // 20% chance to score a run
                } else {
                    hitResult = 'foul';
                    ballElement.style.animation = 'hit 0.5s forwards';
                    showFeedback('Foul ball!');
                    playSound(soundHit, 0.5);
                }
            } else if (timing === 2) { // Fair hit
                if (Math.random() < 0.6) {
                    hitResult = 'foul';
                    ballElement.style.animation = 'hit 0.5s forwards';
                    showFeedback('Foul ball!');
                    playSound(soundHit, 0.4);
                } else {
                    hitResult = 'out';
                    ballElement.style.animation = 'hit 0.6s forwards';
                    showFeedback('Out!');
                    playSound(soundHit, 0.3);
                    outs++;
                    checkInningOver();
                }
            } else { // Poor hit
                hitResult = 'out';
                ballElement.style.animation = 'hit 0.4s forwards';
                showFeedback('Out!');
                playSound(soundHit, 0.2);
                outs++;
                checkInningOver();
            }
        }
        
        updateScoreboard();
        
        // Next pitch after delay if game is still active
        setTimeout(() => {
            ballElement.style.visibility = 'hidden';
            ballElement.style.animation = 'none';
            ballElement.style.transform = 'translate(-50%, -50%)';
            
            if (gameActive) {
                throwPitch();
            }
        }, 1500);
    }
    
    // Check if inning is over (3 outs)
    function checkInningOver() {
        if (outs >= 3) {
            outs = 0;
            inning++;
            if (inning > 7) { // Game over after 7 innings
                endGame();
            } else {
                showFeedback(`Inning ${inning} - Ramsey Softball up to bat!`);
            }
        }
    }
    
    // End the game
    function endGame() {
        gameActive = false;
        startButton.textContent = 'Play Again';
        showFeedback(`Game Over! Final Score: ${score}`, 5000);
    }
});
