# Development Guide - Digit Span Test

This guide explains how to set up and develop the Digit Span Test project.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Server

Start the development server with hot reload:

```bash
npm run dev
```

This will start Vite dev server at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### 4. Preview Production Build

```bash
npm run preview
```

## 🧪 Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Generate coverage report

```bash
npm run test:coverage
```

## 📁 Project Structure

```
digit-span-test/
├── public/              # Static assets
│   ├── images/         # Image files
│   └── icons/          # Icon files
├── css/                # CSS files
│   └── game.css        # Game styles
├── js/                 # JavaScript files
│   └── game.js         # Game logic
├── tests/              # Test files
│   ├── setup.js        # Jest setup
│   └── game.test.js    # Game tests
├── dist/               # Build output (generated)
├── index.html          # Landing page
├── game.html           # Game page
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── babel.config.js     # Babel configuration
└── .gitignore          # Git ignore rules
```

## 🔧 Build Tools

### Vite
- **Purpose**: Fast build tool and dev server
- **Config**: `vite.config.js`
- **Features**:
  - Hot Module Replacement (HMR)
  - Tree-shaking
  - Code splitting
  - Asset optimization

### Jest
- **Purpose**: Unit testing framework
- **Config**: `package.json` (jest section)
- **Features**:
  - jsdom for DOM testing
  - Coverage reports
  - Watch mode

### Babel
- **Purpose**: JavaScript transpiler
- **Config**: `babel.config.js`
- **Features**:
  - ES6+ to ES5
  - Test environment support

## 📝 Coding Standards

### JavaScript
- Use ES6+ features
- Use 'use strict' mode
- Follow camelCase naming
- Add JSDoc comments for functions
- Max line length: 100 characters

### CSS
- Use CSS custom properties (variables)
- Follow BEM naming convention
- Mobile-first responsive design
- Comment sections clearly

### Testing
- Write tests for all public methods
- Aim for 70%+ coverage
- Use descriptive test names
- Group tests with `describe` blocks

## 🎯 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write/modify code
- Add tests
- Update documentation

### 3. Run Tests

```bash
npm test
```

### 4. Run Linter (if configured)

```bash
npm run lint
```

### 5. Build Check

```bash
npm run build
```

### 6. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

### 7. Push & Create PR

```bash
git push origin feature/your-feature-name
```

## 🔍 Debugging

### Browser DevTools
- Use Chrome/Firefox DevTools
- Check Console for errors
- Use Sources tab to debug JavaScript
- Use Network tab to check resources

### Jest Debugging
```bash
# Debug all tests
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug specific test
node --inspect-brk node_modules/.bin/jest --testNamePattern="test name"
```

## 📦 Deployment

### Static Hosting (Netlify, Vercel, GitHub Pages)

1. Build the project:
```bash
npm run build
```

2. Deploy `dist/` directory to your hosting provider

### Custom Server

1. Copy all files from `dist/` to your server
2. Configure server to serve `index.html` for all routes
3. Ensure HTTPS is enabled

## 🐛 Common Issues

### Issue: Vite dev server not starting
**Solution**: Check if port 3000 is already in use
```bash
lsof -i :3000
```

### Issue: Tests failing with "ReferenceError: window is not defined"
**Solution**: Jest needs jsdom setup (already in `tests/setup.js`)

### Issue: CSS not loading
**Solution**: Check path in HTML `<link>` tags

### Issue: Module not found errors
**Solution**: Restart dev server, clear `node_modules` and reinstall

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Babel Documentation](https://babeljs.io/)
- [MDN Web Docs](https://developer.mozilla.org/)
