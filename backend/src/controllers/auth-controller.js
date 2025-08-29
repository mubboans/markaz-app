import axios from "axios";
import { TryCatchBlocker } from "../utils/TryCatchWrapper.js";
import { sendResponse } from "../utils/ReqResHelperFn.js";

export const fetchMosque = TryCatchBlocker(async(req,res)=>{
    const { keyword = 'Ahle Hadees', location = '18.9582,72.8321',    } = req.body || {};
    const appendUrl = `keyword=${keyword}&location=${location}`;
    const result = await getAllMosque(appendUrl);
    return sendResponse(req,res,{
        data: result?.data,
        code: 200,
        message: 'Successfully fetch result'
    })
})

async function getAllMosque(appenUrl){
    try {
        const url = process.env.GOOGLE_API_URL + appenUrl;
        const fetchData = await axios.get(url);
        return fetchData;
    } catch (error) {
     throw error;   
    }
}