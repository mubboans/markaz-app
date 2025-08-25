import { create } from '@/utils/store';
import axios from 'axios';
import { router } from 'expo-router';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  contact?: string;
  password?: string;
  confirmPassword?: string;
  role: 'user' | 'mosque_admin' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading?: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, contact: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email: string, password: string) => {
    // Simulate API call
    console.log('Login attempt:', email, password);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo credentials for testing
    try {
       
    } catch (error) {
        
    }
    if (email === 'admin@markaz.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        name: 'Admin User',
        email,
        role: 'admin',
      };
      set({ user: adminUser, isAuthenticated: true });
      return;
    }
    
    if (email === 'imam@masjid.com' && password === 'imam123') {
      const mosqueAdminUser: User = {
        id: '2',
        name: 'Mosque Admin',
        email,
        role: 'mosque_admin',
      };
      set({ user: mosqueAdminUser, isAuthenticated: true });
      return;
    }
    
    const mockUser: User = {
      id: Date.now().toString(),
      name: 'Regular User',
      email,
      role: 'user',
    };

    set({ user: mockUser, isAuthenticated: true });
  },

  logout: () => {
    router.replace('/login');
    set({ user: null, isAuthenticated: false });
  },

  register: async (name: string, email: string, contact: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      contact,
      password,
      role: 'user',
    };

    set({ user: newUser, isAuthenticated: true });
  },
}));