'use client';

import { useState } from 'react';

const CBT_EXERCISES = [
    {
        id: 'thought-record',
        title: 'Thought Record',
        description: 'Challenge negative automatic thoughts',
        prompts: [
            'What situation triggered this thought?',
            'What automatic thought came up?',
            'What emotions did you feel? (Rate 0-100)',
            'What evidence supports this thought?',
            'What evidence contradicts this thought?',
            'What\'s a more balanced perspective?',
            'How do you feel now? (Rate 0-100)',
        ],
    },
    {
        id: 'cognitive-distortions',
        title: 'Identify Cognitive Distortions',
        description: 'Recognize thinking patterns that may be unhelpful',
        distortions: [
            { name: 'All-or-Nothing', example: '"If I\'m not perfect, I\'m a failure"' },
            { name: 'Overgeneralization', example: '"Nothing ever works out for me"' },
            { name: 'Mental Filter', example: 'Focusing only on negatives' },
            { name: 'Catastrophizing', example: '"This will be a total disaster"' },
            { name: 'Mind Reading', example: '"They think I\'m stupid"' },
            { name: 'Fortune Telling', example: '"I know I\'ll fail"' },
            { name: 'Should Statements', example: '"I should be better at this"' },
            { name: 'Labeling', example: '"I\'m such an idiot"' },
        ],
    },
    {
        id: 'behavioral-activation',
        title: 'Behavioral Activation',
        description: 'Plan activities that bring pleasure or accomplishment',
        categories: [
            'Social connections',
            'Physical activity',
            'Creative pursuits',
            'Self-care',
            'Learning something new',
            'Helping others',
        ],
    },
];

export default function CBTPage() {
    const [selectedExercise, setSelectedExercise] = useState(CBT_EXERCISES[0]);
    const [responses, setResponses] = useState<string[]>([]);

    const handleResponse = (index: number, value: string) => {
        const newResponses = [...responses];
        newResponses[index] = value;
        setResponses(newResponses);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Cognitive Behavioral Therapy (CBT)
                </h1>
                <p className="text-gray-600 mt-2">
                    Evidence-based techniques to change unhelpful thinking patterns
                </p>
            </div>

            {/* Exercise Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CBT_EXERCISES.map((exercise) => (
                    <button
                        key={exercise.id}
                        onClick={() => {
                            setSelectedExercise(exercise);
                            setResponses([]);
                        }}
                        className={`
              p-4 rounded-xl border-2 transition-all text-left
              ${selectedExercise.id === exercise.id
                                ? 'border-green-600 bg-green-50'
                                : 'border-gray-200 hover:border-green-300'
                            }
            `}
                    >
                        <h3 className="font-bold text-gray-900 mb-1">{exercise.title}</h3>
                        <p className="text-sm text-gray-600">{exercise.description}</p>
                    </button>
                ))}
            </div>

            {/* Exercise Content */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedExercise.title}
                </h2>
                <p className="text-gray-600 mb-6">{selectedExercise.description}</p>

                {selectedExercise.id === 'thought-record' && selectedExercise.prompts && (
                    <div className="space-y-6">
                        {selectedExercise.prompts.map((prompt, idx) => (
                            <div key={idx}>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    {prompt}
                                </label>
                                <textarea
                                    value={responses[idx] || ''}
                                    onChange={(e) => handleResponse(idx, e.target.value)}
                                    className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 resize-none"
                                    placeholder="Your response..."
                                />
                            </div>
                        ))}
                        <button className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                            Save Thought Record
                        </button>
                    </div>
                )}

                {selectedExercise.id === 'cognitive-distortions' && selectedExercise.distortions && (
                    <div className="space-y-3">
                        {selectedExercise.distortions.map((distortion, idx) => (
                            <div
                                key={idx}
                                className="bg-green-50 border-l-4 border-green-600 p-4 rounded"
                            >
                                <h4 className="font-bold text-gray-900 mb-1">{distortion.name}</h4>
                                <p className="text-sm text-gray-600">{distortion.example}</p>
                            </div>
                        ))}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Do you recognize any of these patterns in your thinking?
                            </label>
                            <textarea
                                className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 resize-none"
                                placeholder="Reflect on your own thinking patterns..."
                            />
                        </div>
                    </div>
                )}

                {selectedExercise.id === 'behavioral-activation' && selectedExercise.categories && (
                    <div className="space-y-6">
                        <p className="text-gray-700">
                            Plan at least one activity from each category for this week:
                        </p>
                        {selectedExercise.categories.map((category, idx) => (
                            <div key={idx}>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    {category}
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                                    placeholder="What will you do?"
                                />
                            </div>
                        ))}
                        <button className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                            Save Activity Plan
                        </button>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-2">💡 About CBT</h3>
                <p className="text-blue-800">
                    CBT is one of the most effective treatments for anxiety and depression.
                    These exercises help you identify and change unhelpful thought patterns.
                    Practice regularly for best results.
                </p>
            </div>
        </div>
    );
}
