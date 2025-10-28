import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import { getUserByClerkId } from '@/lib/db';

// POST - Send a new message
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
    const { recipient_id, message_text, product_id } = body;

    if (!recipient_id || !message_text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert message
    const result = await sql`
      INSERT INTO messages (sender_id, recipient_id, message_text, product_id)
      VALUES (${user.id}, ${recipient_id}, ${message_text}, ${product_id || null})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: result.rows[0],
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch conversations or messages
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

    const { searchParams } = new URL(request.url);
    const conversationWith = searchParams.get('conversation_with');

    if (conversationWith) {
      // Get messages in a specific conversation
      const result = await sql`
        SELECT
          m.*,
          sender.profile->>'name' as sender_name,
          sender.profile->>'avatar' as sender_avatar,
          recipient.profile->>'name' as recipient_name,
          recipient.profile->>'avatar' as recipient_avatar
        FROM messages m
        JOIN users sender ON m.sender_id = sender.id
        JOIN users recipient ON m.recipient_id = recipient.id
        WHERE
          (m.sender_id = ${user.id} AND m.recipient_id = ${conversationWith})
          OR
          (m.sender_id = ${conversationWith} AND m.recipient_id = ${user.id})
        ORDER BY m.created_at ASC
      `;

      // Mark messages as read
      await sql`
        UPDATE messages
        SET is_read = TRUE
        WHERE recipient_id = ${user.id} AND sender_id = ${conversationWith} AND is_read = FALSE
      `;

      return NextResponse.json({
        success: true,
        messages: result.rows,
      });
    } else {
      // Get all conversations (list of people user has messaged with)
      const result = await sql`
        SELECT DISTINCT ON (other_user_id)
          other_user_id,
          other_user_name,
          other_user_avatar,
          last_message,
          last_message_time,
          unread_count,
          product_id
        FROM (
          SELECT
            CASE
              WHEN m.sender_id = ${user.id} THEN m.recipient_id
              ELSE m.sender_id
            END as other_user_id,
            CASE
              WHEN m.sender_id = ${user.id} THEN recipient.profile->>'name'
              ELSE sender.profile->>'name'
            END as other_user_name,
            CASE
              WHEN m.sender_id = ${user.id} THEN recipient.profile->>'avatar'
              ELSE sender.profile->>'avatar'
            END as other_user_avatar,
            m.message_text as last_message,
            m.created_at as last_message_time,
            m.product_id,
            (
              SELECT COUNT(*)::INT
              FROM messages
              WHERE recipient_id = ${user.id}
                AND sender_id = CASE
                  WHEN m.sender_id = ${user.id} THEN m.recipient_id
                  ELSE m.sender_id
                END
                AND is_read = FALSE
            ) as unread_count
          FROM messages m
          JOIN users sender ON m.sender_id = sender.id
          JOIN users recipient ON m.recipient_id = recipient.id
          WHERE m.sender_id = ${user.id} OR m.recipient_id = ${user.id}
          ORDER BY m.created_at DESC
        ) conversations
        ORDER BY other_user_id, last_message_time DESC
      `;

      return NextResponse.json({
        success: true,
        conversations: result.rows,
      });
    }
  } catch (error: any) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    );
  }
}
