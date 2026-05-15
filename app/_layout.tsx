import 'react-native-reanimated';
import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider as UIThemeProvider } from '@/components/ui/theme';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { SubscriptionProvider, useSubscription } from '@/hooks/useSubscription';
import { ConnectivityBanner } from '@/components/ConnectivityBanner';
import { Text } from '@/components/ui';

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

const getConvexUrl = () => {
  const url = process.env.EXPO_PUBLIC_CONVEX_URL;
  if (!url) return "https://placeholder.convex.cloud";
  return url;
};

const convex = new ConvexReactClient(getConvexUrl());

// Toast Configuration
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#00E5FF', backgroundColor: '#1a1a2e', marginTop: 10 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}
      text2Style={{ color: '#00E5FF', fontSize: 12 }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#FF5252', backgroundColor: '#1a1a2e', marginTop: 10 }}
      text1Style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}
      text2Style={{ color: '#FF5252', fontSize: 12 }}
    />
  ),
  ai: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#6200EA', backgroundColor: '#1a1a2e', marginTop: 10 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}
      text2Style={{ color: '#6200EA', fontSize: 12 }}
    />
  ),
};

function RootLayoutContent() {
  const { isLoading, clientId } = useSubscription();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Check onboarding status
  useEffect(() => {
    async function checkOnboarding() {
      const value = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(value === "true");
    }
    checkOnboarding();
  }, []);

  // Handle splash screen and navigation
  useEffect(() => {
    if (fontsLoaded && !isLoading && hasSeenOnboarding !== null) {
      SplashScreen.hideAsync();
      
      const inOnboardingGroup = segments[0] === 'onboarding';
      
      if (!hasSeenOnboarding && !inOnboardingGroup) {
        router.replace('/onboarding');
      } else if (hasSeenOnboarding && inOnboardingGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [fontsLoaded, isLoading, hasSeenOnboarding, segments]);

  if (!fontsLoaded || isLoading || hasSeenOnboarding === null) {
    // Return a minimal loading view that looks like the splash screen
    return (
      <View className="flex-1 bg-[#0a0a0a] items-center justify-center">
        <Text className="text-4xl font-black text-primary italic">⚡PixelLoad</Text>
        <Text className="text-muted-foreground text-sm mt-2">Powered by Visionco AI</Text>
      </View>
    );
  }

  return (
    <UIThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <ConnectivityBanner />
        <StatusBar style="light" />
        <Toast config={toastConfig} position="top" topOffset={50} />
      </ThemeProvider>
    </UIThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <SubscriptionProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <RootLayoutContent />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </SubscriptionProvider>
    </ConvexProvider>
  );
}
