
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Icons } from '../components/Icon';
import { fetchToolDetail } from '../services/geminiService';
import { speakGerman } from '../utils/tts';
import { ToolItem, ToolDetail, DataCache, AppStrings, LanguageCode } from '../types';

interface ToolDetailViewProps {
  tool: ToolItem;
  categoryName: string;
  apiKey: string;
  lang: LanguageCode;
  strings: AppStrings;
  onChat: (de: string, ar: string) => void;
  cache: DataCache;
  onCacheUpdate: (key: string, data: any) => void;
  smartStorage: boolean;
  audioEnabled: boolean;
}

export const ToolDetailView: React.FC<ToolDetailViewProps> = ({ 
  tool, 
  categoryName,
  apiKey,
  lang,
  strings,
  onChat,
  cache,
  onCacheUpdate,
  smartStorage,
  audioEnabled
}) => {
  const cacheKey = `tool_detail_${tool.word}_${categoryName}_${lang}`;
  const [loading, setLoading] = useState(smartStorage ? true : !cache[cacheKey]);
  const [data, setData] = useState<ToolDetail | null>(smartStorage ? null : (cache[cacheKey] || null));
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
        const res = await fetchToolDetail(tool, categoryName, apiKey, lang);
        setData(res);
        onCacheUpdate(cacheKey, res);
      } catch (err) {
        setError('Error loading detail.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tool, categoryName, apiKey, lang, cacheKey, onCacheUpdate, strings, smartStorage]);

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
        <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">{strings.loading}</p>
        <p className="text-xs text-teal-500 mt-2">{tool.word}</p>
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
         <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold mb-4">
           {tool.level} | {categoryName}
         </span>
         <h2 className="text-4xl font-bold text-slate-900 mb-2" dir="ltr">{tool.word}</h2>
         <p className="text-xl text-teal-700 font-medium">{data?.meaningAr}</p>
         {audioEnabled && (
           <button 
              onClick={() => speakGerman(tool.word)}
              className="mt-4 p-3 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-colors mx-auto block"
           >
              <Icons.Speaker className="w-6 h-6" />
           </button>
         )}
      </div>

      {data && (
        <>
          {/* Usage Explanation */}
          <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-teal-800">
             <ReactMarkdown>{data.usageAr}</ReactMarkdown>
          </div>

          <h3 className="text-xl font-bold text-slate-800 px-2 mt-2">{strings.examples}</h3>
          
          <div className="space-y-4">
            {data.examples.map((ex, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-teal-500 border-gray-200 p-4">
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
                 
                 <div className="flex justify-between items-center mt-3">
                   {copiedIndex === idx ? (
                      <div className="text-xs text-green-600 font-bold animate-fade-in">
                          ✓
                      </div>
                    ) : <div></div>}
                    
                    <button
                        onClick={() => onChat(ex.de, ex.ar)}
                        className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors"
                     >
                        <Icons.Chat className="w-3 h-3" />
                        <span>{strings.askAi}</span>
                     </button>
                 </div>
              </div>
            ))}
          </div>
          
          <p className="text-center text-xs text-gray-300 mt-2">
             {strings.appName}
          </p>
        </>
      )}
    </div>
  );
};
