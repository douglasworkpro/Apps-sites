import React from 'react';
import { cn } from '../lib/utils';
import { Check, Copy } from 'lucide-react';

interface CodeSectionProps {
  code: string;
  className?: string;
}

export function CodeSection({ code, className }: CodeSectionProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex-1 bg-neutral-900 rounded-2xl p-6 overflow-hidden relative group flex flex-col shadow-sm border border-neutral-800", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
          <span>//</span> Código Fonte
        </h2>
        <button
          onClick={handleCopy}
          className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-xs text-white flex items-center gap-2 font-medium transition-colors"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="text-xs sm:text-sm font-mono text-neutral-400 leading-relaxed overflow-y-auto custom-scrollbar flex-1 pr-2 whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
    </div>
  );
}
