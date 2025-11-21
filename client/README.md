# MindMate Frontend

React-based frontend for the MindMate mental wellness platform.

## Features

- Modern React 18 with Hooks
- React Router for navigation
- Tailwind CSS + DaisyUI for styling
- Firebase Authentication
- Axios for API requests
- Responsive design
- Beautiful UI components
- Smooth animations

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

## Running the App

Development:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── auth/        # Authentication components
│   ├── layout/      # Layout components (Navbar, etc.)
│   └── ui/          # UI components (Button, Card, etc.)
├── context/         # React context (AuthContext)
├── pages/           # Page components
├── utils/           # Utility functions (API client)
├── config/          # Configuration (Firebase)
├── App.jsx          # Main app component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## Available Pages

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard
- `/mood` - Mood tracker
- `/chat` - AI chat
- `/community` - Community forum
- `/matches` - Peer matching
- `/profile` - User profile
- `/settings` - Settings

## Technologies

- React 18
- Vite
- React Router
- Tailwind CSS
- DaisyUI
- Firebase
- Axios
- Lucide React (icons)
- Recharts
- Framer Motion
