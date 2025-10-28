import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import { getUserByClerkId } from '@/lib/db';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { product_id, rating, review_text } = body;

    // Validate
    if (!product_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating or product_id' },
        { status: 400 }
      );
    }

    // Check if user already has an interaction with this product
    const existingInteraction = await sql`
      SELECT id FROM interactions
      WHERE investor_id = ${user.id} AND product_id = ${product_id}
    `;

    if (existingInteraction.rows.length > 0) {
      // Update existing interaction with review
      const result = await sql`
        UPDATE interactions
        SET
          review_rating = ${rating},
          review_text = ${review_text || null},
          reviewed_at = NOW()
        WHERE id = ${existingInteraction.rows[0].id}
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        review: result.rows[0],
      });
    } else {
      // Create new interaction with review
      const result = await sql`
        INSERT INTO interactions (
          investor_id, product_id, action, review_rating, review_text, reviewed_at
        )
        VALUES (
          ${user.id}, ${product_id}, 'like', ${rating}, ${review_text || null}, NOW()
        )
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        review: result.rows[0],
      });
    }
  } catch (error: any) {
    console.error('Review error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    // Get all reviews for a product
    const result = await sql`
      SELECT
        i.review_rating,
        i.review_text,
        i.reviewed_at,
        u.profile->>'name' as reviewer_name,
        u.profile->>'avatar' as reviewer_avatar,
        u.reputation_score
      FROM interactions i
      JOIN users u ON i.investor_id = u.id
      WHERE i.product_id = ${productId}
        AND i.review_rating IS NOT NULL
      ORDER BY i.reviewed_at DESC
    `;

    // Calculate average rating
    const avgResult = await sql`
      SELECT
        AVG(review_rating)::FLOAT as avg_rating,
        COUNT(*)::INT as review_count
      FROM interactions
      WHERE product_id = ${productId}
        AND review_rating IS NOT NULL
    `;

    return NextResponse.json({
      success: true,
      reviews: result.rows,
      average_rating: avgResult.rows[0]?.avg_rating || 0,
      review_count: avgResult.rows[0]?.review_count || 0,
    });
  } catch (error: any) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    );
  }
}
