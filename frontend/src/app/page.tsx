'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, BarChart3, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_message: input,
          developer_message: "You are a professional Model Risk Management (MRM) AI assistant. Provide clear, structured responses about model risk analysis, validation, governance, and compliance. Use professional language and include relevant risk metrics, regulatory considerations, and best practices. Format responses with clear headings, bullet points, and code examples where appropriate.",
          model: "gpt-4.1-mini"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from the server');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let accumulatedResponse = '';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '',
        timestamp: new Date()
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the Uint8Array to text
        const text = new TextDecoder().decode(value);
        accumulatedResponse += text;

        // Update the last message with the accumulated response
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = accumulatedResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to the backend'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MRM AI Assistant</h1>
                  <p className="text-sm text-gray-600">Model Risk Management Platform</p>
                </div>
              </div>
            </div>
                          <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Reports</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                  <Link href="/pdf-chat" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span>Document Analysis</span>
                  </Link>
                </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Risk Assessment</div>
                      <div className="text-sm text-gray-600">Evaluate model risks</div>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Validation</div>
                      <div className="text-sm text-gray-600">Model validation</div>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Performance</div>
                      <div className="text-sm text-gray-600">Monitor metrics</div>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Model validation completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Risk assessment updated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>New model registered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
                    <p className="text-blue-100 text-sm">Ask about Model Risk Management</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-100 text-sm">Online</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to MRM AI Assistant</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Get professional insights on Model Risk Management, validation, governance, and compliance.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs opacity-75">
                              {message.role === 'user' ? 'You' : 'MRM AI'}
                            </span>
                            <span className="text-xs opacity-75">•</span>
                            <span className="text-xs opacity-75">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-[80%]">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-600">Analyzing your request...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input Form */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about model risk assessment, validation, or governance..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Additional Features */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Model Validation</h3>
                    <p className="text-sm text-gray-600">Comprehensive validation reports</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Risk Analytics</h3>
                    <p className="text-sm text-gray-600">Advanced risk metrics</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Documentation</h3>
                    <p className="text-sm text-gray-600">Regulatory compliance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
