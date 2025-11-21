import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listAvailableModels() {
  try {
    console.log('Fetching available Gemini models...\n');
    
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    console.log('Available Models:\n');
    
    response.data.models.forEach(model => {
      console.log(`Model: ${model.name}`);
      console.log(`Display Name: ${model.displayName}`);
      console.log(`Description: ${model.description}`);
      console.log(`Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('---\n');
    });
    
    // Find models that support generateContent
    const contentModels = response.data.models.filter(m => 
      m.supportedGenerationMethods.includes('generateContent')
    );
    
    console.log('\n✅ Models that support generateContent (for chat):');
    contentModels.forEach(m => {
      console.log(`  - ${m.name.replace('models/', '')}`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

listAvailableModels();
