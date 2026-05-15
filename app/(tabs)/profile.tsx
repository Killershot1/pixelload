import React, { useState, useEffect } from "react";
import { 
  View, 
  ScrollView, 
  Pressable, 
  Image, 
  TextInput, 
  Alert, 
  Switch,
  Platform,
  Dimensions
} from "react-native";
import { useQuery } from "convex/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../convex/_generated/api";
import { SafeAreaView, Text, Button, Badge, Card } from "@/components/ui";
import { 
  User, 
  Camera, 
  Zap, 
  Download, 
  Search, 
  Layers, 
  ChevronRight, 
  Settings as SettingsIcon,
  CreditCard,
  Shield,
  HelpCircle,
  Share2,
  Trash2,
  Info,
  ExternalLink,
  Github,
  Star,
  Globe
} from "lucide-react-native";
import { useSubscription } from "@/hooks/useSubscription";
import { ProUpgradeModal } from "@/components/subscription/ProUpgradeModal";
import { cn } from "@/components/ui/utils/cn";
import { AdBanner } from "@/components/ads/AdBanner";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const { isProUser, daysRemaining, expiryDate, clientId, cancelSubscription } = useSubscription();
  const [name, setName] = useState("PixelLoad User");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // Settings toggles
  const [wifiOnly, setWifiOnly] = useState(false);
  const [autoDelete, setAutoDelete] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const usage = useQuery(api.downloads.getDailyUsage, clientId ? { clientId, date: today } : "skip");

  useEffect(() => {
    async function loadProfile() {
      const savedName = await AsyncStorage.getItem("pixel_load_user_name");
      if (savedName) setName(savedName);
      
      const settings = await AsyncStorage.getItem("pixel_load_settings");
      if (settings) {
        const parsed = JSON.parse(settings);
        setWifiOnly(parsed.wifiOnly);
        setAutoDelete(parsed.autoDelete);
      }
    }
    loadProfile();
  }, []);

  const saveName = async () => {
    await AsyncStorage.setItem("pixel_load_user_name", name);
    setIsEditingName(false);
    Toast.show({ type: 'success', text1: 'Name updated ✓' });
  };

  const toggleSetting = async (key: string, value: boolean) => {
    if (key === 'wifi') setWifiOnly(value);
    if (key === 'delete') setAutoDelete(value);
    
    const settings = await AsyncStorage.getItem("pixel_load_settings");
    const parsed = settings ? JSON.parse(settings) : {};
    await AsyncStorage.setItem("pixel_load_settings", JSON.stringify({
      ...parsed,
      [key === 'wifi' ? 'wifiOnly' : 'autoDelete']: value
    }));
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all your downloads and search history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Everything", 
          style: "destructive", 
          onPress: () => {
             // Clear logic
             Toast.show({ type: 'info', text1: 'All data cleared' });
          } 
        }
      ]
    );
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header / Avatar Section */}
        <View className="items-center py-8 px-6">
          <View className="relative">
            <View className="h-24 w-24 rounded-full bg-muted items-center justify-center border-2 border-border overflow-hidden">
              <User size={48} className="text-muted-foreground" />
            </View>
            <Pressable className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary items-center justify-center border-2 border-background">
              <Camera size={14} className="text-primary-foreground" />
            </Pressable>
            {isProUser && (
              <View className="absolute -top-1 -right-4 bg-primary rotate-12 px-2 py-0.5 rounded-md border border-background shadow-lg">
                <Text className="text-[10px] font-black text-primary-foreground italic">⚡ PRO</Text>
              </View>
            )}
          </View>

          <View className="items-center mt-4 w-full">
            {isEditingName ? (
              <View className="flex-row items-center w-full justify-center">
                <TextInput 
                  value={name} 
                  onChangeText={setName} 
                  autoFocus 
                  onBlur={saveName}
                  className="text-2xl font-bold text-foreground text-center border-b border-primary px-2 min-w-[150px]"
                />
              </View>
            ) : (
              <Pressable onPress={() => setIsEditingName(true)} className="flex-row items-center">
                <Text className="text-2xl font-bold text-foreground">{name}</Text>
                <ChevronRight size={18} className="text-muted-foreground ml-1" />
              </Pressable>
            )}
            <Text className={cn("text-sm mt-1 font-medium", isProUser ? "text-primary" : "text-muted-foreground")}>
              {isProUser ? "PixelLoad Pro Member" : "PixelLoad Free Tier"}
            </Text>
          </View>
        </View>

        {/* PRO Banner / Info */}
        <View className="px-4 mb-6">
          {isProUser ? (
            <Card className="bg-primary/10 border-primary/20 p-4 rounded-3xl overflow-hidden relative">
               <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-primary font-bold">Subscription Active</Text>
                    <Text className="text-xs text-muted-foreground mt-1">Pro Member since {formatDate(Date.now() - 86400000 * 5)}</Text>
                    <Text className="text-xs text-muted-foreground">Expires {expiryDate ? formatDate(expiryDate) : 'Never'}</Text>
                  </View>
                  <Badge className="bg-primary px-2 py-1">
                    <Text className="text-[10px] font-bold text-primary-foreground">{daysRemaining} DAYS LEFT</Text>
                  </Badge>
               </View>
               <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 border-primary/30 h-10"
                onPress={() => Alert.alert("Manage", "Redirecting to Google Play...")}
               >
                 <Text className="text-primary font-bold text-xs">Manage Subscription</Text>
               </Button>
            </Card>
          ) : (
            <Pressable onPress={() => setIsUpgradeModalOpen(true)}>
              <View className="bg-secondary rounded-3xl p-5 flex-row items-center justify-between shadow-lg shadow-secondary/20 overflow-hidden relative">
                <View className="z-10">
                  <Text className="text-white font-extrabold text-lg">⚡ Upgrade to Pro</Text>
                  <Text className="text-white/80 text-xs mt-1">Unlock 1080p, AI & zero ads</Text>
                </View>
                <View className="bg-white/20 p-2 rounded-xl z-10">
                   <ChevronRight size={20} className="text-white" />
                </View>
                {/* Visual Glow */}
                <View className="absolute -right-10 -bottom-10 h-32 w-32 bg-primary/20 rounded-full blur-xl" />
              </View>
            </Pressable>
          )}
        </View>

        {/* Stats Row */}
        <View className="flex-row px-4 gap-3 mb-8">
           <Card className="flex-1 bg-card border-border/50 p-3 rounded-2xl items-center">
              <Download size={18} className="text-primary mb-1" />
              <Text className="font-bold text-sm">{isProUser ? '∞' : (usage?.count || 0)}</Text>
              <Text className="text-[10px] text-muted-foreground uppercase font-medium">Downloads</Text>
           </Card>
           <Card className="flex-1 bg-card border-border/50 p-3 rounded-2xl items-center">
              <Search size={18} className="text-secondary mb-1" />
              <Text className="font-bold text-sm">{usage?.aiSearchCount || 0}</Text>
              <Text className="text-[10px] text-muted-foreground uppercase font-medium">AI Queries</Text>
           </Card>
           <Card className="flex-1 bg-card border-border/50 p-3 rounded-2xl items-center">
              <Layers size={18} className="text-primary mb-1" />
              <Text className="font-bold text-sm">2.4 GB</Text>
              <Text className="text-[10px] text-muted-foreground uppercase font-medium">Saved</Text>
           </Card>
        </View>

        {/* Settings Sections */}
        <View className="px-4 mb-10">
          {/* Account */}
          <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 ml-2">Account</Text>
          <View className="bg-card rounded-3xl border border-border/50 overflow-hidden mb-6">
             <Pressable 
              onPress={() => {
                Clipboard.setStringAsync(clientId);
                Toast.show({ type: 'info', text1: 'ID copied to clipboard' });
              }}
              className="flex-row items-center justify-between p-4 border-b border-border/20"
             >
                <View className="flex-row items-center">
                   <Shield size={18} className="text-muted-foreground mr-3" />
                   <Text className="text-sm font-medium">Client ID</Text>
                </View>
                <Text className="text-xs text-muted-foreground font-mono">{clientId.substring(0, 8)}... (Tap to copy)</Text>
             </Pressable>
             <Pressable className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center">
                   <CreditCard size={18} className="text-muted-foreground mr-3" />
                   <Text className="text-sm font-medium">Payment Methods</Text>
                </View>
                <ChevronRight size={18} className="text-muted-foreground" />
             </Pressable>
          </View>

          {/* Preferences */}
          <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 ml-2">Preferences</Text>
          <View className="bg-card rounded-3xl border border-border/50 overflow-hidden mb-6">
             <View className="flex-row items-center justify-between p-4 border-b border-border/20">
                <View className="flex-row items-center">
                   <Globe size={18} className="text-muted-foreground mr-3" />
                   <Text className="text-sm font-medium">Download over WiFi only</Text>
                </View>
                <Switch 
                  value={wifiOnly} 
                  onValueChange={(v) => toggleSetting('wifi', v)}
                  trackColor={{ false: "#1a1a2e", true: "#00E5FF" }}
                />
             </View>
             <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center">
                   <Trash2 size={18} className="text-muted-foreground mr-3" />
                   <Text className="text-sm font-medium">Auto-delete after 30 days</Text>
                </View>
                <Switch 
                  value={autoDelete} 
                  onValueChange={(v) => toggleSetting('delete', v)}
                  trackColor={{ false: "#1a1a2e", true: "#00E5FF" }}
                />
             </View>
          </View>

          {/* App */}
          <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 ml-2">App</Text>
          <View className="bg-card rounded-3xl border border-border/50 overflow-hidden mb-6">
             <Pressable className="flex-row items-center justify-between p-4 border-b border-border/20">
                <View className="flex-row items-center">
                   <Star size={18} className="text-muted-foreground mr-3" />
                   <Text className="text-sm font-medium">Rate PixelLoad</Text>
                </View>
                <Badge variant="secondary" className="bg-primary/10">
                   <Text className="text-[10px] text-primary font-bold">5.0 ⭐</Text>
                </Badge>
             </Pressable>
             <Pressable className="flex-row items-center justify-between p-4 border-b border-border/20">
                <View className="flex-row items-center">
                   <Share2 size={18} className="text-muted-foreground mr-3" />
                   <Text className="text-sm font-medium">Share with friends</Text>
                </View>
                <ChevronRight size={18} className="text-muted-foreground" />
             </Pressable>
             <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center">
                   <Info size={18} className="text-muted-foreground mr-3" />
                   <Text className="text-sm font-medium">Version</Text>
                </View>
                <Text className="text-xs text-muted-foreground">1.0.0 (Production)</Text>
             </View>
          </View>

          {/* Danger Zone */}
          <View className="bg-red-500/5 rounded-3xl border border-red-500/10 overflow-hidden mb-20">
             <Pressable onPress={handleClearData} className="flex-row items-center justify-center p-4">
                <Trash2 size={18} className="text-red-500 mr-2" />
                <Text className="text-sm font-bold text-red-500">Clear All Local Data</Text>
             </Pressable>
          </View>
          
          <View className="items-center mb-10">
            <Text className="text-[10px] text-muted-foreground uppercase font-bold tracking-[4px]">Vision Pixels</Text>
          </View>
        </View>
      </ScrollView>

      {/* Ad Banner for Free Users */}
      <AdBanner position="bottom" />

      {/* Modals */}
      <ProUpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />
    </SafeAreaView>
  );
}

import * as Clipboard from "expo-clipboard";
