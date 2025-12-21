import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
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
import SearchResult from './SearchResult';
import EventDetailsGlobal from './EventDetailsGlobal';
import TicketList from './TicketList';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to onboarding choice */}
        <Route path="/" element={<Navigate to="/onboarding-choice" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Onboarding Routes */}
        <Route path="/onboarding-choice" element={<OnboardingChoice />} />
        <Route path="/onboarding-organizer" element={<OnboardingOrganizer />} />
        <Route path="/onboarding-signup" element={<OnboardingSignup />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/onboarding-brand-info" element={<OnboardingBrandInfo />} />
        <Route path="/onboarding-interests" element={<OnboardingInterests />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard-attendee" 
          element={
            <ProtectedRoute>
              <DashboardAttendee />
            </ProtectedRoute>
          } 
        />
        
        {/* Public Search Routes */}
        <Route path="/search-results" element={<SearchResult />} />
        <Route path="/event/:eventId" element={<EventDetailsGlobal />} />
        <Route path="/event/:eventId/tickets" element={<TicketList />} />
        
        {/* TODO: Add other routes */}
        {/* <Route path="/events" element={<Events />} /> */}
        {/* <Route path="/profile" element={<Profile />} /> */}
      </Routes>
    </Router>
  );
};


export default App;