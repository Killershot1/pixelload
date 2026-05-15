import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Text, SafeAreaView, Input, Badge } from "@/components/ui";
import { Search, TrendingUp, Hash, ArrowRight } from "lucide-react-native";

const CATEGORIES = [
  "Global Hits", "News Daily", "Tech 2025", "Gaming", "Education", "Comedy Africa"
];

const TRENDING_TAGS = [
  "VisioncoAI", "PixelLoad", "WorldCup2026", "ClimateAction", "SpaceX", "Afrobeat"
];

export default function DiscoverScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Text variant="h2" className="font-bold mb-1">Discover</Text>
          <Text className="text-muted-foreground mb-6">Explore the world through Vision Pixels</Text>

          <View className="relative mb-8">
            <Input 
              placeholder="Search movies, music, and creators..." 
              className="pl-12 h-14 bg-card border-border/50"
            />
            <Search size={20} className="absolute left-4 top-4 text-muted-foreground" />
          </View>

          {/* Trending Tags */}
          <View className="mb-8">
            <Text className="font-bold mb-4 flex-row items-center">
              <TrendingUp size={18} className="text-primary mr-2" />
              Trending Tags
            </Text>
            <View className="flex-row flex-wrap">
              {TRENDING_TAGS.map((tag) => (
                <Badge key={tag} variant="secondary" className="mr-2 mb-2 px-3 py-1.5 bg-secondary/10 border border-secondary/20">
                  <Text className="text-secondary text-sm">#{tag}</Text>
                </Badge>
              ))}
            </View>
          </View>

          {/* Categories Grid */}
          <View className="mb-8">
            <Text className="font-bold mb-4">Categories</Text>
            <View className="flex-row flex-wrap justify-between">
              {CATEGORIES.map((cat, i) => (
                <Pressable 
                  key={cat} 
                  className="w-[48%] bg-card h-24 rounded-2xl p-4 mb-4 border border-border justify-between"
                >
                  <View className="h-8 w-8 rounded-full bg-primary/20 items-center justify-center">
                    <Hash size={16} className="text-primary" />
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-bold text-foreground">{cat}</Text>
                    <ArrowRight size={14} className="text-muted-foreground" />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Featured Creators */}
          <View className="mb-10">
            <Text className="font-bold mb-4">Featured Channels</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} className="mr-6 items-center">
                  <View className="h-16 w-16 rounded-full bg-muted border-2 border-primary mb-2 overflow-hidden">
                    <View className="h-full w-full items-center justify-center bg-secondary/30">
                      <Text className="text-white font-bold">VP</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-foreground font-medium">Channel {i}</Text>
                  <Text className="text-[10px] text-muted-foreground">1.2M subs</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
