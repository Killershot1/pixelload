import React, { useState, useEffect } from "react";
import { View, Pressable, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { SafeAreaView, Text, Badge } from "../../components/ui";
import { 
  MessageCircle, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Share2
} from "lucide-react-native";
import Animated, { 
  FadeIn, 
  SlideInRight, 
  SlideInLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from "react-native-reanimated";
import { cn } from "../../components/ui/utils/cn";

// Internal Components
import { StatusSaver } from "../../components/social/StatusSaver";
import { ContentOrganizer } from "../../components/social/ContentOrganizer";
import { RepostFormatter } from "../../components/social/RepostFormatter";

const { width } = Dimensions.get("window");

export default function SocialHubScreen() {
  const [activeTab, setActiveTab] = useState<'statuses' | 'organizer'>('statuses');
  const [clientId, setClientId] = useState<string>("");
  const [selectedRepostItem, setSelectedRepostItem] = useState<any>(null);
  const [isRepostSheetOpen, setIsRepostSheetOpen] = useState(false);

  useEffect(() => {
    async function init() {
      let id = await AsyncStorage.getItem("pixel_load_client_id");
      if (!id) {
        id = Crypto.randomUUID();
        await AsyncStorage.setItem("pixel_load_client_id", id);
      }
      setClientId(id);
    }
    init();
  }, []);

  const handleOpenRepost = (item: any) => {
    setSelectedRepostItem(item);
    setIsRepostSheetOpen(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-foreground">Social Hub</Text>
          <View className="flex-row items-center">
            <Text className="text-muted-foreground text-xs mr-2">Media Toolkit</Text>
            <View className="bg-green-500/10 px-1.5 py-0.5 rounded flex-row items-center">
              <Sparkles size={10} className="text-green-500 mr-1" />
              <Text className="text-[8px] font-bold text-green-500 uppercase">Vision Pixels</Text>
            </View>
          </View>
        </View>
        <Pressable className="h-10 w-10 rounded-full bg-muted items-center justify-center border border-border">
          <Share2 size={20} className="text-foreground" />
        </Pressable>
      </View>

      {/* Internal Tabs */}
      <View className="flex-row px-4 mb-4 gap-2">
        <Pressable 
          onPress={() => setActiveTab('statuses')}
          className={cn(
            "flex-1 flex-row items-center justify-center py-3 rounded-2xl border",
            activeTab === 'statuses' ? "bg-primary/10 border-primary" : "bg-card border-border/50"
          )}
        >
          <MessageCircle size={18} className={cn("mr-2", activeTab === 'statuses' ? "text-primary" : "text-muted-foreground")} />
          <Text className={cn("font-bold text-sm", activeTab === 'statuses' ? "text-foreground" : "text-muted-foreground")}>
            Statuses
          </Text>
        </Pressable>
        <Pressable 
          onPress={() => setActiveTab('organizer')}
          className={cn(
            "flex-1 flex-row items-center justify-center py-3 rounded-2xl border",
            activeTab === 'organizer' ? "bg-primary/10 border-primary" : "bg-card border-border/50"
          )}
        >
          <Layers size={18} className={cn("mr-2", activeTab === 'organizer' ? "text-primary" : "text-muted-foreground")} />
          <Text className={cn("font-bold text-sm", activeTab === 'organizer' ? "text-foreground" : "text-muted-foreground")}>
            Organizer
          </Text>
        </Pressable>
      </View>

      {/* Content Area */}
      <View className="flex-1">
        {activeTab === 'statuses' ? (
          <Animated.View entering={FadeIn} className="flex-1">
            <StatusSaver clientId={clientId} />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} className="flex-1">
            <ContentOrganizer clientId={clientId} onOpenRepost={handleOpenRepost} />
          </Animated.View>
        )}
      </View>

      {/* Repost Formatter Sheet */}
      {isRepostSheetOpen && (
        <RepostFormatter 
          item={selectedRepostItem} 
          onClose={() => setIsRepostSheetOpen(false)} 
        />
      )}
    </SafeAreaView>
  );
}
