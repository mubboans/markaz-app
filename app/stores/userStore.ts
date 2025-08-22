import { create } from '@/utils/store';
import { User } from './authStore';

interface UserState {
  users: User[];
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@markaz.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Mosque Admin',
    email: 'imam@masjid.com',
    role: 'mosque_admin',
    mosqueId: '1',
  },
  {
    id: '3',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
  },
];

export const useUserStore = create<UserState>((set, get) => ({
  users: mockUsers,

  fetchUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ users: mockUsers });
  },

  addUser: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };
    set(state => ({ users: [...state.users, newUser] }));
  },

  updateUser: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      users: state.users.map(user =>
        user.id === id ? { ...user, ...updates } : user
      ),
    }));
  },

  deleteUser: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      users: state.users.filter(user => user.id !== id),
    }));
  },
}));