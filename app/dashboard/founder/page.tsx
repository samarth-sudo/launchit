'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import PaywallModal from '@/components/PaywallModal';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import type { Product } from '@/types/database';
import type { SubscriptionTier } from '@/types/subscription';

export default function FounderDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  // Check if user has founder tier access
  const founderGate = useFeatureGate('founder');
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
      const response = await fetch('/api/products/my-products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalViews = products.reduce((sum, p) => sum + (p.view_count || 0), 0);
  const totalLikes = products.reduce((sum, p) => sum + (p.like_count || 0), 0);
  const totalMatches = products.reduce((sum, p) => sum + (p.match_count || 0), 0);

  const handleFeatureClick = (feature: string, action: () => void) => {
    if (currentTier !== 'founder') {
      setPaywallFeature(feature);
      setShowPaywall(true);
    } else {
      action();
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-bold text-black">Founder Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/matches')}
                className="px-4 py-2 border border-gray-300 hover:border-black text-gray-700 hover:text-black rounded-md transition text-sm font-medium"
              >
                Matches
              </button>
              <button
                onClick={() => handleFeatureClick('Create Product', () => setShowCreateModal(true))}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition text-sm font-medium"
              >
                {currentTier !== 'founder' && '🔒 '}Create Product
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Products</div>
            <div className="text-3xl font-bold text-black">{products.length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Views</div>
            <div className="text-3xl font-bold text-black">{totalViews}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Likes</div>
            <div className="text-3xl font-bold text-black">{totalLikes}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Matches</div>
            <div className="text-3xl font-bold text-black">{totalMatches}</div>
          </div>
        </div>

        {/* BuyerIQ Market Analysis Feature */}
        <div className="mb-8 bg-black rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-md text-xs font-medium">
                  BuyerIQ
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2 tracking-tight">AI Market Analysis</h2>
              <p className="text-gray-400 mb-4 max-w-2xl text-sm">
                Get deep insights on who will buy your product. Discover demographics,
                market sizing (TAM/SAM/SOM), competitor analysis, and GTM strategies.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span>100+ Demographic Segments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span>Market Sizing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span>Competitor Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span>GTM Strategies</span>
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={() => handleFeatureClick('Market Analysis', () => router.push('/dashboard/founder/market-analysis'))}
                className="px-6 py-3 bg-white text-black rounded-md font-semibold hover:bg-gray-100 transition text-sm"
              >
                {currentTier !== 'founder' && '🔒 '}Analyze Market →
              </button>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-black">Your Products</h2>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">Create your first product to get started</p>
              <button
                onClick={() => handleFeatureClick('Create Product', () => setShowCreateModal(true))}
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition font-semibold"
              >
                {currentTier !== 'founder' && '🔒 '}Create Your First Product
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {products.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {product.description_7words}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>👁️ {product.view_count || 0} views</span>
                        <span>❤️ {product.like_count || 0} likes</span>
                        <span>🤝 {product.match_count || 0} matches</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'funded' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFeatureClick('AI Synthetic Testing', () => router.push(`/products/${product.id}/test`))}
                        className="px-3 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition font-medium"
                      >
                        {currentTier !== 'founder' && '🔒 '}Run AI Test ($29)
                      </button>
                      <button
                        onClick={() => handleFeatureClick('Product Analytics', () => router.push(`/products/${product.id}/analytics`))}
                        className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:border-black hover:text-black transition font-medium"
                      >
                        {currentTier !== 'founder' && '🔒 '}Analytics
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchProducts();
          }}
        />
      )}

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        requiredTier="founder"
        feature={paywallFeature}
        currentTier={currentTier}
      />
    </div>
  );
}

// Create Product Modal Component
function CreateProductModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description_7words: '',
    full_description: '',
    demo_video_url: '',
    pricing_amount: '',
    pricing_type: 'equity' as const,
    category: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description_7words: formData.description_7words,
          full_description: formData.full_description,
          demo_video: {
            url: formData.demo_video_url,
            duration: 90,
            thumbnail: '',
            cloudinary_id: '',
          },
          pricing: {
            amount: parseFloat(formData.pricing_amount),
            currency: 'USD',
            type: formData.pricing_type,
          },
          category: formData.category,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        alert('Product created successfully!');
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Title *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="AI Copilot for Developers"
            />
          </div>

          {/* 7-word pitch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              7-Word Pitch *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.description_7words}
              onChange={(e) => setFormData({ ...formData, description_7words: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Code faster with AI pair programming"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description_7words.split(' ').filter(Boolean).length} words
            </p>
          </div>

          {/* Full description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Description
            </label>
            <textarea
              rows={4}
              value={formData.full_description}
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell investors more about your product..."
            />
          </div>

          {/* Demo video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demo Video URL *
            </label>
            <input
              type="url"
              required
              value={formData.demo_video_url}
              onChange={(e) => setFormData({ ...formData, demo_video_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/demo.mp4"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max 90 seconds. Use Cloudinary or similar for hosting.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              <option value="AI Tools">AI Tools</option>
              <option value="SaaS">SaaS</option>
              <option value="Fintech">Fintech</option>
              <option value="Healthcare">Healthcare</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Developer Tools">Developer Tools</option>
              <option value="Consumer">Consumer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ai, productivity, developer-tools"
            />
          </div>

          {/* Pricing */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (USD) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.pricing_amount}
                onChange={(e) => setFormData({ ...formData, pricing_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="150000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Type *
              </label>
              <select
                required
                value={formData.pricing_type}
                onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="equity">Equity Investment</option>
                <option value="one_time">One-time Purchase</option>
                <option value="subscription">Subscription</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
