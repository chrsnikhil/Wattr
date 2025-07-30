// User roles and authentication utilities
export type UserRole = 'prosumer' | 'viewer';

export interface UserProfile {
  walletAddress: string;
  role: UserRole;
  displayName?: string;
  registeredAt: string;
  lastActive: string;
  permissions: Permission[];
}

export interface Permission {
  action: string;
  resource: string;
  allowed: boolean;
}

// Default permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  prosumer: [
    { action: 'read', resource: 'marketplace', allowed: true },
    { action: 'access', resource: 'marketplace', allowed: true },
    { action: 'create', resource: 'listing', allowed: true },
    { action: 'create', resource: 'listings', allowed: true }, // Added for backwards compatibility
    { action: 'buy', resource: 'energy', allowed: true },
    { action: 'sell', resource: 'energy', allowed: true },
    { action: 'trade', resource: 'energy', allowed: true }, // Added for token operations
    { action: 'mint', resource: 'tokens', allowed: true }, // Added for token minting
    { action: 'burn', resource: 'tokens', allowed: true }, // Added for token burning
    { action: 'view', resource: 'analytics', allowed: true },
    { action: 'view', resource: 'energy-data', allowed: true },
    { action: 'create', resource: 'transactions', allowed: true },
    { action: 'manage', resource: 'profile', allowed: true },
  ],
  viewer: [
    { action: 'read', resource: 'marketplace', allowed: true },
    { action: 'access', resource: 'marketplace', allowed: false },
    { action: 'view', resource: 'analytics', allowed: true },
    { action: 'view', resource: 'energy-data', allowed: true },
    { action: 'create', resource: 'listing', allowed: false },
    { action: 'create', resource: 'listings', allowed: false },
    { action: 'buy', resource: 'energy', allowed: false },
    { action: 'sell', resource: 'energy', allowed: false },
    { action: 'trade', resource: 'energy', allowed: false },
    { action: 'mint', resource: 'tokens', allowed: false },
    { action: 'burn', resource: 'tokens', allowed: false },
    { action: 'create', resource: 'transactions', allowed: false },
    { action: 'manage', resource: 'profile', allowed: false },
  ],
};

// Mock user database (in a real app, this would be in a database)
const MOCK_USERS: Record<string, UserProfile> = {
  // Demo prosumer users
  '0x1234567890abcdef1234567890abcdef12345678': {
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    role: 'prosumer',
    displayName: 'Solar Producer A',
    registeredAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS.prosumer,
  },
  '0xabcdef1234567890abcdef1234567890abcdef12': {
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    role: 'prosumer',
    displayName: 'Wind Farm B',
    registeredAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS.prosumer,
  },
  // Demo viewer users
  '0x9876543210fedcba9876543210fedcba98765432': {
    walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
    role: 'viewer',
    displayName: 'Demo Viewer',
    registeredAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS.viewer,
  },
};

export class UserRoleManager {
  // Get user profile by wallet address
  static getUserProfile(walletAddress: string): UserProfile | null {
    return MOCK_USERS[walletAddress] || null;
  }

