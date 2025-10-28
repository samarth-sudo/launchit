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

export default function FounderOnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [founderName, setFounderName] = useState(user?.fullName || '');
  const [cofounderName, setCofounderName] = useState('');
  const [founderEmail, setFounderEmail] = useState(user?.emailAddresses[0]?.emailAddress || '');
  const [cofounderEmail, setCofounderEmail] = useState('');

  const [pitch, setPitch] = useState('');
  const [category, setCategory] = useState<string[]>([]);
  const [isB2B, setIsB2B] = useState<boolean | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  const [numUsers, setNumUsers] = useState('');
  const [payingUsers, setPayingUsers] = useState('');
  const [freeUsers, setFreeUsers] = useState('');
  const [revenue, setRevenue] = useState('');
  const [trialCode, setTrialCode] = useState('');

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const toggleCategory = (cat: string) => {
    if (category.includes(cat)) {
      setCategory(category.filter(c => c !== cat));
    } else {
      setCategory([...category, cat]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Upload video to Cloudinary first (simplified - you'll need proper Cloudinary setup)
      let demoVideoData = null;
      if (videoFile) {
        // For now, we'll skip actual upload and use a placeholder
        // TODO: Implement Cloudinary upload
        demoVideoData = {
          url: videoPreview,
          duration: 0,
          thumbnail: videoPreview,
          cloudinary_id: 'placeholder',
          transcription: null
        };
      }

      // Create user and product
      const response = await fetch('/api/users/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerk_id: user.id,
          email: founderEmail,
          user_type: 'founder',
          profile: {
            name: founderName,
            avatar: user.imageUrl,
            company: companyName,
            cofounder_name: cofounderName || undefined,
            cofounder_email: cofounderEmail || undefined,
          },
        }),
      });

      if (response.ok) {
        const { user: createdUser } = await response.json();

        // Create product
        const productResponse = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: companyName,
            description_7words: pitch,
            demo_video: demoVideoData,
            pricing: { amount: 0, currency: 'USD', type: 'subscription' },
            category: category[0] || 'Other',
            tags: category,
            full_description: `${isB2B ? 'B2B' : 'B2C'} product`,
            market_data: {
              num_users: parseInt(numUsers) || 0,
              paying_users: parseInt(payingUsers) || 0,
              free_users: parseInt(freeUsers) || 0,
              revenue: parseFloat(revenue) || 0,
              trial_code: trialCode || undefined
            }
          }),
        });

        if (productResponse.ok) {
          router.push('/dashboard/founder');
        } else {
          alert('Failed to create product');
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

  const canProceedStep1 = companyName && founderName && founderEmail;
  const canProceedStep2 = pitch && pitch.split(' ').filter(Boolean).length >= 5 && pitch.split(' ').filter(Boolean).length <= 10;
  const canProceedStep3 = category.length > 0 && isB2B !== null;
  const canProceedStep4 = videoFile !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 flex items-center justify-center gap-2">
            Launch it <span className="text-4xl md:text-5xl">▶▶</span>
          </h1>
          <p className="text-gray-600">Founder Onboarding</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-12 max-w-2xl mx-auto">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s}
              </div>
              <span className="text-xs mt-2 text-gray-600">
                {s === 1 && 'Company'}
                {s === 2 && 'Pitch'}
                {s === 3 && 'Category'}
                {s === 4 && 'Demo'}
                {s === 5 && 'Metrics'}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: Company & Team */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Company & Team Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founder Name *
                </label>
                <input
                  type="text"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founder Email *
                </label>
                <input
                  type="email"
                  value={founderEmail}
                  onChange={(e) => setFounderEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="john@acme.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Co-Founder Name (Optional)
                </label>
                <input
                  type="text"
                  value={cofounderName}
                  onChange={(e) => setCofounderName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Jane Smith"
                />
              </div>

              {cofounderName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Co-Founder Email
                  </label>
                  <input
                    type="email"
                    value={cofounderEmail}
                    onChange={(e) => setCofounderEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="jane@acme.com"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Pitch */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Your 7-Word Pitch</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your product in 5-10 words *
                </label>
                <input
                  type="text"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-lg"
                  placeholder="AI-powered customer support for e-commerce"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Words: {pitch.split(' ').filter(Boolean).length} {!canProceedStep2 && pitch && '(Must be 5-10 words)'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for a great pitch:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Focus on the problem you solve</li>
                  <li>• Be specific about your target audience</li>
                  <li>• Highlight what makes you unique</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Category */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Category & Type</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Business Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsB2B(true)}
                    className={`p-4 rounded-lg border-2 transition ${
                      isB2B === true
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">B2B</div>
                    <div className="text-sm text-gray-600">Business to Business</div>
                  </button>
                  <button
                    onClick={() => setIsB2B(false)}
                    className={`p-4 rounded-lg border-2 transition ${
                      isB2B === false
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">B2C</div>
                    <div className="text-sm text-gray-600">Business to Consumer</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Categories (Choose up to 3) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        if (category.length < 3 || category.includes(cat)) {
                          toggleCategory(cat);
                        }
                      }}
                      disabled={category.length >= 3 && !category.includes(cat)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
                        category.includes(cat)
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400 disabled:opacity-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {category.length}/3
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Demo Video */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Demo Video</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Your Product Demo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {videoPreview ? (
                    <div>
                      <video
                        src={videoPreview}
                        controls
                        className="w-full rounded-lg mb-4"
                      />
                      <button
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview('');
                        }}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove Video
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-4">🎥</div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="inline-block px-6 py-3 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition"
                      >
                        Choose Video File
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        Max size: 100MB. Formats: MP4, MOV, AVI
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">📹 Video Tips:</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Keep it under 2 minutes</li>
                  <li>• Show the product in action</li>
                  <li>• Highlight key features and benefits</li>
                  <li>• Ensure good audio and video quality</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 5: Metrics (Optional) */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Product Metrics (Optional)</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Users
                  </label>
                  <input
                    type="number"
                    value={numUsers}
                    onChange={(e) => setNumUsers(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paying Users
                  </label>
                  <input
                    type="number"
                    value={payingUsers}
                    onChange={(e) => setPayingUsers(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Users
                  </label>
                  <input
                    type="number"
                    value={freeUsers}
                    onChange={(e) => setFreeUsers(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trial Code/Link for Early Adopters
                </label>
                <input
                  type="text"
                  value={trialCode}
                  onChange={(e) => setTrialCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="TRIAL2024 or https://yourapp.com/trial"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Provide a special code or link for early adopters to try your product
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  💡 You can always add or update these metrics later from your dashboard
                </p>
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

            {step < 5 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3) ||
                  (step === 4 && !canProceedStep4)
                }
                className="ml-auto px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            )}

            {step === 5 && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
