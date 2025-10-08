import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-4xl shadow-xl">
              🧠
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">MindMate</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your 24/7 AI-powered mental wellness companion designed specifically for university students
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon="💬"
            title="AI Chatbot"
            description="Talk to an empathetic AI companion trained in mental health support"
          />
          <FeatureCard
            icon="📊"
            title="Mood Tracking"
            description="Track your emotional patterns with AI-powered insights"
          />
          <FeatureCard
            icon="🤝"
            title="Peer Matching"
            description="Connect with students facing similar challenges"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all">
      <span className="text-5xl block mb-4">{icon}</span>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}