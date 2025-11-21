import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    if (userId && connections.length > 0) {
      const connection = connections.find((c) => c.user?._id === userId);
      if (connection) {
        setSelectedConnection(connection);
      }
    }
  }, [userId, connections]);

  useEffect(() => {
    if (selectedConnection) {
      loadMessages();
    }
  }, [selectedConnection]);

  const loadConnections = async () => {
    try {
      const response = await api.get('/matching/connections');
      if (response.data.success) {
        setConnections(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConnection) return;
    
    try {
      const response = await api.get(`/chat/conversation/${selectedConnection.user._id}`);
      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConnection) return;

    setIsSending(true);
    try {
      const response = await api.post('/chat/send', {
        receiverId: selectedConnection.user._id,
        message: newMessage
      });

      if (response.data.success) {
        setNewMessage('');
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading messages...</p>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Connections Yet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect with someone before you can send messages.
          </p>
          <a
            href="/matches"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Find Matches
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          All messages are end-to-end encrypted
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connections List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
              <h3 className="font-semibold text-gray-900">Your Connections</h3>
              <p className="text-sm text-gray-600">{connections.length} connected</p>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {connections.map((connection) => (
                <button
                  key={connection._id}
                  onClick={() => setSelectedConnection(connection)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                    selectedConnection?._id === connection._id ? 'bg-purple-50' : ''
                  }`}
                >
                  {connection.user?.profilePicture ? (
                    <img
                      src={connection.user.profilePicture}
                      alt={connection.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {connection.user?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {connection.user?.name || 'Unknown'}
                    </p>
                    {connection.user?.headline && (
                      <p className="text-sm text-gray-600 truncate">
                        {connection.user.headline}
                      </p>
                    )}
                  </div>
                  {selectedConnection?._id === connection._id && (
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Interface */}
        <div className="lg:col-span-2">
          {selectedConnection ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 flex flex-col h-[600px]">
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center gap-3">
                  {selectedConnection.user?.profilePicture ? (
                    <img
                      src={selectedConnection.user.profilePicture}
                      alt={selectedConnection.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedConnection.user?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedConnection.user?.name || 'Unknown'}
                    </p>
                    {selectedConnection.user?.headline && (
                      <p className="text-sm text-gray-600">
                        {selectedConnection.user.headline}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">💬</div>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.sender === selectedConnection.user._id ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === selectedConnection.user._id
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center h-[600px]">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg font-medium">Select a connection to start messaging</p>
                <p className="text-sm">Your messages are end-to-end encrypted</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
