import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
const InterstitialAd = MobileAds?.InterstitialAd;
const AdEventType = MobileAds?.AdEventType;
const TestIds = MobileAds?.TestIds;

import { logger } from "@/lib/logger";

const INTERSTITIAL_ID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || (TestIds?.INTERSTITIAL || 'ca-app-pub-3940256099942544/1033173712');

let interstitial: any = null;
let lastShownTimestamp = 0;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export class InterstitialAdManager {
  static load() {
    if (Platform.OS === 'web' || !InterstitialAd) return;

    try {
      interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
        requestNonPersonalizedAdsOnly: true,
      });

      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        logger.log('Interstitial Ad Loaded');
      });

      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        logger.log('Interstitial Ad Closed');
        InterstitialAdManager.load(); // Pre-load next
      });

      interstitial.load();
    } catch (e) {
      logger.error("Failed to create interstitial:", e);
    }
  }

  static async show(): Promise<boolean> {
    // 1. Check Pro status
    const isPro = await AsyncStorage.getItem("pixel_load_is_pro");
    if (isPro === "true") return false;

    // 2. Check platform and library
    if (Platform.OS === 'web' || !interstitial) return false;

    // 3. Check cooldown
    const now = Date.now();
    if (now - lastShownTimestamp < COOLDOWN_MS) {
      logger.log('Interstitial cooldown active');
      return false;
    }

    // 4. Check if ready
    if (interstitial.loaded) {
      try {
        interstitial.show();
        lastShownTimestamp = now;
        return true;
      } catch (e) {
        logger.error("Failed to show interstitial:", e);
        return false;
      }
    }

    logger.log('Interstitial ad not ready yet');
    interstitial.load(); // Try loading again
    return false;
  }

  static isReady(): boolean {
    return interstitial?.loaded ?? false;
  }
}
