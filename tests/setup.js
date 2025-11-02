/**
 * Jest Setup File
 * This file runs before each test file
 */

// Mock performance.now for timer tests
global.performance = {
  now: () => Date.now()
};

// Mock IntersectionObserver for animations
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock ResizeObserver for responsive design
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
};
