import { FileText } from 'lucide-react';

const PostTemplates = ({ onSelectTemplate }) => {
  const templates = [
    {
      title: 'Seeking Advice',
      content: 'I\'m dealing with [situation] and would appreciate any advice or perspectives from the community...',
      tags: ['advice', 'support']
    },
    {
      title: 'Sharing Progress',
      content: 'I wanted to share a win today! I [achievement]. It might seem small, but it means a lot to me...',
      tags: ['progress', 'celebration']
    },
    {
      title: 'Feeling Overwhelmed',
      content: 'I\'m feeling overwhelmed by [situation]. Has anyone else experienced this? How did you cope?',
      tags: ['overwhelmed', 'coping']
    },
    {
      title: 'Gratitude Post',
      content: 'Today I\'m grateful for [thing/person/experience]. It reminded me that...',
      tags: ['gratitude', 'positivity']
    },
    {
      title: 'Check-In',
      content: 'Just checking in. Today has been [mood/experience]. How is everyone else doing?',
      tags: ['check-in', 'community']
    },
    {
      title: 'Resource Share',
      content: 'I found this helpful resource/technique: [description]. It helped me with [issue]. Hope it helps someone else!',
      tags: ['resources', 'helpful']
    }
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Post Templates</h3>
      </div>

      <div className="space-y-2">
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => onSelectTemplate(template)}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="font-medium text-gray-900 mb-1">{template.title}</div>
            <div className="text-sm text-gray-600 line-clamp-2">{template.content}</div>
            <div className="flex gap-2 mt-2">
              {template.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PostTemplates;
