
export type Article = 'der' | 'die' | 'das';

export interface NounData {
  word: string;
  article: Article;
  translation: string;
  plural?: string; // Added plural field
}

export interface VerbConjugation {
  pronoun: string;
  conjugation: string;
  exampleDe: string;
  exampleAr: string;
}

export interface VerbResult {
  tenseName: string;
  conjugations: VerbConjugation[];
}

export interface VerbMeaning {
  meaning: string;
  exampleDe: string;
  exampleAr: string;
}

export interface NounCaseExample {
  caseName: string;
  sentenceDe: string;
  sentenceAr: string;
}

export interface GrammarTopic {
  id: string;
  titleAr: string;
  titleDe: string;
  description: string;
}

export interface GrammarExplanation {
  title: string;
  explanation: string; // Markdown supported
  examples: {
    de: string;
    ar: string;
  }[];
}

export interface ToolItem {
  word: string;
  translation: string;
  level: string; // A1, A2, etc.
  description: string;
}

export interface ToolDetail {
  word: string;
  level: string;
  meaningAr: string;
  usageAr: string; // Markdown
  examples: {
    de: string;
    ar: string;
  }[];
}

// --- NEW CONVERSATION TYPES ---
export interface ConversationTurn {
  speaker: 'A' | 'B';
  textDe: string;
  ttsText?: string; // Standard German approximation for TTS
  textAr: string;
}

export interface ConversationKeyword {
  word: string;
  meaning: string;
}

export type ConversationLength = 'short' | 'medium' | 'long';

export interface SavedConversationMetadata {
  id: string;
  topic: string;
  level: string;
  length: ConversationLength;
  timestamp: number;
  isAustrian?: boolean; // Added for history filtering
}

export type ViewState = 
  | { name: 'HOME' }
  | { name: 'SETTINGS' }
  | { name: 'NOUNS' }
  | { name: 'NOUN_EXAMPLES'; noun: string; article: string }
  | { name: 'VERBS_INPUT' }
  | { name: 'VERBS_MENU'; verb: string }
  | { 
      name: 'VERBS_DETAIL'; 
      verb: string; 
      category: string; 
      subcategory: string; 
    }
  | { name: 'VERBS_MEANINGS'; verb: string }
  | { name: 'GRAMMAR_LEVELS' }
  | { name: 'GRAMMAR_TOPICS'; level: string }
  | { name: 'GRAMMAR_DETAIL'; level: string; topic: GrammarTopic }
  | { name: 'TOOLS_CATEGORIES' }
  | { name: 'TOOLS_LIST'; categoryId: string; categoryName: string }
  | { name: 'TOOL_DETAIL'; tool: ToolItem; categoryName: string }
  | {
      name: 'CHAT';
      contextDe: string;
      contextAr: string;
    }
  | { name: 'CONV_LEVELS' }
  | { name: 'CONV_HISTORY'; isAustrian: boolean } // Added filter prop
  | { name: 'CONV_SETUP'; level: string; isAustrian: boolean }
  | { 
      name: 'CONV_RESULT'; 
      level: string; 
      topic: string; 
      length: ConversationLength;
      isAustrian: boolean;
    };

export type AudioSetting = 'preload' | 'ondemand' | 'disabled';

export interface AppState {
  apiKey: string;
  language: LanguageCode;
  viewStack: ViewState[];
  smartStorageEnabled: boolean;
  audioSetting: AudioSetting;
  srsEnabled: boolean;
}

export const CATEGORIES = {
  TENSES: 'TENSES',
  FORMS: 'FORMS',
  PASSIVE: 'PASSIVE'
} as const;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type DataCache = Record<string, any>;

export type LanguageCode = 'ar' | 'en' | 'de' | 'uk' | 'es' | 'tr' | 'ru' | 'hu' | 'fa' | 'sr' | 'fr' | 'it' | 'ja' | 'zh-CN' | 'ur' | 'ro' | 'hi';

export interface AppStrings {
  appName: string;
  tagline: string;
  verbs: string;
  verbsDesc: string;
  nouns: string;
  nounsDesc: string;
  grammar: string;
  grammarDesc: string;
  tools: string;
  toolsDesc: string;
  settings: string;
  back: string;
  enterNoun: string;
  checkNoun: string;
  enterVerb: string;
  continue: string;
  tenses: string;
  forms: string;
  passive: string;
  loading: string;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  save: string;
  missingKey: string;
  examples: string;
  pronunciation: string;
  askAi: string;
  testMe: string;
  chatTitle: string;
  chatPlaceholder: string;
  send: string;
  nounResult: string;
  article: string;
  word: string;
  translation: string;
  showMeanings: string;
  meaningsTitle: string;
  nounCasesTitle: string;
  selectLevel: string;
  topicsFor: string;
  toolsCategories: string;
  selectTool: string;
  language: string;
  selectLanguage: string;
  smartStorage: string;
  smartStorageDesc: string;
  audioSettings: string;
  audioPreload: string;
  audioOnDemand: string;
  audioDisabled: string;
  srsSystem: string;
  srsDesc: string;
  copyright: string;
  disclaimer: string;
  privacy: string;
  needKeyTitle: string;
  getKeyLink: string;
  howToGetKeyLink: string;
  // Conversation Feature Strings
  convTitle: string;
  convDesc: string;
  convTopicLabel: string;
  convTopicPlaceholder: string;
  convLengthLabel: string;
  convShort: string;
  convMedium: string;
  convLong: string;
  convStart: string;
  convShowTrans: string;
  convHideTrans: string;
  convSlowSpeed: string;
  convNormalSpeed: string;
  convExtractKeywords: string;
  convKeywordsTitle: string;
  convAddMoreLabel: string;
  convAddMorePlaceholder: string;
  convAddButton: string;
  convSuggestedTopics: string;
  convHistory: string;
  convNoHistory: string;
  convAustrianLabel: string;
  convAustrianDisclaimer: string;
  // New Noun strings
  nounPlural: string;
  nounHistory: string;
  categories: {
    tenses: Record<string, string>;
    forms: Record<string, string>;
    passive: Record<string, string>;
  };
  toolCategories: Record<string, string>;
  convTopicsList: string[];
}
