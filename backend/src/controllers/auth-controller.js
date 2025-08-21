import axios from "axios";
import { TryCatchBlocker } from "../utils/TryCatchWrapper";

export const fetchMosque = TryCatchBlocker(async(req,res)=>{
    const {keyword} = req.body;
    const appendUrl = ""
})

async function getAllMosque(appenUrl){
    try {
        const url = process.env.GOOGLE_API_URL + appenUrl;
        const fetchData = await axios.get(url);
        
    } catch (error) {
        
    }
}