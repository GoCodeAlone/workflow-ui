import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { applyTraceOverlay, applyEdgeHighlighting } from './TraceCanvas';
import type { TraceData, TraceStep } from '../trace/types';
import type { Node as RFNode, Edge } from '@xyflow/react';

vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children, nodes, onNodeClick }: {
    children?: React.ReactNode;
    nodes?: RFNode[];
    onNodeClick?: (e: React.MouseEvent, n: RFNode) => void;
  }) => (
    <div data-testid="reactflow">
      {nodes?.map((n) => (
        <div
          key={n.id}
          data-testid={`node-${n.id}`}
          onClick={(e) => onNodeClick?.(e as React.MouseEvent, n)}
        />
      ))}
      {children}
    </div>
  ),
  Background: () => null,
  Controls: () => null,
  MiniMap: () => null,
  BackgroundVariant: { Dots: 'dots' },
}));

// Re-import after mock
import TraceCanvas from './TraceCanvas';

const makeStep = (overrides: Partial<TraceStep> = {}): TraceStep => ({
  stepName: 'step-a',
  stepType: 'step.set',
  status: 'completed',
  sequenceNum: 1,
  durationMs: 100,
  ...overrides,
});

const makeTraceData = (steps: TraceStep[] = []): TraceData => ({
  executionId: 'exec-1',
  pipeline: 'pipe-1',
  status: 'completed',
  steps,
  configHash: 'abc123',
  startedAt: '2026-01-01T00:00:00Z',
});

const makeNode = (id: string): RFNode => ({
  id,
  position: { x: 0, y: 0 },
  data: {},
});

const makeEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
});

// --- applyTraceOverlay ---

describe('applyTraceOverlay', () => {
  it('adds status outline and traceStep data to matching node', () => {
    const step = makeStep({ stepName: 'node-1', status: 'completed' });
    const nodes = [makeNode('node-1'), makeNode('node-2')];
    const result = applyTraceOverlay(nodes, makeTraceData([step]));

    expect(result[0].style?.outline).toContain('#a6e3a1');
    expect(result[0].data.traceStep).toEqual(step);
  });

  it('leaves unmatched nodes unchanged', () => {
    const step = makeStep({ stepName: 'node-1' });
    const nodes = [makeNode('node-2')];
    const result = applyTraceOverlay(nodes, makeTraceData([step]));

    expect(result[0].style?.outline).toBeUndefined();
    expect(result[0].data.traceStep).toBeUndefined();
  });

  it('uses failed color #f38ba8 for failed steps', () => {
    const step = makeStep({ stepName: 'node-1', status: 'failed' });
    const nodes = [makeNode('node-1')];
    const result = applyTraceOverlay(nodes, makeTraceData([step]));

    expect(result[0].style?.outline).toContain('#f38ba8');
  });

  it('uses running color #89b4fa for running steps', () => {
    const step = makeStep({ stepName: 'node-1', status: 'running' });
    const nodes = [makeNode('node-1')];
    const result = applyTraceOverlay(nodes, makeTraceData([step]));

    expect(result[0].style?.outline).toContain('#89b4fa');
  });

  it('handles empty steps gracefully', () => {
    const nodes = [makeNode('node-1')];
    const result = applyTraceOverlay(nodes, makeTraceData([]));
    expect(result[0]).toEqual(makeNode('node-1'));
  });
});

// --- applyEdgeHighlighting ---

describe('applyEdgeHighlighting', () => {
  it('sets strokeWidth 3 on edges where both ends are executed', () => {
    const steps = [
      makeStep({ stepName: 'a', status: 'completed' }),
      makeStep({ stepName: 'b', status: 'completed', sequenceNum: 2 }),
    ];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = applyEdgeHighlighting(edges, makeTraceData(steps));

    expect(result[0].style?.strokeWidth).toBe(3);
    expect(result[0].style?.opacity).toBe(1);
  });

  it('dims edges where target was not executed', () => {
    const steps = [makeStep({ stepName: 'a', status: 'completed' })];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = applyEdgeHighlighting(edges, makeTraceData(steps));

    expect(result[0].style?.strokeWidth).toBe(1);
    expect(result[0].style?.opacity).toBe(0.2);
    expect(result[0].style?.stroke).toBe('#6c7086');
  });

  it('adds conditional label when source step has routeTaken', () => {
    const steps = [
      makeStep({ stepName: 'a', status: 'completed', routeTaken: 'yes' }),
      makeStep({ stepName: 'b', status: 'completed', sequenceNum: 2 }),
    ];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = applyEdgeHighlighting(edges, makeTraceData(steps));

    expect(result[0].label).toBe('yes');
  });

  it('handles edges with both ends un-executed', () => {
    const edges = [makeEdge('e1', 'x', 'y')];
    const result = applyEdgeHighlighting(edges, makeTraceData([]));

    expect(result[0].style?.opacity).toBe(0.2);
  });
});

// --- TraceCanvas component ---

describe('TraceCanvas', () => {
  it('renders the ReactFlow wrapper', () => {
    render(
      <TraceCanvas
        nodes={[makeNode('n1')]}
        edges={[]}
        traceData={makeTraceData([])}
      />,
    );
    expect(screen.getByTestId('reactflow')).toBeInTheDocument();
  });

  it('calls onStepClick when a node matching a step is clicked', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    const step = makeStep({ stepName: 'n1' });

    render(
      <TraceCanvas
        nodes={[makeNode('n1')]}
        edges={[]}
        traceData={makeTraceData([step])}
        onStepClick={onStepClick}
      />,
    );

    await user.click(screen.getByTestId('node-n1'));
    expect(onStepClick).toHaveBeenCalledWith(step);
  });

  it('does not throw when onStepClick is omitted', async () => {
    const user = userEvent.setup();
    const step = makeStep({ stepName: 'n1' });

    render(
      <TraceCanvas
        nodes={[makeNode('n1')]}
        edges={[]}
        traceData={makeTraceData([step])}
      />,
    );

    await expect(user.click(screen.getByTestId('node-n1'))).resolves.not.toThrow();
  });
});
