
import React, { useEffect, useState, useRef } from 'react';
import { Icons } from '../components/Icon';
import { fetchNounCases } from '../services/geminiService';
import { speakGerman } from '../utils/tts';
import { NounCaseExample, DataCache, AppStrings, LanguageCode } from '../types';

interface NounExamplesViewProps {
  noun: string;
  article: string;
  apiKey: string;
  lang: LanguageCode;
  strings: AppStrings;
  onChat: (de: string, ar: string) => void;
  cache: DataCache;
  onCacheUpdate: (key: string, data: any) => void;
  smartStorage: boolean;
  audioEnabled: boolean;
}

export const NounExamplesView: React.FC<NounExamplesViewProps> = ({ 
  noun, 
  article, 
  apiKey,
  lang,
  strings,
  onChat,
  cache,
  onCacheUpdate,
  smartStorage,
  audioEnabled
}) => {
  const cacheKey = `noun_ex_${noun}_${article}_${lang}`;
  // If Smart Storage is ON, ignore cache initially. If OFF, check cache.
  const [loading, setLoading] = useState(smartStorage ? true : !cache[cacheKey]);
  const [data, setData] = useState<NounCaseExample[] | null>(smartStorage ? null : (cache[cacheKey] || null));
  const [error, setError] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    // If data exists and Smart Storage is OFF, do nothing (use cached data)
    if (data && !smartStorage) return;

    const load = async () => {
      if (!apiKey) {
        setError(strings.missingKey);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetchNounCases(noun, article, apiKey, lang);
        setData(res);
        // Always update cache for future reference (if they turn Smart Storage off later)
        onCacheUpdate(cacheKey, res);
      } catch (err) {
        setError('Error loading examples.');
      } finally {
        setLoading(false);
      }
    };
    load();
    // Dependency array includes smartStorage to re-trigger if it changes while component is mounted?
    // The prompt says "If user searches ... and button is off ... instant load". 
    // Usually this View mounts when navigated to.
  }, [noun, article, apiKey, lang, cacheKey, onCacheUpdate, strings, smartStorage]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (text: string) => {
    timerRef.current = setTimeout(() => {
      navigator.clipboard.writeText(text);
      if (navigator.vibrate) navigator.vibrate(50);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    }, 800);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">{strings.loading}</p>
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
    <div className="flex flex-col gap-4 animate-fade-in pb-10">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center mb-2">
         <span className="text-gray-500 text-xs mb-1">{strings.nouns}</span>
         <div className="text-2xl font-bold text-slate-800" dir="ltr">
            <span className="text-blue-600">{article}</span> {noun}
         </div>
      </div>

      <div className="space-y-4">
        {data?.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 p-3 border-b border-blue-100 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <h3 className="font-bold text-blue-900">{item.caseName}</h3>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start gap-3 mb-2">
                 <p 
                    className={`text-slate-800 font-medium text-lg leading-relaxed select-none transition-colors duration-300 ${copiedText === item.sentenceDe ? 'text-green-600' : ''}`}
                    dir="ltr"
                    onTouchStart={() => handleTouchStart(item.sentenceDe)}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={() => handleTouchStart(item.sentenceDe)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                 >
                    {item.sentenceDe}
                 </p>
                 {audioEnabled && (
                   <button 
                    onClick={() => speakGerman(item.sentenceDe)}
                    className="p-2 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
                   >
                     <Icons.Speaker className="w-4 h-4" />
                   </button>
                 )}
              </div>
              <p className="text-slate-500 text-sm border-t border-gray-100 pt-3 mt-2 font-arabic leading-relaxed">
                {item.sentenceAr}
              </p>
              
              {copiedText === item.sentenceDe && (
                 <div className="text-xs text-green-600 font-bold mt-1 animate-fade-in text-right">
                    ✓ {strings.nounResult}
                 </div>
              )}

              <div className="flex justify-end mt-3">
                 <button
                    onClick={() => onChat(item.sentenceDe, item.sentenceAr)}
                    className="flex items-center gap-2 text-xs text-white bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                 >
                    <Icons.Chat className="w-3 h-3" />
                    <span>{strings.askAi}</span>
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
