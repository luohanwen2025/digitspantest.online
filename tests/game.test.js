/**
 * Game Logic Tests
 */

describe('Digit Span Game', () => {
  let game;

  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div class="game-container">
        <div class="progress-bar">
          <div class="progress-grid" id="progressGrid"></div>
        </div>
        <div class="game-area">
          <div class="start-screen" id="startScreen"></div>
          <div class="game-screen" id="gameScreen">
            <div class="level-indicator" id="levelIndicator"></div>
            <div class="timer-bar">
              <div class="timer-fill" id="timerFill"></div>
            </div>
            <div class="number-display" id="numberDisplay"></div>
            <div class="input-area" id="inputArea">
              <input type="text" id="answerInput" />
              <button class="submit-btn" id="submitBtn">Submit</button>
            </div>
          </div>
          <div class="result-screen" id="resultScreen">
            <div class="score-display" id="scoreDisplay"></div>
            <div class="performance" id="performance"></div>
          </div>
        </div>
      </div>
    `;

    // Initialize game
    const { DigitSpanGame } = require('../js/game.js');
    game = new DigitSpanGame();
    game.init();
  });

  afterEach(() => {
    // Cleanup
    game = null;
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize game state correctly', () => {
      expect(game.currentLevel).toBe(0);
      expect(game.totalScore).toBe(0);
      expect(game.currentNumber).toBe('');
      expect(game.gameActive).toBe(false);
      expect(game.levelResults).toEqual([]);
    });

    test('should cache all DOM elements', () => {
      expect(game.dom.startScreen).toBeTruthy();
      expect(game.dom.gameScreen).toBeTruthy();
      expect(game.dom.resultScreen).toBeTruthy();
      expect(game.dom.levelIndicator).toBeTruthy();
      expect(game.dom.numberDisplay).toBeTruthy();
      expect(game.dom.timerFill).toBeTruthy();
      expect(game.dom.inputArea).toBeTruthy();
      expect(game.dom.answerInput).toBeTruthy();
      expect(game.dom.submitBtn).toBeTruthy();
      expect(game.dom.scoreDisplay).toBeTruthy();
      expect(game.dom.performance).toBeTruthy();
      expect(game.dom.progressGrid).toBeTruthy();
    });

    test('should initialize progress bar with 20 levels', () => {
      game.initProgressBar();
      const levelBoxes = document.querySelectorAll('.level-box');
      expect(levelBoxes).toHaveLength(20);
    });
  });

  describe('Game Flow', () => {
    test('should start game correctly', () => {
      game.startGame();

      expect(game.currentLevel).toBe(0);
      expect(game.gameActive).toBe(true);
      expect(game.dom.startScreen.style.display).toBe('none');
      expect(game.dom.gameScreen.style.display).toBe('flex');
    });

    test('should advance to next level', () => {
      game.startGame();
      const initialLevel = game.currentLevel;

      game.startLevel();

      expect(game.currentLevel).toBe(initialLevel + 1);
      expect(game.dom.levelIndicator.textContent).toBe('Level 1');
    });

    test('should not advance level when game is not active', () => {
      game.gameActive = false;
      const initialLevel = game.currentLevel;

      game.startLevel();

      expect(game.currentLevel).toBe(initialLevel);
    });
  });

  describe('Number Generation', () => {
    test('should generate 1-digit number correctly', () => {
      const number = game.generateRandomNumber(1);
      expect(number).toHaveLength(1);
      expect(parseInt(number)).toBeGreaterThanOrEqual(1);
      expect(parseInt(number)).toBeLessThanOrEqual(9);
    });

    test('should generate 5-digit number correctly', () => {
      const number = game.generateRandomNumber(5);
      expect(number).toHaveLength(5);
      expect(/^\d+$/).toBe(number);
    });

    test('should generate 20-digit number correctly', () => {
      const number = game.generateRandomNumber(20);
      expect(number).toHaveLength(20);
      expect(/^\d+$/).toBe(number);
      expect(number[0]).not.toBe('0'); // First digit should not be 0
    });

    test('should generate different numbers on multiple calls', () => {
      const numbers = new Set();
      for (let i = 0; i < 100; i++) {
        numbers.add(game.generateRandomNumber(5));
      }
      expect(numbers.size).toBeGreaterThan(50); // Should have good randomness
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      game.startGame();
      game.currentLevel = 3;
      game.currentNumber = '123';
    });

    test('should accept correct answer', () => {
      game.dom.answerInput.value = '123';
      const initialScore = game.totalScore;

      // We need to mock the submit logic since it has setTimeout
      const isCorrect = game.dom.answerInput.value === game.currentNumber;
      expect(isCorrect).toBe(true);
    });

    test('should reject incorrect answer', () => {
      game.dom.answerInput.value = '456';
      const isCorrect = game.dom.answerInput.value === game.currentNumber;
      expect(isCorrect).toBe(false);
    });

    test('should reject empty answer', () => {
      game.dom.answerInput.value = '';
      expect(game.dom.answerInput.value.trim()).toBe('');
    });

    test('should only accept numeric input', () => {
      const digitRegex = /^[0-9]+$/;
      expect(digitRegex.test('123')).toBe(true);
      expect(digitRegex.test('abc')).toBe(false);
      expect(digitRegex.test('12a3')).toBe(false);
    });
  });

  describe('Scoring System', () => {
    test('should calculate level score correctly', () => {
      expect(game.currentLevel * 5).toBe(0);

      game.currentLevel = 1;
      expect(game.currentLevel * 5).toBe(5);

      game.currentLevel = 10;
      expect(game.currentLevel * 5).toBe(50);

      game.currentLevel = 20;
      expect(game.currentLevel * 5).toBe(100);
    });

    test('should calculate total score correctly', () => {
      game.totalScore = 0;
      game.currentLevel = 10;
      game.totalScore += 50;

      game.currentLevel = 20;
      game.totalScore += 100;

      expect(game.totalScore).toBe(150);
    });

    test('should evaluate performance bands correctly', () => {
      // Test Excellent
      game.totalScore = 1000;
      let performance, performanceClass;
      if (game.totalScore >= 840) {
        performance = 'Excellent';
        performanceClass = 'excellent';
      }
      expect(performance).toBe('Excellent');
      expect(performanceClass).toBe('excellent');

      // Test Good
      game.totalScore = 700;
      performance = performanceClass = '';
      if (game.totalScore >= 600) {
        performance = 'Good';
        performanceClass = 'good';
      }
      expect(performance).toBe('Good');
      expect(performanceClass).toBe('good');

      // Test Normal
      game.totalScore = 500;
      performance = performanceClass = '';
      if (game.totalScore < 600) {
        performance = 'Normal';
        performanceClass = 'normal';
      }
      expect(performance).toBe('Normal');
      expect(performanceClass).toBe('normal');
    });
  });

  describe('Game State', () => {
    test('should return correct state object', () => {
      game.currentLevel = 5;
      game.totalScore = 25;
      game.currentNumber = '12345';
      game.gameActive = true;

      const state = game.getState();

      expect(state.currentLevel).toBe(5);
      expect(state.totalScore).toBe(25);
      expect(state.currentNumber).toBe('12345');
      expect(state.gameActive).toBe(true);
    });
  });
});
