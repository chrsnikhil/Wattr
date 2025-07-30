'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { UserRoleManager, UserProfile, UserRole } from '@/lib/user-roles';

export interface UseUserRoleResult {
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: (action: string, resource: string) => boolean;
  registerUser: (role: UserRole, displayName?: string) => Promise<UserProfile>;
  updateRole: (newRole: UserRole) => Promise<UserProfile | null>;
  clearRole: () => void;
  refreshProfile: () => void;
}

export function useUserRole(): UseUserRoleResult {
  const { authenticated, user } = usePrivy();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = user?.wallet?.address || '';

  // Load user profile when wallet connects
  const loadUserProfile = useCallback(async () => {
    if (!walletAddress || !authenticated) {
      setUserProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user already exists
      let profile = UserRoleManager.getUserProfile(walletAddress);

      if (!profile) {
        // New user - auto-assign role for demo
        const autoRole = UserRoleManager.autoAssignRole(walletAddress);
        profile = UserRoleManager.registerUser(
          walletAddress,
          autoRole,
          `${autoRole.charAt(0).toUpperCase() + autoRole.slice(1)} User`,
        );
      } else {
        // Update last active timestamp and refresh permissions
        UserRoleManager.updateLastActive(walletAddress);
        profile =
          UserRoleManager.refreshUserPermissions(walletAddress) || profile;
        UserRoleManager.updateLastActive(walletAddress);
      }

      setUserProfile(profile);
    } catch (err) {
      setError(`Failed to load user profile: ${err}`);
      console.error('Error loading user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, authenticated]);

  // Register new user with specific role
  const registerUser = useCallback(
    async (role: UserRole, displayName?: string): Promise<UserProfile> => {
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const profile = UserRoleManager.registerUser(
          walletAddress,
          role,
          displayName,
        );
        setUserProfile(profile);
        return profile;
      } catch (err) {
        const errorMessage = `Failed to register user: ${err}`;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress],
  );

  // Update user role
  const updateRole = useCallback(
    async (newRole: UserRole): Promise<UserProfile | null> => {
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedProfile = UserRoleManager.updateUserRole(
          walletAddress,
          newRole,
        );
        setUserProfile(updatedProfile);
        return updatedProfile;
      } catch (err) {
        const errorMessage = `Failed to update role: ${err}`;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress],
  );

  // Check if user has specific permission
  const hasPermission = useCallback(
    (action: string, resource: string): boolean => {
      if (!userProfile) return false;
      return UserRoleManager.hasPermission(
        userProfile.walletAddress,
        action,
        resource,
      );
    },
    [userProfile],
  );

  // Clear user role and profile (for role switching)
  const clearRole = useCallback(() => {
    if (walletAddress) {
      UserRoleManager.clearUser(walletAddress);
      setUserProfile(null);
    }
  }, [walletAddress]);

  // Refresh user profile
  const refreshProfile = useCallback(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Load profile when wallet changes
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  return {
    userProfile,
    isAuthenticated: authenticated && !!userProfile,
    isLoading,
    error,
    hasPermission,
    registerUser,
    updateRole,
    clearRole,
    refreshProfile,
  };
}
