import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
}

interface UsePaginationResult<T> {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  paginatedItems: T[];
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Hook para paginação de listas
 * Gerencia estado de paginação e retorna itens paginados
 *
 * @param items - Array de itens para paginar
 * @param options - Opções de configuração (página inicial, itens por página)
 * @returns Objeto com dados e funções de paginação
 */
export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const { initialPage = 1, initialItemsPerPage = 10 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Garantir que a página atual é válida
  const validCurrentPage = useMemo(() => {
    if (currentPage < 1) return 1;
    if (currentPage > totalPages) return totalPages;
    return currentPage;
  }, [currentPage, totalPages]);

  // Calcular índices
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Itens da página atual
  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // Funções de navegação
  const setPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const setItemsPerPage = useCallback((count: number) => {
    setItemsPerPageState(count);
    setCurrentPage(1); // Voltar para a primeira página ao mudar itens por página
  }, []);

  const nextPage = useCallback(() => {
    setPage(validCurrentPage + 1);
  }, [setPage, validCurrentPage]);

  const previousPage = useCallback(() => {
    setPage(validCurrentPage - 1);
  }, [setPage, validCurrentPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [setPage, totalPages]);

  const canGoNext = validCurrentPage < totalPages;
  const canGoPrevious = validCurrentPage > 1;

  return {
    currentPage: validCurrentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedItems,
    setPage,
    setItemsPerPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    canGoNext,
    canGoPrevious,
    startIndex: startIndex + 1, // 1-indexed para exibição
    endIndex
  };
}
