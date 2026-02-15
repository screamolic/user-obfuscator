
import { GoogleGenAI, Type } from "@google/genai";
import { ObfuscationInput, ObfuscationResponse } from "../types";

// @google/genai guidelines: Use specific model names and handle grounding metadata extraction.
export const analyzeAndObfuscate = async (input: ObfuscationInput): Promise<ObfuscationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Bertindaklah sebagai ahli Data Privacy dan Obfuscation Spesialis Indonesia.
    
    TUGAS 1: Analisis Alamat
    Verifikasi apakah alamat "${input.address}" adalah alamat valid di Indonesia. Berikan format standar yang paling rapi.
    
    TUGAS 2: Generasi 10 Variasi Obfuscation
    Buat 10 variasi untuk Nama: "${input.name}" dan Alamat tersebut.
    
    ATURAN KHUSUS UNTUK NAMA:
    - WAJIB tambahkan variasi kata panggilan/honorifics lokal secara acak (Bp, Bpk, Ibu, Kak, Sdr, Sdri, Ko, Ci, Ny).
    - WAJIB gunakan teknik karakter ganda pada huruf vokal atau konsonan yang tidak merusak keterbacaan (contoh: Budi -> Buudi, Santoso -> Santoooso).
    - Terapkan juga teknik invisible characters dan homoglyphs pada nama.
    
    TEKNIK UMUM (Nama & Alamat):
    - Invisible Unicode (ZWSP \u200B, Word Joiner \u2060, FEFF)
    - Homoglyphs (Latin 'a' -> Cyrillic 'а', Latin 'o' -> Greek 'ο', dll.)
    - Contextual Abbr (Jl, Jln, J-L-N, Kav, Gg, Gng, No, #, Blk, Lantai -> Lt)
    - Whitespace variation (Double space, thin space)
    
    Setiap variasi harus terlihat 100% identik bagi manusia tapi berbeda secara biner bagi sistem. Berikan 'evasionScore' (0-100).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Grounding for address verification
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                isValid: { type: Type.BOOLEAN },
                standardized: { type: Type.STRING },
                regionHint: { type: Type.STRING }
              },
              required: ["isValid", "standardized", "regionHint"]
            },
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  version: { type: Type.STRING },
                  techniques: { type: Type.ARRAY, items: { type: Type.STRING } },
                  readability: { type: Type.STRING },
                  evasionScore: { type: Type.NUMBER },
                  complexity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
                },
                required: ["version", "techniques", "readability", "evasionScore", "complexity"]
              }
            }
          },
          required: ["analysis", "variations"]
        }
      }
    });

    // @google/genai guidelines: Extract text using the .text property.
    const data = JSON.parse(response.text || '{}');
    
    // @google/genai guidelines: Extract website URLs from groundingChunks and list them.
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri,
    })).filter((s: any) => s.uri) || [];

    return {
      variations: data.variations || [],
      analysis: data.analysis || { isValid: false, standardized: '', regionHint: '' },
      sources
    };
  } catch (error) {
    console.error("Error in complex obfuscation:", error);
    throw error;
  }
};
