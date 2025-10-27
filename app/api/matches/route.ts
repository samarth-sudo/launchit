import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, getMatchesByInvestor, getMatchesByFounder } from '@/lib/db';
import { sql } from '@vercel/postgres';

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

    // Get matches based on user type
    let matches;
    if (user.user_type === 'investor') {
      matches = await getMatchesByInvestor(user.id);
    } else {
      matches = await getMatchesByFounder(user.id);
    }

    // Enrich matches with product and user details
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        // Get product details
        const productResult = await sql`
          SELECT * FROM products WHERE id = ${match.product_id}
        `;
        const product = productResult.rows[0];

        // Get other user details (founder for investor, investor for founder)
        const otherUserId = user.user_type === 'investor' ? match.founder_id : match.investor_id;
        const userResult = await sql`
          SELECT * FROM users WHERE id = ${otherUserId}
        `;
        const other_user = userResult.rows[0];

        return {
          ...match,
          product,
          other_user,
        };
      })
    );

    return NextResponse.json({
      success: true,
      matches: enrichedMatches,
      user_type: user.user_type,
      count: enrichedMatches.length,
    });
  } catch (error: any) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches', details: error.message },
      { status: 500 }
    );
  }
}
