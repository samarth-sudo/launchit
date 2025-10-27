import Anthropic from '@anthropic-ai/sdk';
import type { Product, User, SyntheticPersona, PersonaResponse, MatchScoreInsight } from '@/types/database';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Constants
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'; // Fast and cost-effective
const CLAUDE_MODEL_OPUS = 'claude-3-opus-20240229'; // For complex reasoning

/**
 * Calculate semantic match score between investor thesis and product
 * Uses Claude's extended thinking to analyze compatibility
 */
export async function calculateSemanticMatch(
  investorThesis: string,
  productDescription: string,
  productData: Partial<Product>
): Promise<MatchScoreInsight> {
  const prompt = `You are an expert investor matchmaking AI. Analyze the compatibility between an investor's thesis and a startup product.

Investor Investment Thesis:
${investorThesis}

Product Information:
- Title: ${productData.title}
- Pitch: ${productData.description_7words}
- Full Description: ${productData.full_description || 'Not provided'}
- Category: ${productData.category}
- Pricing: ${JSON.stringify(productData.pricing)}
${productData.ai_generated_summary ? `- AI Summary: ${productData.ai_generated_summary}` : ''}

Task: Provide a match score (0-100) and detailed reasoning.

Respond in JSON format:
{
  "score": 0-100,
  "reasoning": "detailed explanation of why this is or isn't a good match",
  "key_alignments": ["alignment 1", "alignment 2", ...],
  "potential_concerns": ["concern 1", "concern 2", ...],
  "confidence": 0.0-1.0
}`;

  const startTime = Date.now();

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseTime = Date.now() - startTime;
  const content = message.content[0];

  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const result = JSON.parse(content.text) as MatchScoreInsight;

  return {
    ...result,
    responseTimeMs: responseTime,
    tokenCount: message.usage.input_tokens + message.usage.output_tokens,
  } as any;
}

/**
 * Predict purchase intent based on behavioral signals
 */
export async function predictPurchaseIntent(
  behavioralSignals: {
    time_spent_seconds: number;
    video_completion_pct: number;
    replay_count: number;
    clicked_founder_profile: boolean;
    previous_likes_in_category: number;
  },
  product: Partial<Product>,
  investorProfile: Partial<User>
): Promise<{ score: number; reasoning: string; confidence: number }> {
  const prompt = `You are an AI system that predicts whether an investor will invest in a startup based on their behavioral signals and profile.

Behavioral Signals:
- Time spent viewing: ${behavioralSignals.time_spent_seconds} seconds
- Video completion: ${(behavioralSignals.video_completion_pct * 100).toFixed(0)}%
- Times replayed video: ${behavioralSignals.replay_count}
- Clicked founder profile: ${behavioralSignals.clicked_founder_profile ? 'Yes' : 'No'}
- Previously liked similar products: ${behavioralSignals.previous_likes_in_category}

Product:
- ${product.title}
- ${product.description_7words}
- Category: ${product.category}
- Pricing: ${JSON.stringify(product.pricing)}

Investor Profile:
- Investment thesis: ${investorProfile.profile?.investment_thesis || 'Not specified'}
- Stage preference: ${investorProfile.profile?.stage_preference?.join(', ') || 'Not specified'}

Task: Predict the likelihood (0-100) that this investor will invest in this product based on their engagement behavior.

Respond in JSON:
{
  "score": 0-100,
  "reasoning": "explanation of the prediction",
  "confidence": 0.0-1.0
}`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  return JSON.parse(content.text);
}

/**
 * Generate synthetic investor personas for product testing
 */
export async function generateSyntheticPersonas(count: number): Promise<SyntheticPersona[]> {
  const prompt = `You are an AI that generates realistic investor personas for startup testing.

Generate ${count} diverse, realistic investor personas with the following characteristics:
- Mix of different investment stages (angel, seed, Series A)
- Various industry preferences (AI, SaaS, Fintech, Healthcare, Consumer, etc.)
- Different risk tolerances (low, medium, high)
- Diverse investment ranges

Each persona should be unique and realistic. Include:
- Name (realistic but fictional)
- Role (e.g., "Angel Investor", "Partner at VC Firm", "Startup Advisor")
- Firm (optional, for VCs)
- Investment thesis (1-2 sentences)
- Stage preference (array)
- Investment range (min/max in USD)
- Risk tolerance
- Industry experience (array of industries)

Respond with a JSON array of personas:
[
  {
    "name": "...",
    "role": "...",
    "firm": "...",
    "investment_thesis": "...",
    "stage_preference": ["seed", "series_a"],
    "investment_range": {"min": 50000, "max": 500000},
    "risk_tolerance": "medium",
    "industry_experience": ["ai", "saas"]
  },
  ...
]`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  return JSON.parse(content.text);
}

/**
 * Synthetic persona evaluates a product
 */
