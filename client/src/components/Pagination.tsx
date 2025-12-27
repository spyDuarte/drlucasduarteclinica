import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  itemsPerPage?: number;
  onItemsPerPageChange?: (items: number) => void;
  itemsPerPageOptions?: number[];
  showItemsPerPage?: boolean;
}

/**
 * Componente de paginação reutilizável
 * Exibe controles de navegação e informações sobre os itens
 */
export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPreviousPage,
  canGoNext,
  canGoPrevious,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
  showItemsPerPage = true
}: PaginationProps) {
  // Gerar números de página para exibição
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Mostrar todas as páginas se couberem
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas com ellipsis
      if (currentPage <= 3) {
        // Início: 1 2 3 4 ... última
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Fim: 1 ... antepenúltima penúltima última
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: 1 ... anterior atual próxima ... última
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-100">
      {/* Informações e seletor de itens por página */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>
          Mostrando <span className="font-medium text-gray-900">{startIndex}</span> a{' '}
          <span className="font-medium text-gray-900">{endIndex}</span> de{' '}
          <span className="font-medium text-gray-900">{totalItems}</span> itens
        </span>

        {showItemsPerPage && onItemsPerPageChange && itemsPerPage && (
          <div className="flex items-center gap-2">
            <label htmlFor="items-per-page" className="text-gray-500">
              Itens por página:
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Controles de navegação */}
      <nav className="flex items-center gap-1" aria-label="Paginação">
        {/* Primeira página */}
        <button
          onClick={onFirstPage}
          disabled={!canGoPrevious}
          className="pagination-btn"
          aria-label="Ir para primeira página"
          title="Primeira página"
        >
          <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Página anterior */}
        <button
          onClick={onPreviousPage}
          disabled={!canGoPrevious}
          className="pagination-btn"
          aria-label="Ir para página anterior"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Números de página */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-gray-400"
                aria-hidden="true"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`pagination-btn ${
                  page === currentPage
                    ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-sm'
                    : ''
                }`}
                aria-label={`Ir para página ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Indicador mobile */}
        <span className="sm:hidden px-3 py-1 text-sm text-gray-600">
          {currentPage} / {totalPages}
        </span>

        {/* Próxima página */}
        <button
          onClick={onNextPage}
          disabled={!canGoNext}
          className="pagination-btn"
          aria-label="Ir para próxima página"
          title="Próxima página"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Última página */}
        <button
          onClick={onLastPage}
          disabled={!canGoNext}
          className="pagination-btn"
          aria-label="Ir para última página"
          title="Última página"
        >
          <ChevronsRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
