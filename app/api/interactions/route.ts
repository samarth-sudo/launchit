import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, createInteraction, checkAndCreateMatch, getProductById } from '@/lib/db';
import { predictPurchaseIntent } from '@/lib/claude';
import { trackAnalyticsEvent } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.user_type !== 'investor') {
      return NextResponse.json(
        { error: 'Only investors can swipe' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      product_id,
      action,
      time_spent_seconds,
      video_completion_pct,
      replay_count,
      clicked_founder_profile,
    } = body;

    // Validate
    if (!product_id || !action || !['like', 'pass', 'super_like'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Get product for AI prediction
    const product = await getProductById(product_id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Predict purchase intent using Claude AI (for likes only)
    let ai_intent_score = null;
    let ai_reasoning = null;

    if (action === 'like' || action === 'super_like') {
      try {
        const intentPrediction = await predictPurchaseIntent(
          {
            time_spent_seconds: time_spent_seconds || 30,
            video_completion_pct: video_completion_pct || 0.5,
            replay_count: replay_count || 0,
            clicked_founder_profile: clicked_founder_profile || false,
            previous_likes_in_category: 0, // TODO: Calculate from history
          },
          product,
          user
        );

        ai_intent_score = intentPrediction.score;
        ai_reasoning = intentPrediction.reasoning;
      } catch (error) {
        console.error('Purchase intent prediction error:', error);
        // Continue without AI prediction
      }
    }

    // Create interaction
    const interaction = await createInteraction({
      investor_id: user.id,
      product_id,
      action,
      time_spent_seconds: time_spent_seconds || 0,
      video_completion_pct: video_completion_pct || 0,
      replay_count: replay_count || 0,
      clicked_founder_profile: clicked_founder_profile || false,
      ai_intent_score,
      ai_reasoning,
    });

    // Check if this creates a match (for likes)
    let match = null;
    if (action === 'like' || action === 'super_like') {
      match = await checkAndCreateMatch(user.id, product_id);
    }

    // Track analytics
    await trackAnalyticsEvent({
      user_id: user.id,
      event_type: 'swipe',
      event_data: {
        product_id,
        action,
        ai_intent_score,
        match_created: !!match,
      },
    });

    return NextResponse.json({
      success: true,
      interaction,
      match,
      ai_intent_score,
      message: match ? 'Match created!' : 'Swipe recorded',
    });
  } catch (error: any) {
    console.error('Interaction error:', error);

    // Handle duplicate swipe
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'You already swiped on this product' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to record interaction', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's interaction history
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // TODO: Implement getInteractionsByInvestor
    return NextResponse.json({
      success: true,
      interactions: [],
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}
