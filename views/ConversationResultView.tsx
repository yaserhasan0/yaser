
import React, { useEffect, useState, useRef } from 'react';
import { Icons } from '../components/Icon';
import { generateConversation, extendConversation, extractKeywords } from '../services/geminiService';
import { speakGerman } from '../utils/tts';
import { ConversationLength, ConversationTurn, ConversationKeyword, AppStrings, LanguageCode, DataCache, SavedConversationMetadata } from '../types';

interface ConversationResultViewProps {
  level: string;
  topic: string;
  length: ConversationLength;
  isAustrian: boolean;
  apiKey: string;
  lang: LanguageCode;
  strings: AppStrings;
  cache: DataCache;
  onCacheUpdate: (key: string, data: any) => void;
  audioEnabled: boolean;
  onSaveHistory: (meta: SavedConversationMetadata) => void;
}

export const ConversationResultView: React.FC<ConversationResultViewProps> = ({
  level,
  topic,
  length,
  isAustrian,
  apiKey,
  lang,
  strings,
  cache,
  onCacheUpdate,
  audioEnabled,
  onSaveHistory
}) => {
  const cacheKey = `conv_${level}_${topic}_${length}_${lang}_${isAustrian}`;
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [error, setError] = useState('');
  
  // UI State
  const [showTranslation, setShowTranslation] = useState(false);
  const [slowSpeed, setSlowSpeed] = useState(false);
  const [extensionInput, setExtensionInput] = useState('');
  const [extending, setExtending] = useState(false);
  const [keywords, setKeywords] = useState<ConversationKeyword[]>([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check cache
    if (cache[cacheKey]) {
      setConversation(cache[cacheKey]);
      setLoading(false);
      // Ensure history is saved even if loaded from cache
      onSaveHistory({
        id: cacheKey,
        topic,
        level,
        length,
        timestamp: Date.now(),
        isAustrian
      });
      return;
    }

    const start = async () => {
      if (!apiKey) {
        setError(strings.missingKey);
        setLoading(false);
        return;
      }
      try {
        const res = await generateConversation(level, topic, length, apiKey, lang, isAustrian);
        setConversation(res);
        onCacheUpdate(cacheKey, res); // Cache initial result
        
        // Save to History List
        onSaveHistory({
          id: cacheKey,
          topic,
          level,
          length,
          timestamp: Date.now(),
          isAustrian
        });

      } catch (err) {
        setError('Failed to generate conversation.');
      } finally {
        setLoading(false);
      }
    };
    start();
  }, []); // Run once on mount

  useEffect(() => {
    if (!loading && conversation.length > 0) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, conversation.length]);

  const handleExtend = async () => {
    if (!extensionInput.trim() || extending || !apiKey) return;
    
    setExtending(true);
    const userInput = extensionInput.trim();
    setExtensionInput('');

    try {
      // Pass topic for context maintenance
      // We do not need lastSpeaker because User is ALWAYS A.
      const newTurns = await extendConversation(level, userInput, topic, apiKey, lang, isAustrian);
      
      const updatedConv = [...conversation, ...newTurns];
      setConversation(updatedConv);
      onCacheUpdate(cacheKey, updatedConv); // Update cache with extended convo
    } catch (err) {
      alert('Error extending conversation');
    } finally {
      setExtending(false);
    }
  };

  const handleExtractKeywords = async () => {
    if (keywords.length > 0) {
      setShowKeywords(!showKeywords);
      return;
    }
    
    setLoadingKeywords(true);
    try {
      // Concatenate German text for analysis
      const fullText = conversation.map(t => t.textDe).join(' ');
      const res = await extractKeywords(fullText, apiKey, lang);
      setKeywords(res);
      setShowKeywords(true);
    } catch (err) {
      alert('Error extracting keywords');
    } finally {
      setLoadingKeywords(false);
    }
  };

  const handleSpeak = (turn: ConversationTurn) => {
    const rate = slowSpeed ? 0.6 : 1.0;
    // Pitch shift: A (Me) = 1.0, B (Other) = 0.8
    const pitch = turn.speaker === 'A' ? 1.0 : 0.8;
    
    // Use ttsText if available (especially for Austrian mode), otherwise fallback to textDe
    const textToSpeak = turn.ttsText || turn.textDe;
    speakGerman(textToSpeak, rate, pitch);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">{strings.loading}</p>
        <p className="text-sm text-emerald-600 mt-2 font-bold">{topic}</p>
        {isAustrian && <p className="text-xs text-red-500 mt-1 font-bold">🇦🇹 Austrian Mode</p>}
      </div>
    );
  }

  if (error) {
     return (
      <div className="bg-red-50 p-6 rounded-2xl text-center border border-red-100">
        <p className="text-red-600 mb-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 1. Header (Controls) - Non-scrolling */}
      <div className="flex-none p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex gap-2">
           <button 
             onClick={() => setShowTranslation(!showTranslation)}
             className={`p-2 rounded-lg transition-colors ${showTranslation ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-500 border border-gray-200'}`}
             title={showTranslation ? strings.convHideTrans : strings.convShowTrans}
           >
             {showTranslation ? <Icons.Eye className="w-5 h-5" /> : <Icons.EyeOff className="w-5 h-5" />}
           </button>
           <button 
             onClick={() => setSlowSpeed(!slowSpeed)}
             className={`p-2 rounded-lg transition-colors ${slowSpeed ? 'bg-amber-100 text-amber-700' : 'bg-white text-gray-500 border border-gray-200'}`}
             title={slowSpeed ? strings.convNormalSpeed : strings.convSlowSpeed}
           >
             {slowSpeed ? <Icons.Turtle className="w-5 h-5" /> : <Icons.Rabbit className="w-5 h-5" />}
           </button>
        </div>
        <button 
          onClick={handleExtractKeywords}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${showKeywords ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 border border-gray-200'}`}
        >
          {loadingKeywords ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
          ) : (
             <Icons.Key className="w-4 h-4" />
          )}
          <span>{strings.convKeywordsTitle}</span>
        </button>
      </div>

      {/* 2. Keywords Panel - Non-scrolling (optional) */}
      {showKeywords && keywords.length > 0 && (
        <div className="flex-none bg-indigo-50 p-4 border-b border-indigo-100 animate-fade-in max-h-40 overflow-y-auto">
           <div className="space-y-2">
             {keywords.map((kw, i) => (
               <div key={i} className="flex justify-between border-b border-indigo-100 last:border-0 pb-1 last:pb-0">
                 <span className="font-bold text-slate-800" dir="ltr">{kw.word}</span>
                 <span className="text-slate-600">{kw.meaning}</span>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* 3. Chat Area - Flex Expand & Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {conversation.map((turn, idx) => {
           // Logic:
           // Person A (User): Right Side (justify-start in RTL), Green Background
           // Person B (AI): Left Side (justify-end in RTL), White Background
           const isUser = turn.speaker === 'A';
           
           return (
             <div key={idx} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                    isUser 
                      ? 'bg-emerald-50 border-emerald-100 rounded-tr-none' // User (A) Green
                      : 'bg-white border-gray-200 rounded-tl-none'        // AI (B) White
                }`}>
                   <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${isUser ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {isUser ? 'Person A' : 'Person B'}
                      </span>
                      {audioEnabled && (
                        <button 
                          onClick={() => handleSpeak(turn)}
                          className="p-1 rounded-full hover:bg-black/5 text-slate-400"
                        >
                          <Icons.Speaker className="w-3 h-3" />
                        </button>
                      )}
                   </div>
                   <p className="text-slate-800 text-lg leading-relaxed mb-1" dir="ltr">{turn.textDe}</p>
                   {showTranslation && (
                     <p className="text-slate-500 text-sm border-t border-black/5 pt-2 mt-2">{turn.textAr}</p>
                   )}
                </div>
             </div>
           );
         })}
         {extending && (
           <div className="flex justify-center py-4">
             <div className="flex gap-1">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
         )}
         
         {/* Austrian Disclaimer */}
         {isAustrian && (
           <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-xs text-red-700 font-medium">
                {strings.convAustrianDisclaimer}
              </p>
           </div>
         )}
         
         <div ref={endRef} />
      </div>

      {/* 4. Footer (Input) - Non-scrolling/Fixed at bottom of flex container */}
      <div className="flex-none p-4 border-t border-gray-200 bg-white">
        <div className="max-w-md mx-auto">
           <label className="text-xs text-slate-400 font-bold mb-2 block ml-1">{strings.convAddMoreLabel}</label>
           <div className="flex gap-2">
             <input 
               type="text" 
               value={extensionInput}
               onChange={(e) => setExtensionInput(e.target.value)}
               placeholder={strings.convAddMorePlaceholder}
               className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
               onKeyDown={(e) => e.key === 'Enter' && handleExtend()}
             />
             <button 
               onClick={handleExtend}
               disabled={!extensionInput.trim() || extending}
               className="bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
             >
               <Icons.Send className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
