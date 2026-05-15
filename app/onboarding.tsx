import React, { useState, useRef } from "react";
import { View, ScrollView, Dimensions, Pressable, Platform } from "react-native";
import { Text, Button, SafeAreaView } from "@/components/ui";
import { Download, Sparkles, Smartphone, ChevronRight } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useAnimatedScrollHandler, 
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import { cn } from "@/components/ui/utils/cn";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Download Anything",
    subtitle: "Videos, music, and more. Fast.",
    icon: Download,
    bgColor: "bg-[#0a0a0a]",
    iconColor: "text-primary",
    accentColor: "bg-primary/20",
  },
  {
    title: "AI That Actually Helps",
    subtitle: "Search, summarize, discover with Visionco AI",
    icon: Sparkles,
    bgColor: "bg-[#1a1a2e]", // Deep purple/blue
    iconColor: "text-secondary",
    accentColor: "bg-secondary/20",
  },
  {
    title: "Save Social Content",
    subtitle: "WhatsApp statuses and more, saved in one tap",
    icon: Smartphone,
    bgColor: "bg-[#0a0a0a]",
    iconColor: "text-green-500",
    accentColor: "bg-green-500/20",
  }
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * width,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      router.replace("/(tabs)");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      >
        {SLIDES.map((slide, index) => (
          <View key={index} style={{ width }} className={cn("flex-1 items-center justify-center px-8", slide.bgColor)}>
            <Animated.View 
              entering={FadeInDown.delay(200).duration(800)}
              className={cn("h-48 w-48 rounded-full items-center justify-center mb-12", slide.accentColor)}
            >
              <slide.icon size={80} className={slide.iconColor} />
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(400).duration(800)} className="items-center">
              <Text className="text-3xl font-black text-white text-center mb-4">{slide.title}</Text>
              <Text className="text-lg text-muted-foreground text-center px-4 leading-6">
                {slide.subtitle}
              </Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Skip Button */}
      {activeIndex < SLIDES.length - 1 && (
        <Pressable 
          onPress={handleSkip}
          className="absolute top-12 right-6 p-2"
        >
          <Text className="text-muted-foreground font-bold">Skip</Text>
        </Pressable>
      )}

      {/* Bottom Controls */}
      <SafeAreaView className="absolute bottom-10 left-0 right-0 px-8" edges={["bottom"]}>
        <View className="flex-row items-center justify-between">
          {/* Pagination Dots */}
          <View className="flex-row gap-2">
            {SLIDES.map((_, index) => {
              const dotStyle = useAnimatedStyle(() => {
                const dotWidth = interpolate(
                  scrollX.value,
                  [(index - 1) * width, index * width, (index + 1) * width],
                  [8, 24, 8],
                  Extrapolate.CLAMP
                );
                const opacity = interpolate(
                  scrollX.value,
                  [(index - 1) * width, index * width, (index + 1) * width],
                  [0.3, 1, 0.3],
                  Extrapolate.CLAMP
                );
                return {
                  width: dotWidth,
                  opacity,
                };
              });

              return (
                <Animated.View 
                  key={index} 
                  style={dotStyle}
                  className="h-2 rounded-full bg-primary"
                />
              );
            })}
          </View>

          {/* Action Button */}
          <Button 
            onPress={handleNext}
            className="h-14 px-8 rounded-2xl bg-primary flex-row items-center shadow-lg shadow-primary/20"
          >
            <Text className="text-primary-foreground font-black text-lg mr-2">
              {activeIndex === SLIDES.length - 1 ? "GET STARTED" : "NEXT"}
            </Text>
            <ChevronRight size={20} className="text-primary-foreground" />
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}
