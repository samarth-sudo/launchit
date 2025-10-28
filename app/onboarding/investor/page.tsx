'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const CATEGORIES = [
  'AI/ML', 'B2B SaaS', 'B2C', 'E-commerce', 'Fintech', 'Healthcare',
  'Education', 'Marketing', 'Developer Tools', 'Productivity',
  'Enterprise Software', 'Consumer Apps', 'IoT', 'Blockchain/Web3',
  'Manufacturing', 'Hardware', 'Climate Tech', 'Other'
];

export default function InvestorOnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [investorType, setInvestorType] = useState<'angel' | 'vc' | 'venture' | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [numInvestments, setNumInvestments] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [minInvestment, setMinInvestment] = useState('');
  const [maxInvestment, setMaxInvestment] = useState('');
  const [stages, setStages] = useState<string[]>([]);

  const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B+', 'Growth'];

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const toggleStage = (stage: string) => {
    if (stages.includes(stage)) {
      setStages(stages.filter(s => s !== stage));
    } else {
      setStages([...stages, stage]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Create user profile
      const response = await fetch('/api/users/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerk_id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          user_type: 'investor',
          profile: {
            name: user.fullName || user.firstName || 'Investor',
            avatar: user.imageUrl,
            investor_type: investorType,
            investment_amount: parseFloat(investmentAmount) || 0,
            num_investments: parseInt(numInvestments) || 0,
          },
        }),
      });

      if (response.ok) {
        const { user: createdUser } = await response.json();

        // Create investor preferences
        const prefsResponse = await fetch('/api/investor-preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            investor_id: createdUser.id,
            preferred_categories: categories,
            preferred_stages: stages,
            investment_range: {
              min: parseFloat(minInvestment) || 0,
              max: parseFloat(maxInvestment) || 1000000
            }
          }),
        });

        if (prefsResponse.ok) {
          router.push('/discover');
        } else {
          // User created but prefs failed - still redirect
          router.push('/discover');
        }
      } else {
        alert('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = investorType !== null;
  const canProceedStep2 = true; // Optional fields
  const canProceedStep3 = categories.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 flex items-center justify-center gap-2">
            Launch it <span className="text-4xl md:text-5xl">▶▶</span>
          </h1>
          <p className="text-gray-600">Investor Onboarding</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-12 max-w-md mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s}
              </div>
              <span className="text-xs mt-2 text-gray-600">
                {s === 1 && 'Type'}
                {s === 2 && 'Track Record'}
                {s === 3 && 'Interests'}
                {s === 4 && 'Range'}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: Investor Type */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Investor Type</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setInvestorType('angel')}
                  className={`p-6 rounded-lg border-2 transition text-center ${
                    investorType === 'angel'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-3">👼</div>
                  <div className="font-semibold text-lg">Angel Investor</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Individual investing personal capital
                  </div>
                </button>

                <button
                  onClick={() => setInvestorType('vc')}
                  className={`p-6 rounded-lg border-2 transition text-center ${
                    investorType === 'vc'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-3">🏢</div>
                  <div className="font-semibold text-lg">VC</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Venture capital firm partner
                  </div>
                </button>

                <button
                  onClick={() => setInvestorType('venture')}
                  className={`p-6 rounded-lg border-2 transition text-center ${
                    investorType === 'venture'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-3">💼</div>
                  <div className="font-semibold text-lg">Venture Investor</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Corporate or institutional investor
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Track Record */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Investment Track Record (Optional)</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Investment Amount ($)
                </label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="500000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Total amount you've invested to date
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Investments Made
                </label>
                <input
                  type="number"
                  value={numInvestments}
                  onChange={(e) => setNumInvestments(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="15"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Number of companies you've invested in
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 This information helps founders understand your experience level and builds trust
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Categories */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Investment Interests</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Categories You're Interested In *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
                        categories.includes(cat)
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {categories.length} categories
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Investment Stages
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => toggleStage(stage)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
                        stages.includes(stage)
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Investment Range */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Investment Range</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Investment ($)
                  </label>
                  <input
                    type="number"
                    value={minInvestment}
                    onChange={(e) => setMinInvestment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Investment ($)
                  </label>
                  <input
                    type="number"
                    value={maxInvestment}
                    onChange={(e) => setMaxInvestment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="500000"
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">🎯 What's Next?</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Discover startups matched to your interests</li>
                  <li>• Swipe through product demos</li>
                  <li>• Connect with founders you like</li>
                  <li>• Track your deal pipeline</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-8 border-t">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                ← Back
              </button>
            )}

            {step < 4 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 3 && !canProceedStep3)
                }
                className="ml-auto px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            )}

            {step === 4 && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up...' : 'Start Discovering'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
