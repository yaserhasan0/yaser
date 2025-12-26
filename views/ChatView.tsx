import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Icons } from '../components/Icon';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage, AppStrings, LanguageCode } from '../types';

interface ChatViewProps {
  contextDe: string;
  contextAr: string;
  apiKey: string;
  lang: LanguageCode;
  strings: AppStrings;
}

export const ChatView: React.FC<ChatViewProps> = ({ contextDe, contextAr, apiKey, lang, strings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);

    try {
      // Format history for Gemini API
      const history = newMessages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await sendChatMessage(userMsg, contextDe, contextAr, history, apiKey, lang);
      setMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: 'Error. Check API Key.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Context Header */}
      <div className="bg-slate-900 p-4 border-b border-amber-400 flex-none">
        <p className="text-xs text-slate-400 mb-1">{strings.examples}:</p>
        <p className="font-medium text-white text-sm mb-1" dir="ltr">{contextDe}</p>
        <p className="text-sm text-amber-400 font-arabic">{contextAr}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10 text-sm">
            {strings.chatPlaceholder}
          </div>
        )}
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} />
        ))}
        {loading && (
           <div className="flex justify-end">
             <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none border border-gray-200">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-none">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-red-700 text-white p-3 rounded-xl hover:bg-red-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Icons.Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = msg.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm flex flex-col gap-2 ${
          isUser 
            ? 'bg-red-700 text-white rounded-br-none' 
            : 'bg-gray-50 text-slate-800 rounded-bl-none border border-gray-200'
        }`}
      >
        <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
          <ReactMarkdown
            components={{
              p: ({children}) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
              strong: ({children}) => <span className="font-bold">{children}</span>,
              ul: ({children}) => <ul className="list-disc pr-4 my-2 space-y-1">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal pr-4 my-2 space-y-1">{children}</ol>,
              li: ({children}) => <li className="">{children}</li>
            }}
          >
            {msg.text}
          </ReactMarkdown>
        </div>

        {!isUser && (
          <div className="flex justify-end mt-1 pt-2 border-t border-gray-200/50">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-500 hover:bg-gray-200 transition-colors"
            >
              {copied ? (
                <Icons.Check className="w-3 h-3 text-green-600" />
              ) : (
                <Icons.Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};