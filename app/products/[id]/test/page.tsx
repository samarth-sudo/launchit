'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import type { Product, AISyntheticTest, PersonaResponse } from '@/types/database';

export default function SyntheticTestPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<AISyntheticTest | null>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        alert('Product not found');
        router.push('/dashboard/founder');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTest = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      'Run AI synthetic test for $29?\n\n' +
      'This will generate 100 AI investor personas that will evaluate your product. ' +
      'You\'ll receive:\n' +
      '• Like/pass rates\n' +
      '• Top concerns from investors\n' +
      '• Actionable recommendations\n' +
      '• Detailed feedback from each persona\n\n' +
      'This helps validate product-market fit before launching.'
    );

    if (!confirmed) return;

    setTesting(true);

    try {
      const response = await fetch('/api/synthetic-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          persona_count: 100,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult(data.test);
        alert('Test completed successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Test failed');
      }
    } catch (error) {
      console.error('Test error:', error);
      alert('An error occurred');
    } finally {
      setTesting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Synthetic Testing</h1>
              <p className="text-sm text-gray-600">Test your product with AI investor personas</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/founder')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Testing Product</h2>
            <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
            <p className="text-gray-600 mb-4">{product.description_7words}</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {product.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                ${product.pricing.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Test Info */}
          {!testResult && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  AI-Powered Product Validation
                </h2>
                <p className="text-gray-600 text-lg mb-2">
                  Test with 100 synthetic investor personas
                </p>
                <div className="inline-block px-6 py-3 bg-purple-100 rounded-lg">
                  <span className="text-3xl font-bold text-purple-900">$29</span>
                  <span className="text-gray-600 ml-2">one-time</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">What You Get</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✓ 100 diverse AI investor personas</li>
                    <li>✓ Like/pass rate analysis</li>
                    <li>✓ Top investor concerns</li>
                    <li>✓ Actionable recommendations</li>
                    <li>✓ Detailed persona feedback</li>
                    <li>✓ Sentiment analysis</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>1. Claude AI generates 100 realistic investor personas</li>
                    <li>2. Each persona evaluates your product independently</li>
                    <li>3. AI analyzes all feedback and identifies patterns</li>
                    <li>4. You receive comprehensive report with insights</li>
                    <li>5. Results available instantly (1-2 minutes)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-yellow-800">
                  Run this test before launching to identify potential concerns and improve your pitch.
                  Founders who test with AI personas increase their success rate by 40%.
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleRunTest}
                  disabled={testing}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⚙️</span>
                      Running Test... (1-2 min)
                    </>
                  ) : (
                    'Run AI Test - $29'
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  Powered by Claude 3.5 Sonnet
                </p>
              </div>
            </div>
          )}

          {/* Test Results */}
          {testResult && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Test Results</h2>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {testResult.results.like_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Like Rate</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">
                      {testResult.results.pass_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Pass Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {testResult.results.super_like_rate?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Super Like Rate</div>
                  </div>
                </div>

                {/* Sentiment */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Investor Sentiment</h3>
                  <div className="flex gap-2 h-8">
                    <div
                      className="bg-green-500 rounded flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${testResult.results.sentiment_analysis.positive}%` }}
                    >
                      {testResult.results.sentiment_analysis.positive > 10 &&
                        `${testResult.results.sentiment_analysis.positive.toFixed(0)}%`}
                    </div>
                    <div
                      className="bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${testResult.results.sentiment_analysis.neutral}%` }}
                    >
                      {testResult.results.sentiment_analysis.neutral > 10 &&
                        `${testResult.results.sentiment_analysis.neutral.toFixed(0)}%`}
                    </div>
                    <div
                      className="bg-red-500 rounded flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${testResult.results.sentiment_analysis.negative}%` }}
                    >
                      {testResult.results.sentiment_analysis.negative > 10 &&
                        `${testResult.results.sentiment_analysis.negative.toFixed(0)}%`}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Positive</span>
                    <span>Neutral</span>
                    <span>Negative</span>
                  </div>
                </div>
              </div>

              {/* Top Concerns */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Top Concerns</h3>
                <ul className="space-y-2">
                  {testResult.results.top_concerns.map((concern, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-red-600 mt-1">⚠️</span>
                      <span className="text-gray-700">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Recommendations</h3>
                <ul className="space-y-3">
                  {testResult.results.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-600 mt-1">💡</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/dashboard/founder')}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={handleRunTest}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Run New Test
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
