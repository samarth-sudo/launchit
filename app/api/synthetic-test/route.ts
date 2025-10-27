import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, getProductById, createSyntheticTest } from '@/lib/db';
import {
  generateSyntheticPersonas,
  syntheticPersonaEvaluate,
  analyzeSyntheticTestResults,
} from '@/lib/claude';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.user_type !== 'founder') {
      return NextResponse.json(
        { error: 'Only founders can run synthetic tests' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { product_id, persona_count = 100 } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    // Get product
    const product = await getProductById(product_id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Verify product belongs to user
    if (product.founder_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to test this product' },
        { status: 403 }
      );
    }

    // Step 1: Generate synthetic investor personas
    console.log(`Generating ${persona_count} synthetic personas...`);
    const personas = await generateSyntheticPersonas(persona_count);

    // Step 2: Each persona evaluates the product
    console.log('Running persona evaluations...');
    const personaResponses = await Promise.all(
      personas.map(async (persona) => {
        try {
          return await syntheticPersonaEvaluate(persona, product);
        } catch (error) {
          console.error(`Error evaluating with persona ${persona.name}:`, error);
          // Return a default response on error
          return {
            persona,
            decision: 'pass' as const,
            reasoning: 'Evaluation failed',
            interest_score: 0,
            concerns: ['Evaluation error'],
            suggestions: [],
          };
        }
      })
    );

    // Step 3: Analyze results
    console.log('Analyzing results...');
    const results = await analyzeSyntheticTestResults(personaResponses, product);

    // Calculate processing time
    const processingTimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    // Step 4: Save to database
    const test = await createSyntheticTest({
      product_id,
      founder_id: user.id,
      persona_count,
      synthetic_personas: personas,
      results: {
        ...results,
        persona_responses: personaResponses,
      },
      processing_time_seconds: processingTimeSeconds,
      // TODO: Add Stripe payment intent ID
    });

    return NextResponse.json({
      success: true,
      test,
      message: 'Test completed successfully',
      processing_time_seconds: processingTimeSeconds,
    });
  } catch (error: any) {
    console.error('Synthetic test error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run synthetic test',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
