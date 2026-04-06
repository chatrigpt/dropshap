import { User, UserRole } from '../types';
import { generateId } from './utils';

const AUTH_KEY = 'dropshap_user';

export const auth = {
  getUser: (): User | null => {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },

  signup: (data: Omit<User, 'userId'>): User => {
    const user: User = {
      ...data,
      userId: generateId(data.role),
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  },

  login: (phone: string): User | null => {
    // In this MVP, we just check if the phone matches the stored user
    // or if it's a demo account
    const stored = auth.getUser();
    if (stored && stored.phone === phone) return stored;
    return null;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  loginAsDemo: (role: UserRole): User => {
    const demoUsers: Record<UserRole, User> = {
      admin: {
        role: 'admin',
        userId: 'ADM-0001',
        name: 'Admin Demo',
        phone: '0000',
        businessName: 'Dropshap HQ',
        category: 'Management',
      },
      supplier: {
        role: 'supplier',
        userId: 'SUP104',
        name: 'Yao Didier',
        phone: '2250779019255',
        businessName: 'Men Wellness CI',
        category: 'Santé',
      },
      dropshipper: {
        role: 'dropshipper',
        userId: 'DSP-DEMO-001',
        name: 'Dropshipper Demo',
        phone: '2222',
        businessName: 'QuickShop CI',
        category: 'General',
      },
    };
    const user = demoUsers[role];
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  },
};
