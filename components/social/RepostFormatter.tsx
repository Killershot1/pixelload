import React, { useState, useMemo } from "react";
import { 
  View, 
  Image, 
  Pressable, 
  ScrollView, 
  TextInput, 
  ActivityIndicator,
  Dimensions,
  Share,
  Platform
} from "react-native";
import * as Clipboard from "expo-clipboard";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Text, Button, Badge, Switch } from "../ui";
import { 
  ExternalLink, 
  Sparkles, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Twitter, 
  Video,
  Copy,
  Check,
  Smartphone,
  Send,
  X
} from "lucide-react-native";
import { AIBadge } from "@/components/ai/AIBadge";
import { cn } from "../ui/utils/cn";
import { Id } from "../../convex/_generated/dataModel";

const { width } = Dimensions.get("window");

interface RepostFormatterProps {
  item: {
    _id: Id<"savedContent">;
    localFilePath: string;
    contentType: string;
    platform: string;
    thumbnail?: string;
  } | null;
  onClose: () => void;
}

type SocialPlatform = 'WhatsApp' | 'Instagram' | 'Facebook' | 'Twitter' | 'TikTok';

const PLATFORMS: { name: SocialPlatform; icon: any; color: string }[] = [
  { name: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { name: 'TikTok', icon: Video, color: '#000000' },
];

export function RepostFormatter({ item, onClose }: RepostFormatterProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('WhatsApp');
  const [caption, setCaption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [addWatermark, setAddWatermark] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const snapPoints = useMemo(() => ["85%"], []);

  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    // Simulate AI Generation
    setTimeout(() => {
      const suggestions = [
        `Check out this amazing ${item?.contentType} I found! 🔥`,
        `Visionco AI recommended this to me, it's a must watch! ⚡`,
        `Loving the vibes in this one. ${selectedPlatform === 'Instagram' ? '#vibes #trending' : ''}`,
        `Wait for the end... you won't believe it! 😱`
      ];
      const random = suggestions[Math.floor(Math.random() * suggestions.length)];
      setCaption(random);
      setIsGenerating(false);
    }, 1500);
  };

  const charLimit = selectedPlatform === 'Twitter' ? 280 : selectedPlatform === 'Instagram' ? 2200 : Infinity;
  const isOverLimit = caption.length > charLimit;

  const handleCopyAndShare = async () => {
    if (!item) return;

    let finalCaption = caption;
    if (addWatermark) {
      finalCaption += "\n\nShared via PixelLoad ⚡";
    }

    try {
      await Clipboard.setStringAsync(finalCaption);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);

      // Open native share sheet with file
      await Share.share({
        url: item.localFilePath,
        message: finalCaption
      });
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
  );

  if (!item) return null;

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#050507" }}
      handleIndicatorStyle={{ backgroundColor: "#333" }}
    >
      <BottomSheetView className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="bg-primary/20 p-2 rounded-xl mr-3">
              <Send size={20} className="text-primary" />
            </View>
            <View>
              <Text className="text-lg font-bold">Repost Content</Text>
              <AIBadge variant="cyan" size="sm" />
            </View>
          </View>
          <Pressable onPress={onClose} className="p-2">
            <X size={24} className="text-muted-foreground" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Preview */}
          <View className="aspect-video bg-muted rounded-2xl overflow-hidden mb-6 relative">
            <Image source={{ uri: item.thumbnail || item.localFilePath }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute inset-0 bg-black/20 items-center justify-center">
               {item.contentType === 'video' && <View className="bg-black/60 p-4 rounded-full"><Video size={32} fill="white" className="text-white" /></View>}
            </View>
          </View>

          {/* Platform Selector */}
          <Text className="font-bold text-sm mb-3 ml-1">Select Platform</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 mb-6">
            {PLATFORMS.map((p) => {
              const isSelected = selectedPlatform === p.name;
              return (
                <Pressable 
                  key={p.name}
                  onPress={() => setSelectedPlatform(p.name)}
                  className={cn(
                    "items-center justify-center p-3 rounded-2xl border-2 w-20",
                    isSelected ? "bg-card border-primary" : "bg-card border-border/50"
                  )}
                >
                  <p.icon size={24} color={isSelected ? p.color : '#666'} />
                  <Text className={cn("text-[10px] mt-2 font-bold", isSelected ? "text-foreground" : "text-muted-foreground")}>
                    {p.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Caption Input */}
          <View className="bg-card border border-border/50 rounded-2xl p-4 mb-4">
             <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-xs">Caption</Text>
                <Pressable 
                  onPress={handleGenerateCaption}
                  disabled={isGenerating}
                  className="flex-row items-center bg-secondary/10 px-3 py-1.5 rounded-full"
                >
                  {isGenerating ? <ActivityIndicator size="small" color="#6200EA" /> : (
                    <>
                      <Sparkles size={12} className="text-secondary mr-1.5" />
                      <Text className="text-[10px] font-bold text-secondary uppercase tracking-tighter">AI Write</Text>
                    </>
                  )}
                </Pressable>
             </View>
             
             <TextInput
                multiline
                placeholder="Write something catchy..."
                placeholderTextColor="#666"
                value={caption}
                onChangeText={setCaption}
                className="text-foreground text-sm min-h-[100px]"
                textAlignVertical="top"
             />

             <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-border/20">
                <View className="flex-row items-center">
                   <Smartphone size={12} className="text-muted-foreground mr-2" />
                   <Text className="text-[10px] text-muted-foreground">
                      {selectedPlatform === 'Twitter' ? '280 chars' : selectedPlatform === 'Instagram' ? '2,200 chars' : 'No limit'}
                   </Text>
                </View>
                <Text className={cn("text-[10px] font-bold", isOverLimit ? "text-red-500" : "text-muted-foreground")}>
                   {caption.length}{charLimit !== Infinity ? `/${charLimit}` : ''}
                </Text>
             </View>
          </View>

          {/* Watermark Toggle */}
          <View className="flex-row items-center justify-between px-2 mb-8">
             <View className="flex-row items-center">
                <Badge variant="outline" className="mr-3 border-primary/30">
                   <Text className="text-[10px] text-primary">WATERMARK</Text>
                </Badge>
                <Text className="text-sm font-medium">Add PixelLoad credits</Text>
             </View>
             <Switch 
                checked={addWatermark} 
                onCheckedChange={setAddWatermark}
             />
          </View>

          {/* Share Button */}
          <Button 
            onPress={handleCopyAndShare}
            disabled={isOverLimit}
            className={cn("h-14 rounded-2xl flex-row items-center justify-center mb-10", isOverLimit ? "bg-muted" : "bg-primary")}
          >
            {isCopied ? (
              <>
                <Check size={20} className="text-primary-foreground mr-2" />
                <Text className="text-primary-foreground font-bold">Copied & Ready!</Text>
              </>
            ) : (
              <>
                <Copy size={18} className="text-primary-foreground mr-2" />
                <Text className="text-primary-foreground font-bold">Copy Caption & Share</Text>
              </>
            )}
          </Button>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}
