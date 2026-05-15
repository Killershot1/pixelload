import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  View, 
  ScrollView, 
  Pressable, 
  Image, 
  ActivityIndicator, 
  Dimensions,
  TextInput,
  Alert
} from "react-native";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  SafeAreaView, 
  Text, 
  Button, 
  Badge, 
  Card,
  Input,
  Spinner
} from "../../components/ui";
import { 
  Search, 
  Sparkles, 
  FileText, 
  Target, 
  Play, 
  Download, 
  Share2, 
  ChevronRight, 
  RefreshCcw,
  AlertCircle,
  TrendingUp,
  Clock,
  ExternalLink,
  Lock
} from "lucide-react-native";
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  SlideInRight,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { cn } from "../../components/ui/utils/cn";
import { AIBadge } from "@/components/ai/AIBadge";
import { QualitySheet } from "@/components/downloader/QualitySheet";

interface VideoMetadata {
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
  formats: Array<{
    quality: string;
    sizeMB: number;
    proOnly: boolean;
    fileSizeBytes: number;
  }>;
}

const { width } = Dimensions.get("window");

// --- Types ---
interface AISearchResult {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
  viewCount: string;
  relevanceScore: number;
  aiReason: string;
}

interface VideoSummary {
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  confidence: number;
}

interface AIRecommendation {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
  aiReason: string;
}

interface DailyUsage {
  count: number;
  remaining: number;
  aiSearchCount: number;
  aiSearchRemaining: number;
  aiSummaryCount: number;
  aiSummaryRemaining: number;
  resetAt: string;
}

const SEARCH_EXAMPLES = [
  "Funny Zim comedy 2025",
  "How to fix a borehole",
  "Afrobeats new music",
  "Cricket highlights"
];

const THINKING_MESSAGES_SEARCH = [
  "⚡ Visionco AI is searching across millions of videos...",
  "⚡ Understanding your request...",
  "⚡ Finding the most relevant matches...",
  "⚡ Ranking results by relevance..."
];

const THINKING_MESSAGES_SUMMARY = [
  "⚡ Visionco AI is reading the video...",
  "⚡ Extracting key insights...",
  "⚡ Analyzing video content...",
  "⚡ Generating your summary..."
];

