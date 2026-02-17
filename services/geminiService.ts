
import { GoogleGenAI } from "@google/genai";
import { ImageSize, AspectRatio } from "../types";

export class GeminiImageService {
  private static instance: GeminiImageService;
  
  private constructor() {}

  public static getInstance(): GeminiImageService {
    if (!GeminiImageService.instance) {
      GeminiImageService.instance = new GeminiImageService();
    }
    return GeminiImageService.instance;
  }

  public async generateImage(
    prompt: string,
    config: { size: ImageSize; aspectRatio: AspectRatio }
  ): Promise<string> {
    // Creating a fresh instance to ensure the latest API key from the global session is used
    // MUST use new GoogleGenAI({ apiKey: process.env.API_KEY })
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { text: prompt },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: config.aspectRatio,
            imageSize: config.size,
          },
          // Google Search tool is available for gemini-3-pro-image-preview
          tools: [{ googleSearch: {} }],
        },
      });

      // Find the first image part in the response candidates
      const candidates = response.candidates || [];
      if (candidates.length > 0 && candidates[0].content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("No image data returned from the model. Try a different prompt.");
    } catch (error: any) {
      console.error("Gemini Image Generation Error:", error);
      
      const errorMsg = error?.message || "";
      // The 403 / PERMISSION_DENIED error usually indicates a non-paid project key
      const isPermissionError = errorMsg.includes("PERMISSION_DENIED") || 
                               errorMsg.includes("does not have permission") ||
                               errorMsg.includes("403");
      const isNotFoundError = errorMsg.includes("Requested entity was not found");

      // Handle the specific errors mentioned in instructions for API key issues
      if (isNotFoundError || isPermissionError) {
         throw new Error("API_KEY_RESET_REQUIRED");
      }
      
      throw new Error(error.message || "An unexpected error occurred during generation.");
    }
  }
}
