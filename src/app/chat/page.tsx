'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
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

// Function to detect and format code blocks
const formatMessageContent = (content: string) => {
  // Split content into parts (text and code blocks)
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  let currentIndex = 0;
  
  // Regex to match code blocks with language specification
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > currentIndex) {
      parts.push({
        type: 'text',
        content: content.slice(currentIndex, match.index)
      });
    }
    
    // Add code block
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2] || ''
    });
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (currentIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(currentIndex)
    });
  }
  
  return parts.length > 0 ? parts : [{ type: 'text', content }];
};

// Copy to clipboard function
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
    toast.error('Failed to copy to clipboard');
  }
};

// Code block component
const CodeBlock = ({ language, content }: { language: string; content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <span className="text-sm text-gray-300 font-medium">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-sm text-gray-300 hover:text-white transition"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-100 font-mono">
          {content}
        </code>
      </pre>
    </div>
  );
};

// Message component with copy functionality
const MessageComponent = ({ message, index }: { message: Message; index: number }) => {
  const [copied, setCopied] = useState(false);
  const formattedContent = formatMessageContent(message.content);

  const handleCopyMessage = async () => {
    await copyToClipboard(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative max-w-3xl px-4 py-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        {/* Copy button */}
        <button
          onClick={handleCopyMessage}
          className={`absolute top-2 right-2 p-1 rounded opacity-0 hover:opacity-100 transition-opacity ${
            message.role === 'user' 
              ? 'text-blue-100 hover:text-white' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title="Copy message"
        >
          {copied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {/* Message content */}
        <div className="pr-8">
          {formattedContent.map((part, partIndex) => (
            <div key={partIndex}>
              {part.type === 'text' ? (
                <div className="whitespace-pre-wrap">{part.content}</div>
              ) : part.type === 'code' ? (
                <CodeBlock language={(part as any).language || 'text'} content={part.content} />
              ) : null}
            </div>
          ))}
        </div>

        {/* Timestamp */}
        <div className={`text-xs mt-2 ${
          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

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

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout');
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
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                {session.user.email}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
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
            <p>Ask me anything! I&apos;m using {selectedModel.name} to help you.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageComponent key={index} message={message} index={index} />
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