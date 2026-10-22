import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseClientConfigured } from '../lib/supabase';
import { DEMO_PROFILES } from '../lib/mockData';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    organizationName?: string,
    city?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  isDonor: boolean;
  isRecipient: boolean;
  isVolunteer: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('shareplate_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_PROFILES.donor;
      }
    }
    // Default to Donor role for smooth initial hackathon demo exploration
    return DEMO_PROFILES.donor;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseClientConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            localStorage.setItem('shareplate_token', session.access_token);
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile);
              setIsDemoUser(false);
              localStorage.setItem('shareplate_current_user', JSON.stringify(profile));
            }
          }
        } catch (e) {
          console.warn('Supabase session load failed, falling back to demo state');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      if (isSupabaseClientConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          localStorage.setItem('shareplate_token', data.session.access_token);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setUser(profile);
            setIsDemoUser(false);
            localStorage.setItem('shareplate_current_user', JSON.stringify(profile));
          }
          return;
        }
      }

      // Demo login matching
      if (email.includes('donor')) switchDemoRole('donor');
      else if (email.includes('recipient') || email.includes('ngo')) switchDemoRole('recipient');
      else if (email.includes('volunteer')) switchDemoRole('volunteer');
      else if (email.includes('admin')) switchDemoRole('admin');
      else switchDemoRole('donor');
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    organizationName?: string,
    city?: string
  ): Promise<void> => {
    setLoading(true);
    try {
      if (role === 'admin') {
        throw new Error('Public registration as Administrator is not permitted.');
      }

      if (isSupabaseClientConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              organization_name: organizationName,
              city: city || 'Delhi NCR',
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          const newProfile: UserProfile = {
            id: data.user.id,
            full_name: fullName,
            role,
            organization_name: organizationName,
            city: city || 'Delhi NCR',
          };
          setUser(newProfile);
          setIsDemoUser(false);
          localStorage.setItem('shareplate_current_user', JSON.stringify(newProfile));
          return;
        }
      }

      // Demo signup
      const newDemoUser: UserProfile = {
        id: `user-${Date.now()}`,
        full_name: fullName,
        role,
        organization_name: organizationName,
        city: city || 'Delhi NCR',
      };
      setUser(newDemoUser);
      setIsDemoUser(true);
      localStorage.setItem('shareplate_current_user', JSON.stringify(newDemoUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseClientConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('shareplate_token');
    localStorage.removeItem('shareplate_current_user');
    setUser(null);
  };

  const switchDemoRole = (role: UserRole) => {
    const profile = DEMO_PROFILES[role] || DEMO_PROFILES.donor;
    setUser(profile);
    setIsDemoUser(true);
    localStorage.setItem('shareplate_token', `demo-user-${role}`);
    localStorage.setItem('shareplate_current_user', JSON.stringify(profile));
  };

  const isDonor = user?.role === 'donor';
  const isRecipient = user?.role === 'recipient';
  const isVolunteer = user?.role === 'volunteer';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoUser,
        login,
        register,
        logout,
        switchDemoRole,
        isDonor,
        isRecipient,
        isVolunteer,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
