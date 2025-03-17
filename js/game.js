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
        const pitchSpeed = 800 + Math.random() * 400; // 800-1200ms
        
        // Random pitch curve (left/right movement)
        const curveFactor = Math.random() * 30 - 15; // -15 to 15
        ballElement.style.animation = `pitch ${pitchSpeed/1000}s cubic-bezier(0.42, 0, 1.0, 1.0) forwards`;
        
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
        
        // Start swing animation
        batterElement.style.animation = 'swing 0.3s forwards';
        
        // Calculate swing timing based on ball position
        const ballRect = ballElement.getBoundingClientRect();
        const homeRect = document.getElementById('home-plate').getBoundingClientRect();
        
        // Distance from ball to home plate (normalized 0-1, where 1 is perfect timing)
        const distanceToPlate = 1 - Math.min(1, Math.abs(ballRect.top - homeRect.top) / homeRect.top);
        
        // Convert distance to swing timing quality (1-5)
        if (distanceToPlate > 0.9) swingTiming = 5; // Perfect
        else if (distanceToPlate > 0.7) swingTiming = 4; // Great
        else if (distanceToPlate > 0.5) swingTiming = 3; // Good
        else if (distanceToPlate > 0.3) swingTiming = 2; // Fair
        else swingTiming = 1; // Poor
        
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
                    score += Math.floor(Math.random() * 3) + 1; // 1-3 runs
                } else {
                    hitResult = 'triple';
                    ballElement.style.animation = 'hit 1s forwards';
                    showFeedback('Triple! 🔥');
                    score += 1;
                }
            } else if (timing === 4) { // Great hit
                if (Math.random() < 0.6) {
                    hitResult = 'double';
                    ballElement.style.animation = 'hit 0.8s forwards';
                    showFeedback('Double! 👏');
                    score += 1;
                } else {
                    hitResult = 'single';
                    ballElement.style.animation = 'hit 0.6s forwards';
                    showFeedback('Single! ✓');
                    score += Math.random() < 0.3 ? 1 : 0; // 30% chance to score a run
                }
            } else if (timing === 3) { // Good hit
                if (Math.random() < 0.7) {
                    hitResult = 'single';
                    ballElement.style.animation = 'hit 0.6s forwards';
                    showFeedback('Single! ✓');
                    score += Math.random() < 0.2 ? 1 : 0; // 20% chance to score a run
                } else {
                    hitResult = 'foul';
                    ballElement.style.animation = 'hit 0.5s forwards';
                    showFeedback('Foul ball!');
                }
            } else if (timing === 2) { // Fair hit
                if (Math.random() < 0.6) {
                    hitResult = 'foul';
                    ballElement.style.animation = 'hit 0.5s forwards';
                    showFeedback('Foul ball!');
                } else {
                    hitResult = 'out';
                    ballElement.style.animation = 'hit 0.6s forwards';
                    showFeedback('Out!');
                    outs++;
                    checkInningOver();
                }
            } else { // Poor hit
                hitResult = 'out';
                ballElement.style.animation = 'hit 0.4s forwards';
                showFeedback('Out!');
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
