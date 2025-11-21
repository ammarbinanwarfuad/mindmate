import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import moodRoutes from './routes/mood.routes.js';
import chatRoutes from './routes/chat.routes.js';
import communityRoutes from './routes/community.routes.js';
import matchingRoutes from './routes/matching.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import journalRoutes from './routes/journal.routes.js';
import moodAnalyticsRoutes from './routes/moodAnalytics.routes.js';
import wellnessRoutes from './routes/wellness.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import safetyRoutes from './routes/safety.routes.js';
import buddiesRoutes from './routes/buddies.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import cbtRoutes from './routes/cbt.routes.js';
import professionalRoutes from './routes/professional.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import socialRoutes from './routes/social.routes.js';
import challengesRoutes from './routes/challenges.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Admin routes
import adminUsersRoutes from './routes/admin/users.routes.js';
import adminModerationRoutes from './routes/admin/moderation.routes.js';
import adminCrisisRoutes from './routes/admin/crisis.routes.js';
import adminAnalyticsRoutes from './routes/admin/analytics.routes.js';
import adminContentRoutes from './routes/admin/content.routes.js';
import adminTeamRoutes from './routes/admin/team.routes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { requireAdmin } from './middleware/adminAuth.js';
import { seedWellnessActivities } from './services/wellness.service.js';
import { seedJournalPrompts } from './services/journal.service.js';
import { seedBadges, generateChallenges } from './services/gamification.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Seed wellness activities, journal prompts, badges, and challenges
seedWellnessActivities();
seedJournalPrompts();
seedBadges();
generateChallenges();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/mood-analytics', moodAnalyticsRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/buddies', buddiesRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/cbt', cbtRoutes);
app.use('/api/professional', professionalRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/ai', aiRoutes);

// Admin routes (protected with authentication and admin check)
app.use('/api/admin/users', authenticate, requireAdmin, adminUsersRoutes);
app.use('/api/admin/moderation', authenticate, requireAdmin, adminModerationRoutes);
app.use('/api/admin/crisis', authenticate, requireAdmin, adminCrisisRoutes);
app.use('/api/admin/analytics', authenticate, requireAdmin, adminAnalyticsRoutes);
app.use('/api/admin/content', authenticate, requireAdmin, adminContentRoutes);
app.use('/api/admin/team', authenticate, requireAdmin, adminTeamRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MindMate API is running' });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
