import { create } from '@/utils/store';

export interface Mosque {
  id: string;
  name: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  phone?: string;
  imam: string;
  capacity: number;
  prayerTimes: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  announcements: Announcement[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: Date;
  mosqueId: string;
}

interface MosqueState {
  mosques: Mosque[];
  selectedMosque: Mosque | null;
  fetchMosques: () => Promise<void>;
  fetchMosquesByLocation: (latitude: number, longitude: number) => Promise<Mosque[]>;
  fetchMosquesByArea: (area: string) => Promise<Mosque[]>;
  addMosque: (mosque: Omit<Mosque, 'id'>) => Promise<void>;
  updateMosque: (id: string, updates: Partial<Mosque>) => Promise<void>;
  deleteMosque: (id: string) => Promise<void>;
  setSelectedMosque: (mosque: Mosque | null) => void;
}

export const mockMosques: Mosque[] = [
  {
    id: '1',
    name: 'Al-Masjid Al-Kabir akjhsdjaksndklansd',
    location: 'Downtown Manhattan',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    address: '123 Main Street, New York, NY 10001',
    phone: '+1 (555) 123-4567',
    imam: 'Sheikh Abdullah Rahman',
    capacity: 500,
    prayerTimes: {
      fajr: '05:30',
      sunrise: '06:45',
      dhuhr: '12:15',
      asr: '15:30',
      maghrib: '18:45',
      isha: '20:00',
    },
    announcements: [],
  },
  {
    id: '2',
    name: 'Masjid An-Noor',
    location: 'Brooklyn Heights',
    coordinates: { latitude: 40.6962, longitude: -73.9990 },
    address: '456 Oak Avenue, Brooklyn, NY 11201',
    phone: '+1 (555) 987-6543',
    imam: '',
    capacity: 300,
    prayerTimes: {
      fajr: '05:32',
      sunrise: '06:47',
      dhuhr: '12:17',
      asr: '15:32',
      maghrib: '18:47',
      isha: '20:02',
    },
    announcements: [],
  },
  {
    id: '3',
    name: 'Islamic Center of Queens',
    location: 'Astoria',
    coordinates: { latitude: 40.7614, longitude: -73.9242 },
    address: '789 Broadway, Queens, NY 11103',
    phone: '+1 (555) 234-5678',
    imam: 'Sheikh Muhammad Ali',
    capacity: 400,
    prayerTimes: {
      fajr: '05:35',
      sunrise: '06:50',
      dhuhr: '12:20',
      asr: '15:35',
      maghrib: '18:50',
      isha: '20:05',
    },
    announcements: [],
  },
  {
    id: '4',
    name: 'Bronx Muslim Center',
    location: 'South Bronx',
    coordinates: { latitude: 40.8271, longitude: -73.9087 },
    address: '321 Jerome Ave, Bronx, NY 10451',
    phone: '+1 (555) 345-6789',
    imam: 'Sheikh Ibrahim Ahmad',
    capacity: 250,
    prayerTimes: {
      fajr: '05:33',
      sunrise: '06:48',
      dhuhr: '12:18',
      asr: '15:33',
      maghrib: '18:48',
      isha: '20:03',
    },
    announcements: [],
  },
  {
    id: '5',
    name: 'Staten Island Masjid',
    location: 'St. George',
    coordinates: { latitude: 40.6447, longitude: -74.0746 },
    address: '567 Bay Street, Staten Island, NY 10301',
    phone: '+1 (555) 456-7890',
    imam: 'Sheikh Yusuf Khan',
    capacity: 200,
    prayerTimes: {
      fajr: '05:34',
      sunrise: '06:49',
      dhuhr: '12:19',
      asr: '15:34',
      maghrib: '18:49',
      isha: '20:04',
    },
    announcements: [],
  },
  {
    id: '6',
    name: 'Harlem Islamic Cultural Center',
    location: 'Central Harlem',
    coordinates: { latitude: 40.8116, longitude: -73.9465 },
    address: '890 Malcolm X Blvd, New York, NY 10027',
    phone: '+1 (555) 567-8901',
    imam: 'Sheikh Jamal Wilson',
    capacity: 350,
    prayerTimes: {
      fajr: '05:31',
      sunrise: '06:46',
      dhuhr: '12:16',
      asr: '15:31',
      maghrib: '18:46',
      isha: '20:01',
    },
    announcements: [],
  },
  {
    id: '7',
    name: 'Lower East Side Mosque',
    location: 'Lower East Side',
    coordinates: { latitude: 40.7168, longitude: -73.9861 },
    address: '234 Essex Street, New York, NY 10002',
    phone: '+1 (555) 678-9012',
    imam: 'Sheikh Hassan Ahmed',
    capacity: 275,
    prayerTimes: {
      fajr: '05:36',
      sunrise: '06:51',
      dhuhr: '12:21',
      asr: '15:36',
      maghrib: '18:51',
      isha: '20:06',
    },
    announcements: [],
  },
  {
    id: '8',
    name: 'Park Slope Islamic Center',
    location: 'Park Slope',
    coordinates: { latitude: 40.6710, longitude: -73.9814 },
    address: '345 7th Avenue, Brooklyn, NY 11215',
    phone: '+1 (555) 789-0123',
    imam: 'Sheikh Kareem Abdul',
    capacity: 225,
    prayerTimes: {
      fajr: '05:37',
      sunrise: '06:52',
      dhuhr: '12:22',
      asr: '15:37',
      maghrib: '18:52',
      isha: '20:07',
    },
    announcements: [],
  },
  {
    id: '9',
    name: 'Forest Hills Masjid',
    location: 'Forest Hills',
    coordinates: { latitude: 40.7196, longitude: -73.8448 },
    address: '678 Queens Blvd, Queens, NY 11375',
    phone: '+1 (555) 890-1234',
    imam: 'Sheikh Zaid Rahman',
    capacity: 325,
    prayerTimes: {
      fajr: '05:38',
      sunrise: '06:53',
      dhuhr: '12:23',
      asr: '15:38',
      maghrib: '18:53',
      isha: '20:08',
    },
    announcements: [],
  },
  {
    id: '10',
    name: 'Bay Ridge Islamic Society',
    location: 'Bay Ridge',
    coordinates: { latitude: 40.6261, longitude: -74.0161 },
    address: '901 4th Avenue, Brooklyn, NY 11209',
    phone: '+1 (555) 901-2345',
    imam: 'Sheikh Bilal Mohammad',
    capacity: 375,
    prayerTimes: {
      fajr: '05:39',
      sunrise: '06:54',
      dhuhr: '12:24',
      asr: '15:39',
      maghrib: '18:54',
      isha: '20:09',
    },
    announcements: [],
  }
];

export const useMosqueStore = create<MosqueState>((set, get) => ({
  mosques: mockMosques,
  selectedMosque: null,

  fetchMosques: async () => {
    try {
      // For now, fallback to mock data if API call fails
      // In production, this would be a real API call
      await new Promise(resolve => setTimeout(()=>resolve(mockMosques), 500));
      set({ mosques: mockMosques });
    } catch (error) {
      console.error('Error fetching mosques:', error);
      set({ mosques: mockMosques }); // Fallback to mock data
    }
  },

  fetchMosquesByLocation: async (latitude: number, longitude: number) => {
    try {
     await new Promise(resolve => setTimeout(()=>resolve(mockMosques), 3000));
     
    //   const nearbyMosques = mockMosques.filter(mosque => {
     
    //     const latDiff = Math.abs(mosque.coordinates.latitude - latitude);
    //     const lngDiff = Math.abs(mosque.coordinates.longitude - longitude);
    //     return latDiff < 0.1 && lngDiff < 0.1; // Arbitrary threshold
    //   });
    //   set({ mosques: nearbyMosques });
        return mockMosques;
    } catch (error) {
      console.error('Error fetching mosques by location:', error);
      // Fallback to empty array
      set({ mosques: [] });
      return [];
    }
  },

  fetchMosquesByArea: async (area: string) => {
    try {
      // In production, this would use the API service
      // import { mosqueService } from '@/services/mosqueService';
      // const areaBasedMosques = await mosqueService.fetchMosquesByArea(area);
      
      // For now, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      // Filter mosques by area name
      const filteredMosques = mockMosques.filter(mosque => 
        mosque.location.toLowerCase().includes(area.toLowerCase()) ||
        mosque.address.toLowerCase().includes(area.toLowerCase())
      );
      set({ mosques: filteredMosques });
      return filteredMosques;
    } catch (error) {
      console.error('Error fetching mosques by area:', error);
      // Fallback to empty array
      set({ mosques: [] });
      return [];
    }
  },

  addMosque: async (mosqueData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newMosque: Mosque = {
      ...mosqueData,
      id: Date.now().toString(),
      announcements: [],
    };
    set(state => ({ mosques: [...state.mosques, newMosque] }));
  },

  updateMosque: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      mosques: state.mosques.map(mosque =>
        mosque.id === id ? { ...mosque, ...updates } : mosque
      ),
    }));
  },

  deleteMosque: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      mosques: state.mosques.filter(mosque => mosque.id !== id),
    }));
  },

  setSelectedMosque: (mosque) => {
    set({ selectedMosque: mosque });
  },
}));