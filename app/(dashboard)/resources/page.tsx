import Link from 'next/link';

const RESOURCES = [
  {
    id: 'meditation',
    title: 'Guided Meditation',
    description: 'Calm your mind with guided meditation exercises',
    icon: '🧘',
    color: 'from-purple-600 to-blue-600',
    duration: '5-20 min',
  },
  {
    id: 'breathing',
    title: 'Breathing Exercises',
    description: 'Reduce anxiety with proven breathing techniques',
    icon: '🌬️',
    color: 'from-blue-600 to-cyan-600',
    duration: '2-5 min',
  },
  {
    id: 'journal',
    title: 'Journal Prompts',
    description: 'Reflect and process your thoughts',
    icon: '📔',
    color: 'from-green-600 to-teal-600',
    duration: '10-15 min',
  },
  {
    id: 'sleep',
    title: 'Sleep Hygiene',
    description: 'Improve your sleep quality',
    icon: '😴',
    color: 'from-indigo-600 to-purple-600',
    duration: 'Daily tips',
  },
  {
    id: 'cbt',
    title: 'CBT Worksheets',
    description: 'Challenge negative thought patterns',
    icon: '📝',
    color: 'from-orange-600 to-red-600',
    duration: '15-30 min',
  },
  {
    id: 'crisis',
    title: 'Crisis Support',
    description: 'Immediate help when you need it most',
    icon: '🆘',
    color: 'from-red-600 to-pink-600',
    duration: '24/7',
  },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wellness Resources</h1>
        <p className="text-gray-600 mt-2">
          Evidence-based tools and techniques for mental wellness
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESOURCES.map((resource) => (
          <Link
            key={resource.id}
            href={`/resources/${resource.id}`}
            className={`
              bg-gradient-to-br ${resource.color} rounded-xl p-6 text-white
              shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1
            `}
          >
            <span className="text-5xl block mb-4">{resource.icon}</span>
            <h3 className="text-2xl font-bold mb-2">{resource.title}</h3>
            <p className="text-white/90 mb-4">{resource.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {resource.duration}
              </span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">About These Resources</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          All exercises and techniques are based on evidence-based practices including Cognitive
          Behavioral Therapy (CBT), Mindfulness-Based Stress Reduction (MBSR), and established
          psychological research.
        </p>
        <p className="text-sm text-gray-600">
          These resources are educational tools and do not replace professional mental health care.
          If you're experiencing severe distress, please reach out to a mental health professional.
        </p>
      </div>
    </div>
  );
}