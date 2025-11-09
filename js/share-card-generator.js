/**
 * ShareCardGenerator - Beautiful Share Card Generator v2.0
 *
 * Features:
 * - Generate 1200x630px professional share cards
 * - Clean, modern design with proper typography
 * - No text overlap, no boundary overflow
 * - Website logo integration
 * - Support for PNG export
 * - 2x Retina high-definition support
 *
 * Tech Stack:
 * - Canvas API - Custom drawing
 */

const ShareCardData = {
  score: 0,              // Test score
  scoreLevel: '',        // Score level (Beginner/Good/Excellent/Master)
  percentile: 0,         // Percentile ranking
  errorRate: 0,          // Error rate percentage
  completionTime: '',    // Completion time
  suggestions: [],       // Improvement suggestions array
  chartData: {           // Chart data
    memoryScore: 0,      // Memory score
    attentionScore: 0,   // Attention score
    speedScore: 0        // Processing speed score
  }
};

class ShareCardGenerator {
  constructor(data = {}) {
    this.data = { ...ShareCardData, ...data };
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Modern card configuration
    this.config = {
      width: 1200,
      height: 630,
      dpr: window.devicePixelRatio || 1,
      padding: 50,

      // Color palette
      backgroundColor: '#ffffff',
      backgroundGradient: ['#f8fafc', '#e2e8f0'],
      primaryColor: '#4f46e5',      // Indigo 600
      primaryLight: '#6366f1',      // Indigo 500
      secondaryColor: '#8b5cf6',    // Violet 500
      accentColor: '#10b981',       // Emerald 500
      accentLight: '#34d399',       // Emerald 400
      successColor: '#22c55e',      // Green 500
      warningColor: '#f59e0b',      // Amber 500
      errorColor: '#ef4444',        // Red 500

      // Typography
      textColor: '#1e293b',         // Slate 800
      textSecondary: '#64748b',     // Slate 500
      textMuted: '#94a3b8',         // Slate 400

      // Layout
      sectionSpacing: 30,
      borderRadius: 20,
      shadow: 'rgba(0, 0, 0, 0.1)'
    };

    this.cache = new Map();
  }

