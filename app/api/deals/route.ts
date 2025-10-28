import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import { getUserByClerkId } from '@/lib/db';

// Mark a deal as done
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

    // Only investors can mark deals
    if (user.user_type !== 'investor') {
      return NextResponse.json(
        { error: 'Only investors can mark deals' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { product_id, deal_amount } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    // Check if interaction exists
    const existingInteraction = await sql`
      SELECT id FROM interactions
      WHERE investor_id = ${user.id} AND product_id = ${product_id}
    `;

    if (existingInteraction.rows.length > 0) {
      // Update existing interaction
      const result = await sql`
        UPDATE interactions
        SET
          deal_done = TRUE,
          deal_amount = ${deal_amount || null},
          deal_closed_at = NOW()
        WHERE id = ${existingInteraction.rows[0].id}
        RETURNING *
      `;

      // Update investor's reputation (bonus for closing deals)
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/reputation/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      return NextResponse.json({
        success: true,
        deal: result.rows[0],
      });
    } else {
      // Create new interaction with deal
      const result = await sql`
        INSERT INTO interactions (
          investor_id, product_id, action, deal_done, deal_amount, deal_closed_at
        )
        VALUES (
          ${user.id}, ${product_id}, 'like', TRUE, ${deal_amount || null}, NOW()
        )
        RETURNING *
      `;

      // Update investor's reputation
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/reputation/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      return NextResponse.json({
        success: true,
        deal: result.rows[0],
      });
    }
  } catch (error: any) {
    console.error('Deal marking error:', error);
    return NextResponse.json(
      { error: 'Failed to mark deal', details: error.message },
      { status: 500 }
    );
  }
}

// Get all deals for current user (investor)
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

    const result = await sql`
      SELECT
        i.*,
        p.title,
        p.description_7words,
        p.category,
        p.demo_video,
        u.profile->>'name' as founder_name,
        u.profile->>'avatar' as founder_avatar
      FROM interactions i
      JOIN products p ON i.product_id = p.id
      JOIN users u ON p.founder_id = u.id
      WHERE i.investor_id = ${user.id}
        AND i.deal_done = TRUE
      ORDER BY i.deal_closed_at DESC
    `;

    return NextResponse.json({
      success: true,
      deals: result.rows,
    });
  } catch (error: any) {
    console.error('Fetch deals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals', details: error.message },
      { status: 500 }
    );
  }
}

// Delete/unmark a deal
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    // Unmark the deal
    await sql`
      UPDATE interactions
      SET
        deal_done = FALSE,
        deal_amount = NULL,
        deal_closed_at = NULL
      WHERE investor_id = ${user.id} AND product_id = ${productId}
    `;

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Unmark deal error:', error);
    return NextResponse.json(
      { error: 'Failed to unmark deal', details: error.message },
      { status: 500 }
    );
  }
}
