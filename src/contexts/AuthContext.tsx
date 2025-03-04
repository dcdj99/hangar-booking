import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        setIsLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error);
        setIsLoading(false);
      }
    );

    // Attempt anonymous sign-in if not already signed in
    const signInAnonymouslyIfNeeded = async () => {
      try {
        // Only sign in if there's no current user
        if (!auth.currentUser) {
          await signInAnonymously(auth);
          console.log("User signed in anonymously");
        }
      } catch (error) {
        console.error("Anonymous auth error:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    signInAnonymouslyIfNeeded();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
