import { useState, useCallback } from 'react';

/** Returns true if any value in the data tree contains '[REDACTED]'. */
function hasRedactedValues(data: unknown): boolean {
  if (typeof data === 'string') return data.includes('[REDACTED]');
  if (Array.isArray(data)) return data.some(hasRedactedValues);
  if (typeof data === 'object' && data !== null) {
    return Object.values(data).some(hasRedactedValues);
  }
  return false;
}

/** Returns true if this specific value is or contains a redacted placeholder. */
function isRedacted(value: unknown): boolean {
  if (typeof value === 'string') return value.includes('[REDACTED]');
  return false;
}

interface JsonValueProps {
  value: unknown;
  depth: number;
}

function JsonValue({ value, depth }: JsonValueProps) {
  const [collapsed, setCollapsed] = useState(depth > 1);

  if (value === null) {
    return <span style={{ color: '#6c7086' }}>null</span>;
  }
  if (typeof value === 'boolean') {
    return <span style={{ color: '#f9e2af' }}>{String(value)}</span>;
  }
  if (typeof value === 'number') {
    return <span style={{ color: '#fab387' }}>{value}</span>;
  }
  if (typeof value === 'string') {
    const redacted = isRedacted(value);
    return (
      <span style={{ color: '#a6e3a1' }}>
        {redacted && (
          <span
            title="Value was redacted (PII)"
            aria-label="Redacted PII field"
            style={{ marginRight: 4, fontSize: 12 }}
          >
            🔒
          </span>
        )}
        &quot;{value}&quot;
      </span>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: '#a6adc8' }}>[]</span>;
    return (
      <span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={toggleBtnStyle}
          aria-label={collapsed ? 'Expand array' : 'Collapse array'}
        >
          {collapsed ? '▶' : '▼'}
        </button>
        {collapsed ? (
          <span style={{ color: '#6c7086' }}> [{value.length} items]</span>
        ) : (
          <span>
            {' ['}
            <div style={{ paddingLeft: 16 }}>
              {value.map((item, i) => (
                <div key={i}>
                  <span style={{ color: '#6c7086' }}>{i}: </span>
                  <JsonValue value={item} depth={depth + 1} />
                  {i < value.length - 1 && ','}
                </div>
              ))}
            </div>
            {']'}
          </span>
        )}
      </span>
    );
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span style={{ color: '#a6adc8' }}>{'{}'}</span>;
    return (
      <span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={toggleBtnStyle}
          aria-label={collapsed ? 'Expand object' : 'Collapse object'}
        >
          {collapsed ? '▶' : '▼'}
        </button>
        {collapsed ? (
          <span style={{ color: '#6c7086' }}> {'{'}…{'}'}</span>
        ) : (
          <span>
            {' {'}
            <div style={{ paddingLeft: 16 }}>
              {entries.map(([k, v], i) => {
                const redactedVal = isRedacted(v);
                return (
                  <div key={k}>
                    <span style={{ color: '#89b4fa' }}>
                      &quot;{k}&quot;
                    </span>
                    <span style={{ color: '#a6adc8' }}>: </span>
                    {redactedVal && (
                      <span
                        title="Value was redacted (PII)"
                        aria-label="Redacted PII field"
                        style={{ marginRight: 4, fontSize: 12 }}
                      >
                        🔒
                      </span>
                    )}
                    <JsonValue value={v} depth={depth + 1} />
                    {i < entries.length - 1 && ','}
                  </div>
                );
              })}
            </div>
            {'}'}
          </span>
        )}
      </span>
    );
  }
  return <span style={{ color: '#a6adc8' }}>{String(value)}</span>;
}

const toggleBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#a6adc8',
  fontSize: 10,
  cursor: 'pointer',
  padding: '0 2px',
  lineHeight: 1,
};

export interface JsonTreeViewerProps {
  data: Record<string, unknown>;
  label: string;
}

/** Expandable JSON tree viewer with syntax highlighting, copy button, and PII lock indicators. */
export default function JsonTreeViewer({ data, label }: JsonTreeViewerProps) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const hasPii = hasRedactedValues(data);

  const handleCopy = useCallback(() => {
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {
      // Clipboard access denied (permissions, non-HTTPS, no focus) — silent no-op
    });
  }, [data]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#a6adc8',
            fontSize: 11,
            cursor: 'pointer',
            padding: 0,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          aria-expanded={expanded}
        >
          <span>{expanded ? '▼' : '▶'}</span>
          <span>{label}</span>
        </button>
        {hasPii && (
          <span
            title="Contains redacted PII fields"
            style={{ fontSize: 12, color: '#f9e2af' }}
            aria-label="Contains redacted PII"
          >
            🔒
          </span>
        )}
        <button
          onClick={handleCopy}
          title="Copy JSON"
          style={{
            background: 'none',
            border: '1px solid #45475a',
            borderRadius: 4,
            color: copied ? '#a6e3a1' : '#a6adc8',
            fontSize: 10,
            cursor: 'pointer',
            padding: '1px 6px',
            marginLeft: 'auto',
          }}
        >
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      {expanded && (
        <div
          style={{
            background: '#11111b',
            border: '1px solid #313244',
            borderRadius: 6,
            padding: '8px 12px',
            overflow: 'auto',
            maxHeight: 240,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 12,
            lineHeight: '18px',
            color: '#cdd6f4',
          }}
        >
          <JsonValue value={data} depth={0} />
        </div>
      )}
    </div>
  );
}
