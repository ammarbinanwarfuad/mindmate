import { Link } from 'react-router-dom';

export default function Resources() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wellness Resources</h1>
        <p className="text-gray-600 mt-2">
          Helpful resources for your mental health journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/wellness" className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-300 rounded-xl p-6 hover:shadow-xl transition-all">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-xl font-bold text-primary-900 mb-2">Wellness Library</h3>
          <p className="text-sm text-primary-800 mb-2">
            Guided meditation, breathing exercises, and wellness activities
          </p>
          <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
            NEW! Interactive Activities
          </span>
        </Link>

        <Link to="/resources/crisis" className="bg-red-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-3">🆘</div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Crisis Support</h3>
          <p className="text-sm text-red-800">
            If you're in crisis, immediate help is available.
          </p>
        </Link>

        <Link to="/safety-plan" className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6 hover:shadow-xl transition-all">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">Safety Plan</h3>
          <p className="text-sm text-blue-800 mb-2">
            Create your personalized crisis response plan
          </p>
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            NEW! Enhanced Crisis Support
          </span>
        </Link>

        <Link to="/resources/meditation" className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-3">🧘</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Meditation</h3>
          <p className="text-sm text-gray-600">
            Guided meditation for stress relief and mindfulness
          </p>
        </Link>

        <Link to="/resources/breathing" className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-3">🫁</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Breathing Exercises</h3>
          <p className="text-sm text-gray-600">
            Breathing techniques to calm anxiety and stress
          </p>
        </Link>

        <Link to="/resources/journal" className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-3">📖</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Journal Prompts</h3>
          <p className="text-sm text-gray-600">
            Guided journaling for self-reflection and growth
          </p>
        </Link>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 opacity-60">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Articles & Guides</h3>
          <p className="text-sm text-gray-600">
            Evidence-based articles on mental health topics
          </p>
          <span className="text-xs text-gray-500 mt-2 block">Coming soon</span>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 opacity-60">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Therapy Resources</h3>
          <p className="text-sm text-gray-600">
            Find professional therapy and counseling services
          </p>
          <span className="text-xs text-gray-500 mt-2 block">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
