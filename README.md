# Scripto - Professional Screenplay Editor

A modern, full-featured screenplay editor built with React, Flask, and Fountain format support. Scripto provides industry-standard formatting, real-time preview, scene navigation, and a distraction-free writing experience.

## Features

### 🎬 Smart Auto-Formatting Engine
- Automatic element type detection (Scene Heading, Action, Character, Dialogue, Parenthetical, Transition)
- Industry-standard screenplay formatting with proper margins
- TAB key cycling through element types
- Real-time visual formatting feedback

### 📝 Professional Writing Experience
- **Distraction-free mode**: Focus on your writing without distractions
- **Split-screen preview**: See formatted output in real-time
- **Auto-save**: Never lose your work (2-second debounce)
- **Dark/Light theme**: Choose your preferred writing environment

### 🗺️ Scene Navigation & Tracking
- Browse all scenes with line numbers
- Track characters automatically from dialogue
- Extract locations from scene headings
- Real-time statistics (scene/character/location counts)

### 🎨 Modern UI/UX
- Clean, responsive interface built with Tailwind CSS
- Keyboard shortcuts and intuitive controls
- Professional toolbar with quick access to all features
- Smooth animations and transitions

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Flask** (Python) REST API
- **MongoDB** for data persistence
- **PyMongo** for database operations

### Services
- **Fountain Parser Service** (Node.js/Express)
- **fountain-js** library for screenplay parsing

## Prerequisites

Before running Scripto locally, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/zarouz/Scripto.git
cd Scripto
```

### 2. Set Up MongoDB

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Or start MongoDB (Linux)
sudo systemctl start mongod

# Or run MongoDB manually
mongod --dbpath /path/to/your/data/directory
```

### 3. Set Up Backend (Flask API)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (optional)
export FLASK_ENV=development
export MONGODB_URI=mongodb://localhost:27017/scripto
```

### 4. Set Up Fountain Parser Service

```bash
# Navigate to fountain parser directory
cd ../fountain_parser_service

# Install dependencies
npm install
```

### 5. Set Up Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

You need to run three services simultaneously:

### Terminal 1: MongoDB
```bash
# Make sure MongoDB is running
mongod
```

### Terminal 2: Flask Backend
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python app.py
```

The Flask API will start on `http://localhost:5000`

### Terminal 3: Fountain Parser Service
```bash
cd fountain_parser_service
node index.js
```

The Fountain parser will start on `http://localhost:4000`

### Terminal 4: Frontend Development Server
```bash
cd frontend
npm run dev
```

The React app will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Project Structure

```
Scripto/
├── backend/                    # Flask REST API
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── ...
├── fountain_parser_service/   # Fountain format parser
│   ├── index.js              # Express server
│   ├── package.json          # Node dependencies
│   └── ...
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ScreenplayEditor.tsx
│   │   │   ├── ScreenplayPreview.tsx
│   │   │   ├── SceneNavigationSidebar.tsx
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   │   └── screenplay.ts  # Screenplay formatting logic
│   │   ├── contexts/        # React contexts
│   │   │   └── ThemeContext.tsx
│   │   ├── api/            # API client
│   │   └── ...
│   ├── package.json        # Node dependencies
│   └── vite.config.ts      # Vite configuration
└── README.md              # This file
```

## API Endpoints

### Projects
- `GET /api/v1/projects` - Get all projects
- `POST /api/v1/projects` - Create new project
- `DELETE /api/v1/projects/:id` - Delete project

### Scripts
- `GET /api/v1/projects/:projectId/scripts` - Get scripts for project
- `POST /api/v1/projects/:projectId/scripts` - Create new script
- `GET /api/v1/scripts/:scriptId` - Get script content
- `PUT /api/v1/scripts/:scriptId` - Update script content
- `DELETE /api/v1/scripts/:scriptId` - Delete script

### Fountain Parser
- `POST http://localhost:4000/parse` - Parse Fountain text to HTML

## Keyboard Shortcuts

- **TAB**: Cycle through element types (Scene Heading → Action → Character → Dialogue → Parenthetical → Transition)
- **Ctrl/Cmd + S**: Save script (manual save)

## Screenplay Formatting Guide

Scripto follows industry-standard screenplay formatting:

### Scene Heading
```
INT. COFFEE SHOP - DAY
```
Starts with INT., EXT., INT./EXT., or I/E

### Action
```
John walks into the coffee shop.
```
Standard paragraph text

### Character
```
JOHN
```
Character name in ALL CAPS

### Dialogue
```
          JOHN
    I'll have a coffee, please.
```
Indented below character name

### Parenthetical
```
          JOHN
        (nervously)
    I'll have a coffee, please.
```
Direction for actor, wrapped in parentheses

### Transition
```
                                    CUT TO:
```
Transition instruction, right-aligned

## Development

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# The build output will be in frontend/dist/
```

### Linting

```bash
# Frontend linting
cd frontend
npm run lint
```

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:

```bash
# Find and kill the process using the port
# macOS/Linux:
lsof -ti:5000 | xargs kill -9  # Flask
lsof -ti:4000 | xargs kill -9  # Fountain parser
lsof -ti:5173 | xargs kill -9  # Vite

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Issues
Make sure MongoDB is running and accessible:

```bash
# Test MongoDB connection
mongosh
```

### Frontend Not Connecting to Backend
Check that:
1. Flask backend is running on port 5000
2. Fountain parser is running on port 4000
3. CORS is enabled in Flask (should be by default)
4. API URLs in `frontend/src/api/index.ts` are correct

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Fountain](https://fountain.io/) - Screenplay markup language
- [fountain-js](https://github.com/mattdaly/Fountain.js) - Fountain parser library
- Built with [Claude Code](https://claude.com/claude-code)

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Happy Writing! 🎬**
