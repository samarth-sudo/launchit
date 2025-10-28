import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import { getUserByClerkId } from '@/lib/db';

// Calculate reputation score for a user based on their activity
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { user_id } = body;

    // Get user data
    const userResult = await sql`
      SELECT * FROM users WHERE id = ${user_id}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Calculate reputation based on multiple factors
    let reputationScore = 0;

    // 1. Reviews written (up to 30 points)
    const reviewsResult = await sql`
      SELECT COUNT(*)::INT as review_count
      FROM interactions
      WHERE investor_id = ${user_id} AND review_rating IS NOT NULL
    `;
    const reviewCount = reviewsResult.rows[0]?.review_count || 0;
    reputationScore += Math.min(reviewCount * 5, 30); // 5 points per review, max 30

    // 2. Quality of reviews (up to 20 points - based on length and detail)
    const detailedReviewsResult = await sql`
      SELECT COUNT(*)::INT as detailed_count
      FROM interactions
      WHERE investor_id = ${user_id}
        AND review_rating IS NOT NULL
        AND LENGTH(review_text) > 100
    `;
    const detailedCount = detailedReviewsResult.rows[0]?.detailed_count || 0;
    reputationScore += Math.min(detailedCount * 4, 20); // 4 points per detailed review, max 20

    // 3. Interaction count (up to 20 points)
    const interactionsResult = await sql`
      SELECT COUNT(*)::INT as interaction_count
      FROM interactions
      WHERE investor_id = ${user_id}
    `;
    const interactionCount = interactionsResult.rows[0]?.interaction_count || 0;
    reputationScore += Math.min(interactionCount * 0.5, 20); // 0.5 points per interaction, max 20

    // 4. Messages sent (up to 15 points - shows engagement)
    const messagesResult = await sql`
      SELECT COUNT(*)::INT as message_count
      FROM messages
      WHERE sender_id = ${user_id}
    `;
    const messageCount = messagesResult.rows[0]?.message_count || 0;
    reputationScore += Math.min(messageCount * 1, 15); // 1 point per message, max 15

    // 5. Super likes (up to 10 points - shows genuine interest)
    const superLikesResult = await sql`
      SELECT COUNT(*)::INT as super_like_count
      FROM interactions
      WHERE investor_id = ${user_id} AND action = 'super_like'
    `;
    const superLikeCount = superLikesResult.rows[0]?.super_like_count || 0;
    reputationScore += Math.min(superLikeCount * 2, 10); // 2 points per super like, max 10

    // 6. Account age bonus (up to 5 points)
    const accountAgeInDays = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (accountAgeInDays > 30) reputationScore += 5;
    else if (accountAgeInDays > 7) reputationScore += 3;
    else if (accountAgeInDays > 1) reputationScore += 1;

    // Calculate rank based on reputation score
    let rank = 0;
    if (reputationScore >= 100) rank = 5; // Elite
    else if (reputationScore >= 75) rank = 4; // Expert
    else if (reputationScore >= 50) rank = 3; // Advanced
    else if (reputationScore >= 25) rank = 2; // Intermediate
    else if (reputationScore >= 10) rank = 1; // Beginner
    else rank = 0; // Newcomer

    // Update user's reputation and rank
    await sql`
      UPDATE users
      SET
        reputation_score = ${reputationScore},
        rank = ${rank},
        updated_at = NOW()
      WHERE id = ${user_id}
    `;

    return NextResponse.json({
      success: true,
      reputation: {
        score: reputationScore,
        rank,
        breakdown: {
          reviews: Math.min(reviewCount * 5, 30),
          detailed_reviews: Math.min(detailedCount * 4, 20),
          interactions: Math.min(interactionCount * 0.5, 20),
          messages: Math.min(messageCount * 1, 15),
          super_likes: Math.min(superLikeCount * 2, 10),
          account_age: accountAgeInDays > 30 ? 5 : accountAgeInDays > 7 ? 3 : accountAgeInDays > 1 ? 1 : 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Reputation calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate reputation', details: error.message },
      { status: 500 }
    );
  }
}

// Get reputation leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await sql`
      SELECT
        id,
        profile->>'name' as name,
        profile->>'avatar' as avatar,
        user_type,
        reputation_score,
        rank
      FROM users
      WHERE reputation_score > 0
      ORDER BY reputation_score DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      success: true,
      leaderboard: result.rows,
    });
  } catch (error: any) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: error.message },
      { status: 500 }
    );
  }
}
