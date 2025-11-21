# MindMate Backend Server

Express.js backend API for the MindMate mental wellness platform.

## Features

- RESTful API architecture
- MongoDB database with Mongoose ODM
- Firebase Authentication integration
- JWT token authentication
- Google Gemini AI integration
- End-to-end encryption for sensitive data
- CORS enabled
- Input validation
- Error handling middleware

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindmate
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
GEMINI_API_KEY=your_gemini_api_key
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456
CLIENT_URL=http://localhost:3000
```

## Running the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Documentation

See main README.md for complete API documentation.

## Database Models

- **User**: User accounts and profiles
- **MoodEntry**: Daily mood tracking entries
- **Conversation**: AI chat conversation history
- **ForumPost**: Community forum posts
- **Match**: Peer matching data
- **Notification**: User notifications

## Security

- Firebase token verification
- JWT authentication
- Password hashing with bcryptjs
- AES-256-GCM encryption for journal entries
- Input validation with express-validator
- CORS protection
