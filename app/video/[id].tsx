import React, { useState } from "react";
import { View, ScrollView, Image, Pressable, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, SafeAreaView, Button, Badge, Card } from "@/components/ui";
import { ChevronLeft, Play, Download, Share2, MessageSquare, ThumbsUp, Sparkles, Clock, Eye } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function VideoDetailScreen() {
  const { id, title, thumbnail, channel, views, duration } = useLocalSearchParams();
  const router = useRouter();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSummarize = () => {
    setIsSummarizing(true);
    // Simulate Visionco AI Summarization
    setTimeout(() => {
      setSummary("This video discusses the rapid evolution of AI in 2025, focusing on how Visionco AI is leading the charge in mobile-first intelligence. Key takeaways: 1. Speed is everything. 2. Data conservation is crucial for global markets. 3. Personalization drives engagement.");
      setIsSummarizing(false);
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 justify-between">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center bg-muted rounded-full">
          <ChevronLeft size={24} className="text-foreground" />
        </Pressable>
        <Badge variant="secondary" className="bg-secondary/20">
          <Sparkles size={12} className="text-primary mr-1" />
          <Text className="text-[10px] text-primary font-bold">VISIONCO AI</Text>
        </Badge>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Video Player Placeholder */}
        <View className="w-full bg-black aspect-video relative">
          {thumbnail ? (
            <Image source={{ uri: thumbnail as string }} className="w-full h-full opacity-60" />
          ) : (
            <View className="w-full h-full bg-muted" />
          )}
          <View className="absolute inset-0 items-center justify-center">
            <View className="h-16 w-16 rounded-full bg-primary items-center justify-center">
              <Play size={32} className="text-primary-foreground ml-1" />
            </View>
          </View>
        </View>

        <View className="p-4">
          <Text variant="h3" className="font-bold leading-tight mb-2">{title || "Video Loading..."}</Text>
          
          <View className="flex-row items-center mb-6">
            <View className="h-10 w-10 rounded-full bg-secondary items-center justify-center mr-3">
              <Text className="text-white font-bold">{channel?.toString()[0] || "V"}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-foreground">{channel || "Vision Pixels"}</Text>
              <Text variant="small" className="text-muted-foreground">1.2M subscribers</Text>
            </View>
            <Button size="sm" className="rounded-full px-6">
              <Text className="font-bold">Subscribe</Text>
            </Button>
          </View>

          {/* Stats Bar */}
          <View className="flex-row items-center justify-between bg-card p-3 rounded-2xl border border-border mb-6">
            <View className="items-center">
              <ThumbsUp size={18} className="text-muted-foreground mb-1" />
              <Text variant="small" className="text-foreground font-medium">124K</Text>
            </View>
            <View className="items-center">
              <MessageSquare size={18} className="text-muted-foreground mb-1" />
              <Text variant="small" className="text-foreground font-medium">8.2K</Text>
            </View>
            <View className="items-center">
              <Eye size={18} className="text-muted-foreground mb-1" />
              <Text variant="small" className="text-foreground font-medium">{views || "0"} views</Text>
            </View>
            <View className="items-center">
              <Clock size={18} className="text-muted-foreground mb-1" />
              <Text variant="small" className="text-foreground font-medium">{duration || "0:00"}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-8">
            <Button className="flex-1 h-14 bg-primary flex-row items-center" onPress={() => {}}>
              <Download size={20} className="text-primary-foreground mr-2" />
              <Text className="text-primary-foreground font-bold">Download</Text>
            </Button>
            <Button variant="outline" className="h-14 w-14 border-border" onPress={() => {}}>
              <Share2 size={20} className="text-foreground" />
            </Button>
          </View>

          {/* Visionco AI Summarizer Card */}
          <Card className="border-primary/20 bg-primary/5 p-4 mb-8">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Sparkles size={18} className="text-primary mr-2" />
                <Text className="font-bold text-primary">Visionco AI Summary</Text>
              </View>
              {!summary && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-3" 
                  onPress={handleSummarize}
                  disabled={isSummarizing}
                >
                  <Text className="text-primary text-xs font-bold">
                    {isSummarizing ? "Summarizing..." : "Summarize"}
                  </Text>
                </Button>
              )}
            </View>
            
            {summary ? (
              <Text className="text-muted-foreground leading-5">{summary}</Text>
            ) : (
              <Text className="text-muted-foreground italic text-sm">
                Want to know what's in this video before downloading? Get an AI summary instantly.
              </Text>
            )}
          </Card>

          {/* Related Content Placeholder */}
          <Text className="font-bold mb-4">Up Next</Text>
          {[1, 2, 3].map((i) => (
            <Pressable key={i} className="flex-row mb-4">
              <Image 
                source={{ uri: `https://picsum.photos/seed/${i+40}/160/90` }}
                className="w-32 h-20 rounded-xl bg-muted mr-3"
              />
              <View className="flex-1 py-1">
                <Text className="font-bold leading-tight mb-1" numberOfLines={2}>
                  PixelLoad Pro: Why you should upgrade today
                </Text>
                <Text className="text-[11px] text-muted-foreground">Vision Pixels • 450K views</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
