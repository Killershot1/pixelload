import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Image, 
  Pressable, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Platform 
} from "react-native";
import * as FileSystem from "expo-file-system";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Text, Button, Badge, Card } from "../ui";
import { 
  RefreshCcw, 
  Download, 
  CheckCircle2, 
  Play, 
  Image as ImageIcon, 
  AlertTriangle,
  Info
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { cn } from "../ui/utils/cn";

// WhatsApp status path on Android
const WHATSAPP_STATUS_PATH = "/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/.Statuses/";
// Fallback for older WhatsApp versions
const WHATSAPP_STATUS_PATH_LEGACY = "/storage/emulated/0/WhatsApp/Media/.Statuses/";

interface StatusMedia {
  uri: string;
  name: string;
  type: 'image' | 'video';
  isSaved: boolean;
}

interface StatusSaverProps {
  clientId: string;
}

export function StatusSaver({ clientId }: StatusSaverProps) {
  const [statuses, setStatuses] = useState<StatusMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionDenied] = useState(false); // Simplified for now
  
  const logSavedContent = useMutation(api.social.logSavedContent);
  const alreadySaved = useQuery(api.social.getSavedContent, { clientId, platform: "whatsapp" });

  const fetchStatuses = useCallback(async () => {
    if (Platform.OS !== 'android') {
      // Feature only available on Android
      return;
    }

    setLoading(true);
    try {
      // In a real app, we would request permissions here
      // For this environment, we'll try to read the directory
      // Note: On Android 11+, MANAGE_EXTERNAL_STORAGE might be required for this specific path
      
      let path = WHATSAPP_STATUS_PATH;
      let dirInfo = await FileSystem.getInfoAsync(path);
      
      if (!dirInfo.exists) {
        path = WHATSAPP_STATUS_PATH_LEGACY;
        dirInfo = await FileSystem.getInfoAsync(path);
      }

      if (dirInfo.exists && dirInfo.isDirectory) {
        const files = await FileSystem.readDirectoryAsync(path);
        const mediaFiles: StatusMedia[] = files
          .filter(f => f.endsWith('.jpg') || f.endsWith('.mp4') || f.endsWith('.png'))
          .map(f => ({
            uri: path + f,
            name: f,
            type: f.endsWith('.mp4') ? 'video' : 'image',
            isSaved: alreadySaved?.some(s => s.localFilePath.includes(f)) ?? false
          }));
        
        setStatuses(mediaFiles);
      } else {
        setStatuses([]);
      }
    } catch (e) {
      console.error("Error reading WhatsApp statuses:", e);
      // If we hit a permission error, we'd update permissionGranted state
    } finally {
      setLoading(false);
    }
  }, [alreadySaved]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const handleSave = async (status: StatusMedia) => {
    try {
      const destination = `${(FileSystem as any).documentDirectory}${status.name}`;
      await FileSystem.copyAsync({
        from: status.uri,
        to: destination
      });

      const info = await FileSystem.getInfoAsync(destination);
      const size = (info as any).size || 0;

      await logSavedContent({
        clientId,
        platform: "whatsapp",
        contentType: status.type,
        fileSizeBytes: size,
        localFilePath: destination,
        savedAt: Date.now(),
      });

      Toast.show({
        type: 'success',
        text1: 'Saved! ✓',
        position: 'bottom'
      });
      
      fetchStatuses();
    } catch (e) {
      console.error("Save failed:", e);
      Alert.alert("Save Failed", "Could not save status. Make sure PixelLoad has storage permissions.");
    }
  };

  if (Platform.OS !== 'android') {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Info size={48} className="text-muted-foreground mb-4" />
        <Text className="text-center text-muted-foreground">
          WhatsApp Status Saver is currently only available on Android devices.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-4 py-3 bg-card border-b border-border/50">
        <Text className="font-bold text-lg">WhatsApp Statuses</Text>
        <Pressable onPress={fetchStatuses} className="p-2">
          <RefreshCcw size={20} className={cn("text-primary", loading && "animate-spin")} />
        </Pressable>
      </View>

      <View className="bg-primary/5 px-4 py-2 flex-row items-center">
        <Info size={14} className="text-primary mr-2" />
        <Text className="text-[11px] text-primary flex-1">
          Make sure you've opened WhatsApp and viewed the statuses you want to save.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color="#00E5FF" />
          <Text className="text-muted-foreground mt-4 text-xs">Finding statuses...</Text>
        </View>
      ) : statuses.length === 0 ? (
        <View className="flex-1 items-center justify-center p-10 mt-10">
          <View className="h-20 w-20 bg-muted rounded-full items-center justify-center mb-6">
            <ImageIcon size={32} className="text-muted-foreground opacity-30" />
          </View>
          <Text className="text-center font-bold mb-2">No statuses found</Text>
          <Text className="text-center text-muted-foreground text-sm leading-5">
            Open WhatsApp and view some statuses first, then come back here.
          </Text>
          <Button onPress={fetchStatuses} variant="outline" className="mt-8 border-primary">
            <Text className="text-primary">Refresh Now</Text>
          </Button>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 8 }}>
          <View className="flex-row flex-wrap">
            {statuses.map((status) => (
              <Pressable 
                key={status.uri}
                onLongPress={() => !status.isSaved && handleSave(status)}
                className="w-[50%] p-1"
              >
                <View className="aspect-square bg-muted rounded-xl overflow-hidden relative">
                  <Image source={{ uri: status.uri }} className="w-full h-full" />
                  
                  {/* Type Badge */}
                  <View className="absolute top-2 right-2">
                    {status.type === 'video' ? (
                      <View className="bg-black/60 p-1.5 rounded-full">
                        <Play size={10} fill="white" className="text-white" />
                      </View>
                    ) : (
                      <View className="bg-black/60 p-1.5 rounded-md">
                        <ImageIcon size={10} className="text-white" />
                      </View>
                    )}
                  </View>

                  {/* Saved Checkmark */}
                  {status.isSaved && (
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                      <View className="bg-green-500 rounded-full p-2">
                        <CheckCircle2 size={24} className="text-white" />
                      </View>
                      <Text className="text-white text-[10px] font-bold mt-1">SAVED</Text>
                    </View>
                  )}

                  {/* Save Button (appears on long press or simplified UI) */}
                  {!status.isSaved && (
                    <Pressable 
                      onPress={() => handleSave(status)}
                      className="absolute bottom-2 right-2 bg-primary h-8 w-8 rounded-full items-center justify-center shadow-lg"
                    >
                      <Download size={16} className="text-primary-foreground" />
                    </Pressable>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
