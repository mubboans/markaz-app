import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Platform, AppState } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';

const audioSource = require('../assets/audio/azaan.wav');

class AzaanService {
    private notificationId: string | null = null;
    private sound: Audio.Sound | null = null;

    async allowAlarms() {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return false;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('prayer', {
                name: 'Prayer Alerts',
                importance: Notifications.AndroidImportance.MAX,
                sound: 'azaan.wav',
                vibrationPattern: [0, 500, 200, 500],
                enableVibrate: true,
                lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
                bypassDnd: true,
            });
        }

        return true;
    }

    async initialize() {
        try {
            console.log('🎵 Initializing Azaan service...');

            // iOS-specific audio session configuration
            if (Platform.OS === 'ios') {
                try {
                    // Set audio session category for playback
                    await Audio.setAudioModeAsync({
                        allowsRecordingIOS: false,
                        staysActiveInBackground: true,
                        playsInSilentModeIOS: true, // CRITICAL: Play even when silent switch is on
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: false,
                    });
                    console.log('✅ iOS audio session configured');
                } catch (iosError) {
                    console.warn('⚠️ iOS audio session config failed:', iosError);
                }
            }

            // Configure audio for background playback - Enhanced for background scenarios
            await setAudioModeAsync({
                shouldPlayInBackground: true,   // iOS background playback
                playsInSilentMode: true,        // iOS mute switch - CRITICAL for prayer times
                interruptionMode: 'duckOthers', // Handle interruptions
                interruptionModeAndroid: 'duckOthers', // Android interruption handling
            });
            console.log('✅ Audio mode configured for background playback');

            // Also set the traditional Audio mode for compatibility
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
            console.log('✅ Legacy audio mode configured');

            // Unload existing sound if any
            if (this.sound) {
                try {
                    await this.sound.unloadAsync();
                    console.log('🔄 Unloaded existing sound');
                } catch (unloadError) {
                    console.warn('⚠️ Failed to unload existing sound:', unloadError);
                }
            }

            // Load the sound with enhanced options
            const { sound } = await Audio.Sound.createAsync(
                audioSource,
                {
                    shouldPlay: false,
                    isLooping: false,
                    volume: 1.0,
                },
                // Status update callback
                (status) => {
                    if (status.isLoaded) {
                        console.log('🎵 Sound status:', {
                            isPlaying: status.isPlaying,
                            position: status.positionMillis,
                            duration: status.durationMillis
                        });
                    }
                }
            );
            this.sound = sound;

            console.log('✅ Azaan service initialized successfully');
        } catch (error) {
            console.error('❌ Could not initialize Azaan service:', error);
            this.sound = null;
            throw error; // Re-throw to handle in calling code
        }
    }

    async playAzaan() {
        try {
            console.log('🎵 Starting Azaan playback...');

            // Ensure audio mode is set for background playback
            await setAudioModeAsync({
                shouldPlayInBackground: true,
                playsInSilentMode: true, // CRITICAL: Play even when phone is on silent
                interruptionMode: 'duckOthers',
                interruptionModeAndroid: 'duckOthers',
            });
            console.log('✅ Audio mode configured for playback');

            // Ensure sound is loaded
            if (!this.sound) {
                console.warn('⚠️ Azaan sound not loaded, initializing...');
                await this.initialize();
            }

            // Play the sound if it's available
            const currentSound = this.sound;
            if (currentSound) {
                // Check current status
                const currentStatus = await currentSound.getStatusAsync();
                console.log('🎵 Current sound status:', currentStatus);

                // Stop any currently playing sound
                if (currentStatus.isLoaded && currentStatus.isPlaying) {
                    console.log('⏹️ Stopping currently playing sound');
                    await currentSound.stopAsync();
                }

                // Reset to beginning and set volume
                await currentSound.setPositionAsync(0);
                await currentSound.setVolumeAsync(1.0);
                console.log('✅ Sound position reset and volume set to max');

                // Play the sound
                const playStatus = await currentSound.playAsync();
                console.log('✅ Azaan playing...', {
                    isPlaying: playStatus.isLoaded ? playStatus.isPlaying : false,
                    duration: playStatus.isLoaded ? playStatus.durationMillis : 0
                });
            } else {
                throw new Error('Failed to load Azaan sound after initialization');
            }
        } catch (error) {
            console.error('❌ Error playing Azaan:', error);
            // Try to reinitialize and play once more
            try {
                console.log('🔄 Attempting recovery...');
                await this.cleanup();
                await this.initialize();
                const recoverySound = this.sound;
                if (recoverySound) {
                    await recoverySound.setPositionAsync(0);
                    await recoverySound.setVolumeAsync(1.0);
                    await recoverySound.playAsync();
                    console.log('✅ Azaan playing after recovery');
                } else {
                    throw new Error('Recovery sound is null');
                }
            } catch (recoveryError) {
                console.error('❌ Failed to recover Azaan playback:', recoveryError);
                throw recoveryError; // Re-throw so caller knows it failed
            }
        }
    }

    async stopAzaan() {
        try {
            if (this.sound) {
                await this.sound.stopAsync();
            }
        } catch (error) {
            console.error('Error stopping Azaan:', error);
        }
    }

    async scheduleAzaan(prayerName: string, time: string) {
        try {
            // This method is used by other parts of the app
            // For now, we'll just log it since the main notification scheduling
            // is handled by the server-sent push notifications
            console.log(`Schedule Azaan for ${prayerName} at ${time}`);

            // You could implement local scheduling here if needed
            // using Notifications.scheduleNotificationAsync()

        } catch (error) {
            console.error('Error scheduling Azaan:', error);
        }
    }

    async cleanup() {
        try {
            if (this.sound) {
                await this.sound.unloadAsync();
                this.sound = null;
            }
        } catch (error) {
            console.error('Error cleaning up Azaan service:', error);
        }
    }
}

export const azaanService = new AzaanService();