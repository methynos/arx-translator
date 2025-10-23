const axios = require('axios');

// Google Gemini (FREE - 60 requests/minute)
const geminiTranslate = async (sourceCode, sourceLang, targetLang) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Translate this ${sourceLang} code to ${targetLang}. Only return the translated code, no explanations or markdown:\n\n${sourceCode}`
              }
            ]
          }
        ]
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('❌ Gemini Error:', error.message);
    throw new Error('Translation failed: ' + error.message);
  }
};

// Hugging Face (FREE - 30k requests/month)
const huggingfaceTranslate = async (sourceCode, sourceLang, targetLang) => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
      {
        inputs: `Translate this ${sourceLang} code to ${targetLang}. Only return the translated code:\n\n${sourceCode}`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        }
      }
    );

    return response.data[0].generated_text;
  } catch (error) {
    console.error('❌ Hugging Face Error:', error.message);
    throw new Error('Translation failed: ' + error.message);
  }
};

// Anthropic Claude (Cheap - ~$0.80 per million input tokens)
const claudeTranslate = async (sourceCode, sourceLang, targetLang) => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Translate this ${sourceLang} code to ${targetLang}. Only return the translated code, no explanations:\n\n${sourceCode}`
          }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    console.error('❌ Claude Error:', error.message);
    throw new Error('Translation failed: ' + error.message);
  }
};

// Ollama Local (100% FREE - runs locally)
const ollamaTranslate = async (sourceCode, sourceLang, targetLang) => {
  try {
    const response = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'mistral',
        prompt: `Translate this ${sourceLang} code to ${targetLang}. Only return the translated code:\n\n${sourceCode}`,
        stream: false
      }
    );

    return response.data.response;
  } catch (error) {
    console.error('❌ Ollama Error:', error.message);
    throw new Error('Translation failed: ' + error.message);
  }
};

// Main translate function - routes to correct provider
const translateCode = async (sourceCode, sourceLang, targetLang) => {
  const provider = process.env.AI_PROVIDER || 'gemini';

  switch (provider) {
    case 'gemini':
      return geminiTranslate(sourceCode, sourceLang, targetLang);
    case 'huggingface':
      return huggingfaceTranslate(sourceCode, sourceLang, targetLang);
    case 'claude':
      return claudeTranslate(sourceCode, sourceLang, targetLang);
    case 'ollama':
      return ollamaTranslate(sourceCode, sourceLang, targetLang);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
};

const explainCode = async (code, language) => {
  try {
    const provider = process.env.AI_PROVIDER || 'gemini';
    let prompt = `Explain this ${language} code clearly and concisely:\n\n${code}`;

    if (provider === 'gemini') {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        }
      );
      return response.data.candidates[0].content.parts[0].text;
    }

    throw new Error(`Explain not supported for ${provider}`);
  } catch (error) {
    throw new Error('Explanation failed: ' + error.message);
  }
};

const optimizeCode = async (code, language) => {
  try {
    const provider = process.env.AI_PROVIDER || 'gemini';
    let prompt = `Optimize this ${language} code for performance and readability. Only return the optimized code:\n\n${code}`;

    if (provider === 'gemini') {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        }
      );
      return response.data.candidates[0].content.parts[0].text;
    }

    throw new Error(`Optimize not supported for ${provider}`);
  } catch (error) {
    throw new Error('Optimization failed: ' + error.message);
  }
};

module.exports = { translateCode, explainCode, optimizeCode };