import React from 'react';
import { cn } from '../lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, data, isLoading, emptyMessage = 'Aucune donnée trouvée.' }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-dark-card rounded-2xl border border-white/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-dark-card rounded-2xl border border-white/5 text-gray-500">
        <p className="font-bold uppercase tracking-widest text-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-dark-card rounded-2xl border border-white/5 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/5">
            {columns.map((col, i) => (
              <th key={i} className={cn("px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-white/5 transition-colors group">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={cn("px-6 py-4 text-sm text-gray-300 font-medium", col.className)}>
                  {/* @ts-ignore */}
                  {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
