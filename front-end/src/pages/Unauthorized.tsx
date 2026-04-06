import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleGoBack = () => {
    // Redirect based on user role
    if (isAuthenticated && user?.roles) {
      if (user.roles.includes('organizer')) {
        navigate('/dashboard-organizer');
      } else if (user.roles.includes('attendee')) {
        navigate('/dashboard-attendee');
      } else {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-[#FF4000]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        
        <button
          onClick={handleGoBack}
          className="inline-flex items-center px-6 py-3 bg-[#FF4000] text-white font-medium rounded-full hover:bg-[#E63900] transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
