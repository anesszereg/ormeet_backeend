import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Register, ForgotPassword, OnboardingChoice, OnboardingOrganizer, OnboardingSignup, EmailConfirmation, OnboardingBrandInfo, OnboardingInterests, DashboardAttendee, SearchResult, EventDetailsSearchResults } from '../pages';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to onboarding choice */}
        <Route path="/" element={<Navigate to="/dashboard-attendee" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding-choice" element={<OnboardingChoice />} />
        <Route path="/onboarding-organizer" element={<OnboardingOrganizer />} />
        <Route path="/onboarding-signup" element={<OnboardingSignup />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/onboarding-brand-info" element={<OnboardingBrandInfo />} />
        <Route path="/onboarding-interests" element={<OnboardingInterests />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard-attendee" element={<DashboardAttendee />} />
        
        {/* Search Results */}
        <Route path="/search-results" element={<SearchResult />} />
        
        {/* Event Details */}
        <Route path="/event/:eventId" element={<EventDetailsSearchResults />} />
        
        {/* TODO: Add other routes */}
        {/* <Route path="/events" element={<Events />} /> */}
        {/* <Route path="/profile" element={<Profile />} /> */}
      </Routes>
    </Router>
  );
};


export default App;