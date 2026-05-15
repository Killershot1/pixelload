import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as InAppPurchases from "expo-in-app-purchases";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import Toast from "react-native-toast-message";

import { logger } from "@/lib/logger";

interface UseSubscriptionReturn {
  isProUser: boolean;
  isLoading: boolean;
  daysRemaining: number | null;
  expiryDate: number | null;
  purchasePro: (plan: 'monthly' | 'yearly') => Promise<void>;
  restorePurchases: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  isPurchasing: boolean;
  purchaseError: string | null;
  clientId: string;
}

const SubscriptionContext = createContext<UseSubscriptionReturn | undefined>(undefined);

const PRO_PRODUCT_MONTHLY = "pixelload_pro_monthly";
const PRO_PRODUCT_YEARLY = "pixelload_pro_yearly";

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientId, setClientId] = useState<string>("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // 1. Initialize Client ID
  useEffect(() => {
    async function initClientId() {
      let id = await AsyncStorage.getItem("pixel_load_client_id");
      if (!id) {
        id = Crypto.randomUUID();
        await AsyncStorage.setItem("pixel_load_client_id", id);
      }
      setClientId(id);
    }
    initClientId();
  }, []);

  // 2. Fetch Subscription Status from Convex
  const subStatus = useQuery(api.subscriptions.getSubscriptionStatus, clientId ? { clientId } : "skip");
  const updateSubMutation = useMutation(api.subscriptions.createOrUpdateSubscription);
  const cancelSubMutation = useMutation(api.subscriptions.cancelSubscription);

  // 3. Purchase Logic
  const purchasePro = useCallback(async (plan: 'monthly' | 'yearly') => {
    if (Platform.OS === 'web') {
      // Simulation for web/demo
      setIsPurchasing(true);
      setTimeout(async () => {
        const expiryDate = Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000;
        await updateSubMutation({
          clientId,
          plan: 'pro',
          productId: plan === 'monthly' ? PRO_PRODUCT_MONTHLY : PRO_PRODUCT_YEARLY,
          expiryDate,
          purchaseToken: "mock_token_" + Date.now(),
        });
        setIsPurchasing(false);
        Toast.show({ type: 'success', text1: 'Welcome to Pro! ⚡' });
      }, 2000);
      return;
    }

    try {
      setIsPurchasing(true);
      setPurchaseError(null);

      await InAppPurchases.connectAsync();

      // Listen for purchase updates
      InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          for (const purchase of results!) {
            if (!purchase.acknowledged) {
              // Valid purchase
              const expiryDate = Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000;
              await updateSubMutation({
                clientId,
                plan: 'pro',
                productId: purchase.productId,
                expiryDate,
                purchaseToken: purchase.purchaseToken,
              });
              await InAppPurchases.finishTransactionAsync(purchase, true);
            }
          }
          setIsPurchasing(false);
        } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
          setIsPurchasing(false);
        } else {
          setPurchaseError(`Purchase failed with error code: ${errorCode}`);
          setIsPurchasing(false);
        }
      });

      const productId = plan === 'monthly' ? PRO_PRODUCT_MONTHLY : PRO_PRODUCT_YEARLY;
      await InAppPurchases.getProductsAsync([PRO_PRODUCT_MONTHLY, PRO_PRODUCT_YEARLY]);
      await InAppPurchases.purchaseItemAsync(productId);

    } catch (e: any) {
      logger.error("IAP Error:", e);
      setPurchaseError(e.message || "An unknown error occurred during purchase.");
      setIsPurchasing(false);
    }
  }, [clientId, updateSubMutation]);

  const restorePurchases = useCallback(async () => {
    if (Platform.OS === 'web') {
      Toast.show({ type: 'info', text1: 'Restore not supported on web' });
      return;
    }

    try {
      await InAppPurchases.connectAsync();
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();

      if (responseCode === InAppPurchases.IAPResponseCode.OK && results && results.length > 0) {
        // Find latest valid pro purchase
        const latest = results[0]; 
        await updateSubMutation({
          clientId,
          plan: 'pro',
          productId: latest.productId,
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // Placeholder
          purchaseToken: latest.purchaseToken,
        });
        Toast.show({ type: 'success', text1: 'Purchases restored ✓' });
      } else {
        Toast.show({ type: 'info', text1: 'No purchases found' });
      }
    } catch (e) {
      logger.error("Restore Error:", e);
      Toast.show({ type: 'error', text1: 'Failed to restore purchases' });
    } finally {
      await InAppPurchases.disconnectAsync();
    }
  }, [clientId, updateSubMutation]);

  const cancelSubscription = useCallback(async () => {
    try {
      await cancelSubMutation({ clientId });
      Toast.show({ type: 'success', text1: 'Subscription cancelled' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to cancel subscription' });
    }
  }, [clientId, cancelSubMutation]);

  const value = {
    isProUser: subStatus?.isProUser ?? false,
    isLoading: subStatus === undefined,
    daysRemaining: subStatus?.daysRemaining ?? null,
    expiryDate: subStatus?.expiryDate ?? null,
    purchasePro,
    restorePurchases,
    cancelSubscription,
    isPurchasing,
    purchaseError,
    clientId,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
