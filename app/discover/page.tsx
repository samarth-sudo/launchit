'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ProductSwiper from '@/components/ProductSwiper';
import PaywallModal from '@/components/PaywallModal';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import type { ProductWithAIInsights } from '@/types/database';
import type { SubscriptionTier } from '@/types/subscription';

export default function DiscoverPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithAIInsights[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  // Check if user has investor tier access
  const aiMatchGate = useFeatureGate('investor');
  const dueDiligenceGate = useFeatureGate('investor');
  const advancedFiltersGate = useFeatureGate('investor');

  const currentTier = (user?.publicMetadata?.tier as SubscriptionTier) || 'free';

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products/feed');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (
    direction: 'left' | 'right' | 'up',
    product: ProductWithAIInsights
  ) => {
    const action = direction === 'left' ? 'pass' : direction === 'up' ? 'super_like' : 'like';

    try {
      // Track interaction
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          action,
          time_spent_seconds: 30, // TODO: Track actual time
          video_completion_pct: 0.8, // TODO: Track actual completion
          replay_count: 0,
          clicked_founder_profile: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // If it's a match, show notification
        if (data.match) {
          showMatchNotification(product);
        }

        setSwipeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  };

  const showMatchNotification = (product: ProductWithAIInsights) => {
    // TODO: Replace with a proper notification component
    alert(`🎉 It's a match! You and ${product.founder?.profile.name || 'the founder'} are interested in each other.`);
  };

  const handleFeatureClick = (feature: string) => {
    if (currentTier !== 'investor') {
      setPaywallFeature(feature);
      setShowPaywall(true);
    } else {
      // User has access, execute feature
      alert(`${feature} feature coming soon!`);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BP</span>
                </div>
                <span className="text-xl font-bold text-black">BuyersPlace</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Reviewed</p>
                <p className="text-xl font-bold text-black">{swipeCount}</p>
              </div>
              <button
                onClick={() => router.push('/matches')}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition font-medium"
              >
                Matches
              </button>
              <button
                onClick={() => router.push('/dashboard/investor')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-black hover:text-black transition font-medium"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Investor Features Bar */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-3 max-w-6xl mx-auto">
            <button
              onClick={() => handleFeatureClick('AI Match Scoring')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                currentTier === 'investor'
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-black'
              }`}
            >
              {currentTier === 'investor' ? '✓ ' : '🔒 '}AI Match Score
            </button>
            <button
              onClick={() => handleFeatureClick('Due Diligence')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                currentTier === 'investor'
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-black'
              }`}
            >
              {currentTier === 'investor' ? '✓ ' : '🔒 '}Due Diligence
            </button>
            <button
              onClick={() => handleFeatureClick('Purchase Intent Predictions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                currentTier === 'investor'
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-black'
              }`}
            >
              {currentTier === 'investor' ? '✓ ' : '🔒 '}Purchase Intent
            </button>
            <button
              onClick={() => handleFeatureClick('Advanced Filters')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                currentTier === 'investor'
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-black'
              }`}
            >
              {currentTier === 'investor' ? '✓ ' : '🔒 '}Advanced Filters
            </button>
            {currentTier !== 'investor' && (
              <button
                onClick={() => router.push('/pricing')}
                className="ml-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition text-sm font-medium"
              >
                Upgrade to Investor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {products.length === 0 && !loading ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📭</span>
              </div>
              <h2 className="text-2xl font-bold text-black mb-2 tracking-tight">
                No products available
              </h2>
              <p className="text-gray-600">
                Check back later for new startups to discover!
              </p>
            </div>
          ) : (
            <ProductSwiper
              products={products}
              onSwipe={handleSwipe}
              onCardLeftScreen={(product) => {
                console.log('Card left screen:', product.id);
              }}
            />
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="font-semibold text-lg mb-4 text-black">
              How it works
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">←</span>
                </div>
                <p className="font-medium text-sm text-black">Pass</p>
                <p className="text-xs text-gray-600 mt-1">Not interested right now</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-white">↑</span>
                </div>
                <p className="font-medium text-sm text-black">Super Like</p>
                <p className="text-xs text-gray-600 mt-1">Very interested, priority match</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">→</span>
                </div>
                <p className="font-medium text-sm text-black">Like</p>
                <p className="text-xs text-gray-600 mt-1">Interested in learning more</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        requiredTier="investor"
        feature={paywallFeature}
        currentTier={currentTier}
      />
    </div>
  );
}
