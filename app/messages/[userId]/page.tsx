'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  message_text: string;
  created_at: string;
  sender_name: string;
  sender_avatar: string | null;
  recipient_name: string;
  recipient_avatar: string | null;
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState('');
  const [otherUserAvatar, setOtherUserAvatar] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setUserId(resolvedParams.userId);
      fetchMessages(resolvedParams.userId);
    });
  }, []);

  const fetchMessages = async (otherUserId: string) => {
    try {
      const response = await fetch(`/api/messages?conversation_with=${otherUserId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);

        // Get other user's name from first message
        if (data.messages && data.messages.length > 0) {
          const firstMsg = data.messages[0];
          const isCurrentUserSender = firstMsg.sender_id.toString() !== otherUserId;
          setOtherUserName(isCurrentUserSender ? firstMsg.recipient_name : firstMsg.sender_name);
          setOtherUserAvatar(isCurrentUserSender ? firstMsg.recipient_avatar : firstMsg.sender_avatar);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !userId) return;

    setSending(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: userId,
          message_text: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Refresh messages
        await fetchMessages(userId);
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('An error occurred');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    msgs.forEach((msg) => {
      const dateKey = new Date(msg.created_at).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/messages')}
              className="text-gray-600 hover:text-black transition"
            >
              ← Back
            </button>
            {otherUserAvatar ? (
              <img
                src={otherUserAvatar}
                alt={otherUserName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                {otherUserName.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold text-black">{otherUserName}</h1>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Start the conversation
              </h2>
              <p className="text-gray-600">
                Send a message to {otherUserName}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(messageGroups).map(([dateKey, msgs]) => (
                <div key={dateKey}>
                  {/* Date Divider */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                      {formatDate(msgs[0].created_at)}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3">
                    {msgs.map((message) => {
                      const isCurrentUser = message.sender_id.toString() !== userId;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              isCurrentUser
                                ? 'bg-black text-white'
                                : 'bg-white border border-gray-200'
                            } rounded-2xl px-4 py-2 shadow-sm`}
                          >
                            <p className="text-sm leading-relaxed">
                              {message.message_text}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-gray-300' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
