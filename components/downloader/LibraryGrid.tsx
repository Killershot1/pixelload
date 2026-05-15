import React, { useState, useMemo, useCallback } from "react";
import { View, Image, Pressable, Alert, Dimensions, Modal } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text, Badge, Button, Card } from "@/components/ui";
import { 
  Download, 
  Film, 
  Music, 
  Clock, 
  MoreVertical, 
  Check, 
  Trash2, 
  Play, 
  Share2, 
  ChevronDown,
  Filter,
  CheckSquare,
  Square
} from "lucide-react-native";
import { cn } from "@/components/ui/utils/cn";

export interface CompletedDownload {
  downloadId: string;
  title: string;
  thumbnail: string;
  quality: string;
  channel: string;
  fileSizeBytes: number;
  downloadedAt: number;
  localFilePath: string;
  duration?: string;
}

interface LibraryGridProps {
  downloads: CompletedDownload[];
  isProUser: boolean;
  onPlay: (downloadId: string) => void;
  onDelete: (downloadId: string) => void;
  onDeleteMultiple: (downloadIds: string[]) => void;
  onStartNewDownload: () => void;
}

type FilterType = "All" | "Video" | "Audio";
type SortType = "Date ↓" | "Date ↑" | "Name A-Z" | "Size ↓";

const STORAGE_LIMIT_FREE = 5 * 1024 * 1024 * 1024; // 5GB

