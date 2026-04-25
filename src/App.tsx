import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Trash2, Download, Copy, ListChecks, Search, Check, Save, Upload, RotateCcw, Mail, Info } from 'lucide-react';
import { EmailVariation } from './types';
import { generateDotVariations } from './lib/generator';
import { loadData, saveData, exportDataAsJson, exportDataAsTxt } from './lib/storage';
import { cn } from './lib/utils';

export default function App() {
  const [emailInput, setEmailInput] = useState('');
  const [variations, setVariations] = useState<EmailVariation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'used' | 'unused'>('all');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [visibleCount, setVisibleCount] = useState(100);

  useEffect(() => {
    setVariations(loadData());
  }, []);

  const handleGenerate = () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      alert("Por favor, ensira um e-mail válido com '@'.");
      return;
    }

    const generated = generateDotVariations(emailInput.trim().toLowerCase());
    
    setVariations(prev => {
      const existingMap = new Map(prev.map(v => [v.email, v]));
      
      const newItems: EmailVariation[] = generated.map(email => {
        if (existingMap.has(email)) {
          return existingMap.get(email)!;
        }
        return {
          id: crypto.randomUUID(),
          email,
          isUsed: false,
          purpose: '',
          observation: '',
          usedDate: null,
          createdAt: new Date().toISOString(),
        };
      });

      const freshGenUrls = new Set(newItems.map(v => v.email));
      const olderItems = prev.filter(v => !freshGenUrls.has(v.email));
      
      const merged = [...newItems, ...olderItems];
      saveData(merged);
      setVisibleCount(100);
      return merged;
    });
  };

  const updateVariation = (id: string, updates: Partial<EmailVariation>) => {
    setVariations(prev => {
      const next = prev.map(v => {
        if (v.id === id) {
          const updated = { ...v, ...updates };
          if (updates.isUsed !== undefined) {
             if (updates.isUsed && !v.isUsed) {
               updated.usedDate = new Date().toISOString();
             } else if (!updates.isUsed) {
               updated.usedDate = null;
             }
          }
          return updated;
        }
        return v;
      });
      saveData(next);
      return next;
    });
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja apagar todos os dados e o histórico de e-mails gerados? Esta ação não pode ser desfeita.")) {
      setVariations([]);
      saveData([]);
      setEmailInput('');
      setSearchQuery('');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            setVariations(parsed);
            saveData(parsed);
            alert("Dados importados com sucesso!");
          }
        } catch (e) {
          alert("Arquivo JSON inválido.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleCopyAll = () => {
    const textToCopy = filteredVariations.map(v => v.email).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredVariations = useMemo(() => {
    return variations.filter(v => {
      const matchSearch = v.email.includes(searchQuery.toLowerCase()) || 
                          (v.purpose && v.purpose.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;
      if (filterMode === 'used') return v.isUsed;
      if (filterMode === 'unused') return !v.isUsed;
      return true;
    });
  }, [variations, searchQuery, filterMode]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-neutral-900 pb-12 sm:pb-0">
      
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0 sm:h-screen sm:overflow-hidden p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-neutral-200 shrink-0 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-sm">
              <Mail size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                DotMail
              </h1>
              <p className="text-neutral-500 font-medium text-sm sm:text-base mt-0.5">
                Variações infinitas do seu Gmail.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar shrink-0">
             <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 font-semibold text-sm transition-all whitespace-nowrap">
              <Upload size={16} /> Importar
            </button>
            <button onClick={() => exportDataAsJson(variations)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 font-semibold text-sm transition-all whitespace-nowrap">
              <Save size={16} /> Backup JSON
            </button>
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm transition-all whitespace-nowrap">
              <Trash2 size={16} /> Reset
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
          
          {/* Left Column: Generator & Info */}
          <section className="col-span-1 lg:col-span-4 flex flex-col gap-6 shrink-0 lg:shrink min-h-0">
            
            {/* Input Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">E-mail Original</label>
                <input
                  type="email"
                  placeholder="exemplo@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  className="w-full bg-neutral-100 border border-transparent focus:border-neutral-900 focus:bg-white rounded-2xl px-5 py-4 text-lg font-medium text-neutral-900 placeholder:text-neutral-400 outline-none transition-all"
                />
              </div>
              <button
                onClick={handleGenerate}
                className="w-full py-4 text-lg bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Gerar Variações
                <Sparkles size={20} />
              </button>
            </div>

            {/* Info Notice */}
            <div className="bg-neutral-100 rounded-3xl p-6 text-sm font-medium text-neutral-600 flex gap-4 leading-relaxed border border-neutral-200/50">
              <Info className="text-neutral-400 shrink-0 mt-0.5" size={20} />
              <p>
                O Gmail ignora a pontuação, então todas variações chegarão à sua caixa de entrada principal. Seus registros ficam salvos <strong>apenas no navegador</strong>.
              </p>
            </div>

          </section>

          {/* Right Column: List & Controls */}
          <section className="col-span-1 lg:col-span-8 flex flex-col min-h-[500px] lg:min-h-0 min-w-0 bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
            
            {/* List Toolbar */}
            <div className="p-4 sm:p-6 border-b border-neutral-100 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 shrink-0 bg-white z-10 relative">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar e-mails ou anotações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-100 border border-transparent rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-300 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex bg-neutral-100 p-1 rounded-xl self-start sm:self-auto shrink-0">
                  {(['all', 'unused', 'used'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={cn(
                        "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                        filterMode === mode 
                          ? "bg-white text-neutral-900 shadow-sm" 
                          : "text-neutral-500 hover:text-neutral-700"
                      )}
                    >
                      {mode === 'all' ? 'Todos' : mode === 'used' ? 'Usados' : 'Livres'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between xl:justify-end gap-4 shrink-0">
                <div className="text-sm font-bold text-neutral-400">
                  <span className="text-neutral-900">{filteredVariations.length}</span> resultados
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopyAll}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                  >
                     {copiedAll ? <Check size={16} className="text-green-400"/> : <ListChecks size={16} />}
                     <span className="hidden sm:inline">{copiedAll ? 'Copiado' : 'Copiar Exibidos'}</span>
                  </button>
                  <button 
                    onClick={() => exportDataAsTxt(filteredVariations)}
                    className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">TXT</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 bg-neutral-50 relative">
              {variations.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
                  <Mail size={48} className="text-neutral-200" />
                  <p className="font-semibold text-lg text-neutral-500">Nenhum e-mail gerado.</p>
                </div>
              ) : filteredVariations.length === 0 ? (
                <div className="py-20 text-center font-bold text-neutral-400 text-lg">
                  Nenhum resultado encontrado.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredVariations.slice(0, visibleCount).map(variation => (
                    <div 
                      key={variation.id}
                      className={cn(
                        "flex flex-col xl:flex-row xl:items-center gap-4 p-4 sm:p-5 border transition-all rounded-2xl group",
                        variation.isUsed 
                          ? "bg-white border-neutral-200 opacity-80" 
                          : "bg-white border-transparent hover:border-neutral-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                      )}
                    >
                      <div className="flex items-start xl:items-center gap-4 flex-1 min-w-0">
                        <label className="relative mt-1 xl:mt-0 flex shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={variation.isUsed}
                            onChange={(e) => updateVariation(variation.id, { isUsed: e.target.checked })}
                            className="peer w-6 h-6 shrink-0 appearance-none rounded-md bg-neutral-100 border border-neutral-300 checked:bg-neutral-900 checked:border-neutral-900 transition-colors"
                          />
                          <Check 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none opacity-0 peer-checked:opacity-100" 
                            size={14} 
                            strokeWidth={3}
                          />
                        </label>
                        
                        <div className="min-w-0 flex-1">
                          <div className={cn("text-base sm:text-lg font-bold font-mono tracking-tight truncate", variation.isUsed ? "text-neutral-500 line-through decoration-neutral-300" : "text-neutral-900")}>
                            {variation.email}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-2 mt-1">
                            {variation.isUsed ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-widest bg-neutral-100 text-neutral-500">
                                Usado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-widest bg-green-50 text-green-600">
                                Livre
                              </span>
                            )}
                            {variation.usedDate && (
                              <span className="text-xs font-semibold text-neutral-400">
                                {new Date(variation.usedDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch xl:items-center gap-3 xl:w-[450px] shrink-0">
                        <input
                          type="text"
                          placeholder="Finalidade (ex: TikTok, Assinatura...)"
                          value={variation.purpose}
                          onChange={(e) => updateVariation(variation.id, { purpose: e.target.value })}
                          className={cn(
                            "flex-1 bg-neutral-100 border border-transparent rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:bg-white focus:border-neutral-300 transition-all",
                            variation.isUsed ? "text-neutral-600" : "text-neutral-900",
                            !variation.isUsed && !variation.purpose && "bg-transparent hover:bg-neutral-100"
                          )}
                        />
                        <button
                          onClick={() => handleCopySingle(variation.email, variation.id)}
                          className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors sm:w-auto"
                        >
                           {copiedId === variation.id ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}
                           <span className="sm:hidden">{copiedId === variation.id ? 'Copiado' : 'Copiar E-mail'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {visibleCount < filteredVariations.length && (
                <button 
                  onClick={() => setVisibleCount(c => c + 100)}
                  className="w-full py-5 mt-6 border-2 border-dashed border-neutral-200 hover:border-neutral-300 text-neutral-500 hover:text-neutral-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all bg-transparent"
                >
                  <RotateCcw size={18} />
                  Carregar Mais ({filteredVariations.length - visibleCount})
                </button>
              )}
            </div>

          </section>
        </main>
      </div>
    </div>
  );
}
