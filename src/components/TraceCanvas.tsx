import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Edge,
  type Node as RFNode,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { TraceData, TraceStep } from '../trace/types';
import { TRACE_STATUS_COLORS } from '../trace/types';

/** Apply status colors and badge data to nodes based on trace execution. */
export function applyTraceOverlay(nodes: RFNode[], traceData: TraceData): RFNode[] {
  const stepMap = new Map<string, TraceStep>();
  for (const step of traceData.steps) {
    stepMap.set(step.stepName, step);
  }

  return nodes.map((node) => {
    const step = stepMap.get(node.id) ?? stepMap.get(String(node.data?.moduleId ?? ''));
    if (!step) return node;

    const color = TRACE_STATUS_COLORS[step.status];
    return {
      ...node,
      style: {
        ...node.style,
        outline: `2px solid ${color}`,
        outlineOffset: 2,
      },
      data: {
        ...node.data,
        traceStep: step,
      },
    };
  });
}

/**
 * Apply edge highlighting:
 * - Taken paths (both ends executed): strokeWidth 3px, full opacity
 * - Untaken paths: strokeWidth 1px, gray, 20% opacity
 * - Conditional edges from steps with routeTaken get a branch label
 */
export function applyEdgeHighlighting(edges: Edge[], traceData: TraceData): Edge[] {
  const executedStepNames = new Set(
    traceData.steps
      .filter((s) => s.status === 'completed' || s.status === 'failed' || s.status === 'running')
      .map((s) => s.stepName),
  );

  const conditionalRoutes = new Map<string, string>();
  for (const step of traceData.steps) {
    if (step.routeTaken) {
      conditionalRoutes.set(step.stepName, step.routeTaken);
    }
  }

  return edges.map((edge) => {
    const sourceExecuted = executedStepNames.has(edge.source);
    const targetExecuted = executedStepNames.has(edge.target);
    const taken = sourceExecuted && targetExecuted;

    const routeLabel = conditionalRoutes.get(edge.source);

    if (taken) {
      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: 3,
          opacity: 1,
        },
        ...(routeLabel ? { label: routeLabel, labelStyle: { fill: '#a6e3a1', fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: '#1e1e2e', fillOpacity: 0.9 } } : {}),
      };
    }

    return {
      ...edge,
      style: {
        ...edge.style,
        strokeWidth: 1,
        stroke: '#6c7086',
        opacity: 0.2,
      },
    };
  });
}

export interface TraceCanvasProps {
  nodes: RFNode[];
  edges: Edge[];
  traceData: TraceData;
  onStepClick?: (step: TraceStep) => void;
  nodeTypes?: NodeTypes;
  edgeTypes?: EdgeTypes;
}

/**
 * Read-only ReactFlow canvas that visualizes a pipeline execution trace.
 * Overlays status colors on nodes and highlights taken/untaken edge paths.
 */
export default function TraceCanvas({
  nodes,
  edges,
  traceData,
  onStepClick,
  nodeTypes,
  edgeTypes,
}: TraceCanvasProps) {
  const overlaidNodes = useMemo(() => applyTraceOverlay(nodes, traceData), [nodes, traceData]);
  const highlightedEdges = useMemo(
    () => applyEdgeHighlighting(edges, traceData),
    [edges, traceData],
  );

  const stepMap = useMemo(() => {
    const m = new Map<string, TraceStep>();
    for (const step of traceData.steps) {
      m.set(step.stepName, step);
    }
    return m;
  }, [traceData]);

  const handleNodeClick = (_event: React.MouseEvent, node: RFNode) => {
    if (!onStepClick) return;
    const step = stepMap.get(node.id);
    if (step) onStepClick(step);
  };

  return (
    <ReactFlow
      nodes={overlaidNodes}
      edges={highlightedEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={true}
      onNodeClick={handleNodeClick}
      fitView
      proOptions={{ hideAttribution: true }}
      style={{ background: '#1e1e2e' }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#313244" />
      <Controls
        showInteractive={false}
        style={{ background: '#181825', border: '1px solid #313244', borderRadius: 6 }}
      />
      <MiniMap
        nodeColor={() => '#45475a'}
        maskColor="rgba(0,0,0,0.5)"
        style={{
          background: '#181825',
          border: '1px solid #313244',
          borderRadius: 6,
          zIndex: 4,
        }}
        pannable
        zoomable
      />
    </ReactFlow>
  );
}
