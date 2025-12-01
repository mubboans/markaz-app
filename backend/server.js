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
import  {Expo} from 'expo-server-sdk';

// Define a route to render a template
app.get("/health-check", (req, res) => {
    sendResponse(req, res, { message: 'App is working fine 👍'})
});

let expo = new Expo();

// Create the messages that you want to send to clents
let messages = [];
for (let pushToken of ['ExponentPushToken[iETMTQLOwIrbRaBEia7hSn]']) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${ pushToken } is not a valid Expo push token`);
        continue;
    }

    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    messages.push({
        to: pushToken,
        sound: 'Test the custom notification',
        body: 'This is a test notification',
        data: { withSome: 'data' },
    })
}
let chunks = expo.chunkPushNotifications(messages);


app.use('/auth', non_auth_routes);
app.use('/', checkHeaderToken, auth_route)

app.use(errorHandler)
app.use(route_not_found)
app.listen(process.env.PORT,async () => {
    try {
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
        // await testConnection()
        (async () => {
            // Send the chunks to the Expo push notification service. There are
            // different strategies you could use. A simple one is to send one chunk at a
            // time, which nicely spreads the load out over time:
            for (let chunk of chunks) {
                try {
                    let receipts = await expo.sendPushNotificationsAsync(chunk);
                    console.log(receipts);
                } catch (error) {
                    console.error(error);
                }
            }
        })();
    } catch (error) {
        console.log(error, 'error in test connection');
    }
});