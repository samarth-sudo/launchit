// Subscription and pricing types

export type SubscriptionTier = 'free' | 'founder' | 'investor';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: SubscriptionStatus;
  current_period_end?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TierFeatures {
  price: number;
  name: string;
  description: string;
  features: string[];
  cta: string;
}

export const TIER_PRICING: Record<SubscriptionTier, TierFeatures> = {
  free: {
    price: 0,
    name: 'User',
    description: 'Discover products matched to your profile',
    features: [
      'Browse all products',
      'Swipe interface',
      'Like & pass products',
      'Match with founders',
      'Basic messaging',
      'Profile customization'
    ],
    cta: 'Get Started'
  },
  founder: {
    price: 10,
    name: 'Founder',
    description: 'Launch and validate your product',
    features: [
      'Upload product demos',
      'BuyerIQ market analysis',
      'AI synthetic testing ($29)',
      'Analytics dashboard',
      'Match with investors & adopters',
      'Unlimited messaging',
      'Real-time insights'
    ],
    cta: 'Start Building'
  },
  investor: {
    price: 40,
    name: 'Investor',
    description: 'Discover validated startups faster',
    features: [
      'AI match scoring',
      'Instant due diligence',
      'Purchase intent predictions',
      'Advanced filters',
      'Direct messaging',
      'Investment thesis matching',
      'Market size analysis',
      'Founder assessments'
    ],
    cta: 'Start Investing'
  }
};

// Feature gate configuration
export const FEATURE_GATES: Record<string, SubscriptionTier> = {
  // Founder features
  'create_product': 'founder',
  'market_analysis': 'founder',
  'synthetic_test': 'founder',
  'product_analytics': 'founder',
  'founder_messaging': 'founder',

  // Investor features
  'ai_match_scoring': 'investor',
  'due_diligence': 'investor',
  'purchase_intent': 'investor',
  'advanced_filters': 'investor',
  'investor_messaging': 'investor',
  'investment_analytics': 'investor',

  // Free features (no gate)
  'browse_products': 'free',
  'basic_profile': 'free',
  'swipe_interface': 'free',
};

// Check if user has access to a feature
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  const tierHierarchy: Record<SubscriptionTier, number> = {
    free: 0,
    founder: 1,
    investor: 2
  };

  // Note: Founder and Investor are separate paths, not hierarchical
  // Only free < founder and free < investor
  if (userTier === requiredTier) return true;
  if (requiredTier === 'free') return true;

  return false;
}

// Get required tier for a feature
export function getRequiredTier(feature: string): SubscriptionTier {
  return FEATURE_GATES[feature] || 'free';
}
