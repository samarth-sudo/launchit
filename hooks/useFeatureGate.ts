import { useUser } from '@clerk/nextjs';
import type { SubscriptionTier } from '@/types/subscription';
import { hasFeatureAccess, TIER_PRICING } from '@/types/subscription';

export interface FeatureGateResult {
  hasAccess: boolean;
  showPaywall: boolean;
  userTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  isLoading: boolean;
}

/**
 * Hook to check if user has access to a feature based on their subscription tier
 * @param requiredTier - The minimum tier required to access the feature
 * @returns Feature access status and paywall state
 */
export function useFeatureGate(requiredTier: SubscriptionTier): FeatureGateResult {
  const { user, isLoaded } = useUser();

  // Get user's current tier from Clerk metadata
  const userTier = (user?.publicMetadata?.tier as SubscriptionTier) || 'free';

  // Check if user has access
  const access = hasFeatureAccess(userTier, requiredTier);

  // TEMPORARY: Disable paywall until Stripe is integrated
  return {
    hasAccess: true, // Always allow access for now
    showPaywall: false, // Never show paywall for now
    userTier,
    requiredTier,
    isLoading: !isLoaded
  };
}

/**
 * Get user's subscription status from Clerk
 */
export function useSubscription() {
  const { user, isLoaded } = useUser();

  const tier = (user?.publicMetadata?.tier as SubscriptionTier) || 'free';
  const subscriptionStatus = (user?.publicMetadata?.subscriptionStatus as string) || 'inactive';
  const customerId = (user?.publicMetadata?.stripeCustomerId as string) || null;

  return {
    tier,
    isSubscribed: tier !== 'free',
    subscriptionStatus,
    customerId,
    isLoading: !isLoaded,
    tierInfo: TIER_PRICING[tier]
  };
}
