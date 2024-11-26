import OpenAI from "openai";

class GptService {
  private static instance: GptService;
  private readonly apiKey: string;
  private openai: OpenAI;

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.openai = new OpenAI({
      apiKey,
    });
  }

  static getInstance(): GptService {
    if (!GptService.instance) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
      }
      GptService.instance = new GptService(apiKey);
    }
    return GptService.instance;
  }

  // Note: Transform input is a function that takes an input and returns a transformed input based on the instructions (role taken from supabase persona).
  async transformInput(input: string, instructions: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: input },
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export const gpt = GptService.getInstance();
