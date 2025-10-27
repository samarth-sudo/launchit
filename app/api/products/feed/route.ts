import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, getSwipeFeed } from '@/lib/db';
import { calculateSemanticMatch } from '@/lib/claude';

export async function GET(request: NextRequest) {
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
        { error: 'Only investors can access the feed' },
        { status: 403 }
      );
    }

    // Get products (excluding already swiped)
    const products = await getSwipeFeed(user.id, 20);

    // Enrich with AI insights (calculate match scores)
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        try {
          // Calculate AI match score if investor has a thesis
          let ai_match_score = null;
          let ai_insight = null;

          if (user.profile?.investment_thesis) {
            const matchResult = await calculateSemanticMatch(
              user.profile.investment_thesis,
              product.description_7words,
              product
            );

            ai_match_score = matchResult.score;
            ai_insight = matchResult.reasoning;
          }

          return {
            ...product,
            ai_match_score,
            ai_insight,
            // Mock market data (in production, fetch from AI insights table)
            market_size: product.market_data?.tam ? `${product.market_data.tam}B` : '2.3B',
            competitors_count: product.market_data?.competitors?.length || 3,
          };
        } catch (error) {
          console.error(`Error enriching product ${product.id}:`, error);
          // Return product without AI insights if error
          return {
            ...product,
            ai_match_score: null,
            ai_insight: null,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      products: enrichedProducts,
      count: enrichedProducts.length,
    });
  } catch (error: any) {
    console.error('Feed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}
