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

export default function EarlyAdopterOnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [isB2B, setIsB2B] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState('');
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');

  const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];
  const INDUSTRIES = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
    'Manufacturing', 'Marketing', 'Consulting', 'Government', 'Other'
  ];

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
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
          user_type: 'early_adopter',
          profile: {
            name: user.fullName || user.firstName || 'User',
            avatar: user.imageUrl,
            is_b2b: isB2B,
            age_range: ageRange,
            industry,
            role,
          },
        }),
      });

      if (response.ok) {
        const { user: createdUser } = await response.json();

        // Create user preferences
        const prefsResponse = await fetch('/api/investor-preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            investor_id: createdUser.id,
            preferred_categories: categories,
            preferred_stages: [],
            investment_range: { min: 0, max: 0 }
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

  const canProceedStep1 = isB2B !== null;
  const canProceedStep2 = categories.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 flex items-center justify-center gap-2">
            Launch it <span className="text-4xl md:text-5xl">▶▶</span>
          </h1>
          <p className="text-gray-600">User Onboarding</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-12 max-w-md mx-auto">
          {[1, 2, 3].map((s) => (
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
                {s === 2 && 'Interests'}
                {s === 3 && 'Profile'}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: Product Type */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">What Products Interest You?</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setIsB2B(true)}
                  className={`p-6 rounded-lg border-2 transition ${
                    isB2B === true
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-3">🏢</div>
                  <div className="font-semibold text-lg">B2B Products</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Business tools, enterprise software, productivity apps
                  </div>
                </button>

                <button
                  onClick={() => setIsB2B(false)}
                  className={`p-6 rounded-lg border-2 transition ${
                    isB2B === false
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-3">🛍️</div>
                  <div className="font-semibold text-lg">B2C Products</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Consumer apps, lifestyle products, entertainment
                  </div>
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 Don't worry, you can change this later and discover products from both categories
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Categories */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Select Your Interests</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Categories You're Interested In *
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

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">🎯 Why we ask:</h3>
                <p className="text-sm text-purple-800">
                  We'll show you products that match your interests, so you discover innovations most relevant to you
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Demographics (Optional) */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Tell Us About Yourself (Optional)</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Age Range
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {AGE_RANGES.map((range) => (
                    <button
                      key={range}
                      onClick={() => setAgeRange(range)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
                        ageRange === range
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Product Manager, Developer, Designer"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">🚀 What's Next?</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Discover products matched to your profile</li>
                  <li>• Get early access to innovations</li>
                  <li>• Try products with trial codes</li>
                  <li>• Leave reviews to help founders</li>
                  <li>• Build your reputation as an early adopter</li>
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

            {step < 3 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                }
                className="ml-auto px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up...' : 'Start Exploring'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
