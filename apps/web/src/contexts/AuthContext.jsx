import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  const syncUserRole = async (user) => {
    if (!user) return null;
    try {
      // Check if email exists in admin_emails
      // Note: If the user doesn't have read access to admin_emails, this will throw 403.
      // In a real production app, this logic is better handled by a PocketBase hook.
      const adminRecord = await pb.collection('admin_emails').getFirstListItem(`email="${user.email}"`, { $autoCancel: false });
      
      if (adminRecord && adminRecord.role !== user.role) {
        // Update user role to match admin_emails
        const updatedUser = await pb.collection('users').update(user.id, { role: adminRecord.role }, { $autoCancel: false });
        return updatedUser;
      }
    } catch (error) {
      // If not found or 403 Forbidden, ensure role is '一般' if they shouldn't be admin
      // We skip downgrading here to avoid accidental lockouts if the query just failed due to permissions
      console.log('Admin check failed or user is not admin:', error.message);
    }
    return user;
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        try {
          await pb.collection('users').authRefresh({ $autoCancel: false });
          const syncedUser = await syncUserRole(pb.authStore.model);
          setCurrentUser(syncedUser || pb.authStore.model);
        } catch (error) {
          pb.authStore.clear();
          setCurrentUser(null);
        }
      }
      setInitialLoading(false);
    };

    checkAuth();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
    const syncedUser = await syncUserRole(authData.record);
    setCurrentUser(syncedUser);
    return authData;
  };

  const loginWithGoogle = async () => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
      const syncedUser = await syncUserRole(authData.record);
      setCurrentUser(syncedUser);
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const loginWithApple = async () => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'apple' });
      const syncedUser = await syncUserRole(authData.record);
      setCurrentUser(syncedUser);
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password, passwordConfirm, name) => {
    // Default to 一般, syncUserRole will upgrade if email is in admin_emails
    const userData = {
      email,
      password,
      passwordConfirm,
      name,
      role: '一般',
      emailVisibility: true
    };
    
    const record = await pb.collection('users').create(userData, { $autoCancel: false });
    await pb.collection('users').requestVerification(email, { $autoCancel: false });
    
    // Auto login after signup to sync role
    await login(email, password);
    
    return record;
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    navigate('/login');
  };

  const requestPasswordReset = async (email) => {
    await pb.collection('users').requestPasswordReset(email, { $autoCancel: false });
  };

  const updateProfile = async (userId, data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const updated = await pb.collection('users').update(userId, formData, { $autoCancel: false });
    setCurrentUser(updated);
    return updated;
  };

  const changePassword = async (oldPassword, newPassword, newPasswordConfirm) => {
    await pb.collection('users').update(currentUser.id, {
      oldPassword,
      password: newPassword,
      passwordConfirm: newPasswordConfirm
    }, { $autoCancel: false });
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    userRole: currentUser?.role || null,
    login,
    loginWithGoogle,
    loginWithApple,
    signup,
    logout,
    requestPasswordReset,
    updateProfile,
    changePassword,
    initialLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};