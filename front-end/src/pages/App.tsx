import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import VerifyEmail from './VerifyEmail';
import OnboardingChoice from './OnboardingChoice';
import OnboardingOrganizer from './OnboardingOrganizer';
import OnboardingSignup from './OnboardingSignup';
import EmailConfirmation from './EmailConfirmation';
import OnboardingBrandInfo from './OnboardingBrandInfo';
import OnboardingInterests from './OnboardingInterests';
import DashboardAttendee from './dashboard/DashboardAttendee';
import DashboardOrganizer from './dashboard/DashboardOrganizer';
import SearchResult from './SearchResult';
import EventDetailsGlobal from './EventDetailsGlobal';
import TicketList from './TicketList';
import PurchaseConfirmation from './PurchaseConfirmation';
import Unauthorized from './Unauthorized';
import OAuthCallback from './OAuthCallback';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to onboarding choice */}
        <Route path="/" element={<Navigate to="/onboarding-choice" replace />} />
        
        {/* Auth Routes - Redirect authenticated users to dashboard */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Onboarding Routes */}
        <Route path="/onboarding-choice" element={
          <PublicRoute>
            <OnboardingChoice />
          </PublicRoute>
        } />
        <Route path="/onboarding-organizer" element={
          <PublicRoute>
            <OnboardingOrganizer />
          </PublicRoute>
        } />
        <Route path="/onboarding-signup" element={
          <PublicRoute>
            <OnboardingSignup />
          </PublicRoute>
        } />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/onboarding-brand-info" element={
          <ProtectedRoute>
            <OnboardingBrandInfo />
          </ProtectedRoute>
        } />
        <Route path="/onboarding-interests" element={
          <ProtectedRoute>
            <OnboardingInterests />
          </ProtectedRoute>
        } />
        
        {/* Protected Dashboard Routes - Role-based access */}
        <Route 
          path="/dashboard-attendee" 
          element={
            <ProtectedRoute requiredRole="attendee">
              <DashboardAttendee />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard-organizer" 
          element={
            <ProtectedRoute requiredRole="organizer">
              <DashboardOrganizer />
            </ProtectedRoute>
          } 
        />
        
        {/* Unauthorized Page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* OAuth Callback */}
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        
        {/* Public Routes - Accessible to everyone */}
        <Route path="/search-results" element={<SearchResult />} />
        <Route path="/event/:eventId" element={<EventDetailsGlobal />} />
        <Route path="/event/:eventId/tickets" element={<TicketList />} />
        <Route path="/event/:eventId/tickets/confirmation" element={
          <ProtectedRoute>
            <PurchaseConfirmation />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;