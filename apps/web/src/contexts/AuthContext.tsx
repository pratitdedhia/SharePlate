import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseClientConfigured } from '../lib/supabase';
import { DEMO_PROFILES, demoStore } from '../lib/mockData';
import { liveUpdatesService } from '../services/liveUpdates';
import { UserProfile, UserRole, RegistrationData } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isDemoUser: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (
    email: string,
    password: string,
    data: RegistrationData
  ) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  loginDemoRole: (role: UserRole) => Promise<UserProfile>;
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
        return null;
      }
    }
    // Unauthenticated guest by default; visitors see common taskbar until logging in
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(() => {
    const token = localStorage.getItem('shareplate_token');
    return !token || token.startsWith('demo-user-') || !isSupabaseClientConfigured;
  });

  useEffect(() => {
    let authSubscription: any = null;

    const initAuth = async () => {
      if (isSupabaseClientConfigured && supabase) {
        const client = supabase;
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            localStorage.setItem('shareplate_token', session.access_token);
            // Authoritative profile retrieval from PostgreSQL
            const { data: profile, error } = await client
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.warn('Profile fetch error, using auth metadata:', error.message);
            }

            if (profile) {
              if (profile.is_active === false) {
                await client.auth.signOut();
                localStorage.removeItem('shareplate_token');
                localStorage.removeItem('shareplate_current_user');
                setUser(null);
                setLoading(false);
                return;
              }
              setUser(profile);
              setIsDemoUser(false);
              localStorage.setItem('shareplate_current_user', JSON.stringify(profile));
            }
          }

          const { data: subData } = client.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
              // Only clear if not in deliberate demo session
              const currentToken = localStorage.getItem('shareplate_token');
              if (currentToken && !currentToken.startsWith('demo-user-')) {
                setUser(null);
                localStorage.removeItem('shareplate_token');
                localStorage.removeItem('shareplate_current_user');
              }
            } else if (session?.user) {
              localStorage.setItem('shareplate_token', session.access_token);
              const { data: profile } = await client
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profile) {
                if (profile.is_active === false) {
                  await client.auth.signOut();
                  setUser(null);
                  return;
                }
                setUser(profile);
                setIsDemoUser(false);
                localStorage.setItem('shareplate_current_user', JSON.stringify(profile));
              }
            }
          });
          authSubscription = subData.subscription;
        } catch (e) {
          console.warn('Supabase session load failed, preserving existing session state');
        }
      }
      setLoading(false);
    };

    initAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error('Please enter both email address and password.');
      }

      if (isSupabaseClientConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session && data.user) {
          localStorage.setItem('shareplate_token', data.session.access_token);
          const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (pError || !profile) {
            // Fallback to trusted metadata if profile record is syncing
            const meta = data.user.user_metadata || {};
            const fallbackProfile: UserProfile = {
              id: data.user.id,
              full_name: meta.full_name || email.split('@')[0],
              email: data.user.email || email,
              role: (meta.role as UserRole) || 'donor',
              organization_name: meta.organization_name || null,
              phone: meta.phone || null,
              city: meta.city || 'Delhi NCR',
              is_active: true,
            };
            setUser(fallbackProfile);
            setIsDemoUser(false);
            localStorage.setItem('shareplate_current_user', JSON.stringify(fallbackProfile));
            return fallbackProfile;
          }

          if (profile.is_active === false) {
            await supabase.auth.signOut();
            throw new Error('This account has been deactivated. Please contact platform administrators.');
          }

          setUser(profile);
          setIsDemoUser(false);
          localStorage.setItem('shareplate_current_user', JSON.stringify(profile));
          return profile;
        }
      }

      // Demo/Development Preview Authentication
      const normalizedEmail = email.toLowerCase().trim();
      let matchedProfile: UserProfile | undefined;

      if (normalizedEmail.includes('donor')) {
        matchedProfile = DEMO_PROFILES.donor;
      } else if (normalizedEmail.includes('recipient') || normalizedEmail.includes('ngo')) {
        matchedProfile = DEMO_PROFILES.recipient;
      } else if (normalizedEmail.includes('volunteer')) {
        matchedProfile = DEMO_PROFILES.volunteer;
      } else if (normalizedEmail.includes('admin')) {
        matchedProfile = DEMO_PROFILES.admin;
      } else {
        // Check registered demo users in demoStore
        const existingUsers = demoStore.getUsers();
        matchedProfile = existingUsers.find((u) => u.email?.toLowerCase() === normalizedEmail);
      }

      if (!matchedProfile) {
        // If password is too short or email not recognized in demo mode
        if (password.length < 6) {
          throw new Error('Invalid credentials: password must be at least 6 characters.');
        }
        // Create an on-the-fly authenticated preview user
        matchedProfile = {
          id: `user-${Date.now()}`,
          full_name: email.split('@')[0],
          email,
          role: 'donor',
          city: 'Delhi NCR',
          is_active: true,
        };
      }

      if (matchedProfile.is_active === false) {
        throw new Error('This account has been deactivated by platform administrators.');
      }

      setUser(matchedProfile);
      setIsDemoUser(true);
      localStorage.setItem('shareplate_token', `demo-user-${matchedProfile.role}`);
      localStorage.setItem('shareplate_current_user', JSON.stringify(matchedProfile));
      return matchedProfile;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    data: RegistrationData
  ): Promise<UserProfile> => {
    setLoading(true);
    try {
      // 1. Strict Server-Side & Client Constraint: NEVER allow admin via public registration
      if ((data.role as string) === 'admin') {
        throw new Error('Public registration as Administrator is strictly prohibited.');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      if (isSupabaseClientConfigured && supabase) {
        const { data: authData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: data.fullName,
              role: data.role,
              organization_name: data.organizationName,
              phone: data.phone,
              city: data.city || 'Delhi NCR',
              service_area: data.serviceArea,
              donor_type: data.donorType,
              recipient_type: data.recipientType,
              contact_person: data.contactPerson,
              availability: data.availability,
              bio: data.bio,
              avatar_url: data.avatarUrl,
            },
          },
        });

        if (error) throw error;

        if (authData.user) {
          const newProfile: UserProfile = {
            id: authData.user.id,
            full_name: data.fullName,
            email,
            role: data.role,
            organization_name: data.organizationName || null,
            phone: data.phone,
            city: data.city || 'Delhi NCR',
            service_area: data.serviceArea || null,
            donor_type: data.donorType || null,
            recipient_type: data.recipientType || null,
            contact_person: data.contactPerson || null,
            availability: data.availability || null,
            bio: data.bio || null,
            avatar_url: data.avatarUrl || null,
            is_active: true,
          };

          // If session is immediately established (email confirmation disabled in Supabase)
          if (authData.session) {
            localStorage.setItem('shareplate_token', authData.session.access_token);
            setUser(newProfile);
            setIsDemoUser(false);
            localStorage.setItem('shareplate_current_user', JSON.stringify(newProfile));
          }

          return newProfile;
        }
      }

      // Demo Mode Registration
      const newDemoUser: UserProfile = {
        id: `user-${Date.now()}`,
        full_name: data.fullName,
        email,
        role: data.role,
        organization_name: data.organizationName || null,
        phone: data.phone,
        city: data.city || 'Delhi NCR',
        service_area: data.serviceArea || null,
        donor_type: data.donorType || null,
        recipient_type: data.recipientType || null,
        contact_person: data.contactPerson || null,
        availability: data.availability || null,
        bio: data.bio || null,
        avatar_url: data.avatarUrl || null,
        is_active: true,
      };

      demoStore.addUser(newDemoUser);
      setUser(newDemoUser);
      setIsDemoUser(true);
      localStorage.setItem('shareplate_token', `demo-user-${newDemoUser.role}`);
      localStorage.setItem('shareplate_current_user', JSON.stringify(newDemoUser));
      return newDemoUser;
    } finally {
      setLoading(false);
    }
  };

  const loginDemoRole = async (role: UserRole): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = DEMO_PROFILES[role] || DEMO_PROFILES.donor;
      setUser(profile);
      setIsDemoUser(true);
      localStorage.setItem('shareplate_token', `demo-user-${role}`);
      localStorage.setItem('shareplate_current_user', JSON.stringify(profile));
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = (role: UserRole) => {
    loginDemoRole(role);
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid registered email address.');
    }

    if (isSupabaseClientConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return;
    }

    // Demo Mode Simulation
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.info(`[Demo Mode] Password reset link simulated for: ${email}`);
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    if (isSupabaseClientConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return;
    }

    // Demo Mode Simulation
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.info('[Demo Mode] Password successfully updated in session.');
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error('No active user session found.');

    const updatedUser: UserProfile = {
      ...user,
      ...updates,
    };

    if (isSupabaseClientConfigured && supabase && !isDemoUser) {
      const { error: sbError } = await supabase
        .from('profiles')
        .update({
          full_name: updatedUser.full_name,
          organization_name: updatedUser.organization_name,
          phone: updatedUser.phone,
          city: updatedUser.city,
          service_area: updatedUser.service_area,
          avatar_url: updatedUser.avatar_url,
          bio: updatedUser.bio,
        })
        .eq('id', user.id);

      if (sbError) {
        console.warn('Supabase profile update warning:', sbError.message);
      }
    }

    // Keep demo store updated
    demoStore.updateUser(user.id, updates);

    // Keep seeded demo role updated if applicable
    if (user.role && DEMO_PROFILES[user.role]) {
      Object.assign(DEMO_PROFILES[user.role], updates);
    }

    // Persist to local state & storage
    setUser(updatedUser);
    localStorage.setItem('shareplate_current_user', JSON.stringify(updatedUser));

    // Broadcast live change across components and tabs
    liveUpdatesService.notifyChange('profiles', 'UPDATE', updatedUser);

    return updatedUser;
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shareplate_current_user' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setUser(parsed);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const unsubscribe = liveUpdatesService.subscribe((eventType, payload) => {
      if ((eventType.startsWith('profiles') || eventType === 'state_synced') && payload) {
        setUser((prev) => {
          if (prev && (!payload.id || prev.id === payload.id)) {
            return { ...prev, ...payload };
          }
          return prev;
        });
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      if (isSupabaseClientConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('shareplate_token');
      localStorage.removeItem('shareplate_current_user');
      setUser(null);
      setIsDemoUser(false);
    } finally {
      setLoading(false);
    }
  };

  const role = user?.role || null;
  const isDonor = role === 'donor';
  const isRecipient = role === 'recipient';
  const isVolunteer = role === 'volunteer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        role,
        loading,
        isDemoUser,
        login,
        register,
        logout,
        resetPassword,
        updatePassword,
        updateProfile,
        loginDemoRole,
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
