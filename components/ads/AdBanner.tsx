import React from "react";
import { View, ViewStyle } from "react-native";
import { useSubscription } from "@/hooks/useSubscription";
import { Text } from "@/components/ui";

interface AdBannerProps {
  position: 'bottom' | 'inline';
  style?: ViewStyle;
}

export function AdBanner({ position, style }: AdBannerProps) {
  const { isProUser } = useSubscription();

  // 1. Pro users see no ads
  if (isProUser) return null;

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
        Advertisement Placeholder (Web)
      </Text>
    </View>
  );
}