export async function syntheticPersonaEvaluate(
  persona: SyntheticPersona,
  product: Product
): Promise<PersonaResponse> {
  const prompt = `You are roleplaying as the following investor persona:

Name: ${persona.name}
Role: ${persona.role}
${persona.firm ? `Firm: ${persona.firm}` : ''}
Investment Thesis: ${persona.investment_thesis}
Stage Preference: ${persona.stage_preference.join(', ')}
Investment Range: $${persona.investment_range.min.toLocaleString()} - $${persona.investment_range.max.toLocaleString()}
Risk Tolerance: ${persona.risk_tolerance}
Industry Experience: ${persona.industry_experience.join(', ')}

You are evaluating this startup product:

Title: ${product.title}
Pitch: ${product.description_7words}
Description: ${product.full_description || 'Not provided'}
Category: ${product.category}
Pricing: ${JSON.stringify(product.pricing)}
${product.ai_generated_summary ? `Summary: ${product.ai_generated_summary}` : ''}

Task: As this persona, decide whether you would invest in this product. Respond in character.

Respond in JSON:
{
  "decision": "like" | "pass" | "super_like",
  "reasoning": "your reasoning as this persona (2-3 sentences)",
  "interest_score": 0-100,
  "concerns": ["concern 1", "concern 2", ...],
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  const result = JSON.parse(content.text);

  return {
    persona,
    decision: result.decision,
    reasoning: result.reasoning,
    interest_score: result.interest_score,
    concerns: result.concerns,
    suggestions: result.suggestions,
  };
}

/**
 * Generate AI-powered due diligence brief
 */
export async function generateDueDiligenceBrief(
  product: Product,
  founder: User
): Promise<string> {
  const prompt = `You are an AI due diligence analyst. Generate a comprehensive but concise due diligence brief for the following startup product.

Product:
- Title: ${product.title}
- Description: ${product.full_description || product.description_7words}
- Category: ${product.category}
- Pricing: ${JSON.stringify(product.pricing)}
- Market Data: ${JSON.stringify(product.market_data || {})}

Founder:
- Name: ${founder.profile.name || 'Unknown'}
- Company: ${founder.profile.company || 'Unknown'}
- Bio: ${founder.profile.bio || 'Not provided'}
- LinkedIn: ${founder.profile.linkedin || 'Not provided'}
- GitHub: ${founder.profile.github || 'Not provided'}
- Previous Exits: ${founder.profile.previous_exits || 0}

Task: Provide a brief covering:
1. Market Size Estimation (with reasoning)
2. Competitive Analysis (key competitors, differentiation)
3. Founder Assessment (credibility, strengths)
4. Risk Factors (3-5 key risks)
5. Investment Opportunity (why this could be interesting)

Keep it concise (200-300 words total). Use bullet points.`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL_OPUS, // Use Opus for deeper analysis
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  return content.text;
}

/**
 * Generate product summary from video transcription
 */
export async function generateProductSummary(
  title: string,
  description: string,
  transcription?: string
): Promise<string> {
  const prompt = `Generate a concise 2-3 sentence summary of this startup product:

Title: ${title}
Pitch: ${description}
${transcription ? `Video Transcription: ${transcription}` : ''}

Summary should highlight:
- What the product does
- Who it's for
- Key value proposition

Keep it under 100 words.`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  return content.text.trim();
}

/**
 * Analyze synthetic test results and provide recommendations
 */
export async function analyzeSyntheticTestResults(
  personaResponses: PersonaResponse[],
  product: Product
): Promise<{
  like_rate: number;
  pass_rate: number;
  super_like_rate: number;
  top_concerns: string[];
  recommendations: string[];
  sentiment_analysis: { positive: number; neutral: number; negative: number };
}> {
  // Calculate rates
  const likeCount = personaResponses.filter(r => r.decision === 'like').length;
  const passCount = personaResponses.filter(r => r.decision === 'pass').length;
  const superLikeCount = personaResponses.filter(r => r.decision === 'super_like').length;
  const total = personaResponses.length;

  const like_rate = ((likeCount + superLikeCount) / total) * 100;
  const pass_rate = (passCount / total) * 100;
  const super_like_rate = (superLikeCount / total) * 100;

  // Aggregate concerns
  const allConcerns = personaResponses.flatMap(r => r.concerns);
  const concernCounts = allConcerns.reduce((acc, concern) => {
    acc[concern] = (acc[concern] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const top_concerns = Object.entries(concernCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([concern]) => concern);

  // Use Claude to generate recommendations
  const prompt = `Based on synthetic investor testing, provide recommendations for improving this product's appeal:

Product: ${product.title} - ${product.description_7words}

Test Results:
- Like Rate: ${like_rate.toFixed(1)}%
- Pass Rate: ${pass_rate.toFixed(1)}%
- Super Like Rate: ${super_like_rate.toFixed(1)}%

Top Concerns from Investors:
${top_concerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Sample Feedback:
${personaResponses.slice(0, 5).map(r => `- ${r.persona.role}: "${r.reasoning}"`).join('\n')}

Provide 3-5 actionable recommendations to improve product-market fit and investor appeal.

Respond with a JSON array of strings:
["recommendation 1", "recommendation 2", ...]`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  const recommendations = JSON.parse(content.text);

  // Simple sentiment analysis based on interest scores
  const avgInterest = personaResponses.reduce((sum, r) => sum + r.interest_score, 0) / total;
  const sentiment_analysis = {
    positive: avgInterest > 70 ? 70 : avgInterest,
    neutral: avgInterest > 70 ? 30 : avgInterest < 40 ? 30 : 50,
    negative: avgInterest < 40 ? 70 : avgInterest > 70 ? 0 : 50 - avgInterest,
  };

  return {
    like_rate,
    pass_rate,
    super_like_rate,
    top_concerns,
    recommendations,
    sentiment_analysis,
  };
}

// Export client for custom usage
export { anthropic };
