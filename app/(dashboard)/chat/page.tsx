import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="h-full max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900">Talk to MindMate</h1>
            <p className="text-gray-600 mt-1">
              Your AI companion for mental health support 💙
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}

