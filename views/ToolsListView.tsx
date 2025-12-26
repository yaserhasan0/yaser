import React, { useEffect, useState } from 'react';
import { Icons } from '../components/Icon';
import { fetchToolsList } from '../services/geminiService';
import { ToolItem, DataCache, AppStrings, LanguageCode } from '../types';

interface ToolsListViewProps {
  categoryId: string;
  categoryName: string;
  apiKey: string;
  lang: LanguageCode;
  strings: AppStrings;
  onSelectTool: (tool: ToolItem) => void;
  cache: DataCache;
  onCacheUpdate: (key: string, data: any) => void;
}

export const ToolsListView: React.FC<ToolsListViewProps> = ({ 
  categoryId, 
  categoryName, 
  apiKey, 
  lang,
  strings,
  onSelectTool,
  cache,
  onCacheUpdate
}) => {
  const cacheKey = `tools_list_${categoryId}_${lang}`;
  const [loading, setLoading] = useState(!cache[cacheKey]);
  const [tools, setTools] = useState<ToolItem[]>(cache[cacheKey] || []);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tools.length > 0) return;

    const load = async () => {
      if (!apiKey) {
        setError(strings.missingKey);
        setLoading(false);
        return;
      }
      try {
        const res = await fetchToolsList(categoryId, categoryName, apiKey, lang);
        setTools(res);
        onCacheUpdate(cacheKey, res);
      } catch (err) {
        setError('Error loading tools.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryId, categoryName, apiKey, lang, tools, cacheKey, onCacheUpdate, strings]);

  const getLevelBadgeColor = (level: string) => {
    const l = level.trim().toUpperCase();
    if (l.startsWith('A1')) return 'bg-green-100 text-green-700 border-green-200';
    if (l.startsWith('A2')) return 'bg-teal-100 text-teal-700 border-teal-200';
    if (l.startsWith('B1')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (l.startsWith('B2')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (l.startsWith('C1')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">{strings.loading}</p>
        <p className="text-sm text-teal-500 mt-1">{categoryName}</p>
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
      <div className="flex items-center justify-between mb-2">
         <h2 className="text-xl font-bold text-slate-800">{categoryName}</h2>
         <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{tools.length}</span>
      </div>

      <div className="space-y-3">
        {tools.map((tool, idx) => (
          <button
            key={idx}
            onClick={() => onSelectTool(tool)}
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-teal-400 hover:shadow-md transition-all text-start group flex items-center justify-between gap-3"
          >
             <div className="flex flex-col gap-1 items-start">
               <div className="flex items-center gap-2">
                 <span className="text-lg font-bold text-slate-900" dir="ltr">{tool.word}</span>
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeColor(tool.level)}`}>
                   {tool.level}
                 </span>
               </div>
               <span className="text-slate-600 font-medium">{tool.translation}</span>
               <span className="text-xs text-gray-400">{tool.description}</span>
             </div>
             <Icons.Back className="w-5 h-5 text-gray-300 transform rotate-180 group-hover:text-teal-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};