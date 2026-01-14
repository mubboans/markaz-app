import axios from "axios";

// export const Base_Url = "https://serverexpoapicron.netlify.app/.netlify/functions/";
// REPLACE WITH YOUR COMPUTER'S LOCAL IP ADDRESS (e.g., 192.168.1.5)
// localhost will NOT work on physical Android/iOS devices
// export const Base_Url = "http://192.168.1.X:4000/";
// export const Base_Url = "http://10.92.126.55:4000/";
export const Base_Url = "https://expopushnotificationserver--mubashiransari8.replit.app/";
// Configure axios with timeout and better error handling
const axiosInstance = axios.create({
  baseURL: Base_Url,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function postRequest(endpoint: string, data: any) {
  try {
    console.log(`${Base_Url}${endpoint}`, JSON.stringify(data));

    const response = await axiosInstance.post(endpoint, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        console.warn(`Network error for POST ${endpoint}: Server may not be running`);
      } else {
        console.error("Error making POST request:", error.message);
      }
    } else {
      console.error("Error making POST request:", error);
    }
    throw error;
  }
}