import Groq from 'groq-sdk';
import getAIPrompt from './aiPrompt';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Enable browser usage
});

export const getAIResponse = async (userInput: string): Promise<string> => {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('Missing required VITE_GROQ_API_KEY environment variable');
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: getAIPrompt(userInput)
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.9,
      max_tokens: 2048,
      top_p: 1,
      stream: false
    });

    const response = chatCompletion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('Invalid response format from GROQ API');
    }

    return response;
  } catch (error) {
    console.error('GROQ API Error:', error);
    
    if (error instanceof Error) {
      throw new Error(`GROQ API Error: ${error.message}`);
    }
    
    throw new Error('An unexpected error occurred while communicating with GROQ API');
  }
};

export default {
  getAIResponse
}; 