
import React, { useEffect, useState, useRef } from 'react';
import { Icons } from '../components/Icon';
import { fetchVerbMeanings } from '../services/geminiService';
import { speakGerman } from '../utils/tts';
import { VerbMeaning, DataCache, AppStrings, LanguageCode } from '../types';

interface VerbMeaningsViewProps {
  verb: string;
  apiKey: string;
  lang: LanguageCode;
  strings: AppStrings;
  cache: DataCache;
  onCacheUpdate: (key: string, data: any) => void;
  smartStorage: boolean;
  audioEnabled: boolean;
}

export const VerbMeaningsView: React.FC<VerbMeaningsViewProps> = ({ 
  verb, 
  apiKey, 
  lang,
  strings,
  cache,
  onCacheUpdate,
  smartStorage,
  audioEnabled
}) => {
  const cacheKey = `verb_mean_${verb}_${lang}`;
  const [loading, setLoading] = useState(smartStorage ? true : !cache[cacheKey]);
  const [data, setData] = useState<VerbMeaning[] | null>(smartStorage ? null : (cache[cacheKey] || null));
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (data && !smartStorage) return;

    const load = async () => {
      if (!apiKey) {
        setError(strings.missingKey);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetchVerbMeanings(verb, apiKey, lang);
        setData(res);
        onCacheUpdate(cacheKey, res);
      } catch (err) {
        setError('Error loading meanings.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [verb, apiKey, lang, cacheKey, onCacheUpdate, strings, smartStorage]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (text: string, idx: number) => {
    timerRef.current = setTimeout(() => {
      navigator.clipboard.writeText(text);
      if (navigator.vibrate) navigator.vibrate(50);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
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
        <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-400 rounded-full animate-spin mb-4"></div>
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
      <div className="bg-slate-900 p-4 rounded-xl shadow-sm border-l-4 border-amber-400 flex items-center justify-between">
        <div>
           <span className="text-slate-400 text-sm">{strings.verbs}:</span>
           <h2 className="text-2xl font-bold text-white font-mono">{verb}</h2>
        </div>
        <div className="p-3 bg-slate-800 rounded-full">
            <Icons.Book className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      <div className="space-y-4">
        {data?.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-amber-50 p-3 border-b border-amber-100">
               <h3 className="font-bold text-amber-900">{idx + 1}. {item.meaning}</h3>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start gap-3 mb-2">
                 <p 
                   className={`text-slate-800 font-medium text-lg select-none transition-colors duration-300 ${copiedIndex === idx ? 'text-green-600' : ''}`}
                   dir="ltr"
                   onTouchStart={() => handleTouchStart(item.exampleDe, idx)}
                   onTouchEnd={handleTouchEnd}
                   onMouseDown={() => handleTouchStart(item.exampleDe, idx)}
                   onMouseUp={handleTouchEnd}
                   onMouseLeave={handleTouchEnd}
                 >
                   {item.exampleDe}
                 </p>
                 {audioEnabled && (
                   <button 
                    onClick={() => speakGerman(item.exampleDe)}
                    className="p-2 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
                   >
                     <Icons.Speaker className="w-4 h-4" />
                   </button>
                 )}
              </div>
              <p className="text-slate-500 text-sm border-t border-gray-100 pt-2 mt-2">
                {item.exampleAr}
              </p>
              {copiedIndex === idx && (
                 <div className="text-xs text-green-600 font-bold mt-1 animate-fade-in text-right">
                    ✓
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
