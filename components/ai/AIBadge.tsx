import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui";
import { Sparkles } from "lucide-react-native";
import { cn } from "@/components/ui/utils/cn";

interface AIBadgeProps {
  variant?: 'cyan' | 'purple' | 'dark' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export function AIBadge({ 
  variant = 'default', 
  size = 'md', 
  className,
  showText = true 
}: AIBadgeProps) {
  const variantStyles = {
    cyan: "bg-primary/20 border-primary/30 text-primary",
    purple: "bg-secondary/20 border-secondary/30 text-secondary",
    dark: "bg-black/40 border-white/10 text-white",
    default: "bg-secondary/20 border-secondary/30 text-secondary",
  };

  const textStyles = {
    cyan: "text-primary",
    purple: "text-secondary",
    dark: "text-white",
    default: "text-secondary",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5",
    md: "px-3 py-1",
    lg: "px-4 py-2",
  };

  const iconSize = size === 'sm' ? 10 : size === 'md' ? 14 : 18;

  return (
    <View className={cn(
      "flex-row items-center rounded-full border",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      <Sparkles size={iconSize} className={cn(textStyles[variant], showText ? "mr-1.5" : "")} />
      {showText && (
        <Text className={cn(
          "font-bold uppercase tracking-tighter",
          size === 'sm' ? "text-[8px]" : size === 'md' ? "text-[10px]" : "text-xs",
          textStyles[variant]
        )}>
          Visionco AI
        </Text>
      )}
    </View>
  );
}
