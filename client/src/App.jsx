import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GamificationProvider } from './context/GamificationContext';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MoodTracker from './pages/MoodTracker';
import MoodAnalytics from './pages/MoodAnalytics';
import AIChat from './pages/AIChat';
import Community from './pages/Community';
import Matches from './pages/Matches';
import Settings from './pages/Settings';
import Resources from './pages/Resources';
import Breathing from './pages/Breathing';
import Meditation from './pages/Meditation';
import Journal from './pages/Journal';
import Crisis from './pages/Crisis';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import WellnessLibrary from './pages/WellnessLibrary';
import WellnessProgress from './pages/WellnessProgress';
import Goals from './pages/Goals';
import SafetyPlan from './pages/SafetyPlan';
import Gamification from './pages/Gamification';
import CBTTools from './pages/CBTTools';
import SavedPosts from './pages/SavedPosts';
import TherapistDirectory from './pages/TherapistDirectory';
import TherapistProfile from './pages/TherapistProfile';
import Appointments from './pages/Appointments';
import AssessmentHub from './pages/AssessmentHub';
import AssessmentTest from './pages/AssessmentTest';
import AssessmentHistory from './pages/AssessmentHistory';
import SocialHub from './pages/SocialHub';
import SocialFeatures from './pages/SocialFeatures';
import ChallengesHub from './pages/ChallengesHub';
import ChallengeDetails from './pages/ChallengeDetails';
import Integrations from './pages/Integrations';
import AIInsights from './pages/AIInsights';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetails from './pages/admin/UserDetails';
import PostModeration from './pages/admin/PostModeration';
import Reports from './pages/admin/Reports';
import CrisisAlerts from './pages/admin/CrisisAlerts';
import Analytics from './pages/admin/Analytics';
import ContentManagement from './pages/admin/ContentManagement';
import TeamManagement from './pages/admin/TeamManagement';
import AuditLog from './pages/admin/AuditLog';

// Components
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/mood" element={
          <ProtectedRoute>
            <MoodTracker />
          </ProtectedRoute>
        } />
        <Route path="/mood-analytics" element={
          <ProtectedRoute>
            <MoodAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <AIChat />
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        } />
        <Route path="/matches" element={
          <ProtectedRoute>
            <Matches />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/resources" element={
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        } />
        <Route path="/resources/breathing" element={
          <ProtectedRoute>
            <Breathing />
          </ProtectedRoute>
        } />
        <Route path="/resources/meditation" element={
          <ProtectedRoute>
            <Meditation />
          </ProtectedRoute>
        } />
        <Route path="/resources/journal" element={
          <ProtectedRoute>
            <Journal />
          </ProtectedRoute>
        } />
        <Route path="/resources/crisis" element={
          <ProtectedRoute>
            <Crisis />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/wellness" element={
          <ProtectedRoute>
            <WellnessLibrary />
          </ProtectedRoute>
        } />
        <Route path="/wellness/progress" element={
          <ProtectedRoute>
            <WellnessProgress />
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        } />
        <Route path="/safety-plan" element={
          <ProtectedRoute>
            <SafetyPlan />
          </ProtectedRoute>
        } />
        <Route path="/gamification" element={
          <ProtectedRoute>
            <Gamification />
          </ProtectedRoute>
        } />
        <Route path="/cbt-tools" element={
          <ProtectedRoute>
            <CBTTools />
          </ProtectedRoute>
        } />
        <Route path="/saved-posts" element={
          <ProtectedRoute>
            <SavedPosts />
          </ProtectedRoute>
        } />
        <Route path="/therapists" element={
          <ProtectedRoute>
            <TherapistDirectory />
          </ProtectedRoute>
        } />
        <Route path="/therapists/:id" element={
          <ProtectedRoute>
            <TherapistProfile />
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        } />
        <Route path="/assessments" element={
          <ProtectedRoute>
            <AssessmentHub />
          </ProtectedRoute>
        } />
        <Route path="/assessments/:type" element={
          <ProtectedRoute>
            <AssessmentTest />
          </ProtectedRoute>
        } />
        <Route path="/assessments/:type/history" element={
          <ProtectedRoute>
            <AssessmentHistory />
          </ProtectedRoute>
        } />
        <Route path="/social-hub" element={
          <ProtectedRoute>
            <SocialHub />
          </ProtectedRoute>
        } />
        <Route path="/social/*" element={
          <ProtectedRoute>
            <SocialFeatures />
          </ProtectedRoute>
        } />
        <Route path="/challenges" element={
          <ProtectedRoute>
            <ChallengesHub />
          </ProtectedRoute>
        } />
        <Route path="/challenges/:id" element={
          <ProtectedRoute>
            <ChallengeDetails />
          </ProtectedRoute>
        } />
        <Route path="/integrations" element={
          <ProtectedRoute>
            <Integrations />
          </ProtectedRoute>
        } />
        <Route path="/ai-insights" element={
          <ProtectedRoute>
            <AIInsights />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="moderation" element={<PostModeration />} />
          <Route path="moderation/reports" element={<Reports />} />
          <Route path="crisis" element={<CrisisAlerts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="audit-log" element={<AuditLog />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <GamificationProvider>
          <AppRoutes />
        </GamificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
