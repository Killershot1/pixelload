import React, { useState, useMemo, useCallback } from "react";
import { 
  View, 
  Image, 
  Pressable, 
  Dimensions, 
  Modal, 
  Alert,
  ScrollView,
  Share
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Video, ResizeMode } from "expo-av";
import { 
  GestureDetector, 
  Gesture, 
  GestureHandlerRootView 
} from "react-native-gesture-handler";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from "react-native-reanimated";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Text, Badge, Button, Card, SafeAreaView } from "../ui";
import { 
  Image as ImageIcon, 
  Play, 
  Share2, 
  Trash2, 
  ExternalLink, 
  Layers, 
  Filter,
  Check,
  X,
  Smartphone,
  MessageCircle,
  Download,
  MoreVertical
} from "lucide-react-native";
import { cn } from "../ui/utils/cn";

const { width, height } = Dimensions.get("window");

interface SavedContentItem {
  _id: Id<"savedContent">;
  platform: string;
  contentType: string;
  fileSizeBytes: number;
  localFilePath: string;
  thumbnail?: string;
  savedAt: number;
}

interface ContentOrganizerProps {
  clientId: string;
  onOpenRepost: (item: SavedContentItem) => void;
}

const AnyFlashList = FlashList as any;

export function ContentOrganizer({ clientId, onOpenRepost }: ContentOrganizerProps) {
  const [platformFilter, setPlatformFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState<SavedContentItem | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const content = useQuery(api.social.getSavedContent, { clientId });
  const deleteMutation = useMutation(api.social.deleteSavedContent);

  const filteredContent = useMemo(() => {
    if (!content) return [];
    return content.filter(item => {
      const matchPlatform = platformFilter === "All" || item.platform.toLowerCase() === platformFilter.toLowerCase();
      const matchType = typeFilter === "All" || 
                        (typeFilter === "Images" && item.contentType === "image") || 
                        (typeFilter === "Videos" && item.contentType === "video");
      return matchPlatform && matchType;
    });
  }, [content, platformFilter, typeFilter]);

  const { totalCount, totalSizeMB } = useMemo(() => {
    if (!content) return { totalCount: 0, totalSizeMB: 0 };
    const size = content.reduce((acc, curr) => acc + curr.fileSizeBytes, 0);
    return {
      totalCount: content.length,
      totalSizeMB: (size / (1024 * 1024)).toFixed(1)
    };
  }, [content]);

  const handleDelete = async (id: Id<"savedContent">) => {
    Alert.alert(
      "Delete Content",
      "Are you sure you want to delete this from your library?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteMutation({ savedContentId: id, clientId });
              setIsPreviewVisible(false);
              setSelectedItem(null);
            } catch (e) {
              Alert.alert("Error", "Could not delete content.");
            }
          }
        }
      ]
    );
  };

  const handleShare = async (item: SavedContentItem) => {
    try {
      await Share.share({
        url: item.localFilePath,
        message: `Check out this content I saved with PixelLoad! ⚡`
      });
    } catch (e) {
      console.error("Share error:", e);
    }
  };

  const renderItem = ({ item }: { item: SavedContentItem }) => {
    const isWA = item.platform === "whatsapp";
    
    return (
      <Pressable 
        onPress={() => {
          setSelectedItem(item);
          setIsPreviewVisible(true);
        }}
        className="flex-1 m-1 aspect-square rounded-xl overflow-hidden bg-card border border-border/50 relative"
      >
        <Image source={{ uri: item.thumbnail || item.localFilePath }} className="w-full h-full" />
        
        {/* Platform Badge */}
        <View className="absolute top-2 left-2">
          {isWA ? (
            <View className="bg-green-500 p-1 rounded-md">
              <MessageCircle size={10} className="text-white" />
            </View>
          ) : (
            <View className="bg-primary p-1 rounded-md">
              <Download size={10} className="text-primary-foreground" />
            </View>
          )}
        </View>

        {/* Type Icon Overlay */}
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          {item.contentType === "video" && (
            <View className="bg-black/40 p-3 rounded-full">
              <Play size={20} fill="white" className="text-white" />
            </View>
          )}
        </View>

        {/* Size Badge */}
        <View className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded">
          <Text className="text-white text-[9px] font-bold">
            {(item.fileSizeBytes / (1024 * 1024)).toFixed(1)}MB
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1">
      {/* Stats Summary */}
      <View className="px-4 py-3 bg-background border-b border-border/50 flex-row justify-between items-center">
        <View>
          <Text className="text-sm font-bold text-foreground">Content Organizer</Text>
          <Text className="text-[11px] text-muted-foreground">
            {totalCount} items · {totalSizeMB} MB saved
          </Text>
        </View>
        <Layers size={18} className="text-primary opacity-50" />
      </View>

      {/* Filter Tabs */}
      <View className="px-4 pt-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-4">
          {["All", "WhatsApp", "Downloads", "Reposts"].map(p => (
            <Pressable 
              key={p} 
              onPress={() => setPlatformFilter(p)}
              className={cn(
                "px-4 py-2 rounded-full border",
                platformFilter === p ? "bg-primary border-primary" : "bg-card border-border"
              )}
            >
              <Text className={cn(
                "text-xs font-bold",
                platformFilter === p ? "text-primary-foreground" : "text-muted-foreground"
              )}>
                {p}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="flex-row items-center gap-2 mb-4">
          {["All", "Images", "Videos"].map(t => (
            <Pressable 
              key={t} 
              onPress={() => setTypeFilter(t)}
              className={cn(
                "flex-1 py-1.5 rounded-lg items-center border",
                typeFilter === t ? "bg-secondary/10 border-secondary/30" : "bg-card border-border"
              )}
            >
              <Text className={cn(
                "text-[11px] font-medium",
                typeFilter === t ? "text-secondary" : "text-muted-foreground"
              )}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Grid */}
      <View className="flex-1 px-2">
        {filteredContent.length === 0 ? (
          <View className="flex-1 items-center justify-center p-10 opacity-30">
            <Filter size={48} className="text-muted-foreground mb-4" />
            <Text className="text-center">No matching content found</Text>
          </View>
        ) : (
          <AnyFlashList
            data={filteredContent}
            renderItem={renderItem}
            numColumns={2}
            keyExtractor={(item: SavedContentItem) => item._id}
            estimatedItemSize={width / 2}
          />
        )}
      </View>

      {/* Preview Modal */}
      <Modal
        visible={isPreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPreviewVisible(false)}
      >
        <GestureHandlerRootView className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            {/* Top Bar */}
            <View className="flex-row items-center justify-between px-4 py-2 z-50">
              <Pressable 
                onPress={() => setIsPreviewVisible(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
              >
                <X size={24} className="text-white" />
              </Pressable>
              
              <View className="flex-row gap-2">
                <Pressable 
                  onPress={() => selectedItem && handleShare(selectedItem)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
                >
                  <Share2 size={20} className="text-white" />
                </Pressable>
                <Pressable 
                  onPress={() => selectedItem && handleDelete(selectedItem._id)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-red-500/20"
                >
                  <Trash2 size={20} className="text-red-500" />
                </Pressable>
              </View>
            </View>

            {/* Content Area */}
            <View className="flex-1 items-center justify-center">
              {selectedItem?.contentType === "video" ? (
                <Video
                  source={{ uri: selectedItem.localFilePath }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  isLooping
                  useNativeControls
                  className="w-full h-full"
                />
              ) : (
                <ZoomableImage uri={selectedItem?.localFilePath || ""} />
              )}
            </View>

            {/* Bottom Bar */}
            <View className="p-4 bg-black/60 pb-10">
               <View className="flex-row gap-3">
                  <Button 
                    onPress={() => {
                      if (selectedItem) {
                        setIsPreviewVisible(false);
                        onOpenRepost(selectedItem);
                      }
                    }}
                    className="flex-1 bg-primary h-12 rounded-xl flex-row items-center justify-center"
                  >
                    <ExternalLink size={18} className="text-primary-foreground mr-2" />
                    <Text className="text-primary-foreground font-bold">Repost Content</Text>
                  </Button>
               </View>
            </View>
          </SafeAreaView>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

function ZoomableImage({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        savedScale.value = scale.value;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.Image 
        source={{ uri }} 
        className="w-full h-full" 
        resizeMode="contain" 
        style={animatedStyle}
      />
    </GestureDetector>
  );
}
