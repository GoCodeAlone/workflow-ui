import { useState, useEffect, useRef, useMemo } from 'react';

export interface LogEntry {
  id: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  moduleName?: string;
  fields?: Record<string, unknown>;
  createdAt: string;
}

const LEVEL_COLORS: Record<LogEntry['level'], string> = {
  debug: '#6c7086',
  info: '#89b4fa',
  warn: '#f9e2af',
  error: '#f38ba8',
};

const LEVELS: LogEntry['level'][] = ['debug', 'info', 'warn', 'error'];

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z');
  } catch {
    return iso;
  }
}

interface LogRowProps {
  entry: LogEntry;
  onStepClick?: (stepName: string) => void;
}

function LogRow({ entry, onStepClick }: LogRowProps) {
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const color = LEVEL_COLORS[entry.level];
  const hasFields = entry.fields && Object.keys(entry.fields).length > 0;

  return (
    <div
      style={{
        borderLeft: `3px solid ${color}`,
        paddingLeft: 10,
        paddingTop: 4,
        paddingBottom: 4,
        marginBottom: 2,
        background: entry.level === 'error' ? `${color}0a` : 'transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 10,
            fontFamily: 'monospace',
            color: '#6c7086',
            flexShrink: 0,
          }}
        >
          {formatTime(entry.createdAt)}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color,
            minWidth: 36,
            flexShrink: 0,
            textTransform: 'uppercase',
          }}
        >
          {entry.level}
        </span>
        {entry.moduleName && (
          <button
            onClick={() => onStepClick?.(entry.moduleName!)}
            style={{
              background: '#313244',
              border: 'none',
              borderRadius: 3,
              color: onStepClick ? '#89b4fa' : '#6c7086',
              fontSize: 10,
              cursor: onStepClick ? 'pointer' : 'default',
              padding: '1px 5px',
              flexShrink: 0,
            }}
            title={onStepClick ? 'Click to highlight step' : undefined}
          >
            {entry.moduleName}
          </button>
        )}
        <span style={{ color: '#cdd6f4', fontSize: 12, flex: 1 }}>{entry.message}</span>
        {hasFields && (
          <button
            onClick={() => setFieldsOpen(!fieldsOpen)}
            style={{
              background: 'none',
              border: '1px solid #45475a',
              borderRadius: 3,
              color: '#6c7086',
              fontSize: 10,
              cursor: 'pointer',
              padding: '1px 5px',
              flexShrink: 0,
            }}
          >
            {fieldsOpen ? '▼ fields' : '▶ fields'}
          </button>
        )}
      </div>
      {fieldsOpen && hasFields && (
        <pre
          style={{
            margin: '4px 0 0',
            padding: '6px 8px',
            background: '#11111b',
            borderRadius: 4,
            fontSize: 11,
            fontFamily: 'monospace',
            color: '#a6adc8',
            overflow: 'auto',
            maxHeight: 120,
          }}
        >
          {JSON.stringify(entry.fields, null, 2)}
        </pre>
      )}
    </div>
  );
}

export interface LogFilter {
  level?: LogEntry['level'];
  search?: string;
}

export interface ExecutionLogViewerProps {
  logs: LogEntry[];
  onStepClick?: (stepName: string) => void;
  filter?: LogFilter;
}

/** Log viewer with level coloring, filtering, step linking, and auto-scroll to first error. */
export default function ExecutionLogViewer({
  logs,
  onStepClick,
  filter: externalFilter,
}: ExecutionLogViewerProps) {
  const [levelFilter, setLevelFilter] = useState<LogEntry['level'] | ''>('');
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const firstErrorRef = useRef<HTMLDivElement>(null);

  // Merge external filter with internal filter state
  const activeLevel = externalFilter?.level ?? (levelFilter || undefined);
  const activeSearch = externalFilter?.search ?? searchText;

  const filtered = useMemo(() => {
    return logs.filter((entry) => {
      if (activeLevel && entry.level !== activeLevel) return false;
      if (
        activeSearch &&
        !entry.message.toLowerCase().includes(activeSearch.toLowerCase()) &&
        !(entry.moduleName?.toLowerCase().includes(activeSearch.toLowerCase()))
      )
        return false;
      return true;
    });
  }, [logs, activeLevel, activeSearch]);

  const firstErrorIndex = useMemo(
    () => filtered.findIndex((e) => e.level === 'error'),
    [filtered],
  );

  // Auto-scroll to first error on initial load
  useEffect(() => {
    if (firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [logs]);

  const errorCount = logs.filter((e) => e.level === 'error').length;
  const warnCount = logs.filter((e) => e.level === 'warn').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #313244',
          marginBottom: 8,
          flexWrap: 'wrap',
        }}
      >
        {/* Level filter */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as LogEntry['level'] | '')}
          style={{
            background: '#313244',
            border: '1px solid #45475a',
            borderRadius: 6,
            color: '#cdd6f4',
            fontSize: 12,
            padding: '4px 8px',
            cursor: 'pointer',
          }}
          aria-label="Filter by log level"
        >
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search messages..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            background: '#313244',
            border: '1px solid #45475a',
            borderRadius: 6,
            color: '#cdd6f4',
            fontSize: 12,
            padding: '4px 10px',
            outline: 'none',
            width: 200,
          }}
          aria-label="Search log messages"
        />

        {/* Stats */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, fontSize: 11 }}>
          {errorCount > 0 && (
            <span style={{ color: '#f38ba8' }}>{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
          )}
          {warnCount > 0 && (
            <span style={{ color: '#f9e2af' }}>{warnCount} warn{warnCount !== 1 ? 's' : ''}</span>
          )}
          <span style={{ color: '#6c7086' }}>{filtered.length} entries</span>
        </div>
      </div>

      {/* Log list */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          fontFamily: 'monospace',
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ color: '#6c7086', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            No log entries match the current filter.
          </div>
        ) : (
          filtered.map((entry, idx) => (
            <div
              key={entry.id}
              ref={idx === firstErrorIndex ? firstErrorRef : undefined}
            >
              <LogRow entry={entry} onStepClick={onStepClick} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
