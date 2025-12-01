import axios from "axios";

// const Base_Url = "https://serverexpoapicron.netlify.app/.netlify/functions/";
export const Base_Url = "http://localhost:4000/";

// Configure axios with timeout and better error handling
const axiosInstance = axios.create({
  baseURL: Base_Url,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getRequest(endpoint: string) {
  try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        console.warn(`Network error for GET ${endpoint}: Server may not be running`);
      } else {
        console.error("Error making GET request:", error.message);
      }
    } else {
      console.error("Error making GET request:", error);
    }
    throw error;
  }
}

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