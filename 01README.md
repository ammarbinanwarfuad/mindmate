# MindMate - Full Stack Mental Wellness Platform

A comprehensive mental wellness platform built with modern web technologies, designed specifically for university students. MindMate combines AI-powered chat support, mood tracking, peer matching, and community features to provide holistic mental health support.

## ✨ Features

- **🤖 AI Chat Support**: 24/7 empathetic AI companion powered by Google Gemini
- **😊 Mood Tracking**: Daily mood logging with beautiful visualizations and insights
- **👥 Community Forum**: Safe space to share experiences and support peers
- **🤝 Peer Matching**: Smart algorithm to connect you with compatible peers
- **📊 Analytics & Insights**: Track patterns and trends in your mental health
- **🔒 Privacy-First**: End-to-end encryption for journal entries
- **🆘 Crisis Detection**: Automatic detection with immediate resource access
- **📱 Fully Responsive**: Works seamlessly on all devices

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Beautiful component library
- **Vite** - Fast build tool
- **Axios** - HTTP client
- **Firebase Auth** - Authentication
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **Framer Motion** - Smooth animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Firebase Admin** - Server-side Firebase
- **JWT** - Token-based authentication
- **Google Gemini AI** - AI chat responses
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- MongoDB database (local or Atlas)
- Firebase project (for authentication)
- Google Gemini API key

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd mindmate-fullstack
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
GEMINI_API_KEY=your_gemini_api_key
ENCRYPTION_KEY=your_32_character_encryption_key
CLIENT_URL=http://localhost:3000
```

### 3. Set up the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the Application

**Start the backend server:**
```bash
cd server
npm run dev
```

**Start the frontend (in a new terminal):**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
mindmate-fullstack/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── auth/     # Authentication components
│   │   │   ├── layout/   # Layout components
│   │   │   └── ui/       # UI components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Utility functions
│   │   ├── config/       # Configuration files
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── public/           # Static assets
│   └── package.json
│
└── server/                # Express backend
    ├── config/           # Configuration files
    ├── models/           # Mongoose models
    ├── routes/           # API routes
    ├── middleware/       # Custom middleware
    ├── services/         # Business logic
    ├── utils/            # Utility functions
    ├── server.js         # Entry point
    └── package.json
```

## 🔐 Security Features

- Firebase Authentication for secure user management
- JWT tokens for API authentication
- Password hashing with bcryptjs
- End-to-end encryption for journal entries (AES-256-GCM)
- CORS protection
- Input validation and sanitization
- Crisis keyword detection

## 🌐 API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/sync` - Sync user from Firebase
- `POST /api/auth/logout` - Logout user

### User
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile
- `GET /api/user/stats` - Get user statistics

### Mood
- `GET /api/mood` - Get mood entries
- `POST /api/mood` - Create mood entry
- `GET /api/mood/stats` - Get mood statistics

### Chat
- `GET /api/chat` - Get conversation history
- `POST /api/chat/message` - Send message to AI
- `DELETE /api/chat` - Clear conversation

### Community
- `GET /api/community/posts` - Get forum posts
- `POST /api/community/posts` - Create forum post
- `POST /api/community/posts/:id/react` - React to post
- `POST /api/community/posts/:id/comments` - Add comment

### Matching
- `GET /api/matching/find` - Find potential matches
- `GET /api/matching/my-matches` - Get user's matches
- `POST /api/matching/request` - Send match request
- `PATCH /api/matching/:matchId` - Accept/reject match

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## 🎨 UI/UX Features

- Modern, clean design with Tailwind CSS and DaisyUI
- Fully responsive layout (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Intuitive navigation
- Loading states and error handling
- Accessibility considerations
- Dark mode support (via DaisyUI themes)

## 📦 Deployment

### Frontend (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in hosting platform

### Backend (Heroku/Railway/Render)
1. Push code to Git repository
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

## ⚠️ Important Notes

- **Crisis Support**: MindMate is NOT a replacement for professional mental health care
- **Data Privacy**: All journal entries are encrypted at rest
- **Age Requirement**: Users must be 18+ to use the platform
- **Terms of Service**: Users must accept terms before registration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support Resources

- **Crisis Hotline**: 988 (US)
- **Crisis Text Line**: Text HOME to 741741
- **International**: Find resources at findahelpline.com

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Firebase for authentication
- MongoDB for data storage
- All contributors and users of MindMate

---

**Remember**: If you or someone you know is in crisis, please contact emergency services or a crisis helpline immediately. MindMate is here to support you, but professional help is irreplaceable.

Made with ❤️ for student mental wellness
