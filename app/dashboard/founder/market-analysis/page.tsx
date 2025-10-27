'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import type { MarketAnalysisResult } from '@/types/database';

export default function MarketAnalysisPage() {
  const { userId } = useAuth();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePoint, setPricePoint] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [results, setResults] = useState<Partial<MarketAnalysisResult> | null>(null);
  const [error, setError] = useState('');

  const loadingMessages = [
    'Analyzing market demographics...',
    'Calculating market size...',
    'Identifying competitors...',
    'Generating GTM strategies...',
    'Building comprehensive analysis...',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingMessage(loadingMessages[0]);

    // Cycle through loading messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 2500);

    try {
      const response = await fetch('/api/market-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          description,
          pricePoint,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResults(data);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze market. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      clearInterval(messageInterval);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md fixed w-full z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/founder" className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StartupSwipe
              </span>
            </Link>
            <Link
              href="/dashboard/founder"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <span>💡</span>
            <span>Powered by BuyerIQ</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Market Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get AI-powered insights on who will buy your product. Discover demographics,
            market sizing, and go-to-market strategies in minutes.
          </p>
        </div>

        {/* Analysis Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., StartupSwipe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Description
                  <span className="text-gray-500 font-normal ml-2">
                    ({description.length} characters - minimum 100)
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32"
                  placeholder="Describe your product in detail. What problem does it solve? Who is it for? What makes it unique?"
                  required
                  minLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Point
                </label>
                <input
                  type="text"
                  value={pricePoint}
                  onChange={(e) => setPricePoint(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., $29/month or Free with $29 synthetic test"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {loadingMessage}
                  </span>
                ) : (
                  'Analyze Market →'
                )}
              </button>
            </form>

            {loading && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-700 text-center font-medium">
                  This typically takes 30-60 seconds. Claude AI is analyzing 100+ demographic segments...
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          {results && (
            <div id="results" className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {results.executive_summary}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-600">Confidence Score:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-xs">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                      style={{ width: `${results.confidence_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-blue-600">{results.confidence_score}%</span>
                </div>
              </div>

              {/* Critical Insights */}
              {results.critical_insights && results.critical_insights.length > 0 && (
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                  <h2 className="text-2xl font-bold mb-4">Critical Insights</h2>
                  <ul className="space-y-3">
                    {results.critical_insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <span className="text-lg">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Market Sizing */}
              {results.market_sizing && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Sizing</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <div className="text-sm font-semibold text-blue-600 mb-2">TAM</div>
                      <div className="text-3xl font-bold text-blue-900">
                        ${(results.market_sizing.tam / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-blue-700 mt-1">Total Addressable Market</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6">
                      <div className="text-sm font-semibold text-purple-600 mb-2">SAM</div>
                      <div className="text-3xl font-bold text-purple-900">
                        ${(results.market_sizing.sam / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-purple-700 mt-1">Serviceable Addressable Market</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6">
                      <div className="text-sm font-semibold text-green-600 mb-2">SOM</div>
                      <div className="text-3xl font-bold text-green-900">
                        ${(results.market_sizing.som / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-green-700 mt-1">Serviceable Obtainable Market</div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Methodology</h3>
                    <p className="text-gray-700">{results.market_sizing.methodology}</p>
                  </div>
                </div>
              )}

              {/* Demographics */}
              {results.demographics && results.demographics.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Demographic Segments</h2>
                  <div className="space-y-6">
                    {results.demographics.slice(0, 5).map((segment, idx) => (
                      <div key={idx} className="border-l-4 border-purple-500 pl-6 py-4 bg-gray-50 rounded-r-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{segment.name}</h3>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                            {segment.purchase_intent}% intent
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          {segment.age_range} • {segment.gender} • {segment.population_percentage}% of market
                        </div>
                        <p className="text-gray-700 mb-3">{segment.psychographic_profile}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-600 mb-1">Key Motivations</div>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {segment.motivations.map((mot, i) => (
                                <li key={i}>• {mot}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-600 mb-1">Pain Points</div>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {segment.pain_points.map((pain, i) => (
                                <li key={i}>• {pain}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GTM Strategies */}
              {results.gtm_strategies && results.gtm_strategies.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Go-to-Market Strategies</h2>
                  <div className="space-y-4">
                    {results.gtm_strategies.map((strategy, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900">{strategy.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              strategy.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : strategy.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {strategy.priority} priority
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{strategy.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-gray-600">Channels:</span>
                            <span className="text-gray-700 ml-2">{strategy.channels.join(', ')}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-600">Timeline:</span>
                            <span className="text-gray-700 ml-2">{strategy.expected_timeline}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-600">Cost:</span>
                            <span className="text-gray-700 ml-2">{strategy.estimated_cost}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real Talk Summary */}
              {results.real_talk_summary && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-8 text-white">
                  <h2 className="text-2xl font-bold mb-4">Real Talk</h2>
                  <p className="text-lg leading-relaxed opacity-90">{results.real_talk_summary}</p>
                </div>
              )}

              {/* Analysis Details */}
              <div className="bg-gray-50 rounded-2xl p-6 text-center text-sm text-gray-600">
                <p>
                  Analysis completed in {((results.processing_time_ms || 0) / 1000).toFixed(1)}s
                  {results.token_count && ` • ${results.token_count.toLocaleString()} tokens processed`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
