
"use client";

import { useState, useEffect } from 'react';

interface User {
  uid: string;
  isAnonymous: boolean;
}

interface AuthState {
  user: User | null;
  isAnonymous: boolean | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

// A simple, non-crypto random ID generator that works in any environment
const generateMockId = () => {
  return 'mock-' + Math.random().toString(36).substr(2, 9);
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock authentication - always return a mock user
    const mockUser: User = {
      uid: generateMockId(),
      isAnonymous: true
    };

    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const signOut = async () => {
    // Mock sign out - just clear the user
    setUser(null);
  };

  return {
    user,
    isAnonymous: user?.isAnonymous ?? null,
    isLoading,
    signOut
  };
}
