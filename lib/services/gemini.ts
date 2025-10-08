// lib/services/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are MindMate, an empathetic AI wellness companion for university students. Your role:

1. Listen actively and validate feelings
2. Provide evidence-based coping strategies (CBT, mindfulness)
3. Never diagnose or replace professional therapy
4. Detect crisis situations and provide resources
5. Be warm, supportive, and non-judgmental
6. Use simple, student-friendly language

Remember: You're a supportive friend, not a therapist.`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  crisisDetected: boolean;
  sentiment: number;
  error?: boolean;
}

export async function getChatResponse(
  conversationHistory: ChatMessage[],
  userMessage: string
): Promise<ChatResponse> {
  try {
    // Initialize Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Format conversation history for Gemini
    const chatHistory = conversationHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      },
    });

    // Prepend system prompt to first message
    const messageWithContext = conversationHistory.length === 0
      ? `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`
      : userMessage;

    // Send message and get response
    const result = await chat.sendMessage(messageWithContext);
    const response = await result.response;
    const assistantMessage = response.text();

    // Crisis detection (basic keyword matching)
    const crisisDetected = detectCrisis(userMessage);

    return {
      message: assistantMessage,
      crisisDetected,
      sentiment: 0, // Implement sentiment analysis if needed
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      message: "I'm having trouble connecting right now. Please try again in a moment.",
      crisisDetected: false,
      sentiment: 0,
      error: true,
    };
  }
}

function detectCrisis(text: string): boolean {
  const crisisKeywords = [
    'suicide',
    'kill myself',
    'end it all',
    'want to die',
    'self harm',
    'cutting',
    'hurting myself',
    'no reason to live',
  ];

  const lowerText = text.toLowerCase();
  return crisisKeywords.some(keyword => lowerText.includes(keyword));
}

// Alternative: Gemini with streaming support
export async function getChatResponseStreaming(
  conversationHistory: ChatMessage[],
  userMessage: string,
  onChunk: (text: string) => void
): Promise<ChatResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const chatHistory = conversationHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const messageWithContext = conversationHistory.length === 0
      ? `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`
      : userMessage;

    const result = await chat.sendMessageStream(messageWithContext);
    let fullText = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(chunkText);
    }

    const crisisDetected = detectCrisis(userMessage);

    return {
      message: fullText,
      crisisDetected,
      sentiment: 0,
    };

  } catch (error) {
    console.error('Gemini Streaming Error:', error);
    return {
      message: "I'm having trouble connecting right now. Please try again in a moment.",
      crisisDetected: false,
      sentiment: 0,
      error: true,
    };
  }
}