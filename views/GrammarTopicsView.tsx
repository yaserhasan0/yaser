import React, { useEffect, useState } from 'react';
import { Icons } from '../components/Icon';
import { fetchGrammarTopics } from '../services/geminiService';
import { GrammarTopic, DataCache, AppStrings, LanguageCode } from '../types';

interface GrammarTopicsViewProps {
  level: string;
  apiKey: string;
  lang: LanguageCode;
  strings: AppStrings;
  onSelectTopic: (topic: GrammarTopic) => void;
  cache: DataCache;
  onCacheUpdate: (key: string, data: any) => void;
}

export const GrammarTopicsView: React.FC<GrammarTopicsViewProps> = ({ 
  level, 
  apiKey,
  lang,
  strings,
  onSelectTopic,
  cache,
  onCacheUpdate
}) => {
  const cacheKey = `topics_${level}_${lang}`;
  const [loading, setLoading] = useState(!cache[cacheKey]);
  const [topics, setTopics] = useState<GrammarTopic[]>(cache[cacheKey] || []);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topics.length > 0) return;

    const load = async () => {
      if (!apiKey) {
        setError(strings.missingKey);
        setLoading(false);
        return;
      }
      try {
        const res = await fetchGrammarTopics(level, apiKey, lang);
        setTopics(res);
        onCacheUpdate(cacheKey, res);
      } catch (err) {
        setError('Error loading topics.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [level, apiKey, lang, topics, cacheKey, onCacheUpdate, strings]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">{strings.loading}</p>
        <p className="text-sm text-indigo-500 mt-1 font-mono">{level}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl text-center border border-red-100">
        <p className="text-red-600 mb-2">{error}</p>
        <button 
           onClick={() => window.location.reload()} 
           className="mt-2 text-sm underline text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-10">
      <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg mb-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
        <h2 className="text-2xl font-bold">{strings.topicsFor} {level}</h2>
      </div>

      <div className="space-y-3">
        {topics.map((topic, idx) => (
          <button
            key={idx}
            onClick={() => onSelectTopic(topic)}
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Icons.Topic className="w-6 h-6" />
              </div>
              <div className="flex-1 text-start">
                <h3 className="font-bold text-slate-800 text-lg">{topic.titleAr}</h3>
                <p className="text-sm text-indigo-600 font-medium mt-1 dir-ltr text-start">{topic.titleDe}</p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{topic.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};