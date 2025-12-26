
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NounData, VerbResult, VerbMeaning, NounCaseExample, GrammarTopic, GrammarExplanation, ToolItem, ToolDetail, LanguageCode, ConversationTurn, ConversationKeyword } from "../types";
import { 
  getNounPrompt, 
  getVerbConjugationPrompt, 
  getChatSystemInstruction, 
  getVerbMeaningsPrompt, 
  getNounCasesPrompt,
  getGrammarTopicsPrompt,
  getGrammarExplanationPrompt,
  getToolsListPrompt,
  getToolDetailPrompt,
  getConversationPrompt,
  getConversationExtensionPrompt,
  getKeywordsPrompt
} from "../constants";

// Noun Response Schema
const nounSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    article: { type: Type.STRING, enum: ["der", "die", "das"] },
    word: { type: Type.STRING },
    plural: { type: Type.STRING }, // New Plural Field
    translation: { type: Type.STRING },
  },
  required: ["article", "word", "translation"],
};

// Verb Response Schema
const verbSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    conjugations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          pronoun: { type: Type.STRING },
          conjugation: { type: Type.STRING },
          exampleDe: { type: Type.STRING },
          exampleAr: { type: Type.STRING },
        },
        required: ["pronoun", "conjugation", "exampleDe", "exampleAr"],
      },
    },
  },
  required: ["conjugations"],
};

// Verb Meanings Schema
const meaningsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    meanings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          meaning: { type: Type.STRING },
          exampleDe: { type: Type.STRING },
          exampleAr: { type: Type.STRING },
        },
        required: ["meaning", "exampleDe", "exampleAr"],
      },
    },
  },
  required: ["meanings"],
};

// Noun Cases Schema
const nounCasesSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          caseName: { type: Type.STRING },
          sentenceDe: { type: Type.STRING },
          sentenceAr: { type: Type.STRING },
        },
        required: ["caseName", "sentenceDe", "sentenceAr"],
      },
    },
  },
  required: ["cases"],
};

// Grammar Topics Schema
const grammarTopicsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          titleAr: { type: Type.STRING },
          titleDe: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["titleAr", "titleDe", "description"],
      },
    },
  },
  required: ["topics"],
};

// Grammar Explanation Schema
const grammarExplanationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    explanation: { type: Type.STRING },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          de: { type: Type.STRING },
          ar: { type: Type.STRING },
        },
        required: ["de", "ar"],
      },
    },
  },
  required: ["title", "explanation", "examples"],
};

// Tools List Schema
const toolsListSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tools: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          translation: { type: Type.STRING },
          level: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["word", "translation", "level", "description"],
      },
    },
  },
  required: ["tools"],
};

// Tool Detail Schema
const toolDetailSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    level: { type: Type.STRING },
    meaningAr: { type: Type.STRING },
    usageAr: { type: Type.STRING },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          de: { type: Type.STRING },
          ar: { type: Type.STRING },
        },
        required: ["de", "ar"],
      },
    },
  },
  required: ["word", "level", "meaningAr", "usageAr", "examples"],
};

// Conversation Schema
const conversationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    conversation: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: { type: Type.STRING, enum: ["A", "B"] },
          textDe: { type: Type.STRING },
          ttsText: { type: Type.STRING }, // Added ttsText
          textAr: { type: Type.STRING },
        },
        required: ["speaker", "textDe", "textAr"],
      },
    },
  },
  required: ["conversation"],
};

// Keywords Schema
const keywordsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    keywords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          meaning: { type: Type.STRING },
        },
        required: ["word", "meaning"],
      },
    },
  },
  required: ["keywords"],
};

// --- EXISTING FETCH FUNCTIONS ---

export const fetchNounDetails = async (noun: string, apiKey: string, lang: LanguageCode): Promise<NounData> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getNounPrompt(lang).replace("{noun}", noun),
      config: {
        responseMimeType: "application/json",
        responseSchema: nounSchema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as NounData;
  } catch (error) {
    console.error("Gemini Noun Error:", error);
    throw error;
  }
};

export const fetchVerbConjugation = async (
  verb: string,
  category: string,
  subcategory: string,
  apiKey: string,
  lang: LanguageCode
): Promise<VerbResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getVerbConjugationPrompt(lang)
        .replace("{verb}", verb)
        .replace("{category}", category)
        .replace("{subcategory}", subcategory),
      config: {
        responseMimeType: "application/json",
        responseSchema: verbSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    return {
      tenseName: subcategory,
      conjugations: data.conjugations,
    };
  } catch (error) {
    console.error("Gemini Verb Error:", error);
    throw error;
  }
};

export const fetchVerbMeanings = async (verb: string, apiKey: string, lang: LanguageCode): Promise<VerbMeaning[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getVerbMeaningsPrompt(lang).replace("{verb}", verb),
      config: {
        responseMimeType: "application/json",
        responseSchema: meaningsSchema,
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    return data.meanings;
  } catch (error) {
    console.error("Gemini Meanings Error:", error);
    throw error;
  }
};

