import { useState, type CSSProperties, type ReactNode } from 'react';
import { colors, baseStyles } from '../theme';

export interface DataTableColumn<T> {
  /** Column header label. */
  label: string;
  /** Key of the row object to render (also used as React key). */
  key: keyof T & string;
  /** Whether this column is sortable. Default: false */
  sortable?: boolean;
  /** Optional custom cell renderer. */
  render?: (value: T[keyof T], row: T) => ReactNode;
  /** Optional column header style override. */
  headerStyle?: CSSProperties;
  /** Optional cell style override. */
  cellStyle?: CSSProperties;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState<T> {
  key: keyof T & string;
  direction: SortDirection;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  /** Column definitions. */
  columns: DataTableColumn<T>[];
  /** Row data. */
  data: T[];
  /** Number of rows per page. Default: 10 */
  pageSize?: number;
  /** Called when user clicks a sortable column header. */
  onSort?: (sort: SortState<T>) => void;
  /** Called when page changes. */
  onPageChange?: (page: number) => void;
  /** Row key extractor. Defaults to row index. */
  rowKey?: (row: T, index: number) => string | number;
  /** Empty state message. Default: 'No data' */
  emptyMessage?: string;
  /** Override table container style. */
  style?: CSSProperties;
}

function SortIcon({ direction, active }: { direction?: SortDirection; active: boolean }) {
  const color = active ? colors.blue : colors.overlay0;
  return (
    <span
      style={{
        marginLeft: '4px',
        display: 'inline-block',
        fontSize: '10px',
        color,
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      {direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : '⇅'}
    </span>
  );
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
  onSort,
  onPageChange,
  rowKey,
  emptyMessage = 'No data',
  style,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<T> | null>(null);

  function getRowKey(row: T, absoluteIdx: number): string | number {
    if (rowKey) return rowKey(row, absoluteIdx);
    const id = (row as Record<string, unknown>).id;
    return (typeof id === 'string' || typeof id === 'number') ? id : absoluteIdx;
  }

  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(data.length / safePageSize));
  const safePage = Math.min(currentPage, totalPages);

  // Client-side sort when no external onSort handler
  const sortedData = onSort
    ? data
    : sortState
      ? [...data].sort((a, b) => {
          const av = a[sortState.key];
          const bv = b[sortState.key];
          const cmp =
            av == null ? -1
            : bv == null ? 1
            : typeof av === 'number' && typeof bv === 'number'
              ? av - bv
              : String(av).localeCompare(String(bv));
          return sortState.direction === 'asc' ? cmp : -cmp;
        })
      : data;

  const pageData = sortedData.slice((safePage - 1) * safePageSize, safePage * safePageSize);

  function handleSort(col: DataTableColumn<T>) {
    if (!col.sortable) return;
    const newDirection: SortDirection =
      sortState?.key === col.key && sortState.direction === 'asc' ? 'desc' : 'asc';
    const newSort: SortState<T> = { key: col.key, direction: newDirection };
    setSortState(newSort);
    onSort?.(newSort);
  }

  function handlePage(page: number) {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
    onPageChange?.(p);
  }

  const containerStyle: CSSProperties = {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    ...style,
  };
  const thPadding = baseStyles.th.padding;

  return (
    <div style={containerStyle}>
      <div style={{ overflowX: 'auto' }}>
        <table style={baseStyles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...baseStyles.th,
                    padding: 0,
                    ...col.headerStyle,
                  }}
                  aria-sort={
                    sortState?.key === col.key
                      ? sortState.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: thPadding,
                        width: '100%',
                        textAlign: 'left',
                        font: 'inherit',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {col.label}
                      <SortIcon
                        direction={sortState?.key === col.key ? sortState.direction : undefined}
                        active={sortState?.key === col.key}
                      />
                    </button>
                  ) : (
                    <span style={{ display: 'block', padding: thPadding }}>
                      {col.label}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    ...baseStyles.td,
                    textAlign: 'center',
                    color: colors.overlay0,
                    padding: '32px 12px',
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr
                  key={getRowKey(row, (safePage - 1) * safePageSize + idx)}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ ...baseStyles.td, ...col.cellStyle }}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '12px 4px 4px',
            fontSize: '13px',
            color: colors.subtext0,
          }}
        >
          <span>
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() => handlePage(safePage - 1)}
            disabled={safePage <= 1}
            style={{
              ...baseStyles.button.secondary,
              padding: '4px 10px',
              fontSize: '13px',
              opacity: safePage <= 1 ? 0.4 : 1,
              cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
            }}
            aria-label="Previous page"
          >
            ‹
          </button>
          <button
            onClick={() => handlePage(safePage + 1)}
            disabled={safePage >= totalPages}
            style={{
              ...baseStyles.button.secondary,
              padding: '4px 10px',
              fontSize: '13px',
              opacity: safePage >= totalPages ? 0.4 : 1,
              cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
            }}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
