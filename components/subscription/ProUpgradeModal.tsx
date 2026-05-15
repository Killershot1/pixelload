import React, { useState, useEffect } from "react";
import { View, Pressable, ScrollView, Modal, ActivityIndicator, Dimensions } from "react-native";
import { Text, Button, Badge, Card } from "@/components/ui";
import { 
  X, 
  Sparkles, 
  Check, 
  Zap, 
  Infinity, 
  ShieldCheck, 
  Layers, 
  Search, 
  FileText,
  Clock
} from "lucide-react-native";
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  Layout
} from "react-native-reanimated";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/components/ui/utils/cn";

const { width, height } = Dimensions.get("window");

const BENEFITS = [
  { text: "Unlimited downloads", icon: Infinity },
  { text: "1080p Full HD quality", icon: ShieldCheck },
  { text: "Zero ads — forever", icon: Zap },
  { text: "Unlimited AI Search", icon: Search },
  { text: "Unlimited AI Summaries", icon: FileText },
  { text: "Priority download speed", icon: Clock },
  { text: "Exclusive Pro badge", icon: Layers },
];

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProUpgradeModal({ isOpen, onClose }: ProUpgradeModalProps) {
  const { purchasePro, restorePurchases, isPurchasing, purchaseError, isProUser } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Handle success
  useEffect(() => {
    if (isProUser && isOpen) {
      onClose();
    }
  }, [isProUser, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/95">
        <SafeAreaView className="flex-1">
          {/* Close Button */}
          <Pressable 
            onPress={onClose}
            className="absolute top-4 left-4 z-50 h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <X size={24} className="text-muted-foreground" />
          </Pressable>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View className="items-center px-6 pt-12 pb-8">
              <Animated.View 
                entering={FadeInDown.duration(600)}
                className="h-24 w-24 rounded-3xl bg-primary/20 items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,229,255,0.3)]"
              >
                <Zap size={48} className="text-primary fill-primary" />
              </Animated.View>
              
              <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                <Text className="text-3xl font-bold text-white text-center">PixelLoad Pro</Text>
                <View className="flex-row items-center justify-center mt-1">
                  <Text className="text-primary text-sm font-bold uppercase tracking-widest">Powered by Visionco AI</Text>
                </View>
              </Animated.View>
            </View>

            {/* Benefits List */}
            <View className="px-8 mb-10">
              {BENEFITS.map((benefit, index) => (
                <Animated.View 
                  key={benefit.text}
                  entering={FadeInDown.delay(200 + index * 100).springify()}
                  className="flex-row items-center mb-4"
                >
                  <View className="h-6 w-6 rounded-full bg-primary/20 items-center justify-center mr-4">
                    <Check size={14} className="text-primary" />
                  </View>
                  <Text className="text-base text-foreground font-medium">{benefit.text}</Text>
                </Animated.View>
              ))}
            </View>

            {/* Pricing Section */}
            <View className="px-6 mb-10">
              <View className="bg-card border border-border rounded-3xl p-6">
                {/* Toggle */}
                <View className="flex-row bg-muted rounded-2xl p-1 mb-8">
                  <Pressable 
                    onPress={() => setBillingCycle('monthly')}
                    className={cn(
                      "flex-1 py-3 items-center rounded-xl",
                      billingCycle === 'monthly' ? "bg-background shadow-sm" : ""
                    )}
                  >
                    <Text className={cn("font-bold", billingCycle === 'monthly' ? "text-foreground" : "text-muted-foreground")}>Monthly</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setBillingCycle('yearly')}
                    className={cn(
                      "flex-1 py-3 items-center rounded-xl relative",
                      billingCycle === 'yearly' ? "bg-background shadow-sm" : ""
                    )}
                  >
                    <Text className={cn("font-bold", billingCycle === 'yearly' ? "text-foreground" : "text-muted-foreground")}>Yearly</Text>
                    <View className="absolute -top-3 -right-2 bg-green-500 px-2 py-0.5 rounded-full">
                       <Text className="text-[8px] font-bold text-white">SAVE 44%</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Price Display */}
                <View className="items-center mb-8">
                   <Text className="text-4xl font-bold text-foreground">
                      {billingCycle === 'monthly' ? '$2.99' : '$19.99'}
                   </Text>
                   <Text className="text-muted-foreground mt-1">
                      {billingCycle === 'monthly' ? 'per month' : 'per year ($1.66/mo)'}
                   </Text>
                </View>

                {/* CTA */}
                <Button 
                  onPress={() => purchasePro(billingCycle)}
                  disabled={isPurchasing}
                  className="h-16 rounded-2xl bg-primary shadow-lg shadow-primary/20"
                >
                  {isPurchasing ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Text className="text-primary-foreground font-extrabold text-lg">
                      START PRO NOW
                    </Text>
                  )}
                </Button>
                
                {purchaseError && (
                  <Text className="text-destructive text-xs text-center mt-3 font-medium">
                    {purchaseError}
                  </Text>
                )}

                <Text className="text-muted-foreground text-[10px] text-center mt-4">
                  Cancel anytime in Google Play Settings • No commitment
                </Text>
              </View>
            </View>

            <Pressable 
              onPress={restorePurchases}
              className="mb-20 items-center"
            >
              <Text className="text-muted-foreground text-sm font-medium underline">Restore Purchases</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// Add local SafeAreaView since it's not imported
import { SafeAreaView } from "react-native-safe-area-context";
