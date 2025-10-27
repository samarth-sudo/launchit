'use client';

import { useRouter } from 'next/navigation';
import type { SubscriptionTier } from '@/types/subscription';
import { TIER_PRICING } from '@/types/subscription';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: SubscriptionTier;
  feature: string;
  currentTier: SubscriptionTier;
}

export default function PaywallModal({
  isOpen,
  onClose,
  requiredTier,
  feature,
  currentTier
}: PaywallModalProps) {
  const router = useRouter();
  const tierInfo = TIER_PRICING[requiredTier];

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg max-w-md w-full p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-white">🔒</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-black mb-2 text-center tracking-tight">
          Upgrade to {tierInfo.name}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          This feature requires a {tierInfo.name} subscription
        </p>

        {/* Current vs Required */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Current plan:</span>
            <span className="text-sm font-semibold text-black">
              {TIER_PRICING[currentTier].name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Required plan:</span>
            <span className="text-sm font-semibold text-black">
              {tierInfo.name}
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-black mb-1">
            ${tierInfo.price}
            <span className="text-lg text-gray-500">/month</span>
          </div>
          <p className="text-sm text-gray-600">{tierInfo.description}</p>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-black mb-3">What's included:</h3>
          <ul className="space-y-2">
            {tierInfo.features.slice(0, 4).map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-black mt-0.5">•</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpgrade}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-md transition"
          >
            Upgrade Now
          </button>
          <button
            onClick={onClose}
            className="w-full border border-gray-300 hover:border-black text-gray-700 hover:text-black font-medium py-3 rounded-md transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
