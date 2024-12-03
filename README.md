# JanaGanga - Frontend

## Technology Stack
- React Native
- Expo
- TypeScript
- Node.js
- npm

## Setup for Development

### Prerequisites
- Node.js (v18 or later)
- npm (included with Node.js)
- Expo CLI
- Android Studio & SDK

#### Development Workflow:

Navigate to frontend folder:
```bash
cd frontend
```

```bash
# Install project dependencies
npm install

# Start development server
npm start

# Start with clean cache (if facing issues)
npm start -- --clear

# Run on Android
npm run android

# Run on web
npm run web
```

#### Package Management:
```bash
# Install new package
npm install package_name

# Remove package
npm uninstall package_name

# Clean and reinstall dependencies (if facing issues)
rm -rf node_modules
npm install
```

### Development Ports
- Metro Bundler: http://localhost:8082
- Expo Development Server: http://localhost:19002
- Expo DevTools: http://localhost:19003

## Contribution Guidelines
1. Write clean, maintainable code
2. Follow TypeScript best practices
3. Update package.json for any new dependencies
4. Document component usage

## Style Guide
- Use ESLint for code linting
- Follow TypeScript conventions
- Maintain consistent component structure
- Use Prettier for code formatting