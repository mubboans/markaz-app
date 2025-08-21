import axios from "axios";
import { TryCatchBlocker } from "../utils/TryCatchWrapper";

export const fetchMosque = TryCatchBlocker(async(req,res)=>{

})

async function getAllMosque(){
    try {
        const url = "https://maps.googleapis.com/maps/api/geocode/json?address=Byculla&key=AIzaSyC25BJFmqMXg9Uv7wBUiR-PrIQ4Y59SfkM%0A"
        const fetchData = await axios.get('')
    } catch (error) {
        
    }
}