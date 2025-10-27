'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { TIER_PRICING, type SubscriptionTier } from '@/types/subscription';

export default function PricingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (!isLoaded || !user) {
      router.push('/sign-up');
      return;
    }

    const currentTier = (user.publicMetadata?.tier as SubscriptionTier) || 'free';

    // If selecting free tier or already on this tier
    if (tier === 'free') {
      router.push('/discover');
      return;
    }

    if (currentTier === tier) {
      router.push('/dashboard/founder'); // or appropriate dashboard
      return;
    }

    // TODO: Redirect to Stripe checkout
    // For now, just show alert
    alert(`Stripe checkout for ${tier} plan will be implemented here`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">BP</span>
              </div>
              <span className="text-2xl font-bold text-black tracking-tight">
                BuyersPlace
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href="/dashboard/founder"
                  className="text-gray-600 hover:text-black font-medium transition px-4 py-2"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-gray-600 hover:text-black font-medium transition px-4 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-md font-semibold transition"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-black mb-4 tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your needs. Start free, upgrade anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier - Early Adopter */}
          <div className="border-2 border-gray-200 rounded-lg p-8 bg-white hover:border-gray-400 transition">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mb-4">
                <span className="text-2xl">△</span>
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">
                {TIER_PRICING.free.name}
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                {TIER_PRICING.free.description}
              </p>
              <div className="mb-6">
                <div className="text-5xl font-bold text-black">
                  ${TIER_PRICING.free.price}
                </div>
                <div className="text-gray-500 text-sm">Forever free</div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('free')}
              className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-semibold py-3 rounded-md transition mb-6"
            >
              {TIER_PRICING.free.cta}
            </button>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-black mb-3">
                What's included:
              </div>
              {TIER_PRICING.free.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg
                    className="w-5 h-5 text-black flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Founder Tier - $10/month */}
          <div className="border-2 border-black rounded-lg p-8 bg-gray-50 relative shadow-lg">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-sm font-semibold">
              Popular
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center mb-4">
                <span className="text-2xl text-white">→</span>
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">
                {TIER_PRICING.founder.name}
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                {TIER_PRICING.founder.description}
              </p>
              <div className="mb-6">
                <div className="text-5xl font-bold text-black">
                  ${TIER_PRICING.founder.price}
                </div>
                <div className="text-gray-500 text-sm">per month</div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('founder')}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-md transition mb-6"
            >
              {TIER_PRICING.founder.cta}
            </button>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-black mb-3">
                Everything in Free, plus:
              </div>
              {TIER_PRICING.founder.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg
                    className="w-5 h-5 text-black flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Investor Tier - $40/month */}
          <div className="border-2 border-gray-200 rounded-lg p-8 bg-white hover:border-gray-400 transition">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mb-4">
                <span className="text-2xl">○</span>
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">
                {TIER_PRICING.investor.name}
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                {TIER_PRICING.investor.description}
              </p>
              <div className="mb-6">
                <div className="text-5xl font-bold text-black">
                  ${TIER_PRICING.investor.price}
                </div>
                <div className="text-gray-500 text-sm">per month</div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('investor')}
              className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-semibold py-3 rounded-md transition mb-6"
            >
              {TIER_PRICING.investor.cta}
            </button>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-black mb-3">
                Premium features:
              </div>
              {TIER_PRICING.investor.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg
                    className="w-5 h-5 text-black flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-black mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-black mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards through Stripe. Your payment information is secure and encrypted.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-black mb-2">
                Is there a long-term contract?
              </h3>
              <p className="text-gray-600 text-sm">
                No contracts! All plans are month-to-month and you can cancel anytime with no penalties.
              </p>
            </div>
            <div className="pb-6">
              <h3 className="font-semibold text-black mb-2">
                What happens if I cancel?
              </h3>
              <p className="text-gray-600 text-sm">
                You'll retain access to your paid features until the end of your billing period. After that, you'll be moved to the free tier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
