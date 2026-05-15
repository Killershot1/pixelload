import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, Pressable, RefreshControl } from "react-native";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Text, Card, CardContent, Input, Badge, SafeAreaView, Spinner } from "@/components/ui";
import { Search, Play, Download, Sparkles, TrendingUp, Music, Trophy, Film } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const getTrending = useAction(api.youtube.getTrendingVideos);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrending = async () => {
    try {
      const data = await getTrending({ regionCode: "ZW" });
      setVideos(data);
    } catch (error) {
      console.error("Failed to fetch trending:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrending();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView 
        className="flex-1 px-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00E5FF" />
        }
      >
        {/* Header & Visionco AI Branding */}
        <View className="flex-row justify-between items-center py-4">
          <View>
            <Text variant="h1" className="text-primary font-bold">PixelLoad</Text>
            <View className="flex-row items-center">
              <Badge variant="secondary" className="px-1 py-0 bg-secondary/20">
                <Sparkles size={12} className="text-primary mr-1" />
                <Text className="text-[10px] text-primary font-bold uppercase tracking-tighter">
                  Powered by Visionco AI
                </Text>
              </Badge>
            </View>
          </View>
          <Pressable 
            onPress={() => router.push("/profile")}
            className="h-10 w-10 rounded-full bg-muted items-center justify-center border border-border"
          >
            <Text className="text-foreground font-bold text-lg">V</Text>
          </Pressable>
        </View>

        {/* AI Natural Language Search Bar */}
        <View className="relative mb-6">
          <Input 
            placeholder="Search videos with AI..." 
            className="pl-12 h-14 bg-card border-border/50 text-foreground"
          />
          <Search size={20} className="absolute left-4 top-4 text-muted-foreground" />
          <View className="absolute right-3 top-3">
            <Badge variant="outline" className="border-primary/30">
              <Text className="text-[10px] text-primary">⚡ Visionco AI</Text>
            </Badge>
          </View>
        </View>

        {/* Category Strips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          {[
            { name: "Trending", icon: TrendingUp },
            { name: "Music", icon: Music },
            { name: "Sports", icon: Trophy },
            { name: "Movies", icon: Film },
          ].map((cat) => (
            <Pressable key={cat.name} className="mr-3 flex-row items-center bg-card px-4 py-3 rounded-2xl border border-border">
              <cat.icon size={18} className="text-primary mr-2" />
              <Text className="font-medium">{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Trending Feed */}
        <View className="mb-10">
          <View className="flex-row items-center mb-4">
            <TrendingUp size={20} className="text-primary mr-2" />
            <Text variant="h3" className="font-bold">Trending in Zimbabwe</Text>
          </View>

          {loading ? (
            <View className="py-20 items-center justify-center">
              <Spinner size="large" className="text-primary" />
              <Text className="text-muted-foreground mt-4">Analyzing trends with Visionco AI...</Text>
            </View>
          ) : (
            videos.map((video) => (
              <Pressable 
                key={video.id} 
                className="mb-6"
                onPress={() => router.push({
                  pathname: "/video/[id]",
                  params: { ...video }
                })}
              >
                <Card className="border-0 bg-transparent">
                  <View className="relative rounded-3xl overflow-hidden mb-3">
                    <Image 
                      source={{ uri: video.thumbnail }}
                      className="w-full h-52 bg-muted"
                    />
                    <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded">
                      <Text className="text-[10px] text-white font-bold">{video.duration}</Text>
                    </View>
                    <View className="absolute inset-0 items-center justify-center bg-black/10">
                      <View className="h-14 w-14 rounded-full bg-primary/90 items-center justify-center">
                        <Play size={28} className="text-primary-foreground ml-1" />
                      </View>
                    </View>
                  </View>
                  <View className="flex-row px-1">
                    <View className="h-10 w-10 rounded-full bg-secondary items-center justify-center mr-3">
                      <Text className="text-white font-bold">{video.channel[0]}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-lg mb-1 leading-tight" numberOfLines={2}>
                        {video.title}
                      </Text>
                      <Text variant="small" className="text-muted-foreground">
                        {video.channel} • {video.views} views • {video.publishedAt}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
