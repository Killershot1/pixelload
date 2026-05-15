import React, { useMemo } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { Text, Button, Badge } from "@/components/ui";
import { Check, ShieldCheck, Zap, Download } from "lucide-react-native";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/components/ui/utils/cn";

export interface MediaQuality {
  id: string;
  label: string;
  res: string;
  fileSizeLabel: string;
  isPro?: boolean;
}

interface QualitySheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  qualities: MediaQuality[];
  selectedQualityId: string;
  onSelect: (quality: MediaQuality) => void;
  isProUser: boolean;
  onUpgrade: () => void;
}

export function QualitySheet({
  isOpen,
  onClose,
  title,
  qualities,
  selectedQualityId,
  onSelect,
  isProUser,
  onUpgrade
}: QualitySheetProps) {
  
  const handleSelect = (quality: MediaQuality) => {
    if (quality.isPro && !isProUser) {
      onUpgrade();
      return;
    }
    onSelect(quality);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent snapPoints={["50%", "70%"]}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        
        <View className="p-4 flex-1">
          <Text className="text-sm text-muted-foreground mb-4">Select your preferred download quality</Text>
          
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {qualities.map((q) => {
              const isSelected = selectedQualityId === q.id;
              const isLocked = q.isPro && !isProUser;
              
              return (
                <Pressable
                  key={q.id}
                  onPress={() => handleSelect(q)}
                  className={cn(
                    "flex-row items-center justify-between p-4 mb-3 rounded-2xl border",
                    isSelected ? "bg-primary/10 border-primary" : "bg-card border-border/50",
                    isLocked ? "opacity-70" : ""
                  )}
                >
                  <View className="flex-row items-center">
                    <View className={cn(
                      "h-10 w-10 rounded-xl items-center justify-center mr-4",
                      isSelected ? "bg-primary" : "bg-muted"
                    )}>
                      <Text className={cn("font-bold", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
                        {q.res}
                      </Text>
                    </View>
                    <View>
                      <View className="flex-row items-center">
                        <Text className="font-bold text-foreground">{q.label}</Text>
                        {q.isPro && (
                          <Badge className="ml-2 bg-primary/20 border-primary/30 h-5 px-1.5">
                            <Zap size={8} className="text-primary fill-primary mr-1" />
                            <Text className="text-[8px] font-black text-primary italic">PRO</Text>
                          </Badge>
                        )}
                      </View>
                      <Text className="text-xs text-muted-foreground mt-0.5">{q.fileSizeLabel}</Text>
                    </View>
                  </View>
                  
                  {isSelected ? (
                    <View className="bg-primary h-6 w-6 rounded-full items-center justify-center">
                      <Check size={14} className="text-primary-foreground" />
                    </View>
                  ) : isLocked ? (
                    <ShieldCheck size={18} className="text-muted-foreground" />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="mt-4 pb-6">
            <Button 
              onPress={onClose}
              className="bg-primary h-14 rounded-2xl shadow-lg"
            >
              <Text className="text-primary-foreground font-bold">Cancel</Text>
            </Button>
          </View>
        </View>
      </SheetContent>
    </Sheet>
  );
}
