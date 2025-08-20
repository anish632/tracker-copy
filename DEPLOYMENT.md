# Deployment Guide

## Deploy to GitHub Pages

### Step 1: Update Repository Name
1. Rename your repository to `body-progress-tracker` (or update the homepage URL in `package.json`)

### Step 2: Update Homepage URL
Edit `package.json` and replace `[YOUR_USERNAME]` with your actual GitHub username:
```json
"homepage": "https://yourusername.github.io/body-progress-tracker"
```

### Step 3: Deploy
```bash
npm run deploy
```

### Step 4: Configure GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "gh-pages" branch
6. Click "Save"

### Step 5: Wait for Deployment
GitHub Pages will take a few minutes to deploy your site. You'll see a green checkmark when it's ready.

## Local Development

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```

## Project Structure

```
body-progress-tracker/
├── App.jsx                 # All React components (single file)
├── index.jsx              # React entry point
├── index.css              # Global styles with Tailwind
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── backend/               # Python backend (optional)
│   ├── app.py            # Flask application
│   └── requirements.txt  # Python dependencies
├── README.md             # Project documentation
└── DEPLOYMENT.md         # This file
```

## Features

- ✅ **Single File Architecture**: All components in one file for simplicity
- ✅ **Modern UI**: Beautiful design with Tailwind CSS
- ✅ **Responsive**: Works on all devices
- ✅ **Offline First**: No external dependencies required
- ✅ **Local Storage**: Data persists between sessions
- ✅ **Progress Tracking**: Weight and body fat monitoring
- ✅ **Photo Gallery**: Progress photo storage
- ✅ **Goal Setting**: Target weight and body fat
- ✅ **Charts**: Visual progress tracking
- ✅ **Motivation**: Daily inspirational quotes
