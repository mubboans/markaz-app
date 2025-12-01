# Background Notification Implementation

This document explains the enhanced background notification system implemented to handle prayer notifications even when the app is closed or killed.

## What's Been Implemented

### 1. Enhanced App Configuration (`app.json`)
- Added Android permissions for background processing, foreground services, and media playback
- Configured proper background modes for iOS
- Added battery optimization bypass permissions

### 2. New Notification Handler Service (`services/notificationHandler.ts`)
- Comprehensive notification handling with proper error recovery
- Background task registration for handling notifications when app is killed
- Retry logic for failed notification processing
- Enhanced Android notification channels with high priority settings
- Proper audio mode configuration for background playback

### 3. Enhanced Azaan Service (`services/azaanService.ts`)
- Improved background audio playback configuration
- Better error handling and recovery mechanisms
- Enhanced audio mode settings for both iOS and Android
- Retry logic for audio initialization failures

### 4. Android Optimization Service (`services/androidOptimization.ts`)
- Device-specific battery optimization instructions
- Debugging and logging utilities
- Battery optimization exemption management

### 5. Updated Layout (`app/_layout.tsx`)
- Simplified initialization using the new notification handler
- Better error handling and user feedback
- Cleaner separation of concerns

## Key Features

### Background Notification Handling
- ✅ Handles notifications when app is in foreground
- ✅ Handles notifications when app is in background
- ✅ Handles notifications when app is killed/closed (Android)
- ✅ Proper audio playback in silent mode
- ✅ High-priority notification channels
- ✅ Retry mechanisms for failed operations

### Audio Configuration
- ✅ Background audio playback enabled
- ✅ Silent mode playback (plays even when phone is muted)
- ✅ Proper audio interruption handling
- ✅ Volume management

### Error Handling & Debugging
- ✅ Comprehensive error logging
- ✅ Notification event tracking
- ✅ Retry logic for failed operations
- ✅ Device-specific debugging information

## How Sound Playback Works

This implementation uses a **dual-approach** to ensure azaan sound plays reliably:

### 1. Native Android Notification Sound (When App is Killed)
- The `azaan.wav` file is placed in `android/app/src/main/res/raw/`
- Android's notification system plays this sound natively when notifications arrive
- Works even when the app is completely killed
- Requires the server to send `sound: "azaan.wav"` and `channelId: "prayer"` in the notification payload

### 2. JavaScript Audio Playback (When App is Running)
- Uses Expo's Audio API to play the azaan sound
- Provides more control over playback (volume, position, status)
- Works when app is in foreground or background
- Configured to play even when phone is on silent mode (`playsInSilentMode: true`)

### Why Both Approaches?
- **Native sound** ensures reliability when app is killed (most critical scenario)
- **JavaScript playback** provides better user experience when app is running
- If JavaScript playback fails, native sound serves as a fallback

## Testing Background Notifications

### 1. Test While App is Open
1. Keep the app open in foreground
2. Send a prayer notification from your server
3. Verify: Azaan should play immediately

### 2. Test While App is in Background
1. Open the app, then press home button (app goes to background)
2. Send a prayer notification from your server
3. Verify: Notification should appear and azaan should play

### 3. Test While App is Killed/Closed
1. Open the app once to initialize everything
2. Force-close the app (swipe up from recent apps and swipe away)
3. Send a prayer notification from your server
4. Verify: Notification should appear and azaan should play

### 4. Test Cold Start from Notification
1. With app completely closed, send a notification
2. Tap on the notification when it appears
3. Verify: App opens and azaan plays

## Android Device Setup

For optimal background notification performance on Android:

### General Settings
1. Go to **Settings → Battery → Battery Optimization**
2. Find **"Markaz App"** and select **"Don't optimize"**
3. Go to **Settings → Apps → Special access → Background activity**
4. Enable background activity for **"Markaz App"**

### Device-Specific Settings
Different Android manufacturers require additional steps. Check the `androidOptimization.ts` service for device-specific instructions:

- **Samsung**: Device care → Battery → App power management
- **Huawei**: Battery → App launch → Manage automatically (turn OFF)
- **Xiaomi/MIUI**: Apps → Manage apps → Battery saver → No restrictions
- **OnePlus**: Battery optimization + Background activity settings

## Troubleshooting

### Notifications Not Working When App is Killed

1. **Check Permissions**: Ensure all required permissions are granted
2. **Battery Optimization**: Make sure the app is excluded from battery optimization
3. **Background Activity**: Verify background activity is enabled for the app
4. **Notification Channels**: Check that high-priority notification channels are created
5. **Check Logs**: Use the debug logging in `androidOptimizationService`

### Audio Not Playing in Background

1. **Silent Mode**: Verify that `playsInSilentMode` is enabled
2. **Audio Mode**: Check that background audio mode is properly configured
3. **Volume Settings**: Ensure system volume and app volume are not muted
4. **Audio Focus**: Verify proper audio focus handling

