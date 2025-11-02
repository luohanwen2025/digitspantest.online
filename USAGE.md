# 📖 Usage Guide - Digit Span Test

## 🚀 Quick Start (For Users)

### Option 1: Direct Access (No Build Required)
Simply open `index.html` or `game.html` in your browser:
- **Landing Page**: Open `index.html` in your web browser
- **Direct Game**: Open `game.html` in your web browser

### Option 2: Use Production Build
1. Build the project (see Development section below)
2. Open `dist/index.html` in your browser

---

## 👨‍💻 For Developers

### Development Setup

#### Prerequisites
```bash
Node.js >= v16
npm >= 8
```

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Start Development Server
```bash
npm run dev
```
- Opens browser at `http://localhost:3000`
- Hot reload enabled - changes auto-update

#### 3. Build for Production
```bash
npm run build
```
- Creates optimized files in `dist/` directory
- Minifies CSS and JS
- Optimizes images and assets

#### 4. Preview Production Build
```bash
npm run preview
```
- Serves production build locally
- Opens at `http://localhost:4173`

### Running Tests

#### Run All Tests
```bash
npm test
```

#### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

#### Coverage Report
```bash
npm run test:coverage
```
- Generates report in `coverage/` directory
- Open `coverage/lcov-report/index.html` to view

---

## 🎮 Game Controls

### How to Play
1. **Start Game**: Click "Start Game" button
2. **Memorize**: A number appears for 5 seconds
3. **Enter**: Type the exact number and click "Submit" or press Enter
4. **Progress**: Move through 20 increasingly difficult levels
5. **Score**: Earn points based on accuracy

### Scoring
- **Level 1**: 5 points
- **Level 2**: 10 points
- **Level 3**: 15 points
- ...
- **Level 20**: 100 points
- **Total**: 1,050 points maximum

### Performance Rating
- **Excellent**: 840-1050 points 🏆
- **Good**: 600-839 points 👍
- **Normal**: 0-599 points 💪

---

## 🔧 Configuration

### Build Configuration

Edit `vite.config.js` to customize build:

```javascript
export default defineConfig({
  build: {
    outDir: 'dist',        // Output directory
    assetsDir: 'assets',   // Asset subdirectory
    sourcemap: true,       // Generate source maps
    minify: 'terser',      // Minification method
  },
  server: {
    port: 3000,            // Dev server port
    open: true,            // Auto-open browser
    cors: true             // Enable CORS
  }
});
```

### Test Configuration

Edit `package.json` jest section:

```json
"jest": {
  "testEnvironment": "jsdom",        // Use JSDOM for tests
  "collectCoverageFrom": [           // Files to analyze
    "js/**/*.js"
  ],
  "coverageThreshold": {             // Minimum coverage
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

---

## 🌐 Deployment Options

### Static Hosting (Recommended)

#### Netlify
1. Connect your Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

#### Vercel
1. Import project from Git
2. Framework preset: `Vite`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy!

#### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```
3. Run: `npm run deploy`

#### Self-Hosted Server

**Using Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /game {
        try_files $uri $uri/ /game.html;
    }
}
```

**Using Apache:**
Create `.htaccess`:
```apache
RewriteEngine On
RewriteBase /

# Handle Angular/React routes
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## 🔍 Browser Support

### Fully Supported
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Partially Supported
- ⚠️ IE 11 (requires polyfills)

---

## 📊 Performance Metrics

### Build Size (After Optimization)
```
CSS (game.css): ~15 KB (gzipped: ~4 KB)
JS (game.js):  ~12 KB (gzipped: ~5 KB)
HTML:          ~5 KB
Total:         ~32 KB
```

### Load Times (3G Network)
- First Paint: < 1s
- Interactive: < 2s
- Full Load: < 3s

### Lighthouse Scores
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

---

## 🐛 Troubleshooting

### Issue: "Cannot resolve module"
**Solution**: Check module path in import statement
```javascript
// Correct
import { something } from './module.js';

// Wrong
import { something } from './module';
```

### Issue: Tests failing on CI
**Solution**: Ensure Node version matches package.json
```json
"engines": {
  "node": ">=16",
  "npm": ">=8"
}
```

### Issue: Build fails with memory error
**Solution**: Increase Node memory limit
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Issue: CSS not applying
**Solution**: Check HTML link path
```html
<!-- Correct -->
<link rel="stylesheet" href="css/game.css">

<!-- Wrong -->
<link rel="stylesheet" href="/css/game.css">
```

### Issue: Game not loading in iframe
**Solution**: Check X-Frame-Options header
```http
X-Frame-Options: SAMEORIGIN
```

---

## 📚 Additional Resources

- [Vite Guide](https://vitejs.dev/guide/)
- [Jest Testing](https://jestjs.io/docs/tutorial-async)
- [Web Performance](https://web.dev/performance/)
- [Accessibility Guide](https://www.w3.org/WAI/fundamentals/accessibility-intro/)

---

## 📞 Support

For issues and questions:
- 📧 Email: support@digitspantest.online
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Wiki: [Project Wiki](https://github.com/your-repo/wiki)

---

**Last Updated**: November 2024
**Version**: 1.0.0
