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
        this.timerInterval = null;
        this.gameActive = false;
        this.levelResults = [];

        // DOM element cache for performance
        this.dom = {
            startScreen: null,
            gameScreen: null,
            resultScreen: null,
            levelIndicator: null,
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
    }

    /**
     * Cache DOM elements for performance
     */
    cacheDomElements() {
        this.dom.startScreen = document.getElementById('startScreen');
        this.dom.gameScreen = document.getElementById('gameScreen');
        this.dom.resultScreen = document.getElementById('resultScreen');
        this.dom.levelIndicator = document.getElementById('levelIndicator');
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
     * Initialize progress bar with 20 levels
     */
    initProgressBar() {
        const progressGrid = this.dom.progressGrid;
        progressGrid.innerHTML = '';
        for (let i = 0; i < 20; i++) {
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
        const levelScore = this.currentLevel * 5;

        // Update UI
        this.dom.levelIndicator.textContent = `Level ${this.currentLevel}`;
        this.dom.numberDisplay.textContent = '';
        this.dom.inputArea.style.display = 'none';
        this.dom.answerInput.value = '';

        // Highlight current level
        document.querySelectorAll('.level-box').forEach(box => {
            box.classList.remove('current');
        });
        document.getElementById(`level-${this.currentLevel - 1}`).classList.add('current');

        // Generate random number
        const digits = this.currentLevel;
        this.currentNumber = this.generateRandomNumber(digits);

        // Show number
        this.showNumber();
    }

    /**
     * Generate a random number with specified digit count
     */
    generateRandomNumber(digits) {
        let number = '';
        for (let i = 0; i < digits; i++) {
            if (i === 0) {
                number += Math.floor(Math.random() * 9) + 1; // First digit is not 0
            } else {
                number += Math.floor(Math.random() * 10);
            }
        }
        return number;
    }

    /**
     * Show number and start countdown
     */
    showNumber() {
        this.dom.numberDisplay.textContent = this.currentNumber;
        this.dom.timerFill.style.width = '100%';

        const totalTime = 5; // 5 seconds total
        const startTime = performance.now(); // Use performance.now() for precise timing

        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            try {
                const elapsed = (performance.now() - startTime) / 1000;
                const timeLeft = Math.max(0, totalTime - elapsed);
                const percentage = (timeLeft / totalTime) * 100;
                this.dom.timerFill.style.width = percentage + '%';

                if (timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                    this.hideNumber();
                }
            } catch (error) {
                console.error('Timer error:', error);
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }, 100);
    }

    /**
     * Hide number, show input box
     */
    hideNumber() {
        this.dom.numberDisplay.textContent = '?';
        this.dom.inputArea.style.display = 'flex';
        this.dom.answerInput.focus();
        this.dom.timerFill.style.width = '0%';
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
        const expectedLength = this.currentLevel;
        if (userAnswer.length !== expectedLength) {
            this.showError(`Expected ${expectedLength} digits`);
            return;
        }

        const isCorrect = userAnswer === this.currentNumber;
        const levelScore = this.currentLevel * 5;

        // Hide input area immediately to prevent multiple submissions
        this.dom.inputArea.style.display = 'none';

        // Show feedback
        this.showFeedback(isCorrect);

        // Update progress bar
        const levelBox = document.getElementById(`level-${this.currentLevel - 1}`);
        levelBox.classList.remove('current');
        if (isCorrect) {
            levelBox.classList.add('correct');
            this.totalScore += levelScore;
            this.levelResults.push({ level: this.currentLevel, correct: true, score: levelScore });
        } else {
            levelBox.classList.add('incorrect');
            this.levelResults.push({ level: this.currentLevel, correct: false, score: 0 });
        }

        // Check if game is over
        if (this.currentLevel >= 20) {
            setTimeout(() => this.showResult(), 1500);
        } else {
            setTimeout(() => this.startLevel(), 1500);
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
    showResult() {
        this.gameActive = false;

        this.dom.gameScreen.style.display = 'none';
        this.dom.resultScreen.style.display = 'block';
        this.dom.scoreDisplay.textContent = `${this.totalScore} points`;

        // Evaluate performance
        let performance, performanceClass;
        const correctCount = this.levelResults.filter(r => r.correct).length;

        if (this.totalScore >= 840) {
            performance = '🏆 Excellent! Outstanding memory!';
            performanceClass = 'excellent';
        } else if (this.totalScore >= 600) {
            performance = '👍 Good! Keep it up!';
            performanceClass = 'good';
        } else {
            performance = '💪 Normal! Practice more!';
            performanceClass = 'normal';
        }

        const performanceElement = this.dom.performance;
        performanceElement.textContent = performance;
        performanceElement.className = `performance ${performanceClass}`;
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
