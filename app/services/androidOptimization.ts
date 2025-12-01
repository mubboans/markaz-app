import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AndroidOptimizationService {
  private readonly BATTERY_OPTIMIZATION_KEY = 'battery_optimization_requested';
  private readonly NOTIFICATION_POLICY_KEY = 'notification_policy_requested';

  /**
   * Check if we should request battery optimization exemption
   */
  async shouldRequestBatteryOptimization(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    
    try {
      const hasRequested = await AsyncStorage.getItem(this.BATTERY_OPTIMIZATION_KEY);
      return !hasRequested;
    } catch (error) {
      console.error('Error checking battery optimization status:', error);
      return false;
    }
  }

  /**
   * Mark that we've requested battery optimization exemption
   */
  async markBatteryOptimizationRequested(): Promise<void> {
    if (Platform.OS !== 'android') return;
    
    try {
      await AsyncStorage.setItem(this.BATTERY_OPTIMIZATION_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error marking battery optimization as requested:', error);
    }
  }

  /**
   * Get explanation text for battery optimization
   */
  getBatteryOptimizationExplanation(): string {
    return `To ensure prayer notifications work properly when the app is closed, please:

1. Go to Settings → Battery → Battery Optimization
2. Find "Markaz App" in the list
3. Select "Don't optimize"
4. Tap "Done"

This allows the app to receive and play prayer notifications even when the screen is off or the app is closed.`;
  }

  /**
   * Get instructions for different Android versions
   */
  getAndroidSpecificInstructions(): Record<string, string> {
    return {
      'Samsung': `For Samsung devices:
1. Go to Settings → Device care → Battery
2. Tap "App power management"
3. Find "Markaz App" and tap it
4. Select "Optimize battery usage"
5. Toggle OFF "Markaz App"`,
      
      'Huawei': `For Huawei devices:
1. Go to Settings → Battery → App launch
2. Find "Markaz App"
3. Toggle OFF "Manage automatically"
4. Enable "Auto-launch", "Secondary launch", and "Run in background"`,
      
      'Xiaomi': `For Xiaomi/MIUI:
1. Go to Settings → Apps → Manage apps
2. Find "Markaz App" and tap it
3. Tap "Battery saver"
4. Select "No restrictions"
5. Also enable "Autostart" and "Background activity"`,
      
      'OnePlus': `For OnePlus/OxygenOS:
1. Go to Settings → Battery → Battery optimization
2. Tap "All apps" and find "Markaz App"
3. Select "Don't optimize"
4. Also go to Settings → Apps → Special access → Background activity
5. Enable background activity for "Markaz App"`,
      
      'Generic': `For most Android devices:
1. Go to Settings → Battery → Battery Optimization
2. Find "Markaz App" and select "Don't optimize"
3. Go to Settings → Apps → Special access → Background activity
4. Enable for "Markaz App"`
    };
  }

  /**
   * Log notification handling for debugging
   */
  async logNotificationEvent(event: string, data?: any): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        event,
        data,
        androidVersion: Platform.Version,
      };

      // Get existing logs
      const existingLogs = await AsyncStorage.getItem('notification_debug_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      // Add new log and keep only last 50 entries
      logs.push(logEntry);
      const trimmedLogs = logs.slice(-50);
      
      await AsyncStorage.setItem('notification_debug_logs', JSON.stringify(trimmedLogs));
      
      console.log(`[NotificationDebug] ${event}:`, data);
    } catch (error) {
      console.error('Error logging notification event:', error);
    }
  }

  /**
   * Get debug logs
   */
  async getDebugLogs(): Promise<any[]> {
    try {
      const logs = await AsyncStorage.getItem('notification_debug_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error getting debug logs:', error);
      return [];
    }
  }

  /**
   * Clear debug logs
   */
  async clearDebugLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem('notification_debug_logs');
    } catch (error) {
      console.error('Error clearing debug logs:', error);
    }
  }

  /**
   * Check if device manufacturer requires special handling
   */
  getDeviceManufacturer(): string {
    // This is a simplified version - in a real app you might want to use
    // react-native-device-info for more accurate detection
    if (Platform.OS !== 'android') return 'Generic';
    
    // For now, return Generic since Platform.constants.Brand is not available in all versions
    // In a real app, you would use react-native-device-info to get accurate brand info
    return 'Generic';
  }
}

export const androidOptimizationService = new AndroidOptimizationService();