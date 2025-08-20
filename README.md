<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Body Progress Tracker

A modern, simplified fitness tracking application built with React, JavaScript, and Python. Track your weight, body fat percentage, and progress photos with a beautiful, intuitive interface.

## Features

- 📊 **Progress Tracking**: Monitor weight and body fat percentage over time
- 📈 **Visual Charts**: Interactive charts showing your progress trends
- 📸 **Photo Gallery**: Store and view progress photos
- 🎯 **Goal Setting**: Set and track targets for weight and body fat
- 💪 **Daily Motivation**: Inspirational quotes to keep you motivated
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **JavaScript** - No TypeScript complexity
- **Tailwind CSS** - Modern, utility-first CSS framework
- **Recharts** - Beautiful, responsive charts
- **Lucide React** - Modern icon library
- **Vite** - Fast build tool and dev server

### Backend (Optional)
- **Python Flask** - Lightweight API server
- **NumPy** - Data analysis and calculations
- **Flask-CORS** - Cross-origin resource sharing

## Quick Start

### Frontend Only (Recommended for GitHub Pages)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

### With Python Backend

1. **Install Python dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start Python server**:
   ```bash
   python app.py
   ```

3. **Start frontend** (in another terminal):
   ```bash
   npm run dev
   ```

## Deployment to GitHub Pages

1. **Update homepage URL** in `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/body-progress-tracker"
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

3. **Configure GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages"
   - Select "gh-pages" branch as source
   - Save

## Project Structure

```
body-progress-tracker/
├── App.jsx                 # Main application component (all components included)
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
└── README.md             # This file
```

## Key Features Explained

### Single File Architecture
All React components are consolidated into `App.jsx` for simplicity and easier maintenance.

### Local Storage
Data is automatically saved to browser's localStorage, so your progress persists between sessions.

### Responsive Design
Built with Tailwind CSS for a modern, responsive design that works on all devices.

### No External Dependencies
The app works completely offline and doesn't require any external APIs or services.

## Customization

### Colors
Update the color scheme in `tailwind.config.js`:
```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Styling
Modify `index.css` for custom animations and effects.

### Data Structure
The app uses simple JavaScript objects for data storage:
```javascript
{
  date: "2024-01-15",
  weight: 70.5,
  bodyFat: 15.2
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
