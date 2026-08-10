import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requireEmailVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireEmailVerification = false 
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

  if (!isAuthenticated) {
    return <Navigate to="/onboarding-choice" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireEmailVerification && !user?.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
