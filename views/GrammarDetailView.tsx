
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Icons } from '../components/Icon';
import { fetchGrammarExplanation } from '../services/geminiService';
import { speakGerman } from '../utils/tts';
import { GrammarTopic, GrammarExplanation, DataCache, AppStrings, LanguageCode } from '../types';

interface GrammarDetailViewProps {
  level: string;
  topic: GrammarTopic;
  apiKey: string;
  lang: LanguageCode;
  strings: AppStrings;
  onTestMe: (contextDe: string, contextAr: string) => void;
  cache: DataCache;
  onCacheUpdate: (key: string, data: any) => void;
  audioEnabled: boolean;
}

export const GrammarDetailView: React.FC<GrammarDetailViewProps> = ({ 
  level, 
  topic, 
  apiKey,
  lang,
  strings,
  onTestMe,
  cache,
  onCacheUpdate,
  audioEnabled
}) => {
  const cacheKey = `grammar_det_${level}_${topic.id}_${lang}`;
  const [loading, setLoading] = useState(!cache[cacheKey]);
  const [data, setData] = useState<GrammarExplanation | null>(cache[cacheKey] || null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (data) return;

    const load = async () => {
      if (!apiKey) {
        setError(strings.missingKey);
        setLoading(false);
        return;
      }
      try {
        const res = await fetchGrammarExplanation(topic, level, apiKey, lang);
        setData(res);
        onCacheUpdate(cacheKey, res);
      } catch (err) {
        setError('Error loading explanation.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topic, level, apiKey, lang, data, cacheKey, onCacheUpdate, strings]);

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
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">{strings.loading}</p>
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
    <div className="flex flex-col gap-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
         <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-3">
           {level}
         </span>
         <h2 className="text-2xl font-bold text-slate-900 mb-1">{topic.titleAr}</h2>
         <p className="text-slate-500 font-medium" dir="ltr">{topic.titleDe}</p>
      </div>

      {/* Explanation */}
      {data && (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 prose-strong:text-indigo-700">
             <ReactMarkdown>{data.explanation}</ReactMarkdown>
          </div>

          <h3 className="text-xl font-bold text-slate-800 px-2 mt-2">{strings.examples}</h3>
          
          <div className="space-y-4">
            {data.examples.map((ex, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-indigo-500 border-gray-200 p-4">
                 <div className="flex justify-between items-start gap-3">
                    <p 
                      className={`text-lg font-medium text-slate-800 leading-relaxed select-none transition-colors duration-300 ${copiedIndex === idx ? 'text-green-600' : ''}`}
                      dir="ltr"
                      onTouchStart={() => handleTouchStart(ex.de, idx)}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={() => handleTouchStart(ex.de, idx)}
                      onMouseUp={handleTouchEnd}
                      onMouseLeave={handleTouchEnd}
                    >
                      {ex.de}
                    </p>
                    {audioEnabled && (
                      <button 
                        onClick={() => speakGerman(ex.de)}
                        className="p-2 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors shrink-0"
                      >
                        <Icons.Speaker className="w-4 h-4" />
                      </button>
                    )}
                 </div>
                 <p className="text-slate-600 mt-2 text-sm border-t border-gray-100 pt-2">{ex.ar}</p>
                 {copiedIndex === idx && (
                    <div className="text-xs text-green-600 font-bold mt-2 animate-fade-in text-end">
                        ✓
                    </div>
                  )}
              </div>
            ))}
          </div>

          <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-10">
            <button
              onClick={() => onTestMe(
                `Topic: ${topic.titleDe} (${topic.titleAr})`, 
                "Quiz me on this topic with a short question."
              )}
              className="w-full bg-slate-900 text-white py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all transform active:scale-95"
            >
              <Icons.Quiz className="w-6 h-6 text-amber-400" />
              <span className="font-bold text-lg">{strings.testMe}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
