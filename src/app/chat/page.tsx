'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Chat = {
  _id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
};

type Model = {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
};

const availableModels: Model[] = [
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek: DeepSeek V3 0324',
    description: 'Most capable model, best for complex tasks',
    maxTokens: 8192
  },
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen: Qwen3 Coder',
    description: 'Fast and efficient, good for most tasks',
    maxTokens: 4096
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek: R1 0528',
    description: 'Anthropic&apos;s most powerful model',
    maxTokens: 200000
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek: R1',
    description: 'Balanced performance and speed',
    maxTokens: 200000
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'Z.AI: GLM 4.5 Air',
    description: 'Balanced performance and speed',
    maxTokens: 200000
  }
];

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model>(availableModels[1]); // Default to GPT-3.5
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load chat history on component mount
  useEffect(() => {
    const loadChat = async () => {
      if (!session?.user) return;
      
      try {
        const response = await fetch('/api/chat/history');
        
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setCurrentChat(data[0]); // Load most recent chat
            setMessages(data[0].messages);
            // Set the model based on the loaded chat
            const chatModel = availableModels.find(m => m.id === data[0].model) || availableModels[1];
            setSelectedModel(chatModel);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    if (session) {
      loadChat();
    }
  }, [session]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Save message to chat history
      const saveResponse = await fetch('/api/chat/history', {
        method: currentChat ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: currentChat?._id,
          messages: updatedMessages,
          model: selectedModel.id,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save chat history');
      }

      const savedChat = await saveResponse.json();
      setCurrentChat(savedChat);

      // Call chat API
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel.id,
          maxTokens: selectedModel.maxTokens,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`API request failed with status ${chatResponse.status}`);
      }

      const data = await chatResponse.json();

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
      };

      const completeMessages = [...updatedMessages, assistantMessage];
      setMessages(completeMessages);

      // Update chat history with assistant response
      await fetch('/api/chat/history', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: savedChat._id,
          messages: completeMessages,
          model: selectedModel.id,
        }),
      });

    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please try again.');
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      if (currentChat) {
        // Delete current chat from history
        await fetch(`/api/chat/history?id=${currentChat._id}`, {
          method: 'DELETE',
        });
      }
      setCurrentChat(null);
      setMessages([]);
      setError(null);
      toast.success('Chat cleared successfully');
    } catch (err) {
      console.error('Failed to clear chat:', err);
      toast.error('Failed to clear chat history');
    }
  };

  const handleModelChange = (model: Model) => {
    setSelectedModel(model);
    setShowModelSelector(false);
    toast.success(`Switched to ${model.name}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">AI Chat</h1>
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <span>{selectedModel.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showModelSelector && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-3 text-black">Select Model</h3>
                    <div className="space-y-2">
                      {availableModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleModelChange(model)}
                          className={`w-full text-left p-3 rounded-lg border transition ${
                            selectedModel.id === model.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-black">{model.name}</div>
                          <div className="text-sm text-gray-600">{model.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClearChat}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Clear Chat
            </button>
            <div className="text-sm text-gray-500">
              {session.user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
            <p>Ask me anything! I'm using {selectedModel.name} to help you.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... (Shift+Enter for new line)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 text-black"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        
        {error && (
          <div className="mt-2 text-red-600 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}