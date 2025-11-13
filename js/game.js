/**
 * ============================================
 * Digit Span Test - Main Game Logic
 * ============================================
 */

'use strict';

/**
 * Game Class - Encapsulates all game logic
 */
class DigitSpanGame {
    constructor() {
        // Game state
        this.currentLevel = 0;
        this.totalScore = 0;
        this.currentNumber = '';
        this.sequence = [];
        this.maxLevel = 12;
        this.timerInterval = null;
        this.gameActive = false;
        this.levelResults = [];

        // Share functionality
        this.shareManager = null;
        this.shareData = null;

        // DOM element cache for performance
        this.dom = {
            startScreen: null,
            gameScreen: null,
            resultScreen: null,
            levelIndicator: null,
            currentScore: null,
            numberDisplay: null,
            timerFill: null,
            inputArea: null,
            answerInput: null,
            submitBtn: null,
            scoreDisplay: null,
            performance: null,
            progressGrid: null
        };
    }

    /**
     * Initialize the game
     */
    init() {
        this.cacheDomElements();
        this.initProgressBar();
        this.setupEventListeners();
        this.initShareManager();
    }

    /**
     * Initialize share manager
     */
    initShareManager() {
        if (window.ShareCardGenerator && window.ShareManager) {
            const generator = new ShareCardGenerator();
            this.shareManager = new ShareManager();
            this.shareManager.init(generator);
        } else {
            console.warn('Share modules not loaded');
        }
    }

    /**
     * Cache DOM elements for performance
     */
    cacheDomElements() {
        this.dom.startScreen = document.getElementById('startScreen');
        this.dom.gameScreen = document.getElementById('gameScreen');
        this.dom.resultScreen = document.getElementById('resultScreen');
        this.dom.levelIndicator = document.getElementById('levelIndicator');
        this.dom.currentScore = document.getElementById('currentScore');
        this.dom.numberDisplay = document.getElementById('numberDisplay');
        this.dom.timerFill = document.getElementById('timerFill');
        this.dom.inputArea = document.getElementById('inputArea');
        this.dom.answerInput = document.getElementById('answerInput');
        this.dom.submitBtn = document.getElementById('submitBtn');
        this.dom.scoreDisplay = document.getElementById('scoreDisplay');
        this.dom.performance = document.getElementById('performance');
        this.dom.progressGrid = document.getElementById('progressGrid');

        // Verify all elements were found
        const missingElements = [];
        for (const [key, value] of Object.entries(this.dom)) {
            if (!value) {
                missingElements.push(key);
            }
        }

        if (missingElements.length > 0) {
            console.error('Missing DOM elements:', missingElements);
            alert('Error: Some elements could not be loaded. Please refresh the page.');
        }
    }