  // Register new user with role
  static registerUser(
    walletAddress: string,
    role: UserRole,
    displayName?: string,
  ): UserProfile {
    const userProfile: UserProfile = {
      walletAddress,
      role,
      displayName:
        displayName || `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      registeredAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      permissions: ROLE_PERMISSIONS[role],
    };

    MOCK_USERS[walletAddress] = userProfile;
    return userProfile;
  }

  // Update user's last active timestamp
  static updateLastActive(walletAddress: string): void {
    if (MOCK_USERS[walletAddress]) {
      MOCK_USERS[walletAddress].lastActive = new Date().toISOString();
    }
  }

  // Check if user has specific permission
  static hasPermission(
    walletAddress: string,
    action: string,
    resource: string,
  ): boolean {
    const userProfile = this.getUserProfile(walletAddress);
    if (!userProfile) return false;

    return userProfile.permissions.some(
      permission =>
        permission.action === action &&
        permission.resource === resource &&
        permission.allowed,
    );
  }

  // Get all users (for demo/admin purposes)
  static getAllUsers(): UserProfile[] {
    return Object.values(MOCK_USERS);
  }

  // Get users by role
  static getUsersByRole(role: UserRole): UserProfile[] {
    return Object.values(MOCK_USERS).filter(user => user.role === role);
  }

  // Role upgrade/downgrade (for demo purposes)
  static updateUserRole(
    walletAddress: string,
    newRole: UserRole,
  ): UserProfile | null {
    const userProfile = MOCK_USERS[walletAddress];
    if (!userProfile) return null;

    userProfile.role = newRole;
    userProfile.permissions = ROLE_PERMISSIONS[newRole];
    userProfile.lastActive = new Date().toISOString();

    return userProfile;
  }

  // Clear a user (for logout/role switching)
  static clearUser(walletAddress: string): void {
    delete MOCK_USERS[walletAddress];
  }

  // Refresh user permissions with latest role permissions
  static refreshUserPermissions(walletAddress: string): UserProfile | null {
    const user = MOCK_USERS[walletAddress];
    if (user) {
      user.permissions = ROLE_PERMISSIONS[user.role];
      user.lastActive = new Date().toISOString();
      return user;
    }
    return null;
  }

  // Refresh all users with updated permissions
  static refreshAllUserPermissions(): void {
    Object.keys(MOCK_USERS).forEach(walletAddress => {
      const user = MOCK_USERS[walletAddress];
      if (user) {
        user.permissions = ROLE_PERMISSIONS[user.role];
      }
    });
  }

  // Auto-assign role based on wallet activity or manual selection
  static autoAssignRole(walletAddress: string): UserRole {
    // For demo purposes, randomly assign roles
    // In a real app, this might be based on:
    // - User selection during onboarding
    // - Wallet transaction history
    // - Energy meter ownership verification
    // - KYC/verification status

    const roles: UserRole[] = ['prosumer', 'viewer'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];

    return randomRole;
  }

  // Get role display information
  static getRoleInfo(role: UserRole): {
    name: string;
    description: string;
    capabilities: string[];
    icon: string;
  } {
    switch (role) {
      case 'prosumer':
        return {
          name: 'Prosumer',
          description: 'Full access to buy, sell, and trade renewable energy',
          capabilities: [
            'View energy marketplace',
            'Create energy listings',
            'Buy and sell energy',
            'Access trading analytics',
            'Manage energy meters',
            'Create transactions',
          ],
          icon: '⚡',
        };
      case 'viewer':
        return {
          name: 'Viewer',
          description: 'Read-only access to view marketplace and data',
          capabilities: [
            'View energy marketplace',
            'View trading analytics',
            'View energy production data',
            'Monitor market trends',
          ],
          icon: '👁️',
        };
      default:
        return {
          name: 'Unknown',
          description: 'Unknown role',
          capabilities: [],
          icon: '❓',
        };
    }
  }
}

// Permission checking utility function
export function checkPermission(
  userProfile: UserProfile | null,
  action: string,
  resource: string,
): boolean {
  if (!userProfile) return false;
  return UserRoleManager.hasPermission(
    userProfile.walletAddress,
    action,
    resource,
  );
}

// Role-based component wrapper
export function requiresRole(allowedRoles: UserRole[]) {
  return function (userProfile: UserProfile | null): boolean {
    if (!userProfile) return false;
    return allowedRoles.includes(userProfile.role);
  };
}

// Demo data for testing
export const DEMO_WALLETS = {
  prosumer1: '0x1234567890abcdef1234567890abcdef12345678',
  prosumer2: '0xabcdef1234567890abcdef1234567890abcdef12',
  viewer1: '0x9876543210fedcba9876543210fedcba98765432',
};
