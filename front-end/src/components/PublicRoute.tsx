import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectAuthenticated?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectAuthenticated = true 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4000]"></div>
      </div>
    );
  }

  // If user is authenticated and we want to redirect them
  if (isAuthenticated && redirectAuthenticated) {
    // Check where they came from or redirect based on role
    const from = location.state?.from?.pathname;
    
    if (from) {
      return <Navigate to={from} replace />;
    }

    // Redirect based on user role
    if (user?.roles?.includes('organizer')) {
      return <Navigate to="/dashboard-organizer" replace />;
    } else if (user?.roles?.includes('attendee')) {
      return <Navigate to="/dashboard-attendee" replace />;
    } else {
      return <Navigate to="/onboarding-choice" replace />;
    }
  }

  return <>{children}</>;
};

export default PublicRoute;
