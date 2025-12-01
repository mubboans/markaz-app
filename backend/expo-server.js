// server.js
require('dotenv').config();          // load .env
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Expo from 'expo-server-sdk';
import { connectDatabase } from './db_config';
import { Device_Token } from './token_model';
import { PrayTime } from './prayerTime';

const app = express();
app.use(cors());
app.use(bodyParser.json());

let expo = new Expo();

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
        // console.log(deviceToken);
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