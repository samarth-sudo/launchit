'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import type { Match, Product, User as DBUser } from '@/types/database';

interface MatchWithDetails extends Match {
  product?: Product;
  other_user?: DBUser;
}

export default function MatchesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'founder' | 'investor' | null>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/matches');
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
        setUserType(data.user_type);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Matches</h1>
              <p className="text-sm text-gray-600">Connect with interested parties</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(userType === 'founder' ? '/dashboard/founder' : '/discover')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Back to {userType === 'founder' ? 'Dashboard' : 'Discover'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Matches List */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {matches.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🤝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No matches yet</h2>
              <p className="text-gray-600 mb-6">
                {userType === 'investor'
                  ? 'Start swiping to find interesting startups!'
                  : 'Your products will appear here when investors show interest'
                }
              </p>
              {userType === 'investor' && (
                <button
                  onClick={() => router.push('/discover')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Start Discovering
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {match.other_user?.profile.avatar && (
                            <img
                              src={match.other_user.profile.avatar}
                              alt={match.other_user.profile.name || 'User'}
                              className="w-12 h-12 rounded-full"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {match.other_user?.profile.name || 'Anonymous User'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {userType === 'investor' ? 'Founder' : 'Investor'}
                              {match.other_user?.profile.company && ` • ${match.other_user.profile.company}`}
                            </p>
                          </div>
                        </div>

                        {match.product && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-3">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {match.product.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {match.product.description_7words}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{match.product.category}</span>
                              <span>•</span>
                              <span>${match.product.pricing.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            Matched {new Date(match.matched_at).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            match.status === 'interested' ? 'bg-blue-100 text-blue-800' :
                            match.status === 'in_discussion' ? 'bg-yellow-100 text-yellow-800' :
                            match.status === 'deal_closed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {match.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => alert('Messaging coming soon!')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => {
                            const email = match.other_user?.email;
                            if (email) {
                              window.location.href = `mailto:${email}`;
                            }
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                        >
                          Email
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    {match.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-700">{match.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {matches.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4">Match Statistics</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
                  <div className="text-sm text-gray-600">Total Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {matches.filter(m => m.status === 'in_discussion').length}
                  </div>
                  <div className="text-sm text-gray-600">In Discussion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {matches.filter(m => m.status === 'deal_closed').length}
                  </div>
                  <div className="text-sm text-gray-600">Deals Closed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {matches.reduce((sum, m) => sum + (m.deal_amount || 0), 0).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
