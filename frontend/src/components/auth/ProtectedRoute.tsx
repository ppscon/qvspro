import React, { ReactNode } from 'react';
import { Route, Redirect, RouteProps, RouteComponentProps } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps extends Omit<RouteProps, 'render'> {
  redirectTo?: string;
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login', 
  ...rest 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Return loading indicator while auth state is being determined
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={(props: RouteComponentProps) =>
        user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: redirectTo,
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
}; 