const GridItem = React.memo(({ 
  item, 
  isSelected, 
  isMultiSelectMode, 
  onPress, 
  onLongPress 
}: { 
  item: CompletedDownload; 
  isSelected: boolean; 
  isMultiSelectMode: boolean; 
  onPress: () => void;
  onLongPress: () => void;
}) => {
  const isAudio = item.quality.toLowerCase().includes("audio");
  const isMissing = !item.localFilePath;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className={cn(
        "flex-1 m-1 rounded-xl overflow-hidden bg-[#1a1a2e] border-2",
        isSelected ? "border-primary opacity-85" : "border-transparent"
      )}
      style={{ aspectRatio: 1 / 1.3 }}
    >
      {/* Thumbnail (70%) */}
      <View className="flex-[7] relative bg-muted">
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full items-center justify-center">
            {isAudio ? <Music size={32} className="text-muted-foreground" /> : <Film size={32} className="text-muted-foreground" />}
          </View>
        )}
        
        {/* Duration Badge */}
        {item.duration && (
          <View className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded">
            <Text className="text-white text-[10px] font-bold">{item.duration}</Text>
          </View>
        )}

        {/* Multi-select Checkbox */}
        {isMultiSelectMode && (
          <View className="absolute top-2 left-2">
            {isSelected ? (
              <View className="bg-primary rounded-md p-0.5">
                <Check size={12} className="text-primary-foreground" />
              </View>
            ) : (
              <View className="bg-black/40 border border-white/20 rounded-md p-2" />
            )}
          </View>
        )}

        {/* File Missing Badge */}
        {isMissing && (
          <View className="absolute inset-0 bg-black/40 items-center justify-center">
            <Badge variant="destructive" className="px-1.5 h-5">
              <Text className="text-[8px] font-bold">FILE MISSING</Text>
            </Badge>
          </View>
        )}
      </View>

      {/* Info (30%) */}
      <View className="flex-[3] p-2 justify-between">
        <Text className="text-[12px] font-bold text-foreground leading-tight" numberOfLines={1}>
          {item.title}
        </Text>
        <View className="flex-row items-center justify-between mt-1">
          <Badge className="bg-secondary/30 border-0 px-1 py-0 h-4 min-w-[30px]">
            <Text className="text-[9px] font-bold text-white uppercase">{isAudio ? "MP3" : item.quality}</Text>
          </Badge>
          <Text className="text-[10px] text-muted-foreground">
            {item.fileSizeBytes > 0 ? `${(item.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : "Size unknown"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

export function LibraryGrid({
  downloads,
  isProUser,
  onPlay,
  onDelete,
  onDeleteMultiple,
  onStartNewDownload,
}: LibraryGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [sortOrder, setSortOrder] = useState<SortType>("Date ↓");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  const isMultiSelectMode = selectedIds.size > 0;

  // Storage Stats
  const { totalSizeBytes, fileCount } = useMemo(() => {
    return downloads.reduce(
      (acc, d) => ({
        totalSizeBytes: acc.totalSizeBytes + (d.fileSizeBytes || 0),
        fileCount: acc.fileCount + 1,
      }),
      { totalSizeBytes: 0, fileCount: 0 }
    );
  }, [downloads]);

  const storageUsagePercent = isProUser ? 0 : (totalSizeBytes / STORAGE_LIMIT_FREE) * 100;
  const isStorageCritical = !isProUser && totalSizeBytes > STORAGE_LIMIT_FREE * 0.8;

  // Filter & Sort Logic
  const filteredAndSortedDownloads = useMemo(() => {
    let result = [...downloads];

    // Filter
    if (activeFilter === "Video") {
      result = result.filter((d) => !d.quality.toLowerCase().includes("audio"));
    } else if (activeFilter === "Audio") {
      result = result.filter((d) => d.quality.toLowerCase().includes("audio"));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case "Date ↓": return b.downloadedAt - a.downloadedAt;
        case "Date ↑": return a.downloadedAt - b.downloadedAt;
        case "Name A-Z": return a.title.localeCompare(b.title);
        case "Size ↓": return (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0);
        default: return 0;
      }
    });

    return result;
  }, [downloads, activeFilter, sortOrder]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleLongPress = useCallback((id: string) => {
    if (selectedIds.size === 0) {
      toggleSelection(id);
    }
  }, [selectedIds.size, toggleSelection]);

  const handlePress = useCallback((item: CompletedDownload) => {
    if (isMultiSelectMode) {
      toggleSelection(item.downloadId);
    } else {
      if (item.localFilePath) {
        onPlay(item.downloadId);
      } else {
        Alert.alert("File Missing", "The file could not be found in your local storage.");
      }
    }
  }, [isMultiSelectMode, toggleSelection, onPlay]);

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    Alert.alert(
      "Confirm Delete",
      `Delete ${count} file${count > 1 ? "s" : ""}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            onDeleteMultiple(Array.from(selectedIds));
            setSelectedIds(new Set());
          } 
        }
      ]
    );
  };

  const selectAll = () => {
    const allIds = filteredAndSortedDownloads.map(d => d.downloadId);
    setSelectedIds(new Set(allIds));
  };

  const cancelSelection = () => {
    setSelectedIds(new Set());
  };

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  if (downloads.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <View className="h-24 w-24 bg-muted rounded-full items-center justify-center mb-6">
          <Download size={48} className="text-muted-foreground opacity-50" />
        </View>
        <Text variant="h3" className="font-bold text-center mb-2">Your library is empty</Text>
        <Text className="text-muted-foreground text-center mb-8">
          Tap the + button to download your first video
        </Text>
        <Button onPress={onStartNewDownload} className="bg-primary px-8 h-12 rounded-full">
          <Text className="text-primary-foreground font-bold">Download Something</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Header / Multi-select Header */}
      <View className="px-4 py-3 bg-background border-b border-border/50">
        {isMultiSelectMode ? (
          <View className="flex-row items-center justify-between h-10">
            <View className="flex-row items-center">
              <Text className="text-primary font-bold mr-4">{selectedIds.size} selected</Text>
              <Pressable onPress={selectAll}>
                <Text className="text-muted-foreground text-sm font-medium">Select All</Text>
              </Pressable>
            </View>
            <Pressable onPress={cancelSelection}>
              <Text className="text-primary text-sm font-bold">Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <View className="flex-row justify-between items-end mb-2">
              <View>
                <Text className="text-foreground font-bold">Storage Usage</Text>
                <Text className="text-[11px] text-muted-foreground">
                  Using {formatSize(totalSizeBytes)} · {fileCount} files
                </Text>
              </View>
              {!isProUser && isStorageCritical && (
                <Text className="text-[10px] text-destructive font-bold">Nearly full · Upgrade</Text>
              )}
            </View>
            <View className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <View 
                style={{ width: `${Math.min(100, storageUsagePercent)}%` }}
                className={cn("h-full", isStorageCritical ? "bg-destructive" : "bg-primary")}
              />
            </View>
          </View>
        )}
      </View>

      {/* Filter & Sort Bar */}
      {!isMultiSelectMode && (
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row gap-2">
            {(["All", "Video", "Audio"] as FilterType[]).map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-1.5 rounded-full",
                  activeFilter === filter ? "bg-primary" : "bg-muted"
                )}
              >
                <Text className={cn(
                  "text-xs font-bold",
                  activeFilter === filter ? "text-primary-foreground" : "text-muted-foreground"
                )}>
                  {filter}
                </Text>
              </Pressable>
            ))}
          </View>
          
          <Pressable 
            onPress={() => setIsSortModalVisible(true)}
            className="flex-row items-center bg-muted px-3 py-1.5 rounded-lg"
          >
            <Text className="text-xs text-foreground mr-1 font-medium">{sortOrder}</Text>
            <ChevronDown size={14} className="text-muted-foreground" />
          </Pressable>
        </View>
      )}

      {/* Grid */}
      <View className="flex-1 px-2">
        {filteredAndSortedDownloads.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-muted-foreground">No {activeFilter === "All" ? "" : activeFilter} files found</Text>
          </View>
        ) : (
          <FlashList
            data={filteredAndSortedDownloads}
            renderItem={({ item }: { item: CompletedDownload }) => (
              <GridItem
                item={item}
                isSelected={selectedIds.has(item.downloadId)}
                isMultiSelectMode={isMultiSelectMode}
                onPress={() => handlePress(item)}
                onLongPress={() => handleLongPress(item.downloadId)}
              />
            )}
            numColumns={2}
            {...({ estimatedItemSize: 220 } as any)}
            keyExtractor={(item: any) => item.downloadId}
            extraData={selectedIds}
          />
        )}
      </View>

      {/* Floating Delete Button */}
      {isMultiSelectMode && (
        <View className="absolute bottom-6 left-4 right-4 items-center">
          <Button 
            onPress={handleBulkDelete}
            className="bg-red-500 h-14 w-full flex-row items-center justify-center rounded-2xl shadow-lg"
          >
            <Trash2 size={20} className="text-white mr-2" />
            <Text className="text-white font-bold">Delete {selectedIds.size} files</Text>
          </Button>
        </View>
      )}

      {/* Sort Modal */}
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <Pressable 
          className="flex-1 bg-black/60 items-center justify-center p-6"
          onPress={() => setIsSortModalVisible(false)}
        >
          <View className="bg-card w-full rounded-3xl overflow-hidden border border-border">
            <View className="p-4 border-b border-border">
              <Text className="font-bold text-center">Sort By</Text>
            </View>
            {(["Date ↓", "Date ↑", "Name A-Z", "Size ↓"] as SortType[]).map((order) => (
              <Pressable
                key={order}
                onPress={() => {
                  setSortOrder(order);
                  setIsSortModalVisible(false);
                }}
                className="p-4 flex-row items-center justify-between border-b border-border/50"
              >
                <Text className={cn("font-medium", sortOrder === order ? "text-primary" : "text-foreground")}>
                  {order}
                </Text>
                {sortOrder === order && <Check size={18} className="text-primary" />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
