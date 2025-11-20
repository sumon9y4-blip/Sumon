import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the client
// Note: In a real production app, API keys should not be exposed to the frontend client directly 
// if not restricted by domains, but for this prompt's architecture, we use process.env.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateImageWithGemini = async (prompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && parts.length > 0 && parts[0].inlineData) {
      const base64ImageBytes = parts[0].inlineData.data;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
    
    throw new Error("No image data received from Gemini.");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  try {
    // Remove the data URL prefix if present to get raw base64 string
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const mimeType = 'image/png'; // Assuming PNG for simplicity or extract from prefix

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && parts.length > 0 && parts[0].inlineData) {
      const base64ImageBytes = parts[0].inlineData.data;
      return `data:image/png;base64,${base64ImageBytes}`;
    }

    throw new Error("No edited image data received from Gemini.");
  } catch (error) {
    console.error("Gemini Editing Error:", error);
    throw error;
  }
};