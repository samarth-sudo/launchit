import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import type { MarketAnalysisResult } from '@/types/database';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const maxDuration = 300; // 5 minutes for complex analyses
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { productName, description, pricePoint, productId } = body;

    if (!productName || !description || !pricePoint) {
      return NextResponse.json(
        { error: 'Missing required fields: productName, description, pricePoint' },
        { status: 400 }
      );
    }

    // Validate description length
    if (description.length < 100) {
      return NextResponse.json(
        { error: 'Description must be at least 100 characters for accurate analysis' },
        { status: 400 }
      );
    }

    console.log(`Market analysis requested for: ${productName}`);
    const startTime = Date.now();

    // Create Claude AI prompt for market analysis
    const prompt = createMarketAnalysisPrompt(productName, description, pricePoint);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 16000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Parse the JSON response
    let analysisData;
    try {
      // Extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text);
      throw new Error('Invalid response format from AI analysis');
    }

    const processingTime = Date.now() - startTime;

    // Structure the response
    const result: Partial<MarketAnalysisResult> = {
      id: crypto.randomUUID(),
      product_id: productId || crypto.randomUUID(),
      founder_id: userId,
      analysis_date: new Date(),
      demographics: analysisData.demographics || [],
      income_segments: analysisData.income_segments || [],
      market_sizing: analysisData.market_sizing || {
        tam: 0,
        sam: 0,
        som: 0,
        methodology: '',
        key_assumptions: [],
        geographic_focus: 'Global',
      },
      competitors: analysisData.competitors || [],
      gtm_strategies: analysisData.gtm_strategies || [],
      executive_summary: analysisData.executive_summary || '',
      critical_insights: analysisData.critical_insights || [],
      real_talk_summary: analysisData.real_talk_summary || '',
      confidence_score: analysisData.confidence_score || 85,
      token_count: message.usage?.output_tokens || 0,
      processing_time_ms: processingTime,
      status: 'completed',
    };

    console.log(`Market analysis completed in ${processingTime}ms`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Market analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete market analysis',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

function createMarketAnalysisPrompt(
  productName: string,
  description: string,
  pricePoint: string
): string {
  return `You are an expert market research analyst specializing in demographic purchase behavior and startup market sizing. Analyze this product using peer-reviewed research methodology.

PRODUCT TO ANALYZE:
- Name: ${productName}
- Description: ${description}
- Price Point: ${pricePoint}

Provide a comprehensive market analysis in the following JSON structure:

{
  "executive_summary": "A compelling 2-3 sentence summary of who will buy this product and why",

  "demographics": [
    {
      "name": "Segment name (e.g., 'Tech-Savvy Millennials')",
      "age_range": "e.g., '25-34'",
      "gender": "All | Male | Female",
      "ethnicity": "All (unless culturally relevant)",
      "purchase_intent": 0-100,
      "population_percentage": 0-100,
      "psychographic_profile": "Detailed psychological and lifestyle profile",
      "behavioral_insights": ["Key behavior 1", "Key behavior 2"],
      "motivations": ["Primary motivation 1", "Primary motivation 2"],
      "pain_points": ["Pain point 1", "Pain point 2"],
      "media_consumption": ["Platform 1", "Platform 2"]
    }
  ],

  "income_segments": [
    {
      "income_bracket": "e.g., '$75-150k/yr'",
      "purchase_intent": 0-100,
      "market_size_percentage": 0-100,
      "financial_profile": "Description of financial situation",
      "spending_behavior": "How they make purchase decisions",
      "value_drivers": ["What drives their purchases"]
    }
  ],

  "market_sizing": {
    "tam": Total addressable market in USD,
    "sam": Serviceable addressable market in USD,
    "som": Serviceable obtainable market (first year) in USD,
    "methodology": "Explanation of how these numbers were calculated",
    "key_assumptions": ["Assumption 1", "Assumption 2"],
    "geographic_focus": "Primary market geography"
  },

  "competitors": [
    {
      "name": "Competitor name",
      "url": "https://competitor.com or null",
      "positioning": "How they position themselves",
      "pricing": "Their pricing model",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "differentiation_opportunities": ["How to differentiate"]
    }
  ],

  "gtm_strategies": [
    {
      "title": "Strategy name",
      "priority": "high | medium | low",
      "description": "Detailed strategy description",
      "channels": ["Channel 1", "Channel 2"],
      "target_segments": ["Segment 1", "Segment 2"],
      "estimated_cost": "e.g., '$5-10k/month'",
      "expected_timeline": "e.g., '3-6 months'",
      "success_metrics": ["Metric 1", "Metric 2"]
    }
  ],

  "critical_insights": [
    "Most important insight 1",
    "Most important insight 2",
    "Most important insight 3"
  ],

  "real_talk_summary": "Brutally honest 2-3 sentences about this product's market potential. No sugarcoating.",

  "confidence_score": 0-100 (how confident you are in this analysis)
}

ANALYSIS GUIDELINES:
1. **Demographics**: Identify 5-8 key demographic segments based on age, income, and psychographics
2. **Income Analysis**: Use research-backed purchase intent patterns - higher income = higher intent for premium products
3. **Market Sizing**: Use bottom-up AND top-down approaches for TAM/SAM/SOM
4. **Competitors**: Identify 3-5 direct and indirect competitors
5. **GTM**: Provide 3-5 actionable go-to-market strategies prioritized by impact
6. **Be Honest**: The "real_talk_summary" should be genuinely critical and realistic
7. **Purchase Intent**: Base on actual consumer behavior research, not assumptions
8. **Income Brackets**: Use realistic ranges: <$40k, $40-75k, $75-150k, $150-300k, >$300k

Return ONLY the JSON object, no additional commentary.`;
}