  initCanvas() {
    const { width, height, dpr } = this.config;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  setData(data) {
    this.data = { ...this.data, ...data };
    return this;
  }

  getCacheKey() {
    return JSON.stringify(this.data);
  }

  async generate() {
    const cacheKey = this.getCacheKey();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    this.initCanvas();
    this.drawCard();
    const dataURL = this.canvas.toDataURL('image/png');
    this.cache.set(cacheKey, dataURL);
    return dataURL;
  }

  drawCard() {
    this.drawBackground();
    this.drawHeader();
    this.drawContent();
    this.drawFooter();
  }

  drawBackground() {
    const { width, height, backgroundGradient } = this.config;

    // Gradient background
    const gradient = this.createLinearGradient(
      0, 0, 0, height,
      backgroundGradient[0], backgroundGradient[1]
    );
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  drawHeader() {
    const { width, padding, textColor, textSecondary } = this.config;
    const y = padding + 20;

    // Website logo on the left
    this.drawLogo(padding + 40, y);

    // Title center
    this.drawTextCentered(
      'Digit Span Test Results',
      width / 2,
      y,
      'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textColor
    );
  }

  drawLogo(x, y) {
    const { primaryColor, secondaryColor } = this.config;

    // Draw circular logo
    this.drawCircle(x, y + 15, 20, primaryColor);

    // Draw "DST" text
    this.drawTextCentered(
      'DST',
      x,
      y + 20,
      'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'white'
    );
  }

  drawContent() {
    this.drawMainContent();
  }

  drawMainContent() {
    const { width, padding, sectionSpacing, backgroundColor } = this.config;
    const startY = 130;

    // Left column - Radar Chart
    this.drawRadarSection(
      padding + 20,
      startY,
      (width - padding * 2 - sectionSpacing) / 2,
      200,
      this.data.chartData
    );

    // Right column - Score
    this.drawScoreSection(
      padding + 20 + (width - padding * 2 - sectionSpacing) / 2 + sectionSpacing,
      startY,
      (width - padding * 2 - sectionSpacing) / 2,
      200
    );

    // Bottom section - Suggestions
    this.drawSuggestionsSection(
      padding + 20,
      startY + 220,
      width - padding * 2 - 40,
      150
    );
  }

  drawRadarSection(x, y, width, height, data) {
    const { textColor, textSecondary } = this.config;

    // Background
    this.drawRoundedRect(x, y, width, height, 16, {
      fill: 'white',
      shadow: { x: 0, y: 4, blur: 12, color: 'rgba(0, 0, 0, 0.08)' }
    });

    // Title
    this.drawText(
      'Performance Metrics',
      x + 20,
      y + 30,
      'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textColor
    );

    // Radar chart
    const chartX = x + width / 2;
    const chartY = y + height / 2 + 10;
    this.drawRadarChart(chartX, chartY, 65, data);
  }

  drawScoreSection(x, y, width, height) {
    const { textColor, primaryColor } = this.config;

    // Background
    this.drawRoundedRect(x, y, width, height, 16, {
      fill: 'white',
      shadow: { x: 0, y: 4, blur: 12, color: 'rgba(0, 0, 0, 0.08)' }
    });

    // Title
    this.drawText(
      'Your Score',
      x + 20,
      y + 30,
      'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textColor
    );

    // Score value
    const scoreStr = this.data.score.toString();
    this.drawTextCentered(
      scoreStr,
      x + width / 2,
      y + 90,
      'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      primaryColor
    );

    // Level badge
    this.drawLevelBadge(x + width / 2, y + 130, this.data.scoreLevel);

    // Percentile
    this.drawTextCentered(
      `Top ${100 - this.data.percentile}% of users`,
      x + width / 2,
      y + 170,
      '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      this.config.textSecondary
    );
  }

  drawLevelBadge(x, y, level) {
    const colors = {
      'Master': this.config.accentColor,
      'Excellent': this.config.primaryColor,
      'Good': this.config.secondaryColor,
      'Beginner': this.config.textMuted
    };

    const color = colors[level] || this.config.textMuted;
    const badgeWidth = 120;
    const badgeHeight = 36;

    // Badge background
    this.drawRoundedRect(
      x - badgeWidth / 2,
      y - badgeHeight / 2,
      badgeWidth,
      badgeHeight,
      18,
      {
        fill: color,
        shadow: { x: 0, y: 2, blur: 8, color: `${color}30` }
      }
    );

    // Badge text
    this.drawTextCentered(
      level,
      x,
      y + 2,
      'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'white'
    );
  }

  drawSuggestionsSection(x, y, width, height) {
    const { textColor } = this.config;

    // Background
    this.drawRoundedRect(x, y, width, height, 16, {
      fill: 'white',
      shadow: { x: 0, y: 4, blur: 12, color: 'rgba(0, 0, 0, 0.08)' }
    });

    // Title
    this.drawText(
      '💡 Improvement Tips',
      x + 20,
      y + 30,
      'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textColor
    );

    // Suggestions list
    this.drawSuggestionsList(x + 20, y + 55, width - 40, this.data.suggestions || []);
  }

  drawSuggestionsList(x, y, maxWidth, suggestions) {
    if (suggestions.length === 0) {
      suggestions = [
        'Continue training to improve memory capacity',
        'Practice regularly for better results',
        'Focus on maintaining concentration'
      ];
    }

    const lineHeight = 28;
    const itemSpacing = 6;

    suggestions.slice(0, 3).forEach((suggestion, index) => {
      const itemY = y + index * (lineHeight + itemSpacing);
      this.drawSuggestionItem(x, itemY, suggestion, maxWidth);
    });
  }

  drawSuggestionItem(x, y, text, maxWidth) {
    // Bullet point
    this.drawCircle(x + 4, y + 8, 3, this.config.accentColor);

    // Text with truncation
    this.drawTextTruncated(
      text,
      x + 20,
      y + 10,
      maxWidth - 20,
      '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      this.config.textSecondary
    );
  }

  drawFooter() {
    const { width, height, padding, textMuted } = this.config;
    const y = height - 80;

    // Website URL
    this.drawTextCentered(
      'digitspantest.online',
      width / 2,
      y,
      '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textMuted
    );

    // CTA buttons
    const buttonY = y - 45;
    this.drawCTAButton(width / 2 - 160, buttonY, 'Take the Test', this.config.primaryColor);
    this.drawCTAButton(width / 2 + 160, buttonY, 'Share Result', this.config.accentColor);
  }

  drawCTAButton(x, y, text, color) {
    const buttonWidth = 180;
    const buttonHeight = 44;
    const radius = 22;

    // Button background
    this.drawRoundedRect(
      x - buttonWidth / 2,
      y - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      radius,
      {
        fill: color,
        shadow: { x: 0, y: 3, blur: 10, color: `${color}40` }
      }
    );

    // Button text
    this.drawTextCentered(
      text,
      x,
      y + 2,
      'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'white'
    );
  }

  drawRadarChart(centerX, centerY, size, data) {
    const metrics = [
      { label: 'Memory', value: data.memoryScore || 0, angle: 0 },
      { label: 'Attention', value: data.attentionScore || 0, angle: 2 * Math.PI / 3 },
      { label: 'Speed', value: data.speedScore || 0, angle: 4 * Math.PI / 3 }
    ];

    const maxValue = 100;
    const levels = 4;

    // Draw grid
    for (let i = 1; i <= levels; i++) {
      const radius = (size / levels) * i;
      this.drawCircle(centerX, centerY, radius, 'none', {
        stroke: '#e2e8f0',
        strokeWidth: 1
      });
    }

    // Draw axes
    metrics.forEach(metric => {
      const x = centerX + Math.cos(metric.angle) * size;
      const y = centerY + Math.sin(metric.angle) * size;
      this.drawLine(centerX, centerY, x, y, '#e2e8f0', 1);
    });

    // Draw data polygon
    this.ctx.beginPath();
    metrics.forEach((metric, index) => {
      const radius = (size * metric.value) / maxValue;
      const x = centerX + Math.cos(metric.angle) * radius;
      const y = centerY + Math.sin(metric.angle) * radius;

      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    this.ctx.closePath();

    const gradient = this.createLinearGradient(
      centerX - size, centerY - size, centerX + size, centerY + size,
      `${this.config.primaryColor}40`, `${this.config.secondaryColor}40`
    );
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.strokeStyle = this.config.primaryColor;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw labels
    metrics.forEach(metric => {
      const labelRadius = size + 25;
      const x = centerX + Math.cos(metric.angle) * labelRadius;
      const y = centerY + Math.sin(metric.angle) * labelRadius;

      this.drawTextCentered(
        metric.label,
        x,
        y + 5,
        'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        this.config.textSecondary
      );
    });
  }

  // Utility methods
  drawText(text, x, y, font, color, align = 'left') {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
  }

  drawTextCentered(text, x, y, font, color) {
    this.drawText(text, x, y, font, color, 'center');
  }

  drawTextTruncated(text, x, y, maxWidth, font, color) {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    // Measure text
    let measuredWidth = this.ctx.measureText(text).width;

    if (measuredWidth <= maxWidth) {
      this.ctx.fillText(text, x, y);
      return;
    }

    // Truncate with ellipsis
    let truncated = text;
    while (truncated.length > 0 && measuredWidth > maxWidth) {
      truncated = truncated.slice(0, -1);
      measuredWidth = this.ctx.measureText(truncated + '...').width;
    }

    this.ctx.fillText(truncated + '...', x, y);
  }

  drawCircle(x, y, radius, fill, stroke = null) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (fill && fill !== 'none') {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }

    if (stroke && stroke.stroke) {
      this.ctx.strokeStyle = stroke.stroke;
      this.ctx.lineWidth = stroke.strokeWidth || 2;
      this.ctx.stroke();
    }
  }

  drawLine(x1, y1, x2, y2, color, width = 1) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  drawRoundedRect(x, y, width, height, radius, options = {}) {
    const { fill, stroke, shadow } = options;

    this.ctx.save();

    if (shadow) {
      this.ctx.shadowOffsetX = shadow.x || 0;
      this.ctx.shadowOffsetY = shadow.y || 0;
      this.ctx.shadowBlur = shadow.blur || 0;
      this.ctx.shadowColor = shadow.color || 'transparent';
    }

    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();

    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }

    if (stroke) {
      this.ctx.strokeStyle = stroke.stroke || stroke;
      this.ctx.lineWidth = stroke.strokeWidth || 1;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  createLinearGradient(x1, y1, x2, y2, color1, color2) {
    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  }
}

window.ShareCardGenerator = ShareCardGenerator;
window.ShareCardData = ShareCardData;

console.log('✅ ShareCardGenerator v2.0 loaded');
