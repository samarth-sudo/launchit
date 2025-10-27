// Database types matching PostgreSQL schema

export type UserType = 'founder' | 'investor' | 'early_adopter';
export type PricingType = 'one_time' | 'subscription' | 'equity' | 'partnership';
export type MatchStatus = 'interested' | 'in_discussion' | 'deal_closed' | 'passed';
export type InteractionAction = 'like' | 'pass' | 'super_like';

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  user_type: UserType;
  profile: UserProfile;
  stripe_customer_id?: string;
  stripe_account_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  name?: string;
  avatar?: string;
  bio?: string;
  company?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;

  // Investor-specific
  firm?: string;
  investment_thesis?: string;
  stage_preference?: string[];
  investment_range?: {
    min: number;
    max: number;
  };
  portfolio?: string[];

  // Founder-specific
  previous_exits?: number;
  founding_year?: number;

  // Early Adopter-specific (demographic data)
  age?: number;
  age_range?: string; // e.g., "25-34"
  gender?: string;
  location?: string;
  income_range?: string; // e.g., "$75-150k/yr"
  occupation?: string;
  interests?: string[]; // e.g., ["tech", "fitness", "finance"]
  product_categories?: string[]; // Categories they're interested in
  early_adopter_type?: string; // e.g., "tech enthusiast", "fitness lover"
}

