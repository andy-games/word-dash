# Word Dash - Catchphrase Game

A fun, interactive catchphrase-style word guessing game built with React and Tailwind CSS.

## Features

- 🎲 Multiple categories (Mixed Bag, Pop Culture, History, Food & Drink, Sports & Games, Technology)
- ⏱️ 60-second round timer with visual countdown
- ⚡ 15-second word timer with pass warnings
- 🎯 Team scoring system with steal opportunities
- 🔊 Audio feedback (beeps and ticks)
- 📊 Round statistics tracking
- 🎨 Beautiful gradient UI with animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## How to Play

1. **Choose a Category**: Select from one of six categories
2. **Start the Game**: Click "START GAME" to begin
3. **Guess Words**: 
   - Click "Got It!" when your team guesses correctly
   - Click "Skip" to pass on a word
   - Words automatically pass after 15 seconds
4. **Timer**: The game runs for 60 seconds
5. **Scoring**: Points are awarded for correct guesses
6. **Steal Round**: The team that didn't have the timer run out gets a chance to steal for 2 bonus points
7. **Next Round**: Continue playing with different categories

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- Web Audio API (sound effects)

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages whenever you push to the `main` branch.

### Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Push to main:**
   - The GitHub Actions workflow will automatically build and deploy your site
   - After the workflow completes, your site will be available at:
     `https://[your-username].github.io/word-dash/`

3. **Update base path (if needed):**
   - If your repository name is different from "word-dash", update the `base` path in `vite.config.js`
   - Change `/word-dash/` to match your repository name

The deployment workflow is located at `.github/workflows/deploy.yml` and runs automatically on every push to `main`.

## License

MIT

