import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './Loading';
import { FileX } from 'lucide-react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function TableContainer({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto -mx-4 md:mx-0 ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 md:rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

interface TableRootProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableRootProps) {
  return (
    <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
      {children}
    </table>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '' }: TableHeaderProps) {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function TableBody({
  children,
  loading = false,
  empty = false,
  emptyMessage = 'Nenhum registro encontrado',
  className = ''
}: TableBodyProps) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={100} className="p-4">
            <TableSkeleton rows={5} />
          </td>
        </tr>
      </tbody>
    );
  }

  if (empty) {
    return (
      <tbody>
        <tr>
          <td colSpan={100} className="p-8">
            <EmptyState
              icon={FileX}
              title="Nenhum registro"
              description={emptyMessage}
            />
          </td>
        </tr>
      </tbody>
    );
  }

  return <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className = '' }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        table-row
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

interface TableHeadCellProps {
  children: ReactNode;
  className?: string;
}

export function TableHeadCell({ children, className = '' }: TableHeadCellProps) {
  return (
    <th
      scope="col"
      className={`table-header ${className}`}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`table-cell ${className}`}>
      {children}
    </td>
  );
}

// Export como object para facilitar importação
// eslint-disable-next-line react-refresh/only-export-components
export const TableComponents = {
  Container: TableContainer,
  Root: Table,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  HeadCell: TableHeadCell,
  Cell: TableCell,
};
