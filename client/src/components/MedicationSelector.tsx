import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { searchMedicamentos, type Medicamento } from '../data/medicamentos';

interface MedicationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MedicationSelector({ value, onChange, placeholder = "Buscar medicamento...", className = "" }: MedicationSelectorProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal query state with value prop
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const results = useMemo(() => {
    if (query.length >= 2) {
      return searchMedicamentos(query);
    }
    return [];
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onChange(newQuery); // Update parent directly as we type
    if (newQuery.length >= 2) {
        setIsOpen(true);
    } else {
        setIsOpen(false);
    }
  };

  const handleSelect = (medicamento: Medicamento) => {
    const newValue = medicamento.nome;
    setQuery(newValue);
    onChange(newValue);
    setIsOpen(false);
  };

  const handleAddNew = () => {
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className={className || "input-field text-sm w-full"}
          placeholder={placeholder}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto animate-scale-in">
          {results.length > 0 ? (
            results.map((item, index) => (
              <button
                key={`${item.nome}-${index}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-2 text-left text-sm flex flex-col hover:bg-primary-50 hover:text-primary-900 border-b border-gray-50 last:border-0"
              >
                <span className="font-medium text-gray-800">{item.nome}</span>
                <span className="text-xs text-gray-500 truncate">
                  {item.principioAtivo}
                </span>
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500 text-sm">
              Nenhum medicamento encontrado.
            </div>
          )}

          {query.length >= 2 && (
             <button
                type="button"
                onClick={handleAddNew}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-primary-50 text-primary-600 font-medium border-t border-gray-100"
              >
                <Plus className="w-4 h-4" />
                Adicionar "{query}" como novo
              </button>
          )}
        </div>
      )}
    </div>
  );
}
