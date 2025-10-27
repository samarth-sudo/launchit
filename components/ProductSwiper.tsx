'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import type { ProductWithAIInsights } from '@/types/database';

interface ProductSwiperProps {
  products: ProductWithAIInsights[];
  onSwipe: (direction: 'left' | 'right' | 'up', product: ProductWithAIInsights) => Promise<void>;
  onCardLeftScreen?: (product: ProductWithAIInsights) => void;
}

export default function ProductSwiper({ products, onSwipe, onCardLeftScreen }: ProductSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (swiping) return;

      if (e.key === 'ArrowLeft') {
        await handleSwipeAction('left');
      } else if (e.key === 'ArrowRight') {
        await handleSwipeAction('right');
      } else if (e.key === 'ArrowUp') {
        await handleSwipeAction('up');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, swiping]);

  const handleSwipeAction = async (direction: 'left' | 'right' | 'up') => {
    if (currentIndex >= products.length || swiping) return;

    setSwiping(true);
    setExitDirection(direction);
    const product = products[currentIndex];

    try {
      await onSwipe(direction, product);

      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setExitDirection(null);
        setSwiping(false);
        x.set(0);
        y.set(0);

        if (onCardLeftScreen) {
          onCardLeftScreen(product);
        }
      }, 300);
    } catch (error) {
      console.error('Swipe error:', error);
      setExitDirection(null);
      setSwiping(false);
      x.set(0);
      y.set(0);
    }
  };

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const swipeThreshold = 100;
    const swipeVelocity = 500;

    // Check for swipe up (super like)
    if (info.offset.y < -swipeThreshold || info.velocity.y < -swipeVelocity) {
      await handleSwipeAction('up');
    }
    // Check for swipe right (like)
    else if (info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity) {
      await handleSwipeAction('right');
    }
    // Check for swipe left (pass)
    else if (info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity) {
      await handleSwipeAction('left');
    }
    // Return to center if not enough force
    else {
      x.set(0);
      y.set(0);
    }
  };

  if (currentIndex >= products.length) {
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

  const currentProduct = products[currentIndex];
  const nextProduct = products[currentIndex + 1];

  const getExitX = () => {
    if (exitDirection === 'left') return -500;
    if (exitDirection === 'right') return 500;
    return 0;
  };

  const getExitY = () => {
    if (exitDirection === 'up') return -500;
    return 0;
  };

  return (
    <div className="relative w-full h-[600px]">
      {/* Next card (shows underneath) */}
      {nextProduct && (
        <div className="absolute inset-0 w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-[600px] scale-95 opacity-80">
            <ProductCard product={nextProduct} />
          </div>
        </div>
      )}

      {/* Current card (draggable) */}
      <motion.div
        className="absolute inset-0 w-full cursor-grab active:cursor-grabbing"
        style={{ x, y, rotate, opacity }}
        drag={!swiping}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={1}
        onDragEnd={handleDragEnd}
        animate={exitDirection ? {
          x: getExitX(),
          y: getExitY(),
          opacity: 0,
          transition: { duration: 0.3 }
        } : {}}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-[600px]">
          <ProductCard product={currentProduct} />
        </div>
      </motion.div>

      {/* Swipe indicator overlays */}
      <motion.div
        className="absolute top-12 left-12 bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-2xl rotate-[-20deg] border-4 border-red-500 pointer-events-none"
        style={{ opacity: useTransform(x, [-200, -50, 0], [1, 0.5, 0]) }}
      >
        PASS
      </motion.div>
      <motion.div
        className="absolute top-12 right-12 bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-2xl rotate-[20deg] border-4 border-green-500 pointer-events-none"
        style={{ opacity: useTransform(x, [0, 50, 200], [0, 0.5, 1]) }}
      >
        LIKE
      </motion.div>
      <motion.div
        className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-6 py-3 rounded-lg font-bold text-2xl border-4 border-purple-500 pointer-events-none"
        style={{ opacity: useTransform(y, [-200, -50, 0], [1, 0.5, 0]) }}
      >
        SUPER LIKE
      </motion.div>

      {/* Swipe Buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        <button
          onClick={() => handleSwipeAction('left')}
          disabled={swiping}
          className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Pass (Left Arrow)"
        >
          <span className="text-2xl">✖️</span>
        </button>

        <button
          onClick={() => handleSwipeAction('up')}
          disabled={swiping}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg flex items-center justify-center hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Super Like (Up Arrow)"
        >
          <span className="text-2xl">⭐</span>
        </button>

        <button
          onClick={() => handleSwipeAction('right')}
          disabled={swiping}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 shadow-lg flex items-center justify-center hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Like (Right Arrow)"
        >
          <span className="text-2xl">❤️</span>
        </button>
      </div>

      {/* Keyboard Hint */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg z-10">
        ← Pass | ↑ Super Like | → Like
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ProductWithAIInsights }) {
  return (
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
  );
}