export const fetchNounCases = async (noun: string, article: string, apiKey: string, lang: LanguageCode): Promise<NounCaseExample[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getNounCasesPrompt(lang)
        .replace("{noun}", noun)
        .replace("{article}", article),
      config: {
        responseMimeType: "application/json",
        responseSchema: nounCasesSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    return data.cases;
  } catch (error) {
    console.error("Gemini Noun Cases Error:", error);
    throw error;
  }
}

export const fetchGrammarTopics = async (level: string, apiKey: string, lang: LanguageCode): Promise<GrammarTopic[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getGrammarTopicsPrompt(lang).replace("{level}", level),
      config: {
        responseMimeType: "application/json",
        responseSchema: grammarTopicsSchema,
        temperature: 0.2,
      },
    });
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text).topics;
  } catch (error) {
    console.error("Gemini Topics Error:", error);
    throw error;
  }
};

export const fetchGrammarExplanation = async (topic: GrammarTopic, level: string, apiKey: string, lang: LanguageCode): Promise<GrammarExplanation> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getGrammarExplanationPrompt(lang)
        .replace("{titleDe}", topic.titleDe)
        .replace("{titleAr}", topic.titleAr)
        .replace("{level}", level),
      config: {
        responseMimeType: "application/json",
        responseSchema: grammarExplanationSchema,
        temperature: 0.3,
      },
    });
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    throw error;
  }
};

export const fetchToolsList = async (categoryId: string, categoryName: string, apiKey: string, lang: LanguageCode): Promise<ToolItem[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getToolsListPrompt(lang)
        .replace("{categoryName}", categoryName)
        .replace("{categoryId}", categoryId),
      config: {
        responseMimeType: "application/json",
        responseSchema: toolsListSchema,
        temperature: 0.2,
      },
    });
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text).tools;
  } catch (error) {
    console.error("Gemini Tools List Error:", error);
    throw error;
  }
};

export const fetchToolDetail = async (tool: ToolItem, categoryName: string, apiKey: string, lang: LanguageCode): Promise<ToolDetail> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getToolDetailPrompt(lang)
        .replace("{word}", tool.word)
        .replace("{categoryName}", categoryName)
        .replace("{level}", tool.level),
      config: {
        responseMimeType: "application/json",
        responseSchema: toolDetailSchema,
        temperature: 0.3,
      },
    });
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Tool Detail Error:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  message: string,
  contextDe: string,
  contextAr: string,
  history: {role: string, parts: {text: string}[]}[],
  apiKey: string,
  lang: LanguageCode
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const systemInstruction = getChatSystemInstruction(lang)
      .replace("{contextDe}", contextDe)
      .replace("{contextAr}", contextAr);

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      history: history,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const result = await chat.sendMessage({ message: message });
    return result.text || "Sorry, I couldn't reply.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
}

// --- NEW CONVERSATION FUNCTIONS ---

export const generateConversation = async (
  level: string,
  topic: string,
  length: string,
  apiKey: string,
  lang: LanguageCode,
  isAustrian: boolean = false
): Promise<ConversationTurn[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getConversationPrompt(lang, length, isAustrian)
        .replace("{level}", level)
        .replace("{topic}", topic)
        .replace("{length}", length),
      config: {
        responseMimeType: "application/json",
        responseSchema: conversationSchema,
        temperature: 0.3,
      },
    });
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text).conversation;
  } catch (error) {
    console.error("Conversation Generation Error:", error);
    throw error;
  }
};

export const extendConversation = async (
  level: string,
  userInput: string,
  topic: string,
  apiKey: string,
  lang: LanguageCode,
  isAustrian: boolean = false
): Promise<ConversationTurn[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    // Note: We don't need lastSpeaker anymore because USER is ALWAYS 'A'
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getConversationExtensionPrompt(lang, isAustrian)
        .replace("{level}", level)
        .replace("{userInput}", userInput)
        .replace("{topic}", topic)
        .replace("{topic}", topic), // Replace twice if prompt uses it twice
      config: {
        responseMimeType: "application/json",
        responseSchema: conversationSchema,
        temperature: 0.4, 
      },
    });
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text).conversation;
  } catch (error) {
    console.error("Conversation Extension Error:", error);
    throw error;
  }
};

export const extractKeywords = async (
  conversationText: string,
  apiKey: string,
  lang: LanguageCode
): Promise<ConversationKeyword[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: getKeywordsPrompt(lang) },
        { text: conversationText }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: keywordsSchema,
        temperature: 0.2,
      },
    });
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text).keywords;
  } catch (error) {
    console.error("Keyword Extraction Error:", error);
    throw error;
  }
};
