import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraph } from '../hooks/useGraph';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import '../graph.css';

/* ════════════════════════════════════════════════
   Custom Node — NoteNode
   ════════════════════════════════════════════════ */
function NoteNode({ data, selected }) {
  const isHub = data.linkCount >= 3;

  let className = 'note-node';
  if (selected)         className += ' note-node--highlighted';
  if (data.dimmed)      className += ' note-node--dimmed';
  if (isHub && !selected && !data.dimmed) className += ' note-node--hub';

  return (
    <div className={className} title={data.label}>
      {/* Handles on all 4 sides so edges can connect from any direction */}
      <Handle type="target" position={Position.Top}    className="note-node__handle" />
      <Handle type="target" position={Position.Left}   className="note-node__handle" />
      <Handle type="source" position={Position.Bottom} className="note-node__handle" />
      <Handle type="source" position={Position.Right}  className="note-node__handle" />

      <span className="note-node__icon">📝</span>
      <span className="note-node__title">{data.label}</span>
      {data.collection && (
        <span
          className="note-node__collection"
          style={{ background: data.collection.color ?? '#6366f1' }}
        >
          {data.collection.name}
        </span>
      )}
      {data.linkCount > 0 && (
        <span className="note-node__links">
          {data.linkCount} link{data.linkCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

const nodeTypes = { noteNode: NoteNode };

/* ════════════════════════════════════════════════
   Auto-layout with Dagre
   Places nodes in a left-to-right hierarchy.
   Falls back to a circle layout if dagre is not available.
   ════════════════════════════════════════════════ */
function circleLayout(nodes) {
  const n = nodes.length;
  if (n === 0) return nodes;

  const RADIUS = Math.max(180, n * 40);
  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      ...node,
      position: {
        x: RADIUS * Math.cos(angle),
        y: RADIUS * Math.sin(angle),
      },
    };
  });
}

/**
 * Stacks nodes with connections near their connected peers using
 * a simple force-inspired radial layout grouped by link count.
 */
function computeLayout(rawNodes, rawEdges) {
  if (rawNodes.length === 0) return rawNodes;

  // Build adjacency: nodeId → set of connected nodeIds
  const adj = new Map(rawNodes.map((n) => [n.id, new Set()]));
  rawEdges.forEach((e) => {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  });

  // Sort by degree desc so hubs get placed first (center-ish)
  const sorted = [...rawNodes].sort((a, b) => {
    return (adj.get(b.id)?.size ?? 0) - (adj.get(a.id)?.size ?? 0);
  });

  const placed = new Map();
  const SPACING_X = 220;
  const SPACING_Y = 130;

  // Place first node at origin
  placed.set(sorted[0].id, { x: 0, y: 0 });

  // Place remaining nodes in a spiral around connected placed nodes
  let col = 0;
  let row = 0;
  let step = 0;
  const direction = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  let dirIdx = 0;
  let stepsInDir = 1;
  let stepsTaken = 0;
  let turnsThisStep = 0;

  for (let i = 1; i < sorted.length; i++) {
    const node = sorted[i];
    const neighbors = adj.get(node.id) ?? new Set();

    // Try to find a placed neighbour to position near
    let bestX = null;
    let bestY = null;
    for (const nid of neighbors) {
      if (placed.has(nid)) {
        const p = placed.get(nid);
        // Offset slightly from the neighbour
        const offsetAngle = (placed.size * 137.5 * Math.PI) / 180;
        bestX = p.x + Math.cos(offsetAngle) * SPACING_X;
        bestY = p.y + Math.sin(offsetAngle) * SPACING_Y;
        break;
      }
    }

    if (bestX !== null) {
      // Nudge to avoid exact overlaps
      while ([...placed.values()].some((p) => Math.abs(p.x - bestX) < 80 && Math.abs(p.y - bestY) < 60)) {
        bestX += SPACING_X * 0.4;
        bestY += SPACING_Y * 0.3;
      }
      placed.set(node.id, { x: bestX, y: bestY });
    } else {
      // No placed neighbour yet — use spiral grid
      col += direction[dirIdx][0];
      row += direction[dirIdx][1];
      stepsTaken++;
      if (stepsTaken === stepsInDir) {
        stepsTaken = 0;
        dirIdx = (dirIdx + 1) % 4;
        turnsThisStep++;
        if (turnsThisStep === 2) {
          turnsThisStep = 0;
          stepsInDir++;
        }
      }
      placed.set(node.id, { x: col * SPACING_X, y: row * SPACING_Y });
    }
    step++;
  }

  return rawNodes.map((n) => ({
    ...n,
    position: placed.get(n.id) ?? { x: 0, y: 0 },
  }));
}

/* ════════════════════════════════════════════════
   Inner component (must be inside ReactFlowProvider)
   ════════════════════════════════════════════════ */
function GraphInner({ rawNodes, rawEdges, meta }) {
  const navigate = useNavigate();
  const { fitView } = useReactFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showMinimap, setShowMinimap] = useState(true);

  // Compute layout once from raw data
  const layoutNodes = useMemo(() => computeLayout(rawNodes, rawEdges), [rawNodes, rawEdges]);

  const styledEdges = useMemo(() => rawEdges.map((e) => ({
    ...e,
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: '#6366f1' },
    style: { stroke: '#6366f1', strokeWidth: 2, opacity: 0.55 },
    animated: false,
  })), [rawEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(styledEdges);

  // Sync nodes & edges when data loads (useNodesState only seeds on first render)
  useEffect(() => {
    setNodes(layoutNodes);
  }, [layoutNodes, setNodes]);

  useEffect(() => {
    setEdges(styledEdges);
  }, [styledEdges, setEdges]);

  // Apply search highlight/dim
  const displayNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return nodes.map((n) => ({ ...n, data: { ...n.data, dimmed: false } }));

    return nodes.map((n) => ({
      ...n,
      selected: n.data.label.toLowerCase().includes(q),
      data: {
        ...n.data,
        dimmed: !n.data.label.toLowerCase().includes(q),
      },
    }));
  }, [nodes, searchQuery]);

  // When search matches exactly one, focus it
  const handleSearch = useCallback((e) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (q.trim()) {
      const matches = nodes.filter((n) =>
        n.data.label.toLowerCase().includes(q.trim().toLowerCase()),
      );
      if (matches.length === 1) {
        setTimeout(() => fitView({ nodes: matches, duration: 400, padding: 1.5 }), 50);
      }
    }
  }, [nodes, fitView]);

  // Node click → show detail panel
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setSearchQuery('');
  }, []);

  // Double-click → navigate to note
  const onNodeDoubleClick = useCallback((_, node) => {
    navigate(`/app/notes/${node.id}`);
  }, [navigate]);

  // Click on background → deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Fit view on first render
  const fitDone = useRef(false);
  const onInit = useCallback(() => {
    if (!fitDone.current) {
      fitDone.current = true;
      setTimeout(() => fitView({ duration: 600, padding: 0.15 }), 100);
    }
  }, [fitView]);

  const isEmpty = rawNodes.length === 0;

  return (
    <>
      {/* ── Header ── */}
      <div className="graph-page__header">
        <div className="graph-page__title-group">
          <p className="graph-page__eyebrow">MindVault</p>
          <h1 className="graph-page__title">Knowledge Graph</h1>
          <div className="graph-page__meta">
            <span className="graph-page__badge graph-page__badge--blue">
              {meta.noteCount} note{meta.noteCount !== 1 ? 's' : ''}
            </span>
            <span className="graph-page__badge graph-page__badge--indigo">
              {meta.linkCount} link{meta.linkCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="graph-toolbar">
        <div className="graph-toolbar__search-wrap">
          <svg className="graph-toolbar__search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="9" r="6" /><path d="m15 15 3 3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            className="graph-toolbar__search"
            placeholder="Search notes in graph…"
            value={searchQuery}
            onChange={handleSearch}
            autoComplete="off"
          />
        </div>

        <button
          type="button"
          className={`graph-toolbar__btn ${showMinimap ? 'graph-toolbar__btn--active' : ''}`}
          onClick={() => setShowMinimap((v) => !v)}
        >
          🗺️ Minimap
        </button>

        <button
          type="button"
          className="graph-toolbar__btn"
          onClick={() => fitView({ duration: 500, padding: 0.15 })}
        >
          ⊡ Fit All
        </button>
      </div>

      {/* ── Graph Canvas ── */}
      <div className="graph-canvas">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          onInit={onInit}
          fitView
          minZoom={0.1}
          maxZoom={3}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(15,23,42,0.04)" gap={24} size={1} />
          <Controls showInteractive={false} />
          {showMinimap && (
            <MiniMap
              nodeColor={(n) => n.data?.collection?.color ?? '#6366f1'}
              maskColor="rgba(255,255,255,0.7)"
              nodeStrokeWidth={0}
            />
          )}
        </ReactFlow>

        {isEmpty && (
          <div className="graph-canvas__overlay">
            <span className="graph-canvas__empty-icon">🕸️</span>
            <h2 className="graph-canvas__empty-title">No connections yet</h2>
            <p className="graph-canvas__empty-text">
              Open a note and use <strong>[[Note Title]]</strong> to link it to another note.
              Your knowledge graph will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* ── Selected Node Detail Panel ── */}
      {selectedNode && (
        <div className="graph-detail">
          <div className="graph-detail__left">
            <div className="graph-detail__icon">📝</div>
            <div className="graph-detail__body">
              <h2 className="graph-detail__title">{selectedNode.data.label}</h2>
              <div className="graph-detail__meta">
                {selectedNode.data.collection && (
                  <span className="graph-detail__chip">
                    📁 {selectedNode.data.collection.name}
                  </span>
                )}
                <span className="graph-detail__chip">
                  🔗 {selectedNode.data.linkCount} connection{selectedNode.data.linkCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="graph-detail__actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedNode(null)}
            >
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/app/notes/${selectedNode.id}`)}
            >
              Open Note →
            </Button>
          </div>
        </div>
      )}

      {/* ── Legend ── */}
      <div className="graph-legend">
        <span className="graph-legend__item">
          <span className="graph-legend__dot" style={{ background: '#6366f1', border: '2px solid rgba(99,102,241,0.4)' }} />
          Note
        </span>
        <span className="graph-legend__item">
          <span className="graph-legend__dot" style={{ background: 'rgba(255,251,235,0.98)', border: '2px solid rgba(245,158,11,0.4)' }} />
          Hub note (3+ links)
        </span>
        <span className="graph-legend__item">
          <span className="graph-legend__line" />
          Wiki-link connection
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          Click to inspect · Double-click to open
        </span>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════
   Loading / error shell
   ════════════════════════════════════════════════ */
function GraphLoadingState() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, gap: 12, color: 'var(--color-text-muted)' }}>
      <Spinner size="lg" />
      Building your knowledge graph…
    </div>
  );
}

function GraphErrorState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 32px', color: 'var(--color-text-secondary)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.4 }}>⚠️</div>
      <p>{message ?? 'Failed to load the knowledge graph.'}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════
   Public page export
   ════════════════════════════════════════════════ */
export function KnowledgeGraphPage() {
  const { data, isLoading, isError, error } = useGraph();

  if (isLoading) return <div className="graph-page"><GraphLoadingState /></div>;
  if (isError)   return <div className="graph-page"><GraphErrorState message={error?.message} /></div>;

  const { nodes: rawNodes, edges: rawEdges, meta } = data;

  return (
    <div className="graph-page">
      <ReactFlowProvider>
        <GraphInner rawNodes={rawNodes} rawEdges={rawEdges} meta={meta} />
      </ReactFlowProvider>
    </div>
  );
}
