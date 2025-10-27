import { sql } from '@vercel/postgres';
import type {
  User,
  Product,
  Interaction,
  Match,
  Message,
  AISyntheticTest,
  AIInsight,
  InvestorPreferences,
  AnalyticsEvent,
  WaitlistEntry,
  ProductWithAIInsights,
} from '@/types/database';

/**
 * Database utility functions for Vercel Postgres
 */

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql<User>`
    SELECT * FROM users WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const result = await sql<User>`
    SELECT * FROM users WHERE clerk_id = ${clerkId}
  `;
  return result.rows[0] || null;
}

export async function createUser(data: {
  clerk_id: string;
  email: string;
  user_type: 'founder' | 'investor';
  profile?: any;
}): Promise<User> {
  const result = await sql<User>`
    INSERT INTO users (clerk_id, email, user_type, profile)
    VALUES (${data.clerk_id}, ${data.email}, ${data.user_type}, ${JSON.stringify(data.profile || {})})
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateUserProfile(userId: string, profile: any): Promise<User> {
  const result = await sql<User>`
    UPDATE users
    SET profile = ${JSON.stringify(profile)}, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `;
  return result.rows[0];
}

// ============================================================================
// PRODUCT OPERATIONS
// ============================================================================

export async function getProductById(id: string): Promise<Product | null> {
  const result = await sql<Product>`
    SELECT * FROM products WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function getProductsByFounder(founderId: string): Promise<Product[]> {
  const result = await sql<Product>`
    SELECT * FROM products
    WHERE founder_id = ${founderId}
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function createProduct(data: {
  founder_id: string;
  title: string;
  description_7words: string;
  full_description?: string;
  demo_video: any;
  pricing: any;
  category: string;
  tags?: string[];
  ai_generated_summary?: string;
}): Promise<Product> {
  const result = await sql<Product>`
    INSERT INTO products (
      founder_id, title, description_7words, full_description,
      demo_video, pricing, category, tags, ai_generated_summary
    )
    VALUES (
      ${data.founder_id}, ${data.title}, ${data.description_7words}, ${data.full_description || null},
      ${JSON.stringify(data.demo_video)}, ${JSON.stringify(data.pricing)},
      ${data.category}, ${JSON.stringify(data.tags || [])}::jsonb::text[], ${data.ai_generated_summary || null}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const setFields: string[] = [];
  const values: any[] = [id];
  let paramIndex = 2; // Start at 2 since $1 is the id

  if (data.title !== undefined) {
    setFields.push(`title = $${paramIndex++}`);
    values.push(data.title);
  }
  if (data.description_7words !== undefined) {
    setFields.push(`description_7words = $${paramIndex++}`);
    values.push(data.description_7words);
  }
  if (data.status !== undefined) {
    setFields.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }

  if (setFields.length === 0) {
    throw new Error('No fields to update');
  }

  setFields.push('updated_at = NOW()');

  const query = `
    UPDATE products
    SET ${setFields.join(', ')}
    WHERE id = $1
    RETURNING *
  `;

  const result = await sql.query<Product>(query, values);
  return result.rows[0];
}

// ============================================================================
// SWIPE FEED OPERATIONS
// ============================================================================

/**
 * Get personalized product feed for investor
 * Filters out already swiped products
 */
export async function getSwipeFeed(
  investorId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Product[]> {
  const result = await sql<Product>`
    SELECT p.* FROM products p
    LEFT JOIN interactions i ON p.id = i.product_id AND i.investor_id = ${investorId}
    WHERE p.status = 'active'
      AND i.id IS NULL
    ORDER BY p.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  return result.rows;
}

/**
 * Get AI-recommended products for investor based on their preferences
 */
export async function getAIRecommendedFeed(
  investorId: string,
  preferences: InvestorPreferences,
  limit: number = 20
): Promise<Product[]> {
  const categoriesCondition = preferences.preferred_categories.length > 0
    ? sql`AND p.category = ANY(${JSON.stringify(preferences.preferred_categories)}::jsonb::text[])`
    : sql``;

  const result = await sql<Product>`
    SELECT p.* FROM products p
    LEFT JOIN interactions i ON p.id = i.product_id AND i.investor_id = ${investorId}
    WHERE p.status = 'active'
      AND i.id IS NULL
      ${categoriesCondition}
    ORDER BY p.like_count DESC, p.created_at DESC
    LIMIT ${limit}
  `;
  return result.rows;
}

// ============================================================================
// INTERACTION OPERATIONS
// ============================================================================

export async function createInteraction(data: {
  investor_id: string;
  product_id: string;
  action: 'like' | 'pass' | 'super_like';
  time_spent_seconds: number;
  video_completion_pct: number;
  replay_count: number;
  clicked_founder_profile: boolean;
  ai_intent_score?: number;
  ai_reasoning?: string;
}): Promise<Interaction> {
  const result = await sql<Interaction>`
    INSERT INTO interactions (
      investor_id, product_id, action, time_spent_seconds,
      video_completion_pct, replay_count, clicked_founder_profile,
      ai_intent_score, ai_reasoning
    )
    VALUES (
      ${data.investor_id}, ${data.product_id}, ${data.action}, ${data.time_spent_seconds},
      ${data.video_completion_pct}, ${data.replay_count}, ${data.clicked_founder_profile},
      ${data.ai_intent_score || null}, ${data.ai_reasoning || null}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function getInteractionsByInvestor(investorId: string, limit: number = 50): Promise<Interaction[]> {
  const result = await sql<Interaction>`
    SELECT * FROM interactions
    WHERE investor_id = ${investorId}
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `;
  return result.rows;
}

export async function getInteractionsByProduct(productId: string): Promise<Interaction[]> {
  const result = await sql<Interaction>`
    SELECT * FROM interactions
    WHERE product_id = ${productId}
    ORDER BY timestamp DESC
  `;
  return result.rows;
}

// ============================================================================
// MATCH OPERATIONS
// ============================================================================

/**
 * Check if investor like creates a match (founder must have shown interest)
 */
export async function checkAndCreateMatch(
  investorId: string,
  productId: string
): Promise<Match | null> {
  // Get product founder
  const product = await getProductById(productId);
  if (!product) return null;

  // Check if this creates a match (in this simple version, any like creates a match)
  // In a real app, you might require mutual interest
  const result = await sql<Match>`
    INSERT INTO matches (founder_id, investor_id, product_id)
    VALUES (${product.founder_id}, ${investorId}, ${productId})
    ON CONFLICT DO NOTHING
    RETURNING *
  `;

  return result.rows[0] || null;
}

export async function getMatchesByInvestor(investorId: string): Promise<Match[]> {
  const result = await sql<Match>`
    SELECT * FROM matches
    WHERE investor_id = ${investorId}
    ORDER BY matched_at DESC
  `;
  return result.rows;
}

export async function getMatchesByFounder(founderId: string): Promise<Match[]> {
  const result = await sql<Match>`
    SELECT * FROM matches
    WHERE founder_id = ${founderId}
    ORDER BY matched_at DESC
  `;
  return result.rows;
}

// ============================================================================
// AI INSIGHTS OPERATIONS
// ============================================================================

/**
 * Get or create AI insight (with caching)
 */
export async function getOrCreateAIInsight(
  productId: string,
  investorId: string | null,
  insightType: string,
  generator: () => Promise<{ content: string; structured_data?: any }>
): Promise<AIInsight> {
  // Check cache
  const cached = await sql<AIInsight>`
    SELECT * FROM ai_insights
    WHERE product_id = ${productId}
      AND (investor_id = ${investorId || null} OR investor_id IS NULL)
      AND insight_type = ${insightType}
      AND expires_at > NOW()
    ORDER BY generated_at DESC
    LIMIT 1
  `;

  if (cached.rows[0]) {
    return cached.rows[0];
  }

  // Generate new insight
  const startTime = Date.now();
  const { content, structured_data } = await generator();
  const responseTime = Date.now() - startTime;

  const result = await sql<AIInsight>`
    INSERT INTO ai_insights (
      product_id, investor_id, insight_type, content,
      structured_data, response_time_ms
    )
    VALUES (
      ${productId}, ${investorId || null}, ${insightType}, ${content},
      ${JSON.stringify(structured_data || {})}, ${responseTime}
    )
    RETURNING *
  `;

  return result.rows[0];
}

// ============================================================================
// SYNTHETIC TEST OPERATIONS
// ============================================================================

export async function createSyntheticTest(data: {
  product_id: string;
  founder_id: string;
  persona_count: number;
  synthetic_personas: any[];
  results: any;
  processing_time_seconds: number;
  stripe_payment_intent?: string;
}): Promise<AISyntheticTest> {
  const result = await sql<AISyntheticTest>`
    INSERT INTO ai_synthetic_tests (
      product_id, founder_id, persona_count, synthetic_personas,
      results, processing_time_seconds, stripe_payment_intent, status
    )
    VALUES (
      ${data.product_id}, ${data.founder_id}, ${data.persona_count},
      ${JSON.stringify(data.synthetic_personas)}, ${JSON.stringify(data.results)},
      ${data.processing_time_seconds}, ${data.stripe_payment_intent || null}, 'completed'
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function getSyntheticTestsByFounder(founderId: string): Promise<AISyntheticTest[]> {
  const result = await sql<AISyntheticTest>`
    SELECT * FROM ai_synthetic_tests
    WHERE founder_id = ${founderId}
    ORDER BY test_date DESC
  `;
  return result.rows;
}

// ============================================================================
// ANALYTICS OPERATIONS
// ============================================================================

export async function trackAnalyticsEvent(data: {
  user_id?: string;
  event_type: string;
  event_data?: any;
  ab_test_variant?: string;
  session_id?: string;
}): Promise<void> {
  await sql`
    INSERT INTO analytics_events (user_id, event_type, event_data, ab_test_variant, session_id)
    VALUES (
      ${data.user_id || null}, ${data.event_type}, ${JSON.stringify(data.event_data || {})},
      ${data.ab_test_variant || null}, ${data.session_id || null}
    )
  `;
}

// ============================================================================
// WAITLIST OPERATIONS
// ============================================================================

export async function addToWaitlist(data: {
  email: string;
  user_type?: 'founder' | 'investor';
  metadata?: any;
}): Promise<WaitlistEntry> {
  const result = await sql<WaitlistEntry>`
    INSERT INTO waitlist (email, user_type, metadata)
    VALUES (${data.email}, ${data.user_type || null}, ${JSON.stringify(data.metadata || {})})
    ON CONFLICT (email) DO NOTHING
    RETURNING *
  `;
  return result.rows[0];
}

export default sql;
