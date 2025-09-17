import axios from "axios";

const Base_Url = "http://localhost:4000/";

export async function getRequest(endpoint: string) {
  try {
    const response = await axios.get(`${Base_Url}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error("Error making GET request:", error);
    throw error;
  }
}
  
  export async function postRequest(endpoint: string, data: any) {
    try {
        console.log(`${Base_Url}${endpoint}`,'`${Base_Url}${endpoint}`');
        
      const response = await axios.post(`${Base_Url}${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error("Error making POST request:", error);
      throw error;
    }   
  }