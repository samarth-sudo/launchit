'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Conversation {
  other_user_id: number;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  product_id: number | null;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">Messages</h1>
            <Link
              href="/discover"
              className="text-gray-600 hover:text-black transition"
            >
              ← Back to Discover
            </Link>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No messages yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start swiping and connecting with products to begin conversations
            </p>
            <Link
              href="/discover"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm divide-y">
            {conversations.map((conversation) => (
              <Link
                key={conversation.other_user_id}
                href={`/messages/${conversation.other_user_id}`}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 transition cursor-pointer"
              >
                {/* Avatar */}
                {conversation.other_user_avatar ? (
                  <img
                    src={conversation.other_user_avatar}
                    alt={conversation.other_user_name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                    {conversation.other_user_name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Message Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversation.other_user_name}
                    </h3>
                    <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                      {formatTime(conversation.last_message_time)}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      conversation.unread_count > 0
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {conversation.last_message}
                  </p>
                </div>

                {/* Unread Badge */}
                {conversation.unread_count > 0 && (
                  <div className="flex-shrink-0 ml-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-black text-white text-xs font-semibold rounded-full">
                      {conversation.unread_count}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