### Debugging

Access debug logs programmatically:
```javascript
import { androidOptimizationService } from '@/services/androidOptimization';

// Get debug logs
const logs = await androidOptimizationService.getDebugLogs();
console.log('Debug logs:', logs);

// Clear logs
await androidOptimizationService.clearDebugLogs();
```

### Sound Not Playing When App is Killed

This is the most critical scenario. If sound doesn't play when app is killed:

1. **Verify Native Sound File**: 
   ```bash
   ls -lh android/app/src/main/res/raw/azaan.wav
   ```
   The file should exist and be ~4.9MB

2. **Rebuild Android App**: After adding the sound file, you MUST rebuild:
   ```bash
   npx expo prebuild --platform android --clean
   npx expo run:android
   ```

3. **Check Server Payload**: Your cron job MUST send:
   ```json
   {
     "sound": "azaan.wav",
     "channelId": "prayer",
     "priority": "high"
   }
   ```

4. **Verify Notification Channel**: 
   - Go to: Settings → Apps → Markaz App → Notifications → Prayer Notifications
   - Ensure sound is enabled and set to "azaan.wav"

5. **Check Android Logs**:
   ```bash
   adb logcat | grep -i "notification\|azaan\|prayer"
   ```
   Look for "✅ Prayer notification channel created with native sound"

### Sound Not Playing in Foreground/Background

If sound doesn't play when app is running:

1. **Check Console Logs**: Look for these emoji indicators:
   - 🎵 = Azaan service activity
   - ✅ = Success
   - ⚠️ = Warning (non-critical)
   - ❌ = Error (critical)
   - 🔄 = Retry attempt

2. **Common Console Messages**:
   - `"✅ Azaan playing..."` = Success
   - `"⚠️ Azaan sound not loaded, initializing..."` = Auto-recovery in progress
   - `"❌ Failed to play azaan:"` = JavaScript playback failed (native sound should still work)

3. **Check AsyncStorage**: 
   ```javascript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   // Check last successful notification
   const lastNotif = await AsyncStorage.getItem('lastPrayerNotification');
   console.log('Last notification:', JSON.parse(lastNotif));
   
   // Check for errors
   const lastError = await AsyncStorage.getItem('lastPrayerNotificationError');
   console.log('Last error:', JSON.parse(lastError));
   ```

4. **Volume Check**: Ensure device volume is not at 0 (even though it should play in silent mode)

5. **Audio Permissions**: Verify MODIFY_AUDIO_SETTINGS permission is granted

## Server Configuration

Your notification payload should match this structure:

```javascript
{
  to: 'ExponentPushToken[...]',
  sound: 'azaan.wav',
  priority: 'high',
  channelId: 'prayer',
  data: { 
    type: 'dhuhrtime', // or other prayer types
    prayer: 'DHUHR', 
    time: '12:51' 
  }
}
```

## Important Notes

1. **iOS Limitations**: True background processing on iOS is more limited than Android. The app needs to be launched at least once for background tasks to be registered.

2. **Android Battery Optimization**: Modern Android versions are aggressive about killing background processes. Users MUST disable battery optimization for reliable background notifications.

3. **Testing on Real Devices**: Background notifications work differently on emulators vs real devices. Always test on physical devices.

4. **Network Connectivity**: Background tasks may fail if the device has poor network connectivity.

## Files Modified/Created

- ✅ `app.json` - Enhanced configuration
- ✅ `services/notificationHandler.ts` - Enhanced handler with better error handling and logging
- ✅ `services/azaanService.ts` - Enhanced audio handling with detailed logging
- ✅ `services/androidOptimization.ts` - Android utilities
- ✅ `app/_layout.tsx` - Updated to use notification handler
- ✅ `android/app/src/main/res/raw/azaan.wav` - **NEW**: Native Android notification sound
- ✅ `android-notification-config.json` - Android configuration reference
- ✅ `BACKGROUND_NOTIFICATIONS.md` - This documentation (updated)

## Next Steps

After implementing these changes, you need to:

1. **Rebuild the Android app** to include the native sound file:
   ```bash
   npx expo prebuild --platform android --clean
   npx expo run:android
   ```

2. **Update your cron job server** to send notifications with this payload:
   ```json
   {
     "to": "ExponentPushToken[...]",
     "sound": "azaan.wav",
     "priority": "high",
     "channelId": "prayer",
     "title": "Prayer Time",
     "body": "It's time for [Prayer Name]",
     "data": {
       "type": "dhuhrtime",
       "prayer": "DHUHR",
       "time": "12:51"
     }
   }
   ```

3. **Test thoroughly** using the test scenarios in this document

4. **Monitor console logs** for the emoji indicators to verify everything is working

The implementation is designed to be robust and handle edge cases while maintaining compatibility with your existing codebase.