'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [userType, setUserType] = useState<'founder' | 'investor' | 'early_adopter' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userType || !user) return;

    setLoading(true);

    try {
      // Redirect to detailed onboarding pages for each user type
      if (userType === 'founder') {
        router.push('/onboarding/founder');
        return;
      }

      if (userType === 'investor') {
        router.push('/onboarding/investor');
        return;
      }

      if (userType === 'early_adopter') {
        router.push('/onboarding/early-adopter');
        return;
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight flex items-center justify-center gap-2">
              Launch it <span className="text-4xl md:text-5xl">▶▶</span>
            </h1>
          </div>
          <h1 className="text-4xl font-bold text-black mb-4 tracking-tight">
            Choose Your Role
          </h1>
          <p className="text-lg text-gray-600">
            Select how you want to use the platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Founder Option */}
          <button
            onClick={() => setUserType('founder')}
            className={`p-8 rounded-lg border-2 transition-all text-left ${
              userType === 'founder'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
          >
            <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center text-xl mb-6">
              <span className="text-white">→</span>
            </div>
            <h2 className="text-xl font-bold mb-3 text-black">Founder</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Showcase your product. Get AI-powered market analysis and connect with buyers.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Upload product demos</li>
              <li>• BuyerIQ market analysis</li>
              <li>• Test with synthetic investors</li>
              <li>• Connect with buyers</li>
            </ul>
          </button>

          {/* Investor Option */}
          <button
            onClick={() => setUserType('investor')}
            className={`p-8 rounded-lg border-2 transition-all text-left ${
              userType === 'investor'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
          >
            <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center text-xl mb-6">
              <span className="text-white">○</span>
            </div>
            <h2 className="text-xl font-bold mb-3 text-black">Investor</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Discover startups with AI-powered matching and validated demographics.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• AI-powered recommendations</li>
              <li>• Instant due diligence</li>
              <li>• Purchase intent predictions</li>
              <li>• Direct founder connections</li>
            </ul>
          </button>

          {/* User Option */}
          <button
            onClick={() => setUserType('early_adopter')}
            className={`p-8 rounded-lg border-2 transition-all text-left ${
              userType === 'early_adopter'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
          >
            <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center text-xl mb-6">
              <span className="text-white">△</span>
            </div>
            <h2 className="text-xl font-bold mb-3 text-black">User</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Discover products matched to your profile. Get early access to innovations.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Personalized product feed</li>
              <li>• Demographic matching</li>
              <li>• Early access</li>
              <li>• Connect with founders</li>
            </ul>
          </button>
        </div>

        {userType && (
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white font-semibold px-12 py-4 rounded-md text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up...' : `Continue as ${
                userType === 'founder' ? 'Founder' :
                userType === 'investor' ? 'Investor' :
                'User'
              }`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
