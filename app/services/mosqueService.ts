import axios from 'axios';
import { mockMosques, Mosque } from '@/stores/mosqueStore';

// Base URL for the API
const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your actual API URL

class MosqueService {
  /**
   * Fetch mosques by user's current location
   * @param latitude User's latitude
   * @param longitude User's longitude
   * @returns Promise with array of mosques
   */
  async fetchMosquesByLocation(latitude: number, longitude: number): Promise<Mosque[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/mosques/nearby`, {
        params: { latitude, longitude }
      });
        console.log('response returning from locations');
        return mockMosques;
    } catch (error) {
      console.error('Error fetching mosques by location:', error);
      throw error;
    }
  }

  /**
   * Fetch mosques by area name
   * @param area Area name (e.g., "kurla")
   * @returns Promise with array of mosques
   */
  async fetchMosquesByArea(area: string): Promise<Mosque[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/mosques/area`, {
        params: { area: area.toLowerCase() }
      });
    //   return response.data;
        console.log('response returning from areas');
        return mockMosques;
    } catch (error) {
      console.error('Error fetching mosques by area:', error);
      throw error;
    }
  }
}

export const mosqueService = new MosqueService();