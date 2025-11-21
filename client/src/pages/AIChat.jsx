import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertTriangle, Trash2, Plus, MessageSquare, Menu, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

const AIChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      const convos = response.data.conversations || [];
      setConversations(convos);
      
      if (convos.length > 0 && !activeConversationId) {
        setActiveConversationId(convos[0]._id);
      } else if (convos.length === 0) {
        // Create first conversation
        await createNewConversation();
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Create first conversation if none exist
      await createNewConversation();
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/${conversationId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await api.post('/chat/conversations');
      const newConvo = response.data.conversation;
      setConversations(prev => [newConvo, ...prev]);
      setActiveConversationId(newConvo._id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    // Scroll after adding user message
    setTimeout(() => scrollToBottom(), 100);

    try {
      const response = await api.post(`/chat/${activeConversationId}/message`, { message: userMessage });
      
      if (response.data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
          crisisDetected: response.data.crisisDetected
        }]);

        // Scroll after AI response
        setTimeout(() => scrollToBottom(), 100);

        if (response.data.crisisDetected) {
          setShowCrisisModal(true);
        }
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get response';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I apologize, but I'm having trouble responding right now. Error: ${errorMessage}. Please try again.`,
        timestamp: new Date()
      }]);
      setTimeout(() => scrollToBottom(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await api.delete(`/chat/${conversationId}`);
        setConversations(prev => prev.filter(c => c._id !== conversationId));
        
        if (conversationId === activeConversationId) {
          const remaining = conversations.filter(c => c._id !== conversationId);
          if (remaining.length > 0) {
            setActiveConversationId(remaining[0]._id);
          } else {
            await createNewConversation();
          }
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  const getConversationTitle = (convo) => {
    if (convo.title) return convo.title;
    if (convo.messages && convo.messages.length > 0) {
      const firstMessage = convo.messages[0].content;
      return firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
    }
    return 'New Chat';
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <Button onClick={createNewConversation} fullWidth>
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((convo) => (
            <div
              key={convo._id}
              onClick={() => setActiveConversationId(convo._id)}
              className={`group flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                activeConversationId === convo._id
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{getConversationTitle(convo)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(convo._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">MindMate</h1>
            <p className="text-sm text-gray-600">Your mental health companion by Team Eternity</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Bot className="w-20 h-20 text-primary-600 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Hi! I'm MindMate
                </h3>
                <p className="text-gray-600 max-w-md mb-2">
                  Your mental health companion created by Team Eternity.
                </p>
                <p className="text-gray-600 max-w-md">
                  I'm here to listen and support you. Feel free to share what's on your mind.
                  Everything you say is confidential.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.crisisDetected && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <p className="text-sm text-red-600 font-medium">
                          ⚠️ Crisis keywords detected. Please seek immediate help if needed.
                        </p>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-secondary-600" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </form>
        </div>
      </div>

        {/* Crisis Modal */}
        <Modal
          isOpen={showCrisisModal}
          onClose={() => setShowCrisisModal(false)}
          title="Crisis Support Resources"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900 mb-2">
                  If you're in immediate danger, please call emergency services.
                </p>
                <p className="text-red-800 text-sm">
                  MindMate is NOT a replacement for professional mental health care.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Crisis Hotlines:</h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">National Suicide Prevention Lifeline</p>
                  <p className="text-2xl font-bold text-primary-600">988</p>
                  <p className="text-sm text-gray-600">24/7 support</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Crisis Text Line</p>
                  <p className="text-lg font-bold text-primary-600">Text HOME to 741741</p>
                  <p className="text-sm text-gray-600">24/7 text support</p>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowCrisisModal(false)} fullWidth>
              I Understand
            </Button>
          </div>
      </Modal>
    </div>
  );
};

export default AIChat;
