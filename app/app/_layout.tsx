import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/authStore';
import { ToastProvider } from './providers/ToastProvider';

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated } = useAuthStore();
  console.log('isAuthenticated', isAuthenticated);
  
  return (
    <>
      {isAuthenticated ? (
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ToastProvider>
      ) : (
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ToastProvider>
      )}
      <StatusBar style="auto" />
    </>
  );
}
