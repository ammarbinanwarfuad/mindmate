'use client';

interface Props {
  icon: string;
  title: string;
  insights: string[];
  type: 'pattern' | 'trigger' | 'recommendation' | 'achievement';
}

export default function InsightCard({ icon, title, insights, type }: Props) {
  const getColorClasses = () => {
    switch (type) {
      case 'pattern':
        return 'border-blue-200 bg-blue-50';
      case 'trigger':
        return 'border-orange-200 bg-orange-50';
      case 'recommendation':
        return 'border-green-200 bg-green-50';
      case 'achievement':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`border-2 rounded-xl p-6 ${getColorClasses()}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      </div>
      <ul className="space-y-3">
        {insights.map((insight, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="text-purple-600 mt-1">•</span>
            <span className="text-gray-700 leading-relaxed">{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}