import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { searchCID10, getCID10Description } from '../data/cid10';
import { useDebounce } from '../hooks/useDebounce';

interface CID10SelectorProps {
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
  error?: string;
}

export function CID10Selector({ selectedCodes, onChange, error }: CID10SelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const isSearching = query !== debouncedQuery;

  const results = useMemo(() => {
    if (debouncedQuery.length >= 2) {
      return searchCID10(debouncedQuery);
    }
    return [];
  }, [debouncedQuery]);

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
    if (newQuery.length >= 2) {
        setIsOpen(true);
    } else {
        setIsOpen(false);
    }
  };

  const handleSelect = (code: string) => {
    const normalizedCode = code.toUpperCase().trim();
    if (!selectedCodes.includes(normalizedCode)) {
      onChange([...selectedCodes, normalizedCode]);
    }
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (codeToRemove: string) => {
    onChange(selectedCodes.filter(code => code !== codeToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      handleSelect(query);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        CID-10 <span className="text-red-500">*</span>
      </label>

      <div className={`
        flex flex-wrap items-center gap-2 p-2 min-h-[42px]
        bg-white border rounded-xl transition-all
        ${error ? 'border-red-500 focus-within:ring-red-500' : 'border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent'}
      `}>
        {selectedCodes.map(code => {
          const description = getCID10Description(code);
          return (
            <span
              key={code}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-100"
            >
              <span className="font-bold">{code}</span>
              {description && <span className="text-primary-600">- {description}</span>}
              <button
                type="button"
                onClick={() => handleRemove(code)}
                className="text-primary-400 hover:text-primary-600 transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          );
        })}

        <div className="flex-1 min-w-[120px] relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
            placeholder={selectedCodes.length === 0 ? "Buscar por código ou descrição..." : "Adicionar outro..."}
          />
           {query === '' && selectedCodes.length === 0 && (
            <Search className="w-4 h-4 text-gray-400 absolute right-0" />
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto animate-scale-in">
          {results.map((item) => {
            const isSelected = selectedCodes.includes(item.code);
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                disabled={isSelected}
                className={`
                  w-full px-4 py-3 text-left text-sm flex items-center justify-between group border-b last:border-0 border-gray-50
                  ${isSelected ? 'bg-gray-50 text-gray-400 cursor-default' : 'hover:bg-primary-50 text-gray-700 hover:text-primary-900'}
                `}
              >
                <div className="flex-1">
                  <span className="font-bold mr-2 text-primary-600 group-hover:text-primary-700">{item.code}</span>
                  <span>{item.description}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-primary-500" />}
              </button>
            );
          })}
        </div>
      )}

      {isOpen && results.length === 0 && query.length >= 2 && !isSearching && (
        <button
          type="button"
          onClick={() => handleSelect(query)}
          className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-4 text-center text-primary-600 hover:bg-primary-50 text-sm font-medium animate-scale-in cursor-pointer transition-colors"
        >
          Adicionar "{query}"
        </button>
      )}
    </div>
  );
}