    /**
     * Initialize progress bar with 12 levels
     */
    initProgressBar() {
        const progressGrid = this.dom.progressGrid;
        progressGrid.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const levelBox = document.createElement('div');
            levelBox.className = 'level-box';
            levelBox.textContent = i + 1;
            levelBox.id = `level-${i}`;
            progressGrid.appendChild(levelBox);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Enter key submit functionality
        this.dom.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.gameActive && this.dom.inputArea.style.display === 'flex') {
                this.submitAnswer();
            }
        });
    }

    /**
     * Start a new game
     */
    startGame() {
        try {
            this.currentLevel = 0;
            this.totalScore = 0;
            this.levelResults = [];
            this.gameActive = true;

            this.initProgressBar();

            // Initialize score display
            this.dom.currentScore.textContent = '0';

            this.dom.startScreen.style.display = 'none';
            this.dom.gameScreen.style.display = 'flex';
            this.dom.resultScreen.style.display = 'none';

            this.startLevel();
        } catch (error) {
            console.error('Error starting game:', error);
            alert('An error occurred while starting the game. Please refresh the page.');
        }
    }

    /**
     * Start the next level
     */
    startLevel() {
        if (!this.gameActive) return;

        this.currentLevel++;

        // Check if game is complete
        if (this.currentLevel > this.maxLevel) {
            this.showResult();
            return;
        }

        // Update UI
        this.dom.levelIndicator.textContent = `Level ${this.currentLevel}`;
        this.dom.currentScore.textContent = this.totalScore;
        this.dom.numberDisplay.textContent = '';
        this.dom.inputArea.style.display = 'none';
        this.dom.answerInput.value = '';

        // Highlight current level
        document.querySelectorAll('.level-box').forEach(box => {
            box.classList.remove('current');
        });
        document.getElementById(`level-${this.currentLevel - 1}`).classList.add('current');

        // Generate sequence (Level 1 = 2 digits, Level 2 = 3 digits, etc.)
        const sequenceLength = this.currentLevel + 1;
        this.sequence = this.generateSequence(sequenceLength);

        // Display sequence
        this.displaySequence();
    }

    /**
     * Generate a sequence of random digits
     */
    generateSequence(length) {
        const seq = [];
        for (let i = 0; i < length; i++) {
            seq.push(Math.floor(Math.random() * 10));
        }
        return seq;
    }

    /**
     * Display sequence digit by digit
     */
    displaySequence() {
        this.dom.inputArea.style.display = 'none';
        this.dom.numberDisplay.style.display = 'flex';

        let index = 0;
        const displayInterval = setInterval(() => {
            if (index < this.sequence.length) {
                this.dom.numberDisplay.textContent = this.sequence[index];
                this.dom.numberDisplay.classList.add('fade');
                setTimeout(() => this.dom.numberDisplay.classList.remove('fade'), 500);
                index++;
            } else {
                clearInterval(displayInterval);
                this.showInput();
            }
        }, 1000);
    }

    /**
     * Show input box after sequence display
     */
    showInput() {
        this.dom.numberDisplay.style.display = 'none';
        this.dom.inputArea.style.display = 'flex';
        this.dom.answerInput.value = '';
        this.dom.answerInput.focus();
    }

    /**
     * Show error message
     */
    showError(message) {
        const answerInput = this.dom.answerInput;
        answerInput.style.borderColor = '#dc3545';
        answerInput.style.boxShadow = '0 0 10px rgba(220, 53, 69, 0.3)';
        answerInput.setAttribute('aria-invalid', 'true');

        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'polite');
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #dc3545; font-size: 14px; margin-top: 10px; text-align: center;';
        errorDiv.id = 'temp-error';

        const inputArea = this.dom.inputArea;
        // Remove existing error message
        const existingError = document.getElementById('temp-error');
        if (existingError) existingError.remove();

        inputArea.appendChild(errorDiv);

        // Reset input styling after delay
        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.boxShadow = '';
            answerInput.setAttribute('aria-invalid', 'false');
            const tempError = document.getElementById('temp-error');
            if (tempError) tempError.remove();
        }, 2000);
    }

    /**
     * Submit answer
     */
    submitAnswer() {
        if (!this.gameActive) return;

        // Prevent multiple submissions
        if (this.dom.inputArea.style.display !== 'flex') return;

        const userAnswerInput = this.dom.answerInput;
        let userAnswer = userAnswerInput.value.trim();

        // Strict validation: only allow digits
        if (userAnswer === '') {
            this.showError('Please enter the number');
            return;
        }

        // Validate input contains only digits
        const digitRegex = /^[0-9]+$/;
        if (!digitRegex.test(userAnswer)) {
            this.showError('Only numbers are allowed');
            userAnswerInput.value = userAnswer.replace(/[^0-9]/g, '');
            return;
        }

        // Validate length matches expected digit count
        const expectedLength = this.sequence.length;
        if (userAnswer.length !== expectedLength) {
            this.showError(`Expected ${expectedLength} digits`);
            return;
        }

        // Convert sequence array to string for comparison (forward order)
        const correctAnswer = this.sequence.join('');
        const isCorrect = userAnswer === correctAnswer;

        // Hide input area immediately to prevent multiple submissions
        this.dom.inputArea.style.display = 'none';

        // Show feedback
        this.showFeedback(isCorrect);

        // Update progress bar
        const levelBox = document.getElementById(`level-${this.currentLevel - 1}`);
        levelBox.classList.remove('current');
        if (isCorrect) {
            levelBox.classList.add('correct');
            const levelScore = this.currentLevel * 5;
            this.totalScore += levelScore;
            this.levelResults.push({ level: this.currentLevel, correct: true, score: levelScore });

            // Update real-time score display with animation
            this.animateScoreUpdate(levelScore);

            // Proceed to next level
            setTimeout(() => this.startLevel(), 1500);
        } else {
            levelBox.classList.add('incorrect');
            this.levelResults.push({ level: this.currentLevel, correct: false, score: 0 });

            // End game immediately on incorrect answer
            setTimeout(() => this.showResult(), 1500);
        }
    }

    /**
     * Show feedback
     */
    showFeedback(isCorrect) {
        const feedback = document.createElement('div');
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.setAttribute('role', 'alert');
        feedback.setAttribute('aria-live', 'assertive');
        feedback.textContent = isCorrect ? '✓ Correct!' : '✗ Wrong!';

        document.querySelector('.game-area').appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 1000);
    }

    /**
     * Show final result
     */
    /**
     * Animate score update for better user feedback
     */
    animateScoreUpdate(scoreIncrease) {
        const scoreElement = this.dom.currentScore;
        const currentScore = parseInt(scoreElement.textContent);
        const newScore = currentScore + scoreIncrease;

        // Add flash animation
        scoreElement.style.transition = 'none';
        scoreElement.style.transform = 'scale(1.3)';
        scoreElement.style.color = '#28a745';

        // Trigger reflow
        scoreElement.offsetHeight;

        // Animate to new value
        scoreElement.style.transition = 'all 0.5s ease';
        scoreElement.textContent = newScore;

        // Reset animation after delay
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
            scoreElement.style.color = 'white';
        }, 500);
    }

    showResult() {
        this.gameActive = false;

        this.dom.gameScreen.style.display = 'none';
        this.dom.resultScreen.style.display = 'block';
        this.dom.scoreDisplay.textContent = `${this.totalScore} points`;

        // Evaluate performance (adjusted for 510 max score)
        let performance, performanceClass, scoreLevel;
        const correctCount = this.levelResults.filter(r => r.correct).length;

        if (this.totalScore >= 400) {
            performance = '🏆 Excellent! Outstanding memory!';
            performanceClass = 'excellent';
            scoreLevel = 'Master';
        } else if (this.totalScore >= 250) {
            performance = '👍 Good! Keep it up!';
            performanceClass = 'good';
            scoreLevel = 'Excellent';
        } else if (this.totalScore >= 150) {
            performance = '👍 Good! Keep it up!';
            performanceClass = 'good';
            scoreLevel = 'Good';
        } else {
            performance = '💪 Normal! Practice more!';
            performanceClass = 'normal';
            scoreLevel = 'Beginner';
        }

        const performanceElement = this.dom.performance;
        performanceElement.textContent = performance;
        performanceElement.className = `performance ${performanceClass}`;

        // Prepare share data
        this.prepareShareData(scoreLevel, correctCount);
    }

    /**
     * Prepare data for sharing
     */
    prepareShareData(scoreLevel, correctCount) {
        if (!this.shareManager) return;

        const totalLevels = this.levelResults.length;
        const errorRate = totalLevels > 0
            ? Math.round(((totalLevels - correctCount) / totalLevels) * 100)
            : 0;

        const percentile = Math.min(95, Math.floor((this.totalScore / 510) * 100));

        this.shareData = {
            score: this.totalScore,
            scoreLevel: scoreLevel,
            percentile: percentile,
            errorRate: errorRate,
            completionTime: '4:20',
            suggestions: [
                'Continue training to improve memory capacity',
                'Try longer digit sequences for better results',
                'Practice regularly to maintain progress'
            ],
            chartData: {
                memoryScore: Math.min(100, Math.floor(this.totalScore / 5)),
                attentionScore: Math.min(100, Math.floor(this.totalScore / 6)),
                speedScore: Math.min(100, Math.floor(this.totalScore / 4))
            }
        };
    }

    /**
     * Show share options
     */
    showShareOptions() {
        if (!this.shareManager) {
            alert('Share feature is not available');
            return;
        }

        if (!this.shareData) {
            alert('No data to share');
            return;
        }

        this.shareManager.showShareOverlay(this.shareData);
    }

    /**
     * Restart game
     */
    restartGame() {
        this.startGame();
    }

    /**
     * Get game state (for testing)
     */
    getState() {
        return {
            currentLevel: this.currentLevel,
            totalScore: this.totalScore,
            currentNumber: this.currentNumber,
            gameActive: this.gameActive,
            levelResults: [...this.levelResults]
        };
    }
}

// Make global for HTML onclick handlers
window.game = new DigitSpanGame();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.game.init();
    });
} else {
    window.game.init();
}
