import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, createProduct } from '@/lib/db';
import { generateProductSummary } from '@/lib/claude';

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

    if (user.user_type !== 'founder') {
      return NextResponse.json(
        { error: 'Only founders can create products' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description_7words,
      full_description,
      demo_video,
      pricing,
      category,
      tags,
    } = body;

    // Validate required fields
    if (!title || !description_7words || !demo_video || !pricing || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate 7-word pitch (allow some flexibility: 5-10 words)
    const wordCount = description_7words.split(' ').filter(Boolean).length;
    if (wordCount < 5 || wordCount > 10) {
      return NextResponse.json(
        { error: 'Pitch should be 5-10 words' },
        { status: 400 }
      );
    }

    // Generate AI summary using Claude
    let ai_generated_summary = null;
    try {
      ai_generated_summary = await generateProductSummary(
        title,
        description_7words,
        demo_video.transcription
      );
    } catch (error) {
      console.error('AI summary generation error:', error);
      // Continue without AI summary
    }

    // Create product in database
    const product = await createProduct({
      founder_id: user.id,
      title,
      description_7words,
      full_description: full_description || undefined,
      demo_video,
      pricing,
      category,
      tags: tags || [],
      ai_generated_summary: ai_generated_summary ?? undefined,
    });

    return NextResponse.json({
      success: true,
      product,
      message: 'Product created successfully',
    });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}
