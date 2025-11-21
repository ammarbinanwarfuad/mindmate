import jwt from 'jsonwebtoken';
import { auth } from '../config/firebase.js';
import User from '../models/User.model.js';

// Verify Firebase token
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Validate token format before attempting verification
    if (token.length < 100 || !token.includes('.')) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.firebaseUser = decodedToken;
    
    // Find or create user in database
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        profile: {
          name: decodedToken.name || decodedToken.displayName || decodedToken.email?.split('@')[0] || 'User',
        },
        consent: {
          termsAccepted: true,
          termsVersion: '1.0',
          privacyAccepted: true,
          ageConfirmed: true,
          consentDate: new Date()
        }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    // Only log detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth error:', error.message);
    }
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Verify JWT token (alternative/additional auth)
export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Use Firebase auth by default
export const authenticate = verifyFirebaseToken;
