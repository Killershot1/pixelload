import React from "react";
import { View, ViewStyle, Platform } from "react-native";
import { useSubscription } from "@/hooks/useSubscription";
import { Text } from "@/components/ui";

// Helper to get ad components safely
const getAdComponents = () => {
  if (Platform.OS === 'web') return null;
  try {
    return require("react-native-google-mobile-ads");
  } catch (e) {
    return null;
  }
};

const MobileAds = getAdComponents();
const BannerAd = MobileAds?.BannerAd;
const BannerAdSize = MobileAds?.BannerAdSize;
const TestIds = MobileAds?.TestIds;

interface AdBannerProps {
  position: 'bottom' | 'inline';
  style?: ViewStyle;
}

const BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || (TestIds?.BANNER || 'ca-app-pub-3940256099942544/6300978111');

export function AdBanner({ position, style }: AdBannerProps) {
  const { isProUser } = useSubscription();

  // 1. Pro users see no ads
  if (isProUser) return null;

  // 2. Simulation for web/missing library
  if (Platform.OS === 'web' || !BannerAd) {
    return (
      <View 
        className="bg-muted items-center justify-center border border-border"
        style={[
          { height: 60, width: '100%' },
          position === 'bottom' ? { position: 'absolute', bottom: 0 } : { marginVertical: 10 },
          style
        ]}
      >
        <Text className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
          Advertisement Placeholder
        </Text>
      </View>
    );
  }

  return (
    <View 
      style={[
        position === 'bottom' ? { position: 'absolute', bottom: 0, width: '100%', zIndex: 100 } : { marginVertical: 10 },
        style
      ]}
    >
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error: any) => {
          console.error('Ad failed to load: ', error);
        }}
      />
    </View>
  );
}
