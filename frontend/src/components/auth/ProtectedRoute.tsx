import React, { ReactNode } from 'react';
import { Route, Redirect, RouteProps, RouteComponentProps } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps extends Omit<RouteProps, 'render'> {
  redirectTo?: string;
  requiresApproval?: boolean;
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login', 
  requiresApproval = true,
  ...rest 
}) => {
  const { user, loading, isAdmin, isApproved } = useAuth();

  if (loading) {
    // Return loading indicator while auth state is being determined
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Create a pending approval page component
  const PendingApprovalPage = () => (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Waiting for Approval</h1>
        <p className="mb-6">
          Your account is pending admin approval. You'll receive an email once your account has been approved.
        </p>
        <p className="text-gray-400 text-sm">
          If you have any questions, please contact support.
        </p>
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
                pathname: redirectTo,
                state: { from: props.location }
              }}
            />
          );
        }
        
        // If requiresApproval is true and user is not approved and not an admin
        if (requiresApproval && !isApproved && !isAdmin) {
          return <PendingApprovalPage />;
        }
        
        // Otherwise, render the protected content
        return children;
      }}
    />
  );
}; 