export interface Product {
  id: string;
  founder_id: string;
  title: string;
  description_7words: string;
  full_description?: string;
  demo_video: DemoVideo;
  pricing: ProductPricing;
  category: string;
  tags: string[];
  ai_generated_summary?: string;
  embedding?: number[]; // Vector embedding
  market_data?: MarketData;
  status: 'active' | 'paused' | 'funded';
  view_count: number;
  like_count: number;
  match_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface DemoVideo {
  url: string;
  duration: number;
  thumbnail: string;
  cloudinary_id: string;
  transcription?: string;
}

export interface ProductPricing {
  amount: number;
  currency: string;
  type: PricingType;
  equity_percentage?: number;
  recurring_interval?: 'monthly' | 'yearly';
}

export interface MarketData {
  tam?: number; // Total addressable market
  competitors?: string[];
  stage?: 'idea' | 'mvp' | 'early_revenue' | 'growth';
  metrics?: {
    mrr?: number;
    users?: number;
    growth_rate?: number;
  };
}

export interface Interaction {
  id: string;
  investor_id: string;
  product_id: string;
  action: InteractionAction;
  time_spent_seconds: number;
  video_completion_pct: number;
  replay_count: number;
  clicked_founder_profile: boolean;
  ai_intent_score?: number;
  ai_reasoning?: string;
  timestamp: Date;
}

export interface Match {
  id: string;
  founder_id: string;
  investor_id: string;
  product_id: string;
  matched_at: Date;
  status: MatchStatus;
  deal_amount?: number;
  notes?: string;
  updated_at: Date;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read_at?: Date;
  created_at: Date;
}

export interface AISyntheticTest {
  id: string;
  product_id: string;
  founder_id: string;
  test_date: Date;
  persona_count: number;
  synthetic_personas: SyntheticPersona[];
  results: TestResults;
  cost_usd: number;
  stripe_payment_intent?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_time_seconds?: number;
}

export interface SyntheticPersona {
  name: string;
  role: string;
  firm?: string;
  investment_thesis: string;
  stage_preference: string[];
  investment_range: {
    min: number;
    max: number;
  };
  risk_tolerance: 'low' | 'medium' | 'high';
  industry_experience: string[];
}

export interface TestResults {
  like_rate: number; // 0-100
  pass_rate: number; // 0-100
  super_like_rate: number; // 0-100
  top_concerns: string[];
  recommendations: string[];
  sentiment_analysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  persona_responses: PersonaResponse[];
}

export interface PersonaResponse {
  persona: SyntheticPersona;
  decision: InteractionAction;
  reasoning: string;
  interest_score: number; // 0-100
  concerns: string[];
  suggestions: string[];
}

export interface AIInsight {
  id: string;
  product_id: string;
  investor_id?: string;
  insight_type: InsightType;
  content: string;
  structured_data?: any;
  generated_at: Date;
  expires_at: Date;
  token_count?: number;
  response_time_ms?: number;
}

export type InsightType =
  | 'match_score'
  | 'due_diligence'
  | 'risk_assessment'
  | 'market_context'
  | 'founder_analysis';

export interface MatchScoreInsight {
  score: number; // 0-100
  reasoning: string;
  key_alignments: string[];
  potential_concerns: string[];
  confidence: number; // 0-1
}

export interface DueDiligenceInsight {
  market_size_estimate: string;
  competitive_analysis: {
    competitors: string[];
    differentiation: string;
    market_position: string;
  };
  founder_credentials: {
    experience: string;
    track_record: string;
    strengths: string[];
  };
  risk_factors: string[];
  opportunities: string[];
  estimated_valuation_range?: {
    min: number;
    max: number;
  };
}

export interface InvestorPreferences {
  id: string;
  investor_id: string;
  preferred_categories: string[];
  preferred_stages: string[];
  investment_range: {
    min: number;
    max: number;
  };
  avoid_keywords: string[];
  ai_recommendation_enabled: boolean;
  updated_at: Date;
}

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  ab_test_variant?: string;
  session_id?: string;
  user_agent?: string;
  created_at: Date;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  user_type?: UserType;
  referral_code?: string;
  metadata: Record<string, any>;
  invited: boolean;
  created_at: Date;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Swipe feed types
export interface ProductWithAIInsights extends Product {
  founder: User;
  ai_match_score?: number;
  ai_insight?: string;
  market_size?: string;
  competitors_count?: number;
  already_swiped?: boolean;
}

// Dashboard types
export interface FounderDashboard {
  products: Product[];
  total_views: number;
  total_likes: number;
  total_matches: number;
  recent_interactions: Interaction[];
  recent_matches: Match[];
  synthetic_tests: AISyntheticTest[];
}

export interface InvestorDashboard {
  liked_products: ProductWithAIInsights[];
  matches: Match[];
  messages_unread_count: number;
  recommendations: ProductWithAIInsights[];
}

// BuyerIQ Market Analysis Types
export interface MarketAnalysisResult {
  id: string;
  product_id: string;
  founder_id: string;
  analysis_date: Date;
  demographics: DemographicSegment[];
  income_segments: IncomeLevelSegment[];
  market_sizing: MarketSizing;
  competitors: CompetitorAnalysis[];
  gtm_strategies: GTMStrategy[];
  executive_summary: string;
  critical_insights: string[];
  real_talk_summary: string;
  confidence_score: number; // 0-100
  token_count?: number;
  processing_time_ms?: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface DemographicSegment {
  name: string;
  age_range: string;
  gender: string;
  ethnicity?: string;
  purchase_intent: number; // 0-100
  population_percentage: number; // % of total market
  psychographic_profile: string;
  behavioral_insights: string[];
  motivations: string[];
  pain_points: string[];
  media_consumption: string[];
}

export interface IncomeLevelSegment {
  income_bracket: string; // e.g., "$40-75k/yr"
  purchase_intent: number; // 0-100
  market_size_percentage: number;
  financial_profile: string;
  spending_behavior: string;
  value_drivers: string[];
}

export interface MarketSizing {
  tam: number; // Total Addressable Market ($)
  sam: number; // Serviceable Addressable Market ($)
  som: number; // Serviceable Obtainable Market ($)
  methodology: string;
  key_assumptions: string[];
  geographic_focus: string;
}

export interface CompetitorAnalysis {
  name: string;
  url?: string;
  positioning: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  differentiation_opportunities: string[];
}

export interface GTMStrategy {
  title: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  channels: string[];
  target_segments: string[];
  estimated_cost: string;
  expected_timeline: string;
  success_metrics: string[];
}
