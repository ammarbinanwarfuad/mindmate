# 🧠 MindMate - Mental Wellness Platform

A comprehensive mental wellness platform designed specifically for university students, featuring AI-powered support, mood tracking, CBT tools, and community features.

## 🌟 Features

- **AI Chat Companion**: 24/7 mental health support
- **Mood Tracking**: Track and analyze your emotional wellbeing
- **CBT Tools**: Cognitive Behavioral Therapy exercises
- **Study Buddy Matching**: Connect with supportive peers
- **Community Forum**: Share experiences and support others
- **Wellness Activities**: Guided meditation, breathing exercises
- **Goal Setting**: Track personal growth and achievements
- **Gamification**: Earn badges and level up your wellness journey
- **Admin Panel**: Comprehensive moderation and analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Firebase project
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/mindmate-fullstack.git
cd mindmate-fullstack
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

Create `.env` in `server/` folder:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
CLIENT_URL=http://localhost:3000
```

Create `.env` in `client/` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Run development servers**

Terminal 1 (Server):
```bash
cd server
npm run dev
```

Terminal 2 (Client):
```bash
cd client
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📦 Deployment

### Deploy to Vercel

See detailed guides:
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick deployment steps

**Quick Deploy:**
```bash
npm install -g vercel
vercel login
vercel
```

## 🏗️ Project Structure

```
mindmate-fullstack/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Node.js backend
│   ├── config/           # Database & Firebase config
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── package.json
│
├── vercel.json           # Vercel configuration
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **DaisyUI** - Component library
- **React Router** - Routing
- **Axios** - HTTP client
- **Firebase** - Authentication
- **Recharts** - Data visualization
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Firebase Admin** - Authentication
- **JWT** - Token management

## 📝 Available Scripts

### Root Directory
- `npm run install:all` - Install all dependencies
- `npm run dev:client` - Start client dev server
- `npm run dev:server` - Start server dev server
- `npm run build:client` - Build client for production

### Client Directory
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server Directory
- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

**Important**: Never commit `.env` files to version control!

## 🧪 Testing

```bash
# Run client tests
cd client
npm test

# Run server tests
cd server
npm test
```

## 📊 Admin Panel

Access the admin panel at `/admin` with super admin credentials.

**Create Super Admin:**
```bash
cd server
npm run create:superadmin
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Firebase for authentication
- MongoDB Atlas for database hosting
- Vercel for deployment
- All open-source contributors

## 📞 Support

For support, email support@mindmate.com or join our Discord server.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Video therapy sessions
- [ ] AI-powered crisis detection
- [ ] Multi-language support
- [ ] Wearable device integration

---

Made with ❤️ for university students' mental wellness
