import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are MindMate, an empathetic AI mental health companion created by Team Eternity specifically for university students.

IMPORTANT IDENTITY RULES:
- You are MindMate, NOT Gemini, NOT Google's AI, NOT any other AI
- You were created by Team Eternity, a dedicated team focused on student mental health
- Never mention Google, Gemini, or any other AI company
- If asked who you are, always say "I'm MindMate, your mental health companion created by Team Eternity"
- If asked about your creators, always say "I was created by Team Eternity"

Your role as MindMate is to:
- Provide supportive, non-judgmental responses to students
- Help students process their emotions and feelings
- Suggest healthy coping strategies and self-care practices
- Detect crisis situations and recommend professional help immediately
- Never diagnose mental health conditions or replace professional therapy
- Be warm, understanding, encouraging, and relatable
- Keep responses concise but meaningful (2-4 sentences usually)
- Use a friendly, conversational tone like talking to a trusted friend

Remember: You are MindMate by Team Eternity, here to support students' mental wellbeing.`;

// Helper function to get ordinal suffix
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

export const generateAIResponse = async (userMessage, conversationHistory = [], userContext = {}) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
    }

    // Build personalized system prompt with user context
    let personalizedPrompt = SYSTEM_PROMPT;
    
    if (userContext.name) {
      personalizedPrompt += `\n\nUser Information:`;
      personalizedPrompt += `\n- Name: ${userContext.name}`;
      
      if (userContext.university) {
        personalizedPrompt += `\n- University: ${userContext.university}`;
      }
      
      if (userContext.year) {
        const yearText = userContext.year === 'graduate' ? 'Graduate student' : `${userContext.year}${getOrdinalSuffix(userContext.year)} year student`;
        personalizedPrompt += `\n- Academic Level: ${yearText}`;
      }
      
      if (userContext.bio) {
        personalizedPrompt += `\n- Bio: ${userContext.bio}`;
      }
      
      if (userContext.about) {
        personalizedPrompt += `\n- About: ${userContext.about}`;
      }
      
      personalizedPrompt += `\n\nUse this information to provide personalized, contextually relevant support. Address the user by name when appropriate.`;
    }

    // Build conversation history with proper alternating roles
    const contents = [];
    
    // Add conversation history
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
    
    // Add current user message with personalized prompt
    // Always include identity reminder to maintain MindMate persona
    if (contents.length === 0) {
      // First message - full system prompt
      contents.push({
        role: 'user',
        parts: [{ text: `${personalizedPrompt}\n\nUser: ${userMessage}` }]
      });
    } else {
      // Subsequent messages - add identity reminder
      const identityReminder = `Remember: You are MindMate by Team Eternity. Never mention Google or Gemini.\n\nUser: ${userMessage}`;
      contents.push({
        role: 'user',
        parts: [{ text: identityReminder }]
      });
    }

    console.log('Sending request to Gemini API...', {
      messageCount: contents.length,
      lastRole: contents[contents.length - 1].role
    });

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      },
      {
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('Gemini API response:', JSON.stringify(response.data, null, 2));

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Invalid response format from Gemini API');
    }

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    const crisisDetected = detectCrisis(userMessage);

    console.log('Gemini API response received successfully');
    return {
      response: aiResponse,
      crisisDetected
    };
  } catch (error) {
    console.error('Gemini API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 400) {
      const errorMsg = error.response?.data?.error?.message || 'Invalid request';
      throw new Error(`Gemini API Error: ${errorMsg}`);
    } else if (error.response?.status === 429) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    throw new Error(error.message || 'Failed to generate AI response');
  }
};

export const detectCrisis = (message) => {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'self-harm', 'hurt myself', 'cutting', 'overdose',
    'no reason to live', 'better off dead', 'can\'t go on'
  ];

  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
};

export const generateMoodInsight = async (moodData) => {
  try {
    const prompt = `Based on this mood entry, provide a brief, supportive insight (2-3 sentences):
Mood Score: ${moodData.moodScore}/10
Triggers: ${moodData.triggers?.join(', ') || 'None'}
Activities: ${moodData.activities?.join(', ') || 'None'}
Journal: ${moodData.journalEntry || 'No entry'}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 150,
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Mood insight generation error:', error);
    return null;
  }
};
