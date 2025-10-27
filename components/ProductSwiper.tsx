'use client';

import { useState, useEffect, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductWithAIInsights } from '@/types/database';

interface ProductSwiperProps {
  products: ProductWithAIInsights[];
  onSwipe: (direction: 'left' | 'right' | 'up', product: ProductWithAIInsights) => Promise<void>;
  onCardLeftScreen?: (product: ProductWithAIInsights) => void;
}

export default function ProductSwiper({ products, onSwipe, onCardLeftScreen }: ProductSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(products.length - 1);
  const [swiping, setSwiping] = useState(false);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (swiping) return;

      if (e.key === 'ArrowLeft') {
        handleSwipeAction('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipeAction('right');
      } else if (e.key === 'ArrowUp') {
        handleSwipeAction('up');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, swiping]);

  const handleSwipeAction = async (direction: 'left' | 'right' | 'up') => {
    if (currentIndex < 0 || currentIndex >= products.length) return;

    setSwiping(true);
    const product = products[currentIndex];

    try {
      await onSwipe(direction, product);
      setCurrentIndex(prev => prev - 1);
    } catch (error) {
      console.error('Swipe error:', error);
    } finally {
      setSwiping(false);
    }
  };

  const onCardLeftScreenHandler = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && onCardLeftScreen) {
      onCardLeftScreen(product);
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
          <p className="text-gray-600">Check back later for new products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      {/* Cards */}
      <div className="absolute inset-0">
        {products.map((product, index) => (
          <TinderCard
            key={product.id}
            onSwipe={async (dir) => {
              if (dir === 'left' || dir === 'right' || dir === 'up') {
                await onSwipe(dir, product);
              }
            }}
            onCardLeftScreen={() => onCardLeftScreenHandler(product.id)}
            preventSwipe={['down']}
            className="absolute w-full"
            swipeRequirementType="position"
            swipeThreshold={100}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{
                scale: index === currentIndex ? 1 : 0.95,
                opacity: index === currentIndex ? 1 : 0.8,
                zIndex: products.length - index,
              }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden h-[600px]"
            >
              <div className="grid md:grid-cols-5 gap-0 h-full">
                {/* Video Section - 60% width on desktop */}
                <div className="col-span-1 md:col-span-3 relative bg-black">
                  {product.demo_video?.url ? (
                    <video
                      src={product.demo_video.url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-white text-6xl">🎥</div>
                    </div>
                  )}

                  {/* Product Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                          {product.title}
                        </h2>
                        <p className="text-sm md:text-base text-gray-200 mb-3">
                          {product.description_7words}
                        </p>
                      </div>
                    </div>

                    {/* Category & Tags */}
                    <div className="flex flex-wrap gap-2">
                      {product.category && (
                        <span className="px-3 py-1 bg-blue-600/80 backdrop-blur-sm text-white text-xs rounded-full">
                          {product.category}
                        </span>
                      )}
                      {product.tags?.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Insights Panel - 40% width on desktop */}
                <div className="col-span-1 md:col-span-2 p-6 overflow-y-auto bg-gray-50">
                  {/* AI Match Score */}
                  {product.ai_match_score && (
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">AI Match Score</span>
                        <span className="text-3xl font-bold text-blue-600">
                          {product.ai_match_score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            product.ai_match_score > 75
                              ? 'bg-green-500'
                              : product.ai_match_score > 50
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }`}
                          style={{ width: `${product.ai_match_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* AI Insight */}
                  {product.ai_insight && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-sm mb-2 text-gray-900">AI Analysis</h3>
                      <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-lg">
                        {product.ai_insight}
                      </p>
                    </div>
                  )}

                  {/* Market Info */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-sm mb-3 text-gray-900">Market Context</h3>
                    <div className="space-y-2">
                      {product.market_size && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Est. Market Size</span>
                          <span className="font-medium">${product.market_size}</span>
                        </div>
                      )}
                      {product.competitors_count && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Known Competitors</span>
                          <span className="font-medium">{product.competitors_count}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-sm mb-2 text-gray-900">Investment</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-blue-900">
                        ${product.pricing.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 capitalize">
                        {product.pricing.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Founder Info */}
                  {product.founder && (
                    <div className="bg-white p-4 rounded-lg">
                      <h3 className="font-semibold text-sm mb-3 text-gray-900">Founder</h3>
                      <div className="flex items-center gap-3">
                        {product.founder.profile.avatar && (
                          <img
                            src={product.founder.profile.avatar}
                            alt={product.founder.profile.name || 'Founder'}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.founder.profile.name || 'Anonymous'}
                          </p>
                          {product.founder.profile.company && (
                            <p className="text-xs text-gray-600">
                              {product.founder.profile.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </TinderCard>
        ))}
      </div>

      {/* Swipe Buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        <button
          onClick={() => handleSwipeAction('left')}
          disabled={swiping || currentIndex < 0}
          className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Pass (Left Arrow)"
        >
          <span className="text-2xl">✖️</span>
        </button>

        <button
          onClick={() => handleSwipeAction('up')}
          disabled={swiping || currentIndex < 0}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg flex items-center justify-center hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Super Like (Up Arrow)"
        >
          <span className="text-2xl">⭐</span>
        </button>

        <button
          onClick={() => handleSwipeAction('right')}
          disabled={swiping || currentIndex < 0}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 shadow-lg flex items-center justify-center hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Like (Right Arrow)"
        >
          <span className="text-2xl">❤️</span>
        </button>
      </div>

      {/* Keyboard Hint */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg">
        ← Pass | ↑ Super Like | → Like
      </div>
    </div>
  );
}
