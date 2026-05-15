import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui";
import NetInfo from "@react-native-community/netinfo";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { WifiOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ConnectivityBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected !== false) return null;

  return (
    <Animated.View 
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={{ paddingTop: insets.top }}
      className="absolute top-0 left-0 right-0 z-[9999] bg-destructive items-center justify-center py-2"
    >
      <View className="flex-row items-center">
        <WifiOff size={14} className="text-white mr-2" />
        <Text className="text-white text-xs font-bold uppercase tracking-widest">
          No internet connection
        </Text>
      </View>
    </Animated.View>
  );
}
