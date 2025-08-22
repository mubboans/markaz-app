import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import { errorHandler, route_not_found, sendResponse } from "./src/utils/ReqResHelperFn.js";
import non_auth_routes from './src/routes/non-auth-route.js';
import auth_route from './src/routes/auth.route.js'
import { testConnection } from './src/db/test.connection.js'
import { checkHeaderToken } from "./src/utils/jwtHelper.js";
app.use(express.json());


// Define a route to render a template
app.get("/health-check", (req, res) => {
    sendResponse(req, res, { message: 'App is working fine 👍'})
});

// Your /mosques route with fixes only
// app.get("/mosques", async (req, res) => {
//     // Default coordinates (Mumbai: 18.9780, 72.8283)
//     const lat = parseFloat(req.query.lat);
//     const lon = parseFloat(req.query.lon);
//     const radius = parseInt(req.query.radius) || 3000; // Default 3km radius

//     const defaultLat = 19.0655397;
//     const defaultLon = 72.8795636;

//     const finalLat = isNaN(lat) ? defaultLat : lat;
//     const finalLon = isNaN(lon) ? defaultLon : lon;

//     // Overpass QL query with out center
//     const query = `
// [out:json][timeout:25];
// (
//  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${finalLat},${finalLon});
//  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${finalLat},${finalLon});
//  relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${finalLat},${finalLon});
// );
// out center;
// `;

//     try {
//         // Send raw query as plain text (NOT urlencoded)
//         const response = await axios.post(OVERPASS_URL, query, {
//             headers: {
//                 "Content-Type": "text/plain",
//                 "User-Agent": "masjid-finder/1.0 (contact@example.com)",
//             },
//         });

//         console.log("Response:", response.data);

//         // Extract relevant data
//         const mosques = response.data.elements.map((element) => ({
//             id: element.id,
//             type: element.type,
//             name: element.tags?.name || "Unnamed Mosque",
//             lat: element.type === "node" ? element.lat : element.center?.lat,
//             lon: element.type === "node" ? element.lon : element.center?.lon,
//             tags: element.tags,
//         }));

//         if (mosques.length === 0) {
//             return res.status(200).json({
//                 status: "success",
//                 message: "No mosques found within the specified radius.",
//                 data: [],
//             });
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Mosques found.",
//             data: mosques,
//         });
//     } catch (error) {
//         console.error("Error querying Overpass API:", error.message);
//         res.status(500).json({
//             status: "error",
//             message: "Failed to fetch mosque data.",
//             error: error.message,
//         });
//     }
// });

app.use('/auth', non_auth_routes);
app.use('/', checkHeaderToken, auth_route)

app.use(errorHandler)
app.use(route_not_found)
app.listen(process.env.PORT,async () => {
    try {
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
        await testConnection()
    } catch (error) {
        console.log(error, 'error in test connection');
        
    }
});