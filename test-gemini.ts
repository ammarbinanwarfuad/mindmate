import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function testGemini() {
  try {
    console.log('🧪 Testing Gemini API...\n');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = "Hello! I'm feeling stressed about my exams. Can you help?";
    
    console.log('📤 Sending message:', prompt);
    console.log('');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini Response:');
    console.log(text);
    console.log('\n✅ Test successful!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGemini();