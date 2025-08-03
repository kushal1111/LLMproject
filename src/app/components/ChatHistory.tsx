'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type Chat = {
  _id: string;
  title: string;
  messages: any[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
};

interface ChatHistoryProps {
  onChatSelect: (chat: Chat) => void;
  currentChatId?: string;
}

export default function ChatHistory({ onChatSelect, currentChatId }: ChatHistoryProps) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      if (!session?.user) return;
      
      try {
        const response = await fetch('/api/chat/history');
        
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [session]);

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/chat/history?id=${chatId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setChats(chats.filter(chat => chat._id !== chatId));
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No chat history</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <div
          key={chat._id}
          onClick={() => onChatSelect(chat)}
          className={`p-3 rounded-lg cursor-pointer transition ${
            currentChatId === chat._id
              ? 'bg-blue-100 border border-blue-300'
              : 'hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {chat.title}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(chat.updatedAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400">
                {chat.messages.length} messages • {chat.model}
              </p>
            </div>
            <button
              onClick={(e) => handleDeleteChat(chat._id, e)}
              className="ml-2 p-1 text-gray-400 hover:text-red-500 transition"
              title="Delete chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 