// server.js
require('dotenv').config();          // load .env
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Expo = require('expo-server-sdk');
const { connectDatabase } = require('./db_config');
const { default: Device_Token } = require('./token_model');
const { default: PrayTime } = require('./prayerTime');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Replace this with whatever you use to store tokens // Map<userId, Set<expoPushToken>>

// Create a new Expo SDK client
let expo = new Expo();

// Create the messages that you want to send to clents
// let messages = [];
// for (let pushToken of ['ExponentPushToken[iETMTQLOwIrbRaBEia7hSn]']) {
//     // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

//     // Check that all your push tokens appear to be valid Expo push tokens
//     if (!Expo.isExpoPushToken(pushToken)) {
//         console.error(`Push token ${pushToken} is not a valid Expo push token`);
//         continue;
//     }

//     // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
//     messages.push({
//         to: pushToken,
//         title: 'Prayer Time',
//         body: 'Hayyalas salah',
//         priority: 'high',
//         sound: 'azaan.mp3',
//         data: { withSome: 'data' },
//     })
// }

// The Expo push notification service accepts batches of notifications so
// that you don't need to send 1000 requests to send 1000 notifications. We
// recommend you batch your notifications to reduce the number of requests
// and to compress them (notifications with similar content will get
// compressed).
// let chunks = expo.chunkPushNotifications(messages);


// -----------------------------------------------------------
// 1️⃣  Store a token (called by the client)
app.post('/api/expotoken', async (req, res) => {
    try {
        const { username = "test", token: expoPushToken } = req.body;
        // In a real world app you’d validate the token & store it in a DB
        if (!expoPushToken) return res.status(400).json({ error: 'token missing' });
        //    const user = new Device_Token({ username, expoPushToken });
        //    await user.();
        Device_Token.findOneAndReplace({ expoPushToken }, { username, expoPushToken }, { upsert: true }).then(() => { }).catch(() => { });
        console.log(`Token ${expoPushToken} stored for user ${username}`);

        res.json({ ok: true });
    } catch (error) {
        console.log(error);
        res.json({ error: error.message });
    }

});

// -----------------------------------------------------------
// 2️⃣  Send a notification (admin panel / cron job)
// -----------------------------------------------------------

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
    try {
        await connectDatabase(process.env.DBURL).then(async () => {
            console.log('DB connected')
            await sendHeadlessNotification();
            console.log(`🚀 Expo‑push server listening on ${PORT}`);
        }
        );
    } catch (error) {
    }
}
);

const PRESET = {
    lat: 19.0760,   // Mumbai (Mumbai/Thane both inside IST)
    lng: 72.8777,
    tz: 'Asia/Kolkata',
    method: 'MWL', // or 'ISNA', 'MWL', …
}
async function sendHeadlessNotification() {
    try {
        const calc = new PrayTime(PRESET.method);
        calc.location([PRESET.lat, PRESET.lng]);
        calc.timezone(PRESET.tz);           // Asia/Kolkata → UTC+5:30
        calc.format('24h');               // 12h, 24h, 12hNS
        // 2. Compute times for the given date
        const raw = calc.getTimes(new Date());
        console.log(raw, 'check prayer time');

        let messages = [];
        const deviceToken = await Device_Token.find({});
        console.log(deviceToken);
        for (let pushToken of deviceToken.map(d => d.expoPushToken)) {
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`Invalid push token: ${pushToken}`);
                continue;
            }

            messages.push({
                to: pushToken,
                // no title/body → silent notification
                data: {
                    type: 'PRAYER_REMINDERs',
                    prayer: 'Dhuhr',
                    time: '13:14',
                },
                priority: 'high', // force delivery
                channelId: 'prayer', // needed on Android
            });
        }

        let chunks = expo.chunkPushNotifications(messages);

        for (let chunk of chunks) {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
        }

    }
    catch (error) {
        console.error(error);
    }
}

// sendHeadlessNotification();