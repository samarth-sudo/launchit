import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';

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
    const { investor_id, preferred_categories, preferred_stages, investment_range } = body;

    // Create or update investor preferences
    const result = await sql`
      INSERT INTO investor_preferences (
        investor_id, preferred_categories, preferred_stages, investment_range
      )
      VALUES (
        ${investor_id},
        ${JSON.stringify(preferred_categories)}::jsonb::text[],
        ${JSON.stringify(preferred_stages)}::jsonb::text[],
        ${JSON.stringify(investment_range)}
      )
      ON CONFLICT (investor_id)
      DO UPDATE SET
        preferred_categories = ${JSON.stringify(preferred_categories)}::jsonb::text[],
        preferred_stages = ${JSON.stringify(preferred_stages)}::jsonb::text[],
        investment_range = ${JSON.stringify(investment_range)},
        updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      preferences: result.rows[0],
    });
  } catch (error: any) {
    console.error('Preferences error:', error);

    return NextResponse.json(
      { error: 'Failed to save preferences', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's clerk_id to find their preferences
    const userResult = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const investorId = userResult.rows[0].id;

    // Get preferences
    const prefsResult = await sql`
      SELECT * FROM investor_preferences WHERE investor_id = ${investorId}
    `;

    if (prefsResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Preferences not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: prefsResult.rows[0],
    });
  } catch (error: any) {
    console.error('Preferences fetch error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch preferences', details: error.message },
      { status: 500 }
    );
  }
}
