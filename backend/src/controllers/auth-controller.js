import axios from "axios";
import { TryCatchBlocker } from "../utils/TryCatchWrapper";

export const fetchMosque = TryCatchBlocker(async(req,res)=>{

})

async function getAllMosque(){
    try {
        const url = "https://maps.googleapis.com/maps/api/geocode/json?address=Byculla&key="
        const fetchData = await axios.get('')
    } catch (error) {
        
    }
}