
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icon';
import { fetchNounDetails } from '../services/geminiService';
import { speakGerman } from '../utils/tts';
import { NounData, AppStrings, LanguageCode, DataCache } from '../types';

interface NounsViewProps {
  apiKey: string;
  lang: LanguageCode;
  strings: AppStrings;
  onShowExamples: (noun: string, article: string) => void;
  audioEnabled: boolean;
  cache: DataCache;
  onCacheUpdate: (key: string, data: any) => void;
  smartStorage: boolean;
}

export const NounsView: React.FC<NounsViewProps> = ({ 
  apiKey, 
  lang, 
  strings, 
  onShowExamples, 
  audioEnabled,
  cache,
  onCacheUpdate,
  smartStorage
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NounData | null>(null);
  const [error, setError] = useState('');
  
  // History State
  const [nounHistory, setNounHistory] = useState<NounData[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('noun_history_sorted');
      if (stored) {
        setNounHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading history", e);
    }
  }, []);

  // Save history helper function
  const saveToHistory = (item: NounData) => {
    setNounHistory(prev => {
      // Remove existing entry of same word to avoid duplicates, then add new one
      const filtered = prev.filter(i => i.word.toLowerCase() !== item.word.toLowerCase());
      const updated = [...filtered, item];
      // Sort Alphabetically
      updated.sort((a, b) => a.word.localeCompare(b.word));
      
      localStorage.setItem('noun_history_sorted', JSON.stringify(updated));
      return updated;
    });
  };

  // Clear data when input changes significantly to avoid confusion
  useEffect(() => {
    if (!input) setData(null);
  }, [input]);

  const handleCheck = async (wordOverride?: string) => {
    const textToSearch = wordOverride || input;
    const trimmedInput = textToSearch.trim();
    if (!trimmedInput) return;

    if (wordOverride) setInput(wordOverride);

    const cacheKey = `noun_result_${trimmedInput.toLowerCase()}_${lang}`;

    // 1. Check History first (to show immediately if stored)
    const historyItem = nounHistory.find(item => item.word.toLowerCase() === trimmedInput.toLowerCase());
    if (historyItem) {
      setData(historyItem);
      setError('');
      return;
    }

    // 2. Check Cache (if Smart Storage is OFF)
    if (!smartStorage && cache[cacheKey]) {
      setData(cache[cacheKey]);
      setError('');
      saveToHistory(cache[cacheKey]); // Ensure it's in history even if from session cache
      return;
    }

    // 3. Fetch from API
    if (!apiKey) {
      setError(strings.missingKey);
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await fetchNounDetails(trimmedInput, apiKey, lang);
      setData(result);
      // Save result to cache and history
      onCacheUpdate(cacheKey, result);
      saveToHistory(result);
    } catch (err) {
      setError('Connection error. Please check your API key or internet.');
    } finally {
      setLoading(false);
    }
  };

  const getArticleColor = (art: string) => {
    switch (art?.toLowerCase()) {
      case 'der': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'die': return 'text-red-600 bg-red-50 border-red-200';
      case 'das': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getBadgeColor = (art: string) => {
    switch (art?.toLowerCase()) {
      case 'der': return 'bg-blue-100 text-blue-800';
      case 'die': return 'bg-red-100 text-red-800';
      case 'das': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {strings.enterNoun}
        </label>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none text-left"
            placeholder="e.g. Tisch"
            dir="ltr"
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          />
          <button
            onClick={() => handleCheck()}
            disabled={loading || !input}
            className="w-full bg-red-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '...' : strings.checkNoun}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {data && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 flex flex-col items-center animate-fade-in text-center relative overflow-hidden">
          <span className="text-sm text-gray-400 mb-2">{strings.nounResult}</span>
          
          <div 
            className={`flex items-baseline gap-3 mb-4 px-6 py-3 rounded-2xl border-2 ${getArticleColor(data.article)}`}
            dir="ltr"
          >
            <span className="text-3xl font-bold">{data.article}</span>
            <span className="text-3xl font-bold">{data.word}</span>
          </div>

          <p className="text-xl text-slate-600 mb-6 font-arabic">{data.translation}</p>

          {audioEnabled && (
            <button
              onClick={() => speakGerman(`${data.article} ${data.word}`)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors mb-4"
            >
              <Icons.Speaker className="w-5 h-5" />
              <span className="font-bold">{strings.pronunciation}</span>
            </button>
          )}

          {/* New Plural Section */}
          {data.plural && (
            <div className="flex flex-col items-center gap-1 mb-6 animate-fade-in">
               <span className="text-xs text-gray-400 uppercase tracking-wide">{strings.nounPlural}</span>
               <span className="text-lg font-bold text-slate-700 bg-gray-50 px-4 py-1 rounded-lg border border-gray-200" dir="ltr">
                 {data.plural}
               </span>
            </div>
          )}

          <button
            onClick={() => onShowExamples(data.word, data.article)}
            className="mt-2 text-blue-600 underline text-sm font-bold hover:text-blue-800 transition-colors"
          >
            {strings.examples}
          </button>
        </div>
      )}

      {/* History Section */}
      {nounHistory.length > 0 && (
        <div className="animate-fade-in">
           <h3 className="text-lg font-bold text-slate-800 mb-3 px-1">{strings.nounHistory}</h3>
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
              {nounHistory.map((item, idx) => (
                <div key={`${item.word}-${idx}`} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                   <button 
                     onClick={() => handleCheck(item.word)}
                     className="flex flex-col gap-1 items-start text-start flex-1"
                   >
                      <div className="flex items-center gap-2" dir="ltr">
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${getBadgeColor(item.article)}`}>
                           {item.article}
                         </span>
                         <span className="text-base font-bold text-slate-800">
                           {item.word}
                         </span>
                      </div>
                      <span className="text-sm text-gray-500 font-arabic">
                        {item.translation}
                      </span>
                   </button>
                   
                   {audioEnabled && (
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         speakGerman(`${item.article} ${item.word}`);
                       }}
                       className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors ml-2"
                     >
                       <Icons.Speaker className="w-5 h-5" />
                     </button>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
