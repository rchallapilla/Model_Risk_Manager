'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { Shield, FileText, Upload, MessageSquare, ArrowLeft, CheckCircle, Clock, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UploadedPDF {
  filename: string;
  status: string;
}

export default function PDFChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPDFs, setUploadedPDFs] = useState<UploadedPDF[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a PDF file.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload_pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload PDF');
      }

      const result = await response.json();
      setUploadedPDFs(prev => [...prev, {
        filename: result.filename,
        status: result.status
      }]);
      setSelectedPDF(result.filename);
      
      // Add success message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ PDF "${result.filename}" uploaded and indexed successfully! You can now ask questions about this document.`,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Upload error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error uploading PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedPDF) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/pdf_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          pdf_filename: selectedPDF,
          model: "gpt-4o-mini"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get response');
      }

      const result = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.answer,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error: ${error instanceof Error ? error.message : 'Failed to connect to the backend'}`,
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
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Main</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Document Analysis</h1>
                <p className="text-sm text-gray-600">PDF RAG Chat System</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">AI</span>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Management</h2>
              
              {/* Upload Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Upload Documents</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer border border-blue-600"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload PDF'}
                </label>
                {isUploading && (
                  <div className="mt-2 text-sm text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Processing document...
                  </div>
                )}
              </div>

              {/* Uploaded Documents */}
              {uploadedPDFs.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {uploadedPDFs.map((pdf, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPDF === pdf.filename
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedPDF(pdf.filename)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {pdf.filename}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            pdf.status === 'indexed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pdf.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Document validation</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Chat with documents</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Risk assessment</span>
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
                    <h2 className="text-lg font-semibold text-white">Document Analysis</h2>
                    <p className="text-blue-100 text-sm">
                      {selectedPDF ? `Analyzing: ${selectedPDF}` : 'Upload a document to start analyzing'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-100 text-sm">Ready</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Document Analysis Ready</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Upload a PDF document and start asking questions for AI-powered analysis and insights.
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
                              {message.role === 'user' ? 'You' : 'Document AI'}
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
                            <span className="text-sm text-gray-600">Analyzing document...</span>
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
                    placeholder={selectedPDF ? `Ask about "${selectedPDF}"...` : "Upload a document first to start analyzing..."}
                    disabled={!selectedPDF}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !selectedPDF || !input.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Ask</span>
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
                    <h3 className="font-medium text-gray-900">Document Validation</h3>
                    <p className="text-sm text-gray-600">Verify document integrity</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">AI Analysis</h3>
                    <p className="text-sm text-gray-600">Intelligent document insights</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Risk Assessment</h3>
                    <p className="text-sm text-gray-600">Identify potential risks</p>
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