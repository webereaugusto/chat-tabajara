
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateLeadResponse = async (history: string, contactName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Histórico de conversa com ${contactName}:\n${history}\n\nSugira uma resposta curta, profissional e amigável em Português para este lead.`,
      config: {
        systemInstruction: "Você é um assistente de vendas de um CRM. Ajude a converter leads.",
        temperature: 0.7,
      },
    });
    
    const text = response.text;
    if (typeof text !== 'string') {
      return "Não foi possível gerar uma resposta válida.";
    }
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, não consegui gerar uma sugestão agora.";
  }
};