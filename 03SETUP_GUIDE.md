# MindMate Setup Guide

Complete step-by-step guide to set up and run MindMate locally.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **MongoDB** - Local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- **Firebase Account** - [Create one here](https://firebase.google.com/)
- **Google AI Studio Account** - For Gemini API [Get API key](https://makersuite.google.com/app/apikey)

## Step 1: Clone or Download the Project

```bash
cd mindmate-fullstack
```

## Step 2: Set Up MongoDB

### Option A: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/mindmate`

## Step 3: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → **Email/Password** and **Google** sign-in
4. Go to **Project Settings** → **General**
5. Under "Your apps", click the web icon (</>)
6. Register your app and copy the config values
7. Go to **Project Settings** → **Service Accounts**
8. Click "Generate new private key" and save the JSON file

## Step 4: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key

## Step 5: Configure Backend

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

# MongoDB - Use your connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindmate?retryWrites=true&w=majority

# JWT Secret - Generate a random string
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# Firebase Admin SDK - From the JSON file you downloaded
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Encryption Key - Must be exactly 32 characters
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456

# Client URL
CLIENT_URL=http://localhost:3000
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`, keep the quotes and newline characters (`\n`)
- `ENCRYPTION_KEY` must be exactly 32 characters
- Generate a secure `JWT_SECRET` using: `openssl rand -base64 32`

## Step 6: Configure Frontend

1. Navigate to client directory:
```bash
cd ../client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` and fill in your Firebase config:

```env
# Firebase Configuration - From Firebase Console
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# API URL
VITE_API_URL=http://localhost:5000/api
```

## Step 7: Run the Application

### Start Backend Server

Open a terminal and run:

```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📊 Environment: development
✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
```

### Start Frontend (New Terminal)

Open a new terminal and run:

```bash
cd client
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 8: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the MindMate home page!

## Step 9: Create Your First Account

1. Click "Get Started" or "Sign Up"
2. Fill in your details
3. Accept the terms and conditions
4. Click "Create Account"
5. You'll be redirected to the dashboard

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Check your MongoDB URI is correct
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify database user credentials

**Firebase Error:**
- Verify all Firebase environment variables are set correctly
- Check that the private key includes `\n` characters
- Ensure Firebase Authentication is enabled in console

**Port Already in Use:**
```bash
# Change PORT in server/.env to a different number
PORT=5001
```

### Frontend Issues

**Vite Build Error:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Firebase Configuration Error:**
- Double-check all Firebase config values
- Ensure you're using the web app config (not Android/iOS)

**API Connection Error:**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in client/.env

## Next Steps

1. **Explore Features**: Try logging mood, chatting with AI, creating posts
2. **Customize**: Modify colors in `tailwind.config.js`
3. **Deploy**: Follow deployment guides for production

## Production Deployment

### Backend (Railway/Render/Heroku)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set all environment variables
4. Deploy

### Frontend (Netlify/Vercel)

1. Build the app: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables
4. Configure redirects for React Router

## Support

If you encounter issues:

1. Check the error messages carefully
2. Verify all environment variables are set
3. Ensure all services (MongoDB, Firebase) are properly configured
4. Check the console logs for detailed error information

## Security Reminders

- Never commit `.env` files to Git
- Use strong, unique passwords
- Keep API keys secure
- Enable Firebase security rules
- Use HTTPS in production

---

**Congratulations!** 🎉 You've successfully set up MindMate!

For questions or issues, please check the main README.md or create an issue on GitHub.