export default function AIScreen() {
  // --- Shared State ---
  const [clientId, setClientId] = useState<string>("");
  const [isProUser, setIsProUser] = useState(false);
  const [isQualitySheetOpen, setIsQualitySheetOpen] = useState(false);
  const [selectedVideoMetadata, setSelectedVideoMetadata] = useState<VideoMetadata | null>(null);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AISearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [thinkingMessageSearch, setThinkingMessageSearch] = useState(THINKING_MESSAGES_SEARCH[0]);

  // --- Summarizer State ---
  const [summaryUrl, setSummaryUrl] = useState("");
  const [summaryResult, setSummaryResult] = useState<VideoSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [thinkingMessageSummary, setThinkingMessageSummary] = useState(THINKING_MESSAGES_SUMMARY[0]);

  // --- Recommendations State ---
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  // --- Convex Hooks ---
  const today = new Date().toISOString().split("T")[0];
  const dailyUsage = useQuery((api as any).downloads.getDailyUsage, clientId ? { clientId, date: today } : "skip");
  const performAiSearch = useAction((api as any).ai.aiSearch);
  const performSummarize = useAction((api as any).ai.summarizeVideo);
  const fetchRecs = useAction((api as any).ai.getRecommendations);

  // --- Initialization ---
  useEffect(() => {
    async function init() {
      let id = await AsyncStorage.getItem("pixel_load_client_id");
      if (!id) {
        id = Crypto.randomUUID();
        await AsyncStorage.setItem("pixel_load_client_id", id);
      }
      setClientId(id);

      const pro = await AsyncStorage.getItem("pixel_load_is_pro");
      setIsProUser(pro === "true");
      
      // Initial recommendations load
      loadRecommendations(id);
    }
    init();
  }, []);

  // --- Logic ---
  const loadRecommendations = async (cid: string) => {
    setRecsLoading(true);
    try {
      const history = await AsyncStorage.getItem("pixel_load_watch_history");
      const watchHistory = history ? JSON.parse(history) : [];
      const data = await fetchRecs({ clientId: cid, watchHistory });
      setRecommendations(data.recommendations);
    } catch (e) {
      console.error("Failed to load recs", e);
    } finally {
      setRecsLoading(false);
    }
  };

  const handleAiSearch = async (queryToUse?: string) => {
    const finalQuery = queryToUse || searchQuery;
    if (finalQuery.trim().length < 3) {
      setSearchError("Please enter at least 3 characters");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);

    // Rotate thinking messages
    const interval = setInterval(() => {
      setThinkingMessageSearch(prev => {
        const idx = THINKING_MESSAGES_SEARCH.indexOf(prev);
        return THINKING_MESSAGES_SEARCH[(idx + 1) % THINKING_MESSAGES_SEARCH.length];
      });
    }, 2000);

    try {
      const data = await performAiSearch({ query: finalQuery, clientId });
      setSearchResults(data.results);
    } catch (err: any) {
      if (err.message.includes("AI_SEARCH_LIMIT_REACHED")) {
        // Handled by UI usage check
      } else {
        setSearchError("AI Search unavailable — try again");
      }
    } finally {
      clearInterval(interval);
      setSearchLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!summaryUrl) return;

    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryResult(null);

    const interval = setInterval(() => {
      setThinkingMessageSummary(prev => {
        const idx = THINKING_MESSAGES_SUMMARY.indexOf(prev);
        return THINKING_MESSAGES_SUMMARY[(idx + 1) % THINKING_MESSAGES_SUMMARY.length];
      });
    }, 2000);

    try {
      const data = await performSummarize({ url: summaryUrl, clientId });
      setSummaryResult(data as any);
    } catch (err: any) {
      setSummaryError("Could not summarize — check the URL");
    } finally {
      clearInterval(interval);
      setSummaryLoading(false);
    }
  };

  const handleDownloadResult = (video: any) => {
    // Map AI result to VideoMetadata for QualitySheet
    const metadata: VideoMetadata = {
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration || "0:00",
      channel: video.channel,
      formats: [
        { quality: "1080p", sizeMB: 450, proOnly: true, fileSizeBytes: 450 * 1024 * 1024 },
        { quality: "720p", sizeMB: 280, proOnly: false, fileSizeBytes: 280 * 1024 * 1024 },
        { quality: "Audio MP3", sizeMB: 8, proOnly: false, fileSizeBytes: 8 * 1024 * 1024 },
      ]
    };
    setSelectedVideoMetadata(metadata);
    setIsQualitySheetOpen(true);
  };

  const searchLimitReached = !isProUser && dailyUsage && dailyUsage.aiSearchRemaining === 0;
  const summaryLimitReached = !isProUser && dailyUsage && dailyUsage.aiSummaryRemaining === 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-primary">⚡ Visionco AI</Text>
            <Text className="text-muted-foreground text-sm">Powered by Vision Pixels</Text>
          </View>
          <Pressable className="h-10 w-10 rounded-full bg-muted items-center justify-center border border-border">
            <Text className="text-foreground font-bold">V</Text>
          </Pressable>
        </View>

        {/* Usage Pills */}
        {!isProUser && dailyUsage && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 flex-row gap-2">
            <Pressable className="flex-row items-center bg-card border border-border px-3 py-1.5 rounded-full mr-2">
              <Search size={12} className="text-primary mr-2" />
              <Text className="text-xs font-medium text-foreground">
                🔍 {dailyUsage.aiSearchRemaining}/3 searches left
              </Text>
            </Pressable>
            <Pressable className="flex-row items-center bg-card border border-border px-3 py-1.5 rounded-full">
              <FileText size={12} className="text-secondary mr-2" />
              <Text className="text-xs font-medium text-foreground">
                📝 {dailyUsage.aiSummaryRemaining}/2 summaries left
              </Text>
            </Pressable>
          </ScrollView>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* SECTION 1: AI SEARCH */}
        <View className="px-4 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <AIBadge variant="cyan" size="sm" className="mr-2" />
              <Text variant="h3" className="font-bold">AI Search</Text>
            </View>
            <Target size={18} className="text-primary" />
          </View>

          <View className="relative mb-3">
            <Input
              placeholder="Describe what you want to watch..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="h-14 pr-12 bg-card border-border/50"
              editable={!searchLoading && !searchLimitReached}
            />
            <Search size={20} className="absolute right-4 top-4 text-muted-foreground" />
          </View>

          {/* Example Chips */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {SEARCH_EXAMPLES.map((ex) => (
              <Pressable 
                key={ex} 
                onPress={() => {
                  setSearchQuery(ex);
                  handleAiSearch(ex);
                }}
                className="bg-muted px-3 py-1.5 rounded-lg"
              >
                <Text className="text-xs text-muted-foreground">{ex}</Text>
              </Pressable>
            ))}
          </View>

          <Button 
            onPress={() => handleAiSearch()}
            disabled={searchLoading || !searchQuery || searchLimitReached}
            className={cn("h-12 bg-primary mb-6", searchLimitReached && "bg-muted")}
          >
            <Text className="text-primary-foreground font-bold">
              {searchLimitReached ? "Daily limit reached" : "Search with AI"}
            </Text>
          </Button>

          {/* Search Results Area */}
          <View className="relative">
            {searchLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator color="#00E5FF" className="mb-4" />
                <Text className="text-primary font-medium italic text-center px-8">
                  {thinkingMessageSearch}
                </Text>
              </View>
            ) : searchError ? (
              <View className="py-8 items-center">
                <AlertCircle size={32} className="text-destructive mb-2" />
                <Text className="text-destructive text-center mb-4">{searchError}</Text>
                <Button variant="outline" size="sm" onPress={() => handleAiSearch()}>
                  <Text>Retry</Text>
                </Button>
              </View>
            ) : searchResults.length > 0 ? (
              <View>
                {searchResults.map((result, idx) => (
                  <Animated.View 
                    key={result.id} 
                    entering={FadeInDown.delay(idx * 100)}
                    className="bg-[#1a1a2e] rounded-2xl p-3 mb-4"
                  >
                    <View className="flex-row">
                      <Image source={{ uri: result.thumbnail }} className="w-[90px] h-[60px] rounded-lg bg-muted" />
                      <View className="flex-1 ml-3">
                        <Text className="font-bold text-sm leading-4" numberOfLines={2}>{result.title}</Text>
                        <Text className="text-[10px] text-muted-foreground mt-1">{result.channel} • {result.duration}</Text>
                      </View>
                    </View>
                    
                    <View className="mt-3 bg-black/20 rounded-full h-1 overflow-hidden">
                      <View className="bg-primary h-full" style={{ width: `${result.relevanceScore * 100}%` }} />
                    </View>
                    <View className="flex-row justify-between mt-1 mb-2">
                      <Text className="text-[10px] text-primary font-bold">{(result.relevanceScore * 100).toFixed(0)}% Match</Text>
                      <AIBadge size="sm" showText={false} />
                    </View>
                    
                    <Text className="text-[11px] text-primary italic mb-3 leading-4">
                      ⚡ "{result.aiReason}"
                    </Text>
                    
                    <View className="flex-row gap-2">
                      <Button variant="ghost" className="flex-1 h-9 bg-black/30 border border-white/5">
                        <Play size={14} className="text-foreground mr-1.5" />
                        <Text className="text-[11px] font-bold text-foreground">Stream</Text>
                      </Button>
                      <Button onPress={() => handleDownloadResult(result)} className="flex-1 h-9 bg-primary">
                        <Download size={14} className="text-primary-foreground mr-1.5" />
                        <Text className="text-[11px] font-bold text-primary-foreground">Download</Text>
                      </Button>
                    </View>
                  </Animated.View>
                ))}
              </View>
            ) : (
              !searchLoading && (
                <View className="py-12 items-center opacity-30">
                  <Sparkles size={48} className="text-muted-foreground mb-4" />
                  <Text className="text-muted-foreground font-medium">Ask Visionco AI anything</Text>
                </View>
              )
            )}

            {/* Limit Blur Overlay */}
            {searchLimitReached && searchResults.length > 0 && (
              <View className="absolute inset-0 bg-background/60 items-center justify-center rounded-3xl" style={{ backdropFilter: 'blur(10px)' } as any}>
                <View className="bg-card border border-primary/30 p-6 rounded-3xl items-center shadow-xl w-[90%]">
                  <AIBadge size="lg" className="mb-4" />
                  <Text className="font-bold text-lg text-center mb-2">Daily Search Limit Reached</Text>
                  <Text className="text-muted-foreground text-center text-sm mb-6">
                    Upgrade to PixelLoad Pro for unlimited AI searches and features.
                  </Text>
                  <Button className="w-full bg-primary h-12 rounded-xl mb-3">
                    <Text className="text-primary-foreground font-bold">Go Pro Now</Text>
                  </Button>
                  <Pressable><Text className="text-muted-foreground text-xs">Tomorrow</Text></Pressable>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* SECTION 2: AI SUMMARIZER */}
        <View className="px-4 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <AIBadge variant="purple" size="sm" className="mr-2" />
              <Text variant="h3" className="font-bold">AI Summarizer</Text>
            </View>
            <FileText size={18} className="text-secondary" />
          </View>

          <View className="relative mb-3">
            <Input
              placeholder="Paste any video link..."
              value={summaryUrl}
              onChangeText={setSummaryUrl}
              className="h-14 pr-12 bg-card border-border/50"
              editable={!summaryLoading && !summaryLimitReached}
            />
            <ExternalLink size={20} className="absolute right-4 top-4 text-muted-foreground" />
          </View>

          <Button 
            onPress={handleSummarize}
            disabled={summaryLoading || !summaryUrl || summaryLimitReached}
            className={cn("h-12 bg-secondary", summaryLimitReached && "bg-muted")}
          >
            {summaryLoading ? (
               <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">
                {summaryLimitReached ? "0 summaries remaining today" : "Summarize with AI"}
              </Text>
            )}
          </Button>

          {summaryLoading && (
            <Animated.View entering={FadeIn} className="mt-4 py-8 items-center bg-secondary/5 rounded-2xl border border-secondary/10">
              <ActivityIndicator color="#6200EA" className="mb-4" />
              <Text className="text-secondary font-medium italic text-center px-8">
                {thinkingMessageSummary}
              </Text>
            </Animated.View>
          )}

          {summaryResult && !summaryLoading && (
            <Animated.View entering={FadeInDown} className="mt-4 bg-[#1a1a2e] rounded-3xl border border-secondary/20 overflow-hidden">
               <View className="bg-secondary/10 px-4 py-3 flex-row items-center justify-between">
                  <Text className="text-secondary font-bold">⚡ Visionco AI Summary</Text>
                  <View className="bg-secondary px-2 py-0.5 rounded">
                    <Text className="text-[10px] text-white font-bold">{summaryResult.sentiment.toUpperCase()}</Text>
                  </View>
               </View>
               
               <Image source={{ uri: summaryResult.thumbnail }} className="w-full aspect-video" />
               
               <View className="p-4">
                  <Text className="font-bold text-lg leading-6 mb-1">{summaryResult.title}</Text>
                  <Text className="text-xs text-muted-foreground mb-4">{summaryResult.channel} • {summaryResult.duration}</Text>
                  
                  <View className="h-[1px] bg-white/5 mb-4" />
                  
                  <Text className="text-muted-foreground leading-5 mb-6">
                    {summaryResult.summary}
                  </Text>
                  
                  <Text className="font-bold text-sm mb-3">Key Points:</Text>
                  {summaryResult.keyPoints.map((point, i) => (
                    <View key={i} className="flex-row mb-2 pr-4">
                      <View className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-3" />
                      <Text className="text-muted-foreground text-sm flex-1">{point}</Text>
                    </View>
                  ))}
                  
                  <View className="flex-row flex-wrap gap-2 mt-4 mb-6">
                    {summaryResult.topics.map(t => (
                      <Badge key={t} className="bg-secondary/20 border-secondary/30">
                        <Text className="text-[10px] text-secondary font-bold">{t}</Text>
                      </Badge>
                    ))}
                  </View>
                  
                  <View className="mb-6">
                    <View className="flex-row justify-between mb-1.5">
                      <Text className="text-xs text-muted-foreground">AI Confidence: {(summaryResult.confidence * 100).toFixed(0)}%</Text>
                    </View>
                    <View className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <View className="bg-primary h-full" style={{ width: `${summaryResult.confidence * 100}%` }} />
                    </View>
                  </View>
                  
                  <View className="flex-row gap-3">
                    <Button onPress={() => handleDownloadResult(summaryResult)} className="flex-1 bg-primary h-12 rounded-xl">
                      <Download size={18} className="text-primary-foreground mr-2" />
                      <Text className="text-primary-foreground font-bold">Download Video</Text>
                    </Button>
                    <Button variant="outline" className="w-12 h-12 rounded-xl border-border">
                      <Share2 size={18} className="text-foreground" />
                    </Button>
                  </View>
               </View>
            </Animated.View>
          )}
        </View>

        {/* SECTION 3: AI PICKS */}
        <View className="px-4 mb-20">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <AIBadge variant="dark" size="sm" className="mr-2" />
              <Text variant="h3" className="font-bold">Picked For You</Text>
            </View>
            <Pressable onPress={() => clientId && loadRecommendations(clientId)} className="flex-row items-center">
              <RefreshCcw size={14} className={cn("text-primary mr-1", recsLoading && "animate-spin")} />
              <Text className="text-xs text-primary font-medium">Refresh</Text>
            </Pressable>
          </View>

          {recsLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-4">
              {[1, 2, 3].map(i => (
                <View key={i} className="w-[160px] bg-card rounded-2xl overflow-hidden border border-border/50 mr-4">
                  <View className="h-[100px] bg-muted animate-pulse" />
                  <View className="p-3">
                    <View className="h-3 bg-muted w-full mb-2 rounded" />
                    <View className="h-3 bg-muted w-2/3 rounded" />
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : recommendations.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
               {recommendations.map(rec => (
                 <Pressable 
                  key={rec.id} 
                  onPress={() => handleDownloadResult(rec)}
                  className="w-[160px] bg-card rounded-2xl overflow-hidden border border-border/50 mr-4"
                 >
                    <Image source={{ uri: rec.thumbnail }} className="w-full h-[100px] bg-muted" />
                    <View className="p-3">
                      <Text className="text-[12px] font-bold text-foreground leading-4 h-8" numberOfLines={2}>
                        {rec.title}
                      </Text>
                      <Text className="text-[10px] text-primary italic mt-2 font-medium" numberOfLines={2}>
                        ⚡ {rec.aiReason}
                      </Text>
                    </View>
                 </Pressable>
               ))}
            </ScrollView>
          ) : (
            <View className="py-12 items-center bg-card rounded-3xl border border-border/50 border-dashed">
              <Target size={32} className="text-muted-foreground/30 mb-2" />
              <Text className="text-muted-foreground text-center px-8 text-sm">
                Watch some videos first and AI will learn your taste
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reusable Quality Sheet */}
      {isQualitySheetOpen && selectedVideoMetadata && (
        <QualitySheet
          isOpen={isQualitySheetOpen}
          onClose={() => setIsQualitySheetOpen(false)}
          title={selectedVideoMetadata.title}
          qualities={selectedVideoMetadata.formats.map(f => ({
            id: f.quality,
            label: f.quality,
            res: f.quality,
            fileSizeLabel: `${f.sizeMB} MB`,
            isPro: f.proOnly
          }))}
          selectedQualityId=""
          onSelect={(q) => {
            setIsQualitySheetOpen(false);
            Alert.alert("Success", "Download started! Track it in the Downloads tab.");
          }}
          isProUser={isProUser}
          onUpgrade={() => {
            setIsQualitySheetOpen(false);
            Alert.alert("Pro Feature", "Upgrade to Pro to unlock 1080p quality!");
          }}
        />
      )}
    </SafeAreaView>
  );
}
