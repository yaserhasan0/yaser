
import React, { useEffect, useState, useRef } from 'react';
import { Icons } from '../components/Icon';
import { fetchVerbConjugation } from '../services/geminiService';
import { speakGerman } from '../utils/tts';
import { VerbConjugation, VerbResult, DataCache, AppStrings, LanguageCode } from '../types';

interface VerbDetailViewProps {
  verb: string;
  category: string;
  subcategory: string;
  apiKey: string;
  lang: LanguageCode;
  strings: AppStrings;
  onChat: (de: string, ar: string) => void;
  cache: DataCache;
  onCacheUpdate: (key: string, data: any) => void;
  smartStorage: boolean;
  audioEnabled: boolean;
}

export const VerbDetailView: React.FC<VerbDetailViewProps> = ({ 
  verb, 
  category, 
  subcategory, 
  apiKey,
  lang,
  strings,
  onChat,
  cache,
  onCacheUpdate,
  smartStorage,
  audioEnabled
}) => {
  const cacheKey = `verb_det_${verb}_${category}_${subcategory}_${lang}`;
  const [loading, setLoading] = useState(smartStorage ? true : !cache[cacheKey]);
  const [data, setData] = useState<VerbResult | null>(smartStorage ? null : (cache[cacheKey] || null));
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
        const res = await fetchVerbConjugation(verb, category, subcategory, apiKey, lang);
        setData(res);
        onCacheUpdate(cacheKey, res);
      } catch (err) {
        setError('Error loading conjugations.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [verb, category, subcategory, apiKey, lang, cacheKey, onCacheUpdate, strings, smartStorage]);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-slate-900">{verb}</h2>
        <span className="text-sm text-slate-600 bg-amber-100 px-3 py-1 rounded-full mt-2 font-medium">
          {subcategory}
        </span>
      </div>

      <div className="space-y-4">
        {data?.conjugations.map((item, idx) => (
          <ConjugationCard 
            key={idx}
            item={item}
            isExpanded={expandedIndex === idx}
            onToggle={() => toggleExpand(idx)}
            onChat={() => onChat(item.exampleDe, item.exampleAr)}
            strings={strings}
            audioEnabled={audioEnabled}
          />
        ))}
      </div>
    </div>
  );
};

const ConjugationCard: React.FC<{
  item: VerbConjugation;
  isExpanded: boolean;
  onToggle: () => void;
  onChat: () => void;
  strings: AppStrings;
  audioEnabled: boolean;
}> = ({ item, isExpanded, onToggle, onChat, strings, audioEnabled }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      navigator.clipboard.writeText(item.exampleDe);
      if (navigator.vibrate) navigator.vibrate(50);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, 800);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
      <div className="p-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex flex-col items-start gap-1">
           <span className="text-sm text-gray-400 font-medium">{item.pronoun}</span>
           <span className="text-lg font-bold text-slate-800">{item.conjugation}</span>
        </div>
        
        {audioEnabled && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              speakGerman(`${item.pronoun} ${item.conjugation}`);
            }}
            className="p-3 bg-slate-50 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icons.Speaker className="w-5 h-5" />
          </button>
        )}
      </div>

      <div 
        onClick={onToggle}
        className={`bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors ${isExpanded ? 'bg-amber-50 hover:bg-amber-50' : ''}`}
      >
        <div className="flex items-start justify-between">
           <div className="flex-1">
              <span className="text-xs text-gray-400 block mb-1">{strings.examples}</span>
              <p 
                className={`text-slate-800 font-medium text-left select-none transition-colors duration-300 ${copied ? 'text-green-600' : ''}`} 
                dir="ltr"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
              >
                {item.exampleDe}
              </p>
               {copied && (
                 <div className="text-xs text-green-600 font-bold mt-1 animate-fade-in">
                    ✓
                 </div>
              )}
           </div>
           <div className="ml-2 mt-1">
             {isExpanded ? (
               <Icons.Up className="w-4 h-4 text-gray-400" />
             ) : (
               <Icons.Down className="w-4 h-4 text-gray-400" />
             )}
           </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-amber-100/50 animate-fade-in">
             <p className="text-slate-700 font-arabic">
               {item.exampleAr}
             </p>
             <div className="flex justify-end mt-4 gap-2">
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   onChat();
                 }}
                 className="flex items-center gap-2 text-xs text-white bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
               >
                 <Icons.Chat className="w-3 h-3" />
                 <span>{strings.askAi}</span>
               </button>

               {audioEnabled && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     speakGerman(item.exampleDe);
                   }}
                   className="flex items-center gap-2 text-xs text-amber-800 bg-amber-100 px-3 py-2 rounded-lg hover:bg-amber-200 transition-colors"
                 >
                   <Icons.Speaker className="w-3 h-3" />
                   <span>{strings.pronunciation}</span>
                 </button>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
