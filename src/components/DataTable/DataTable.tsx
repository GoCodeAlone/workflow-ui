import { useState, useCallback, useMemo, type CSSProperties, type ReactNode } from 'react';
import { colors, baseStyles } from '../../theme';

export interface DataTableColumn<T> {
  /** Unique key matching a property in the row data. */
  key: keyof T & string;
  /** Display header text. */
  header: string;
  /** Whether this column is sortable. Default: false */
  sortable?: boolean;
  /** Custom cell renderer. */
  render?: (value: T[keyof T & string], row: T) => ReactNode;
}

export interface DataTableProps<T> {
  /** Column definitions. */
  columns: DataTableColumn<T>[];
  /** Row data. */
  data: T[];
  /** Unique key extractor for each row. */
  rowKey: (row: T) => string;
  /** Rows per page. 0 = no pagination. Default: 10 */
  pageSize?: number;
  /** Caption for accessibility. */
  caption?: string;
  /** Override container style. */
  style?: CSSProperties;
}

type SortDirection = 'asc' | 'desc';

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  pageSize = 10,
  caption,
  style,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<(keyof T & string) | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [page, setPage] = useState(0);

  const handleSort = useCallback(
    (key: keyof T & string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
      setPage(0);
    },
    [sortKey],
  );

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const safePage = Math.min(page, totalPages - 1);

  const paginated = useMemo(
    () => (pageSize > 0 ? sorted.slice(safePage * pageSize, (safePage + 1) * pageSize) : sorted),
    [sorted, safePage, pageSize],
  );

  return (
    <div style={style}>
      <table style={baseStyles.table} aria-label={caption}>
        {caption && <caption style={{ ...visuallyHidden }}>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={baseStyles.th}
                aria-sort={
                  sortKey === col.key
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
              >
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    aria-label={`Sort by ${col.header}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      font: 'inherit',
                      cursor: 'pointer',
                      padding: 0,
                      textTransform: 'inherit',
                      letterSpacing: 'inherit',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {col.header}
                    <span aria-hidden="true">
                      {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ ...baseStyles.td, textAlign: 'center', color: colors.subtext0 }}
              >
                No data available
              </td>
            </tr>
          ) : (
            paginated.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td key={col.key} style={baseStyles.td}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pageSize > 0 && totalPages > 1 && (
        <nav
          aria-label="Table pagination"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            aria-label="Previous page"
            style={{
              ...baseStyles.button.secondary,
              opacity: safePage === 0 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <span
            aria-live="polite"
            aria-atomic="true"
            style={{ color: colors.subtext0, fontSize: '13px' }}
          >
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            aria-label="Next page"
            style={{
              ...baseStyles.button.secondary,
              opacity: safePage >= totalPages - 1 ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};
