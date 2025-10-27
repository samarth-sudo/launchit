'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ProductSwiper from '@/components/ProductSwiper';
import type { ProductWithAIInsights } from '@/types/database';

export default function EarlyAdopterDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithAIInsights[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchMatches();
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch products matched to user's demographic profile
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

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
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
          time_spent_seconds: 30,
          video_completion_pct: 0.8,
          replay_count: 0,
          clicked_founder_profile: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // If it's a match, show notification
        if (data.match) {
          showMatchNotification(product);
          setMatches(prev => prev + 1);
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
              <button
                onClick={() => router.push('/matches')}
                className="relative px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition font-medium"
              >
                Matches
                {matches > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-black">
                    {matches}
                  </span>
                )}
              </button>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold text-black tracking-tight">
                Discover Products
              </h1>
              <p className="text-sm text-gray-600">
                Matched to your interests and profile
              </p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-black">{swipeCount}</p>
                <p className="text-sm text-gray-600">Reviewed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-black">{matches}</p>
                <p className="text-sm text-gray-600">Matches</p>
              </div>
            </div>
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
                Check back later for new startups matched to your profile!
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

        {/* Early Adopter Benefits */}
        <div className="mt-6 max-w-2xl mx-auto">
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-white">△</span>
              </div>
              <div>
                <h4 className="font-semibold text-black mb-1">
                  Early Adopter Benefits
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Get exclusive access to innovative products matched to your profile
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Personalized product recommendations</li>
                  <li>• Direct connection with founders</li>
                  <li>• Early access to new products</li>
                  <li>• Free forever</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
