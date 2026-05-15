import { View } from "react-native";
import { Text, SafeAreaView } from "@/components/ui";

export default function DownloadsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="h2" className="text-primary font-bold">Downloads</Text>
        <Text className="text-muted-foreground text-center mt-2">
          Your downloaded videos and audio will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
