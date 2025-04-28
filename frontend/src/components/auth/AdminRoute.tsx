import React, { ReactNode } from 'react';
import { Route, Redirect, RouteProps, RouteComponentProps, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminRouteProps extends Omit<RouteProps, 'render'> {
  redirectTo?: string;
  children: ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard',
  ...rest 
}) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    // Return loading indicator while auth state is being determined
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Create an access denied component
  const AccessDeniedPage = () => (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">
          You don't have permission to access the admin dashboard.
        </p>
        <Link to="/dashboard" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <Route
      {...rest}
      render={(props: RouteComponentProps) => {
        // If no user, redirect to login
        if (!user) {
          return (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: props.location }
              }}
            />
          );
        }
        
        // If not admin, show access denied
        if (!isAdmin) {
          return <AccessDeniedPage />;
        }
        
        // Otherwise, render the admin content
        return children;
      }}
    />
  );
}; 