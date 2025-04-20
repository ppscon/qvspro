import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useHistory } from 'react-router-dom';

interface SignOutButtonProps {
  className?: string;
  iconOnly?: boolean;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ className = '', iconOnly = false }) => {
  const { signOut } = useAuth();
  const history = useHistory();

  const handleSignOut = async () => {
    await signOut();
    history.push('/');
  };

  return (
    <button
      onClick={handleSignOut}
      className={`flex items-center transition-colors ${className}`}
      aria-label="Sign out"
    >
      <FiLogOut className={iconOnly ? '' : 'mr-2'} />
      {!iconOnly && <span>Sign Out</span>}
    </button>
  );
};

export default SignOutButton; 